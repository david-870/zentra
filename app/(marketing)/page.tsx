import { About } from "@/components/sections/About";
import { Custom } from "@/components/sections/Custom";
import { FinalCta } from "@/components/sections/FinalCta";
import { Hero } from "@/components/sections/Hero";
import { Packages } from "@/components/sections/Packages";
import { Process } from "@/components/sections/Process";
import { Work } from "@/components/sections/Work";

export default function HomePage() {
  return (
    <main id="main">
      <Hero />
      <Packages />
      <Work />
      <About />
      <Custom />
      <Process />
      <FinalCta />
    </main>
  );
}
