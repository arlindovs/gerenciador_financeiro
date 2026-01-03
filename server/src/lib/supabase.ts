/**
 * Supabase Client Configuration
 * Configuração do Cliente Supabase
 */
import 'dotenv/config'
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.SUPABASE_URL
const supabaseKey = process.env.SUPABASE_ANON_KEY

// Validate environment variables at startup
// Valida variáveis de ambiente no startup
if (!supabaseUrl || !supabaseKey) {
  throw new Error('Missing SUPABASE_URL or SUPABASE_ANON_KEY environment variables')
}

export const supabase = createClient(supabaseUrl, supabaseKey)

/**
 * Create an authenticated Supabase client from Authorization header
 * Cria um cliente Supabase autenticado a partir do header Authorization
 */
export function getAuthenticatedClient(authHeader: string | undefined) {
  const token = authHeader?.startsWith('Bearer ') ? authHeader.substring(7) : null

  if (token) {
    return createClient(supabaseUrl!, supabaseKey!, {
      global: { headers: { Authorization: `Bearer ${token}` } }
    })
  }

  return supabase
}
