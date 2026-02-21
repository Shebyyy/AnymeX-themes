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
  const [activeTab, setActiveTab] = useState<"signin" | "register" | "admin">("signin");

  // Handle tab from URL parameter
  useEffect(() => {
    const tab = searchParams.get("tab");
    if (tab === "signin" || tab === "register" || tab === "admin") {
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

  // Admin Login state
  const [adminUsername, setAdminUsername] = useState("");
  const [adminPassword, setAdminPassword] = useState("");
  const [adminLoading, setAdminLoading] = useState(false);

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
        title: "Welcome back! 👋",
        description: `Signed in as ${data.user.username}`,
      });

      router.push("/creator/dashboard");
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
        title: "Welcome to AnymeX! 🎉",
        description: "Your creator account has been created",
      });

      router.push("/creator/dashboard");
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

  const handleAdminLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setAdminLoading(true);

    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          username: adminUsername.trim(),
          password: adminPassword,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Login failed");
      }

      // Check if user has admin access
      const role = data.user.role;
      if (role !== "ADMIN" && role !== "SUPER_ADMIN") {
        throw new Error("You don't have admin access");
      }

      localStorage.setItem("admin_token", data.token);
      localStorage.setItem("admin_user", JSON.stringify(data.user));

      toast({
        title: "Admin access granted 🔐",
        description: `Welcome back, ${data.user.username}`,
      });

      router.push("/admin/dashboard");
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Admin login failed",
        description: error instanceof Error ? error.message : "An error occurred",
      });
    } finally {
      setAdminLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-neutral-950 text-neutral-300 font-sans antialiased">
      {/* Navigation */}
      <nav className="fixed top-6 left-1/2 -translate-x-1/2 z-50 w-[95%] max-w-5xl rounded-full border border-neutral-800/60 bg-neutral-900/60 backdrop-blur-xl shadow-lg shadow-black/20 transition-all">
        <div className="px-4 sm:px-6 pl-2">
          <div className="flex h-14 items-center justify-between gap-4">
            <Link href="/" className="flex items-center gap-2 shrink-0 cursor-pointer pl-2">
              <div className="flex items-center justify-center w-8 h-8 rounded-full bg-white text-black">
                <Icon icon="solar:play-stream-bold" width={18} />
              </div>
              <span className="text-sm font-semibold tracking-tight text-white">
                AnymeX
              </span>
            </Link>
            <div className="flex items-center gap-1">
              <Link
                href="/"
                className="hidden sm:flex items-center gap-2 px-4 py-2 text-xs font-medium text-neutral-400 hover:text-white transition-colors"
              >
                Themes
              </Link>
              <Link
                href="/docs"
                className="hidden sm:flex items-center gap-2 px-4 py-2 text-xs font-medium text-neutral-400 hover:text-white transition-colors"
              >
                Docs
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="relative z-10 max-w-md mx-auto px-4 sm:px-6 lg:px-8 py-10 pt-24">
        <div className="mb-8 text-center">
          <h1 className="text-3xl md:text-4xl font-semibold tracking-tight text-white mb-2">
            Welcome
          </h1>
          <p className="text-neutral-400">
            Sign in to access your account
          </p>
        </div>

        {/* Tabs */}
        <div className="flex gap-1 p-1 bg-neutral-900 rounded-xl mb-6 border border-neutral-800">
          <button
            onClick={() => setActiveTab("signin")}
            className={`flex-1 rounded-lg px-4 py-2.5 text-xs font-medium transition-all ${
              activeTab === "signin"
                ? "bg-white text-black"
                : "text-neutral-400 hover:text-white hover:bg-neutral-800"
            }`}
          >
            Sign In
          </button>
          <button
            onClick={() => setActiveTab("register")}
            className={`flex-1 rounded-lg px-4 py-2.5 text-xs font-medium transition-all ${
              activeTab === "register"
                ? "bg-white text-black"
                : "text-neutral-400 hover:text-white hover:bg-neutral-800"
            }`}
          >
            Register
          </button>
          <button
            onClick={() => setActiveTab("admin")}
            className={`flex-1 rounded-lg px-4 py-2.5 text-xs font-medium transition-all ${
              activeTab === "admin"
                ? "bg-white text-black"
                : "text-neutral-400 hover:text-white hover:bg-neutral-800"
            }`}
          >
            Admin
          </button>
        </div>

        {/* Sign In Form */}
        {activeTab === "signin" && (
          <div className="rounded-xl border border-neutral-800 bg-neutral-900/30 p-6">
            <form onSubmit={handleSignIn} className="space-y-4">
              <div>
                <Label htmlFor="signin-username">Username</Label>
                <Input
                  id="signin-username"
                  type="text"
                  value={signinUsername}
                  onChange={(e) => setSigninUsername(e.target.value)}
                  className="bg-neutral-800 border-neutral-700 text-white"
                  placeholder="Enter your username"
                  required
                />
              </div>
              <div>
                <Label htmlFor="signin-password">Password</Label>
                <Input
                  id="signin-password"
                  type="password"
                  value={signinPassword}
                  onChange={(e) => setSigninPassword(e.target.value)}
                  className="bg-neutral-800 border-neutral-700 text-white"
                  placeholder="Enter your password"
                  required
                />
              </div>
              <Button
                type="submit"
                disabled={signinLoading}
                className="w-full bg-white text-black hover:bg-neutral-200"
              >
                {signinLoading ? "Signing in..." : "Sign In"}
              </Button>
            </form>
            <p className="text-xs text-neutral-500 mt-4 text-center">
              Don't have an account?{" "}
              <button
                onClick={() => setActiveTab("register")}
                className="text-white hover:underline cursor-pointer"
              >
                Register as a Creator
              </button>
            </p>
          </div>
        )}

        {/* Register Form */}
        {activeTab === "register" && (
          <div className="rounded-xl border border-neutral-800 bg-neutral-900/30 p-6">
            <form onSubmit={handleRegister} className="space-y-4">
              <div>
                <Label htmlFor="register-username">Username</Label>
                <Input
                  id="register-username"
                  type="text"
                  value={registerUsername}
                  onChange={(e) => setRegisterUsername(e.target.value)}
                  className="bg-neutral-800 border-neutral-700 text-white"
                  placeholder="Choose a username"
                  required
                  minLength={3}
                />
                <p className="text-xs text-neutral-500 mt-1">
                  Minimum 3 characters
                </p>
              </div>
              <div>
                <Label htmlFor="register-password">Password</Label>
                <Input
                  id="register-password"
                  type="password"
                  value={registerPassword}
                  onChange={(e) => setRegisterPassword(e.target.value)}
                  className="bg-neutral-800 border-neutral-700 text-white"
                  placeholder="Create a password"
                  required
                  minLength={6}
                />
                <p className="text-xs text-neutral-500 mt-1">
                  Minimum 6 characters
                </p>
              </div>
              <div>
                <Label htmlFor="register-profileUrl">Profile URL (optional)</Label>
                <Input
                  id="register-profileUrl"
                  type="url"
                  value={registerProfileUrl}
                  onChange={(e) => setRegisterProfileUrl(e.target.value)}
                  className="bg-neutral-800 border-neutral-700 text-white"
                  placeholder="https://github.com/yourusername"
                />
                <p className="text-xs text-neutral-500 mt-1">
                  Link to your GitHub, social media, or website
                </p>
              </div>
              <Button
                type="submit"
                disabled={registerLoading}
                className="w-full bg-white text-black hover:bg-neutral-200"
              >
                {registerLoading ? "Creating account..." : "Register"}
              </Button>
            </form>
            <p className="text-xs text-neutral-500 mt-4 text-center">
              Already have an account?{" "}
              <button
                onClick={() => setActiveTab("signin")}
                className="text-white hover:underline cursor-pointer"
              >
                Sign In
              </button>
            </p>
          </div>
        )}

        {/* Admin Login Form */}
        {activeTab === "admin" && (
          <div className="rounded-xl border border-neutral-800 bg-neutral-900/30 p-6">
            <div className="flex items-center gap-2 mb-4 pb-4 border-b border-neutral-800">
              <Icon icon="solar:shield-check-linear" className="text-indigo-400" width={20} />
              <span className="text-sm font-medium text-neutral-300">
                Admin Access
              </span>
            </div>
            <form onSubmit={handleAdminLogin} className="space-y-4">
              <div>
                <Label htmlFor="admin-username">Admin Username</Label>
                <Input
                  id="admin-username"
                  type="text"
                  value={adminUsername}
                  onChange={(e) => setAdminUsername(e.target.value)}
                  className="bg-neutral-800 border-neutral-700 text-white"
                  placeholder="Enter admin username"
                  required
                />
              </div>
              <div>
                <Label htmlFor="admin-password">Admin Password</Label>
                <Input
                  id="admin-password"
                  type="password"
                  value={adminPassword}
                  onChange={(e) => setAdminPassword(e.target.value)}
                  className="bg-neutral-800 border-neutral-700 text-white"
                  placeholder="Enter admin password"
                  required
                />
              </div>
              <Button
                type="submit"
                disabled={adminLoading}
                className="w-full bg-indigo-600 text-white hover:bg-indigo-700"
              >
                {adminLoading ? "Verifying..." : "Admin Login"}
              </Button>
            </form>
            <p className="text-xs text-neutral-500 mt-4 text-center">
              Admin access only. Contact an administrator if you need access.
            </p>
          </div>
        )}

        {/* Footer */}
        <div className="mt-8 text-center">
          <Link
            href="/"
            className="text-xs text-neutral-500 hover:text-neutral-300 transition-colors"
          >
            ← Back to Themes
          </Link>
        </div>
      </main>
    </div>
  );
}

export default function AuthPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-neutral-950 flex items-center justify-center">
        <p className="text-neutral-400">Loading...</p>
      </div>
    }>
      <AuthContent />
    </Suspense>
  );
}
