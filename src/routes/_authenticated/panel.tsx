import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect, useState } from "react";

import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/_authenticated/panel")({
  head: () => ({
    meta: [
      { title: "Mi panel de invitaciones" },
      { name: "description", content: "Crea invitaciones y mira las respuestas en tiempo real." },
      { property: "og:title", content: "Mi panel de invitaciones" },
      { property: "og:description", content: "Respuestas en tiempo real de tus invitaciones." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: PanelPage,
});

type Invitation = { id: string; slug: string; recipient: string | null; created_at: string };
type Response = {
  id: string;
  invitation_id: string;
  no_clicks: number;
  accepted: boolean;
  note: string | null;
  updated_at: string;
};

function makeSlug() {
  return Math.random().toString(36).slice(2, 8) + Math.random().toString(36).slice(2, 6);
}

function PanelPage() {
  const navigate = useNavigate();
  const qc = useQueryClient();
  const [recipient, setRecipient] = useState("");
  const [busy, setBusy] = useState(false);
  const [copied, setCopied] = useState<string | null>(null);

  const invitations = useQuery({
    queryKey: ["invitations"],
    queryFn: async (): Promise<Invitation[]> => {
      const { data, error } = await supabase
        .from("invitations")
        .select("id, slug, recipient, created_at")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data ?? [];
    },
  });

  const responses = useQuery({
    queryKey: ["responses"],
    queryFn: async (): Promise<Response[]> => {
      const { data, error } = await supabase
        .from("responses")
        .select("id, invitation_id, no_clicks, accepted, note, updated_at")
        .order("updated_at", { ascending: false });
      if (error) throw error;
      return data ?? [];
    },
  });

  useEffect(() => {
    const channel = supabase
      .channel("panel-responses")
      .on("postgres_changes", { event: "*", schema: "public", table: "responses" }, () => {
        void qc.invalidateQueries({ queryKey: ["responses"] });
      })
      .subscribe();
    return () => {
      void supabase.removeChannel(channel);
    };
  }, [qc]);

  async function createInvitation() {
    setBusy(true);
    try {
      const { data: userData } = await supabase.auth.getUser();
      if (!userData.user) return;
      const { error } = await supabase.from("invitations").insert({
        owner_id: userData.user.id,
        slug: makeSlug(),
        recipient: recipient.trim() || null,
      });
      if (error) throw error;
      setRecipient("");
      await qc.invalidateQueries({ queryKey: ["invitations"] });
    } catch (err) {
      console.error(err);
    } finally {
      setBusy(false);
    }
  }

  async function signOut() {
    await supabase.auth.signOut();
    await navigate({ to: "/" });
  }

  const origin = typeof window !== "undefined" ? window.location.origin : "";

  return (
    <main className="mx-auto min-h-screen w-full max-w-2xl px-4 py-10">
      <div className="flex items-center justify-between gap-3">
        <h1 className="font-display text-2xl font-bold text-primary">Mi panel 💖</h1>
        <button
          onClick={signOut}
          className="rounded-2xl border border-border px-3 py-2 text-sm text-muted-foreground"
        >
          Cerrar sesión
        </button>
      </div>

      <section className="mt-6 rounded-4xl card-float p-5">
        <h2 className="font-display text-lg font-bold text-foreground">Crear invitación</h2>
        <div className="mt-3 flex flex-col gap-2 sm:flex-row">
          <input
            value={recipient}
            onChange={(e) => setRecipient(e.target.value)}
            placeholder="¿Para quién es? (opcional)"
            className="flex-1 rounded-2xl border border-border bg-background px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-ring"
          />
          <button
            onClick={createInvitation}
            disabled={busy}
            className="btn-yes rounded-2xl px-5 py-3 font-display font-bold disabled:opacity-60"
          >
            {busy ? "Creando..." : "Crear link"}
          </button>
        </div>
      </section>

      <section className="mt-6 space-y-4">
        {invitations.isLoading && <p className="text-sm text-muted-foreground">Cargando...</p>}
        {invitations.data?.length === 0 && (
          <p className="text-sm text-muted-foreground">
            Aún no tienes invitaciones. Crea la primera arriba.
          </p>
        )}
        {invitations.data?.map((inv) => {
          const url = `${origin}/i/${inv.slug}`;
          const rows = (responses.data ?? []).filter((r) => r.invitation_id === inv.id);
          return (
            <article key={inv.id} className="rounded-4xl card-float p-5">
              <h3 className="font-display font-bold text-foreground">
                {inv.recipient ? `Para ${inv.recipient}` : "Invitación"}
              </h3>
              <div className="mt-2 flex flex-col gap-2 sm:flex-row sm:items-center">
                <code className="flex-1 truncate rounded-2xl bg-muted px-3 py-2 text-xs">{url}</code>
                <button
                  onClick={() => {
                    void navigator.clipboard.writeText(url);
                    setCopied(inv.id);
                    setTimeout(() => setCopied(null), 1500);
                  }}
                  className="rounded-2xl border border-border px-3 py-2 text-sm"
                >
                  {copied === inv.id ? "¡Copiado!" : "Copiar"}
                </button>
              </div>

              <div className="mt-4 space-y-2">
                {rows.length === 0 && (
                  <p className="text-sm text-muted-foreground">Todavía nadie la ha abierto.</p>
                )}
                {rows.map((r) => (
                  <div key={r.id} className="rounded-2xl bg-muted/60 p-3 text-sm">
                    <p className="font-medium text-foreground">
                      {r.accepted ? "Dijo que SÍ 🥰" : "Sigue pensándolo..."} · dijo &quot;No&quot;{" "}
                      {r.no_clicks} {r.no_clicks === 1 ? "vez" : "veces"}
                    </p>
                    {r.note && <p className="mt-1 text-muted-foreground">Nota: “{r.note}”</p>}
                  </div>
                ))}
              </div>
            </article>
          );
        })}
      </section>
    </main>
  );
}
