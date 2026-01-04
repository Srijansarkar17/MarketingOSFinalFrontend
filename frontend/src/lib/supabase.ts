import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://hkgcyrheviatmdflbxqu.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhrZ2N5cmhldmlhdG1kZmxieHF1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjY0MDMzNDEsImV4cCI6MjA4MTk3OTM0MX0.cMExlyXjJ7LgH6FcuMhUf3OJd3oB6pWb9oYl5fIQgds';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);