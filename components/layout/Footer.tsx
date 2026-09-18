import Link from "next/link";
import { footerLinks } from "@/content/navigation";
import { site } from "@/content/site";
import { Logo } from "@/components/brand/Logo";
import { Container } from "@/components/ui/Container";

export function Footer() {
  return (
    <footer className="relative z-10 border-t border-line bg-bg">
      <Container className="py-12">
        <Link href="/#top" aria-label="Zentra home">
          <Logo />
        </Link>
        <p className="mt-2 max-w-xs text-sm text-muted">{site.description}</p>
      </Container>
      <Container className="flex flex-col gap-4 border-t border-line py-5 text-xs text-muted sm:flex-row sm:items-center sm:justify-between">
        <p>
          © {new Date().getFullYear()} {site.name}
        </p>
        <nav aria-label="Legal" className="flex flex-wrap gap-x-5 gap-y-2">
          {footerLinks.map((item) => (
            <Link key={item.label} href={item.href} className="hover:text-text">
              {item.label}
            </Link>
          ))}
        </nav>
      </Container>
    </footer>
  );
}
