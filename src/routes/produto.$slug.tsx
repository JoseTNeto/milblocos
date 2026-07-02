import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/use-auth";
import { useCart } from "@/hooks/use-cart";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { useState } from "react";
import { formatBRL } from "@/lib/format";
import { getProductImage } from "@/lib/product-images";
import { ProductGallery } from "@/components/product-gallery";
import { parseSku, formatDims, getNorma } from "@/lib/sku-parser";

import { ShoppingCart, Truck, ShieldCheck, ArrowLeft } from "lucide-react";

export const Route = createFileRoute("/produto/$slug")({
  component: ProductPage,
});

function ProductPage() {
  const { slug } = Route.useParams();
  const { isWholesale } = useAuth();
  const { add } = useCart();

  const q = useQuery({
    queryKey: ["product", slug],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("products")
        .select("*, category:categories(slug, name)")
        .eq("slug", slug)
        .maybeSingle();
      if (error) throw error;
      return data;
    },
  });

  const [qty, setQty] = useState(1);

  if (q.isLoading) return <div className="container-page py-12">Carregando…</div>;
  if (!q.data) return <div className="container-page py-12">Produto não encontrado.</div>;

  const p = q.data;
  const useWs = isWholesale && qty >= p.min_wholesale_qty;
  const unitPrice = useWs ? p.wholesale_price : p.retail_price;

  return (
    <div className="container-page py-10">
      <Link to="/loja" className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-primary mb-6">
        <ArrowLeft className="h-4 w-4" /> Voltar à loja
      </Link>
      <div className="grid gap-10 md:grid-cols-2">
        <ProductGallery
          mainSrc={getProductImage(p.slug, p.category?.slug, p.image_url)}
          gallery={Array.isArray((p.specs as { gallery?: unknown })?.gallery) ? ((p.specs as { gallery: string[] }).gallery) : []}
          alt={p.name}
        />

        <div>
          <div className="flex items-center gap-2 mb-2">
            {p.is_own_line ? <Badge className="bg-primary text-primary-foreground">Linha própria Milblocos</Badge> : <Badge variant="secondary">{p.brand}</Badge>}
            {p.category && <span className="text-xs text-muted-foreground">/ {p.category.name}</span>}
          </div>
          <h1 className="text-3xl font-bold">{p.name}</h1>
          {p.sku && <p className="text-xs text-muted-foreground mt-1">SKU {p.sku}</p>}

          {p.description && <p className="mt-4 text-muted-foreground">{p.description}</p>}

          {(() => {
            const parsed = parseSku(p.sku);
            const dims = formatDims(parsed.dimsRaw);
            const specs = (p.specs ?? {}) as Record<string, unknown>;
            const peso = specs.peso_kg;
            const pecasPalete = specs.pecas_palete;
            const rows: Array<[string, string]> = [];
            if (parsed.tipoLabel) rows.push(["Categoria", parsed.tipoLabel]);
            if (dims) rows.push(["Dimensões", dims]);
            if (parsed.classe) rows.push(["Classe", parsed.classe]);
            if (parsed.resistencia) rows.push(["Resistência", parsed.resistencia]);
            if (parsed.norma) rows.push(["Norma", parsed.norma]);
            if (typeof peso === "number") rows.push(["Peso unitário", `${peso} kg`]);
            if (typeof pecasPalete === "number") rows.push(["Peças por palete", String(pecasPalete)]);
            if (rows.length === 0) return null;
            return (
              <div className="mt-6 rounded-lg border bg-card p-5">
                <h2 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground mb-3">Ficha técnica</h2>
                <dl className="grid gap-x-6 gap-y-2 text-sm sm:grid-cols-2">
                  {rows.map(([k, v]) => (
                    <div key={k} className="flex justify-between gap-3 border-b border-dashed border-border/60 py-1">
                      <dt className="text-muted-foreground">{k}</dt>
                      <dd className="font-medium text-right">{v}</dd>
                    </div>
                  ))}
                </dl>
              </div>
            );
          })()}

          <div className="mt-6 rounded-lg border p-5 bg-card">
            {isWholesale ? (
              <>
                <div className="flex items-baseline gap-2">
                  <span className="text-3xl font-bold text-primary">{formatBRL(unitPrice)}</span>
                  <span className="text-sm text-muted-foreground">/{p.unit}</span>
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  Preço {useWs ? "atacado" : "varejo"} · atacado a partir de {p.min_wholesale_qty} {p.unit} ({formatBRL(p.wholesale_price)})
                </p>
              </>
            ) : (
              <>
                <div className="flex items-baseline gap-2">
                  <span className="text-3xl font-bold">{formatBRL(p.retail_price)}</span>
                  <span className="text-sm text-muted-foreground">/{p.unit}</span>
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  Tem CNPJ? Pague <strong>{formatBRL(p.wholesale_price)}</strong>/{p.unit} a partir de {p.min_wholesale_qty} {p.unit}.{" "}
                  <Link to="/atacado" className="text-primary hover:underline">Abrir conta atacado</Link>
                </p>
              </>
            )}

            <div className="mt-4 flex items-center gap-3">
              <Input type="number" min={1} value={qty} onChange={(e) => setQty(Math.max(1, Number(e.target.value)))} className="w-24" />
              <Button size="lg" disabled={add.isPending} onClick={() => add.mutate({ productId: p.id, qty })}>
                <ShoppingCart className="h-4 w-4" /> Adicionar — {formatBRL(unitPrice * qty)}
              </Button>
            </div>
          </div>

          <div className="mt-6 grid gap-3 sm:grid-cols-2 text-sm">
            <div className="flex items-start gap-2"><Truck className="h-5 w-5 text-primary mt-0.5" /><span>Entrega com frota própria Mil-Log</span></div>
            <div className="flex items-start gap-2"><ShieldCheck className="h-5 w-5 text-primary mt-0.5" /><span>Produto com garantia de fábrica</span></div>
          </div>
        </div>
      </div>
    </div>
  );
}
