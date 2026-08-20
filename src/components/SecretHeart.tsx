import { useRef } from "react";
import { useNavigate } from "@tanstack/react-router";

/**
 * Acceso discreto al panel. Requiere doble toque para evitar aperturas
 * accidentales cuando el botón "¡Sí!" ocupa toda la pantalla.
 */
export function SecretHeart() {
  const navigate = useNavigate();
  const last = useRef(0);

  return (
    <button
      type="button"
      aria-label="Acceso privado"
      title="Doble toque"
      onClick={() => {
        const now = Date.now();
        if (now - last.current < 900) {
          void navigate({ to: "/auth" });
        }
        last.current = now;
      }}
      className="fixed top-4 right-4 z-20 flex h-10 w-10 items-center justify-center rounded-full bg-card/70 text-lg opacity-40 shadow-sm transition hover:opacity-100"
    >
      🤍
    </button>
  );
}
