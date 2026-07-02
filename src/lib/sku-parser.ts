// Parse the internal SKU pattern used by Milblocos own line:
// MLB*<TIPO>*<DIMS>*<CLASSE>*<RESISTENCIA MPA>*<COR-DV>
// Ex: MLB*EST*140190390*A*8 MPA*NT-3
// - <COR> = código da cor (NT=Natural, AZ=Azul...)
// - <DV>  = dígito verificador (não é técnico, não exibir)
// A Norma técnica é definida pelo tipo do produto (não pelo SKU).

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
  ABN: "Abobadilha",
  IEL: "Item elétrico",
  PST: "Poste",
  TMF: "Tubo macho x fêmea",
  TPB: "Tubo ponta e bolsa",
};

const COR_LABELS: Record<string, string> = {
  NT: "Natural",
  AZ: "Azul",
  VM: "Vermelho",
  OC: "Ocre",
  VD: "Verde",
  AM: "Amarelo",
  GF: "Grafite",
  MR: "Marrom",
  RS: "Rosa",
  BR: "Branco",
  PR: "Preto",
  CZ: "Cinza",
};

// Famílias que seguem cada norma técnica brasileira.
const NORMA_BLOCOS = new Set(["EST", "VED", "APA", "CST", "MUF", "CPV", "ABN", "COL"]);
const NORMA_PAVERS = new Set(["PLV", "SEX", "TRD", "LJT", "PPS", "PDT", "MEL", "PSG"]);
const NORMA_TUBOS = new Set(["TMF", "TPB", "IHD"]);

export function getNorma(tipo: string | null | undefined, categorySlug?: string | null): string | null {
  if (tipo) {
    if (NORMA_BLOCOS.has(tipo)) return "NBR 6136";
    if (NORMA_PAVERS.has(tipo)) return "NBR 9781";
    if (NORMA_TUBOS.has(tipo)) return "NBR 8890";
  }
  if (categorySlug) {
    if (categorySlug.includes("bloco") || categorySlug === "linha-arquitetura") return "NBR 6136";
    if (categorySlug === "pavers") return "NBR 9781";
    if (categorySlug === "drenagem-saneamento") return "NBR 8890";
  }
  return null;
}

export interface ParsedSku {
  prefixo: string | null;
  tipo: string | null;
  tipoLabel: string | null;
  dimsRaw: string | null;
  classe: string | null;
  resistencia: string | null;
  corCodigo: string | null;
  corLabel: string | null;
}

export function parseSku(sku: string | null | undefined): ParsedSku {
  const empty: ParsedSku = { prefixo: null, tipo: null, tipoLabel: null, dimsRaw: null, classe: null, resistencia: null, corCodigo: null, corLabel: null };
  if (!sku) return empty;
  const parts = sku.split("*").map((s) => s.trim()).filter(Boolean);
  if (parts.length < 2) return empty;
  const [prefixo, tipo, dimsRaw, classe, resistencia, corRaw] = parts;
  // corRaw exemplo: "NT-9" (cor + dígito verificador). Descartamos o DV.
  let corCodigo: string | null = null;
  if (corRaw) {
    const m = corRaw.match(/^([A-Za-z]{2,3})/);
    corCodigo = m ? m[1].toUpperCase() : null;
  }
  return {
    prefixo: prefixo ?? null,
    tipo: tipo ?? null,
    tipoLabel: tipo ? TIPO_LABELS[tipo] ?? tipo : null,
    dimsRaw: dimsRaw ?? null,
    classe: classe ?? null,
    resistencia: resistencia ?? null,
    corCodigo,
    corLabel: corCodigo ? COR_LABELS[corCodigo] ?? corCodigo : null,
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
