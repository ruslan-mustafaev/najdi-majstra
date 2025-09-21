-- ВРЕМЕННОЕ ОТКЛЮЧЕНИЕ RLS (только для тестирования!)
-- Выполни это в SQL Editor если ничего не помогает

-- Отключить RLS для masters
ALTER TABLE public.masters DISABLE ROW LEVEL SECURITY;

-- Отключить RLS для storage (ОСТОРОЖНО!)
-- ALTER TABLE storage.objects DISABLE ROW LEVEL SECURITY;

-- После тестирования ОБЯЗАТЕЛЬНО включи обратно:
-- ALTER TABLE public.masters ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE storage.objects ENABLE ROW LEVEL SECURITY;