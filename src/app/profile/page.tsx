"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Icon } from "@iconify/react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import Link from "next/link";

interface User {
  id: string;
  username: string;
  email?: string | null;
  role: string;
  profileUrl?: string | null;
  createdAt: string;
}

export default function ProfilePage() {
  const router = useRouter();
  const { toast } = useToast();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [username, setUsername] = useState("");
  const [profileUrl, setProfileUrl] = useState("");

  // Password change states
  const [changePasswordDialogOpen, setChangePasswordDialogOpen] = useState(false);
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [changingPassword, setChangingPassword] = useState(false);

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    const creatorToken = localStorage.getItem("creator_token");
    const adminToken = localStorage.getItem("admin_token");
    const userStr = localStorage.getItem("creator_user") || localStorage.getItem("admin_user");

    if (!creatorToken && !adminToken) {
      router.push("/");
      return;
    }

    try {
      const token = creatorToken || adminToken;
      const response = await fetch("/api/auth/me", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        localStorage.removeItem("creator_token");
        localStorage.removeItem("admin_token");
        localStorage.removeItem("creator_user");
        localStorage.removeItem("admin_user");
        router.push("/");
        return;
      }

      const data = await response.json();
      setUser(data.user);
      setUsername(data.user.username);
      setProfileUrl(data.user.profileUrl || "");
    } catch (error) {
      console.error("Auth check error:", error);
      router.push("/");
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    const creatorToken = localStorage.getItem("creator_token");
    const adminToken = localStorage.getItem("admin_token");
    const token = creatorToken || adminToken;

    try {
      const response = await fetch("/api/profile/update", {
        method: "PATCH",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          username: username.trim(),
          profileUrl: profileUrl.trim() || null,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to update profile");
      }

      // Update local storage
      const storageKey = creatorToken ? "creator_user" : "admin_user";
      localStorage.setItem(
        storageKey,
        JSON.stringify({
          ...user,
          username: data.user.username,
          profileUrl: data.user.profileUrl,
        })
      );

      setUser(data.user);
      toast({
        title: "Profile updated successfully! ✨",
        description: "Your changes have been saved",
      });
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Failed to update profile",
        description: error instanceof Error ? error.message : "An error occurred",
      });
    } finally {
      setSaving(false);
    }
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setChangingPassword(true);

    const creatorToken = localStorage.getItem("creator_token");
    const adminToken = localStorage.getItem("admin_token");
    const token = creatorToken || adminToken;

    try {
      const response = await fetch("/api/auth/change-password", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          currentPassword,
          newPassword,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to change password");
      }

      toast({
        title: "Password changed successfully! 🔒",
        description: "Your password has been updated",
      });

      setChangePasswordDialogOpen(false);
      setCurrentPassword("");
      setNewPassword("");
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Failed to change password",
        description: error instanceof Error ? error.message : "An error occurred",
      });
    } finally {
      setChangingPassword(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-neutral-950 text-neutral-300 font-sans antialiased flex items-center justify-center">
        <Icon icon="solar:loading-circle-linear" className="animate-spin text-white" width={48} />
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-neutral-950 text-neutral-300 font-sans antialiased">
      {/* Navigation */}
      <nav className="fixed top-6 left-1/2 -translate-x-1/2 z-50 w-[95%] max-w-5xl rounded-full border border-neutral-800/60 bg-neutral-900/60 backdrop-blur-xl shadow-lg shadow-black/20 transition-all">
        <div className="px-4 sm:px-6 pl-2">
          <div className="flex h-14 items-center justify-between gap-4">
            <Link href="/" className="flex items-center gap-2 shrink-0 cursor-pointer pl-2">
              <img
                src="https://raw.githubusercontent.com/RyanYuuki/AnymeX/main/assets/images/logo_transparent.png"
                alt="AnymeX"
                className="w-8 h-8"
              />
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
              {user.role === 'THEME_CREATOR' && (
                <Link
                  href="/creator/dashboard"
                  className="hidden sm:flex items-center gap-2 px-4 py-2 text-xs font-medium text-neutral-400 hover:text-white transition-colors"
                >
                  Creator Dashboard
                </Link>
              )}
              {(user.role === 'ADMIN' || user.role === 'SUPER_ADMIN') && (
                <>
                  <Link
                    href="/creator/dashboard"
                    className="hidden sm:flex items-center gap-2 px-4 py-2 text-xs font-medium text-neutral-400 hover:text-white transition-colors"
                  >
                    Creator Dashboard
                  </Link>
                  <Link
                    href="/admin/dashboard"
                    className="hidden sm:flex items-center gap-2 px-4 py-2 text-xs font-medium text-neutral-400 hover:text-white transition-colors"
                  >
                    Admin Dashboard
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="relative z-10 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10 pt-24">
        <div className="mb-8">
          <h1 className="text-3xl md:text-4xl font-semibold tracking-tight text-white mb-2">
            Profile Settings
          </h1>
          <p className="text-neutral-400">
            Manage your account information and preferences
          </p>
        </div>

        <div className="space-y-6">
          {/* Profile Information Card */}
          <Card className="border-neutral-800 bg-neutral-900/30">
            <CardHeader>
              <CardTitle className="text-white">Profile Information</CardTitle>
              <CardDescription>
                Update your public profile information
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleUpdateProfile} className="space-y-4">
                <div>
                  <Label htmlFor="username">Username</Label>
                  <Input
                    id="username"
                    type="text"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    className="bg-neutral-800 border-neutral-700 text-white"
                    required
                    minLength={3}
                  />
                  <p className="text-xs text-neutral-500 mt-1">
                    Your unique username for the platform (min. 3 characters)
                  </p>
                </div>
                <div>
                  <Label htmlFor="profileUrl">Profile URL (optional)</Label>
                  <Input
                    id="profileUrl"
                    type="url"
                    value={profileUrl}
                    onChange={(e) => setProfileUrl(e.target.value)}
                    className="bg-neutral-800 border-neutral-700 text-white"
                    placeholder="https://github.com/yourusername"
                  />
                  <p className="text-xs text-neutral-500 mt-1">
                    Link to your GitHub, social media, or personal website
                  </p>
                </div>
                <div className="flex justify-end pt-4">
                  <Button
                    type="submit"
                    disabled={saving}
                    className="bg-neutral-800 text-white hover:bg-neutral-700"
                  >
                    {saving ? "Saving..." : "Save Changes"}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>

          {/* Account Information Card */}
          <Card className="border-neutral-800 bg-neutral-900/30">
            <CardHeader>
              <CardTitle className="text-white">Account Information</CardTitle>
              <CardDescription>
                Your account details (read-only)
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label className="text-neutral-400">Role</Label>
                <p className="text-white mt-1">{user.role.replace(/_/g, ' ')}</p>
              </div>
              <div>
                <Label className="text-neutral-400">Account Created</Label>
                <p className="text-white mt-1">
                  {new Date(user.createdAt).toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                  })}
                </p>
              </div>
              <div>
                <Label className="text-neutral-400">User ID</Label>
                <p className="text-white mt-1 font-mono text-sm">{user.id}</p>
              </div>
            </CardContent>
          </Card>

          {/* Security Card */}
          <Card className="border-neutral-800 bg-neutral-900/30">
            <CardHeader>
              <CardTitle className="text-white">Security</CardTitle>
              <CardDescription>
                Manage your account security settings
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button
                variant="outline"
                onClick={() => setChangePasswordDialogOpen(true)}
                className="border-neutral-700 text-neutral-300 hover:bg-neutral-800"
              >
                <Icon icon="solar:lock-keyhole-linear" width={16} className="mr-2" />
                Change Password
              </Button>
            </CardContent>
          </Card>
        </div>
      </main>

      {/* Change Password Dialog */}
      <Dialog open={changePasswordDialogOpen} onOpenChange={setChangePasswordDialogOpen}>
        <DialogContent className="bg-neutral-900 border-neutral-800 text-neutral-200">
          <DialogHeader>
            <DialogTitle className="text-white">Change Password</DialogTitle>
            <DialogDescription className="text-neutral-400">
              Update your account password
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleChangePassword} className="space-y-4 mt-4">
            <div>
              <Label htmlFor="currentPassword">Current Password</Label>
              <Input
                id="currentPassword"
                type="password"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                className="bg-neutral-800 border-neutral-700 text-white"
                required
              />
            </div>
            <div>
              <Label htmlFor="newPassword">New Password</Label>
              <Input
                id="newPassword"
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className="bg-neutral-800 border-neutral-700 text-white"
                minLength={6}
                required
              />
              <p className="text-xs text-neutral-500 mt-1">
                Must be at least 6 characters
              </p>
            </div>
            <div className="flex gap-3 justify-end">
              <Button
                type="button"
                variant="outline"
                onClick={() => setChangePasswordDialogOpen(false)}
                className="border-neutral-700 text-neutral-300 hover:bg-neutral-800"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={changingPassword}
                className="bg-neutral-800 text-white hover:bg-neutral-700"
              >
                {changingPassword ? "Changing..." : "Change Password"}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* Footer */}
      <footer className="mt-auto border-t border-neutral-900 bg-neutral-950 py-10">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-xs text-neutral-600">
            © 2024 AnymeX Inc. All rights reserved.
          </p>
          <div className="flex items-center gap-6">
            <Link
              href="/"
              className="text-xs text-neutral-500 hover:text-neutral-300 transition-colors"
            >
              Back to Themes
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
