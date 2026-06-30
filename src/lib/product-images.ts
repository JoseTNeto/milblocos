import blocoEstrutural from "@/assets/produto-bloco-estrutural.jpg";
import blocoVedacao from "@/assets/produto-bloco-vedacao.jpg";
import paverRetangular from "@/assets/produto-paver-retangular.jpg";
import cobogo from "@/assets/produto-cobogo.jpg";

// Mapeia slug do produto -> imagem local. Itens sem imagem real caem para placeholder por categoria.
const bySlug: Record<string, string> = {
  "bloco-estrutural-14x19x39": blocoEstrutural,
  "bloco-estrutural-19x19x39": blocoEstrutural,
  "bloco-vedacao-9x19x39": blocoVedacao,
  "bloco-vedacao-14x19x39": blocoVedacao,
  "paver-retangular-cinza": paverRetangular,
  "paver-retangular-vermelho": paverRetangular,
  "paver-sextavado": paverRetangular,
  "bloco-arquitetonico-vazado": cobogo,
  "bloco-arquitetonico-trama": cobogo,
};

const byCategory: Record<string, string> = {
  "blocos-estruturais": blocoEstrutural,
  "blocos-vedacao": blocoVedacao,
  "pavers": paverRetangular,
  "linha-arquitetura": cobogo,
};

export function getProductImage(slug: string, categorySlug?: string | null, imageUrl?: string | null): string {
  if (imageUrl && imageUrl.trim()) return imageUrl;
  return (
    bySlug[slug] ||
    (categorySlug ? byCategory[categorySlug] : undefined) ||
    blocoEstrutural
  );
}

