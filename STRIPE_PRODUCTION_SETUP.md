# Stripe Production Setup - Пошаговая инструкция

## Часть 1: Создание продуктов в Stripe (Live Mode)

### Шаг 1: Переключиться в Live режим
1. Зайди в свой [Stripe Dashboard](https://dashboard.stripe.com)
2. В левом верхнем углу переключи с **"Test mode"** на **"Live mode"**

### Шаг 2: Создать продукты

#### Продукт 1: Odborník Plan
1. Перейди в **"Product catalog"** → **"Products"**
2. Нажми **"+ Add product"**
3. Заполни данные:
   - **Name**: `Odborník Plan`
   - **Description**: `Základný plán pre začínajúcich majstrov`
4. **Pricing**:
   - **Recurring**: ✓ (включи)
   - **Price**: `9.90 EUR`
   - **Billing period**: `Monthly`
   - Нажми **"Add another price"**
   - **Price**: `99.00 EUR`
   - **Billing period**: `Yearly`
5. **Tax category**: `General - Electronically Supplied Services`
6. Нажми **"Save product"**
7. **ВАЖНО**: Скопируй оба Price ID:
   - Monthly Price ID: `price_xxxxxxxxxxxxx`
   - Yearly Price ID: `price_xxxxxxxxxxxxx`

#### Продукт 2: Expert Plan
1. Нажми **"+ Add product"**
2. Заполни данные:
   - **Name**: `Expert Plan`
   - **Description**: `Rozšírený plán pre skúsených majstrov`
3. **Pricing**:
   - **Recurring**: ✓
   - **Price**: `19.90 EUR`
   - **Billing period**: `Monthly`
   - Нажми **"Add another price"**
   - **Price**: `195.00 EUR`
   - **Billing period**: `Yearly`
4. **Tax category**: `General - Electronically Supplied Services`
5. Нажми **"Save product"**
6. **ВАЖНО**: Скопируй оба Price ID

#### Продукт 3: Profík Plan
1. Нажми **"+ Add product"**
2. Заполни данные:
   - **Name**: `Profík Plan`
   - **Description**: `Profesionálny plán s maximálnymi možnosťami`
3. **Pricing**:
   - **Recurring**: ✓
   - **Price**: `25.50 EUR`
   - **Billing period**: `Monthly`
   - Нажми **"Add another price"**
   - **Price**: `225.00 EUR`
   - **Billing period**: `Yearly`
4. **Tax category**: `General - Electronically Supplied Services`
5. Нажми **"Save product"**
6. **ВАЖНО**: Скопируй оба Price ID

#### Продукт 4: Premier Plan
1. Нажми **"+ Add product"**
2. Заполни данные:
   - **Name**: `Premier Plan`
   - **Description**: `Prémiový plán pre top majstrov`
3. **Pricing**:
   - **One-time**: ✓ (выбери one-time вместо recurring)
   - **Price**: `4979.00 EUR`
4. **Tax category**: `General - Electronically Supplied Services`
5. Нажми **"Save product"**
6. **ВАЖНО**: Скопируй Price ID

### Шаг 3: Получить Live API ключи
1. Перейди в **"Developers"** → **"API keys"**
2. Убедись что **Live mode** активен
3. Скопируй следующие ключи:
   - **Publishable key** (начинается с `pk_live_...`)
   - **Secret key** (нажми "Reveal live key" и скопируй, начинается с `sk_live_...`)

### Шаг 4: Настроить Webhook
1. Перейди в **"Developers"** → **"Webhooks"**
2. Нажми **"+ Add endpoint"**
3. **Endpoint URL**: `https://твой-сайт.netlify.app/.netlify/functions/stripe-webhook`
   - Замени `твой-сайт.netlify.app` на свой реальный домен
4. **Events to send**: Выбери следующие события:
   - `checkout.session.completed`
   - `customer.subscription.updated`
   - `customer.subscription.deleted`
   - `invoice.payment_succeeded`
   - `invoice.payment_failed`
5. Нажми **"Add endpoint"**
6. **ВАЖНО**: Скопируй **Signing secret** (начинается с `whsec_...`)

---

## Часть 2: Настройка Netlify Environment Variables

### Шаг 1: Открыть настройки Netlify
1. Зайди в свой [Netlify Dashboard](https://app.netlify.com)
2. Выбери свой проект
3. Перейди в **"Site configuration"** → **"Environment variables"**

### Шаг 2: Добавить все переменные окружения

Нажми **"Add a variable"** для каждой из следующих переменных:

#### Stripe Keys (Production)
```
STRIPE_SECRET_KEY
Значение: sk_live_xxxxxxxxxxxxxxxxxx
(твой Live Secret key из Stripe)

STRIPE_WEBHOOK_SECRET
Значение: whsec_xxxxxxxxxxxxxxxxxx
(твой Webhook Signing secret из Stripe)

VITE_STRIPE_PUBLISHABLE_KEY
Значение: pk_live_xxxxxxxxxxxxxxxxxx
(твой Live Publishable key из Stripe)
```

#### Stripe Price IDs - Odborník Plan
```
VITE_STRIPE_ODBORNIK_MONTHLY_PRICE_ID
Значение: price_xxxxxxxxxxxxxxxxxx
(Monthly Price ID для Odborník Plan)

VITE_STRIPE_ODBORNIK_YEARLY_PRICE_ID
Значение: price_xxxxxxxxxxxxxxxxxx
(Yearly Price ID для Odborník Plan)
```

#### Stripe Price IDs - Expert Plan
```
VITE_STRIPE_EXPERT_MONTHLY_PRICE_ID
Значение: price_xxxxxxxxxxxxxxxxxx
(Monthly Price ID для Expert Plan)

VITE_STRIPE_EXPERT_YEARLY_PRICE_ID
Значение: price_xxxxxxxxxxxxxxxxxx
(Yearly Price ID для Expert Plan)
```

#### Stripe Price IDs - Profík Plan
```
VITE_STRIPE_PROFIK_MONTHLY_PRICE_ID
Значение: price_xxxxxxxxxxxxxxxxxx
(Monthly Price ID для Profík Plan)

VITE_STRIPE_PROFIK_YEARLY_PRICE_ID
Значение: price_xxxxxxxxxxxxxxxxxx
(Yearly Price ID для Profík Plan)
```

#### Stripe Price IDs - Premier Plan
```
VITE_STRIPE_PREMIER_MONTHLY_PRICE_ID
Значение: price_xxxxxxxxxxxxxxxxxx
(One-time Price ID для Premier Plan)

VITE_STRIPE_PREMIER_YEARLY_PRICE_ID
Значение: price_xxxxxxxxxxxxxxxxxx
(Тот же Price ID, что и для monthly)
```

#### Supabase Keys (уже должны быть настроены)
```
VITE_SUPABASE_URL
Значение: https://xxxxxxxxxx.supabase.co

VITE_SUPABASE_ANON_KEY
Значение: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

SUPABASE_SERVICE_ROLE_KEY
Значение: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
(Service Role Key - НЕ Anon Key!)
```

### Шаг 3: Сохранить и задеплоить
1. После добавления всех переменных нажми **"Save"**
2. Netlify автоматически перезапустит деплой с новыми переменными

---

## Часть 3: Обновление локальной разработки

Обнови свой локальный файл `.env`:

```env
# Supabase
VITE_SUPABASE_URL=https://xxxxxxxxxx.supabase.co
VITE_SUPABASE_ANON_KEY=твой_anon_key
SUPABASE_SERVICE_ROLE_KEY=твой_service_role_key

# Stripe Live Keys
STRIPE_SECRET_KEY=sk_live_xxxxxxxxxxxxxxxxxx
STRIPE_WEBHOOK_SECRET=whsec_xxxxxxxxxxxxxxxxxx
VITE_STRIPE_PUBLISHABLE_KEY=pk_live_xxxxxxxxxxxxxxxxxx

# Stripe Price IDs - Odborník
VITE_STRIPE_ODBORNIK_MONTHLY_PRICE_ID=price_xxxxxxxxxx
VITE_STRIPE_ODBORNIK_YEARLY_PRICE_ID=price_xxxxxxxxxx

# Stripe Price IDs - Expert
VITE_STRIPE_EXPERT_MONTHLY_PRICE_ID=price_xxxxxxxxxx
VITE_STRIPE_EXPERT_YEARLY_PRICE_ID=price_xxxxxxxxxx

# Stripe Price IDs - Profík
VITE_STRIPE_PROFIK_MONTHLY_PRICE_ID=price_xxxxxxxxxx
VITE_STRIPE_PROFIK_YEARLY_PRICE_ID=price_xxxxxxxxxx

# Stripe Price IDs - Premier
VITE_STRIPE_PREMIER_MONTHLY_PRICE_ID=price_xxxxxxxxxx
VITE_STRIPE_PREMIER_YEARLY_PRICE_ID=price_xxxxxxxxxx

# OpenRouter (для AI функций)
OPENROUTER_API_KEY=твой_openrouter_key
```

---

## Часть 4: Тестирование

### Тест 1: Локальное тестирование
```bash
npm run dev
```
1. Открой сайт локально
2. Зарегистрируйся или войди
3. Перейди на страницу подписок `/subscription`
4. Попробуй выбрать план (НЕ завершай оплату!)

### Тест 2: Production тестирование
1. После деплоя на Netlify открой свой production сайт
2. Создай тестовый аккаунт
3. Выбери план
4. Используй [тестовую карту Stripe](https://stripe.com/docs/testing#cards):
   - Номер: `4242 4242 4242 4242`
   - CVV: любые 3 цифры
   - Дата: любая будущая дата
5. Завершить оплату
6. Проверь в Stripe Dashboard, что подписка создана

### Тест 3: Webhook тестирование
1. В Stripe Dashboard перейди в **Webhooks**
2. Найди свой endpoint
3. Нажми **"Send test webhook"**
4. Выбери `checkout.session.completed`
5. Проверь логи Netlify Functions

---

## Часть 5: Активация Production

### ⚠️ ПЕРЕД ЗАПУСКОМ В PRODUCTION:

1. **Активируй свой Stripe аккаунт**:
   - Заполни бизнес информацию
   - Добавь банковский счет для получения платежей
   - Настрой налоги (если требуется)

2. **Проверь безопасность**:
   - Убедись что `STRIPE_SECRET_KEY` и `SUPABASE_SERVICE_ROLE_KEY` НЕ используются на фронтенде
   - Проверь что все переменные правильно настроены в Netlify

3. **Юридические требования**:
   - Добавь Terms of Service
   - Добавь Privacy Policy
   - Настрой возвраты и отмены подписок

---

## Troubleshooting

### Проблема: "STRIPE_SECRET_KEY is not configured"
- Проверь что переменная добавлена в Netlify
- Убедись что название точно `STRIPE_SECRET_KEY` (без опечаток)
- Перезапусти деплой после добавления переменных

### Проблема: Webhook не работает
- Проверь URL webhook в Stripe Dashboard
- Убедись что `STRIPE_WEBHOOK_SECRET` правильно настроен
- Проверь логи в Netlify Functions

### Проблема: "Price ID is not configured"
- Убедись что все Price ID добавлены в Netlify Environment Variables
- Проверь что названия переменных точно соответствуют указанным выше
- Перезапусти деплой

---

## Контрольный чеклист

- [ ] Создал все 4 продукта в Stripe Live Mode
- [ ] Скопировал все Price IDs (всего 7 штук)
- [ ] Получил Live API ключи (Publishable и Secret)
- [ ] Настроил Webhook endpoint в Stripe
- [ ] Скопировал Webhook Signing Secret
- [ ] Добавил все переменные окружения в Netlify (всего 13 штук)
- [ ] Обновил локальный `.env` файл
- [ ] Протестировал на тестовой карте
- [ ] Проверил что webhooks работают
- [ ] Активировал Stripe аккаунт для приема платежей
- [ ] Добавил банковский счет в Stripe

---

## Поддержка

Если возникнут проблемы:
1. Проверь логи Netlify Functions
2. Проверь вкладку "Logs" в Stripe Webhooks
3. Проверь консоль браузера (F12) для ошибок
