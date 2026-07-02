import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { ProductCard, type ProductCardData } from "@/components/product-card";

export const Route = createFileRoute("/loja/$category")({
  head: ({ params }) => ({
    meta: [
      { title: `Categoria ${params.category} — Milblocos` },
    ],
  }),
  component: CategoryPage,
});

function subgroupArquitetura(p: ProductCardData): "Blocos" | "Pavers" | "Especiais" {
  const n = p.name.toLowerCase();
  if (n.includes("lajota") || n.includes("paver")) return "Pavers";
  if (n.includes("abobadilha") || n.includes("floreira") || n.includes("especial")) return "Especiais";
  return "Blocos";
}

function CategoryPage() {
  const { category } = Route.useParams();
  const data = useQuery({
    queryKey: ["category", category],
    queryFn: async () => {
      const { data: cat } = await supabase.from("categories").select("*").eq("slug", category).maybeSingle();
      const { data: products, error } = await supabase
        .from("products")
        .select("id, slug, name, brand, unit, retail_price, wholesale_price, min_wholesale_qty, is_own_line, image_url, category:categories(slug, name)")
        .eq("category_id", cat?.id ?? "00000000-0000-0000-0000-000000000000")
        .order("name");
      if (error) throw error;
      return { cat, products: (products as unknown as ProductCardData[]) ?? [] };
    },
  });

  if (data.isLoading) return <p className="text-muted-foreground">Carregando...</p>;
  if (!data.data?.cat) return <p>Categoria não encontrada.</p>;

  const products = data.data.products;
  const isArquitetura = category === "linha-arquitetura";

  const grouped: Record<string, ProductCardData[]> = {};
  if (isArquitetura) {
    for (const p of products) {
      const g = subgroupArquitetura(p);
      (grouped[g] ??= []).push(p);
    }
  }

  return (
    <div>
      <h2 className="text-2xl font-bold">{data.data.cat.name}</h2>
      {data.data.cat.description && <p className="text-muted-foreground mt-1 mb-6">{data.data.cat.description}</p>}

      {isArquitetura ? (
        <div className="mt-6 space-y-10">
          {(["Blocos", "Pavers", "Especiais"] as const).map((g) =>
            grouped[g]?.length ? (
              <section key={g}>
                <h3 className="text-lg font-semibold mb-4 pb-2 border-b">{g}</h3>
                <div className="grid gap-5 grid-cols-2 md:grid-cols-3 xl:grid-cols-4">
                  {grouped[g].map((p) => <ProductCard key={p.id} product={p} />)}
                </div>
              </section>
            ) : null
          )}
          {products.length === 0 && <p className="text-muted-foreground">Nenhum produto nesta categoria ainda.</p>}
        </div>
      ) : (
        <div className="grid gap-5 grid-cols-2 md:grid-cols-3 xl:grid-cols-4 mt-6">
          {products.map((p) => <ProductCard key={p.id} product={p} />)}
          {products.length === 0 && <p className="text-muted-foreground col-span-full">Nenhum produto nesta categoria ainda.</p>}
        </div>
      )}
    </div>
  );
}
