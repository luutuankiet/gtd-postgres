# Enhanced Text Search Implementation Plan for GTD-Postgres

## Current State Assessment

The current text search implementation in `sample_textsearch_macro.sql` combines multiple fields into a single tsvector column with different weights:

- Title and content with weight 'A' using English dictionary
- Title, content, list name, and folder name with weight 'B' using English without stopwords
- Tags with weight 'C' using simple dictionary

While functional, this approach has limitations:
- All fields are searched simultaneously, which may return too many irrelevant results
- No specialized handling for different content types (tasks vs notes vs projects)
- Limited ability to tune relevance for specific search scenarios
- No support for phonetic matching or fuzzy search

## Proposed Enhancements

### 1. Refined Text Search Configuration

Create multiple specialized text search configurations:

- **Task-specific configuration**: Optimized for short, action-oriented text
- **Note-specific configuration**: Optimized for longer, descriptive content
- **Tag-specific configuration**: Specialized for keyword matching
- **Metadata configuration**: For list names, folder names, and other structured data

### 2. Separate Search Vectors

Instead of a single combined search vector, create multiple purpose-specific vectors:

```sql
-- Add multiple search vectors
ALTER TABLE {{this}}
ADD title_search tsvector GENERATED ALWAYS AS (
  setweight(to_tsvector('english', todo_title), 'A') ||
  setweight(to_tsvector('english_nostop_cfg', todo_title), 'A')
) STORED,

ADD content_search tsvector GENERATED ALWAYS AS (
  setweight(to_tsvector('english', todo_content), 'B') ||
  setweight(to_tsvector('english_nostop_cfg', todo_content), 'C')
) STORED,

ADD metadata_search tsvector GENERATED ALWAYS AS (
  setweight(to_tsvector('english_nostop_cfg', todo_list_name), 'C') ||
  setweight(to_tsvector('english_nostop_cfg', todo_folder_name), 'C')
) STORED,

ADD tag_search tsvector GENERATED ALWAYS AS (
  setweight(to_tsvector('simple', todo_tags), 'D')
) STORED;

-- Create indexes for each vector
CREATE INDEX idx_title_search ON {{this}} USING gin(title_search);
CREATE INDEX idx_content_search ON {{this}} USING gin(content_search);
CREATE INDEX idx_metadata_search ON {{this}} USING gin(metadata_search);
CREATE INDEX idx_tag_search ON {{this}} USING gin(tag_search);
```

### 3. Enhanced Search Function

Create a more sophisticated search function that allows targeted searching:

```sql
CREATE OR REPLACE FUNCTION {{ env_var("TARGET_SCHEMA",'dev') }}.search_gtd_enhanced (
  query text,
  search_title boolean DEFAULT true,
  search_content boolean DEFAULT true,
  search_metadata boolean DEFAULT true,
  search_tags boolean DEFAULT true,
  min_rank float DEFAULT 0.01
) RETURNS TABLE (
  todo_id text,
  todo_title text,
  todo_content text,
  todo_list_name text,
  todo_folder_name text,
  todo_tags text,
  link text,
  todo_duedate text,
  rank_score float,
  match_type text
) AS $$
WITH search_results AS (
  SELECT
    todo_id,
    todo_title,
    todo_content,
    todo_list_name,
    todo_folder_name,
    todo_tags,
    'ticktick://ticktick.com/webapp/#p/' || list_id || '/tasks/' || todo_id AS link,
    todo_duedate,
    CASE
      WHEN search_title AND title_search @@ websearch_to_tsquery('english', query)
        THEN ts_rank(title_search, websearch_to_tsquery('english', query)) * 2.0
      ELSE 0
    END as title_rank,
    CASE
      WHEN search_content AND content_search @@ websearch_to_tsquery('english', query)
        THEN ts_rank(content_search, websearch_to_tsquery('english', query))
      ELSE 0
    END as content_rank,
    CASE
      WHEN search_metadata AND metadata_search @@ websearch_to_tsquery('english_nostop_cfg', query)
        THEN ts_rank(metadata_search, websearch_to_tsquery('english_nostop_cfg', query)) * 0.8
      ELSE 0
    END as metadata_rank,
    CASE
      WHEN search_tags AND tag_search @@ websearch_to_tsquery('simple', query)
        THEN ts_rank(tag_search, websearch_to_tsquery('simple', query)) * 1.5
      ELSE 0
    END as tag_rank
  FROM {{this}}
  WHERE 
    (search_title AND title_search @@ websearch_to_tsquery('english', query)) OR
    (search_content AND content_search @@ websearch_to_tsquery('english', query)) OR
    (search_metadata AND metadata_search @@ websearch_to_tsquery('english_nostop_cfg', query)) OR
    (search_tags AND tag_search @@ websearch_to_tsquery('simple', query))
)
SELECT
  todo_id,
  todo_title,
  todo_content,
  todo_list_name,
  todo_folder_name,
  todo_tags,
  link,
  todo_duedate,
  (title_rank + content_rank + metadata_rank + tag_rank) as rank_score,
  CASE
    WHEN title_rank > 0 THEN 
      CASE 
        WHEN content_rank > 0 OR metadata_rank > 0 OR tag_rank > 0 THEN 'multiple'
        ELSE 'title'
      END
    WHEN content_rank > 0 THEN 
      CASE 
        WHEN metadata_rank > 0 OR tag_rank > 0 THEN 'multiple'
        ELSE 'content'
      END
    WHEN metadata_rank > 0 THEN 
      CASE 
        WHEN tag_rank > 0 THEN 'multiple'
        ELSE 'metadata'
      END
    ELSE 'tag'
  END as match_type
FROM search_results
WHERE (title_rank + content_rank + metadata_rank + tag_rank) > min_rank
ORDER BY rank_score DESC;
$$ LANGUAGE SQL;
```

