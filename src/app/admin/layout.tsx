"use client";

import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import { Icon } from "@iconify/react";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const [loading, setLoading] = useState(true);

  const isLoginPage = pathname === "/admin/login";
  const isDashboardPage = pathname === "/admin/dashboard";

  useEffect(() => {
    const checkAuth = async () => {
      // Check if already logged in
      const creatorToken = localStorage.getItem("creator_token");
      const adminToken = localStorage.getItem("admin_token");
      const token = adminToken || creatorToken;
      const userStr = localStorage.getItem("admin_user") || localStorage.getItem("creator_user");

      if (isLoginPage) {
        // If on login page and already logged in as admin, redirect to dashboard
        if (token && userStr) {
          try {
            const role = (userStr && JSON.parse(userStr)).role;
            const isAdmin = role === 'ADMIN' || role === 'SUPER_ADMIN';
            if (isAdmin) {
              router.push("/admin/dashboard");
            }
          } catch (e) {
            // Invalid user data, ignore
          }
        }
        setLoading(false);
        return;
      }

      // For dashboard and other protected pages, verify auth
      if (!token || !userStr) {
        router.push("/auth");
        setLoading(false);
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
          setLoading(false);
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
          setLoading(false);
          return;
        }

        // Auth successful
      } catch (error) {
        console.error("Auth check error:", error);
        router.push("/auth");
      } finally {
        setLoading(false);
      }
    };

    checkAuth();
  }, [isLoginPage, router]);

  if (loading) {
    return (
      <div className="min-h-screen bg-neutral-950 flex items-center justify-center">
        <Icon icon="solar:loading-circle-linear" className="animate-spin text-white" width={48} />
      </div>
    );
  }

  // Always render children (let the page handle auth internally)
  return <>{children}</>;
}
