// backend/src/services/supabase.js
require('dotenv').config();

let supabase;

try {
  const { createClient } = require('@supabase/supabase-js');
  
  const supabaseUrl = process.env.SUPABASE_URL;
  const supabaseKey = process.env.SUPABASE_SERVICE_KEY || process.env.SUPABASE_ANON_KEY;
  
  if (!supabaseUrl || !supabaseKey) {
    console.warn('⚠️ Supabase credentials missing. Using mock data for development.');
    console.log('To use real Supabase, add SUPABASE_URL and SUPABASE_SERVICE_KEY to your .env file');
    
    // Use mock data for development
    supabase = require('./supabase.mock');
  } else {
    supabase = createClient(supabaseUrl, supabaseKey);
    console.log('✅ Supabase client initialized');
  }
} catch (error) {
  console.warn('⚠️ Supabase not installed or configured. Using mock data.');
  console.log('To install Supabase: npm install @supabase/supabase-js');
  
  // Use mock data
  supabase = require('./supabase.mock');
}

module.exports = supabase;