import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL ?? ''
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY ?? ''

const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true
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

// Fetch conversations from the database
export async function fetchConversations(userId: string) {
  try {
    const { data, error } = await supabase
      .from('conversations')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching conversations:', error.message);
      return [];
    }

    return data;
  } catch (err) {
    console.error('Unexpected error:', err);
    return [];
  }
}

// Store a new conversation in the database
export async function storeConversation(conversation: any) {
  try {
    const { error } = await supabase
      .from('conversations')
      .insert([conversation]);

    if (error) {
      console.error('Error storing conversation:', error.message);
      return false;
    }

    return true;
  } catch (err) {
    console.error('Unexpected error:', err);
    return false;
  }
}

export default supabase
