-- Enable pgvector extension
CREATE EXTENSION IF NOT EXISTS vector;

-- Create memories table
CREATE TABLE IF NOT EXISTS memories (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id text NOT NULL,
  content text NOT NULL,
  embedding vector(1536),
  memory_type text NOT NULL CHECK (memory_type IN (
    'conversation',
    'insight',
    'preference',
    'presentation_topic',
    'design_preference',
    'goal',
    'milestone'
  )),
  importance_score numeric DEFAULT 0.5 CHECK (importance_score BETWEEN 0 AND 1),
  metadata jsonb DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  last_accessed_at timestamptz,
  access_count integer DEFAULT 0
);

-- Create vector similarity index (CRITICAL for performance)
CREATE INDEX IF NOT EXISTS memories_embedding_idx 
ON memories 
USING ivfflat (embedding vector_cosine_ops)
WITH (lists = 100);

-- Create metadata indexes
CREATE INDEX IF NOT EXISTS memories_user_type_idx 
ON memories(user_id, memory_type);

CREATE INDEX IF NOT EXISTS memories_created_at_idx 
ON memories(created_at DESC);

-- Create knowledge_base table (for curated presentation templates/resources)
CREATE TABLE IF NOT EXISTS knowledge_base (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  content text NOT NULL,
  embedding vector(1536),
  category text NOT NULL,
  tags text[],
  source_url text,
  metadata jsonb DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS knowledge_base_embedding_idx 
ON knowledge_base 
USING ivfflat (embedding vector_cosine_ops)
WITH (lists = 100);
