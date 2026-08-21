import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import confetti from "canvas-confetti";

import { supabase } from "@/integrations/supabase/client";
import gifAsset from "@/assets/pucca-loop.gif.asset.json";
import yayImg from "@/assets/pg-yay.jpg";

const NO_PHRASES = [
  "No",
  "¿De verdad?",
  "¿Estás segura?",
  "¡Piénsalo bien!",
  "Mira el otro botón... 💖",
  "¡Por favor! 🥺",
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
            opacity: 0.5,
          }}
        >
          {h.emoji}
        </span>
      ))}
    </div>
  );
}

function celebrate() {
  const colors = ["#ff2b4a", "#ff8fab", "#ffd6e0", "#111111", "#ffffff"];
  confetti({ particleCount: 180, spread: 95, origin: { y: 0.6 }, colors });
  let ticks = 0;
  const timer = window.setInterval(() => {
    ticks += 1;
    confetti({ particleCount: 40, angle: 60, spread: 70, origin: { x: 0, y: 0.7 }, colors });
    confetti({ particleCount: 40, angle: 120, spread: 70, origin: { x: 1, y: 0.7 }, colors });
    if (ticks > 8) window.clearInterval(timer);
  }, 550);
}

export function AskCard({ invitationId }: { invitationId?: string | null }) {
  const [noCount, setNoCount] = useState(0);
  const [accepted, setAccepted] = useState(false);
  const [note, setNote] = useState("");
  const [noteSent, setNoteSent] = useState(false);
  const [noPos, setNoPos] = useState<{ left: number; top: number } | null>(null);
  const responseId = useRef<string | null>(null);

  const storageKey = invitationId ? `resp:${invitationId}` : null;

  // Reuse the same response row for this device / invitation.
  useEffect(() => {
    if (!storageKey) return;
    responseId.current = window.localStorage.getItem(storageKey);
  }, [storageKey]);

  const persist = useCallback(
    async (patch: { no_clicks?: number; accepted?: boolean; note?: string }) => {
      if (!invitationId) return;
      try {
        if (!responseId.current) {
          const { data, error } = await supabase
            .from("responses")
            .insert({ invitation_id: invitationId, no_clicks: 0, accepted: false, ...patch })
            .select("id")
            .single();
          if (error || !data) return;
          responseId.current = data.id;
          if (storageKey) window.localStorage.setItem(storageKey, data.id);
          return;
        }
        await supabase.from("responses").update(patch).eq("id", responseId.current);
      } catch {
        /* silencio: la experiencia no debe romperse */
      }
    },
    [invitationId, storageKey],
  );

  const handleNo = useCallback(() => {
    const next = noCount + 1;
    setNoCount(next);
    setNoPos({
      left: 8 + Math.random() * 62,
      top: 14 + Math.random() * 68,
    });
    void persist({ no_clicks: next });
  }, [noCount, persist]);

  const handleYes = useCallback(() => {
    setAccepted(true);
    celebrate();
    void persist({ accepted: true, no_clicks: noCount });
  }, [noCount, persist]);

  const sendNote = useCallback(() => {
    setNoteSent(true);
    void persist({ note: note.trim().slice(0, 500), accepted: true, no_clicks: noCount });
  }, [note, noCount, persist]);

  const noLabel = NO_PHRASES[noCount % NO_PHRASES.length];
  const yesFontSize = Math.min(1.4 + noCount * 0.9, 9);
  const yesFullScreen = noCount >= 2;

  return (
    <main className="relative flex min-h-screen items-center justify-center overflow-hidden px-4 py-10">
      <FloatingHearts />

      <section
        aria-hidden={accepted}
        className={`relative z-10 w-full max-w-md rounded-4xl card-float p-6 text-center transition-all duration-700 sm:p-8 ${
          accepted ? "pointer-events-none scale-90 opacity-0 blur-sm" : "scale-100 opacity-100"
        }`}
      >
        <div className="animate-float-soft mx-auto mb-6 w-full max-w-[16rem] overflow-hidden rounded-3xl border-2 border-foreground/10 bg-black">
          <img
            src={gifAsset.url}
            alt="Animación de Pucca y Garu bajo las estrellas"
            className="h-full w-full object-cover"
          />
        </div>

        <h1 className="font-display text-3xl leading-tight font-bold text-primary sm:text-4xl">
          ¿Te gustaría salir conmigo? ❤️
        </h1>
        <p className="mx-auto mt-3 max-w-xs text-sm text-muted-foreground">
          {noCount === 0
            ? "Llevo días juntando valor para preguntártelo..."
            : "Piénsalo con el corazón"}
        </p>

        <div className="mt-8 flex flex-col items-center gap-4">
          {!yesFullScreen && (
            <button
              type="button"
              onClick={handleYes}
              className="btn-yes w-full rounded-3xl py-5 font-display font-bold transition-all duration-500 ease-out hover:brightness-110 active:scale-[0.98]"
              style={{ fontSize: `${yesFontSize}rem` }}
            >
              ¡Sí!
            </button>
          )}
          {/* espacio reservado para el botón "No" que vive centrado en la tarjeta */}
          <div className="h-14" aria-hidden="true" />
        </div>
      </section>

      {/* Botón Sí gigante: crece desde el centro hasta abarcar toda la pantalla */}
      {!accepted && yesFullScreen && (
        <button
          type="button"
          onClick={handleYes}
          className="btn-yes fixed z-30 rounded-[3rem] font-display font-bold transition-all duration-500 ease-out"
          style={{
            left: "50%",
            top: "50%",
            transform: "translate(-50%, -50%)",
            width: `${Math.min(46 + (noCount - 2) * 16, 100)}vw`,
            height: `${Math.min(30 + (noCount - 2) * 16, 100)}vh`,
            fontSize: `${yesFontSize}rem`,
          }}
        >
          ¡Sí!
        </button>
      )}

      {/* Botón No: empieza centrado en la tarjeta y luego se mueve por la pantalla */}
      {!accepted && (
        <button
          type="button"
          onPointerDown={(e) => {
            e.preventDefault();
            handleNo();
          }}
          className="fixed z-50 touch-manipulation rounded-2xl border-2 border-primary/40 bg-card px-6 py-3 font-display text-base font-bold text-primary shadow-xl transition-all duration-300 ease-out active:scale-95"
          style={
            noPos
              ? {
                  left: `${noPos.left}vw`,
                  top: `${noPos.top}vh`,
                }
              : {
                  left: "50%",
                  bottom: "22vh",
                  top: "auto",
                  transform: "translateX(-50%)",
                }
          }
        >
          {noLabel}
        </button>
      )}

      {accepted && (
        <section className="animate-pop-in absolute inset-x-4 top-1/2 z-40 mx-auto max-w-md -translate-y-1/2 rounded-4xl card-float p-6 text-center sm:p-8">
          <div className="animate-float-soft mx-auto mb-6 w-full max-w-[17rem] overflow-hidden rounded-3xl border-2 border-foreground/10 bg-white">
            <img
              src={yayImg}
              alt="Pareja de dibujos celebrando con globos y confeti"
              width={1024}
              height={1024}
              loading="lazy"
              className="h-full w-full object-cover"
            />
          </div>
          <h2 className="font-display text-3xl leading-tight font-bold text-primary sm:text-4xl">
            ¡Sabía que dirías que sí! 🥰
          </h2>
          <p className="font-display mt-4 text-lg leading-snug font-bold text-accent-foreground sm:text-xl">
            Dijiste "No" {noCount} {noCount === 1 ? "vez" : "veces"}... pero el corazón ganó 💖
          </p>

          {invitationId && !noteSent && (
            <div className="mt-6 text-left">
              <label
                htmlFor="nota"
                className="font-display text-sm font-bold text-accent-foreground"
              >
                Déjale una notita ✍️
              </label>
              <textarea
                id="nota"
                value={note}
                onChange={(e) => setNote(e.target.value)}
                rows={3}
                maxLength={500}
                placeholder="Escribe algo lindo..."
                className="mt-2 w-full rounded-2xl border border-border bg-background p-3 text-sm outline-none focus:ring-2 focus:ring-ring"
              />
              <button
                type="button"
                onClick={sendNote}
                className="btn-yes mt-3 w-full rounded-2xl py-3 font-display font-bold"
              >
                Enviar 💌
              </button>
            </div>
          )}

          {invitationId && noteSent && (
            <p className="mt-6 font-display text-lg text-accent-foreground">
              ¡Notita enviada! ✨
            </p>
          )}

          {!invitationId && (
            <p className="mt-6 font-display text-lg text-accent-foreground">
              Nuestra primera cita empieza ahora ✨
            </p>
          )}
        </section>
      )}
    </main>
  );
}
