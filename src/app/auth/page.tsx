"use client";

import { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Icon } from "@iconify/react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import Link from "next/link";

function AuthContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState<"signin" | "register">("signin");

  // Handle tab from URL parameter
  useEffect(() => {
    const tab = searchParams.get("tab");
    if (tab === "signin" || tab === "register") {
      setActiveTab(tab);
    }
  }, [searchParams]);

  // Sign In state
  const [signinUsername, setSigninUsername] = useState("");
  const [signinPassword, setSigninPassword] = useState("");
  const [signinLoading, setSigninLoading] = useState(false);

  // Register state
  const [registerUsername, setRegisterUsername] = useState("");
  const [registerPassword, setRegisterPassword] = useState("");
  const [registerProfileUrl, setRegisterProfileUrl] = useState("");
  const [registerLoading, setRegisterLoading] = useState(false);

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setSigninLoading(true);

    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          username: signinUsername.trim(),
          password: signinPassword,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Login failed");
      }

      localStorage.setItem("creator_token", data.token);
      localStorage.setItem("creator_user", JSON.stringify(data.user));

      toast({
        title: "Welcome back!",
        description: `Signed in as ${data.user.username}`,
      });

      router.push("/dashboard");
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Sign in failed",
        description: error instanceof Error ? error.message : "An error occurred",
      });
    } finally {
      setSigninLoading(false);
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setRegisterLoading(true);

    try {
      const response = await fetch("/api/auth/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          username: registerUsername.trim(),
          password: registerPassword,
          profileUrl: registerProfileUrl.trim() || null,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Registration failed");
      }

      localStorage.setItem("creator_token", data.token);
      localStorage.setItem("creator_user", JSON.stringify(data.user));

      toast({
        title: "Welcome to AnymeX!",
        description: "Your creator account has been created",
      });

      router.push("/dashboard");
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Registration failed",
        description: error instanceof Error ? error.message : "An error occurred",
      });
    } finally {
      setRegisterLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background text-foreground font-sans antialiased">
      {/* Ambient Glow Orbs */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none z-0" aria-hidden="true">
        <div className="glow-orb glow-orb-violet w-[500px] h-[350px] top-[10%] left-[20%] animate-float-slow" />
        <div className="glow-orb glow-orb-cyan w-[400px] h-[300px] top-[20%] right-[15%] animate-float-slow" style={{ animationDelay: "3s" }} />
      </div>

      {/* Navigation */}
      <nav className="glass-nav fixed top-5 left-1/2 -translate-x-1/2 z-50 w-[94%] max-w-5xl rounded-2xl transition-all">
        <div className="px-4 sm:px-6 pl-2">
          <div className="flex h-14 items-center justify-between gap-4">
            <Link href="/" className="flex items-center gap-2.5 shrink-0 cursor-pointer pl-2">
              <img
                src="https://raw.githubusercontent.com/Shebyyy/AnymeX-themes/main/public/logo/anymex-logo.png"
                alt="AnymeX"
                className="w-8 h-8"
              />
              <span className="text-sm font-semibold tracking-tight text-foreground">
                AnymeX
              </span>
            </Link>
            <div className="flex items-center gap-1">
              <Link
                href="/"
                className="hidden sm:flex items-center gap-2 px-4 py-2 text-xs font-medium text-muted-foreground hover:text-foreground transition-colors duration-200"
              >
                Themes
              </Link>
              <Link
                href="/docs"
                className="hidden sm:flex items-center gap-2 px-4 py-2 text-xs font-medium text-muted-foreground hover:text-foreground transition-colors duration-200"
              >
                Docs
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="relative z-10 max-w-md mx-auto px-4 sm:px-6 lg:px-8 py-10 pt-28">
        <div className="mb-8 text-center animate-fade-in-up">
          <h1 className="text-3xl md:text-4xl font-bold tracking-tight gradient-text mb-3">
            Welcome
          </h1>
          <p className="text-muted-foreground">
            Sign in to access your account
          </p>
        </div>

        {/* Tabs */}
        <div className="flex gap-1 p-1 bg-card/40 backdrop-blur-sm rounded-xl mb-6 border border-border/40 animate-fade-in-up" style={{ animationDelay: "100ms" }}>
          <button
            onClick={() => setActiveTab("signin")}
            className={`flex-1 rounded-lg px-4 py-2.5 text-xs font-medium transition-all duration-200 cursor-pointer ${
              activeTab === "signin"
                ? "btn-violet shadow-md"
                : "text-muted-foreground hover:text-foreground hover:bg-card/50"
            }`}
          >
            Sign In
          </button>
          <button
            onClick={() => setActiveTab("register")}
            className={`flex-1 rounded-lg px-4 py-2.5 text-xs font-medium transition-all duration-200 cursor-pointer ${
              activeTab === "register"
                ? "btn-violet shadow-md"
                : "text-muted-foreground hover:text-foreground hover:bg-card/50"
            }`}
          >
            Register
          </button>
        </div>

        {/* Sign In Form */}
        {activeTab === "signin" && (
          <div className="glass-surface rounded-xl p-6 animate-fade-in-up" style={{ animationDelay: "150ms" }}>
            <form onSubmit={handleSignIn} className="space-y-5">
              <div className="space-y-1.5">
                <Label htmlFor="signin-username">Username</Label>
                <Input
                  id="signin-username"
                  type="text"
                  value={signinUsername}
                  onChange={(e) => setSigninUsername(e.target.value)}
                  className="bg-card/50 border-border/50 text-foreground input-glow"
                  placeholder="Enter your username"
                  required
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="signin-password">Password</Label>
                <Input
                  id="signin-password"
                  type="password"
                  value={signinPassword}
                  onChange={(e) => setSigninPassword(e.target.value)}
                  className="bg-card/50 border-border/50 text-foreground input-glow"
                  placeholder="Enter your password"
                  required
                />
              </div>
              <Button
                type="submit"
                disabled={signinLoading}
                className="w-full btn-violet cursor-pointer"
              >
                {signinLoading ? "Signing in..." : "Sign In"}
              </Button>
            </form>
            <p className="text-xs text-muted-foreground mt-4 text-center">
              Don&apos;t have an account?{" "}
              <button
                onClick={() => setActiveTab("register")}
                className="text-primary hover:underline cursor-pointer font-medium"
              >
                Register as a Creator
              </button>
            </p>
          </div>
        )}

        {/* Register Form */}
        {activeTab === "register" && (
          <div className="glass-surface rounded-xl p-6 animate-fade-in-up" style={{ animationDelay: "150ms" }}>
            <form onSubmit={handleRegister} className="space-y-5">
              <div className="space-y-1.5">
                <Label htmlFor="register-username">Username</Label>
                <Input
                  id="register-username"
                  type="text"
                  value={registerUsername}
                  onChange={(e) => setRegisterUsername(e.target.value)}
                  className="bg-card/50 border-border/50 text-foreground input-glow"
                  placeholder="Choose a username"
                  required
                  minLength={3}
                />
                <p className="text-xs text-muted-foreground/60 mt-1">
                  Minimum 3 characters
                </p>
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="register-password">Password</Label>
                <Input
                  id="register-password"
                  type="password"
                  value={registerPassword}
                  onChange={(e) => setRegisterPassword(e.target.value)}
                  className="bg-card/50 border-border/50 text-foreground input-glow"
                  placeholder="Create a password"
                  required
                  minLength={6}
                />
                <p className="text-xs text-muted-foreground/60 mt-1">
                  Minimum 6 characters
                </p>
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="register-profileUrl">Profile URL (optional)</Label>
                <Input
                  id="register-profileUrl"
                  type="url"
                  value={registerProfileUrl}
                  onChange={(e) => setRegisterProfileUrl(e.target.value)}
                  className="bg-card/50 border-border/50 text-foreground input-glow"
                  placeholder="https://github.com/yourusername"
                />
                <p className="text-xs text-muted-foreground/60 mt-1">
                  Link to your GitHub, social media, or website
                </p>
              </div>
              <Button
                type="submit"
                disabled={registerLoading}
                className="w-full btn-violet cursor-pointer"
              >
                {registerLoading ? "Creating account..." : "Register"}
              </Button>
            </form>
            <p className="text-xs text-muted-foreground mt-4 text-center">
              Already have an account?{" "}
              <button
                onClick={() => setActiveTab("signin")}
                className="text-primary hover:underline cursor-pointer font-medium"
              >
                Sign In
              </button>
            </p>
          </div>
        )}

        {/* Footer */}
        <div className="mt-8 text-center">
          <Link
            href="/"
            className="text-xs text-muted-foreground/60 hover:text-foreground/70 transition-colors duration-200"
          >
            &larr; Back to Themes
          </Link>
        </div>
      </main>
    </div>
  );
}

export default function AuthPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Icon icon="solar:loading-circle-linear" className="animate-spin text-primary" width={48} />
      </div>
    }>
      <AuthContent />
    </Suspense>
  );
}
