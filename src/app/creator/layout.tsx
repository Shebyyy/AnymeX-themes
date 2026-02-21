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
import Link from "next/link";

interface User {
  id: string;
  username: string;
  role: string;
}

export default function CreatorLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  const isLoginPage = pathname === "/creator/login";
  const isRegisterPage = pathname === "/creator/register";

  useEffect(() => {
    if (!isLoginPage && !isRegisterPage) {
      checkAuth();
    } else {
      // Check if already logged in when on login/register page
      const token = localStorage.getItem("creator_token");
      const userStr = localStorage.getItem("creator_user");
      if (token && userStr) {
        router.push("/creator/dashboard");
      }
      setLoading(false);
    }
  }, [isLoginPage, isRegisterPage, router]);

  const checkAuth = async () => {
    const token = localStorage.getItem("creator_token");
    const userStr = localStorage.getItem("creator_user");

    if (!token || !userStr) {
      router.push("/creator/login");
      return;
    }

    try {
      const response = await fetch("/api/auth/me", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        localStorage.removeItem("creator_token");
        localStorage.removeItem("creator_user");
        router.push("/creator/login");
        return;
      }

      const data = await response.json();
      
      // Check if user has creator access
      const role = data.user.role;
      const isCreator = role === 'THEME_CREATOR' || role === 'ADMIN' || role === 'SUPER_ADMIN';
      
      if (!isCreator) {
        localStorage.removeItem("creator_token");
        localStorage.removeItem("creator_user");
        router.push("/creator/login");
        return;
      }

      setUser(data.user);
    } catch (error) {
      console.error("Auth check error:", error);
      router.push("/creator/login");
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    const token = localStorage.getItem("creator_token");

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
      localStorage.removeItem("creator_token");
      localStorage.removeItem("creator_user");
      router.push("/creator/login");
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-neutral-950 flex items-center justify-center">
        <Icon icon="solar:loading-circle-linear" className="animate-spin text-white" width={48} />
      </div>
    );
  }

  if (!user && !isLoginPage && !isRegisterPage) {
    return null;
  }

  if (isLoginPage || isRegisterPage) {
    return children;
  }

  const navItems = [
    {
      href: "/",
      icon: "solar:home-2-linear",
      label: "Back to Home",
    },
    {
      href: "/profile",
      icon: "solar:user-circle-linear",
      label: "Profile",
    },
    {
      href: "/creator/dashboard",
      icon: "solar:widget-4-linear",
      label: "My Themes",
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
              Creator Hub
            </span>
          </div>

          {/* Navigation */}
          <nav className="flex-1 p-4 space-y-1">
            {navItems.map((item) => {
              const isActive = pathname === item.href;
              const isHome = item.href === "/";
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm font-medium transition-all ${
                    isHome
                      ? "text-indigo-400 hover:text-indigo-300 hover:bg-indigo-500/10 border border-indigo-500/20"
                      : isActive
                        ? "bg-white text-black"
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
                  onClick={handleLogout}
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
                Creator Hub
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
                  onClick={handleLogout}
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
    </div>
  );
}
