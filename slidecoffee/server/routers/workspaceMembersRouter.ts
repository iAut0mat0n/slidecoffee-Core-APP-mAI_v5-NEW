/**
 * Workspace Members Router
 * 
 * Manages team collaboration within workspaces
 * - Invite team members
 * - List workspace members
 * - Update member roles
 * - Remove members
 * - Only workspace owners can manage members
 */

import { z } from "zod";
import { protectedProcedure, router } from "../_core/trpc";
import { getDb } from "../db";
import { workspaceMembers, workspaces, users } from "../../drizzle/schema";
import { eq, and } from "drizzle-orm";
import { TRPCError } from "@trpc/server";

export const workspaceMembersRouter = router({
  /**
   * List all members in a workspace
   */
  list: protectedProcedure
    .input(
      z.object({
        workspaceId: z.number(),
      })
    )
    .query(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");

      // Check if user has access to this workspace
      const workspace = await db
        .select()
        .from(workspaces)
        .where(eq(workspaces.id, input.workspaceId))
        .limit(1);

      if (!workspace[0]) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Workspace not found",
        });
      }

      // Get all members
      const members = await db
        .select({
          id: workspaceMembers.id,
          userId: workspaceMembers.userId,
          role: workspaceMembers.role,
          creditsAllocated: workspaceMembers.creditsAllocated,
          createdAt: workspaceMembers.createdAt,
          userName: users.name,
          userEmail: users.email,
          userAvatar: users.avatarUrl,
        })
        .from(workspaceMembers)
        .leftJoin(users, eq(workspaceMembers.userId, users.id))
        .where(eq(workspaceMembers.workspaceId, input.workspaceId));

      return members;
    }),

  /**
   * Invite a new member to workspace
   * Only workspace owners can invite
   */
  invite: protectedProcedure
    .input(
      z.object({
        workspaceId: z.number(),
        email: z.string().email(),
        role: z.enum(["admin", "member"]).default("member"),
        creditsAllocated: z.number().min(0).default(0),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");

      // Check if current user is workspace owner
      const workspace = await db
        .select()
        .from(workspaces)
        .where(eq(workspaces.id, input.workspaceId))
        .limit(1);

      if (!workspace[0] || workspace[0].ownerId !== ctx.user.id) {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "Only workspace owners can invite members",
        });
      }

      // Find user by email
      const invitedUser = await db
        .select()
        .from(users)
        .where(eq(users.email, input.email))
        .limit(1);

      if (!invitedUser[0]) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "User with this email not found. They need to sign up first.",
        });
      }

      // Check if already a member
      const existing = await db
        .select()
        .from(workspaceMembers)
        .where(
          and(
            eq(workspaceMembers.workspaceId, input.workspaceId),
            eq(workspaceMembers.userId, invitedUser[0].id)
          )
        )
        .limit(1);

      if (existing[0]) {
        throw new TRPCError({
          code: "CONFLICT",
          message: "User is already a member of this workspace",
        });
      }

      // Add member
      await db.insert(workspaceMembers).values({
        workspaceId: input.workspaceId,
        userId: invitedUser[0].id,
        role: input.role,
        creditsAllocated: input.creditsAllocated,
      });

      return {
        success: true,
        message: `${invitedUser[0].name || input.email} added to workspace`,
      };
    }),

  /**
   * Update member role or credits
   */
  update: protectedProcedure
    .input(
      z.object({
        memberId: z.number(),
        role: z.enum(["owner", "admin", "member"]).optional(),
        creditsAllocated: z.number().min(0).optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");

      // Get member details
      const member = await db
        .select()
        .from(workspaceMembers)
        .where(eq(workspaceMembers.id, input.memberId))
        .limit(1);

      if (!member[0]) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Member not found",
        });
      }

      // Check if current user is workspace owner
      const workspace = await db
        .select()
        .from(workspaces)
        .where(eq(workspaces.id, member[0].workspaceId))
        .limit(1);

      if (!workspace[0] || workspace[0].ownerId !== ctx.user.id) {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "Only workspace owners can update members",
        });
      }

      const updateData: any = {};
      if (input.role) updateData.role = input.role;
      if (input.creditsAllocated !== undefined)
        updateData.creditsAllocated = input.creditsAllocated;

      await db
        .update(workspaceMembers)
        .set(updateData)
        .where(eq(workspaceMembers.id, input.memberId));

      return {
        success: true,
        message: "Member updated successfully",
      };
    }),

  /**
   * Remove member from workspace
   */
  remove: protectedProcedure
    .input(
      z.object({
        memberId: z.number(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");

      // Get member details
      const member = await db
        .select()
        .from(workspaceMembers)
        .where(eq(workspaceMembers.id, input.memberId))
        .limit(1);

      if (!member[0]) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Member not found",
        });
      }

      // Check if current user is workspace owner
      const workspace = await db
        .select()
        .from(workspaces)
        .where(eq(workspaces.id, member[0].workspaceId))
        .limit(1);

      if (!workspace[0] || workspace[0].ownerId !== ctx.user.id) {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "Only workspace owners can remove members",
        });
      }

      // Cannot remove owner
      if (member[0].role === "owner") {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Cannot remove workspace owner",
        });
      }

      await db.delete(workspaceMembers).where(eq(workspaceMembers.id, input.memberId));

      return {
        success: true,
        message: "Member removed from workspace",
      };
    }),
});

