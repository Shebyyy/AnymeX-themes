"use client";

import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import { Icon } from "@iconify/react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import Link from "next/link";

interface User {
  id: string;
  username: string;
  role: string;
}

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const { toast } = useToast();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [logoutDialogOpen, setLogoutDialogOpen] = useState(false);
  const [changePasswordDialogOpen, setChangePasswordDialogOpen] = useState(false);
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [changingPassword, setChangingPassword] = useState(false);

  // Skip auth check for login page
  const isLoginPage = pathname === "/admin/login";

  useEffect(() => {
    if (!isLoginPage) {
      checkAuth();
    } else {
      // Check if already logged in when on login page
      const token = localStorage.getItem("admin_token");
      const userStr = localStorage.getItem("admin_user");
      if (token && userStr) {
        // Already logged in, redirect to dashboard
        router.push("/admin/dashboard");
      }
      setLoading(false);
    }
  }, [isLoginPage]);

  const checkAuth = async () => {
    const token = localStorage.getItem("admin_token");
    const userStr = localStorage.getItem("admin_user");

    if (!token || !userStr) {
      router.push("/admin/login");
      return;
    }

    try {
      const response = await fetch("/api/auth/me", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        localStorage.removeItem("admin_token");
        localStorage.removeItem("admin_user");
        router.push("/admin/login");
        return;
      }

      const data = await response.json();

      // Check if user has admin access
      const role = data.user.role;
      const isAdmin = role === 'ADMIN' || role === 'SUPER_ADMIN';

      if (!isAdmin) {
        localStorage.removeItem("admin_token");
        localStorage.removeItem("admin_user");
        router.push("/admin/login");
        return;
      }

      setUser(data.user);
    } catch (error) {
      console.error("Auth check error:", error);
      router.push("/admin/login");
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    const token = localStorage.getItem("admin_token");

    try {
      await fetch("/api/auth/logout", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
    } catch (error) {
      console.error("Logout error:", error);
    } finally {
      localStorage.removeItem("admin_token");
      localStorage.removeItem("admin_user");
      router.push("/admin/login");
      toast({
        title: "Logged out successfully",
      });
    }
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setChangingPassword(true);

    const token = localStorage.getItem("admin_token");

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
      <div className="min-h-screen bg-neutral-950 flex items-center justify-center">
        <Icon icon="solar:loading-circle-linear" className="animate-spin text-white" width={48} />
      </div>
    );
  }

  // If not logged in and not on login page, return null (redirect handled in checkAuth)
  if (!user && !isLoginPage) {
    return null;
  }

  // On login page, just render children without the admin UI
  if (isLoginPage) {
    return children;
  }

  const isAdmin = user.role === "ADMIN" || user.role === "SUPER_ADMIN";

  const navItems = [
    {
      href: "/admin/dashboard",
      icon: "solar:widget-4-linear",
      label: "Dashboard",
    },
    ...(isAdmin
      ? [
          {
            href: "/admin/users",
            icon: "solar:users-group-rounded-linear",
            label: "Users",
          },
          {
            href: "/admin/themes",
            icon: "solar:gallery-wide-linear",
            label: "Themes",
          },
        ]
      : []),
    {
      href: "/creator/dashboard",
      icon: "solar:palette-bold",
      label: "Creator Hub",
    },
  ];

  return (
    <div className="min-h-screen bg-neutral-950 text-neutral-300 font-sans antialiased">
      {/* Sidebar */}
      <aside className="fixed left-0 top-0 bottom-0 w-64 border-r border-neutral-800 bg-neutral-900/60 backdrop-blur-xl z-40 hidden lg:block">
        <div className="flex flex-col h-full">
          {/* Logo */}
          <div className="flex items-center gap-2 p-6 border-b border-neutral-800">
            <div className="flex items-center justify-center w-8 h-8 rounded-full bg-white text-black">
              <Icon icon="solar:play-stream-bold" width={18} />
            </div>
            <span className="text-sm font-semibold tracking-tight text-white">
              AnymeX Admin
            </span>
          </div>

          {/* Navigation */}
          <nav className="flex-1 p-4 space-y-1">
            {navItems.map((item) => {
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm font-medium transition-all ${
                    isActive
                      ? "bg-neutral-800 text-white"
                      : "text-neutral-400 hover:text-white hover:bg-neutral-800"
                  }`}
                >
                  <Icon icon={item.icon} width={18} />
                  {item.label}
                </Link>
              );
            })}
          </nav>

          {/* User Section */}
          <div className="p-4 border-t border-neutral-800">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  className="w-full justify-start gap-3 text-neutral-300 hover:text-white hover:bg-neutral-800"
                >
                  <div className="flex items-center justify-center w-8 h-8 rounded-full bg-neutral-800 text-white">
                    <Icon icon="solar:user-linear" width={18} />
                  </div>
                  <div className="flex-1 text-left">
                    <p className="text-sm font-medium text-white">
                      {user.username}
                    </p>
                    <p className="text-xs text-neutral-500">{user.role}</p>
                  </div>
                  <Icon icon="solar:alt-arrow-down-linear" width={16} />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56 bg-neutral-900 border-neutral-800">
                <DropdownMenuLabel className="text-neutral-200">
                  My Account
                </DropdownMenuLabel>
                <DropdownMenuSeparator className="bg-neutral-800" />
                <DropdownMenuItem
                  onClick={() => setChangePasswordDialogOpen(true)}
                  className="text-neutral-300 hover:text-white hover:bg-neutral-800 cursor-pointer"
                >
                  <Icon icon="solar:lock-keyhole-linear" width={16} className="mr-2" />
                  Change Password
                </DropdownMenuItem>
                <DropdownMenuSeparator className="bg-neutral-800" />
                <DropdownMenuItem
                  onClick={() => setLogoutDialogOpen(true)}
                  className="text-red-400 hover:text-red-300 hover:bg-neutral-800 cursor-pointer"
                >
                  <Icon icon="solar:logout-2-linear" width={16} className="mr-2" />
                  Logout
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <div className="lg:pl-64">
        {/* Mobile Header */}
        <header className="sticky top-0 z-30 border-b border-neutral-800 bg-neutral-900/80 backdrop-blur-xl lg:hidden">
          <div className="flex items-center justify-between px-4 py-3">
            <div className="flex items-center gap-2">
              <div className="flex items-center justify-center w-8 h-8 rounded-full bg-white text-black">
                <Icon icon="solar:play-stream-bold" width={18} />
              </div>
              <span className="text-sm font-semibold tracking-tight text-white">
                AnymeX Admin
              </span>
            </div>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="text-neutral-300">
                  <Icon icon="solar:hamburger-menu-linear" width={24} />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56 bg-neutral-900 border-neutral-800">
                {navItems.map((item) => (
                  <DropdownMenuItem key={item.href} asChild>
                    <Link
                      href={item.href}
                      className={`text-neutral-300 hover:text-white hover:bg-neutral-800 cursor-pointer flex items-center gap-2 ${
                        pathname === item.href ? "bg-neutral-800" : ""
                      }`}
                    >
                      <Icon icon={item.icon} width={16} />
                      {item.label}
                    </Link>
                  </DropdownMenuItem>
                ))}
                <DropdownMenuSeparator className="bg-neutral-800" />
                <DropdownMenuItem
                  onClick={() => setChangePasswordDialogOpen(true)}
                  className="text-neutral-300 hover:text-white hover:bg-neutral-800 cursor-pointer"
                >
                  <Icon icon="solar:lock-keyhole-linear" width={16} className="mr-2" />
                  Change Password
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => setLogoutDialogOpen(true)}
                  className="text-red-400 hover:text-red-300 hover:bg-neutral-800 cursor-pointer"
                >
                  <Icon icon="solar:logout-2-linear" width={16} className="mr-2" />
                  Logout
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </header>

        {/* Page Content */}
        <main>{children}</main>
      </div>

      {/* Logout Confirmation Dialog */}
      <Dialog open={logoutDialogOpen} onOpenChange={setLogoutDialogOpen}>
        <DialogContent className="bg-neutral-900 border-neutral-800 text-neutral-200">
          <DialogHeader>
            <DialogTitle className="text-white">Confirm Logout</DialogTitle>
            <DialogDescription className="text-neutral-400">
              Are you sure you want to logout from your admin account?
            </DialogDescription>
          </DialogHeader>
          <div className="flex gap-3 justify-end mt-4">
            <Button
              variant="outline"
              onClick={() => setLogoutDialogOpen(false)}
              className="border-neutral-700 text-neutral-300 hover:bg-neutral-800"
            >
              Cancel
            </Button>
            <Button
              onClick={handleLogout}
              className="bg-red-600 text-white hover:bg-red-700"
            >
              Logout
            </Button>
          </div>
        </DialogContent>
      </Dialog>

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
    </div>
  );
}
