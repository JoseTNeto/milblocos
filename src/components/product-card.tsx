import { Link } from "@tanstack/react-router";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ShoppingCart } from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
import { useCart } from "@/hooks/use-cart";
import { formatBRL } from "@/lib/format";
import { getProductImage } from "@/lib/product-images";

export interface ProductCardData {
  id: string;
  slug: string;
  name: string;
  brand: string | null;
  unit: string;
  retail_price: number;
  wholesale_price: number;
  min_wholesale_qty: number;
  is_own_line: boolean;
  image_url?: string | null;
  category?: { slug: string; name: string } | null;
}

export function ProductCard({ product }: { product: ProductCardData }) {
  const { isWholesale } = useAuth();
  const { add } = useCart();
  const img = getProductImage(product.slug, product.category?.slug, product.image_url);
  const showWholesale = isWholesale;


  return (
    <article className="group flex flex-col overflow-hidden rounded-lg border bg-card shadow-card transition hover:shadow-lift">
      <Link to="/produto/$slug" params={{ slug: product.slug }} className="block aspect-square overflow-hidden bg-secondary">
        <img
          src={img}
          alt={product.name}
          loading="lazy"
          width={400}
          height={400}
          className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
        />
      </Link>
      <div className="flex flex-1 flex-col gap-3 p-4">
        <div className="flex items-center gap-2 text-[10px] uppercase tracking-wider text-muted-foreground">
          {product.is_own_line ? (
            <Badge className="bg-primary text-primary-foreground hover:bg-primary">Linha própria</Badge>
          ) : (
            <Badge variant="secondary">{product.brand}</Badge>
          )}
        </div>
        <Link to="/produto/$slug" params={{ slug: product.slug }} className="line-clamp-2 text-sm font-semibold leading-snug hover:text-primary">
          {product.name}
        </Link>

        <div className="mt-auto space-y-1">
          {showWholesale ? (
            <>
              <div className="text-[11px] text-muted-foreground line-through">Varejo {formatBRL(product.retail_price)}</div>
              <div className="text-lg font-bold text-primary">
                {formatBRL(product.wholesale_price)}
                <span className="text-xs font-normal text-muted-foreground">/{product.unit}</span>
              </div>
              <div className="text-[11px] text-muted-foreground">a partir de {product.min_wholesale_qty} {product.unit}</div>
            </>
          ) : (
            <>
              <div className="text-lg font-bold text-foreground">
                {formatBRL(product.retail_price)}
                <span className="text-xs font-normal text-muted-foreground">/{product.unit}</span>
              </div>
              <div className="text-[11px] text-muted-foreground">PJ atacado: {formatBRL(product.wholesale_price)}/{product.unit}</div>
            </>
          )}
        </div>

        <Button
          size="sm"
          onClick={() => add.mutate({ productId: product.id, qty: showWholesale ? product.min_wholesale_qty : 1 })}
          disabled={add.isPending}
          className="w-full"
        >
          <ShoppingCart className="h-4 w-4" /> Adicionar
        </Button>
      </div>
    </article>
  );
}
