import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { APP_TITLE } from "@/const";
import { trpc } from "@/lib/trpc";
import { Sparkles, ArrowRight, Check } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { useLocation } from "wouter";

export default function Onboarding() {
  const [, setLocation] = useLocation();
  const [step, setStep] = useState(1);
  const [brand, setBrand] = useState({
    name: "",
    primaryColor: "#3B82F6",
    secondaryColor: "#8B5CF6",
    accentColor: "#10B981",
    fontPrimary: "Inter",
    fontSecondary: "Georgia",
    guidelinesText: "",
  });

  const { data: workspaces } = trpc.workspaces.list.useQuery();
  const defaultWorkspace = workspaces?.find((w) => w.isDefault) || workspaces?.[0];

  const createBrand = trpc.brands.create.useMutation({
    onSuccess: () => {
      toast.success("Welcome to SlideCoffee! 🎉");
      setLocation("/dashboard");
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });

  const handleSkip = () => {
    setLocation("/dashboard");
  };

  const handleComplete = () => {
    if (!defaultWorkspace) {
      toast.error("No workspace found");
      return;
    }

    if (brand.name.trim()) {
      createBrand.mutate({
        workspaceId: defaultWorkspace.id,
        ...brand,
      });
    } else {
      setLocation("/dashboard");
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5 flex items-center justify-center p-4">
      <div className="w-full max-w-4xl">
        {/* Progress */}
        <div className="mb-8">
          <div className="flex items-center justify-center gap-2 mb-4">
            <div className={`w-8 h-8 rounded-full flex items-center justify-center ${step >= 1 ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'}`}>
              {step > 1 ? <Check className="w-5 h-5" /> : "1"}
            </div>
            <div className={`w-16 h-1 ${step >= 2 ? 'bg-primary' : 'bg-muted'}`} />
            <div className={`w-8 h-8 rounded-full flex items-center justify-center ${step >= 2 ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'}`}>
              2
            </div>
          </div>
        </div>

        {/* Content Card */}
        <div className="bg-card border rounded-2xl shadow-xl p-8 md:p-12">
          {step === 1 && (
            <div className="space-y-8">
              <div className="text-center space-y-4">
                <div className="flex justify-center">
                  <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-primary to-primary/60 flex items-center justify-center shadow-lg">
                    <Sparkles className="w-8 h-8 text-white" />
                  </div>
                </div>
                <h1 className="text-4xl font-bold tracking-tight">
                  Welcome to {APP_TITLE}! ☕
                </h1>
                <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
                  Let's get you set up. We'll create your first brand so the AI knows how to style your presentations.
                </p>
              </div>

              <div className="max-w-2xl mx-auto space-y-6">
                <div className="space-y-3">
                  <Label htmlFor="brandName" className="text-base">
                    What's your brand or company name?
                  </Label>
                  <Input
                    id="brandName"
                    placeholder="e.g., Acme Corp, My Agency, Personal Brand"
                    value={brand.name}
                    onChange={(e) => setBrand({ ...brand, name: e.target.value })}
                    className="h-12 text-lg"
                    autoFocus
                  />
                </div>

                <div className="space-y-3">
                  <Label className="text-base">Choose your brand colors</Label>
                  <div className="grid grid-cols-3 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="primary" className="text-sm text-muted-foreground">
                        Primary
                      </Label>
                      <div className="flex gap-2">
                        <Input
                          id="primary"
                          type="color"
                          value={brand.primaryColor}
                          onChange={(e) => setBrand({ ...brand, primaryColor: e.target.value })}
                          className="w-20 h-12 p-1 cursor-pointer"
                        />
                        <Input
                          value={brand.primaryColor}
                          onChange={(e) => setBrand({ ...brand, primaryColor: e.target.value })}
                          className="h-12"
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="secondary" className="text-sm text-muted-foreground">
                        Secondary
                      </Label>
                      <div className="flex gap-2">
                        <Input
                          id="secondary"
                          type="color"
                          value={brand.secondaryColor}
                          onChange={(e) => setBrand({ ...brand, secondaryColor: e.target.value })}
                          className="w-20 h-12 p-1 cursor-pointer"
                        />
                        <Input
                          value={brand.secondaryColor}
                          onChange={(e) => setBrand({ ...brand, secondaryColor: e.target.value })}
                          className="h-12"
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="accent" className="text-sm text-muted-foreground">
                        Accent
                      </Label>
                      <div className="flex gap-2">
                        <Input
                          id="accent"
                          type="color"
                          value={brand.accentColor}
                          onChange={(e) => setBrand({ ...brand, accentColor: e.target.value })}
                          className="w-20 h-12 p-1 cursor-pointer"
                        />
                        <Input
                          value={brand.accentColor}
                          onChange={(e) => setBrand({ ...brand, accentColor: e.target.value })}
                          className="h-12"
                        />
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex gap-4 pt-4">
                  <Button
                    variant="outline"
                    size="lg"
                    onClick={handleSkip}
                    className="flex-1"
                  >
                    Skip for now
                  </Button>
                  <Button
                    size="lg"
                    onClick={() => setStep(2)}
                    className="flex-1"
                    disabled={!brand.name.trim()}
                  >
                    Continue
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
                </div>
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-8">
              <div className="text-center space-y-4">
                <h2 className="text-3xl font-bold tracking-tight">
                  Tell us about your brand
                </h2>
                <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                  This helps the AI create presentations that match your voice and style.
                </p>
              </div>

              <div className="max-w-2xl mx-auto space-y-6">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="fontPrimary" className="text-base">
                      Primary Font
                    </Label>
                    <Input
                      id="fontPrimary"
                      placeholder="e.g., Inter, Helvetica"
                      value={brand.fontPrimary}
                      onChange={(e) => setBrand({ ...brand, fontPrimary: e.target.value })}
                      className="h-12"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="fontSecondary" className="text-base">
                      Secondary Font
                    </Label>
                    <Input
                      id="fontSecondary"
                      placeholder="e.g., Georgia, Times"
                      value={brand.fontSecondary}
                      onChange={(e) => setBrand({ ...brand, fontSecondary: e.target.value })}
                      className="h-12"
                    />
                  </div>
                </div>

                <div className="space-y-3">
                  <Label htmlFor="guidelines" className="text-base">
                    Brand Guidelines (Optional)
                  </Label>
                  <Textarea
                    id="guidelines"
                    placeholder="Describe your brand's voice, tone, and messaging style. For example: 'We're a B2B SaaS company with a professional yet approachable tone. We focus on innovation and customer success.'"
                    value={brand.guidelinesText}
                    onChange={(e) => setBrand({ ...brand, guidelinesText: e.target.value })}
                    rows={6}
                    className="text-base"
                  />
                </div>

                <div className="flex gap-4 pt-4">
                  <Button
                    variant="outline"
                    size="lg"
                    onClick={() => setStep(1)}
                    className="flex-1"
                  >
                    Back
                  </Button>
                  <Button
                    size="lg"
                    onClick={handleComplete}
                    disabled={createBrand.isPending}
                    className="flex-1"
                  >
                    {createBrand.isPending ? "Setting up..." : "Complete Setup"}
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="text-center mt-8 text-sm text-muted-foreground">
          You can always add more brands or edit this later
        </div>
      </div>
    </div>
  );
}

