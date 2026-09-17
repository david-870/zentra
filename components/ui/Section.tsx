import { cn } from "@/lib/cn";

export function Section({
  id,
  children,
  className,
}: {
  id?: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <section id={id} className={cn("scroll-mt-24 py-14 sm:py-24 lg:py-28", className)}>
      {children}
    </section>
  );
}
