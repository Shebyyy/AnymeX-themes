import Link from "next/link";
import { cn } from "@/lib/utils";

interface DashboardTab {
  id: string;
  label: string;
  href: string;
}

interface DashboardTabsProps {
  tabs: DashboardTab[];
  activeTab: string;
}

export function DashboardTabs({ tabs, activeTab }: DashboardTabsProps) {
  return (
    <div className="border-b border-neutral-800 mb-6 overflow-x-auto">
      <div className="flex gap-2 min-w-max">
        {tabs.map((tab) => {
          const isActive = activeTab === tab.id;
          return (
            <Link
              key={tab.id}
              href={tab.href}
              className={cn(
                "px-4 py-2 text-sm font-medium transition-all rounded-full",
                isActive
                  ? "bg-white text-black shadow-sm"
                  : "text-neutral-400 hover:text-white hover:bg-neutral-800"
              )}
            >
              {tab.label}
            </Link>
          );
        })}
      </div>
    </div>
  );
}
