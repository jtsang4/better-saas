import { Faq } from '@/components/blocks/faq/faq';
import { Hero } from '@/components/blocks/hero/hero';
import { Pricing } from '@/components/blocks/pricing/pricing';
import { TechStack } from '@/components/blocks/tech-stack';

export default function HomePage() {
  return (
    <>
      <Hero />
      <TechStack />
      <Pricing />
      <Faq />
    </>
  );
}
