import { createClient } from "@supabase/supabase-js"

// Création d'un singleton pour le client Supabase côté client
let supabaseClient: ReturnType<typeof createClient> | null = null

export const getSupabaseClient = () => {
  if (typeof window === "undefined") {
    // Côté serveur
    return createClient(
      process.env.SUPABASE_SUPABASE_NEXT_PUBLIC_SUPABASE_URL || "",
      process.env.SUPABASE_SUPABASE_ANON_KEY || "",
    )
  }

  // Côté client - utiliser un singleton pour éviter de multiples instances
  if (!supabaseClient) {
    supabaseClient = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL || "",
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "",
    )
  }

  return supabaseClient
}
