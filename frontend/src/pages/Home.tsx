import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Button } from '../components/ui/Button';
import { Shield, Zap, Cpu, Globe, Server, ArrowRight, Activity, Terminal, Menu, X } from 'lucide-react';

export default function Home() {
    const navigate = useNavigate();
    const [isMenuOpen, setIsMenuOpen] = useState(false);

    return (
        <div className="min-h-screen bg-background text-foreground selection:bg-primary/30 selection:text-primary relative overflow-hidden font-sans">
            {/* Scanline Overlay */}
            <div className="pointer-events-none absolute inset-0 z-50 bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.1)_50%),linear-gradient(90deg,rgba(255,0,0,0.03),rgba(0,255,0,0.01),rgba(0,0,255,0.03))] bg-[length:100%_4px,100%_100%] opacity-20" />

            {/* Grid Background */}
            <div className="absolute inset-0 cyber-grid opacity-20 pointer-events-none" />

            {/* Glowing Orbs */}
            <div className="absolute top-[-10%] left-[-10%] w-[300px] md:w-[600px] h-[300px] md:h-[600px] bg-primary/10 rounded-full blur-[80px] md:blur-[120px] animate-pulse-slow" />
            <div className="absolute bottom-[0%] right-[-10%] w-[250px] md:w-[500px] h-[250px] md:h-[500px] bg-primary/5 rounded-full blur-[70px] md:blur-[100px]" />

            {/* Navigation Header */}
            <header className="fixed top-0 w-full z-[60] border-b border-white/5 bg-black/60 backdrop-blur-xl">
                <div className="max-w-7xl mx-auto px-6 md:px-8 h-20 flex items-center justify-between">
                    <Link to="/" className="flex items-center space-x-3 group cursor-pointer relative z-[70]">
                        <div className="bg-primary/20 p-1 rounded-sm ring-1 ring-primary/40 group-hover:bg-primary/30 transition-all shadow-[0_0_15px_rgba(255,176,0,0.2)]">
                            <img src="/favicon.png" alt="ValutX" className="w-6 h-6 object-contain" />
                        </div>
                        <span className="font-bold text-xl md:text-2xl tracking-[0.2em] uppercase text-primary text-glow-amber">ValutX</span>
                    </Link>

                    {/* Desktop Nav */}
                    <nav className="hidden md:flex items-center space-x-10">
                        <a href="#features" className="text-[10px] font-bold uppercase tracking-[0.3em] text-muted-foreground hover:text-primary transition-colors">Infrastructure</a>
                        <a href="#tech" className="text-[10px] font-bold uppercase tracking-[0.3em] text-muted-foreground hover:text-primary transition-colors">Encryption</a>
                        <Button
                            variant="ghost"
                            className="text-[10px] font-bold uppercase tracking-[0.3em] border border-primary/20 hover:border-primary/50 text-white rounded-sm px-6"
                            onClick={() => navigate('/auth')}
                        >
                            Authorize
                        </Button>
                    </nav>

                    {/* Mobile Toggle */}
                    <button
                        className="md:hidden text-primary p-2 relative z-[70]"
                        onClick={() => setIsMenuOpen(!isMenuOpen)}
                    >
                        {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
                    </button>
                </div>

                {/* Mobile Menu Overlay */}
                <div className={`fixed inset-0 bg-black/95 backdrop-blur-2xl z-[65] transition-all duration-300 md:hidden ${isMenuOpen ? 'opacity-100 visible' : 'opacity-0 invisible'}`}>
                    <div className="flex flex-col items-center justify-center h-full space-y-12">
                        <a
                            href="#features"
                            className="text-lg font-bold uppercase tracking-[0.5em] text-primary"
                            onClick={() => setIsMenuOpen(false)}
                        >
                            Infrastructure
                        </a>
                        <a
                            href="#tech"
                            className="text-lg font-bold uppercase tracking-[0.5em] text-primary"
                            onClick={() => setIsMenuOpen(false)}
                        >
                            Encryption
                        </a>
                        <Button
                            size="lg"
                            className="bg-primary text-black font-black uppercase tracking-[0.3em] rounded-sm px-10 h-16 w-64"
                            onClick={() => {
                                setIsMenuOpen(false);
                                navigate('/auth');
                            }}
                        >
                            Authorize Access
                        </Button>
                    </div>
                </div>
            </header>

            {/* Hero Section */}
            <section className="pt-40 md:pt-48 pb-20 md:pb-32 px-6 md:px-8 relative">
                <div className="max-w-7xl mx-auto text-center relative z-10">
                    <div className="inline-flex items-center space-x-2 px-4 py-2 bg-primary/5 border border-primary/20 rounded-sm mb-12 animate-in fade-in slide-in-from-bottom-4 duration-700">
                        <div className="w-2 h-2 rounded-full bg-primary animate-flicker shadow-[0_0_10px_rgba(255,176,0,0.8)]" />
                        <span className="text-[10px] font-black uppercase tracking-[0.4em] text-primary">System Online // Version 1.0.4-Stable</span>
                    </div>
                    <h1 className="text-4xl sm:text-6xl md:text-8xl font-black uppercase tracking-tighter mb-8 leading-tight animate-in fade-in slide-in-from-bottom-8 duration-700 delay-100">
                        The ultimate <br />
                        <span className="text-primary text-glow-amber">Zero-Knowledge</span> vault
                    </h1>
                    <p className="max-w-2xl mx-auto text-muted-foreground text-xs sm:text-sm uppercase tracking-widest leading-loose mb-12 animate-in fade-in slide-in-from-bottom-12 duration-700 delay-200">
                        Military-grade encryption meets unbreakable anonymity.
                        Your data is encrypted locally before it ever reaches the cloud.
                        No one—not even us—can ever access your vault.
                    </p>
                    <div className="flex flex-col sm:flex-row items-center justify-center gap-6 animate-in fade-in slide-in-from-bottom-16 duration-700 delay-300">
                        <Button
                            size="lg"
                            className="bg-primary hover:bg-primary/80 text-black font-black uppercase tracking-[0.3em] rounded-sm px-10 h-16 shadow-[0_0_30px_rgba(255,176,0,0.3)] transition-all transform hover:scale-105 w-full sm:w-auto"
                            onClick={() => navigate('/auth')}
                        >
                            Initialize Sector <ArrowRight className="ml-3 w-5 h-5" />
                        </Button>
                        <Button
                            variant="outline"
                            size="lg"
                            className="border-white/10 hover:bg-white/5 text-white font-black uppercase tracking-[0.3em] rounded-sm px-10 h-16 w-full sm:w-auto"
                        >
                            View Protocols
                        </Button>
                    </div>
                </div>

                {/* Dashboard Preview / Aesthetic element */}
                <div className="mt-20 md:mt-32 max-w-6xl mx-auto relative animate-in fade-in zoom-in-95 duration-1000 delay-500 overflow-hidden px-4 md:px-0">
                    <div className="absolute inset-0 bg-primary/10 blur-[60px] md:blur-[120px] -z-10" />
                    <div className="border border-primary/30 rounded-sm bg-black/80 backdrop-blur-xl p-1 md:p-2 shadow-2xl relative">
                        {/* Mock Dashboard Top Bar */}
                        <div className="flex items-center justify-between px-2 md:px-4 py-2 border-b border-primary/20 bg-primary/5 mb-2">
                            <div className="flex space-x-1 md:space-x-2">
                                <div className="w-2 md:w-3 h-2 md:h-3 rounded-full bg-red-500/50" />
                                <div className="w-2 md:w-3 h-2 md:h-3 rounded-full bg-primary/50" />
                                <div className="w-2 md:w-3 h-2 md:h-3 rounded-full bg-green-500/50" />
                            </div>
                            <div className="text-[6px] md:text-[8px] font-mono text-primary animate-pulse tracking-widest uppercase truncate ml-2">ENCRYPTED_LINE_ACTIVE // 256-BIT_GCM</div>
                        </div>
                        <div className="h-48 md:h-64 bg-black/40 flex items-center justify-center border border-primary/10 relative overflow-hidden group">
                            <div className="absolute inset-0 cyber-grid opacity-20" />
                            <Activity className="w-12 h-12 md:w-20 md:h-20 text-primary opacity-20 animate-pulse scale-150" />
                            <div className="absolute inset-0 flex flex-col items-center justify-center">
                                <Shield className="w-10 h-10 md:w-16 md:h-16 text-primary mb-4 drop-shadow-[0_0_15px_rgba(255,176,0,0.5)]" />
                                <span className="text-[10px] md:text-xs font-mono text-primary/80 tracking-[0.5em] uppercase">Sector Locked</span>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Features Section */}
            <section id="features" className="py-20 md:py-32 px-6 md:px-8 border-y border-white/5 bg-black/40">
                <div className="max-w-7xl mx-auto">
                    <div className="text-left mb-12 md:mb-20 border-l-4 border-primary pl-6 md:pl-8">
                        <h2 className="text-xs md:text-sm font-bold uppercase tracking-[0.5em] text-primary/70 mb-2">Capabilities</h2>
                        <h3 className="text-3xl md:text-5xl font-black uppercase tracking-tighter">Hardened Infrastructure</h3>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
                        <FeatureCard
                            icon={<Zap className="w-6 h-6 md:w-8 md:h-8" />}
                            title="Instant Deriv"
                            desc="PBKDF2/Argon2id key derivation protocols implemented at the edge for maximum security and performance."
                            tag="AUTH_V2"
                        />
                        <FeatureCard
                            icon={<Globe className="w-6 h-6 md:w-8 md:h-8" />}
                            title="Zero-Knowledge"
                            desc="We never see your password. We never see your data. Even our databases are encrypted at rest with keys only you hold."
                            tag="PRIV_X1"
                        />
                        <FeatureCard
                            icon={<Cpu className="w-6 h-6 md:w-8 md:h-8" />}
                            title="Edge Crypto"
                            desc="AES-256-GCM encryption handled entirely within your browser environment. Your keys never touch our servers."
                            tag="CRYPT_A1"
                        />
                        <FeatureCard
                            icon={<Server className="w-6 h-6 md:w-8 md:h-8" />}
                            title="Encrypted Sync"
                            desc="Synchronize across multiple devices without ever exposing plaintext data. Multi-node verification included."
                            tag="SYNC_S2"
                        />
                        <FeatureCard
                            icon={<Terminal className="w-6 h-6 md:w-8 md:h-8" />}
                            title="Audit Ready"
                            desc="Transparent cryptographic proof for every operation. Permanent immutable logs for identity verification."
                            tag="LOG_V4"
                        />
                        <FeatureCard
                            icon={<Activity className="w-6 h-6 md:w-8 md:h-8" />}
                            title="Panic Lock"
                            desc="Emergency protocol triggered by system variance. Instantly wipes session keys and locks the vault node."
                            tag="SAFE_H1"
                        />
                    </div>
                </div>
            </section>

            {/* Tech Specs */}
            <section id="tech" className="py-20 md:py-32 px-6 md:px-8 relative overflow-hidden">
                <div className="absolute right-0 top-0 w-1/2 h-full bg-primary/2 rounded-full blur-[100px] md:blur-[150px] -z-10" />
                <div className="max-w-7xl mx-auto">
                    <div className="flex flex-col lg:flex-row items-start lg:items-center gap-12 md:gap-20">
                        <div className="lg:w-1/2">
                            <h2 className="text-xs font-bold uppercase tracking-[0.5em] text-primary/70 mb-6 flex items-center">
                                <Terminal className="w-4 h-4 mr-3" /> Technical Specifications
                            </h2>
                            <h3 className="text-3xl md:text-5xl font-black uppercase tracking-tighter mb-10 leading-none">
                                Cryptographic <br /> Integrity
                            </h3>
                            <div className="space-y-6 md:space-y-8">
                                <TechRow label="Cipher Suite" value="AES-256-GCM" />
                                <TechRow label="Key Stretch" value="PBKDF2 / Argon2id" />
                                <TechRow label="Hashing" value="SHA-512 / Blake3" />
                                <TechRow label="Verification" value="HMAC-SHA256" />
                            </div>
                        </div>
                        <div className="lg:w-1/2 grid grid-cols-2 gap-3 md:gap-4 w-full">
                            <div className="p-6 md:p-8 border border-white/5 bg-white/2 rounded-sm text-center">
                                <div className="text-3xl md:text-4xl font-black text-primary mb-2">99.9%</div>
                                <div className="text-[8px] md:text-[10px] uppercase tracking-widest text-muted-foreground">Uptime Reliancy</div>
                            </div>
                            <div className="p-6 md:p-8 border border-white/5 bg-white/2 rounded-sm text-center">
                                <div className="text-3xl md:text-4xl font-black text-primary mb-2">0</div>
                                <div className="text-[8px] md:text-[10px] uppercase tracking-widest text-muted-foreground">Data Breaches</div>
                            </div>
                            <div className="p-6 md:p-8 border border-white/5 bg-white/2 rounded-sm text-center">
                                <div className="text-3xl md:text-4xl font-black text-primary mb-2">10ms</div>
                                <div className="text-[8px] md:text-[10px] uppercase tracking-widest text-muted-foreground">Latancy Peak</div>
                            </div>
                            <div className="p-6 md:p-8 border border-white/5 bg-white/2 rounded-sm text-center">
                                <div className="text-3xl md:text-4xl font-black text-primary mb-2">∞</div>
                                <div className="text-[8px] md:text-[10px] uppercase tracking-widest text-muted-foreground">Node Scalability</div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* CTA Footer */}
            <footer className="py-20 md:py-32 px-6 md:px-8 border-t border-white/5 bg-black">
                <div className="max-w-7xl mx-auto text-center">
                    <h2 className="text-3xl md:text-6xl font-black uppercase tracking-tighter mb-12">
                        Ready to secure <br /> your <span className="text-primary">Digital Identity?</span>
                    </h2>
                    <Button
                        size="lg"
                        className="bg-primary hover:bg-primary/80 text-black font-black uppercase tracking-[0.3em] rounded-sm px-10 md:px-16 h-16 md:h-20 shadow-[0_0_40px_rgba(255,176,0,0.2)] w-full sm:w-auto"
                        onClick={() => navigate('/auth')}
                    >
                        Initialize Onboarding
                    </Button>
                    <div className="mt-20 flex flex-col md:flex-row items-center justify-center gap-8 pt-10 border-t border-white/5 opacity-40">
                        <div className="text-[10px] font-bold uppercase tracking-[0.3em]">© 2026 VALUTX // ALL RIGHTS RESERVED</div>
                    </div>
                </div>
            </footer>
        </div>
    );
}

