import { createFileRoute } from "@tanstack/react-router";
import hero from "@/assets/hero-industrial.jpg";

export const Route = createFileRoute("/sobre")({
  head: () => ({ meta: [{ title: "A Indústria — Milblocos Inc." }, { name: "description", content: "Conheça a Milblocos Inc.: indústria completa de blocos cimentícios, pavers e linha arquitetura." }] }),
  component: Sobre,
});

function Sobre() {
  return (
    <>
      <section className="relative isolate">
        <img src={hero} alt="" width={1920} height={1080} className="absolute inset-0 -z-10 h-72 w-full object-cover" />
        <div className="absolute inset-0 -z-10 bg-primary-deep/80 h-72" />
        <div className="container-page py-20 text-primary-foreground">
          <h1 className="text-4xl md:text-5xl font-bold">A indústria</h1>
          <p className="mt-3 max-w-2xl text-primary-foreground/85">Produção verticalizada de toda a linha de blocos cimentícios e pavers, com presença forte também na linha arquitetura.</p>
        </div>
      </section>

      <article className="container-page py-16 grid gap-10 md:grid-cols-3">
        <div className="md:col-span-2 space-y-6 text-foreground/90 leading-relaxed">
          <p>A <strong>Milblocos Inc.</strong> é uma indústria cimentícia com produção completa da linha de blocos estruturais, blocos de vedação, pavers intertravados e elementos da linha arquitetura com design diferenciado.</p>
          <p>Em paralelo à fábrica, operamos a revenda de itens industrializados de grandes marcas — <strong>Tigre, Votorantim, Fame, Pial, Meber e Lafont</strong> — para oferecer ao cliente um catálogo completo de obra em um só pedido.</p>
          <p>Nosso modelo comercial atende dois públicos: <strong>atacado PJ</strong> (com cadastro empresarial validado e tabela de preços diferenciada) e <strong>varejo PF</strong>, em formato de atacarejo focado em itens próprios cimentícios.</p>
          <p>A operação é sustentada pela <strong>Mil-Log</strong>, nossa logística própria, com 60 caminhões Volvo (carretas e médios) e 20 furgões Toyota Hiace.</p>
        </div>

        <aside className="space-y-4">
          {[
            { n: "60", l: "Caminhões Volvo" },
            { n: "20", l: "Furgões Hiace" },
            { n: "+1M", l: "Peças/mês" },
            { n: "8", l: "Categorias de produto" },
          ].map((s) => (
            <div key={s.l} className="rounded-lg border bg-card p-5 shadow-card">
              <div className="text-3xl font-bold text-primary">{s.n}</div>
              <div className="text-sm text-muted-foreground">{s.l}</div>
            </div>
          ))}
        </aside>
      </article>
    </>
  );
}