### 4. Phonetic Matching Support

Add phonetic matching for improved search flexibility:

```sql
-- Install the pg_trgm extension if not already available
CREATE EXTENSION IF NOT EXISTS pg_trgm;

-- Add a phonetic search column
ALTER TABLE {{this}}
ADD phonetic_title text GENERATED ALWAYS AS (
  lower(todo_title)
) STORED;

-- Create a trigram index for fuzzy matching
CREATE INDEX idx_phonetic_title ON {{this}} USING gin(phonetic_title gin_trgm_ops);

-- Create a function for phonetic/fuzzy search
CREATE OR REPLACE FUNCTION {{ env_var("TARGET_SCHEMA",'dev') }}.fuzzy_search_gtd(
  search_term text,
  similarity_threshold float DEFAULT 0.3
) RETURNS TABLE (
  todo_id text,
  todo_title text,
  similarity float
) AS $$
SELECT
  todo_id,
  todo_title,
  similarity(phonetic_title, lower(search_term)) as similarity
FROM {{this}}
WHERE similarity(phonetic_title, lower(search_term)) > similarity_threshold
ORDER BY similarity DESC;
$$ LANGUAGE SQL;
```

### 5. Context-Aware Search Function

Create a function that adapts search behavior based on query patterns:

```sql
CREATE OR REPLACE FUNCTION {{ env_var("TARGET_SCHEMA",'dev') }}.smart_search_gtd(
  search_query text
) RETURNS TABLE (
  todo_id text,
  todo_title text,
  todo_content text,
  todo_list_name text,
  todo_folder_name text,
  todo_tags text,
  link text,
  todo_duedate text,
  rank_score float,
  match_type text
) AS $$
DECLARE
  is_tag_search boolean;
  is_list_search boolean;
  is_date_search boolean;
  modified_query text;
BEGIN
  -- Detect if this looks like a tag search
  is_tag_search := search_query LIKE '#%';
  
  -- Detect if this looks like a list search
  is_list_search := search_query LIKE '@%';
  
  -- Detect if this looks like a date search
  is_date_search := search_query ~* '(today|tomorrow|yesterday|next week|this month)';
  
  -- Modify query based on detected pattern
  IF is_tag_search THEN
    modified_query := substring(search_query from 2);
    RETURN QUERY SELECT * FROM {{ env_var("TARGET_SCHEMA",'dev') }}.search_gtd_enhanced(
      modified_query, false, false, false, true, 0.01
    );
  ELSIF is_list_search THEN
    modified_query := substring(search_query from 2);
    RETURN QUERY SELECT * FROM {{ env_var("TARGET_SCHEMA",'dev') }}.search_gtd_enhanced(
      modified_query, false, false, true, false, 0.01
    );
  ELSIF is_date_search THEN
    -- Special handling for date queries would go here
    -- For now, just do a regular search
    RETURN QUERY SELECT * FROM {{ env_var("TARGET_SCHEMA",'dev') }}.search_gtd_enhanced(
      search_query, true, true, true, true, 0.01
    );
  ELSE
    -- Default search behavior
    RETURN QUERY SELECT * FROM {{ env_var("TARGET_SCHEMA",'dev') }}.search_gtd_enhanced(
      search_query, true, true, true, true, 0.01
    );
  END IF;
END;
$$ LANGUAGE plpgsql;
```

## Implementation Phases

### Phase 1: Foundation
1. Create the separate search vectors and indexes
2. Implement the enhanced search function
3. Update the FastAPI endpoint to use the new search function

### Phase 2: Advanced Features
1. Add phonetic matching support
2. Implement context-aware search
3. Create specialized search endpoints for different search types

### Phase 3: Optimization
1. Analyze search performance and adjust weights
2. Implement caching for frequent searches
3. Add search analytics to track common patterns

## Assumptions

1. The database has sufficient resources to handle multiple tsvector columns and indexes
2. The PostgreSQL version supports all required extensions (pg_trgm)
3. The search functionality will primarily be used by a single user
4. The dataset will remain relatively small (~8,000 records)
5. The FastAPI backend will be updated to expose the new search capabilities
6. The frontend will be enhanced to take advantage of the more sophisticated search options

## API Integration Considerations

When implementing the API endpoints, consider:

1. Adding parameters to control which vectors to search
2. Exposing the match_type in the response to highlight matches appropriately
3. Adding a parameter for minimum rank threshold
4. Creating specialized endpoints for different search patterns
5. Adding an endpoint to suggest search refinements based on initial results

This enhanced search implementation will provide a more robust foundation for your GTD search application while maintaining good performance for your dataset size.
