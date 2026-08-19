import { createServerFn } from "@tanstack/react-start";

/**
 * Fire-and-forget notification when someone says "Sí".
 * Configure DATE_WEBHOOK_URL as a secret; without it this is a no-op.
 */
export const notifyYes = createServerFn({ method: "POST" })
  .inputValidator((input: { noClicks: number; note?: string }) => ({
    noClicks: Math.max(0, Math.min(9999, Math.floor(input?.noClicks ?? 0))),
    note: (input?.note ?? "").slice(0, 500),
  }))
  .handler(async ({ data }) => {
    const url = process.env["DATE_WEBHOOK_URL"];
    if (!url) return { sent: false as const };

    try {
      await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          event: "date_accepted",
          message: "¡Dijo que sí! 🥰",
          noClicks: data.noClicks,
          note: data.note,
          at: new Date().toISOString(),
        }),
      });
      return { sent: true as const };
    } catch {
      return { sent: false as const };
    }
  });
