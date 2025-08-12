-- Enable Row Level Security on all tables
ALTER TABLE accounts ENABLE ROW LEVEL SECURITY;
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE budgets ENABLE ROW LEVEL SECURITY;

-- Accounts RLS Policies
CREATE POLICY "Users can view their own accounts"
    ON accounts FOR SELECT
    TO authenticated
    USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own accounts"
    ON accounts FOR INSERT
    TO authenticated
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own accounts"
    ON accounts FOR UPDATE
    TO authenticated
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own accounts"
    ON accounts FOR DELETE
    TO authenticated
    USING (auth.uid() = user_id);

-- Categories RLS Policies
CREATE POLICY "Users can view default categories and their own categories"
    ON categories FOR SELECT
    TO authenticated
    USING (is_default = TRUE OR auth.uid() = user_id);

CREATE POLICY "Users can insert their own categories"
    ON categories FOR INSERT
    TO authenticated
    WITH CHECK (auth.uid() = user_id AND is_default = FALSE);

CREATE POLICY "Users can update their own categories"
    ON categories FOR UPDATE
    TO authenticated
    USING (auth.uid() = user_id AND is_default = FALSE)
    WITH CHECK (auth.uid() = user_id AND is_default = FALSE);

CREATE POLICY "Users can delete their own categories"
    ON categories FOR DELETE
    TO authenticated
    USING (auth.uid() = user_id AND is_default = FALSE);

-- Transactions RLS Policies
CREATE POLICY "Users can view their own transactions"
    ON transactions FOR SELECT
    TO authenticated
    USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own transactions"
    ON transactions FOR INSERT
    TO authenticated
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own transactions"
    ON transactions FOR UPDATE
    TO authenticated
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own transactions"
    ON transactions FOR DELETE
    TO authenticated
    USING (auth.uid() = user_id);

-- Budgets RLS Policies
CREATE POLICY "Users can view their own budgets"
    ON budgets FOR SELECT
    TO authenticated
    USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own budgets"
    ON budgets FOR INSERT
    TO authenticated
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own budgets"
    ON budgets FOR UPDATE
    TO authenticated
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own budgets"
    ON budgets FOR DELETE
    TO authenticated
    USING (auth.uid() = user_id);