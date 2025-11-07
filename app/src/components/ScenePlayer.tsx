"use client";

import type { ReactNode } from "react";
import { useEffect, useMemo, useState } from "react";

type SceneDefinition = {
  id: string;
  title: string;
  caption: string;
  duration: number;
  render: (progress: number) => ReactNode;
};

const clamp = (value: number, min = 0, max = 1) =>
  Math.min(max, Math.max(min, value));

const easeOutCubic = (t: number) => 1 - Math.pow(1 - t, 3);
const easeInOutCubic = (t: number) =>
  t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
const easeOutQuart = (t: number) => 1 - Math.pow(1 - t, 4);

const currencyFormatter = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
  maximumFractionDigits: 0,
});

const BUILDINGS = [
  { left: "6%", width: "7%", base: 42 },
  { left: "13%", width: "6%", base: 56 },
  { left: "21%", width: "9%", base: 62 },
  { left: "31%", width: "8%", base: 48 },
  { left: "40%", width: "6%", base: 38 },
  { left: "48%", width: "12%", base: 66 },
  { left: "62%", width: "7%", base: 52 },
  { left: "70%", width: "9%", base: 60 },
  { left: "80%", width: "8%", base: 45 },
];

const CHART_POINTS = [0.12, 0.24, 0.52, 0.36, 0.68, 0.5, 0.82];

const PARTICLES = Array.from({ length: 22 }, (_, index) => ({
  left: ((index * 37) % 100) + 2,
  top: ((index * 53) % 100) + 4,
  delay: ((index * 97) % 14) / 10,
  size: ((index * 13) % 4) + 2,
}));

const SCENES: SceneDefinition[] = [
  {
    id: "wake",
    title: "First Light",
    caption:
      "You blink awake as the smart blinds part, sunlight shimmering across Egyptian cotton and the skyline beyond the glass.",
    duration: 6500,
    render: (progress) => <WakeUpScene progress={progress} />,
  },
  {
    id: "panorama",
    title: "Penthouse Panorama",
    caption:
      "The panoramic glass reconfigures to reveal Monaco’s harbor while kinetic art pieces glow to life along the marble wall.",
    duration: 7200,
    render: (progress) => <PenthouseScene progress={progress} />,
  },
  {
    id: "portfolio",
    title: "Assets in Motion",
    caption:
      "Your phone unlocks automatically—eight figures across accounts climb in real time as overnight trades settle green.",
    duration: 6200,
    render: (progress) => <PortfolioScene progress={progress} />,
  },
  {
    id: "balcony",
    title: "Morning Air",
    caption:
      "Barefoot across the heated teak, you step toward the infinity pool as the Mediterranean breeze lifts the sheer curtains.",
    duration: 7000,
    render: (progress) => <BalconyScene progress={progress} />,
  },
  {
    id: "heli",
    title: "Helipad Arrival",
    caption:
      "Rotor blades thunder overhead; a waiting helicopter idles on the helipad, flight plan to the private island already filed.",
    duration: 7200,
    render: (progress) => <HelipadScene progress={progress} />,
  },
];

const TOTAL_DURATION = SCENES.reduce(
  (accumulator, scene) => accumulator + scene.duration,
  0,
);

