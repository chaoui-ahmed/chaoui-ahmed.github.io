-- Créer une fonction RPC pour créer la table journal_entries
CREATE OR REPLACE FUNCTION create_journal_entries_table()
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Créer la table si elle n'existe pas
  CREATE TABLE IF NOT EXISTS journal_entries (
    id TEXT PRIMARY KEY,
    content TEXT NOT NULL,
    mood TEXT NOT NULL,
    hashtags TEXT[] NOT NULL,
    date TIMESTAMP WITH TIME ZONE NOT NULL,
    photos TEXT[] DEFAULT '{}'
  );
  
  -- Créer les index
  CREATE INDEX IF NOT EXISTS journal_entries_date_idx ON journal_entries(date);
  
  -- Créer un index GIN pour la recherche full-text
  CREATE INDEX IF NOT EXISTS journal_entries_content_idx ON journal_entries USING gin(to_tsvector('french', content));
  
  RETURN true;
EXCEPTION
  WHEN OTHERS THEN
    RAISE NOTICE 'Error creating table: %', SQLERRM;
    RETURN false;
END;
$$;
