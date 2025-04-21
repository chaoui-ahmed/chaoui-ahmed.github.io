import Navbar from "@/components/Navbar"
import AnimatedBackground from "@/components/AnimatedBackground"
import SupabaseDiagnostic from "@/components/SupabaseDiagnostic"

export default function DiagnosticPage() {
  return (
    <div className="min-h-screen bg-[#f5f5f0]">
      <AnimatedBackground />
      <Navbar />
      <div className="container mx-auto p-4">
        <h1 className="text-3xl font-bold mb-6 text-black">Diagnostic Supabase</h1>
        <SupabaseDiagnostic />
      </div>
    </div>
  )
}
