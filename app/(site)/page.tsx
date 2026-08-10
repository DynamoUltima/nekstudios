import { Hero } from "@/components/hero";
import {
  Cities,
  DropGrid,
  FabricSection,
  Lookbook,
  Newsletter,
  TickerBar,
} from "@/components/sections";

export default function HomePage() {
  return (
    <>
      <Hero />
      <TickerBar />
      <DropGrid />
      <FabricSection />
      <Lookbook />
      <Cities />
      <Newsletter />
    </>
  );
}
