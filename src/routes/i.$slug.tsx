import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";

import { AskCard } from "@/components/AskCard";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/i/$slug")({
  head: () => ({
    meta: [
      { title: "Tengo algo que preguntarte ❤️" },
      {
        name: "description",
        content: "Alguien te envió una invitación muy especial. Ábrela con el corazón.",
      },
      { property: "og:title", content: "Tengo algo que preguntarte ❤️" },
      { property: "og:description", content: "Una invitación hecha con mucho cariño 💖" },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: InvitePage,
  errorComponent: () => <Fallback />,
  notFoundComponent: () => <Fallback />,
});

function Fallback() {
  return (
    <main className="flex min-h-screen items-center justify-center p-6 text-center">
      <p className="font-display text-xl text-primary">Esta invitación no existe 💔</p>
    </main>
  );
}

function InvitePage() {
  const { slug } = Route.useParams();
  const { data, isLoading } = useQuery({
    queryKey: ["invitation", slug],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("invitations")
        .select("id")
        .eq("slug", slug)
        .maybeSingle();
      if (error) throw error;
      return data;
    },
  });

  if (isLoading) {
    return (
      <main className="flex min-h-screen items-center justify-center p-6">
        <p className="font-display text-lg text-muted-foreground">Abriendo la invitación...</p>
      </main>
    );
  }

  if (!data) return <Fallback />;

  return <AskCard invitationId={data.id} />;
}
