import { Button } from "@/components/ui/button";
import { Icon } from "@iconify/react";

interface Action {
  label: string;
  icon: string;
  variant?: "default" | "outline";
  onClick?: () => void;
  href?: string;
  badge?: string | number;
}

interface QuickActionButtonsProps {
  actions: Action[];
  className?: string;
}

export function QuickActionButtons({ actions, className }: QuickActionButtonsProps) {
  return (
    <div className={`flex flex-col sm:flex-row gap-3 ${className || ''}`}>
      {actions.map((action, index) => {
        const isPrimary = action.variant !== "outline";
        const isFirst = index === 0;
        
        return (
          <Button
            key={index}
            variant={action.variant || (isPrimary && isFirst ? "default" : "outline")}
            className={`flex-1 ${isPrimary && isFirst ? "bg-neutral-100 text-black hover:bg-white" : "border-neutral-700 text-neutral-300 hover:bg-neutral-800 hover:text-white"}`}
            onClick={action.onClick}
            asChild={action.href ? "a" : undefined}
            href={action.href}
          >
            {action.icon && <Icon icon={action.icon} width={16} className="mr-2" />}
            {action.label}
            {action.badge && (
              <span className="ml-2 px-2 py-0.5 rounded-full bg-neutral-800 text-white text-xs">
                {action.badge}
              </span>
            )}
          </Button>
        );
      })}
    </div>
  );
}
