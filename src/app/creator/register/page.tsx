"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Icon } from "@iconify/react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import Link from "next/link";

export default function CreatorRegisterPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    username: "",
    password: "",
    confirmPassword: "",
    profileUrl: "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    if (formData.password !== formData.confirmPassword) {
      toast({
        variant: "destructive",
        title: "Passwords don't match",
        description: "Please make sure both passwords are the same",
      });
      setLoading(false);
      return;
    }

    if (formData.password.length < 6) {
      toast({
        variant: "destructive",
        title: "Password too short",
        description: "Password must be at least 6 characters",
      });
      setLoading(false);
      return;
    }

    try {
      const response = await fetch("/api/auth/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          username: formData.username,
          password: formData.password,
          profileUrl: formData.profileUrl,
          role: "THEME_CREATOR",
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Registration failed");
      }

      toast({
        title: "Account created! 🎉",
        description: "Please sign in to continue",
      });

      router.push("/creator/login");
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Registration failed",
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
            Join Creator Hub
          </h1>
          <p className="text-neutral-400">
            Register to start sharing your themes
          </p>
        </div>

        {/* Register Form */}
        <div className="bg-slate-900/80 backdrop-blur-xl border border-purple-900/30 rounded-2xl p-8">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="col-span-2">
                <Label htmlFor="username" className="text-neutral-200">
                  Username *
                </Label>
                <Input
                  id="username"
                  type="text"
                  placeholder="Choose a username"
                  value={formData.username}
                  onChange={(e) =>
                    setFormData({ ...formData, username: e.target.value })
                  }
                  className="bg-slate-800/50 border-purple-900/30 text-white placeholder:text-neutral-500 mt-2"
                  required
                />
              </div>

              <div className="col-span-2">
                <Label htmlFor="password" className="text-neutral-200">
                  Password *
                </Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="Choose a password"
                  value={formData.password}
                  onChange={(e) =>
                    setFormData({ ...formData, password: e.target.value })
                  }
                  className="bg-slate-800/50 border-purple-900/30 text-white placeholder:text-neutral-500 mt-2"
                  required
                  minLength={6}
                />
                <p className="text-xs text-neutral-500 mt-1">
                  Must be at least 6 characters
                </p>
              </div>

              <div className="col-span-2">
                <Label htmlFor="confirmPassword" className="text-neutral-200">
                  Confirm Password *
                </Label>
                <Input
                  id="confirmPassword"
                  type="password"
                  placeholder="Confirm your password"
                  value={formData.confirmPassword}
                  onChange={(e) =>
                    setFormData({ ...formData, confirmPassword: e.target.value })
                  }
                  className="bg-slate-800/50 border-purple-900/30 text-white placeholder:text-neutral-500 mt-2"
                  required
                  minLength={6}
                />
              </div>

              <div className="col-span-2">
                <Label htmlFor="profileUrl" className="text-neutral-200">
                  Profile URL
                </Label>
                <Input
                  id="profileUrl"
                  type="url"
                  placeholder="https://github.com/yourusername"
                  value={formData.profileUrl}
                  onChange={(e) =>
                    setFormData({ ...formData, profileUrl: e.target.value })
                  }
                  className="bg-slate-800/50 border-purple-900/30 text-white placeholder:text-neutral-500 mt-2"
                />
                <p className="text-xs text-neutral-500 mt-1">
                  Link shown when users click on your name
                </p>
              </div>
            </div>

            <Button
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-purple-500 to-pink-500 text-white hover:from-purple-600 hover:to-pink-600"
            >
              {loading ? (
                <span className="flex items-center gap-2">
                  <Icon icon="solar:loading-circle-linear" className="animate-spin" width={18} />
                  Creating account...
                </span>
              ) : (
                "Create Account"
              )}
            </Button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-neutral-400 text-sm">
              Already have an account?{" "}
              <Link
                href="/creator/login"
                className="text-purple-400 hover:text-purple-300 font-medium"
              >
                Sign in
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
