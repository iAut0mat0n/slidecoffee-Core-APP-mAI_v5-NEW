/**
 * MFA Settings Component
 * 
 * Manage two-factor authentication
 * - Enable MFA with QR code
 * - Disable MFA
 * - View backup codes
 * - Regenerate backup codes
 */

import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { Shield, ShieldCheck, ShieldOff, Copy, RefreshCw, AlertTriangle } from "lucide-react";

export function MFASettings() {
  const utils = trpc.useUtils();
  const { data: status, isLoading } = trpc.mfa.getStatus.useQuery();

  const [enableDialogOpen, setEnableDialogOpen] = useState(false);
  const [disableDialogOpen, setDisableDialogOpen] = useState(false);
  const [regenerateDialogOpen, setRegenerateDialogOpen] = useState(false);

  const [qrCode, setQrCode] = useState<string>("");
  const [secret, setSecret] = useState<string>("");
  const [verificationCode, setVerificationCode] = useState("");
  const [backupCodes, setBackupCodes] = useState<string[]>([]);

  const handleGenerateSecret = async () => {
    try {
      const data = await utils.mfa.generateSecret.fetch();
      setQrCode(data.qrCode);
      setSecret(data.secret);
      setEnableDialogOpen(true);
    } catch (error: any) {
      toast.error("Failed to generate MFA secret", {
        description: error.message,
      });
    }
  };

  const enableMutation = trpc.mfa.enable.useMutation({
    onSuccess: (data) => {
      setBackupCodes(data.backupCodes);
      setVerificationCode("");
      toast.success(data.message);
      utils.mfa.getStatus.invalidate();
    },
    onError: (error) => {
      toast.error("Failed to enable MFA", {
        description: error.message,
      });
    },
  });

  const disableMutation = trpc.mfa.disable.useMutation({
    onSuccess: (data) => {
      setDisableDialogOpen(false);
      setVerificationCode("");
      toast.success(data.message);
      utils.mfa.getStatus.invalidate();
    },
    onError: (error) => {
      toast.error("Failed to disable MFA", {
        description: error.message,
      });
    },
  });

  const regenerateMutation = trpc.mfa.regenerateBackupCodes.useMutation({
    onSuccess: (data) => {
      setBackupCodes(data.backupCodes);
      setVerificationCode("");
      toast.success(data.message);
      utils.mfa.getStatus.invalidate();
    },
    onError: (error) => {
      toast.error("Failed to regenerate backup codes", {
        description: error.message,
      });
    },
  });

  const handleEnable = () => {
    if (!verificationCode || verificationCode.length !== 6) {
      toast.error("Please enter a 6-digit code");
      return;
    }
    enableMutation.mutate({ secret, token: verificationCode });
  };

  const handleDisable = () => {
    if (!verificationCode || verificationCode.length !== 6) {
      toast.error("Please enter a 6-digit code");
      return;
    }
    disableMutation.mutate({ token: verificationCode });
  };

  const handleRegenerate = () => {
    if (!verificationCode || verificationCode.length !== 6) {
      toast.error("Please enter a 6-digit code");
      return;
    }
    regenerateMutation.mutate({ token: verificationCode });
  };

  const copyBackupCodes = () => {
    navigator.clipboard.writeText(backupCodes.join("\n"));
    toast.success("Backup codes copied to clipboard");
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            Two-Factor Authentication
          </CardTitle>
          <CardDescription>Loading...</CardDescription>
        </CardHeader>
      </Card>
    );
  }

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            {status?.enabled ? (
              <ShieldCheck className="h-5 w-5 text-green-600" />
            ) : (
              <Shield className="h-5 w-5" />
            )}
            Two-Factor Authentication
          </CardTitle>
          <CardDescription>
            Add an extra layer of security to your account
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <div className="font-medium">Status</div>
              <div className="text-sm text-muted-foreground">
                {status?.enabled ? (
                  <Badge variant="default" className="bg-green-600">
                    <ShieldCheck className="h-3 w-3 mr-1" />
                    Enabled
                  </Badge>
                ) : (
                  <Badge variant="outline">
                    <ShieldOff className="h-3 w-3 mr-1" />
                    Disabled
                  </Badge>
                )}
              </div>
            </div>
            {status?.enabled ? (
              <Button
                variant="destructive"
                onClick={() => setDisableDialogOpen(true)}
              >
                Disable MFA
              </Button>
            ) : (
              <Button onClick={handleGenerateSecret}>
                Enable MFA
              </Button>
            )}
          </div>

          {status?.enabled && (
            <div className="pt-4 border-t">
              <div className="flex items-center justify-between">
                <div>
                  <div className="font-medium">Backup Codes</div>
                  <div className="text-sm text-muted-foreground">
                    {status.backupCodesRemaining} codes remaining
                  </div>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setRegenerateDialogOpen(true)}
                >
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Regenerate
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Enable MFA Dialog */}
      <Dialog open={enableDialogOpen} onOpenChange={setEnableDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Enable Two-Factor Authentication</DialogTitle>
            <DialogDescription>
              Scan the QR code with your authenticator app
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            {!backupCodes.length ? (
              <>
                {/* QR Code */}
                {qrCode && (
                  <div className="flex justify-center p-4 bg-white rounded-lg">
                    <img src={qrCode} alt="MFA QR Code" className="w-48 h-48" />
                  </div>
                )}

                {/* Manual Entry */}
                <div className="space-y-2">
                  <Label className="text-xs text-muted-foreground">
                    Or enter this code manually:
                  </Label>
                  <div className="flex items-center gap-2">
                    <code className="flex-1 px-3 py-2 bg-muted rounded text-sm font-mono">
                      {secret}
                    </code>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => {
                        navigator.clipboard.writeText(secret);
                        toast.success("Secret copied to clipboard");
                      }}
                    >
                      <Copy className="h-4 w-4" />
                    </Button>
                  </div>
                </div>

                {/* Verification */}
                <div className="space-y-2">
                  <Label htmlFor="verify-code">Enter 6-digit code</Label>
                  <Input
                    id="verify-code"
                    type="text"
                    maxLength={6}
                    placeholder="000000"
                    value={verificationCode}
                    onChange={(e) => setVerificationCode(e.target.value.replace(/\D/g, ""))}
                    className="text-center text-lg tracking-widest"
                  />
                </div>
              </>
            ) : (
              <>
                {/* Backup Codes */}
                <Alert>
                  <AlertTriangle className="h-4 w-4" />
                  <AlertDescription>
                    Save these backup codes in a safe place. You can use them to access your account if you lose your authenticator device.
                  </AlertDescription>
                </Alert>

                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label>Backup Codes</Label>
                    <Button size="sm" variant="outline" onClick={copyBackupCodes}>
                      <Copy className="h-4 w-4 mr-2" />
                      Copy All
                    </Button>
                  </div>
                  <div className="grid grid-cols-2 gap-2 p-4 bg-muted rounded-lg">
                    {backupCodes.map((code, idx) => (
                      <code key={idx} className="text-sm font-mono">
                        {code}
                      </code>
                    ))}
                  </div>
                </div>
              </>
            )}
          </div>

          <DialogFooter>
            {!backupCodes.length ? (
              <>
                <Button
                  variant="outline"
                  onClick={() => {
                    setEnableDialogOpen(false);
                    setVerificationCode("");
                    setQrCode("");
                    setSecret("");
                  }}
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleEnable}
                  disabled={enableMutation.isPending || verificationCode.length !== 6}
                >
                  {enableMutation.isPending ? "Verifying..." : "Enable MFA"}
                </Button>
              </>
            ) : (
              <Button
                onClick={() => {
                  setEnableDialogOpen(false);
                  setBackupCodes([]);
                  setVerificationCode("");
                  setQrCode("");
                  setSecret("");
                }}
                className="w-full"
              >
                Done
              </Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Disable MFA Dialog */}
      <Dialog open={disableDialogOpen} onOpenChange={setDisableDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Disable Two-Factor Authentication</DialogTitle>
            <DialogDescription>
              Enter your 6-digit code to confirm
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <Alert variant="destructive">
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>
                Disabling MFA will make your account less secure
              </AlertDescription>
            </Alert>

            <div className="space-y-2">
              <Label htmlFor="disable-code">Verification Code</Label>
              <Input
                id="disable-code"
                type="text"
                maxLength={6}
                placeholder="000000"
                value={verificationCode}
                onChange={(e) => setVerificationCode(e.target.value.replace(/\D/g, ""))}
                className="text-center text-lg tracking-widest"
              />
            </div>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setDisableDialogOpen(false);
                setVerificationCode("");
              }}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleDisable}
              disabled={disableMutation.isPending || verificationCode.length !== 6}
            >
              {disableMutation.isPending ? "Disabling..." : "Disable MFA"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Regenerate Backup Codes Dialog */}
      <Dialog open={regenerateDialogOpen} onOpenChange={setRegenerateDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Regenerate Backup Codes</DialogTitle>
            <DialogDescription>
              Enter your 6-digit code to generate new backup codes
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            {!backupCodes.length ? (
              <>
                <Alert>
                  <AlertTriangle className="h-4 w-4" />
                  <AlertDescription>
                    This will invalidate all existing backup codes
                  </AlertDescription>
                </Alert>

                <div className="space-y-2">
                  <Label htmlFor="regen-code">Verification Code</Label>
                  <Input
                    id="regen-code"
                    type="text"
                    maxLength={6}
                    placeholder="000000"
                    value={verificationCode}
                    onChange={(e) => setVerificationCode(e.target.value.replace(/\D/g, ""))}
                    className="text-center text-lg tracking-widest"
                  />
                </div>
              </>
            ) : (
              <>
                <Alert>
                  <AlertTriangle className="h-4 w-4" />
                  <AlertDescription>
                    Save these new backup codes. Your old codes no longer work.
                  </AlertDescription>
                </Alert>

                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label>New Backup Codes</Label>
                    <Button size="sm" variant="outline" onClick={copyBackupCodes}>
                      <Copy className="h-4 w-4 mr-2" />
                      Copy All
                    </Button>
                  </div>
                  <div className="grid grid-cols-2 gap-2 p-4 bg-muted rounded-lg">
                    {backupCodes.map((code, idx) => (
                      <code key={idx} className="text-sm font-mono">
                        {code}
                      </code>
                    ))}
                  </div>
                </div>
              </>
            )}
          </div>

          <DialogFooter>
            {!backupCodes.length ? (
              <>
                <Button
                  variant="outline"
                  onClick={() => {
                    setRegenerateDialogOpen(false);
                    setVerificationCode("");
                  }}
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleRegenerate}
                  disabled={regenerateMutation.isPending || verificationCode.length !== 6}
                >
                  {regenerateMutation.isPending ? "Generating..." : "Regenerate"}
                </Button>
              </>
            ) : (
              <Button
                onClick={() => {
                  setRegenerateDialogOpen(false);
                  setBackupCodes([]);
                  setVerificationCode("");
                }}
                className="w-full"
              >
                Done
              </Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}