export default function ScenePlayer() {
  const [sceneIndex, setSceneIndex] = useState(0);
  const [sceneProgress, setSceneProgress] = useState(0);
  const [runId, setRunId] = useState(0);
  const [isComplete, setIsComplete] = useState(false);

  useEffect(() => {
    const scene = SCENES[sceneIndex];
    let animationFrame: number;
    const start = performance.now();

    const step = (timestamp: number) => {
      const elapsed = timestamp - start;
      const progress = clamp(elapsed / scene.duration, 0, 1);
      setSceneProgress(progress);

      if (progress >= 1) {
        if (sceneIndex >= SCENES.length - 1) {
          setSceneProgress(1);
          setIsComplete(true);
          return;
        }

        setSceneProgress(0);
        setSceneIndex((previous) =>
          Math.min(previous + 1, SCENES.length - 1),
        );
        return;
      }

      animationFrame = requestAnimationFrame(step);
    };

    animationFrame = requestAnimationFrame(step);

    return () => cancelAnimationFrame(animationFrame);
  }, [sceneIndex, runId]);

  const elapsedBeforeScene = useMemo(
    () =>
      SCENES.slice(0, sceneIndex).reduce(
        (accumulator, scene) => accumulator + scene.duration,
        0,
      ),
    [sceneIndex],
  );

  const timelineProgress = isComplete
    ? 1
    : (elapsedBeforeScene +
        sceneProgress * SCENES[sceneIndex].duration) /
      TOTAL_DURATION;

  const activeScene = SCENES[sceneIndex];

  const handleReplay = () => {
    setSceneIndex(0);
    setSceneProgress(0);
    setRunId((id) => id + 1);
    setIsComplete(false);
  };

  return (
    <section className="relative flex h-dvh w-full flex-col overflow-hidden bg-[radial-gradient(circle_at_20%_20%,#0f172a_0%,#030712_70%,#010104_100%)] text-slate-100">
      <div className="pointer-events-none absolute inset-0 bg-noise opacity-[0.06]" />
      <AmbientParticles />

      <div className="absolute inset-0">
        {SCENES.map((scene, index) => {
          const opacity =
            index === sceneIndex
              ? 1
              : index < sceneIndex
                ? 0
                : 0;

          const visibleProgress =
            index < sceneIndex ? 1 : index === sceneIndex ? sceneProgress : 0;

          return (
            <div
              key={scene.id}
              className="absolute inset-0 transition-opacity duration-[1200ms] ease-out"
              style={{
                opacity,
                pointerEvents: index === sceneIndex ? "auto" : "none",
              }}
            >
              {scene.render(visibleProgress)}
            </div>
          );
        })}
      </div>

      <div className="pointer-events-none absolute left-6 top-6 flex flex-col gap-2 text-xs uppercase tracking-[0.35em] text-slate-200/70 md:left-12 md:top-10">
        <span className="text-[11px] font-semibold text-slate-100/90">
          06:03 · MONACO
        </span>
        <span className="text-[10px] font-light text-slate-300/60">
          RESIDENCE AI · STATUS NOMINAL
        </span>
      </div>

      <div className="pointer-events-none absolute right-6 top-6 flex flex-col gap-2 text-right text-xs uppercase tracking-[0.28em] text-slate-200/70 md:right-12 md:top-10">
        <span className="text-[11px] font-semibold text-emerald-300/80">
          {currencyFormatter.format(186000000 + Math.round(timelineProgress * 8000000))}
        </span>
        <span className="text-[10px] font-light text-slate-300/60">
          TOTAL NET WORTH
        </span>
      </div>

      <div className="pointer-events-none absolute inset-x-0 bottom-0 flex flex-col gap-4 bg-gradient-to-t from-black via-black/40 to-transparent px-6 pb-12 pt-24 md:px-16 md:pb-16">
        <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="text-[11px] uppercase tracking-[0.45em] text-slate-300/80">
              Scene {sceneIndex + 1} · {activeScene.title}
            </p>
            <p className="mt-3 max-w-3xl text-lg text-slate-100/90 md:text-xl">
              {activeScene.caption}
            </p>
          </div>
          <div className="text-right text-[11px] uppercase tracking-[0.35em] text-slate-300/60">
            POV MORNING
          </div>
        </div>

        <div className="mt-4 h-1.5 w-full overflow-hidden rounded-full bg-white/10 backdrop-blur-sm">
          <div
            className="h-full rounded-full bg-gradient-to-r from-amber-300 via-rose-300 to-sky-300 transition-[width] duration-500 ease-out"
            style={{ width: `${timelineProgress * 100}%` }}
          />
        </div>
      </div>

      <div className="absolute bottom-10 right-6 flex gap-3 md:right-12">
        <div className="pointer-events-none hidden flex-col rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-[11px] uppercase tracking-[0.28em] text-white/80 backdrop-blur md:flex">
          <span>Itinerary</span>
          <span className="mt-1 text-[10px] font-light tracking-[0.3em] text-white/60">
            Yacht · Helipad · Island
          </span>
        </div>

        {isComplete && (
          <button
            type="button"
            onClick={handleReplay}
            className="pointer-events-auto rounded-full border border-white/20 bg-white/10 px-5 py-2 text-xs font-semibold uppercase tracking-[0.35em] text-white backdrop-blur transition hover:border-white/40 hover:bg-white/20"
          >
            Replay Morning
          </button>
        )}
      </div>
    </section>
  );
}

