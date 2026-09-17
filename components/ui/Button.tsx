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
    primary: "bg-white text-black hover:bg-text",
    secondary: "border border-line text-text hover:border-text",
    ghost: "text-text underline decoration-line underline-offset-4 hover:decoration-text",
  } as const;

  const classNames = cn(
    "inline-flex min-h-11 items-center justify-center px-5 text-[0.8125rem] font-medium tracking-[0.06em] uppercase transition-colors duration-200",
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
