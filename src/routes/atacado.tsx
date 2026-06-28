import { createFileRoute, Link } from "@tanstack/react-router";
import { CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/atacado")({
  head: () => ({ meta: [{ title: "Atacado PJ — Milblocos" }, { name: "description", content: "Cadastro PJ com tabela de preços de atacado, condições especiais e atendimento dedicado." }] }),
  component: Atacado,
});

function Atacado() {
  return (
    <div className="container-page py-16 max-w-4xl">
      <span className="inline-block rounded-full bg-warning px-3 py-1 text-xs font-bold uppercase tracking-wider text-warning-foreground">Para construtoras, lojistas e empreiteiros</span>
      <h1 className="mt-4 text-4xl md:text-5xl font-bold">Conta Atacado PJ</h1>
      <p className="mt-3 text-lg text-muted-foreground max-w-2xl">
        Cadastre seu CNPJ e tenha acesso a preços diferenciados em toda a loja, com condições especiais para volumes a partir das quantidades mínimas de cada produto.
      </p>

      <div className="mt-10 grid gap-4 md:grid-cols-2">
        {[
          "Tabela de preços exclusiva de atacado",
          "Quantidades mínimas a partir de 50 / 100 / 500 un",
          "Atendimento comercial dedicado",
          "Entrega com frota Mil-Log",
          "Linha própria + revenda no mesmo pedido",
          "Faturamento e nota fiscal para a empresa",
        ].map((t) => (
          <div key={t} className="flex items-start gap-2 rounded-lg border bg-card p-4 shadow-card">
            <CheckCircle2 className="h-5 w-5 text-primary mt-0.5" />
            <span className="text-sm">{t}</span>
          </div>
        ))}
      </div>

      <div className="mt-10 rounded-xl border bg-primary-deep text-primary-foreground p-8">
        <h2 className="text-2xl font-bold">Como funciona</h2>
        <ol className="mt-4 space-y-3 text-sm text-primary-foreground/90 list-decimal list-inside">
          <li>Cadastre-se como Pessoa Jurídica informando CNPJ, razão social e inscrição estadual.</li>
          <li>Nossa equipe analisa e aprova sua conta em até 1 dia útil.</li>
          <li>Pronto: ao logar, a loja já exibirá os preços de atacado.</li>
        </ol>
        <Link to="/auth" search={{ tab: "signup", type: "pj" } as never} className="mt-6 inline-flex">
          <Button size="lg" variant="secondary">Abrir conta PJ agora</Button>
        </Link>
      </div>
    </div>
  );
}
