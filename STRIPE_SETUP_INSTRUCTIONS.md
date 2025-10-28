# Инструкции по настройке Stripe

## Что нужно сделать в Stripe Dashboard

### 1. Получить API Keys

1. Зайдите в [Stripe Dashboard](https://dashboard.stripe.com/)
2. Перейдите в раздел **Developers** → **API keys**
3. Скопируйте:
   - **Publishable key** (начинается с `pk_test_` для тестового режима)
   - **Secret key** (начинается с `sk_test_` для тестового режима)

### 2. Создать Products и Prices

Создайте следующие продукты в разделе **Products**:

#### Product 1: Odborník
- **Name**: Odborník Plan
- **Description**: Odborník predplatné s rozšírenými funkciami
- Создайте 2 цены (Prices):
  - **Mesačné**: 9,90 € / месяц (recurring, monthly)
  - **Ročné**: 99,00 € / год (recurring, yearly)

#### Product 2: Expert
- **Name**: Expert Plan
- **Description**: Expert predplatné pre profesionálov
- Создайте 2 цены:
  - **Mesačné**: 19,90 € / месяц (recurring, monthly)
  - **Ročné**: 195,00 € / год (recurring, yearly)

#### Product 3: Profik
- **Name**: Profik Plan
- **Description**: Profik predplatné s prémiom funkciami
- Создайте 2 цены:
  - **Mesačné**: 25,50 € / месяц (recurring, monthly)
  - **Ročné**: 225,00 € / год (recurring, yearly)

#### Product 4: Premier
- **Name**: Premier Plan
- **Description**: Premier VIP doživotný prístup
- Создайте 1 цену:
  - **One-time payment**: 4979,00 € (one-time)

### 3. Скопировать Price IDs

После создания каждой цены, скопируйте **Price ID** (начинается с `price_`):

- Odborník Monthly Price ID: `price_xxxxxxxxxxxxx`
- Odborník Yearly Price ID: `price_xxxxxxxxxxxxx`
- Expert Monthly Price ID: `price_xxxxxxxxxxxxx`
- Expert Yearly Price ID: `price_xxxxxxxxxxxxx`
- Profik Monthly Price ID: `price_xxxxxxxxxxxxx`
- Profik Yearly Price ID: `price_xxxxxxxxxxxxx`
- Premier Price ID: `price_xxxxxxxxxxxxx`

### 4. Обновить файл .env

Добавьте все полученные ключи в файл `.env`:

```env
# Stripe Configuration
VITE_STRIPE_PUBLISHABLE_KEY=pk_test_ваш_publishable_key
VITE_STRIPE_ODBORNIK_MONTHLY_PRICE_ID=price_xxxxxxxxx
VITE_STRIPE_ODBORNIK_YEARLY_PRICE_ID=price_xxxxxxxxx
VITE_STRIPE_EXPERT_MONTHLY_PRICE_ID=price_xxxxxxxxx
VITE_STRIPE_EXPERT_YEARLY_PRICE_ID=price_xxxxxxxxx
VITE_STRIPE_PROFIK_MONTHLY_PRICE_ID=price_xxxxxxxxx
VITE_STRIPE_PROFIK_YEARLY_PRICE_ID=price_xxxxxxxxx
VITE_STRIPE_PREMIER_PRICE_ID=price_xxxxxxxxx
```

## Структура базы данных

Создана таблица `subscriptions` для отслеживания подписок:
- Автоматически активируется бесплатный план **Mini** при регистрации
- Хранит информацию о текущем плане, периоде оплаты, статусе
- Связана с Stripe через `stripe_subscription_id` и `stripe_customer_id`

Создана таблица `payment_history` для истории платежей:
- Записывает все успешные и неуспешные платежи
- Хранит Stripe Payment Intent ID для отслеживания
- Показывает сумму, метод оплаты и статус

## Что дальше?

После настройки Stripe:
1. Скопируйте все ключи и Price IDs
2. Обновите файл `.env`
3. Перезапустите dev server
4. Протестируйте покупку подписки (в тестовом режиме используйте тестовую карту `4242 4242 4242 4242`)

Система автоматически:
- Создаст Stripe Customer
- Оформит подписку
- Запишет данные в базу
- Активирует выбранный план
- Отменит предыдущую активную подписку
