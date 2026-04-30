-- Create habits table
CREATE TABLE IF NOT EXISTS public.habits (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    description TEXT,
    category TEXT,
    run_on_days INTEGER[] DEFAULT '{1,2,3,4,5,6,0}', -- 0=Sunday, 1=Monday, etc.
    preferred_hour INTEGER DEFAULT 8,
    duration_minutes INTEGER DEFAULT 30,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    deleted_at TIMESTAMP WITH TIME ZONE
);

-- Enable RLS
ALTER TABLE public.habits ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can view their own habits"
    ON public.habits FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own habits"
    ON public.habits FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own habits"
    ON public.habits FOR UPDATE
    USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own habits"
    ON public.habits FOR DELETE
    USING (auth.uid() = user_id);

-- Create a hook to update 'updated_at' column
CREATE TRIGGER update_habits_updated_at
    BEFORE UPDATE ON public.habits
    FOR EACH ROW
    EXECUTE FUNCTION update_modified_column();
