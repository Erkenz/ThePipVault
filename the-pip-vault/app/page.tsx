import { ArrowRight, BarChart3, ShieldCheck, Zap } from "lucide-react";
import Link from "next/link";

export default function Home() {
  return (
    <div className="min-h-screen bg-pip-dark text-pip-text selection:bg-pip-gold selection:text-white font-sans">
      
      {/* --- Navbar Placeholder --- */}
      <header className="border-b border-pip-border bg-pip-card/50 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            {/* Logo Icon */}
            <div className="w-8 h-8 bg-pip-gold rounded-lg flex items-center justify-center shadow-lg shadow-pip-gold/20">
              <BarChart3 className="text-white w-5 h-5" />
            </div>
            <span className="font-bold text-xl tracking-tight text-white">The PipLab</span>
          </div>
          
          <nav className="hidden md:flex gap-8 text-sm font-medium text-pip-muted">
            <Link href="#" className="hover:text-pip-gold transition-colors">Features</Link>
            <Link href="#" className="hover:text-pip-gold transition-colors">Pricing</Link>
            <Link href="#" className="hover:text-pip-gold transition-colors">Community</Link>
          </nav>

          <div className="flex gap-4">
            <button className="text-white hover:text-pip-gold font-medium text-sm transition-colors">Login</button>
            <button className="bg-pip-gold hover:bg-yellow-600 text-white px-4 py-2 rounded-lg text-sm font-bold transition-all shadow-lg shadow-pip-gold/20 active:scale-95">
              Get Started
            </button>
          </div>
        </div>
      </header>

      {/* --- Hero Section --- */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 md:py-32 relative overflow-hidden">
        
        {/* Decoratieve gloed op de achtergrond */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-150 h-150 bg-pip-gold/10 rounded-full blur-[120px] -z-10 pointer-events-none" />

        <div className="text-center max-w-4xl mx-auto">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-pip-card border border-pip-border text-xs font-medium text-pip-gold mb-8 animate-pulse">
            <Zap size={14} />
            <span>v1.0 Public Beta is Live</span>
          </div>
          
          <h1 className="text-5xl md:text-7xl font-bold text-white mb-8 tracking-tight leading-tight">
            Master your <span className="text-transparent bg-clip-text bg-linear-to-r from-pip-gold to-yellow-200">Trading Edge</span>.
          </h1>
          
          <p className="text-xl text-pip-muted mb-12 leading-relaxed max-w-2xl mx-auto">
            Stop met gokken. Begin met meten. The PipLab is de ultieme journaling tool 
            om je ruwe data om te zetten in winstgevende gewoontes.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <button className="bg-pip-gold hover:bg-yellow-600 text-white px-8 py-4 rounded-xl font-bold text-lg transition-all flex items-center justify-center gap-2 shadow-xl shadow-pip-gold/20 w-full sm:w-auto">
              Start Gratis Journal
              <ArrowRight size={20} />
            </button>
            <button className="bg-pip-card hover:bg-pip-border border border-pip-border text-white px-8 py-4 rounded-xl font-bold text-lg transition-all w-full sm:w-auto">
              Bekijk Demo
            </button>
          </div>
        </div>

        {/* --- Feature Grid (Om de kleuren te testen) --- */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-32">
          {[
            { title: "Smart Analytics", icon: BarChart3, desc: "Visualiseer je equity curve en vind je verborgen lekken." },
            { title: "Bank Grade Security", icon: ShieldCheck, desc: "Je data is versleuteld en veilig in de vault." },
            { title: "Lightning Fast", icon: Zap, desc: "Gebouwd op Next.js voor directe laadtijden zonder vertraging." },
          ].map((feature, i) => (
            <div key={i} className="bg-pip-card border border-pip-border p-8 rounded-2xl hover:border-pip-gold/50 transition-colors group cursor-default">
              <div className="w-12 h-12 bg-pip-dark rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform border border-pip-border group-hover:border-pip-gold/30">
                <feature.icon className="text-pip-gold w-6 h-6" />
              </div>
              <h3 className="text-xl font-bold text-white mb-3">{feature.title}</h3>
              <p className="text-pip-muted leading-relaxed">{feature.desc}</p>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}