
-- Enum de tipo de pessoa
CREATE TYPE public.person_type AS ENUM ('pf', 'pj');
CREATE TYPE public.app_role AS ENUM ('admin', 'atacado', 'varejo');
CREATE TYPE public.order_status AS ENUM ('pendente', 'confirmado', 'em_separacao', 'em_transporte', 'entregue', 'cancelado');

-- PROFILES
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  full_name TEXT,
  phone TEXT,
  person_type public.person_type NOT NULL DEFAULT 'pf',
  document TEXT, -- CPF ou CNPJ
  company_name TEXT,
  state_registration TEXT,
  approved BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE ON public.profiles TO authenticated;
GRANT ALL ON public.profiles TO service_role;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users view own profile" ON public.profiles FOR SELECT TO authenticated USING (auth.uid() = id);
CREATE POLICY "Users update own profile" ON public.profiles FOR UPDATE TO authenticated USING (auth.uid() = id);
CREATE POLICY "Users insert own profile" ON public.profiles FOR INSERT TO authenticated WITH CHECK (auth.uid() = id);

-- USER ROLES
CREATE TABLE public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role public.app_role NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(user_id, role)
);
GRANT SELECT ON public.user_roles TO authenticated;
GRANT ALL ON public.user_roles TO service_role;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users view own roles" ON public.user_roles FOR SELECT TO authenticated USING (auth.uid() = user_id);

-- has_role function
CREATE OR REPLACE FUNCTION public.has_role(_user_id uuid, _role public.app_role)
RETURNS BOOLEAN
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public
AS $$
  SELECT EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = _user_id AND role = _role)
$$;

-- Trigger: cria profile e atribui role ao se cadastrar
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public
AS $$
DECLARE
  v_person_type public.person_type;
BEGIN
  v_person_type := COALESCE((NEW.raw_user_meta_data->>'person_type')::public.person_type, 'pf');

  INSERT INTO public.profiles (id, email, full_name, person_type, document, company_name, phone, approved)
  VALUES (
    NEW.id,
    NEW.email,
    NEW.raw_user_meta_data->>'full_name',
    v_person_type,
    NEW.raw_user_meta_data->>'document',
    NEW.raw_user_meta_data->>'company_name',
    NEW.raw_user_meta_data->>'phone',
    v_person_type = 'pf' -- PF aprovado automaticamente
  );

  -- PF recebe role varejo; PJ aguarda aprovação manual
  IF v_person_type = 'pf' THEN
    INSERT INTO public.user_roles (user_id, role) VALUES (NEW.id, 'varejo');
  END IF;

  RETURN NEW;
END;
$$;

CREATE TRIGGER on_auth_user_created
AFTER INSERT ON auth.users
FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- CATEGORIES
CREATE TABLE public.categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  parent_id UUID REFERENCES public.categories(id) ON DELETE SET NULL,
  sort_order INT NOT NULL DEFAULT 0,
  is_own_line BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT ON public.categories TO anon, authenticated;
GRANT ALL ON public.categories TO service_role;
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Categories public read" ON public.categories FOR SELECT TO anon, authenticated USING (true);

-- PRODUCTS
CREATE TABLE public.products (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  category_id UUID REFERENCES public.categories(id) ON DELETE SET NULL,
  brand TEXT,
  sku TEXT,
  unit TEXT NOT NULL DEFAULT 'un', -- un, m2, saco, peça
  retail_price NUMERIC(10,2) NOT NULL DEFAULT 0,
  wholesale_price NUMERIC(10,2) NOT NULL DEFAULT 0,
  min_wholesale_qty INT NOT NULL DEFAULT 1,
  image_url TEXT,
  is_own_line BOOLEAN NOT NULL DEFAULT false,
  in_stock BOOLEAN NOT NULL DEFAULT true,
  featured BOOLEAN NOT NULL DEFAULT false,
  specs JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT ON public.products TO anon, authenticated;
GRANT ALL ON public.products TO service_role;
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Products public read" ON public.products FOR SELECT TO anon, authenticated USING (true);

-- CART ITEMS
CREATE TABLE public.cart_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  product_id UUID NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
  quantity INT NOT NULL CHECK (quantity > 0),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(user_id, product_id)
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.cart_items TO authenticated;
GRANT ALL ON public.cart_items TO service_role;
ALTER TABLE public.cart_items ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users manage own cart" ON public.cart_items FOR ALL TO authenticated
  USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- ORDERS
CREATE TABLE public.orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  total NUMERIC(12,2) NOT NULL,
  status public.order_status NOT NULL DEFAULT 'pendente',
  customer_type public.person_type NOT NULL,
  address JSONB NOT NULL,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT ON public.orders TO authenticated;
GRANT ALL ON public.orders TO service_role;
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users view own orders" ON public.orders FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Users create own orders" ON public.orders FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);

