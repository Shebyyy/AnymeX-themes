"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Icon } from "@iconify/react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import Link from "next/link";

export default function SetupPage() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const { toast } = useToast();

  const handleSetup = async (e: React.FormEvent) => {
    e.preventDefault();

    if (password !== confirmPassword) {
      toast({
        variant: "destructive",
        title: "Passwords don't match",
        description: "Please make sure both passwords are the same",
      });
      return;
    }

    if (password.length < 6) {
      toast({
        variant: "destructive",
        title: "Password too short",
        description: "Password must be at least 6 characters",
      });
      return;
    }

    setLoading(true);

    try {
      const response = await fetch("/api/setup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password, name, email }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Setup failed");
      }

      toast({
        title: "Setup completed! 🎉",
        description: `Super admin account "${username}" has been created`,
      });

      // Auto-login
      const loginResponse = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
      });

      const loginData = await loginResponse.json();

      if (loginResponse.ok && loginData.token) {
        localStorage.setItem("admin_token", loginData.token);
        localStorage.setItem("admin_user", JSON.stringify(loginData.user));
        router.push("/admin/dashboard");
      } else {
        router.push("/admin/login");
      }
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Setup failed",
        description: error instanceof Error ? error.message : "An error occurred",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-neutral-950 text-neutral-300 font-sans antialiased flex items-center justify-center p-4">
      {/* Ambient Background Glow */}
      <div className="fixed top-0 left-1/2 -translate-x-1/2 w-full max-w-3xl h-96 bg-indigo-500/10 blur-[120px] rounded-full pointer-events-none z-0" />

      <div className="relative z-10 w-full max-w-md">
        {/* Logo */}
        <div className="flex items-center justify-center gap-2 mb-8">
          <div className="flex items-center justify-center w-10 h-10 rounded-full bg-white text-black">
            <Icon icon="solar:play-stream-bold" width={22} />
          </div>
          <span className="text-xl font-semibold tracking-tight text-white">
            AnymeX Setup
          </span>
        </div>

        {/* Setup Card */}
        <div className="rounded-2xl border border-neutral-800 bg-neutral-900/60 backdrop-blur-xl p-8 shadow-2xl">
          <div className="text-center mb-8">
            <h1 className="text-2xl font-semibold text-white mb-2">
              Initial Setup
            </h1>
            <p className="text-sm text-neutral-400">
              Create your super admin account to get started
            </p>
          </div>

          <form onSubmit={handleSetup} className="space-y-4">
            <div>
              <Label htmlFor="username">Username *</Label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-neutral-500">
                  <Icon icon="solar:user-linear" width={18} />
                </div>
                <Input
                  id="username"
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="bg-neutral-800 border-neutral-700 text-white pl-10"
                  placeholder="Choose a username"
                  required
                />
              </div>
            </div>

            <div>
              <Label htmlFor="name">Full Name</Label>
              <Input
                id="name"
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="bg-neutral-800 border-neutral-700 text-white"
                placeholder="Your full name"
              />
            </div>

            <div>
              <Label htmlFor="email">Email</Label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-neutral-500">
                  <Icon icon="solar:letter-linear" width={18} />
                </div>
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="bg-neutral-800 border-neutral-700 text-white pl-10"
                  placeholder="your@email.com"
                />
              </div>
            </div>

            <div>
              <Label htmlFor="password">Password *</Label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-neutral-500">
                  <Icon icon="solar:lock-keyhole-linear" width={18} />
                </div>
                <Input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="bg-neutral-800 border-neutral-700 text-white pl-10"
                  placeholder="Choose a strong password"
                  required
                />
              </div>
            </div>

            <div>
              <Label htmlFor="confirmPassword">Confirm Password *</Label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-neutral-500">
                  <Icon icon="solar:lock-keyhole-linear" width={18} />
                </div>
                <Input
                  id="confirmPassword"
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="bg-neutral-800 border-neutral-700 text-white pl-10"
                  placeholder="Confirm your password"
                  required
                />
              </div>
            </div>

            <Button
              type="submit"
              className="w-full bg-white text-black hover:bg-neutral-200"
              disabled={loading}
            >
              {loading ? (
                <span className="flex items-center gap-2">
                  <Icon icon="solar:loading-circle-linear" className="animate-spin" width={18} />
                  Setting up...
                </span>
              ) : (
                "Create Super Admin"
              )}
            </Button>
          </form>

          <div className="mt-6 pt-6 border-t border-neutral-800 text-center">
            <Link
              href="/"
              className="text-sm text-neutral-400 hover:text-white transition-colors inline-flex items-center gap-2"
            >
              <Icon icon="solar:home-angle-2-linear" width={16} />
              Back to Home
            </Link>
          </div>
        </div>

        <p className="text-center text-xs text-neutral-600 mt-6">
          This will create a super admin account with full access to the admin panel.
        </p>
      </div>
    </div>
  );
}
