import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useVaultStore } from '../store/vaultStore';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Shield, ArrowRight, Loader2, AlertCircle, ChevronLeft } from 'lucide-react';

export default function AuthPage() {
    const { login, signup, isLoading, error, setError } = useVaultStore();
    const [isLogin, setIsLogin] = useState(true);
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);

        if (!isLogin && password !== confirmPassword) {
            setError("Passwords do not match");
            return;
        }

        if (password.length < 8) {
            setError("Password must be at least 8 characters");
            return;
        }

        if (isLogin) {
            await login(email, password);
        } else {
            await signup(email, password);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-background relative overflow-hidden selection:bg-primary/30 selection:text-primary">
            {/* Scanline Overlay */}
            <div className="pointer-events-none absolute inset-0 z-50 bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.1)_50%),linear-gradient(90deg,rgba(255,0,0,0.03),rgba(0,255,0,0.01),rgba(0,0,255,0.03))] bg-[length:100%_4px,100%_100%] opacity-20" />

            {/* Grid Background */}
            <div className="absolute inset-0 cyber-grid opacity-20 pointer-events-none" />

            {/* Back to Home Link */}
            <div className="absolute top-4 left-4 md:top-8 md:left-8 z-20">
                <Link to="/" className="flex items-center space-x-2 text-[8px] md:text-[10px] font-bold uppercase tracking-[0.3em] text-primary/60 hover:text-primary transition-all group">
                    <ChevronLeft className="w-4 h-4 transition-transform group-hover:-translate-x-1" />
                    <span>Return to System Core</span>
                </Link>
            </div>

            {/* Background Glows */}
            <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[300px] md:w-[800px] h-[300px] md:h-[800px] bg-primary/5 rounded-full blur-[80px] md:blur-[150px] animate-pulse-slow" />
            </div>

            <div className="w-[calc(100%-2rem)] max-w-md p-6 md:p-10 bg-black/60 backdrop-blur-xl border border-primary/20 rounded-sm shadow-[0_0_50px_rgba(0,0,0,0.8)] relative z-10 animate-in fade-in zoom-in-95 duration-500">
                {/* Corner Accents */}
                <div className="absolute -top-[1px] -left-[1px] w-6 md:w-8 h-6 md:h-8 border-t-2 border-l-2 border-primary/40" />
                <div className="absolute -bottom-[1px] -right-[1px] w-6 md:w-8 h-6 md:h-8 border-b-2 border-r-2 border-primary/40" />

                <div className="flex flex-col items-center mb-10">
                    <div className="bg-primary/10 p-4 rounded-sm mb-6 ring-1 ring-primary/30 shadow-[0_0_20px_rgba(255,176,0,0.15)] relative group cursor-default">
                        <Shield className="w-10 h-10 text-primary animate-pulse" />
                        <div className="absolute inset-0 bg-primary/20 blur-xl opacity-0 group-hover:opacity-100 transition-opacity" />
                    </div>
                    <h1 className="text-4xl font-black tracking-[0.3em] uppercase text-primary text-glow-amber">ValutX</h1>
                    <div className="flex items-center gap-2 mt-4 px-3 py-1 bg-primary/5 border border-primary/10 rounded-sm">
                        <div className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
                        <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground">
                            {isLogin ? "System: Authorization Required" : "System: Vault Initialization"}
                        </p>
                    </div>
                </div>

                {error && (
                    <div className="mb-8 p-3 bg-red-500/10 border-l-2 border-red-500 flex items-center gap-3 text-red-500 text-[10px] font-bold uppercase tracking-wider animate-in slide-in-from-top-2">
                        <AlertCircle className="w-4 h-4 shrink-0" />
                        <p>{error}</p>
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="space-y-2">
                        <label className="text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground ml-1">Identity Identifier (Email)</label>
                        <Input
                            type="email"
                            required
                            placeholder="USER@VAULTX.SECURE"
                            value={email}
                            onChange={e => setEmail(e.target.value)}
                            className="bg-white/5 border-white/10 focus:border-primary/50 h-12 rounded-sm font-mono text-xs uppercase tracking-widest placeholder:opacity-30"
                            disabled={isLoading}
                        />
                    </div>

                    <div className="space-y-2">
                        <label className="text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground ml-1">Access Protocol (Master Password)</label>
                        <Input
                            type="password"
                            required
                            placeholder="••••••••••••••••"
                            value={password}
                            onChange={e => setPassword(e.target.value)}
                            className="bg-white/5 border-white/10 focus:border-primary/50 h-12 rounded-sm font-mono text-xs tracking-[0.3em]"
                            disabled={isLoading}
                        />
                    </div>

                    {!isLogin && (
                        <div className="space-y-2">
                            <label className="text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground ml-1">Verify Protocol</label>
                            <Input
                                type="password"
                                required
                                placeholder="••••••••••••••••"
                                value={confirmPassword}
                                onChange={e => setConfirmPassword(e.target.value)}
                                className="bg-white/5 border-white/10 focus:border-primary/50 h-12 rounded-sm font-mono text-xs tracking-[0.3em]"
                                disabled={isLoading}
                            />
                        </div>
                    )}

                    <Button className="w-full h-12 text-xs font-black uppercase tracking-[0.3em] mt-6 bg-primary hover:bg-primary/80 text-black rounded-sm shadow-[0_0_20px_rgba(255,176,0,0.2)] transition-all active:scale-95" disabled={isLoading}>
                        {isLoading ? (
                            <>
                                <Loader2 className="mr-3 h-4 w-4 animate-spin" />
                                {isLogin ? "Decrypting Node..." : "Generating Entropy..."}
                            </>
                        ) : (
                            <>
                                {isLogin ? 'Authorize Entry' : 'Initialize Vault'}
                                <ArrowRight className="ml-3 w-4 h-4" />
                            </>
                        )}
                    </Button>
                </form>

                <div className="mt-10 text-center">
                    <button
                        onClick={() => { setError(null); setIsLogin(!isLogin); }}
                        className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground hover:text-primary transition-colors hover:underline underline-offset-8"
                        disabled={isLoading}
                    >
                        {isLogin ? "[ Request New Node Access ]" : "[ Return to Authorization ]"}
                    </button>
                </div>
            </div>

            <div className="absolute bottom-8 w-full text-center">
                <div className="inline-flex items-center gap-6 px-6 py-2 bg-black/40 border border-white/5 rounded-full backdrop-blur-md opacity-40 hover:opacity-100 transition-opacity cursor-default lg:scale-100 scale-75">
                    <span className="flex items-center gap-2 text-[8px] font-bold uppercase tracking-widest">
                        <img src="/favicon.png" alt="Lock" className="w-3 h-3 object-contain" /> Zero-Knowledge Verified
                    </span>
                    <div className="w-[1px] h-3 bg-white/20" />
                    <span className="flex items-center gap-2 text-[8px] font-bold uppercase tracking-widest">
                        <Shield className="w-3 h-3 text-primary" /> Client-Side Encryption
                    </span>
                    <div className="w-[1px] h-3 bg-white/20" />
                    <span className="flex items-center gap-2 text-[8px] font-bold uppercase tracking-widest">
                        <div className="w-1.5 h-1.5 rounded-full bg-primary animate-flicker" /> Node Active
                    </span>
                </div>
            </div>
        </div>
    );
}
