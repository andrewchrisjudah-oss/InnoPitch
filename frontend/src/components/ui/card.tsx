import * as React from "react";
import { cn } from "../../lib/utils";
export const Card = ({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) => (
  <div
    className={cn(
      "rounded-2xl border border-white bg-white/90 text-[#0B0B0D] shadow-xl shadow-[#252329]/15 backdrop-blur-sm",
      className,
    )}
    {...props}
  />
);
export const CardHeader = ({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) => (
  <div className={cn("p-5 pb-3", className)} {...props} />
);
export const CardContent = ({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) => (
  <div className={cn("p-5 pt-2", className)} {...props} />
);
