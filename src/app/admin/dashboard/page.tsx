"use client";

import { useEffect, useState } from "react";
import { Icon } from "@iconify/react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";
import Link from "next/link";

interface Stats {
  totalUsers: number;
  totalThemes: number;
  pendingThemes: number;
  brokenThemes: number;
  approvedThemes: number;
}

export default function AdminDashboard() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      // Fetch users count
      const usersRes = await fetch("/api/admin/users", {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("admin_token")}`,
        },
      });
      const usersData = await usersRes.json();

      // Fetch themes count
      const themesRes = await fetch("/api/admin/themes", {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("admin_token")}`,
        },
      });
      const themesData = await themesRes.json();

      const themes = themesData.themes || [];

      setStats({
        totalUsers: usersData.users?.length || 0,
        totalThemes: themes.length,
        pendingThemes: themes.filter((t: any) => t.status === "PENDING").length,
        brokenThemes: themes.filter((t: any) => t.status === "BROKEN").length,
        approvedThemes: themes.filter((t: any) => t.status === "APPROVED").length,
      });
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to load dashboard stats",
      });
    } finally {
      setLoading(false);
    }
  };

  const statCards = [
    {
      title: "Total Users",
      value: stats?.totalUsers || 0,
      icon: "solar:users-group-rounded-bold",
      color: "bg-blue-500/10 text-blue-500",
      link: "/admin/users",
    },
    {
      title: "Total Themes",
      value: stats?.totalThemes || 0,
      icon: "solar:gallery-wide-bold",
      color: "bg-purple-500/10 text-purple-500",
      link: "/admin/themes",
    },
    {
      title: "Pending Themes",
      value: stats?.pendingThemes || 0,
      icon: "solar:clock-circle-bold",
      color: "bg-yellow-500/10 text-yellow-500",
      link: "/admin/themes?status=PENDING",
    },
    {
      title: "Broken Themes",
      value: stats?.brokenThemes || 0,
      icon: "solar:danger-triangle-bold",
      color: "bg-red-500/10 text-red-500",
      link: "/admin/themes?status=BROKEN",
    },
    {
      title: "Approved Themes",
      value: stats?.approvedThemes || 0,
      icon: "solar:check-circle-bold",
      color: "bg-green-500/10 text-green-500",
      link: "/admin/themes?status=APPROVED",
    },
  ];

  return (
    <div className="p-6 lg:p-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white mb-2">Dashboard</h1>
        <p className="text-neutral-400">
          Welcome to the AnymeX Admin Dashboard
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-6 mb-8">
        {loading
          ? Array.from({ length: 5 }).map((_, i) => (
              <Card key={i} className="border-neutral-800 bg-neutral-900/40">
                <CardHeader className="pb-3">
                  <Skeleton className="h-4 w-24" />
                </CardHeader>
                <CardContent>
                  <Skeleton className="h-8 w-16" />
                </CardContent>
              </Card>
            ))
          : statCards.map((stat) => (
              <Link key={stat.title} href={stat.link}>
                <Card className="border-neutral-800 bg-neutral-900/40 hover:border-neutral-700 hover:bg-neutral-900/60 transition-all cursor-pointer">
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-sm font-medium text-neutral-400">
                        {stat.title}
                      </CardTitle>
                      <div className={`p-2 rounded-lg ${stat.color}`}>
                        <Icon icon={stat.icon} width={20} />
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="text-3xl font-bold text-white">
                      {stat.value}
                    </div>
                  </CardContent>
                </Card>
              </Link>
            ))}
      </div>

      {/* Quick Actions */}
      <Card className="border-neutral-800 bg-neutral-900/40">
        <CardHeader>
          <CardTitle className="text-white">Quick Actions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <Link href="/admin/users?action=create">
              <button className="w-full flex items-center gap-3 p-4 rounded-xl border border-neutral-800 bg-neutral-900/60 hover:border-neutral-700 hover:bg-neutral-800 transition-all">
                <div className="p-2 rounded-lg bg-green-500/10 text-green-500">
                  <Icon icon="solar:user-plus-bold" width={20} />
                </div>
                <div className="text-left">
                  <p className="text-sm font-medium text-white">Create User</p>
                  <p className="text-xs text-neutral-500">Add new admin user</p>
                </div>
              </button>
            </Link>

            <Link href="/admin/themes?status=PENDING">
              <button className="w-full flex items-center gap-3 p-4 rounded-xl border border-neutral-800 bg-neutral-900/60 hover:border-neutral-700 hover:bg-neutral-800 transition-all">
                <div className="p-2 rounded-lg bg-yellow-500/10 text-yellow-500">
                  <Icon icon="solar:check-read-bold" width={20} />
                </div>
                <div className="text-left">
                  <p className="text-sm font-medium text-white">Review Themes</p>
                  <p className="text-xs text-neutral-500">
                    Approve pending themes
                  </p>
                </div>
              </button>
            </Link>

            <Link href="/admin/themes?status=BROKEN">
              <button className="w-full flex items-center gap-3 p-4 rounded-xl border border-neutral-800 bg-neutral-900/60 hover:border-neutral-700 hover:bg-neutral-800 transition-all">
                <div className="p-2 rounded-lg bg-red-500/10 text-red-500">
                  <Icon icon="solar:trash-bin-minimalistic-bold" width={20} />
                </div>
                <div className="text-left">
                  <p className="text-sm font-medium text-white">Clean Broken</p>
                  <p className="text-xs text-neutral-500">
                    Remove broken themes
                  </p>
                </div>
              </button>
            </Link>

            <Link href="/">
              <button className="w-full flex items-center gap-3 p-4 rounded-xl border border-neutral-800 bg-neutral-900/60 hover:border-neutral-700 hover:bg-neutral-800 transition-all">
                <div className="p-2 rounded-lg bg-blue-500/10 text-blue-500">
                  <Icon icon="solar:export-bold" width={20} />
                </div>
                <div className="text-left">
                  <p className="text-sm font-medium text-white">View Site</p>
                  <p className="text-xs text-neutral-500">
                    Go to main website
                  </p>
                </div>
              </button>
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
