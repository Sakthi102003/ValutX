import { useNavigate, Link } from 'react-router-dom';
import { Button } from '../components/ui/Button';
import { Shield, Lock, Zap, Cpu, Globe, Server, ArrowRight, Activity, Terminal } from 'lucide-react';

export default function Home() {
    const navigate = useNavigate();

    return (
        <div className="min-h-screen bg-background text-foreground selection:bg-primary/30 selection:text-primary relative overflow-hidden font-sans">
            {/* Scanline Overlay */}
            <div className="pointer-events-none absolute inset-0 z-50 bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.1)_50%),linear-gradient(90deg,rgba(255,0,0,0.03),rgba(0,255,0,0.01),rgba(0,0,255,0.03))] bg-[length:100%_4px,100%_100%] opacity-20" />

            {/* Grid Background */}
            <div className="absolute inset-0 cyber-grid opacity-20 pointer-events-none" />

            {/* Glowing Orbs */}
            <div className="absolute top-[-10%] left-[-10%] w-[600px] h-[600px] bg-primary/10 rounded-full blur-[120px] animate-pulse-slow" />
            <div className="absolute bottom-[0%] right-[-10%] w-[500px] h-[500px] bg-primary/5 rounded-full blur-[100px]" />

            {/* Navigation Header */}
            <header className="fixed top-0 w-full z-40 border-b border-white/5 bg-black/60 backdrop-blur-xl">
                <div className="max-w-7xl mx-auto px-8 h-20 flex items-center justify-between">
                    <Link to="/" className="flex items-center space-x-3 group cursor-pointer">
                        <div className="bg-primary/20 p-2 rounded-sm ring-1 ring-primary/40 group-hover:bg-primary/30 transition-all shadow-[0_0_15px_rgba(255,176,0,0.2)]">
                            <Lock className="w-5 h-5 text-primary" />
                        </div>
                        <span className="font-bold text-2xl tracking-[0.2em] uppercase text-primary text-glow-amber">ValutX</span>
                    </Link>
                    <nav className="hidden md:flex items-center space-x-10">
                        <a href="#features" className="text-[10px] font-bold uppercase tracking-[0.3em] text-muted-foreground hover:text-primary transition-colors">Infrastructure</a>
                        <a href="#tech" className="text-[10px] font-bold uppercase tracking-[0.3em] text-muted-foreground hover:text-primary transition-colors">Encryption</a>
                        <a href="#security" className="text-[10px] font-bold uppercase tracking-[0.3em] text-muted-foreground hover:text-primary transition-colors">Protocol</a>
                        <Button
                            variant="ghost"
                            className="text-[10px] font-bold uppercase tracking-[0.3em] border border-primary/20 hover:border-primary/50 text-white rounded-sm px-6"
                            onClick={() => navigate('/auth')}
                        >
                            Authorize
                        </Button>
                    </nav>
                </div>
            </header>

            {/* Hero Section */}
            <section className="pt-48 pb-32 px-8 relative">
                <div className="max-w-7xl mx-auto text-center relative z-10">
                    <div className="inline-flex items-center space-x-2 px-4 py-2 bg-primary/5 border border-primary/20 rounded-sm mb-12 animate-in fade-in slide-in-from-bottom-4 duration-700">
                        <div className="w-2 h-2 rounded-full bg-primary animate-flicker shadow-[0_0_10px_rgba(255,176,0,0.8)]" />
                        <span className="text-[10px] font-black uppercase tracking-[0.4em] text-primary">System Online // Version 1.0.4-Stable</span>
                    </div>
                    <h1 className="text-6xl md:text-8xl font-black uppercase tracking-tighter mb-8 leading-tight animate-in fade-in slide-in-from-bottom-8 duration-700 delay-100">
                        The ultimate <br />
                        <span className="text-primary text-glow-amber">Zero-Knowledge</span> vault
                    </h1>
                    <p className="max-w-2xl mx-auto text-muted-foreground text-sm uppercase tracking-widest leading-loose mb-12 animate-in fade-in slide-in-from-bottom-12 duration-700 delay-200">
                        Military-grade encryption meets unbreakable anonymity.
                        Your data is encrypted locally before it ever reaches the cloud.
                        No one—not even us—can ever access your vault.
                    </p>
                    <div className="flex flex-col sm:flex-row items-center justify-center gap-6 animate-in fade-in slide-in-from-bottom-16 duration-700 delay-300">
                        <Button
                            size="lg"
                            className="bg-primary hover:bg-primary/80 text-black font-black uppercase tracking-[0.3em] rounded-sm px-10 h-16 shadow-[0_0_30px_rgba(255,176,0,0.3)] transition-all transform hover:scale-105"
                            onClick={() => navigate('/auth')}
                        >
                            Initialize Sector <ArrowRight className="ml-3 w-5 h-5" />
                        </Button>
                        <Button
                            variant="outline"
                            size="lg"
                            className="border-white/10 hover:bg-white/5 text-white font-black uppercase tracking-[0.3em] rounded-sm px-10 h-16"
                        >
                            View Protocols
                        </Button>
                    </div>
                </div>

                {/* Dashboard Preview / Aesthetic element */}
                <div className="mt-32 max-w-6xl mx-auto relative animate-in fade-in zoom-in-95 duration-1000 delay-500">
                    <div className="absolute inset-0 bg-primary/10 blur-[120px] -z-10" />
                    <div className="border border-primary/30 rounded-sm bg-black/80 backdrop-blur-xl p-2 shadow-2xl relative">
                        {/* Mock Dashboard Top Bar */}
                        <div className="flex items-center justify-between px-4 py-2 border-b border-primary/20 bg-primary/5 mb-2">
                            <div className="flex space-x-2">
                                <div className="w-3 h-3 rounded-full bg-red-500/50" />
                                <div className="w-3 h-3 rounded-full bg-primary/50" />
                                <div className="w-3 h-3 rounded-full bg-green-500/50" />
                            </div>
                            <div className="text-[8px] font-mono text-primary animate-pulse tracking-widest uppercase">ENCRYPTED_LINE_ACTIVE // 256-BIT_GCM</div>
                        </div>
                        <div className="h-64 bg-black/40 flex items-center justify-center border border-primary/10 relative overflow-hidden group">
                            <div className="absolute inset-0 cyber-grid opacity-20" />
                            <Activity className="w-20 h-20 text-primary opacity-20 animate-pulse scale-150" />
                            <div className="absolute inset-0 flex flex-col items-center justify-center">
                                <Shield className="w-16 h-16 text-primary mb-4 drop-shadow-[0_0_15px_rgba(255,176,0,0.5)]" />
                                <span className="text-xs font-mono text-primary/80 tracking-[0.5em] uppercase">Sector Locked</span>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Features Section */}
            <section id="features" className="py-32 px-8 border-y border-white/5 bg-black/40">
                <div className="max-w-7xl mx-auto">
                    <div className="text-left mb-20 border-l-4 border-primary pl-8">
                        <h2 className="text-sm font-bold uppercase tracking-[0.5em] text-primary/70 mb-2">Capabilities</h2>
                        <h3 className="text-5xl font-black uppercase tracking-tighter">Hardened Infrastructure</h3>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        <FeatureCard
                            icon={<Zap className="w-8 h-8" />}
                            title="Instant Deriv"
                            desc="PBKDF2/Argon2id key derivation protocols implemented at the edge for maximum security and performance."
                            tag="AUTH_V2"
                        />
                        <FeatureCard
                            icon={<Globe className="w-8 h-8" />}
                            title="Zero-Knowledge"
                            desc="We never see your password. We never see your data. Even our databases are encrypted at rest with keys only you hold."
                            tag="PRIV_X1"
                        />
                        <FeatureCard
                            icon={<Cpu className="w-8 h-8" />}
                            title="Edge Crypto"
                            desc="AES-256-GCM encryption handled entirely within your browser environment. Your keys never touch our servers."
                            tag="CRYPT_A1"
                        />
                        <FeatureCard
                            icon={<Server className="w-8 h-8" />}
                            title="Encrypted Sync"
                            desc="Synchronize across multiple devices without ever exposing plaintext data. Multi-node verification included."
                            tag="SYNC_S2"
                        />
                        <FeatureCard
                            icon={<Terminal className="w-8 h-8" />}
                            title="Audit Ready"
                            desc="Transparent cryptographic proof for every operation. Permanent immutable logs for identity verification."
                            tag="LOG_V4"
                        />
                        <FeatureCard
                            icon={<Activity className="w-8 h-8" />}
                            title="Panic Lock"
                            desc="Emergency protocol triggered by system variance. Instantly wipes session keys and locks the vault node."
                            tag="SAFE_H1"
                        />
                    </div>
                </div>
            </section>

            {/* Tech Specs */}
            <section id="tech" className="py-32 px-8 relative overflow-hidden">
                <div className="absolute right-0 top-0 w-1/2 h-full bg-primary/2 rounded-full blur-[150px] -z-10" />
                <div className="max-w-7xl mx-auto">
                    <div className="flex flex-col lg:flex-row items-center gap-20">
                        <div className="lg:w-1/2">
                            <h2 className="text-xs font-bold uppercase tracking-[0.5em] text-primary/70 mb-6 flex items-center">
                                <Terminal className="w-4 h-4 mr-3" /> Technical Specifications
                            </h2>
                            <h3 className="text-5xl font-black uppercase tracking-tighter mb-10 leading-none">
                                Cryptographic <br /> Integrity
                            </h3>
                            <div className="space-y-8">
                                <TechRow label="Cipher Suite" value="AES-256-GCM" />
                                <TechRow label="Key Stretch" value="PBKDF2 / Argon2id" />
                                <TechRow label="Hashing" value="SHA-512 / Blake3" />
                                <TechRow label="Verification" value="HMAC-SHA256" />
                            </div>
                        </div>
                        <div className="lg:w-1/2 grid grid-cols-2 gap-4">
                            <div className="p-8 border border-white/5 bg-white/2 rounded-sm text-center">
                                <div className="text-4xl font-black text-primary mb-2">99.9%</div>
                                <div className="text-[10px] uppercase tracking-widest text-muted-foreground">Uptime Reliancy</div>
                            </div>
                            <div className="p-8 border border-white/5 bg-white/2 rounded-sm text-center">
                                <div className="text-4xl font-black text-primary mb-2">0</div>
                                <div className="text-[10px] uppercase tracking-widest text-muted-foreground">Data Breaches</div>
                            </div>
                            <div className="p-8 border border-white/5 bg-white/2 rounded-sm text-center">
                                <div className="text-4xl font-black text-primary mb-2">10ms</div>
                                <div className="text-[10px] uppercase tracking-widest text-muted-foreground">Latancy Peak</div>
                            </div>
                            <div className="p-8 border border-white/5 bg-white/2 rounded-sm text-center">
                                <div className="text-4xl font-black text-primary mb-2">∞</div>
                                <div className="text-[10px] uppercase tracking-widest text-muted-foreground">Node Scalability</div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* CTA Footer */}
            <footer className="py-32 px-8 border-t border-white/5 bg-black">
                <div className="max-w-7xl mx-auto text-center">
                    <h2 className="text-4xl md:text-6xl font-black uppercase tracking-tighter mb-12">
                        Ready to secure <br /> your <span className="text-primary">Digital Identity?</span>
                    </h2>
                    <Button
                        size="lg"
                        className="bg-primary hover:bg-primary/80 text-black font-black uppercase tracking-[0.3em] rounded-sm px-16 h-20 shadow-[0_0_40px_rgba(255,176,0,0.2)]"
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
