CREATE EXTENSION IF NOT EXISTS pg_trgm;

CREATE INDEX books_title_trgm_idx ON books USING GIN (title gin_trgm_ops);
CREATE INDEX authors_name_trgm_idx ON authors USING GIN (name gin_trgm_ops);
CREATE INDEX publishers_name_trgm_idx ON publishers USING GIN (name gin_trgm_ops);
