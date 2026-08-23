import * as AvatarPrimitive from "@radix-ui/react-avatar";
import { cn } from "../../lib/utils";
export const Avatar = ({
  className,
  ...props
}: React.ComponentProps<typeof AvatarPrimitive.Root>) => (
  <AvatarPrimitive.Root
    className={cn(
      "relative flex size-10 shrink-0 overflow-hidden rounded-full border border-white/10",
      className,
    )}
    {...props}
  />
);
export const AvatarImage = (
  props: React.ComponentProps<typeof AvatarPrimitive.Image>,
) => <AvatarPrimitive.Image className="size-full object-cover" {...props} />;
export const AvatarFallback = ({
  className,
  ...props
}: React.ComponentProps<typeof AvatarPrimitive.Fallback>) => (
  <AvatarPrimitive.Fallback
    className={cn(
      "flex size-full items-center justify-center bg-gradient-to-br from-fuchsia-500 to-indigo-500 font-bold text-white",
      className,
    )}
    {...props}
  />
);