function WakeUpScene({ progress }: { progress: number }) {
  const openness = easeOutCubic(clamp(progress * 1.5));
  const sunlight = clamp((progress - 0.1) * 1.2);
  const curtainShadow = clamp(1 - progress * 1.35, 0, 1);
  const blink =
    progress > 0.58 && progress < 0.66
      ? 1 - easeOutQuart(clamp((progress - 0.58) / 0.08, 0, 1))
      : 0;
  const eyelidCover = clamp(1 - openness + blink, 0, 1);

  return (
    <div className="absolute inset-0 overflow-hidden">
      <div
        className="absolute inset-0 bg-gradient-to-br from-[#04060f] via-[#0c1326] to-[#152238]"
        style={{ filter: `brightness(${0.75 + sunlight * 0.5})` }}
      />

      <div
        className="absolute inset-x-[-30%] top-[-10%] h-[70%] rounded-[46%] bg-[radial-gradient(circle_at_50%_30%,rgba(255,255,255,0.55),rgba(15,23,42,0.55)_60%,rgba(8,11,21,0.85)_100%)] blur-3xl"
        style={{
          transform: `scale(${1 + sunlight * 0.4}) translateY(${sunlight * -10}%)`,
          opacity: 0.85,
        }}
      />

      <div className="absolute inset-0 head-motion">
        <div className="absolute left-[12%] top-[18%] h-[38vh] w-[72vw] -rotate-[6deg] rounded-[45%] border border-white/[0.08] bg-[radial-gradient(circle_at_50%_20%,rgba(236,72,153,0.28),rgba(15,23,42,0.65)_60%,rgba(8,12,22,0.9)_100%)] shadow-[0_40px_120px_rgba(236,72,153,0.25)] backdrop-blur-md" />
        <div className="absolute left-[16%] top-[58%] h-[46%] w-[70%] rounded-[60%] bg-[radial-gradient(circle_at_52%_30%,rgba(255,255,255,0.5),rgba(14,22,38,0.95))] blur-3xl opacity-75" />
        <div
          className="absolute inset-x-[25%] top-0 h-[35%] rounded-b-[120px] border border-white/[0.08] bg-[radial-gradient(circle_at_50%_10%,rgba(248,250,252,0.2),rgba(7,11,23,0.9))] backdrop-blur"
          style={{
            filter: `brightness(${0.8 + sunlight * 0.5})`,
          }}
        />

        <div
          className="absolute inset-y-0 right-[12%] w-[28%] rounded-l-[32px] border border-white/[0.06] bg-[radial-gradient(circle_at_20%_50%,rgba(14,165,233,0.28),rgba(12,20,35,0.8))] shadow-[0_0_80px_rgba(125,211,252,0.15)] backdrop-blur-md"
          style={{
            opacity: 0.85,
            transform: `translateX(${curtainShadow * 18 - 6}%)`,
          }}
        />
      </div>

      <div
        className="absolute inset-0 bg-[radial-gradient(circle_at_50%_-20%,rgba(255,237,213,0.35),transparent_58%)]"
        style={{ opacity: sunlight }}
      />

      <div className="absolute inset-0 pointer-events-none">
        <div
          className="absolute inset-x-0 top-0 bg-black"
          style={{
            height: `${eyelidCover * 48 + 2}%`,
            opacity: 0.94,
          }}
        />
        <div
          className="absolute inset-x-0 bottom-0 bg-black"
          style={{
            height: `${eyelidCover * 46 + 2}%`,
            opacity: 0.94,
          }}
        />
        <div
          className="absolute left-[48%] top-[26%] h-[18vh] w-[28vw] -rotate-2 rounded-full bg-white/6 blur-2xl"
          style={{ opacity: openness }}
        />
      </div>
    </div>
  );
}

