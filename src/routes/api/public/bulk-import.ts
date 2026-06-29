import { createFileRoute } from "@tanstack/react-router";
import prods from "@/data/prods.json";

const CATS: Record<string, string> = {
  BE: "40faa634-93e0-4fb7-931d-cf57bfc1fc7d",
  BV: "d36b9c41-244b-459f-aa5e-0462a854ea88",
  PV: "c5918b1f-640d-4c9b-88e1-821b5a196752",
  LA: "c883a653-d2dc-4baf-bda6-ef1f9ed21ce7",
  DS: "11111111-1111-1111-1111-111111111111",
  TL: "22222222-2222-2222-2222-222222222222",
};

function slugify(s: string) {
  return s
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^A-Za-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "")
    .toLowerCase();
}

export const Route = createFileRoute("/api/public/bulk-import")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const token = request.headers.get("x-import-token");
        if (token !== "milblocos-import-2026") {
          return new Response("Unauthorized", { status: 401 });
        }
        const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
        const rows = (prods as Array<[string, string, string, number, number, number, number]>).map(
          ([slug, name, sku, cat, retail, wholesale, minQty, peso]: any) => ({
            slug: slugify(slug) + "-" + Math.random().toString(36).slice(2, 8),
            name,
            sku,
            category_id: CATS[cat] ?? CATS.LA,
            brand: "Milblocos",
            unit: "un",
            retail_price: retail,
            wholesale_price: wholesale,
            min_wholesale_qty: minQty,
            is_own_line: true,
            in_stock: true,
            specs: { peso_kg: peso, pecas_palete: minQty },
          }),
        );

        // Insert in chunks of 500
        let inserted = 0;
        const errors: string[] = [];
        for (let i = 0; i < rows.length; i += 500) {
          const chunk = rows.slice(i, i + 500);
          const { error, count } = await supabaseAdmin
            .from("products")
            .insert(chunk, { count: "exact" });
          if (error) {
            errors.push(`chunk ${i}: ${error.message}`);
          } else {
            inserted += count ?? chunk.length;
          }
        }
        return new Response(
          JSON.stringify({ inserted, total: rows.length, errors }),
          { headers: { "content-type": "application/json" } },
        );
      },
    },
  },
});
