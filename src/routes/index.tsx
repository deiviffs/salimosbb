import { createFileRoute } from "@tanstack/react-router";

import { AskCard } from "@/components/AskCard";
import { SecretHeart } from "@/components/SecretHeart";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "¿Te gustaría salir conmigo? ❤️" },
      {
        name: "description",
        content:
          "Una pregunta muy especial, con corazones y un botón de 'Sí' que no deja de crecer.",
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

function Index() {
  return (
    <>
      <SecretHeart />
      <AskCard />
    </>
  );
}
