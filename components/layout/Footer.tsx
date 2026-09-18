import { site } from "@/content/site";
import { Logo } from "@/components/brand/Logo";
import { Container } from "@/components/ui/Container";

export function Footer() {
  return (
    <footer className="relative z-10 border-t border-line bg-bg">
      <Container className="py-12">
        <Logo />
        <p className="mt-2 max-w-xs text-sm text-muted">{site.description}</p>
      </Container>
      <Container className="border-t border-line py-5 text-xs text-muted">
        © {new Date().getFullYear()} {site.name}
      </Container>
    </footer>
  );
}
