import AboutHero from "@/components/about/AboutHero";
import AboutMission from "@/components/about/AboutMission";
import AboutHowItWorks from "@/components/about/AboutHowItWorks";
import AboutValues from "@/components/about/AboutValues";

export const metadata = {
  title: "About • TripWeaver",
  description: "Our mission, story, and the people building a faster way to plan trips.",
};

export default function AboutPage() {
  return (
    <main className="mx-auto max-w-6xl space-y-10 md:space-y-14 py-10">
      <AboutHero />
      <AboutMission />
      <AboutHowItWorks />
      <AboutValues />
    </main>
  );
}
