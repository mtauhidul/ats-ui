/**
 * Magic Link Page
 * Request passwordless login link
 */

import { LogoIcon } from "@/components/icons/logo-icon";
import { BackgroundRippleEffect } from "@/components/ui/background-ripple-effect";
import { Button } from "@/components/ui/button";
import { Field, FieldGroup, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { requestMagicLink } from "@/services/auth.service";
import { ArrowLeft, CheckCircle2, Loader2, Sparkles } from "lucide-react";
import { useState } from "react";
import { Link } from "react-router-dom";
import { toast } from "sonner";

export default function MagicLinkPage() {
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isEmailSent, setIsEmailSent] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      await requestMagicLink(email);
      setIsEmailSent(true);
      toast.success("Magic link sent to your email");
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Failed to send magic link";
      toast.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  if (isEmailSent) {
    return (
      <div className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden p-4">
        {/* Background Ripple Effect */}
        <div className="absolute inset-0 [--cell-border-color:hsl(var(--primary)/0.3)] [--cell-fill-color:hsl(var(--primary)/0.15)] [--cell-shadow-color:hsl(var(--primary)/0.4)]">
          <BackgroundRippleEffect rows={10} cols={30} cellSize={48} />
        </div>

        <div className="relative z-10 w-full max-w-md space-y-8">
          {/* Success Icon */}
          <div className="flex justify-center">
            <div className="rounded-full bg-green-100 p-4">
              <CheckCircle2 className="h-12 w-12 text-green-600" />
            </div>
          </div>

          {/* Success Content */}
          <div className="text-center space-y-2">
            <h1 className="text-2xl font-semibold tracking-tight">
              Check Your Email
            </h1>
            <p className="text-sm text-muted-foreground">
              We've sent a magic link to{" "}
              <strong className="text-foreground">{email}</strong>
            </p>
          </div>

          <div className="rounded-lg border bg-card/80 backdrop-blur-sm p-6 space-y-3">
            <p className="text-sm font-medium text-center">
              ✨ Click the link in your email to sign in instantly
            </p>
            <p className="text-xs text-muted-foreground text-center">
              The link will expire in 15 minutes for security. If you don't see
              the email, check your spam folder.
            </p>
          </div>

          {/* Actions */}
          <div className="space-y-3">
            <Button
              onClick={() => setIsEmailSent(false)}
              variant="outline"
              className="w-full"
            >
              Send Another Link
            </Button>
            <Link to="/login" className="block">
              <Button variant="ghost" className="w-full">
                Back to Login
              </Button>
            </Link>
            <Link to="/" className="block">
              <Button
                variant="ghost"
                className="w-full text-muted-foreground hover:text-foreground"
              >
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to Home
              </Button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden p-4">
      {/* Background Ripple Effect */}
      <div className="absolute inset-0 [--cell-border-color:hsl(var(--primary)/0.3)] [--cell-fill-color:hsl(var(--primary)/0.15)] [--cell-shadow-color:hsl(var(--primary)/0.4)]">
        <BackgroundRippleEffect rows={10} cols={30} cellSize={48} />
      </div>

      <div className="relative z-10 w-full max-w-md space-y-8">
        {/* Logo and Header */}
        <div className="flex flex-col items-center space-y-4">
          <div className="flex items-center gap-2">
            <Link
              to="/"
              className="flex items-center gap-2 hover:opacity-80 transition-opacity"
            >
              <LogoIcon size={28} color="#71abbf" />
              <span className="text-xl font-semibold">YTFCS ATS</span>
            </Link>
          </div>
          <div className="text-center space-y-2">
            <h1 className="text-2xl font-semibold tracking-tight">
              Magic Link Login
            </h1>
            <p className="text-sm text-muted-foreground">
              Sign in without a password - we'll email you a magic link
            </p>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-6">
          <FieldGroup>
            <Field>
              <FieldLabel>Email address</FieldLabel>
              <Input
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                disabled={isLoading}
              />
            </Field>
          </FieldGroup>

          <Button type="submit" className="w-full" disabled={isLoading}>
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Sending Magic Link...
              </>
            ) : (
              <>
                <Sparkles className="mr-2 h-4 w-4" />
                Send Magic Link
              </>
            )}
          </Button>
        </form>

        {/* Footer */}
        <div className="text-center text-sm space-y-2">
          <Link
            to="/login"
            className="block text-muted-foreground hover:text-foreground transition-colors"
          >
            Sign in with password instead
          </Link>
          <Link
            to="/"
            className="inline-flex items-center justify-center gap-1 text-muted-foreground hover:text-foreground transition-colors"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            Back to Home
          </Link>
        </div>
      </div>
    </div>
  );
}
