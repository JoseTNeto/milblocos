-- Categories: add 2 new for telhas e drenagem/saneamento
INSERT INTO public.categories (id, slug, name, sort_order, is_own_line) VALUES
('11111111-1111-1111-1111-111111111111','drenagem-saneamento','Drenagem e Saneamento',9,true),
('22222222-2222-2222-2222-222222222222','telhas','Telhas de Concreto',10,true)
ON CONFLICT (slug) DO NOTHING;

-- Clean placeholder products before bulk import
DELETE FROM public.products;

-- SECURITY FIX 1: prevent users from self-approving wholesale via profile update
DROP POLICY IF EXISTS "Users update own profile" ON public.profiles;
CREATE POLICY "Users update own profile" ON public.profiles
  FOR UPDATE TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (
    auth.uid() = id
    AND approved = (SELECT approved FROM public.profiles WHERE id = auth.uid())
    AND person_type = (SELECT person_type FROM public.profiles WHERE id = auth.uid())
    AND COALESCE(document,'') = COALESCE((SELECT document FROM public.profiles WHERE id = auth.uid()),'')
  );

-- SECURITY FIX 2: remove client INSERT on orders/order_items (checkout will go via server function)
DROP POLICY IF EXISTS "Users insert own orders" ON public.orders;
DROP POLICY IF EXISTS "Users insert items in own orders" ON public.order_items;
DROP POLICY IF EXISTS "Users can create their own orders" ON public.orders;
DROP POLICY IF EXISTS "Users can create order items" ON public.order_items;