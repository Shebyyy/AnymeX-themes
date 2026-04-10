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
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
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
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

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

  const handleLogout = async () => {
    const creatorToken = localStorage.getItem("creator_token");
    const adminToken = localStorage.getItem("admin_token");
    const token = creatorToken || adminToken;

    try {
      if (token) {
        await fetch("/api/auth/logout", {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
      }
    } catch (error) {
      console.error("Logout error:", error);
    } finally {
      localStorage.removeItem("creator_token");
      localStorage.removeItem("admin_token");
      localStorage.removeItem("creator_user");
      localStorage.removeItem("admin_user");
      router.push("/");
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
        title: "Profile updated successfully!",
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
        title: "Password changed successfully!",
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
      <div className="min-h-screen bg-background text-foreground font-sans antialiased flex items-center justify-center">
        <Icon icon="solar:loading-circle-linear" className="animate-spin text-primary" width={48} />
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-background text-foreground font-sans antialiased flex flex-col">
      {/* Ambient Glow */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none z-0" aria-hidden="true">
        <div className="glow-orb glow-orb-violet w-[500px] h-[350px] top-[-5%] left-[15%] animate-float-slow" />
        <div className="glow-orb glow-orb-cyan w-[400px] h-[300px] top-[10%] right-[10%] animate-float-slow" style={{ animationDelay: "3s" }} />
      </div>

      {/* Navigation */}
      <nav className="glass-nav fixed top-5 left-1/2 -translate-x-1/2 z-50 w-[94%] max-w-5xl rounded-2xl transition-all">
        <div className="px-4 sm:px-6 pl-2">
          <div className="flex h-14 items-center justify-between gap-4">
            {/* Logo */}
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

            {/* Right Actions */}
            <div className="flex items-center gap-1">
              {/* Desktop Navigation */}
              <div className="hidden md:flex items-center gap-1">
              <a
                href="/"
                className="flex items-center gap-2 px-4 py-2 text-xs font-medium text-muted-foreground hover:text-foreground transition-colors duration-200"
              >
                Themes
              </a>
              <a
                href="/docs"
                className="flex items-center gap-2 px-4 py-2 text-xs font-medium text-muted-foreground hover:text-foreground transition-colors duration-200"
              >
                Docs
              </a>

              {/* Profile Dropdown */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button className="flex items-center gap-2 px-4 py-2 text-xs font-medium text-muted-foreground hover:text-foreground transition-colors duration-200 cursor-pointer">
                    <Icon icon="solar:user-circle-linear" width={16} />
                    {user?.username || "Profile"}
                    <Icon icon="solar:alt-arrow-down-linear" width={14} />
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="glass-surface min-w-[180px] border-border/50">
                  <DropdownMenuItem asChild>
                    <Link href="/profile" className="cursor-pointer text-foreground/80 hover:text-foreground flex items-center gap-2">
                      <Icon icon="solar:user-linear" width={14} />
                      My Profile
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link href="/dashboard" className="cursor-pointer text-foreground/80 hover:text-foreground flex items-center gap-2">
                      <Icon icon="solar:palette-bold" width={14} />
                      Dashboard
                    </Link>
                  </DropdownMenuItem>
                  {(user?.role === 'ADMIN' || user?.role === 'SUPER_ADMIN') && (
                    <>
                      <DropdownMenuItem asChild>
                        <Link href="/admin/users" className="cursor-pointer text-foreground/80 hover:text-foreground flex items-center gap-2">
                          <Icon icon="solar:users-group-rounded-bold" width={14} />
                          Manage Users
                        </Link>
                      </DropdownMenuItem>
                      <DropdownMenuItem asChild>
                        <Link href="/admin/themes" className="cursor-pointer text-foreground/80 hover:text-foreground flex items-center gap-2">
                          <Icon icon="solar:gallery-wide-bold" width={14} />
                          Theme Approvals
                        </Link>
                      </DropdownMenuItem>
                    </>
                  )}
                  <DropdownMenuSeparator className="bg-border/50" />
                  <DropdownMenuItem
                    onClick={handleLogout}
                    className="cursor-pointer text-destructive hover:text-destructive flex items-center gap-2"
                  >
                    <Icon icon="solar:logout-2-linear" width={14} />
                    Logout
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
              <div className="h-4 w-px bg-border/50 mx-2"></div>
              <a
                href="https://github.com/RyanYuuki/AnymeX"
                target="_blank"
                rel="noopener noreferrer"
                className="btn-violet rounded-full px-5 py-2 text-xs font-semibold inline-flex items-center justify-center cursor-pointer"
              >
                Get App
              </a>
              </div>

              {/* Mobile Menu */}
              <div className="flex md:hidden">
                <DropdownMenu open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
                  <DropdownMenuTrigger asChild>
                    <button className="flex items-center gap-2 px-3 py-2 text-xs font-medium text-muted-foreground hover:text-foreground transition-colors cursor-pointer">
                      <Icon icon="solar:hamburger-menu-linear" width={20} />
                    </button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="glass-surface min-w-[200px] border-border/50">
                    <DropdownMenuItem asChild>
                      <a href="/docs" className="cursor-pointer text-foreground/80 hover:text-foreground">
                        Docs
                      </a>
                    </DropdownMenuItem>
                    <DropdownMenuSeparator className="bg-border/50" />
                    <DropdownMenuItem asChild>
                      <Link href="/profile" className="cursor-pointer text-foreground/80 hover:text-foreground flex items-center gap-2">
                        <Icon icon="solar:user-linear" width={14} />
                        My Profile
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <Link href="/dashboard" className="cursor-pointer text-foreground/80 hover:text-foreground flex items-center gap-2">
                        <Icon icon="solar:palette-bold" width={14} />
                        Dashboard
                      </Link>
                    </DropdownMenuItem>
                    {(user?.role === 'ADMIN' || user?.role === 'SUPER_ADMIN') && (
                      <>
                        <DropdownMenuItem asChild>
                          <Link href="/admin/users" className="cursor-pointer text-foreground/80 hover:text-foreground flex items-center gap-2">
                            <Icon icon="solar:users-group-rounded-bold" width={14} />
                            Manage Users
                          </Link>
                        </DropdownMenuItem>
                        <DropdownMenuItem asChild>
                          <Link href="/admin/themes" className="cursor-pointer text-foreground/80 hover:text-foreground flex items-center gap-2">
                            <Icon icon="solar:gallery-wide-bold" width={14} />
                            Theme Approvals
                          </Link>
                        </DropdownMenuItem>
                      </>
                    )}
                    <DropdownMenuSeparator className="bg-border/50" />
                    <DropdownMenuItem
                      onClick={handleLogout}
                      className="cursor-pointer text-destructive hover:text-destructive flex items-center gap-2"
                    >
                      <Icon icon="solar:logout-2-linear" width={14} />
                      Logout
                    </DropdownMenuItem>
                    <DropdownMenuSeparator className="bg-border/50" />
                    <DropdownMenuItem asChild>
                      <a
                        href="https://github.com/RyanYuuki/AnymeX"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="cursor-pointer text-foreground font-medium"
                      >
                        Get App
                      </a>
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="relative z-10 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10 pt-28 flex-1">
        <div className="mb-8 animate-fade-in-up">
          <h1 className="text-3xl md:text-4xl font-bold tracking-tight gradient-text mb-3">
            Profile Settings
          </h1>
          <p className="text-muted-foreground">
            Manage your account information and preferences
          </p>
        </div>

        <div className="space-y-6">
          {/* Profile Information Card */}
          <Card className="glass-surface animate-fade-in-up" style={{ animationDelay: "100ms" }}>
            <CardHeader>
              <CardTitle className="text-foreground">Profile Information</CardTitle>
              <CardDescription className="text-muted-foreground">
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
                    className="bg-card/50 border-border/50 text-foreground input-glow"
                    required
                    minLength={3}
                  />
                  <p className="text-xs text-muted-foreground/60 mt-1">
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
                    className="bg-card/50 border-border/50 text-foreground input-glow"
                    placeholder="https://github.com/yourusername"
                  />
                  <p className="text-xs text-muted-foreground/60 mt-1">
                    Link to your GitHub, social media, or personal website
                  </p>
                  {user.profileUrl && (
                    <p className="text-xs text-muted-foreground mt-2">
                      Current URL:{" "}
                      <a
                        href={user.profileUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-primary hover:text-primary/80 underline"
                      >
                        {user.profileUrl}
                      </a>
                    </p>
                  )}
                </div>
                <div className="flex justify-end pt-4">
                  <Button
                    type="submit"
                    disabled={saving}
                    className="btn-violet cursor-pointer"
                  >
                    {saving ? "Saving..." : "Save Changes"}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>

          {/* Account Information Card */}
          <Card className="glass-surface animate-fade-in-up" style={{ animationDelay: "200ms" }}>
            <CardHeader>
              <CardTitle className="text-foreground">Account Information</CardTitle>
              <CardDescription className="text-muted-foreground">
                Your account details (read-only)
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label className="text-muted-foreground">Role</Label>
                <p className="text-foreground mt-1">{user.role.replace(/_/g, ' ')}</p>
              </div>
              <div>
                <Label className="text-muted-foreground">Account Created</Label>
                <p className="text-foreground mt-1">
                  {new Date(user.createdAt).toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                  })}
                </p>
              </div>
              <div>
                <Label className="text-muted-foreground">User ID</Label>
                <p className="text-foreground mt-1 font-mono text-sm">{user.id}</p>
              </div>
            </CardContent>
          </Card>

          {/* Security Card */}
          <Card className="glass-surface animate-fade-in-up" style={{ animationDelay: "300ms" }}>
            <CardHeader>
              <CardTitle className="text-foreground">Security</CardTitle>
              <CardDescription className="text-muted-foreground">
                Manage your account security settings
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button
                variant="outline"
                onClick={() => setChangePasswordDialogOpen(true)}
                className="border-border/50 text-foreground/70 hover:bg-card/50 hover:text-foreground cursor-pointer"
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
        <DialogContent className="glass-surface border-border/50 text-foreground">
          <DialogHeader>
            <DialogTitle className="text-foreground">Change Password</DialogTitle>
            <DialogDescription className="text-muted-foreground">
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
                className="bg-card/50 border-border/50 text-foreground input-glow"
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
                className="bg-card/50 border-border/50 text-foreground input-glow"
                minLength={6}
                required
              />
              <p className="text-xs text-muted-foreground/60 mt-1">
                Must be at least 6 characters
              </p>
            </div>
            <div className="flex gap-3 justify-end">
              <Button
                type="button"
                variant="outline"
                onClick={() => setChangePasswordDialogOpen(false)}
                className="border-border/50 text-foreground/70 hover:bg-card/50 cursor-pointer"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={changingPassword}
                className="btn-violet cursor-pointer"
              >
                {changingPassword ? "Changing..." : "Change Password"}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* Footer */}
      <footer className="mt-auto border-t border-border/30 bg-card/10 backdrop-blur-sm py-10">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-xs text-muted-foreground/50">
            &copy; 2025 AnymeX. All rights reserved.
          </p>
          <div className="flex items-center gap-6">
            <Link
              href="/"
              className="text-xs text-muted-foreground/50 hover:text-foreground/70 transition-colors duration-200"
            >
              Back to Themes
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
