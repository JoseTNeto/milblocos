import { useState } from "react";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/use-auth";
import { formatBRL } from "@/lib/format";
import { toast } from "sonner";
import {
  LayoutDashboard, Building2, Package, ShoppingCart, MessageSquare,
  LogOut, Menu, Check, X, Pencil, ChevronRight, ChevronDown,
  Image as ImageIcon, AlertCircle, ShieldAlert
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Sheet, SheetContent, SheetTrigger, SheetHeader, SheetTitle } from "@/components/ui/sheet";

export const Route = createFileRoute("/admin")({
  component: AdminPage,
});

function formatDate(date: string | null) {
  if (!date) return "-";
  return new Date(date).toLocaleDateString("pt-BR");
}

export default function AdminPage() {
  const { user, profile, roles, loading } = useAuth();
  const navigate = useNavigate();

  if (loading) {
    return <div className="flex items-center justify-center min-h-screen"><p className="text-lg text-muted-foreground">Carregando...</p></div>;
  }
  if (!user || !roles.includes("admin")) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen gap-4">
        <ShieldAlert className="h-12 w-12 text-destructive" />
        <h1 className="text-2xl font-bold">Acesso negado</h1>
        <p className="text-muted-foreground">Você não tem permissão para acessar esta área.</p>
        <Button onClick={() => navigate({ to: "/" })}>Voltar para a loja</Button>
      </div>
    );
  }
  return <AdminLayout profileName={profile?.full_name || user.email || "Admin"} />;
}

// LAYOUT
function AdminLayout({ profileName }: { profileName: string }) {
  const [activeTab, setActiveTab] = useState("dashboard");
  const [mobileOpen, setMobileOpen] = useState(false);
  const { signOut } = useAuth();

  const NAV_ITEMS = [
    { value: "dashboard", label: "Dashboard", icon: LayoutDashboard },
    { value: "pj", label: "PJ Pendentes", icon: Building2 },
    { value: "produtos", label: "Produtos", icon: Package },
    { value: "pedidos", label: "Pedidos", icon: ShoppingCart },
    { value: "mensagens", label: "Mensagens", icon: MessageSquare },
  ];

  const SidebarContent = () => (
    <nav className="flex flex-col gap-1 p-4">
      {NAV_ITEMS.map((item) => (
        <Button key={item.value} variant={activeTab === item.value ? "secondary" : "ghost"} className="justify-start" onClick={() => { setActiveTab(item.value); setMobileOpen(false); }}>
          <item.icon className="mr-2 h-4 w-4" />{item.label}
        </Button>
      ))}
    </nav>
  );

  return (
    <div className="min-h-screen bg-muted/30">
      <div className="flex">
        <aside className="hidden md:flex w-64 min-h-screen border-r bg-background flex-col">
          <div className="p-4 border-b"><h2 className="text-lg font-bold">Admin Milblocos</h2><p className="text-xs text-muted-foreground truncate">{profileName}</p></div>
          <SidebarContent />
        </aside>
        <div className="flex-1 flex flex-col">
          <header className="flex items-center justify-between border-b bg-background px-4 py-3">
            <div className="flex items-center gap-3">
              <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
                <SheetTrigger asChild><Button variant="ghost" size="icon" className="md:hidden"><Menu className="h-5 w-5" /></Button></SheetTrigger>
                <SheetContent side="left" className="w-64 p-0"><SheetHeader className="p-4 border-b"><SheetTitle>Admin Milblocos</SheetTitle></SheetHeader><SidebarContent /></SheetContent>
              </Sheet>
              <h1 className="text-xl font-bold">Admin Milblocos</h1>
            </div>
            <Button variant="outline" onClick={() => { signOut(); toast.success("Sessão encerrada."); }}>
              <LogOut className="mr-2 h-4 w-4" />Sair
            </Button>
          </header>
          <main className="flex-1 p-4 md:p-6">
            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <TabsList className="hidden">
                {NAV_ITEMS.map((item) => (<TabsTrigger key={item.value} value={item.value}>{item.label}</TabsTrigger>))}
              </TabsList>
              <TabsContent value="dashboard"><DashboardTab /></TabsContent>
              <TabsContent value="pj"><PJPendentesTab /></TabsContent>
              <TabsContent value="produtos"><ProdutosTab /></TabsContent>
              <TabsContent value="pedidos"><PedidosTab /></TabsContent>
              <TabsContent value="mensagens"><MensagensTab /></TabsContent>
            </Tabs>
          </main>
        </div>
      </div>
    </div>
  );
}

