/**
 * MFA (Multi-Factor Authentication) Router
 * 
 * Manages two-factor authentication setup and verification
 * - Generate MFA secret and QR code
 * - Enable/disable MFA
 * - Verify TOTP codes
 * - Generate backup codes
 */

import { z } from "zod";
import { protectedProcedure, router } from "../_core/trpc";
import { getDb } from "../db";
import { users } from "../../drizzle/schema";
import { eq } from "drizzle-orm";
import { TRPCError } from "@trpc/server";
import * as speakeasy from "speakeasy";
import * as QRCode from "qrcode";
import * as crypto from "crypto";

export const mfaRouter = router({
  /**
   * Generate MFA secret and QR code for setup
   */
  generateSecret: protectedProcedure.query(async ({ ctx }) => {
    const secret = speakeasy.generateSecret({
      name: `SlideCoffee (${ctx.user.email || ctx.user.name})`,
      issuer: "SlideCoffee",
    });

    // Generate QR code as data URL
    const qrCodeUrl = await QRCode.toDataURL(secret.otpauth_url!);

    return {
      secret: secret.base32,
      qrCode: qrCodeUrl,
      otpauthUrl: secret.otpauth_url,
    };
  }),

  /**
   * Enable MFA after verifying the initial code
   */
  enable: protectedProcedure
    .input(
      z.object({
        secret: z.string(),
        token: z.string().length(6),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");

      // Verify the token
      const verified = speakeasy.totp.verify({
        secret: input.secret,
        encoding: "base32",
        token: input.token,
        window: 2, // Allow 2 time steps before/after
      });

      if (!verified) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Invalid verification code",
        });
      }

      // Generate backup codes
      const backupCodes = Array.from({ length: 10 }, () =>
        crypto.randomBytes(4).toString("hex").toUpperCase()
      );

      // Enable MFA
      await db
        .update(users)
        .set({
          mfaEnabled: 1,
          mfaSecret: input.secret,
          mfaBackupCodes: JSON.stringify(backupCodes),
        })
        .where(eq(users.id, ctx.user.id));

      return {
        success: true,
        message: "MFA enabled successfully",
        backupCodes,
      };
    }),

  /**
   * Disable MFA
   */
  disable: protectedProcedure
    .input(
      z.object({
        token: z.string().length(6),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");

      // Get current user's MFA secret
      const user = await db
        .select()
        .from(users)
        .where(eq(users.id, ctx.user.id))
        .limit(1);

      if (!user[0] || !user[0].mfaEnabled || !user[0].mfaSecret) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "MFA is not enabled",
        });
      }

      // Verify the token
      const verified = speakeasy.totp.verify({
        secret: user[0].mfaSecret,
        encoding: "base32",
        token: input.token,
        window: 2,
      });

      if (!verified) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Invalid verification code",
        });
      }

      // Disable MFA
      await db
        .update(users)
        .set({
          mfaEnabled: 0,
          mfaSecret: null,
          mfaBackupCodes: null,
        })
        .where(eq(users.id, ctx.user.id));

      return {
        success: true,
        message: "MFA disabled successfully",
      };
    }),

  /**
   * Verify MFA token (used during login)
   */
  verify: protectedProcedure
    .input(
      z.object({
        token: z.string().min(6).max(8), // 6 for TOTP, 8 for backup code
      })
    )
    .mutation(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");

      const user = await db
        .select()
        .from(users)
        .where(eq(users.id, ctx.user.id))
        .limit(1);

      if (!user[0] || !user[0].mfaEnabled || !user[0].mfaSecret) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "MFA is not enabled",
        });
      }

      // Try TOTP verification first
      if (input.token.length === 6) {
        const verified = speakeasy.totp.verify({
          secret: user[0].mfaSecret,
          encoding: "base32",
          token: input.token,
          window: 2,
        });

        if (verified) {
          return {
            success: true,
            message: "Verification successful",
          };
        }
      }

      // Try backup code
      if (input.token.length === 8 && user[0].mfaBackupCodes) {
        const backupCodes = JSON.parse(user[0].mfaBackupCodes) as string[];
        const codeIndex = backupCodes.indexOf(input.token.toUpperCase());

        if (codeIndex !== -1) {
          // Remove used backup code
          backupCodes.splice(codeIndex, 1);
          await db
            .update(users)
            .set({
              mfaBackupCodes: JSON.stringify(backupCodes),
            })
            .where(eq(users.id, ctx.user.id));

          return {
            success: true,
            message: "Backup code accepted",
            remainingBackupCodes: backupCodes.length,
          };
        }
      }

      throw new TRPCError({
        code: "BAD_REQUEST",
        message: "Invalid verification code",
      });
    }),

  /**
   * Get MFA status
   */
  getStatus: protectedProcedure.query(async ({ ctx }) => {
    const db = await getDb();
    if (!db) throw new Error("Database not available");

    const user = await db
      .select({
        mfaEnabled: users.mfaEnabled,
        mfaBackupCodes: users.mfaBackupCodes,
      })
      .from(users)
      .where(eq(users.id, ctx.user.id))
      .limit(1);

    const backupCodesCount = user[0]?.mfaBackupCodes
      ? (JSON.parse(user[0].mfaBackupCodes) as string[]).length
      : 0;

    return {
      enabled: !!user[0]?.mfaEnabled,
      backupCodesRemaining: backupCodesCount,
    };
  }),

  /**
   * Regenerate backup codes
   */
  regenerateBackupCodes: protectedProcedure
    .input(
      z.object({
        token: z.string().length(6),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");

      const user = await db
        .select()
        .from(users)
        .where(eq(users.id, ctx.user.id))
        .limit(1);

      if (!user[0] || !user[0].mfaEnabled || !user[0].mfaSecret) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "MFA is not enabled",
        });
      }

      // Verify the token
      const verified = speakeasy.totp.verify({
        secret: user[0].mfaSecret,
        encoding: "base32",
        token: input.token,
        window: 2,
      });

      if (!verified) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Invalid verification code",
        });
      }

      // Generate new backup codes
      const backupCodes = Array.from({ length: 10 }, () =>
        crypto.randomBytes(4).toString("hex").toUpperCase()
      );

      await db
        .update(users)
        .set({
          mfaBackupCodes: JSON.stringify(backupCodes),
        })
        .where(eq(users.id, ctx.user.id));

      return {
        success: true,
        message: "Backup codes regenerated",
        backupCodes,
      };
    }),
});

