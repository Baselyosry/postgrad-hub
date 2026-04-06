import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

const badgeVariants = cva(
  "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold tracking-tight transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
  {
    variants: {
      variant: {
        default: "border-transparent bg-header-navy text-white hover:bg-header-navy/85",
        secondary: "border-transparent bg-accent-green text-white hover:bg-accent-green/90",
        destructive: "border-transparent bg-destructive text-destructive-foreground hover:bg-destructive/80",
        outline:
          "border-header-navy/35 text-header-navy hover:border-accent-green hover:bg-notice-bg hover:text-accent-green",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  },
);

export interface BadgeProps extends React.HTMLAttributes<HTMLDivElement>, VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return <div className={cn(badgeVariants({ variant }), className)} {...props} />;
}

export { Badge, badgeVariants };
