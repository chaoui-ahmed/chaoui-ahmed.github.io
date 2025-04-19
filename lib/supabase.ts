import { createClient } from "@supabase/supabase-js"

// Création d'un singleton pour le client Supabase côté client
let supabaseClient: ReturnType<typeof createClient> | null = null

export const getSupabaseClient = () => {
  // Afficher les variables d'environnement pour le débogage (sans les valeurs sensibles)
  console.log("NEXT_PUBLIC_SUPABASE_URL exists:", !!process.env.NEXT_PUBLIC_SUPABASE_URL)
  console.log("NEXT_PUBLIC_SUPABASE_ANON_KEY exists:", !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY)
  console.log(
    "SUPABASE_SUPABASE_NEXT_PUBLIC_SUPABASE_URL exists:",
    !!process.env.SUPABASE_SUPABASE_NEXT_PUBLIC_SUPABASE_URL,
  )

  if (typeof window === "undefined") {
    // Côté serveur
    return createClient(
      process.env.SUPABASE_SUPABASE_NEXT_PUBLIC_SUPABASE_URL || "",
      process.env.SUPABASE_SUPABASE_ANON_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "",
    )
  }

  // Côté client - utiliser un singleton pour éviter de multiples instances
  if (!supabaseClient) {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || ""
    const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ""

    console.log("Creating Supabase client with URL:", supabaseUrl.substring(0, 10) + "...")

    supabaseClient = createClient(supabaseUrl, supabaseKey)
  }

  return supabaseClient
}
