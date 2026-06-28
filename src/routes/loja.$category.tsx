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

function CategoryPage() {
  const { category } = Route.useParams();
  const data = useQuery({
    queryKey: ["category", category],
    queryFn: async () => {
      const { data: cat } = await supabase.from("categories").select("*").eq("slug", category).maybeSingle();
      const { data: products, error } = await supabase
        .from("products")
        .select("id, slug, name, brand, unit, retail_price, wholesale_price, min_wholesale_qty, is_own_line, category:categories(slug, name)")
        .eq("category_id", cat?.id ?? "00000000-0000-0000-0000-000000000000")
        .order("name");
      if (error) throw error;
      return { cat, products: (products as unknown as ProductCardData[]) ?? [] };
    },
  });

  if (data.isLoading) return <p className="text-muted-foreground">Carregando...</p>;
  if (!data.data?.cat) return <p>Categoria não encontrada.</p>;

  return (
    <div>
      <h2 className="text-2xl font-bold">{data.data.cat.name}</h2>
      {data.data.cat.description && <p className="text-muted-foreground mt-1 mb-6">{data.data.cat.description}</p>}
      <div className="grid gap-5 grid-cols-2 md:grid-cols-3 xl:grid-cols-4 mt-6">
        {data.data.products.map((p) => <ProductCard key={p.id} product={p} />)}
        {data.data.products.length === 0 && <p className="text-muted-foreground col-span-full">Nenhum produto nesta categoria ainda.</p>}
      </div>
    </div>
  );
}
