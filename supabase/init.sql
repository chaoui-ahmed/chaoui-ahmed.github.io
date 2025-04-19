-- Création de la table journal_entries
CREATE TABLE IF NOT EXISTS journal_entries (
  id TEXT PRIMARY KEY,
  content TEXT NOT NULL,
  mood TEXT NOT NULL,
  hashtags TEXT[] NOT NULL,
  date TIMESTAMP WITH TIME ZONE NOT NULL,
  photos TEXT[] DEFAULT '{}'
);

-- Création d'un index sur la date pour améliorer les performances des requêtes
CREATE INDEX IF NOT EXISTS journal_entries_date_idx ON journal_entries(date);

-- Création d'un index sur le contenu pour améliorer les performances des recherches
CREATE INDEX IF NOT EXISTS journal_entries_content_idx ON journal_entries USING gin(to_tsvector('french', content));
