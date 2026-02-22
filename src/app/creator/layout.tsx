"use client";

import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import { Icon } from "@iconify/react";

export default function CreatorLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const [loading, setLoading] = useState(true);

  const isLoginPage = pathname === "/creator/login";
  const isRegisterPage = pathname === "/creator/register";
  const isDashboardPage = pathname === "/creator/dashboard";

  useEffect(() => {
    const checkAuth = async () => {
      // Check if already logged in
      const creatorToken = localStorage.getItem("creator_token");
      const adminToken = localStorage.getItem("admin_token");
      const token = creatorToken || adminToken;
      const userStr = localStorage.getItem("creator_user") || localStorage.getItem("admin_user");

      if (isLoginPage || isRegisterPage) {
        // If on login/register page and already logged in, redirect to dashboard
        if (token && userStr) {
          router.push("/creator/dashboard");
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
          localStorage.removeItem("creator_token");
          localStorage.removeItem("admin_token");
          localStorage.removeItem("creator_user");
          localStorage.removeItem("admin_user");
          router.push("/auth");
          setLoading(false);
          return;
        }

        const data = await response.json();

        // Check if user has creator access
        const role = data.user.role;
        const isCreator = role === 'THEME_CREATOR' || role === 'ADMIN' || role === 'SUPER_ADMIN';

        if (!isCreator) {
          localStorage.removeItem("creator_token");
          localStorage.removeItem("admin_token");
          localStorage.removeItem("creator_user");
          localStorage.removeItem("admin_user");
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
  }, [isLoginPage, isRegisterPage, router]);

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