function PenthouseScene({ progress }: { progress: number }) {
  const curtainOpen = easeOutCubic(clamp(progress * 1.4));
  const skylineGlow = clamp((progress - 0.12) * 1.4);
  const kineticGlow = clamp((progress - 0.35) * 1.6);

  return (
    <div className="absolute inset-0 overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-b from-[#040b13] via-[#071223] to-[#030712]" />

      <div className="absolute inset-x-[8%] inset-y-[10%] overflow-hidden rounded-[42px] border border-white/[0.08] bg-white/[0.03] backdrop-blur-2xl">
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-[#040b13]/40 to-[#020409]/80" />

        <div
          className="absolute inset-0"
          style={{
            opacity: 1 - curtainOpen * 0.92,
            background:
              "radial-gradient(circle at 0% 50%, rgba(8, 11, 21, 0.8), transparent 55%), radial-gradient(circle at 100% 50%, rgba(8, 11, 21, 0.9), transparent 55%)",
          }}
        />

        <div
          className="absolute inset-0"
          style={{
            opacity: curtainOpen,
            background:
              "linear-gradient(180deg, rgba(56,189,248,0.25) 0%, rgba(8,47,73,0.4) 30%, rgba(6,95,70,0.45) 60%, rgba(15,118,110,0.35) 100%)",
            transform: `scale(${1 + skylineGlow * 0.04}) translateX(${(0.5 - skylineGlow) * 4}%) translateY(${(1 - skylineGlow) * 6}%)`,
            transition: "transform 1s ease-out",
          }}
        />

        {BUILDINGS.map((building, index) => (
          <div
            key={`${building.left}-${index}`}
            className="absolute bottom-0 rounded-t-[18px] bg-gradient-to-t from-slate-900 via-slate-800/80 to-slate-100/20 shadow-[0_20px_80px_rgba(15,23,42,0.35)]"
            style={{
              left: building.left,
              width: building.width,
              height: `${building.base + skylineGlow * 18}%`,
              opacity: 0.35 + skylineGlow * 0.55,
              transform: `translateY(${(1 - curtainOpen) * 8}%)`,
              transition: "opacity 0.8s ease-out, transform 1s ease-out",
            }}
          >
            <span
              className="absolute left-1/2 top-8 h-[65%] w-[2px] -translate-x-1/2 bg-gradient-to-b from-white/50 via-transparent to-transparent"
              style={{ opacity: 0.2 + skylineGlow * 0.5 }}
            />
          </div>
        ))}

        <div
          className="absolute right-[10%] top-[16%] h-[32vh] w-[14vw] rounded-[36px] border border-white/[0.1] bg-gradient-to-b from-white/[0.35] via-white/[0.08] to-transparent shadow-[0_40px_120px_rgba(244,114,182,0.2)] backdrop-blur"
          style={{
            opacity: 0.3 + kineticGlow * 0.6,
            filter: `hue-rotate(${kineticGlow * 45}deg)`,
          }}
        />
        <div
          className="absolute right-[12%] top-[22%] h-[24vh] w-[11vw] rounded-[32px] border border-white/[0.1] bg-gradient-to-b from-pink-300/20 via-transparent to-transparent shadow-[0_30px_90px_rgba(251,191,36,0.35)] backdrop-blur"
          style={{ opacity: kineticGlow }}
        />
      </div>

      <div className="absolute inset-x-0 bottom-[-5%] h-[45%] bg-[radial-gradient(circle_at_50%_-40%,rgba(13,148,136,0.4),transparent_70%)] opacity-60 blur-3xl" />

      <div className="absolute inset-0 flex items-center justify-center">
        <div className="ambient-panel" />
      </div>

      <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/30 to-transparent" />
    </div>
  );
}

function PortfolioScene({ progress }: { progress: number }) {
  const balance = 184_650_000 + Math.round(progress * 4_200_000);
  const delta = 128_000 + Math.round(progress * 210_000);
  const crypto = 32_400_000 + Math.round(progress * 1_600_000);
  const art = 18_200_000 + Math.round(progress * 620_000);
  const yacht = 72_000_000 + Math.round(progress * 2_500_000);

  return (
    <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-[#020509] via-[#070f1a] to-[#111c2f]">
      <div className="relative flex h-[70vh] w-[90vw] max-w-[420px] flex-col justify-between rounded-[48px] border border-white/10 bg-[linear-gradient(130deg,rgba(15,118,110,0.6),rgba(2,6,23,0.9))] p-8 text-white shadow-[0_40px_120px_rgba(14,116,144,0.3)] backdrop-blur-lg md:p-10">
        <div className="flex items-center justify-between text-sm uppercase tracking-[0.45em] text-white/60">
          <span>Private Bank</span>
          <span>Ultra</span>
        </div>

        <div>
          <p className="text-xs uppercase tracking-[0.6em] text-white/60">
            Liquid Balance
          </p>
          <p className="mt-3 text-3xl font-semibold">
            {currencyFormatter.format(balance)}
          </p>
          <p className="mt-2 text-sm text-emerald-300/80">
            +{currencyFormatter.format(delta)} (London desk pre-market)
          </p>
        </div>

        <div className="mt-8 flex items-end gap-4">
          {CHART_POINTS.map((point, index) => {
            const height = 40 + point * 80 + progress * 20;
            return (
              <div
                key={`${point}-${index}`}
                className="flex-1 rounded-full bg-gradient-to-t from-emerald-400/20 via-emerald-300/50 to-white"
                style={{
                  height: `${height}px`,
                  opacity: 0.3 + point * 0.7,
                  boxShadow: "0 0 18px rgba(52, 211, 153, 0.15)",
                }}
              />
            );
          })}
        </div>

        <div className="mt-6 grid grid-cols-2 gap-4 text-sm">
          <div className="asset-card">
            <p className="text-[11px] uppercase tracking-[0.35em] text-white/50">
              Digital Assets
            </p>
            <p className="mt-1 text-lg font-semibold">
              {currencyFormatter.format(crypto)}
            </p>
            <p className="text-[11px] text-emerald-200/70">
              +4.2% overnight
            </p>
          </div>
          <div className="asset-card">
            <p className="text-[11px] uppercase tracking-[0.35em] text-white/50">
              Art Vault
            </p>
            <p className="mt-1 text-lg font-semibold">
              {currencyFormatter.format(art)}
            </p>
            <p className="text-[11px] text-emerald-200/70">Basel sale pending</p>
          </div>
          <div className="asset-card">
            <p className="text-[11px] uppercase tracking-[0.35em] text-white/50">
              Yacht Fund
            </p>
            <p className="mt-1 text-lg font-semibold">
              {currencyFormatter.format(yacht)}
            </p>
            <p className="text-[11px] text-white/60">
              Crew ready · 10:00 departure
            </p>
          </div>
          <div className="asset-card">
            <p className="text-[11px] uppercase tracking-[0.35em] text-white/50">
              Ai Butler
            </p>
            <p className="mt-1 text-lg font-semibold text-emerald-200">
              Synced
            </p>
            <p className="text-[11px] text-white/60">Breakfast plated</p>
          </div>
        </div>

        <div className="rounded-3xl border border-white/20 bg-white/10 px-5 py-3 text-xs uppercase tracking-[0.4em] text-white/80">
          Gesture to acknowledge
        </div>
      </div>

      <div className="pointer-events-none absolute left-10 top-1/3 hidden flex-col gap-3 text-[11px] uppercase tracking-[0.35em] text-white/50 md:flex">
        <span>Swiss Family Office · Online</span>
        <span>Tokyo Desk · +6.8%</span>
        <span>Island Crew · En Route</span>
      </div>
    </div>
  );
}

function BalconyScene({ progress }: { progress: number }) {
  const stride = easeInOutCubic(progress);
  const horizonGlow = clamp((progress - 0.12) * 1.4);
  const yachtReveal = clamp((progress - 0.4) * 1.8);

  return (
    <div className="absolute inset-0 overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-b from-[#03060d] via-[#07162c] to-[#10395f]" />
      <div
        className="absolute inset-x-[-10%] top-[12%] h-[45%] rounded-[48px] bg-[radial-gradient(circle_at_50%_30%,rgba(59,130,246,0.4),rgba(8,47,73,0.2)_70%,transparent_100%)] blur-3xl"
        style={{
          opacity: 0.35 + horizonGlow * 0.6,
        }}
      />

      <div
        className="absolute inset-x-[18%] bottom-[25%] h-[38%] origin-bottom rounded-[120px] bg-[linear-gradient(160deg,rgba(255,255,255,0.18),rgba(148,163,184,0.1)_40%,rgba(51,65,85,0.08)_70%,rgba(15,23,42,0.6)_100%)] shadow-[0_60px_120px_rgba(8,47,73,0.35)] backdrop-blur-xl"
        style={{
          transform: `translateY(${(1 - stride) * 28}%) scale(${0.95 + stride * 0.15})`,
        }}
      />

      <div
        className="absolute inset-x-0 bottom-0 h-[36%] bg-[linear-gradient(180deg,rgba(15,118,110,0.4),rgba(7,89,133,0.55)_45%,rgba(8,47,73,0.9)_100%)]"
        style={{
          transform: `translateY(${(1 - stride) * 40}%)`,
        }}
      />

      <div
        className="absolute inset-x-0 bottom-[32%] h-[18%] bg-[linear-gradient(180deg,rgba(14,116,144,0.8),rgba(14,165,233,0.35))]"
        style={{
          opacity: 0.4 + horizonGlow * 0.6,
          filter: `blur(${4 - horizonGlow * 2}px)`,
        }}
      />

      <div
        className="absolute right-[12%] bottom-[26%] h-[18vh] w-[18vh] rounded-full border-4 border-white/60 bg-transparent"
        style={{
          opacity: yachtReveal,
          transform: `translateY(${(1 - yachtReveal) * 30}%)`,
        }}
      >
        <div className="absolute inset-4 rounded-full border border-white/30" />
        <div className="absolute inset-x-6 bottom-6 h-1 rounded-full bg-white/70 shadow-[0_0_20px_rgba(255,255,255,0.2)]" />
        <div className="absolute inset-x-6 bottom-10 h-1 rounded-full bg-white/40" />
      </div>

      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />
    </div>
  );
}

function HelipadScene({ progress }: { progress: number }) {
  const rotorPower = clamp((progress - 0.12) * 1.4);
  const lightSweep = clamp((progress - 0.4) * 1.4);
  const departure = clamp((progress - 0.65) * 2);

  return (
    <div className="absolute inset-0 overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-b from-[#020409] via-[#060c18] to-[#010104]" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_30%,rgba(37,99,235,0.35),transparent_65%)] opacity-70" />

      <div className="absolute left-1/2 top-[44%] h-[52vh] w-[52vh] -translate-x-1/2 -translate-y-1/2 rounded-full border-[10px] border-amber-300/70 bg-[radial-gradient(circle_at_50%_50%,rgba(251,191,36,0.15),transparent_70%)] shadow-[0_0_120px_rgba(251,191,36,0.25)]" />

      <div
        className="absolute left-1/2 top-[44%] flex h-[42vh] w-[42vh] -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full border border-white/20 bg-gradient-to-br from-white/10 via-transparent to-black/40 backdrop-blur"
        style={{
          transform: `translate(-50%, -50%) scale(${1 + departure * 0.08})`,
        }}
      >
        <div
          className="absolute h-[2px] w-[60%] origin-center rounded-full bg-white/80 shadow-[0_0_40px_rgba(255,255,255,0.35)]"
          style={{
            animation: "rotor-spin 0.9s linear infinite",
            animationDuration: `${Math.max(0.3, 1.1 - rotorPower * 0.8)}s`,
            opacity: 0.3 + rotorPower * 0.7,
          }}
        />
        <div
          className="absolute h-[2px] w-[60%] origin-center rounded-full bg-white/50"
          style={{
            animation: "rotor-spin 0.9s linear infinite reverse",
            animationDuration: `${Math.max(0.3, 1.2 - rotorPower * 0.8)}s`,
            opacity: 0.15 + rotorPower * 0.5,
          }}
        />
        <div className="absolute h-[12vh] w-[4px] rounded-full bg-white/25" />
        <div className="absolute h-[4px] w-[12vh] rounded-full bg-white/25" />
      </div>

      <div
        className="absolute left-1/2 top-[30%] h-[22vh] w-[28vw] -translate-x-1/2 rounded-[40px] border border-white/20 bg-white/10 backdrop-blur"
        style={{
          opacity: 0.2 + lightSweep * 0.8,
          transform: `translate(-50%, -5%) scale(${0.9 + lightSweep * 0.1}) rotateX(12deg)`,
        }}
      >
        <div className="absolute inset-x-8 top-8 h-1 rounded-full bg-white/40" />
        <div className="absolute inset-x-12 top-14 h-1 rounded-full bg-white/20" />
        <div className="absolute bottom-8 right-8 text-right text-[11px] uppercase tracking-[0.3em] text-white/70">
          Flight LX-01
          <span className="block text-[10px] font-light text-white/50">
            Island ETA · 12 min
          </span>
        </div>
      </div>

      <div
        className="absolute inset-x-[10%] bottom-[18%] h-[12vh] rounded-[60px] border border-white/10 bg-white/10"
        style={{
          opacity: 0.2 + departure * 0.6,
          transform: `translateY(${departure * -10}%)`,
        }}
      />

      <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/40 to-transparent" />
    </div>
  );
}

function AmbientParticles() {
  return (
    <div className="pointer-events-none absolute inset-0 mix-blend-screen opacity-60">
      {PARTICLES.map((particle, index) => (
        <span
          key={index}
          className="ambient-sparkle absolute block rounded-full bg-gradient-to-r from-amber-200 via-white to-sky-200"
          style={{
            left: `${particle.left}%`,
            top: `${particle.top}%`,
            width: `${particle.size}px`,
            height: `${particle.size}px`,
            animationDelay: `${particle.delay}s`,
          }}
        />
      ))}
    </div>
  );
}
