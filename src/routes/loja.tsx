import { createFileRoute, Link, Outlet, useMatchRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { ProductCard, type ProductCardData } from "@/components/product-card";
import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";
import { useState } from "react";

export const Route = createFileRoute("/loja")({
  head: () => ({
    meta: [
      { title: "Loja — Milblocos Inc." },
      { name: "description", content: "Catálogo completo: blocos, pavers, linha arquitetura e materiais industrializados Tigre, Votorantim, Pial." },
    ],
  }),
  component: LojaLayout,
});

interface Category { id: string; slug: string; name: string; is_own_line: boolean; }

function LojaLayout() {
  const matchRoute = useMatchRoute();
  const isCategoryRoute = !!matchRoute({ to: "/loja/$category" });
  const cats = useQuery({
    queryKey: ["categories"],
    queryFn: async (): Promise<Category[]> => {
      const { data, error } = await supabase.from("categories").select("*").order("sort_order");
      if (error) throw error;
      return (data as Category[]) ?? [];
    },
  });
  const [q, setQ] = useState("");
  const search = useQuery({
    enabled: q.trim().length > 1,
    queryKey: ["search", q],
    queryFn: async (): Promise<ProductCardData[]> => {
      const { data, error } = await supabase
        .from("products")
        .select("id, slug, name, brand, unit, retail_price, wholesale_price, min_wholesale_qty, is_own_line, category:categories(slug, name)")
        .ilike("name", `%${q}%`)
        .limit(24);
      if (error) throw error;
      return (data as unknown as ProductCardData[]) ?? [];
    },
  });

  return (
    <div className="container-page py-10">
      <header className="mb-8">
        <h1 className="text-3xl md:text-4xl font-bold">Loja Milblocos</h1>
        <p className="text-muted-foreground mt-1">Cimentícios direto da fábrica + materiais industrializados.</p>
      </header>

      <div className="grid gap-8 lg:grid-cols-[240px_1fr]">
        <aside className="space-y-6">
          <div>
            <h3 className="text-sm font-semibold mb-2 uppercase tracking-wider text-muted-foreground">Buscar</h3>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input value={q} onChange={(e) => setQ(e.target.value)} placeholder="ex: bloco, paver, cimento..." className="pl-9" />
            </div>
          </div>
          <div>
            <h3 className="text-sm font-semibold mb-2 uppercase tracking-wider text-muted-foreground">Linha própria</h3>
            <nav className="space-y-1">
              {cats.data?.filter((c) => c.is_own_line).map((c) => (
                <Link key={c.id} to="/loja/$category" params={{ category: c.slug }} className="block rounded px-2 py-1.5 text-sm hover:bg-accent" activeProps={{ className: "bg-primary/10 text-primary font-semibold" }}>
                  {c.name}
                </Link>
              ))}
            </nav>
          </div>
          <div>
            <h3 className="text-sm font-semibold mb-2 uppercase tracking-wider text-muted-foreground">Revenda</h3>
            <nav className="space-y-1">
              {cats.data?.filter((c) => !c.is_own_line).map((c) => (
                <Link key={c.id} to="/loja/$category" params={{ category: c.slug }} className="block rounded px-2 py-1.5 text-sm hover:bg-accent" activeProps={{ className: "bg-primary/10 text-primary font-semibold" }}>
                  {c.name}
                </Link>
              ))}
            </nav>
          </div>
        </aside>

        <section>
          {q.trim().length > 1 ? (
            <>
              <h2 className="text-lg font-semibold mb-4">Resultados para “{q}”</h2>
              <div className="grid gap-5 grid-cols-2 md:grid-cols-3 xl:grid-cols-4">
                {search.data?.map((p) => <ProductCard key={p.id} product={p} />)}
              </div>
            </>
          ) : isCategoryRoute ? (
            <Outlet />
          ) : (
            <AllProducts />
          )}
        </section>
      </div>
    </div>
  );
}

function AllProducts() {
  const list = useQuery({
    queryKey: ["all-products"],
    queryFn: async (): Promise<ProductCardData[]> => {
      const { data, error } = await supabase
        .from("products")
        .select("id, slug, name, brand, unit, retail_price, wholesale_price, min_wholesale_qty, is_own_line, category:categories(slug, name)")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return (data as unknown as ProductCardData[]) ?? [];
    },
  });
  return (
    <div className="grid gap-5 grid-cols-2 md:grid-cols-3 xl:grid-cols-4">
      {list.data?.map((p) => <ProductCard key={p.id} product={p} />)}
    </div>
  );
}
