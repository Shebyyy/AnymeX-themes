import { Icon } from "@iconify/react";
import { cn } from "@/lib/utils";

interface StatCardProps {
  icon: string;
  label: string;
  value: string | number;
  className?: string;
}

export function StatCard({ icon, label, value, className }: StatCardProps) {
  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center p-6 rounded-xl border border-neutral-800 bg-neutral-900/30 text-center",
        className
      )}
    >
      <div className="w-12 h-12 rounded-full bg-neutral-800 flex items-center justify-center mb-3">
        <Icon icon={icon} width={24} className="text-neutral-400" />
      </div>
      <div className="text-2xl font-semibold text-white mb-1">{value}</div>
      <div className="text-sm text-neutral-500">{label}</div>
    </div>
  );
}
