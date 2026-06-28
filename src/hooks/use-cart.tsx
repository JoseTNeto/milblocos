import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "./use-auth";
import { toast } from "sonner";

export interface CartLine {
  id: string;
  product_id: string;
  quantity: number;
  product: {
    id: string;
    slug: string;
    name: string;
    unit: string;
    retail_price: number;
    wholesale_price: number;
    min_wholesale_qty: number;
    category: { slug: string } | null;
  };
}

export function useCart() {
  const { user, isWholesale } = useAuth();
  const qc = useQueryClient();

  const cartQuery = useQuery({
    enabled: !!user,
    queryKey: ["cart", user?.id],
    queryFn: async (): Promise<CartLine[]> => {
      const { data, error } = await supabase
        .from("cart_items")
        .select(
          "id, product_id, quantity, product:products(id, slug, name, unit, retail_price, wholesale_price, min_wholesale_qty, category:categories(slug))"
        )
        .eq("user_id", user!.id);
      if (error) throw error;
      return (data as unknown as CartLine[]) ?? [];
    },
  });

  const add = useMutation({
    mutationFn: async ({ productId, qty }: { productId: string; qty: number }) => {
      if (!user) throw new Error("Faça login para adicionar ao carrinho.");
      const { data: existing } = await supabase
        .from("cart_items")
        .select("id, quantity")
        .eq("user_id", user.id)
        .eq("product_id", productId)
        .maybeSingle();
      if (existing) {
        const { error } = await supabase
          .from("cart_items")
          .update({ quantity: existing.quantity + qty })
          .eq("id", existing.id);
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from("cart_items")
          .insert({ user_id: user.id, product_id: productId, quantity: qty });
        if (error) throw error;
      }
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["cart", user?.id] });
      toast.success("Adicionado ao carrinho");
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const updateQty = useMutation({
    mutationFn: async ({ id, qty }: { id: string; qty: number }) => {
      if (qty <= 0) {
        const { error } = await supabase.from("cart_items").delete().eq("id", id);
        if (error) throw error;
      } else {
        const { error } = await supabase.from("cart_items").update({ quantity: qty }).eq("id", id);
        if (error) throw error;
      }
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["cart", user?.id] }),
  });

  const remove = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("cart_items").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["cart", user?.id] }),
  });

  const clear = useMutation({
    mutationFn: async () => {
      if (!user) return;
      await supabase.from("cart_items").delete().eq("user_id", user.id);
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["cart", user?.id] }),
  });

  const lines = cartQuery.data ?? [];
  const totalItems = lines.reduce((s, l) => s + l.quantity, 0);
  const totalValue = lines.reduce((s, l) => {
    const useWholesale = isWholesale && l.quantity >= l.product.min_wholesale_qty;
    const price = useWholesale ? l.product.wholesale_price : l.product.retail_price;
    return s + price * l.quantity;
  }, 0);

  return { lines, totalItems, totalValue, add, updateQty, remove, clear, loading: cartQuery.isLoading };
}
