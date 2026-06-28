import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useAuth } from "@/hooks/use-auth";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { toast } from "sonner";
import { formatCNPJ, formatCPF, formatPhone } from "@/lib/format";

export const Route = createFileRoute("/auth")({
  head: () => ({ meta: [{ title: "Entrar ou Cadastrar — Milblocos" }] }),
  component: AuthPage,
});

function AuthPage() {
  const { user, loading } = useAuth();
  const nav = useNavigate();
  useEffect(() => {
    if (!loading && user) nav({ to: "/minha-conta" });
  }, [user, loading, nav]);

  return (
    <div className="container-page py-16 max-w-md">
      <h1 className="text-3xl font-bold mb-2">Acesse sua conta</h1>
      <p className="text-muted-foreground mb-8">Entre para acompanhar pedidos ou crie sua conta PF ou PJ.</p>
      <Tabs defaultValue="login">
        <TabsList className="grid grid-cols-2 w-full">
          <TabsTrigger value="login">Entrar</TabsTrigger>
          <TabsTrigger value="signup">Cadastrar</TabsTrigger>
        </TabsList>
        <TabsContent value="login" className="mt-6"><LoginForm /></TabsContent>
        <TabsContent value="signup" className="mt-6"><SignupForm /></TabsContent>
      </Tabs>
    </div>
  );
}

function LoginForm() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  return (
    <form
      className="space-y-4"
      onSubmit={async (e) => {
        e.preventDefault();
        setBusy(true);
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        setBusy(false);
        if (error) toast.error(error.message);
        else toast.success("Bem-vindo de volta!");
      }}
    >
      <div className="space-y-1">
        <Label>Email</Label>
        <Input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} />
      </div>
      <div className="space-y-1">
        <Label>Senha</Label>
        <Input type="password" required value={password} onChange={(e) => setPassword(e.target.value)} />
      </div>
      <Button type="submit" disabled={busy} className="w-full">Entrar</Button>
    </form>
  );
}

function SignupForm() {
  const [personType, setPersonType] = useState<"pf" | "pj">("pf");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [document, setDocument] = useState("");
  const [company, setCompany] = useState("");
  const [phone, setPhone] = useState("");
  const [busy, setBusy] = useState(false);

  return (
    <form
      className="space-y-4"
      onSubmit={async (e) => {
        e.preventDefault();
        setBusy(true);
        const redirectUrl = `${window.location.origin}/minha-conta`;
        const { error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            emailRedirectTo: redirectUrl,
            data: {
              full_name: fullName,
              person_type: personType,
              document: document.replace(/\D/g, ""),
              company_name: personType === "pj" ? company : null,
              phone: phone.replace(/\D/g, ""),
            },
          },
        });
        setBusy(false);
        if (error) toast.error(error.message);
        else {
          toast.success(personType === "pj"
            ? "Cadastro recebido! Sua conta PJ entra em análise para liberação de preço atacado."
            : "Conta criada! Você já pode comprar.");
        }
      }}
    >
      <div>
        <Label className="block mb-2">Tipo de cadastro</Label>
        <RadioGroup value={personType} onValueChange={(v) => setPersonType(v as "pf" | "pj")} className="grid grid-cols-2 gap-2">
          <label className={`flex items-center gap-2 rounded-md border p-3 cursor-pointer ${personType === "pf" ? "border-primary bg-primary/5" : ""}`}>
            <RadioGroupItem value="pf" /> <span className="text-sm font-medium">PF — Varejo</span>
          </label>
          <label className={`flex items-center gap-2 rounded-md border p-3 cursor-pointer ${personType === "pj" ? "border-primary bg-primary/5" : ""}`}>
            <RadioGroupItem value="pj" /> <span className="text-sm font-medium">PJ — Atacado</span>
          </label>
        </RadioGroup>
      </div>

      <div className="space-y-1">
        <Label>{personType === "pj" ? "Nome do responsável" : "Nome completo"}</Label>
        <Input required value={fullName} onChange={(e) => setFullName(e.target.value)} />
      </div>

      {personType === "pj" && (
        <div className="space-y-1">
          <Label>Razão social</Label>
          <Input required value={company} onChange={(e) => setCompany(e.target.value)} />
        </div>
      )}

      <div className="space-y-1">
        <Label>{personType === "pj" ? "CNPJ" : "CPF"}</Label>
        <Input
          required
          value={document}
          onChange={(e) => setDocument(personType === "pj" ? formatCNPJ(e.target.value) : formatCPF(e.target.value))}
        />
      </div>

      <div className="space-y-1">
        <Label>Telefone</Label>
        <Input value={phone} onChange={(e) => setPhone(formatPhone(e.target.value))} />
      </div>

      <div className="space-y-1">
        <Label>Email</Label>
        <Input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} />
      </div>

      <div className="space-y-1">
        <Label>Senha</Label>
        <Input type="password" required minLength={8} value={password} onChange={(e) => setPassword(e.target.value)} />
      </div>

      {personType === "pj" && (
        <p className="text-xs text-muted-foreground bg-warning/10 border border-warning/30 rounded p-3">
          Contas PJ passam por aprovação manual antes de visualizar a tabela de atacado.
        </p>
      )}

      <Button type="submit" disabled={busy} className="w-full">Criar conta</Button>
    </form>
  );
}
