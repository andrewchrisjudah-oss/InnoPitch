import * as ProgressPrimitive from "@radix-ui/react-progress";
export function Progress({ value = 0 }: { value?: number }) {
  return (
    <ProgressPrimitive.Root
      value={value}
      className="relative h-2 overflow-hidden rounded-full bg-white/[.07]"
    >
      <ProgressPrimitive.Indicator
        className="h-full bg-gradient-to-r from-fuchsia-500 via-rose-500 to-orange-400 transition-transform duration-500"
        style={{ transform: `translateX(-${100 - value}%)` }}
      />
    </ProgressPrimitive.Root>
  );
}
