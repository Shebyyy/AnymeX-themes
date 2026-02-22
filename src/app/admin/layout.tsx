"use client";

import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import { Icon } from "@iconify/react";
import { checkAuth } from "@/lib/auth";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const [loading, setLoading] = useState(true);

  const isLoginPage = pathname === "/admin/login";

  useEffect(() => {
    if (!isLoginPage) {
      checkAuth();
    } else {
      // Check if already logged in (no async operations here)
      const creatorToken = localStorage.getItem("creator_token");
      const adminToken = localStorage.getItem("admin_token");
      const userStr = localStorage.getItem("creator_user") || localStorage.getItem("admin_user");
      const token = creatorToken || adminToken;
      
      if (token && userStr) {
        // Check if user has admin access
        const role = (userStr && JSON.parse(userStr)).role;
        const isAdmin = role === 'ADMIN' || role === 'SUPER_ADMIN';
        if (isAdmin) {
          router.push("/admin/dashboard");
        }
      }
      setLoading(false);
    }
  }, [isLoginPage, router]);

  const checkAuth = async () => {
    const creatorToken = localStorage.getItem("creator_token");
    const adminToken = localStorage.getItem("admin_token");
    const token = adminToken || creatorToken;
    const userStr = localStorage.getItem("admin_user") || localStorage.getItem("creator_user");

    if (!token || !userStr) {
      router.push("/auth");
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
        localStorage.removeItem("creator_token");
        localStorage.removeItem("admin_user");
        localStorage.removeItem("creator_user");
        router.push("/auth");
        return;
      }

      const data = await response.json();

      // Check if user has admin access
      const role = data.user.role;
      const isAdmin = role === 'ADMIN' || role === 'SUPER_ADMIN';

      if (!isAdmin) {
        localStorage.removeItem("admin_token");
        localStorage.removeItem("creator_token");
        localStorage.removeItem("admin_user");
        localStorage.removeItem("creator_user");
        router.push("/auth");
        return;
      }

      router.push("/admin/dashboard");
    } catch (error) {
      console.error("Auth check error:", error);
      router.push("/auth");
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-neutral-950 flex items-center justify-center">
        <Icon icon="solar:loading-circle-linear" className="animate-spin text-white" width={48} />
      </div>
    );

  }

  // If not logged in and not on login page, auth check will handle redirect
  if (!isLoginPage) {
    return null;
  }

  // Render login page as-is, redirect dashboard to new page
  if (isLoginPage) {
    return children;
  }

  // Dashboard - redirect to new page
  router.push("/admin/dashboard");
  return null;
}
