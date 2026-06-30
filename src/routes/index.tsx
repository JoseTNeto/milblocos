import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { ArrowRight, Truck, Factory, Package, ShieldCheck } from "lucide-react";
import hero from "@/assets/hero-industrial.jpg";
import frota from "@/assets/frota-mil-log.jpg";
import { supabase } from "@/integrations/supabase/client";
import { ProductCard, type ProductCardData } from "@/components/product-card";
import { Button } from "@/components/ui/button";
import { getProductImage } from "@/lib/product-images";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Milblocos Inc. — Indústria de Blocos e Pavers" },
      { name: "description", content: "Fábrica completa de blocos estruturais, vedação, pavers e linha arquitetura. Revenda de Tigre, Votorantim, Pial e mais. Atacado PJ e varejo." },
    ],
  }),
  component: Home,
});

interface Category { id: string; slug: string; name: string; description: string | null; is_own_line: boolean; }

function Home() {
  const featured = useQuery({
    queryKey: ["featured-products"],
    queryFn: async (): Promise<ProductCardData[]> => {
      const { data, error } = await supabase
        .from("products")
        .select("id, slug, name, brand, unit, retail_price, wholesale_price, min_wholesale_qty, is_own_line, image_url, category:categories(slug, name)")
        .eq("featured", true)
        .limit(8);
      if (error) throw error;
      return (data as unknown as ProductCardData[]) ?? [];
    },
  });

  const cats = useQuery({
    queryKey: ["categories"],
    queryFn: async (): Promise<Category[]> => {
      const { data, error } = await supabase.from("categories").select("*").order("sort_order");
      if (error) throw error;
      return (data as Category[]) ?? [];
    },
  });

  return (
    <>
      {/* HERO */}
      <section className="relative isolate overflow-hidden">
        <img src={hero} alt="" className="absolute inset-0 -z-10 h-full w-full object-cover" width={1920} height={1080} />
        <div className="absolute inset-0 -z-10 bg-gradient-to-r from-primary-deep/95 via-primary-deep/80 to-primary-deep/40" />
        <div className="container-page py-24 md:py-32 text-primary-foreground">
          <div className="max-w-2xl">
            <span className="inline-block rounded-full bg-warning px-3 py-1 text-xs font-bold uppercase tracking-wider text-warning-foreground">
              Direto da indústria
            </span>
            <h1 className="mt-4 text-4xl md:text-6xl font-bold leading-[1.05]">
              Blocos, pavers e arquitetura cimentícia para a sua obra.
            </h1>
            <p className="mt-5 max-w-xl text-base md:text-lg text-primary-foreground/85">
              Linha própria de blocos estruturais, vedação, pavimentação e cobogós arquitetônicos. Revenda completa de Tigre, Votorantim, Pial, Meber, Fame e Lafont. Atacado PJ com preços diferenciados.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link to="/loja">
                <Button size="lg" className="bg-warning text-warning-foreground hover:bg-warning/90">
                  Comprar agora <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>
              <Link to="/atacado">
                <Button size="lg" variant="outline" className="border-primary-foreground/40 bg-transparent text-primary-foreground hover:bg-primary-foreground/10">
                  Conta atacado PJ
                </Button>
              </Link>
            </div>
            <dl className="mt-10 grid grid-cols-3 gap-6 max-w-md">
              <div><dt className="text-2xl font-bold">+1M</dt><dd className="text-xs text-primary-foreground/75">peças/mês</dd></div>
              <div><dt className="text-2xl font-bold">80</dt><dd className="text-xs text-primary-foreground/75">veículos próprios</dd></div>
              <div><dt className="text-2xl font-bold">100%</dt><dd className="text-xs text-primary-foreground/75">linha própria</dd></div>
            </dl>
          </div>
        </div>
      </section>

      {/* Pillars */}
      <section className="container-page py-16">
        <div className="grid gap-6 md:grid-cols-4">
          {[
            { icon: Factory, t: "Fábrica própria", d: "Controle total da produção da linha cimentícia." },
            { icon: Package, t: "Revenda completa", d: "Grandes marcas Tigre, Votorantim, Pial e mais." },
            { icon: Truck, t: "Mil-Log entrega", d: "60 caminhões Volvo + 20 furgões Hiace." },
            { icon: ShieldCheck, t: "Atacado PJ", d: "Preços e condições especiais com cadastro PJ." },
          ].map((p) => (
            <div key={p.t} className="rounded-lg border bg-card p-5 shadow-card">
              <p.icon className="h-7 w-7 text-primary mb-3" />
              <h3 className="font-semibold">{p.t}</h3>
              <p className="text-sm text-muted-foreground mt-1">{p.d}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Categories */}
      <section className="container-page py-10">
        <div className="flex items-end justify-between mb-6">
          <div>
            <h2 className="text-3xl font-bold">Navegue por categoria</h2>
            <p className="text-muted-foreground mt-1">Linha própria de cimentícios e revenda industrializada.</p>
          </div>
          <Link to="/loja" className="hidden sm:inline-flex text-sm font-medium text-primary hover:underline">Ver tudo →</Link>
        </div>
        <div className="grid gap-4 grid-cols-2 md:grid-cols-4">
          {cats.data?.map((c) => (
            <Link
              key={c.id}
              to="/loja/$category"
              params={{ category: c.slug }}
              className="group relative overflow-hidden rounded-lg border bg-card shadow-card hover:shadow-lift transition"
            >
              <div className="aspect-[4/3] overflow-hidden bg-secondary">
                <img src={getProductImage("", c.slug)} alt={c.name} loading="lazy" width={400} height={300} className="h-full w-full object-cover transition duration-500 group-hover:scale-105" />
              </div>
              <div className="p-4">
                <div className="flex items-center justify-between">
                  <h3 className="font-semibold text-sm">{c.name}</h3>
                  {c.is_own_line && <span className="rounded bg-primary/10 px-2 py-0.5 text-[10px] font-semibold text-primary">PRÓPRIA</span>}
                </div>
                <p className="text-xs text-muted-foreground mt-1 line-clamp-2">{c.description}</p>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* Featured products */}
      <section className="container-page py-16">
        <div className="flex items-end justify-between mb-6">
          <div>
            <h2 className="text-3xl font-bold">Em destaque</h2>
            <p className="text-muted-foreground mt-1">Os mais pedidos do nosso catálogo.</p>
          </div>
        </div>
        <div className="grid gap-5 grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
          {featured.data?.map((p) => <ProductCard key={p.id} product={p} />)}
        </div>
      </section>

      {/* Mil-Log CTA */}
      <section className="relative isolate overflow-hidden">
        <img src={frota} alt="" className="absolute inset-0 -z-10 h-full w-full object-cover" loading="lazy" width={1600} height={900} />
        <div className="absolute inset-0 -z-10 bg-gradient-to-r from-primary-deep/95 to-primary-deep/40" />
        <div className="container-page py-20 text-primary-foreground">
          <div className="max-w-xl">
            <p className="text-warning text-sm font-bold uppercase tracking-widest">Mil-Log · Logística em movimento</p>
            <h2 className="mt-3 text-4xl font-bold">Frota própria que entrega no prazo.</h2>
            <p className="mt-4 text-primary-foreground/85">
              60 caminhões Volvo (carretas e médios) e 20 furgões Toyota Hiace dedicados ao escoamento da fábrica e às suas obras.
            </p>
            <Link to="/mil-log" className="mt-6 inline-flex"><Button size="lg" variant="secondary">Conhecer a Mil-Log</Button></Link>
          </div>
        </div>
      </section>
    </>
  );
}