CREATE TABLE public.order_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id UUID NOT NULL REFERENCES public.orders(id) ON DELETE CASCADE,
  product_id UUID REFERENCES public.products(id) ON DELETE SET NULL,
  name TEXT NOT NULL,
  unit_price NUMERIC(10,2) NOT NULL,
  quantity INT NOT NULL
);
GRANT SELECT, INSERT ON public.order_items TO authenticated;
GRANT ALL ON public.order_items TO service_role;
ALTER TABLE public.order_items ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users view own order items" ON public.order_items FOR SELECT TO authenticated
  USING (EXISTS (SELECT 1 FROM public.orders o WHERE o.id = order_id AND o.user_id = auth.uid()));
CREATE POLICY "Users create own order items" ON public.order_items FOR INSERT TO authenticated
  WITH CHECK (EXISTS (SELECT 1 FROM public.orders o WHERE o.id = order_id AND o.user_id = auth.uid()));

-- CONTACT MESSAGES
CREATE TABLE public.contact_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT,
  subject TEXT,
  message TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT INSERT ON public.contact_messages TO anon, authenticated;
GRANT ALL ON public.contact_messages TO service_role;
ALTER TABLE public.contact_messages ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can submit contact" ON public.contact_messages FOR INSERT TO anon, authenticated WITH CHECK (true);

-- SEED categorias e produtos exemplo
INSERT INTO public.categories (slug, name, description, sort_order, is_own_line) VALUES
  ('blocos-estruturais', 'Blocos Estruturais', 'Blocos de concreto para alvenaria estrutural', 1, true),
  ('blocos-vedacao', 'Blocos de Vedação', 'Blocos de concreto para vedação', 2, true),
  ('pavers', 'Pavers e Pisos', 'Pavers intertravados e pisos de concreto', 3, true),
  ('linha-arquitetura', 'Linha Arquitetura', 'Blocos e elementos com design diferenciado', 4, true),
  ('cimento-argamassa', 'Cimento e Argamassa', 'Votorantim, Fame e outras marcas', 5, false),
  ('hidraulica', 'Hidráulica', 'Tubos, conexões e acessórios Tigre', 6, false),
  ('eletrica', 'Elétrica', 'Materiais elétricos Pial, Meber e Lafont', 7, false),
  ('ferramentas-acessorios', 'Ferramentas e Acessórios', 'Itens diversos para obra', 8, false);

