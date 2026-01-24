import { useState } from 'react';
import { useVaultStore } from '../store/vaultStore';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Card, CardHeader, CardTitle, CardContent } from '../components/ui/Card';
import { Loader2, ArrowRight } from 'lucide-react';

export default function UnlockPage() {
    const unlockVault = useVaultStore((state) => state.unlockVault);
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const handleUnlock = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        // Defer for UI update
        setTimeout(async () => {
            try {
                const success = await unlockVault(password);
                if (!success) {
                    setError("Incorrect password or corrupted data.");
                }
            } catch (err) {
                setError("Unlock failed unexpectedly.");
            } finally {
                setLoading(false);
            }
        }, 50);
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-background p-4 relative overflow-hidden selection:bg-primary/30 selection:text-primary">
            {/* Scanline Overlay */}
            <div className="pointer-events-none absolute inset-0 z-50 bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.1)_50%),linear-gradient(90deg,rgba(255,0,0,0.03),rgba(0,255,0,0.01),rgba(0,0,255,0.03))] bg-[length:100%_4px,100%_100%] opacity-20" />

            {/* Grid Background */}
            <div className="absolute inset-0 cyber-grid opacity-20 pointer-events-none" />

            {/* Background decoration */}
            <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-primary/5 rounded-full blur-[120px] animate-pulse-slow" />
            </div>

            <Card className="w-full max-w-sm border-primary/20 bg-black/60 backdrop-blur-xl shadow-[0_0_50px_rgba(0,0,0,0.8)] rounded-sm relative z-10 overflow-hidden">
                {/* Corner Accents */}
                <div className="absolute -top-[1px] -left-[1px] w-6 h-6 border-t-2 border-l-2 border-primary/40" />
                <div className="absolute -bottom-[1px] -right-[1px] w-6 h-6 border-b-2 border-r-2 border-primary/40" />

                <CardHeader className="text-center pb-6 pt-10">
                    <div className="mx-auto bg-primary/10 p-4 rounded-sm w-fit mb-6 ring-1 ring-primary/30 shadow-[0_0_20px_rgba(255,176,0,0.15)] relative group cursor-default">
                        <img src="/favicon.png" alt="ValutX" className="w-12 h-12 object-contain" />
                        <div className="absolute inset-0 bg-primary/20 blur-xl opacity-0 group-hover:opacity-100 transition-opacity" />
                    </div>
                    <CardTitle className="text-3xl font-black tracking-[0.2em] uppercase text-primary text-glow-amber">Vault Locked</CardTitle>
                    <div className="flex items-center justify-center gap-2 mt-4 px-3 py-1 bg-primary/5 border border-primary/10 rounded-sm w-fit mx-auto">
                        <div className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse" />
                        <span className="text-[9px] text-muted-foreground uppercase tracking-widest font-bold">Protocol: Secure_Lockdown</span>
                    </div>
                </CardHeader>
                <CardContent className="pb-10">
                    <form onSubmit={handleUnlock} className="space-y-6">
                        <div className="space-y-2">
                            <Input
                                id="password"
                                type="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                placeholder="ACCESS_CODE..."
                                className="bg-white/5 border-white/10 focus:border-primary/50 text-center text-xs h-12 tracking-[0.4em] rounded-sm font-mono placeholder:tracking-widest"
                                autoFocus
                            />
                        </div>
                        {error && (
                            <div className="p-2 bg-red-500/10 border-l-2 border-red-500 text-red-500 text-[9px] font-bold uppercase tracking-widest text-center animate-pulse">
                                {`Error: ${error}`}
                            </div>
                        )}

                        <Button type="submit" className="w-full h-12 text-xs font-black uppercase tracking-[0.3em] bg-primary hover:bg-primary/80 text-black rounded-sm shadow-[0_0_20px_rgba(255,176,0,0.2)] transition-all active:scale-95" disabled={loading || !password}>
                            {loading ? <Loader2 className="w-4 h-4 animate-spin mr-3" /> : <ArrowRight className="w-4 h-4 mr-3" />}
                            <span>{loading ? "Decrypting Node..." : "Authorize Access"}</span>
                        </Button>
                    </form>

                    <div className="mt-4 text-center opacity-30">
                        <span className="text-[8px] font-mono text-muted-foreground uppercase tracking-[0.2em]">Zero-Knowledge Path Verified</span>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
