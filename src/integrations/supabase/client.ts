// This file is automatically generated. Do not edit it directly.
import { createClient } from '@supabase/supabase-js';
import type { Database } from './types';

const SUPABASE_URL = "https://aonoqzyjjzmjtswbythh.supabase.co";
const SUPABASE_PUBLISHABLE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFvbm9xenlqanptanRzd2J5dGhoIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDQ3NzQ1MTAsImV4cCI6MjA2MDM1MDUxMH0.S3gdIOWHMvoo8esUbIQgcB10k2qcE4-EvDzQDOsAI8M";

// Import the supabase client like this:
// import { supabase } from "@/integrations/supabase/client";

export const supabase = createClient<Database>(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY);