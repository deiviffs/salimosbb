import { createFileRoute } from "@tanstack/react-router";
import { useCallback, useMemo, useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import confetti from "canvas-confetti";

import { notifyYes } from "@/lib/notify.functions";
import askImg from "@/assets/ask.jpg";
import sadImg from "@/assets/sad.jpg";
import yayImg from "@/assets/yay.jpg";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "¿Te gustaría salir conmigo? ❤️" },
      {
        name: "description",
        content:
          "Una pregunta muy especial, con ositos, corazones y un botón de 'Sí' que no deja de crecer.",
      },
      { property: "og:title", content: "¿Te gustaría salir conmigo? ❤️" },
      {
        property: "og:description",
        content: "Solo hay una respuesta posible... y el botón lo sabe. 💖",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Index,
});

const NO_PHRASES = [
  "No",
  "¿De verdad?",
  "¿Estás segura?",
  "¡Piénsalo bien!",
  "Mira el otro botón... 💖",
  "¡Por favor! 🥺",
  "Mi corazoncito... 💔",
  "Última oportunidad 🥹",
];

const HEARTS = ["❤️", "💖", "💕", "💗", "🩷", "💞"];

function FloatingHearts() {
  const hearts = useMemo(
    () =>
      Array.from({ length: 14 }, (_, i) => ({
        emoji: HEARTS[i % HEARTS.length],
        left: `${(i * 7.3 + 4) % 96}%`,
        duration: `${9 + (i % 5) * 2.5}s`,
        delay: `${(i % 7) * 1.4}s`,
        size: `${1 + (i % 4) * 0.45}rem`,
      })),
    [],
  );

  return (
    <div className="pointer-events-none fixed inset-0 overflow-hidden" aria-hidden="true">
      {hearts.map((h, i) => (
        <span
          key={i}
          className="heart-float bottom-[-10vh]"
          style={{
            left: h.left,
            animationDuration: h.duration,
            animationDelay: h.delay,
            fontSize: h.size,
            opacity: 0.55,
          }}
        >
          {h.emoji}
        </span>
      ))}
    </div>
  );
}

function celebrate() {
  const colors = ["#ff5c8a", "#ff8fab", "#ffd6e0", "#ffb703", "#ffffff"];
  confetti({ particleCount: 160, spread: 90, origin: { y: 0.6 }, colors });
  let ticks = 0;
  const timer = window.setInterval(() => {
    ticks += 1;
    confetti({
      particleCount: 40,
      angle: 60,
      spread: 70,
      origin: { x: 0, y: 0.7 },
      colors,
    });
    confetti({
      particleCount: 40,
      angle: 120,
      spread: 70,
      origin: { x: 1, y: 0.7 },
      colors,
    });
    if (ticks > 8) window.clearInterval(timer);
  }, 550);
}

function Index() {
  const [noCount, setNoCount] = useState(0);
  const [accepted, setAccepted] = useState(false);
  const sendNotification = useServerFn(notifyYes);

  const noLabel = NO_PHRASES[noCount % NO_PHRASES.length];
  const grow = Math.min(noCount, 9);
  const yesFontSize = 1.15 + grow * 0.45;
  const yesPaddingY = 0.85 + grow * 0.42;

  const handleYes = useCallback(() => {
    setAccepted(true);
    celebrate();
    void sendNotification({ data: { noClicks: noCount } }).catch(() => {});
  }, [noCount, sendNotification]);

  return (
    <main className="relative flex min-h-screen items-center justify-center overflow-hidden px-4 py-10">
      <FloatingHearts />

      {/* Pregunta */}
      <section
        aria-hidden={accepted}
        className={`relative z-10 w-full max-w-md rounded-4xl card-float p-6 text-center transition-all duration-700 sm:p-8 ${
          accepted
            ? "pointer-events-none scale-90 opacity-0 blur-sm"
            : "scale-100 opacity-100 blur-0"
        }`}
      >
        <div className="animate-float-soft mx-auto mb-6 w-full max-w-[16rem] overflow-hidden rounded-3xl border border-border">
          <img
            src={noCount > 0 ? sadImg : askImg}
            alt={
              noCount > 0
                ? "Osito triste con una flor marchita"
                : "Osito tierno abrazando un corazón"
            }
            width={816}
            height={816}
            className="h-full w-full object-cover transition-all duration-500"
          />
        </div>

        <h1 className="font-display text-3xl leading-tight font-bold text-primary sm:text-4xl">
          ¿Te gustaría salir conmigo? ❤️
        </h1>
        <p className="mx-auto mt-3 max-w-xs text-sm text-muted-foreground">
          {noCount === 0
            ? "Llevo días juntando valor para preguntártelo..."
            : "El osito ya no aguanta más. Piénsalo con el corazón 🥺"}
        </p>

        <div className="mt-8 flex flex-col items-center gap-4">
          <button
            type="button"
            onClick={handleYes}
            className="btn-yes animate-pulse-soft w-full rounded-3xl font-display font-bold transition-all duration-500 ease-out hover:brightness-110 active:scale-[0.98]"
            style={{
              fontSize: `${yesFontSize}rem`,
              paddingBlock: `${yesPaddingY}rem`,
            }}
          >
            ¡Sí!
          </button>

          {grow < 9 && (
            <button
              type="button"
              onClick={() => setNoCount((c) => c + 1)}
              className="rounded-2xl bg-secondary px-5 py-2 text-sm font-semibold text-secondary-foreground transition-all duration-300 hover:bg-muted active:scale-95"
              style={{ fontSize: `${Math.max(0.7, 0.95 - grow * 0.03)}rem` }}
            >
              {noLabel}
            </button>
          )}
        </div>
      </section>

      {/* Éxito */}
      {accepted && (
        <section className="animate-pop-in absolute inset-x-4 top-1/2 z-20 mx-auto max-w-md -translate-y-1/2 rounded-4xl card-float p-6 text-center sm:p-8">
          <div className="animate-float-soft mx-auto mb-6 w-full max-w-[17rem] overflow-hidden rounded-3xl border border-border">
            <img
              src={yayImg}
              alt="Dos ositos abrazándose entre globos y confeti"
              width={816}
              height={816}
              loading="lazy"
              className="h-full w-full object-cover"
            />
          </div>
          <h2 className="font-display text-3xl leading-tight font-bold text-primary sm:text-4xl">
            ¡Sabía que dirías que sí! 🥰
          </h2>
          <p className="mt-3 text-sm text-muted-foreground">
            Prepárate: te voy a cuidar el corazón como si fuera de cristal. 💖
          </p>
          <p className="mt-6 font-display text-lg text-accent-foreground">
            Nuestra primera cita empieza ahora ✨
          </p>
        </section>
      )}
    </main>
  );
}
