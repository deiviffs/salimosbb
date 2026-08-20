import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";

import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/auth")({
  head: () => ({
    meta: [
      { title: "Acceso privado · Invitaciones" },
      { name: "description", content: "Entra a tu panel para crear y seguir tus invitaciones." },
      { property: "og:title", content: "Acceso privado · Invitaciones" },
      { property: "og:description", content: "Panel privado de invitaciones." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: AuthPage,
});

const emailFor = (username: string) =>
  `${username.trim().toLowerCase().replace(/[^a-z0-9]/g, "")}@invitaciones.local`;

function AuthPage() {
  const navigate = useNavigate();
  const [mode, setMode] = useState<"in" | "up">("in");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    const clean = username.trim().toLowerCase().replace(/[^a-z0-9]/g, "");
    if (clean.length < 3) return setError("El usuario necesita al menos 3 letras o números.");
    if (password.length < 6) return setError("La contraseña necesita al menos 6 caracteres.");

    setBusy(true);
    try {
      if (mode === "up") {
        const { data, error } = await supabase.auth.signUp({
          email: emailFor(clean),
          password,
        });
        if (error) throw error;
        if (data.user) {
          await supabase.from("profiles").insert({ id: data.user.id, username: clean });
        }
      } else {
        const { error } = await supabase.auth.signInWithPassword({
          email: emailFor(clean),
          password,
        });
        if (error) throw error;
      }
      await navigate({ to: "/panel" });
    } catch (err) {
      setError(
        mode === "up"
          ? "No se pudo crear la cuenta. Prueba con otro usuario."
          : "Usuario o contraseña incorrectos.",
      );
      console.error(err);
    } finally {
      setBusy(false);
    }
  }

  return (
    <main className="flex min-h-screen items-center justify-center px-4 py-10">
      <div className="w-full max-w-sm rounded-4xl card-float p-7">
        <h1 className="font-display text-2xl font-bold text-primary">
          {mode === "in" ? "Iniciar sesión" : "Crear cuenta"}
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">Solo usuario y contraseña.</p>

        <form onSubmit={submit} className="mt-6 space-y-3">
          <input
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            placeholder="Usuario"
            autoComplete="username"
            className="w-full rounded-2xl border border-border bg-background px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-ring"
          />
          <input
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            type="password"
            placeholder="Contraseña"
            autoComplete={mode === "in" ? "current-password" : "new-password"}
            className="w-full rounded-2xl border border-border bg-background px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-ring"
          />
          {error && <p className="text-sm text-destructive">{error}</p>}
          <button
            type="submit"
            disabled={busy}
            className="btn-yes w-full rounded-2xl py-3 font-display font-bold disabled:opacity-60"
          >
            {busy ? "Un momento..." : mode === "in" ? "Entrar" : "Crear e ingresar"}
          </button>
        </form>

        <button
          type="button"
          onClick={() => {
            setMode(mode === "in" ? "up" : "in");
            setError(null);
          }}
          className="mt-4 w-full text-sm text-muted-foreground underline"
        >
          {mode === "in" ? "No tengo cuenta, quiero crearla" : "Ya tengo cuenta"}
        </button>
      </div>
    </main>
  );
}
