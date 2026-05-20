/*import { createClient } from '@supabase/supabase-js'

const url = import.meta.env.VITE_SUPABASE_URL
const key = import.meta.env.VITE_SUPABASE_ANON_KEY

console.log('URL:', url)
console.log('KEY:', key)

if (!url || !key) throw new Error('Missing Supabase env variables')

export const supabase = createClient(url, key) */

import { createClient } from '@supabase/supabase-js'

export const supabase = createClient(
  'https://dbnweicdwjtogvgdksfx.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRibndlaWNkd2p0b2d2Z2Rrc2Z4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzkyMDY0NzAsImV4cCI6MjA5NDc4MjQ3MH0.L8GvMHm4giY872cyaRXQFnzq-WTBsYEvTacqCOzdFq4'
)