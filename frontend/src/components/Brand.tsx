import { cn } from "../lib/utils";

export function KnomoMascot({ className }: { className?: string }) {
  return (
    <img
      src="/knomo-seal-logo.png"
      alt="KNOMO plushie mascot"
      className={cn("rounded-2xl object-cover", className)}
    />
  );
}

export function KnomoBrand({ compact = false }: { compact?: boolean }) {
  return (
    <div className="flex items-center gap-3">
      <KnomoMascot className={compact ? "size-9" : "size-11"} />
      <div>
        <div
          className={
            compact
              ? "text-xl font-black tracking-tight text-white"
              : "text-2xl font-black tracking-tight text-white"
          }
        >
          KNOMO
        </div>
        <div className="text-[9px] font-bold uppercase tracking-[.24em] text-[#C98F9F]">
          Know more. Scroll less.
        </div>
      </div>
    </div>
  );
}
