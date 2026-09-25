import Link from "next/link";
import { footerLinks } from "@/content/navigation";
import { site } from "@/content/site";
import { Logo } from "@/components/brand/Logo";
import { Container } from "@/components/ui/Container";

export function Footer() {
  return (
    <footer className="relative z-10 bg-bg">
      <Container className="py-16">
        <Link href="/#top" aria-label="Zentra home">
          <Logo />
        </Link>
        <p className="mt-4 max-w-xs text-sm text-muted">{site.description}</p>
        <nav aria-label="Legal" className="mt-8 flex flex-wrap gap-x-6 gap-y-2 text-sm text-ash">
          {footerLinks.map((item) => (
            <Link key={item.label} href={item.href} className="hover:text-text">
              {item.label}
            </Link>
          ))}
        </nav>
      </Container>
      <Container className="border-t border-hairline py-5">
        <p className="text-xs text-ash">
          © {new Date().getFullYear()} {site.name}
        </p>
      </Container>
    </footer>
  );
}
