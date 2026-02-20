"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Icon } from "@iconify/react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import Link from "next/link";

export default function CreatorLoginPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    username: "",
    password: "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Login failed");
      }

      // Check if user has creator access
      if (
        !data.user ||
        (data.user.role !== 'THEME_CREATOR' &&
         data.user.role !== 'ADMIN' &&
         data.user.role !== 'SUPER_ADMIN')
      ) {
        throw new Error("You don't have creator access. Please contact an admin.");
      }

      localStorage.setItem("creator_token", data.token);
      localStorage.setItem("creator_user", JSON.stringify(data.user));

      toast({
        title: "Welcome back! 🎨",
        description: `Logged in as ${data.user.username}`,
      });

      router.push("/creator/dashboard");
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Login failed",
        description: error instanceof Error ? error.message : "An error occurred",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-950 via-slate-900 to-slate-950 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-purple-500 to-pink-500 text-white mb-4">
            <Icon icon="solar:gallery-wide-linear" width={32} />
          </div>
          <h1 className="text-3xl font-bold text-white mb-2">
            Creator Hub
          </h1>
          <p className="text-neutral-400">
            Sign in to manage your themes
          </p>
        </div>

        {/* Login Form */}
        <div className="bg-slate-900/80 backdrop-blur-xl border border-purple-900/30 rounded-2xl p-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <Label htmlFor="username" className="text-neutral-200">
                Username
              </Label>
              <Input
                id="username"
                type="text"
                placeholder="Enter your username"
                value={formData.username}
                onChange={(e) =>
                  setFormData({ ...formData, username: e.target.value })
                }
                className="bg-slate-800/50 border-purple-900/30 text-white placeholder:text-neutral-500 mt-2"
                required
              />
            </div>

            <div>
              <Label htmlFor="password" className="text-neutral-200">
                Password
              </Label>
              <Input
                id="password"
                type="password"
                placeholder="Enter your password"
                value={formData.password}
                onChange={(e) =>
                  setFormData({ ...formData, password: e.target.value })
                }
                className="bg-slate-800/50 border-purple-900/30 text-white placeholder:text-neutral-500 mt-2"
                required
              />
            </div>

            <Button
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-purple-500 to-pink-500 text-white hover:from-purple-600 hover:to-pink-600"
            >
              {loading ? (
                <span className="flex items-center gap-2">
                  <Icon icon="solar:loading-circle-linear" className="animate-spin" width={18} />
                  Signing in...
                </span>
              ) : (
                "Sign In"
              )}
            </Button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-neutral-400 text-sm">
              Don't have an account?{" "}
              <Link
                href="/creator/register"
                className="text-purple-400 hover:text-purple-300 font-medium"
              >
                Register as a Creator
              </Link>
            </p>
          </div>
        </div>

        {/* Back to Home */}
        <div className="mt-6 text-center">
          <Link
            href="/"
            className="text-neutral-500 hover:text-neutral-400 text-sm inline-flex items-center gap-2"
          >
            <Icon icon="solar:arrow-left-linear" width={16} />
            Back to Home
          </Link>
        </div>
      </div>
    </div>
  );
}
