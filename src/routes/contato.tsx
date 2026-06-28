import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { Mail, Phone, MapPin } from "lucide-react";

export const Route = createFileRoute("/contato")({
  head: () => ({ meta: [{ title: "Contato — Milblocos Inc." }] }),
  component: Contato,
});

function Contato() {
  const [form, setForm] = useState({ name: "", email: "", phone: "", subject: "", message: "" });
  const [busy, setBusy] = useState(false);
  return (
    <div className="container-page py-16 grid gap-10 md:grid-cols-2 max-w-5xl">
      <div>
        <h1 className="text-3xl md:text-4xl font-bold">Fale com a Milblocos</h1>
        <p className="mt-3 text-muted-foreground">Tire dúvidas sobre produtos, peça orçamento ou solicite atendimento comercial PJ.</p>

        <div className="mt-8 space-y-4 text-sm">
          <div className="flex items-center gap-3"><Phone className="h-5 w-5 text-primary" /> (00) 0000-0000</div>
          <div className="flex items-center gap-3"><Mail className="h-5 w-5 text-primary" /> comercial@milblocos.com.br</div>
          <div className="flex items-center gap-3"><MapPin className="h-5 w-5 text-primary" /> Indústria e CD — informe sua região</div>
        </div>
      </div>
      <form
        className="rounded-xl border bg-card p-6 shadow-card space-y-4"
        onSubmit={async (e) => {
          e.preventDefault();
          setBusy(true);
          const { error } = await supabase.from("contact_messages").insert(form);
          setBusy(false);
          if (error) toast.error(error.message);
          else {
            toast.success("Mensagem enviada! Em breve entraremos em contato.");
            setForm({ name: "", email: "", phone: "", subject: "", message: "" });
          }
        }}
      >
        <div className="space-y-1"><Label>Nome</Label><Input required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} /></div>
        <div className="grid sm:grid-cols-2 gap-3">
          <div className="space-y-1"><Label>Email</Label><Input type="email" required value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} /></div>
          <div className="space-y-1"><Label>Telefone</Label><Input value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} /></div>
        </div>
        <div className="space-y-1"><Label>Assunto</Label><Input value={form.subject} onChange={(e) => setForm({ ...form, subject: e.target.value })} /></div>
        <div className="space-y-1"><Label>Mensagem</Label><Textarea required rows={5} value={form.message} onChange={(e) => setForm({ ...form, message: e.target.value })} /></div>
        <Button type="submit" className="w-full" disabled={busy}>Enviar mensagem</Button>
      </form>
    </div>
  );
}
