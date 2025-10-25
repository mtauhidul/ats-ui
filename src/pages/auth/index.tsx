import { SignIn } from "@clerk/clerk-react";
import { Link } from "react-router-dom";

export default function AuthPage() {
  return (
    <div className="min-h-[calc(100vh-73px)] flex items-center justify-center bg-gradient-to-br from-background via-background to-accent/5">
      <div className="w-full max-w-md px-6">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-2">
            Welcome to YTFCS ATS
          </h1>
          <p className="text-muted-foreground">
            Sign in to access your recruitment dashboard
          </p>
        </div>

        <div className="flex justify-center">
          <SignIn
            appearance={{
              elements: {
                rootBox: "w-full",
                card: "shadow-xl border border-border/50 bg-card",
                headerTitle: "hidden",
                headerSubtitle: "hidden",
                socialButtonsBlockButton:
                  "bg-secondary hover:bg-secondary/80 border border-border",
                socialButtonsBlockButtonText: "text-foreground font-medium",
                formButtonPrimary:
                  "bg-primary hover:bg-primary/90 text-primary-foreground",
                footerActionLink: "text-primary hover:text-primary/80",
                identityPreviewText: "text-foreground",
                identityPreviewEditButton: "text-primary hover:text-primary/80",
                formFieldLabel: "text-foreground",
                formFieldInput:
                  "bg-background border-border focus:border-primary focus:ring-primary",
                formFieldInputShowPasswordButton: "text-muted-foreground",
                otpCodeFieldInput:
                  "bg-background border-border focus:border-primary",
                dividerLine: "bg-border",
                dividerText: "text-muted-foreground",
              },
            }}
            routing="hash"
            afterSignInUrl="/dashboard"
            afterSignUpUrl="/dashboard"
          />
        </div>

        <div className="text-center mt-8 space-y-2">
          <p className="text-sm text-muted-foreground">
            Don't have access? Contact your administrator for an invitation.
          </p>
          <Link
            to="/"
            className="text-sm text-primary hover:text-primary/80 transition-colors inline-block"
          >
            ← Back to Home
          </Link>
        </div>
      </div>
    </div>
  );
}