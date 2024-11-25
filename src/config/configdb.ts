import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL ?? ''
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY ?? ''

const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true
  },
  global: {
    headers: {
      Authorization: `Bearer ${localStorage.getItem('accessToken')}`
    }
  }
})

// Fonction de test de connexion
async function testSupabaseConnection() {
  try {
    // Test simple pour vérifier l'état de la connexion
    const { error } = await supabase.from('test').select('*').limit(1)
    
    if (error) {
      console.error('Erreur de connexion à Supabase:', error.message)
      return false
    }
    
    console.log('Connexion à Supabase réussie!')
    return true
  } catch (err) {
    console.error('Erreur inattendue:', err)
    return false
  }
}

// Exécuter le test
testSupabaseConnection()

export default supabase
