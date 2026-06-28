import { Link } from "@tanstack/react-router";
import { ShoppingCart, User, Menu, Search } from "lucide-react";
import { useState } from "react";
import logo from "@/assets/milblocos-logo.asset.json";
import { useAuth } from "@/hooks/use-auth";
import { useCart } from "@/hooks/use-cart";
import { Button } from "@/components/ui/button";
import {
  Sheet, SheetContent, SheetTrigger, SheetHeader, SheetTitle,
} from "@/components/ui/sheet";

const nav = [
  { to: "/", label: "Início" },
  { to: "/loja", label: "Loja" },
  { to: "/sobre", label: "A Indústria" },
  { to: "/mil-log", label: "Mil-Log" },
  { to: "/atacado", label: "Atacado PJ" },
  { to: "/contato", label: "Contato" },
];

export function SiteHeader() {
  const { user, profile, isWholesale } = useAuth();
  const { totalItems } = useCart();
  const [open, setOpen] = useState(false);

  return (
    <header className="sticky top-0 z-40 w-full border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/80">
      {/* Top strip */}
      <div className="gradient-deep text-primary-foreground/90 text-xs">
        <div className="container-page flex h-8 items-center justify-between">
          <span className="hidden sm:inline">Indústria de blocos cimentícios · Logística própria · Atendimento atacado e varejo</span>
          <span className="sm:hidden">Milblocos Inc.</span>
          <div className="flex items-center gap-4">
            {isWholesale && <span className="rounded bg-warning px-2 py-0.5 text-warning-foreground font-semibold">Conta Atacado</span>}
            <a href="tel:+5500000000000" className="hover:underline">(00) 0000-0000</a>
          </div>
        </div>
      </div>

      <div className="container-page flex h-20 items-center gap-6">
        <Link to="/" className="flex items-center gap-3 shrink-0">
          <img src={logo.url} alt="Milblocos Inc." className="h-12 w-auto" width={48} height={48} />
          <div className="hidden md:block leading-tight">
            <div className="font-bold text-lg text-primary-deep">MILBLOCOS</div>
            <div className="text-[10px] uppercase tracking-widest text-muted-foreground">Indústria · Loja · Logística</div>
          </div>
        </Link>

        <nav className="hidden lg:flex items-center gap-6 ml-4">
          {nav.map((n) => (
            <Link
              key={n.to}
              to={n.to}
              className="text-sm font-medium text-foreground/80 hover:text-primary transition-colors"
              activeProps={{ className: "text-primary" }}
            >
              {n.label}
            </Link>
          ))}
        </nav>

        <div className="flex-1" />

        <Button variant="ghost" size="icon" className="hidden md:inline-flex" aria-label="Buscar">
          <Search className="h-5 w-5" />
        </Button>

        <Link to="/carrinho" className="relative inline-flex h-10 w-10 items-center justify-center rounded-md hover:bg-accent" aria-label="Carrinho">
          <ShoppingCart className="h-5 w-5" />
          {totalItems > 0 && (
            <span className="absolute -top-1 -right-1 grid h-5 min-w-5 place-items-center rounded-full bg-primary px-1 text-[10px] font-bold text-primary-foreground">
              {totalItems}
            </span>
          )}
        </Link>

        {user ? (
          <Link to="/minha-conta" className="hidden md:flex items-center gap-2 text-sm font-medium hover:text-primary">
            <User className="h-4 w-4" />
            <span className="max-w-[120px] truncate">{profile?.full_name?.split(" ")[0] ?? "Conta"}</span>
          </Link>
        ) : (
          <Link to="/auth" className="hidden md:inline-flex">
            <Button variant="default" size="sm">Entrar / Cadastrar</Button>
          </Link>
        )}

        {/* Mobile menu */}
        <Sheet open={open} onOpenChange={setOpen}>
          <SheetTrigger asChild>
            <Button variant="ghost" size="icon" className="lg:hidden" aria-label="Menu">
              <Menu className="h-5 w-5" />
            </Button>
          </SheetTrigger>
          <SheetContent side="right" className="w-[280px]">
            <SheetHeader><SheetTitle>Menu</SheetTitle></SheetHeader>
            <div className="mt-6 flex flex-col gap-1">
              {nav.map((n) => (
                <Link
                  key={n.to}
                  to={n.to}
                  onClick={() => setOpen(false)}
                  className="rounded-md px-3 py-2 text-sm font-medium hover:bg-accent"
                >
                  {n.label}
                </Link>
              ))}
              <div className="my-2 border-t" />
              {user ? (
                <Link to="/minha-conta" onClick={() => setOpen(false)} className="rounded-md px-3 py-2 text-sm font-medium hover:bg-accent">
                  Minha conta
                </Link>
              ) : (
                <Link to="/auth" onClick={() => setOpen(false)} className="rounded-md px-3 py-2 text-sm font-medium bg-primary text-primary-foreground hover:bg-primary/90">
                  Entrar / Cadastrar
                </Link>
              )}
            </div>
          </SheetContent>
        </Sheet>
      </div>
    </header>
  );
}
