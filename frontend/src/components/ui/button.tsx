import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "../../lib/utils";

const variants = cva(
  "inline-flex items-center justify-center gap-2 rounded-xl text-sm font-semibold transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-fuchsia-400 disabled:pointer-events-none disabled:opacity-50 active:scale-[.98]",
  {
    variants: {
      variant: {
        default: "bg-[#F7F1EE] text-[#0B0B0D] hover:bg-white",
        accent:
          "bg-gradient-to-r from-[#C98F9F] to-[#6B1F3A] text-[#0B0B0D] shadow-lg shadow-[#0B0B0D]/40 hover:brightness-110",
        secondary:
          "border border-[#C98F9F] bg-white text-[#0B0B0D] hover:bg-[#F7F1EE]",
        ghost: "text-[#252329] hover:bg-[#F7F1EE] hover:text-[#0B0B0D]",
      },
      size: {
        default: "h-10 px-4",
        sm: "h-8 px-3 text-xs",
        icon: "size-10 p-0",
      },
    },
    defaultVariants: { variant: "default", size: "default" },
  },
);
export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof variants> {}
export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, ...props }, ref) => (
    <button
      ref={ref}
      className={cn(variants({ variant, size }), className)}
      {...props}
    />
  ),
);
