import { Link } from "@tanstack/react-router";
import logo from "@/assets/milblocos-logo.asset.json";
import milLog from "@/assets/mil-log-logo.asset.json";

export function SiteFooter() {
  return (
    <footer className="mt-24 border-t border-border bg-secondary">
      <div className="container-page py-14 grid gap-10 md:grid-cols-4">
        <div>
          <img src={logo.url} alt="Milblocos" className="h-14 w-auto mb-3" width={56} height={56} />
          <p className="text-sm text-muted-foreground max-w-xs">
            Indústria de blocos e pavers cimentícios. Linha completa de vedação, estrutural, pavimentação e arquitetura.
          </p>
        </div>

        <div>
          <h4 className="text-sm font-semibold mb-3">Loja</h4>
          <ul className="space-y-2 text-sm text-muted-foreground">
            <li><Link to="/loja" className="hover:text-primary">Catálogo completo</Link></li>
            <li><Link to="/loja/$category" params={{ category: "blocos-estruturais" }} className="hover:text-primary">Blocos estruturais</Link></li>
            <li><Link to="/loja/$category" params={{ category: "pavers" }} className="hover:text-primary">Pavers</Link></li>
            <li><Link to="/loja/$category" params={{ category: "linha-arquitetura" }} className="hover:text-primary">Linha arquitetura</Link></li>
            <li><Link to="/atacado" className="hover:text-primary">Conta atacado PJ</Link></li>
          </ul>
        </div>

        <div>
          <h4 className="text-sm font-semibold mb-3">Empresa</h4>
          <ul className="space-y-2 text-sm text-muted-foreground">
            <li><Link to="/sobre" className="hover:text-primary">A indústria</Link></li>
            <li><Link to="/mil-log" className="hover:text-primary">Mil-Log Logística</Link></li>
            <li><Link to="/contato" className="hover:text-primary">Contato</Link></li>
          </ul>
        </div>

        <div>
          <h4 className="text-sm font-semibold mb-3">Logística parceira</h4>
          <img src={milLog.url} alt="Mil-Log" className="h-20 w-auto" width={80} height={80} />
          <p className="text-xs text-muted-foreground mt-2">60 caminhões Volvo + 20 furgões Hiace. Logística em movimento.</p>
        </div>
      </div>

      <div className="border-t bg-primary-deep text-primary-foreground/80">
        <div className="container-page py-4 flex flex-col sm:flex-row items-center justify-between gap-2 text-xs">
          <p>© {new Date().getFullYear()} Milblocos Inc. Todos os direitos reservados.</p>
          <p>CNPJ 00.000.000/0000-00 · Indústria, comércio e logística</p>
        </div>
      </div>
    </footer>
  );
}
