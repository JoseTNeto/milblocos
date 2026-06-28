import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useAuth } from "@/hooks/use-auth";
import { useCart } from "@/hooks/use-cart";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { formatBRL } from "@/lib/format";
import { getProductImage } from "@/lib/product-images";
import { Trash2 } from "lucide-react";
import { useEffect } from "react";
import { toast } from "sonner";

export const Route = createFileRoute("/carrinho")({
  head: () => ({ meta: [{ title: "Carrinho — Milblocos" }] }),
  component: CartPage,
});

function CartPage() {
  const { user, isWholesale, loading: authLoading } = useAuth();
  const nav = useNavigate();
  const { lines, totalValue, updateQty, remove, clear, loading } = useCart();

  useEffect(() => {
    if (!authLoading && !user) nav({ to: "/auth" });
  }, [user, authLoading, nav]);

  if (loading) return <div className="container-page py-12">Carregando carrinho…</div>;

  if (!lines.length)
    return (
      <div className="container-page py-16 text-center max-w-md mx-auto">
        <h1 className="text-3xl font-bold">Seu carrinho está vazio</h1>
        <p className="mt-2 text-muted-foreground">Explore o catálogo e comece a montar seu pedido.</p>
        <Link to="/loja" className="mt-6 inline-flex"><Button size="lg">Ir para a loja</Button></Link>
      </div>
    );

  return (
    <div className="container-page py-10 grid gap-8 lg:grid-cols-[1fr_360px]">
      <section>
        <h1 className="text-3xl font-bold mb-6">Seu carrinho</h1>
        <ul className="divide-y border rounded-lg bg-card">
          {lines.map((l) => {
            const useWs = isWholesale && l.quantity >= l.product.min_wholesale_qty;
            const price = useWs ? l.product.wholesale_price : l.product.retail_price;
            return (
              <li key={l.id} className="flex gap-4 p-4">
                <img src={getProductImage(l.product.slug, l.product.category?.slug)} alt={l.product.name} className="h-24 w-24 rounded object-cover bg-secondary" width={96} height={96} />
                <div className="flex-1 min-w-0">
                  <Link to="/produto/$slug" params={{ slug: l.product.slug }} className="font-semibold hover:text-primary line-clamp-2">{l.product.name}</Link>
                  <p className="text-xs text-muted-foreground">{formatBRL(price)} / {l.product.unit} {useWs && "· atacado"}</p>
                  <div className="mt-2 flex items-center gap-2">
                    <Input type="number" min={1} value={l.quantity} onChange={(e) => updateQty.mutate({ id: l.id, qty: Math.max(0, Number(e.target.value)) })} className="w-20 h-8" />
                    <Button size="sm" variant="ghost" onClick={() => remove.mutate(l.id)} aria-label="Remover">
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
                <div className="text-right font-semibold">{formatBRL(price * l.quantity)}</div>
              </li>
            );
          })}
        </ul>
      </section>

      <aside className="rounded-lg border bg-card p-6 h-fit shadow-card sticky top-28">
        <h2 className="text-lg font-semibold">Resumo</h2>
        <div className="mt-4 space-y-2 text-sm">
          <div className="flex justify-between"><span>Subtotal</span><span>{formatBRL(totalValue)}</span></div>
          <div className="flex justify-between text-muted-foreground"><span>Frete (Mil-Log)</span><span>a calcular</span></div>
        </div>
        <div className="my-4 border-t" />
        <div className="flex justify-between text-lg font-bold"><span>Total</span><span>{formatBRL(totalValue)}</span></div>
        <Button className="mt-6 w-full" size="lg" onClick={() => toast.info("Checkout online estará disponível em breve. Sua equipe comercial entrará em contato.")}>Finalizar pedido</Button>
        <Button variant="ghost" className="mt-2 w-full" onClick={() => clear.mutate()}>Esvaziar carrinho</Button>
      </aside>
    </div>
  );
}
