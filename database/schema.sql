-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- Create categories table
create table if not exists categories (
  id uuid primary key default uuid_generate_v4(),
  name text not null,
  type text not null check (type in ('income', 'expense')),
  icon text, -- Optional: Stores an icon name or emoji
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Insert default categories
insert into categories (name, type, icon) values
  ('Salário', 'income', '💰'),
  ('Freelance', 'income', '💻'),
  ('Investimentos', 'income', '📈'),
  ('Alimentação', 'expense', '🍔'),
  ('Transporte', 'expense', '🚗'),
  ('Moradia', 'expense', '🏠'),
  ('Lazer', 'expense', '🎉'),
  ('Saúde', 'expense', '💊'),
  ('Educação', 'expense', '📚'),
  ('Outros', 'expense', '📦')
on conflict do nothing;

-- Create transactions table
create table if not exists transactions (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid references auth.users not null,
  description text not null,
  amount numeric(10, 2) not null,
  date date not null default current_date,
  type text not null check (type in ('income', 'expense')),
  category_id uuid references categories(id),
  is_recurring boolean default false,
  recurrence_period text default 'monthly',
  installment_number integer,
  total_installments integer,
  parent_transaction_id uuid references transactions(id) on delete cascade,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Set up Row Level Security (RLS)

-- Categories: Visible to everyone, but read-only for normal users
alter table categories enable row level security;

create policy "Categories are viewable by everyone"
  on categories for select
  to authenticated, anon
  using (true);

-- Transactions: Restrict strictly to the owner
alter table transactions enable row level security;

create policy "Users can view their own transactions"
  on transactions for select
  to authenticated
  using (auth.uid() = user_id);

create policy "Users can insert their own transactions"
  on transactions for insert
  to authenticated
  with check (auth.uid() = user_id);

create policy "Users can update their own transactions"
  on transactions for update
  to authenticated
  using (auth.uid() = user_id);

create policy "Users can delete their own transactions"
  on transactions for delete
  to authenticated
  using (auth.uid() = user_id);
