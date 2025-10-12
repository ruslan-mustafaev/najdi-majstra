# Исправление системы отзывов - Отображение имени клиента

## Проблема
При загрузке отзывов возникала ошибка 400 (Bad Request):
```
Could not find a relationship between 'master_reviews' and 'client_id' in the schema cache
```

И в отзывах не отображалось имя клиента, только текст "Клиент".

## Причина
1. Попытка сделать JOIN между `master_reviews` и `auth.users` через REST API Supabase
2. Такой JOIN требует специальных прав или использования RPC функций
3. Имя клиента не сохранялось при создании отзыва

## Решение

### 1. Добавлено поле `client_name` в таблицу `master_reviews`

Создана миграция `20251012000001_add_client_name_to_reviews.sql`:
- Добавлено поле `client_name TEXT` в таблицу `master_reviews`
- Поле будет заполняться при создании отзыва из метаданных пользователя

### 2. Обновлен компонент ReviewForm

При создании отзыва теперь сохраняется имя клиента:
```typescript
const clientName = user.user_metadata?.full_name ||
                  user.user_metadata?.name ||
                  user.email?.split('@')[0] ||
                  'Клиент';
```

Порядок приоритета для получения имени:
1. `full_name` из метаданных пользователя
2. `name` из метаданных пользователя
3. Часть email до символа @
4. Дефолтное значение "Клиент"

### 3. Упрощен запрос в MasterProfile

Убран сложный JOIN с `auth.users`, теперь:
```typescript
const { data, error } = await supabase
  .from('master_reviews')
  .select('*')
  .eq('master_id', master.userId)
  .order('created_at', { ascending: false });
```

И используется `client_name` из базы:
```typescript
const reviewsWithClients = data.map((review) => ({
  ...review,
  client: {
    name: review.client_name || 'Клиент'
  }
}));
```

## Как применить миграцию

1. Откройте в браузере: `/apply-migration.html`
2. Скопируйте SQL код из страницы
3. Перейдите в [Supabase SQL Editor](https://supabase.com/dashboard/project/budlyqnloyiyexsocpbb/sql/new)
4. Вставьте SQL и нажмите "Run"
5. Обновите страницу `/apply-migration.html` для проверки

## Результат

✅ Отзывы загружаются без ошибок
✅ Отображается имя клиента из его профиля
✅ Для старых отзывов (без client_name) показывается "Клиент"
✅ Новые отзывы будут содержать реальное имя клиента

## Измененные файлы

- `supabase/migrations/20251012000001_add_client_name_to_reviews.sql` - новая миграция
- `src/components/ReviewForm.tsx` - добавлено сохранение client_name
- `src/components/MasterProfile.tsx` - упрощен запрос и использование client_name
- `apply-migration.html` - обновлен для новой миграции
