// Parse the internal SKU pattern used by Milblocos own line:
// MLB*<TIPO>*<DIMS>*<CLASSE>*<RESISTENCIA MPA>*<NT-X>
// Ex: MLB*EST*140190390*A*8 MPA*NT-3

const TIPO_LABELS: Record<string, string> = {
  EST: "Estrutural",
  VED: "Vedação",
  PLV: "Paver",
  LJT: "Lajota",
  SEX: "Paver sextavado",
  TRD: "Paver tridente",
  PPS: "Piso pré-moldado",
  APA: "Arquitetura / aparente",
  MUF: "Muro / muffe",
  PDR: "Pedra",
  PDT: "Pedra tátil",
  RQT: "Requadro",
  CST: "Canaleta especial",
  OND: "Onda",
  TRL: "Trilho",
  IHD: "Item hidráulico",
  MEL: "Meio-fio",
  PLA: "Placa",
  MTS: "Mistura",
  COL: "Coluna",
  CPV: "Compensador",
  MAR: "Marco",
  CRS: "Crescente",
  PSG: "Passeio",
  ABN: "Abertura",
  IEL: "Item elétrico",
  PST: "Poste",
  TMF: "Tubo macho x fêmea",
  TPB: "Tubo ponta e bolsa",
};

export interface ParsedSku {
  prefixo: string | null;
  tipo: string | null;
  tipoLabel: string | null;
  dimsRaw: string | null;
  classe: string | null;
  resistencia: string | null;
  norma: string | null;
}

export function parseSku(sku: string | null | undefined): ParsedSku {
  const empty: ParsedSku = { prefixo: null, tipo: null, tipoLabel: null, dimsRaw: null, classe: null, resistencia: null, norma: null };
  if (!sku) return empty;
  const parts = sku.split("*").map((s) => s.trim()).filter(Boolean);
  if (parts.length < 2) return empty;
  const [prefixo, tipo, dimsRaw, classe, resistencia, norma] = parts;
  return {
    prefixo: prefixo ?? null,
    tipo: tipo ?? null,
    tipoLabel: tipo ? TIPO_LABELS[tipo] ?? tipo : null,
    dimsRaw: dimsRaw ?? null,
    classe: classe ?? null,
    resistencia: resistencia ?? null,
    norma: norma ?? null,
  };
}

// Convert a concatenated dimension code like "140190390" (mm) to "14 × 19 × 39 cm".
// Heuristic: right-align to 9 chars, split 3+3+3, convert mm→cm.
export function formatDims(dimsRaw: string | null | undefined): string | null {
  if (!dimsRaw) return null;
  const digits = dimsRaw.replace(/\D/g, "");
  if (digits.length < 6 || digits.length > 9) return dimsRaw;
  const padded = digits.padStart(9, "0");
  const a = parseInt(padded.slice(0, 3), 10);
  const b = parseInt(padded.slice(3, 6), 10);
  const c = parseInt(padded.slice(6, 9), 10);
  const fmt = (mm: number) => {
    const cm = mm / 10;
    return Number.isInteger(cm) ? `${cm}` : cm.toFixed(1);
  };
  return `${fmt(a)} × ${fmt(b)} × ${fmt(c)} cm`;
}