INSERT INTO public.products (slug, name, description, category_id, brand, sku, unit, retail_price, wholesale_price, min_wholesale_qty, is_own_line, featured) VALUES
  ('bloco-estrutural-14x19x39', 'Bloco Estrutural 14x19x39cm', 'Bloco de concreto estrutural fbk 6 MPa, ideal para alvenaria portante.', (SELECT id FROM public.categories WHERE slug='blocos-estruturais'), 'Milblocos', 'BE-14-6', 'un', 5.90, 4.20, 500, true, true),
  ('bloco-estrutural-19x19x39', 'Bloco Estrutural 19x19x39cm', 'Bloco de concreto estrutural fbk 8 MPa.', (SELECT id FROM public.categories WHERE slug='blocos-estruturais'), 'Milblocos', 'BE-19-8', 'un', 7.50, 5.40, 500, true, false),
  ('bloco-vedacao-9x19x39', 'Bloco Vedação 9x19x39cm', 'Bloco de concreto leve para alvenaria de vedação.', (SELECT id FROM public.categories WHERE slug='blocos-vedacao'), 'Milblocos', 'BV-09', 'un', 3.20, 2.30, 1000, true, true),
  ('bloco-vedacao-14x19x39', 'Bloco Vedação 14x19x39cm', 'Bloco de concreto para vedação de paredes externas.', (SELECT id FROM public.categories WHERE slug='blocos-vedacao'), 'Milblocos', 'BV-14', 'un', 4.10, 2.95, 1000, true, false),
  ('paver-retangular-cinza', 'Paver Retangular 10x20cm Cinza', 'Piso intertravado de concreto, 6cm de espessura, resistência 35 MPa.', (SELECT id FROM public.categories WHERE slug='pavers'), 'Milblocos', 'PV-RET-CZ', 'm2', 62.00, 48.00, 100, true, true),
  ('paver-retangular-vermelho', 'Paver Retangular 10x20cm Vermelho', 'Piso intertravado pigmentado em vermelho.', (SELECT id FROM public.categories WHERE slug='pavers'), 'Milblocos', 'PV-RET-VM', 'm2', 68.00, 53.00, 100, true, false),
  ('paver-sextavado', 'Paver Sextavado 25cm', 'Paver sextavado tradicional, alta durabilidade.', (SELECT id FROM public.categories WHERE slug='pavers'), 'Milblocos', 'PV-SXT', 'm2', 58.00, 45.00, 100, true, false),
  ('bloco-arquitetonico-vazado', 'Cobogó Vazado Linear', 'Elemento arquitetônico vazado para fachadas e divisórias.', (SELECT id FROM public.categories WHERE slug='linha-arquitetura'), 'Milblocos Arch', 'ARCH-COB-01', 'un', 32.00, 24.00, 50, true, true),
  ('bloco-arquitetonico-trama', 'Cobogó Trama', 'Cobogó arquitetônico em concreto branco.', (SELECT id FROM public.categories WHERE slug='linha-arquitetura'), 'Milblocos Arch', 'ARCH-COB-02', 'un', 38.00, 28.00, 50, true, false),
  ('cimento-cpv-arr', 'Cimento CP-V ARI 50kg', 'Cimento Portland de alta resistência inicial, saco de 50kg.', (SELECT id FROM public.categories WHERE slug='cimento-argamassa'), 'Votorantim', 'CIM-CPV', 'saco', 45.00, 38.00, 50, false, true),
  ('argamassa-ac-iii', 'Argamassa Colante AC-III 20kg', 'Argamassa para áreas externas e fachadas.', (SELECT id FROM public.categories WHERE slug='cimento-argamassa'), 'Fame', 'ARG-AC3', 'saco', 32.00, 26.00, 40, false, false),
  ('tubo-pvc-100', 'Tubo PVC Esgoto 100mm 6m', 'Tubo de PVC para esgoto série normal.', (SELECT id FROM public.categories WHERE slug='hidraulica'), 'Tigre', 'TIG-T100', 'un', 89.00, 72.00, 20, false, false),
  ('tubo-pvc-soldavel-25', 'Tubo Soldável 25mm 6m', 'Tubo PVC marrom para água fria.', (SELECT id FROM public.categories WHERE slug='hidraulica'), 'Tigre', 'TIG-S25', 'un', 28.00, 22.00, 30, false, false),
  ('disjuntor-mono-20a', 'Disjuntor Monopolar 20A', 'Disjuntor termomagnético DIN.', (SELECT id FROM public.categories WHERE slug='eletrica'), 'Pial', 'PIA-DJ20', 'un', 19.90, 15.50, 30, false, false),
  ('fio-flexivel-2-5', 'Fio Flexível 2,5mm² 100m', 'Cabo flexível antichama 750V.', (SELECT id FROM public.categories WHERE slug='eletrica'), 'Lafont', 'LAF-25', 'rolo', 285.00, 245.00, 10, false, false),
  ('caixa-luz-4x2', 'Caixa de Luz 4x2 PVC', 'Caixa de embutir para tomadas e interruptores.', (SELECT id FROM public.categories WHERE slug='eletrica'), 'Meber', 'MEB-4X2', 'un', 3.50, 2.40, 100, false, false);