// DASHBOARD
function DashboardTab() {
  const { data: products } = useQuery({ queryKey: ["admin-products"], queryFn: async () => { const { data, error } = await supabase.from("products").select("id"); if (error) throw error; return data; } });
  const { data: pendingOrders } = useQuery({ queryKey: ["admin-orders-pending"], queryFn: async () => { const { data, error } = await supabase.from("orders").select("id").eq("status", "pendente"); if (error) throw error; return data; } });
  const { data: pendingPJs } = useQuery({ queryKey: ["admin-pj-pending"], queryFn: async () => { const { data, error } = await supabase.from("profiles").select("id").eq("person_type", "pj").eq("approved", false); if (error) throw error; return data; } });
  const { data: messages } = useQuery({ queryKey: ["admin-messages"], queryFn: async () => { const { data, error } = await supabase.from("contact_messages").select("id"); if (error) throw error; return data; } });
  const { data: recentOrders } = useQuery({ queryKey: ["admin-recent-orders"], queryFn: async () => { const { data, error } = await supabase.from("orders").select("id, user_id, total, status, created_at").order("created_at", { ascending: false }).limit(5); if (error) throw error; return data || []; } });
  const { data: recentMessages } = useQuery({ queryKey: ["admin-recent-messages"], queryFn: async () => { const { data, error } = await supabase.from("contact_messages").select("id, name, email, subject, created_at").order("created_at", { ascending: false }).limit(5); if (error) throw error; return data || []; } });
  const { data: profilesMap } = useQuery({ queryKey: ["admin-profiles-map"], queryFn: async () => { const { data, error } = await supabase.from("profiles").select("id, full_name, email"); if (error) throw error; const map: Record<string, string> = {}; (data || []).forEach((p: any) => { map[p.id] = p.full_name || p.email || "-"; }); return map; } });

  const stats = [
    { label: "Total Produtos", value: products?.length ?? 0, icon: Package },
    { label: "Pedidos Pendentes", value: pendingOrders?.length ?? 0, icon: ShoppingCart },
    { label: "PJs Aguardando", value: pendingPJs?.length ?? 0, icon: Building2 },
    { label: "Mensagens", value: messages?.length ?? 0, icon: MessageSquare },
  ];

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((s) => (
          <Card key={s.label}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">{s.label}</CardTitle>
              <s.icon className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent><div className="text-2xl font-bold">{s.value}</div></CardContent>
          </Card>
        ))}
      </div>
      <Card>
        <CardHeader><CardTitle>Pedidos Recentes</CardTitle></CardHeader>
        <CardContent>
          <Table>
            <TableHeader><TableRow><TableHead>Pedido</TableHead><TableHead>Cliente</TableHead><TableHead>Total</TableHead><TableHead>Status</TableHead><TableHead>Data</TableHead></TableRow></TableHeader>
            <TableBody>
              {!recentOrders?.length ? (
                <TableRow><TableCell colSpan={5} className="text-center text-muted-foreground">Nenhum pedido.</TableCell></TableRow>
              ) : recentOrders.map((o: any) => (
                <TableRow key={o.id}>
                  <TableCell>#{o.id.slice(0, 8)}</TableCell>
                  <TableCell>{profilesMap?.[o.user_id] || "-"}</TableCell>
                  <TableCell>{formatBRL(o.total)}</TableCell>
                  <TableCell><Badge variant="outline">{o.status}</Badge></TableCell>
                  <TableCell>{formatDate(o.created_at)}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
      <Card>
        <CardHeader><CardTitle>Mensagens Recentes</CardTitle></CardHeader>
        <CardContent>
          <Table>
            <TableHeader><TableRow><TableHead>Nome</TableHead><TableHead>Email</TableHead><TableHead>Assunto</TableHead><TableHead>Data</TableHead></TableRow></TableHeader>
            <TableBody>
              {!recentMessages?.length ? (
                <TableRow><TableCell colSpan={4} className="text-center text-muted-foreground">Nenhuma mensagem.</TableCell></TableRow>
              ) : recentMessages.map((m: any) => (
                <TableRow key={m.id}>
                  <TableCell>{m.name || "-"}</TableCell>
                  <TableCell>{m.email || "-"}</TableCell>
                  <TableCell>{m.subject || "-"}</TableCell>
                  <TableCell>{formatDate(m.created_at)}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}

// PJ PENDENTES
function PJPendentesTab() {
  const qc = useQueryClient();
  const { data: pending, isLoading } = useQuery({ queryKey: ["admin-pj-pending-list"], queryFn: async () => { const { data, error } = await supabase.from("profiles").select("*").eq("person_type", "pj").eq("approved", false).order("created_at", { ascending: false }); if (error) throw error; return data || []; } });
  const { data: approved, isLoading: loadingApproved } = useQuery({ queryKey: ["admin-pj-approved-list"], queryFn: async () => { const { data, error } = await supabase.from("profiles").select("*").eq("person_type", "pj").eq("approved", true).order("created_at", { ascending: false }); if (error) throw error; return data || []; } });

  const approve = useMutation({
    mutationFn: async (id: string) => {
      const { error: e1 } = await supabase.from("profiles").update({ approved: true }).eq("id", id);
      if (e1) throw e1;
      const { error: e2 } = await supabase.from("user_roles").insert({ user_id: id, role: "atacado" });
      if (e2) throw e2;
    },
    onSuccess: () => { toast.success("PJ aprovado!"); qc.invalidateQueries({ queryKey: ["admin-pj"] }); },
    onError: (err: any) => toast.error("Erro: " + err.message),
  });
  const refuse = useMutation({
    mutationFn: async (id: string) => { const { error } = await supabase.from("profiles").delete().eq("id", id); if (error) throw error; },
    onSuccess: () => { toast.success("PJ recusado."); qc.invalidateQueries({ queryKey: ["admin-pj"] }); },
    onError: (err: any) => toast.error("Erro: " + err.message),
  });

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader><CardTitle>PJs Aguardando Aprovação</CardTitle></CardHeader>
        <CardContent>
          {isLoading ? <p className="text-muted-foreground">Carregando...</p> : !pending?.length ? <p className="text-muted-foreground">Nenhum pendente.</p> : (
            <Table>
              <TableHeader><TableRow><TableHead>Nome</TableHead><TableHead>Empresa</TableHead><TableHead>CNPJ</TableHead><TableHead>Telefone</TableHead><TableHead>Email</TableHead><TableHead>Data</TableHead><TableHead>Ações</TableHead></TableRow></TableHeader>
              <TableBody>
                {pending.map((p: any) => (
                  <TableRow key={p.id}>
                    <TableCell>{p.full_name || "-"}</TableCell>
                    <TableCell>{p.company_name || "-"}</TableCell>
                    <TableCell>{p.document || "-"}</TableCell>
                    <TableCell>{p.phone || "-"}</TableCell>
                    <TableCell>{p.email}</TableCell>
                    <TableCell>{formatDate(p.created_at)}</TableCell>
                    <TableCell className="flex gap-2">
                      <Button size="sm" onClick={() => approve.mutate(p.id)} disabled={approve.isPending}><Check className="mr-1 h-3 w-3" />Aprovar</Button>
                      <Button size="sm" variant="destructive" onClick={() => refuse.mutate(p.id)} disabled={refuse.isPending}><X className="mr-1 h-3 w-3" />Recusar</Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
      <Card>
        <CardHeader><CardTitle>PJs Aprovados</CardTitle></CardHeader>
        <CardContent>
          {loadingApproved ? <p className="text-muted-foreground">Carregando...</p> : !approved?.length ? <p className="text-muted-foreground">Nenhum aprovado.</p> : (
            <Table>
              <TableHeader><TableRow><TableHead>Nome</TableHead><TableHead>Empresa</TableHead><TableHead>CNPJ</TableHead><TableHead>Email</TableHead><TableHead>Data</TableHead></TableRow></TableHeader>
              <TableBody>
                {approved.map((p: any) => (
                  <TableRow key={p.id}>
                    <TableCell>{p.full_name || "-"}</TableCell>
                    <TableCell>{p.company_name || "-"}</TableCell>
                    <TableCell>{p.document || "-"}</TableCell>
                    <TableCell>{p.email}</TableCell>
                    <TableCell>{formatDate(p.created_at)}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

// PRODUTOS
function ProdutosTab() {
  const qc = useQueryClient();
  const [search, setSearch] = useState("");
  const [editing, setEditing] = useState<any>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const { data: products, isLoading } = useQuery({ queryKey: ["admin-products-list"], queryFn: async () => { const { data, error } = await supabase.from("products").select("*, categories(name)"); if (error) throw error; return data || []; } });
  const { data: categories } = useQuery({ queryKey: ["admin-categories"], queryFn: async () => { const { data, error } = await supabase.from("categories").select("id, name"); if (error) throw error; return data || []; } });

  const filtered = (products || []).filter((p: any) => p.name.toLowerCase().includes(search.toLowerCase()));

  const updateMutation = useMutation({
    mutationFn: async (payload: any) => {
      const { id, ...rest } = payload;
      const { data, error } = await supabase.from("products").update(rest).eq("id", id).select().single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => { toast.success("Produto atualizado!"); qc.invalidateQueries({ queryKey: ["admin-products"] }); setDialogOpen(false); setEditing(null); },
    onError: (err: any) => toast.error("Erro: " + err.message),
  });

  return (
    <div className="space-y-4">
      <Input placeholder="Buscar produtos..." value={search} onChange={(e) => setSearch(e.target.value)} className="max-w-sm" />
      {isLoading ? <p className="text-muted-foreground">Carregando...</p> : !filtered.length ? <p className="text-muted-foreground">Nenhum produto.</p> : (
        <Card><CardContent className="p-0">
          <Table>
            <TableHeader><TableRow><TableHead>Imagem</TableHead><TableHead>Nome</TableHead><TableHead>Categoria</TableHead><TableHead>Varejo</TableHead><TableHead>Atacado</TableHead><TableHead>Estoque</TableHead><TableHead>Destaque</TableHead><TableHead>Ações</TableHead></TableRow></TableHeader>
            <TableBody>
              {filtered.map((p: any) => (
                <TableRow key={p.id}>
                  <TableCell>{p.image_url ? <img src={p.image_url} alt={p.name} className="h-10 w-10 rounded object-cover" /> : <div className="h-10 w-10 rounded bg-muted flex items-center justify-center"><ImageIcon className="h-4 w-4 text-muted-foreground" /></div>}</TableCell>
                  <TableCell className="font-medium">{p.name}</TableCell>
                  <TableCell>{p.categories?.name || "-"}</TableCell>
                  <TableCell>{formatBRL(p.retail_price)}</TableCell>
                  <TableCell>{formatBRL(p.wholesale_price)}</TableCell>
                  <TableCell><Badge variant={p.in_stock ? "default" : "secondary"}>{p.in_stock ? "Em estoque" : "Sem estoque"}</Badge></TableCell>
                  <TableCell><Badge variant={p.featured ? "default" : "outline"}>{p.featured ? "Sim" : "Não"}</Badge></TableCell>
                  <TableCell><Button size="sm" variant="outline" onClick={() => { setEditing(p); setDialogOpen(true); }}><Pencil className="mr-1 h-3 w-3" />Editar</Button></TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent></Card>
      )}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader><DialogTitle>Editar Produto</DialogTitle><DialogDescription>{editing?.name}</DialogDescription></DialogHeader>
          {editing && <ProductEditForm product={editing} categories={categories || []} onSave={(p: any) => updateMutation.mutate(p)} saving={updateMutation.isPending} />}
        </DialogContent>
      </Dialog>
    </div>
  );
}

function ProductEditForm({ product, categories, onSave, saving }: { product: any; categories: any[]; onSave: (p: any) => void; saving: boolean }) {
  const [form, setForm] = useState({
    name: product.name,
    description: product.description || "",
    image_url: product.image_url || "",
    retail_price: product.retail_price,
    wholesale_price: product.wholesale_price,
    min_wholesale_qty: product.min_wholesale_qty,
    featured: product.featured,
    in_stock: product.in_stock,
    category_id: product.category_id || "",
  });
  const set = (k: string, v: any) => setForm(prev => ({ ...prev, [k]: v }));

  return (
    <div className="space-y-4 py-2">
      <div className="space-y-1"><Label>Nome</Label><Input value={form.name} onChange={e => set("name", e.target.value)} /></div>
      <div className="space-y-1"><Label>Descrição</Label><Textarea value={form.description} onChange={e => set("description", e.target.value)} rows={3} /></div>
      <div className="space-y-1"><Label>URL da Imagem</Label><Input value={form.image_url} onChange={e => set("image_url", e.target.value)} /></div>
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-1"><Label>Preço Varejo</Label><Input type="number" step="0.01" value={form.retail_price} onChange={e => set("retail_price", parseFloat(e.target.value) || 0)} /></div>
        <div className="space-y-1"><Label>Preço Atacado</Label><Input type="number" step="0.01" value={form.wholesale_price} onChange={e => set("wholesale_price", parseFloat(e.target.value) || 0)} /></div>
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-1"><Label>Qtd. Mín. Atacado</Label><Input type="number" value={form.min_wholesale_qty} onChange={e => set("min_wholesale_qty", parseInt(e.target.value) || 0)} /></div>
        <div className="space-y-1"><Label>Categoria</Label>
          <Select value={form.category_id || "none"} onValueChange={v => set("category_id", v === "none" ? "" : v)}>
            <SelectTrigger><SelectValue placeholder="Selecione" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="none">Sem categoria</SelectItem>
              {categories.map((c: any) => (<SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>))}
            </SelectContent>
          </Select>
        </div>
      </div>
      <div className="flex items-center justify-between"><Label>Destaque</Label><Switch checked={form.featured} onCheckedChange={v => set("featured", v)} /></div>
      <div className="flex items-center justify-between"><Label>Em Estoque</Label><Switch checked={form.in_stock} onCheckedChange={v => set("in_stock", v)} /></div>
      <DialogFooter>
        <Button variant="outline" onClick={() => {}}>Cancelar</Button>
        <Button onClick={() => onSave({ id: product.id, ...form })} disabled={saving}>{saving ? "Salvando..." : "Salvar"}</Button>
      </DialogFooter>
    </div>
  );
}

// PEDIDOS
function PedidosTab() {
  const qc = useQueryClient();
  const [expanded, setExpanded] = useState<string | null>(null);
  const { data: orders, isLoading } = useQuery({ queryKey: ["admin-orders-list"], queryFn: async () => { const { data, error } = await supabase.from("orders").select("*, order_items(*, products(name))").order("created_at", { ascending: false }); if (error) throw error; return data || []; } });
  const { data: profilesMap } = useQuery({ queryKey: ["admin-profiles-map"], queryFn: async () => { const { data, error } = await supabase.from("profiles").select("id, full_name, email"); if (error) throw error; const map: Record<string, string> = {}; (data || []).forEach((p: any) => { map[p.id] = p.full_name || p.email || "-"; }); return map; } });

  const statusMutation = useMutation({
    mutationFn: async ({ id, status }: { id: string; status: string }) => { const { error } = await supabase.from("orders").update({ status }).eq("id", id); if (error) throw error; },
    onSuccess: () => { toast.success("Status atualizado!"); qc.invalidateQueries({ queryKey: ["admin-orders"] }); },
    onError: (err: any) => toast.error("Erro: " + err.message),
  });

  if (isLoading) return <p className="text-muted-foreground">Carregando...</p>;
  if (!orders?.length) return <p className="text-muted-foreground">Nenhum pedido.</p>;

  return (
    <Card><CardContent className="p-0">
      <Table>
        <TableHeader><TableRow><TableHead className="w-8"></TableHead><TableHead>Pedido</TableHead><TableHead>Cliente</TableHead><TableHead>Total</TableHead><TableHead>Status</TableHead><TableHead>Data</TableHead></TableRow></TableHeader>
        <TableBody>
          {orders.map((o: any) => (
            <>
              <TableRow key={o.id}>
                <TableCell><Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => setExpanded(expanded === o.id ? null : o.id)}>{expanded === o.id ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}</Button></TableCell>
                <TableCell>#{o.id.slice(0, 8)}</TableCell>
                <TableCell>{profilesMap?.[o.user_id] || "-"}</TableCell>
                <TableCell>{formatBRL(o.total)}</TableCell>
                <TableCell>
                  <Select value={o.status} onValueChange={v => statusMutation.mutate({ id: o.id, status: v })}>
                    <SelectTrigger className="w-40"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="pendente">Pendente</SelectItem>
                      <SelectItem value="confirmado">Confirmado</SelectItem>
                      <SelectItem value="em_separacao">Em Separação</SelectItem>
                      <SelectItem value="em_transporte">Em Transporte</SelectItem>
                      <SelectItem value="entregue">Entregue</SelectItem>
                      <SelectItem value="cancelado">Cancelado</SelectItem>
                    </SelectContent>
                  </Select>
                </TableCell>
                <TableCell>{formatDate(o.created_at)}</TableCell>
              </TableRow>
              {expanded === o.id && (
                <TableRow key={o.id + "-det"}>
                  <TableCell colSpan={6} className="bg-muted/30">
                    <div className="p-4 space-y-4">
                      <Table>
                        <TableHeader><TableRow><TableHead>Produto</TableHead><TableHead>Qtd</TableHead><TableHead>Preço Unit.</TableHead><TableHead>Subtotal</TableHead></TableRow></TableHeader>
                        <TableBody>
                          {o.order_items?.length ? o.order_items.map((item: any) => (
                            <TableRow key={item.id}>
                              <TableCell>{item.products?.name || item.name}</TableCell>
                              <TableCell>{item.quantity}</TableCell>
                              <TableCell>{formatBRL(item.unit_price)}</TableCell>
                              <TableCell>{formatBRL(item.unit_price * item.quantity)}</TableCell>
                            </TableRow>
                          )) : <TableRow><TableCell colSpan={4} className="text-center text-muted-foreground">Sem itens.</TableCell></TableRow>}
                        </TableBody>
                      </Table>
                      {o.notes && <div className="text-sm"><strong>Obs:</strong> {o.notes}</div>}
                    </div>
                  </TableCell>
                </TableRow>
              )}
            </>
          ))}
        </TableBody>
      </Table>
    </CardContent></Card>
  );
}

// MENSAGENS
function MensagensTab() {
  const [expanded, setExpanded] = useState<string | null>(null);
  const { data: messages, isLoading } = useQuery({ queryKey: ["admin-messages-list"], queryFn: async () => { const { data, error } = await supabase.from("contact_messages").select("*").order("created_at", { ascending: false }); if (error) throw error; return data || []; } });

  if (isLoading) return <p className="text-muted-foreground">Carregando...</p>;
  if (!messages?.length) return <p className="text-muted-foreground">Nenhuma mensagem.</p>;

  return (
    <Card><CardContent className="p-0">
      <Table>
        <TableHeader><TableRow><TableHead className="w-8"></TableHead><TableHead>Nome</TableHead><TableHead>Email</TableHead><TableHead>Assunto</TableHead><TableHead>Data</TableHead></TableRow></TableHeader>
        <TableBody>
          {messages.map((m: any) => (
            <>
              <TableRow key={m.id}>
                <TableCell><Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => setExpanded(expanded === m.id ? null : m.id)}>{expanded === m.id ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}</Button></TableCell>
                <TableCell className="font-medium">{m.name}</TableCell>
                <TableCell>{m.email}</TableCell>
                <TableCell>{m.subject || "-"}</TableCell>
                <TableCell>{formatDate(m.created_at)}</TableCell>
              </TableRow>
              {expanded === m.id && (
                <TableRow key={m.id + "-det"}>
                  <TableCell colSpan={5} className="bg-muted/30">
                    <div className="p-4 space-y-2">
                      {m.phone && <div className="text-sm"><strong>Telefone:</strong> {m.phone}</div>}
                      <div className="text-sm whitespace-pre-wrap"><strong>Mensagem:</strong><p className="mt-1">{m.message}</p></div>
                    </div>
                  </TableCell>
                </TableRow>
              )}
            </>
          ))}
        </TableBody>
      </Table>
    </CardContent></Card>
  );
}


