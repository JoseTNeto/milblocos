
-- Remove direct INSERT permission on orders and order_items from clients; route all order creation through a SECURITY DEFINER RPC that computes prices server-side.

DROP POLICY IF EXISTS "Users create own orders" ON public.orders;
DROP POLICY IF EXISTS "Users create own order items" ON public.order_items;

REVOKE INSERT, UPDATE, DELETE ON public.orders FROM authenticated, anon;
REVOKE INSERT, UPDATE, DELETE ON public.order_items FROM authenticated, anon;

CREATE OR REPLACE FUNCTION public.create_order(
  _items jsonb,
  _address jsonb,
  _notes text DEFAULT NULL
)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_user uuid := auth.uid();
  v_person public.person_type;
  v_approved boolean;
  v_is_wholesale boolean := false;
  v_order_id uuid;
  v_total numeric(12,2) := 0;
  v_item jsonb;
  v_product public.products%ROWTYPE;
  v_qty int;
  v_price numeric(10,2);
  v_line_total numeric(12,2);
BEGIN
  IF v_user IS NULL THEN
    RAISE EXCEPTION 'Not authenticated';
  END IF;

  IF _items IS NULL OR jsonb_array_length(_items) = 0 THEN
    RAISE EXCEPTION 'Order must contain at least one item';
  END IF;

  IF _address IS NULL OR jsonb_typeof(_address) <> 'object' THEN
    RAISE EXCEPTION 'Invalid address';
  END IF;

  SELECT person_type, approved INTO v_person, v_approved
  FROM public.profiles WHERE id = v_user;

  IF v_person IS NULL THEN
    RAISE EXCEPTION 'Profile not found';
  END IF;

  IF v_person = 'pj' AND v_approved = true AND public.has_role(v_user, 'atacado') THEN
    v_is_wholesale := true;
  END IF;

  v_order_id := gen_random_uuid();

  FOR v_item IN SELECT * FROM jsonb_array_elements(_items)
  LOOP
    v_qty := COALESCE((v_item->>'quantity')::int, 0);
    IF v_qty <= 0 THEN
      RAISE EXCEPTION 'Invalid quantity';
    END IF;

    SELECT * INTO v_product FROM public.products
    WHERE id = (v_item->>'product_id')::uuid AND active = true;

    IF v_product.id IS NULL THEN
      RAISE EXCEPTION 'Product not available';
    END IF;

    IF v_is_wholesale
       AND v_product.wholesale_price IS NOT NULL
       AND v_qty >= COALESCE(v_product.min_wholesale_qty, 1) THEN
      v_price := v_product.wholesale_price;
    ELSE
      v_price := v_product.retail_price;
    END IF;

    v_line_total := v_price * v_qty;
    v_total := v_total + v_line_total;

    INSERT INTO public.order_items (order_id, product_id, name, unit_price, quantity)
    VALUES (v_order_id, v_product.id, v_product.name, v_price, v_qty);
  END LOOP;

  INSERT INTO public.orders (id, user_id, total, customer_type, address, notes, status)
  VALUES (v_order_id, v_user, v_total, v_person, _address, _notes, 'pendente');

  RETURN v_order_id;
END;
$$;

REVOKE ALL ON FUNCTION public.create_order(jsonb, jsonb, text) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.create_order(jsonb, jsonb, text) TO authenticated;
