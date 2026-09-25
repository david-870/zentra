import Link from "next/link";
import { cn } from "@/lib/cn";

type ButtonProps = {
  href: string;
  children: React.ReactNode;
  variant?: "primary" | "secondary" | "ghost";
  className?: string;
};

export function Button({ href, children, variant = "primary", className }: ButtonProps) {
  const styles = {
    primary: "bg-text text-black hover:bg-[#f1f7fe]",
    secondary: "border border-line bg-elevated text-text hover:border-text",
    ghost: "border border-line bg-bg text-text hover:bg-elevated",
  } as const;

  const classNames = cn(
    "font-ui inline-flex h-11 items-center justify-center rounded-lg px-4 text-sm font-medium transition-colors duration-200 sm:h-9",
    styles[variant],
    className,
  );

  if (href.startsWith("http://") || href.startsWith("https://")) {
    return (
      <a href={href} target="_blank" rel="noopener noreferrer" className={classNames}>
        {children}
      </a>
    );
  }

  return (
    <Link href={href} className={classNames}>
      {children}
    </Link>
  );
}
