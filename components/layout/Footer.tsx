import Link from "next/link";
import { navLinks } from "@/content/navigation";
import { site } from "@/content/site";
import { Container } from "@/components/ui/Container";
import { whatsappHref } from "@/lib/whatsapp";

export function Footer() {
  return (
    <footer className="border-t border-line">
      <Container className="flex flex-col gap-8 py-12 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <p className="font-display text-xl">{site.name}</p>
          <p className="mt-2 max-w-xs text-sm text-muted">{site.description}</p>
        </div>
        <ul className="flex flex-wrap gap-5 text-sm">
          {navLinks.map((item) => (
            <li key={item.href}>
              <Link href={item.href} className="hover:text-muted">
                {item.label}
              </Link>
            </li>
          ))}
        </ul>
        <a
          href={whatsappHref()}
          target="_blank"
          rel="noopener noreferrer"
          className="text-sm hover:text-muted"
        >
          WhatsApp {site.whatsapp.display}
        </a>
      </Container>
      <Container className="border-t border-line py-5 text-xs text-muted">
        © {new Date().getFullYear()} {site.name}
      </Container>
    </footer>
  );
}
