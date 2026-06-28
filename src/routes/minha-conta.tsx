import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect } from "react";
import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

export const Route = createFileRoute("/minha-conta")({
  head: () => ({ meta: [{ title: "Minha Conta — Milblocos" }] }),
  component: Account,
});

function Account() {
  const { user, profile, isWholesale, roles, signOut, loading } = useAuth();
  const nav = useNavigate();
  useEffect(() => {
    if (!loading && !user) nav({ to: "/auth" });
  }, [user, loading, nav]);

  if (!profile) return <div className="container-page py-12">Carregando…</div>;

  return (
    <div className="container-page py-12 max-w-3xl">
      <h1 className="text-3xl font-bold">Olá, {profile.full_name?.split(" ")[0] ?? "cliente"}</h1>
      <p className="text-muted-foreground mt-1">{profile.email}</p>

      <div className="mt-6 flex flex-wrap gap-2">
        <Badge>{profile.person_type === "pj" ? "Pessoa Jurídica" : "Pessoa Física"}</Badge>
        {isWholesale && <Badge className="bg-warning text-warning-foreground">Atacado liberado</Badge>}
        {profile.person_type === "pj" && !profile.approved && (
          <Badge variant="destructive">Aguardando aprovação</Badge>
        )}
        {roles.includes("admin") && <Badge variant="secondary">Admin</Badge>}
      </div>

      <div className="mt-8 grid gap-4 md:grid-cols-2">
        <div className="rounded-lg border p-5 bg-card">
          <h3 className="font-semibold">Dados cadastrais</h3>
          <dl className="mt-3 space-y-1 text-sm text-muted-foreground">
            {profile.company_name && <div><dt className="inline font-medium text-foreground">Empresa: </dt><dd className="inline">{profile.company_name}</dd></div>}
            <div><dt className="inline font-medium text-foreground">{profile.person_type === "pj" ? "CNPJ" : "CPF"}: </dt><dd className="inline">{profile.document}</dd></div>
            {profile.phone && <div><dt className="inline font-medium text-foreground">Telefone: </dt><dd className="inline">{profile.phone}</dd></div>}
          </dl>
        </div>
        <div className="rounded-lg border p-5 bg-card">
          <h3 className="font-semibold">Atalhos</h3>
          <div className="mt-3 flex flex-col gap-2">
            <Link to="/carrinho" className="text-primary hover:underline text-sm">Meu carrinho</Link>
            <Link to="/loja" className="text-primary hover:underline text-sm">Voltar à loja</Link>
          </div>
        </div>
      </div>

      {profile.person_type === "pj" && !profile.approved && (
        <p className="mt-6 rounded border border-warning/40 bg-warning/10 p-4 text-sm">
          Sua conta PJ está em análise. Assim que aprovada, todos os preços passarão a ser exibidos em modo atacado.
        </p>
      )}

      <Button variant="outline" className="mt-8" onClick={signOut}>Sair</Button>
    </div>
  );
}
