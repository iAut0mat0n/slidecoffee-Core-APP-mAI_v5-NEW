-- Check the actual column types for v2_user_context
SELECT 
  column_name, 
  data_type, 
  udt_name,
  character_maximum_length
FROM information_schema.columns 
WHERE table_schema = 'public' 
  AND table_name = 'v2_user_context'
ORDER BY ordinal_position;
