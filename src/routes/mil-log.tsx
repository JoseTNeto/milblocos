import { createFileRoute } from "@tanstack/react-router";
import frota from "@/assets/frota-mil-log.jpg";
import milLogLogo from "@/assets/logo-mil-log.png";
import { Truck, Package, MapPin, Clock } from "lucide-react";

export const Route = createFileRoute("/mil-log")({
  head: () => ({ meta: [
    { title: "Mil-Log — Logística em Movimento | Milblocos" },
    { name: "description", content: "Frota própria com 60 caminhões Volvo e 20 furgões Toyota Hiace. Entrega rápida da fábrica à sua obra." },
  ] }),
  component: MilLog,
});

function MilLog() {
  return (
    <>
      <section className="relative isolate">
        <img src={frota} alt="" width={1600} height={900} className="absolute inset-0 -z-10 h-[480px] w-full object-cover" />
        <div className="absolute inset-0 -z-10 bg-primary-deep/75 h-[480px]" />
        <div className="container-page py-24 text-primary-foreground">
          <img src={milLog.url} alt="Mil-Log" className="h-28 w-auto mb-4" width={112} height={112} />
          <h1 className="text-4xl md:text-5xl font-bold">Mil-Log · Logística em movimento</h1>
          <p className="mt-3 max-w-xl text-lg text-primary-foreground/85">
            A operação logística própria que faz a Milblocos chegar ao canteiro de obras no prazo.
          </p>
        </div>
      </section>

      <section className="container-page py-16 grid gap-6 md:grid-cols-4">
        {[
          { i: Truck, t: "60 caminhões Volvo", d: "Carretas e médios para cargas pesadas." },
          { i: Package, t: "20 furgões Hiace", d: "Toyota Hiace para entregas ágeis no varejo." },
          { i: MapPin, t: "Roteirização própria", d: "Otimização de rotas e cargas." },
          { i: Clock, t: "Janela de entrega", d: "Programação combinada com a obra." },
        ].map((x) => (
          <div key={x.t} className="rounded-lg border bg-card p-6 shadow-card">
            <x.i className="h-8 w-8 text-primary mb-3" />
            <h3 className="font-semibold">{x.t}</h3>
            <p className="text-sm text-muted-foreground mt-1">{x.d}</p>
          </div>
        ))}
      </section>

      <section className="container-page pb-16 grid gap-10 md:grid-cols-2 items-center">
        <div>
          <h2 className="text-3xl font-bold">Frota Volvo + Toyota Hiace</h2>
          <p className="mt-4 text-muted-foreground leading-relaxed">
            A Mil-Log padroniza sua frota com Volvo para o transporte pesado de blocos, pavers e materiais industrializados, garantindo segurança, manutenção previsível e respeito ao prazo de entrega.
          </p>
          <p className="mt-3 text-muted-foreground leading-relaxed">
            Para entregas urbanas e cargas menores, os 20 furgões Toyota Hiace asseguram agilidade no atendimento ao varejo e pequenas obras.
          </p>
        </div>
        <img src={frota} alt="Frota Mil-Log" loading="lazy" width={1600} height={900} className="rounded-xl shadow-lift" />
      </section>
    </>
  );
}
