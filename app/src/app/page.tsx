import ScenePlayer from "@/components/ScenePlayer";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Morning of a Millionaire | Immersive POV",
  description:
    "Step inside a cinematic POV morning routine in a billionaire penthouse. Watch the day unfold across immersive scenes and bespoke transitions.",
};

export default function Home() {
  return (
    <main className="min-h-screen bg-black text-slate-100 antialiased">
      <ScenePlayer />
    </main>
  );
}