function FeatureCard({ icon, title, desc, tag }: any) {
    return (
        <div className="p-10 border border-white/5 bg-white/5 hover:bg-primary/5 hover:border-primary/30 transition-all rounded-sm relative group">
            <div className="absolute top-4 right-4 text-[8px] font-mono font-bold text-primary/40 group-hover:text-primary/70 transition-colors uppercase tracking-[0.2em]">#{tag}</div>
            <div className="bg-primary/10 p-4 rounded-sm w-fit mb-8 ring-1 ring-primary/20 group-hover:shadow-[0_0_20px_rgba(255,176,0,0.15)] transition-all">
                <div className="text-primary">{icon}</div>
            </div>
            <h4 className="text-2xl font-black uppercase tracking-tighter mb-4 text-white group-hover:text-primary transition-colors">{title}</h4>
            <p className="text-muted-foreground text-sm leading-relaxed uppercase tracking-wider opacity-70 group-hover:opacity-100 transition-opacity">
                {desc}
            </p>
        </div>
    )
}

function TechRow({ label, value }: { label: string, value: string }) {
    return (
        <div className="flex items-center justify-between border-b border-white/5 pb-4">
            <span className="text-xs font-bold uppercase tracking-[0.4em] text-muted-foreground">{label}</span>
            <span className="font-mono text-sm text-primary uppercase tracking-widest">{value}</span>
        </div>
    )
}
