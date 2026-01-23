import { useState } from 'react';
import { useVaultStore } from '../store/vaultStore';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Label } from '../components/ui/Label';
import { Card, CardHeader, CardTitle, CardContent } from '../components/ui/Card';
import { ShieldCheck, Loader2 } from 'lucide-react';

export default function SetupPage() {
    const initializeVault = useVaultStore((state) => state.initializeVault);
    const [password, setPassword] = useState('');
    const [confirm, setConfirm] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const handleSetup = async (e: React.FormEvent) => {
        e.preventDefault();
        if (password.length < 8) {
            setError("Password must be at least 8 characters");
            return;
        }
        if (password !== confirm) {
            setError("Passwords do not match");
            return;
        }

        setLoading(true);
        // Add small delay to allow UI to render processing state if key derivation is slow
        setTimeout(async () => {
            try {
                await initializeVault(password);
            } catch (err) {
                setError("Failed to initialize vault");
            } finally {
                setLoading(false);
            }
        }, 100);
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-background p-4 relative overflow-hidden selection:bg-primary/30 selection:text-primary">
            {/* Scanline Overlay */}
            <div className="pointer-events-none absolute inset-0 z-50 bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.1)_50%),linear-gradient(90deg,rgba(255,0,0,0.03),rgba(0,255,0,0.01),rgba(0,0,255,0.03))] bg-[length:100%_4px,100%_100%] opacity-20" />

            {/* Grid Background */}
            <div className="absolute inset-0 cyber-grid opacity-20 pointer-events-none" />

            {/* Background decoration */}
            <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-primary/5 rounded-full blur-[150px] animate-pulse-slow" />
            </div>

            <Card className="w-full max-w-md border-primary/20 bg-black/60 backdrop-blur-xl shadow-[0_0_50px_rgba(0,0,0,0.8)] rounded-sm relative z-10 overflow-hidden">
                {/* Corner Accents */}
                <div className="absolute -top-[1px] -left-[1px] w-6 h-6 border-t-2 border-l-2 border-primary/40" />
                <div className="absolute -bottom-[1px] -right-[1px] w-6 h-6 border-b-2 border-r-2 border-primary/40" />

                <CardHeader className="text-center pt-10">
                    <div className="mx-auto bg-primary/10 p-5 rounded-sm w-fit mb-6 ring-1 ring-primary/30 shadow-[0_0_20px_rgba(255,176,0,0.15)] relative group">
                        <ShieldCheck className="w-12 h-12 text-primary animate-pulse" />
                        <div className="absolute inset-0 bg-primary/20 blur-xl opacity-0 group-hover:opacity-100 transition-opacity" />
                    </div>
                    <CardTitle className="text-3xl font-black tracking-[0.2em] uppercase text-primary text-glow-amber">Vault Init</CardTitle>
                    <div className="flex flex-col gap-4 mt-4">
                        <div className="text-[10px] uppercase tracking-widest text-muted-foreground leading-relaxed px-4">
                            ESTABLISHING AES-256-GCM KEY DERIVATION PARAMETERS.
                        </div>
                        <div className="bg-red-500/10 border-x border-red-500/50 py-2 px-3 mx-2">
                            <span className="text-red-500 text-[9px] font-black uppercase tracking-[0.15em]">Critical Warning: Non-Recoverable Architecture. Loss of Master Password results in Permanent Data Sector Loss.</span>
                        </div>
                    </div>
                </CardHeader>
                <CardContent className="pb-10">
                    <form onSubmit={handleSetup} className="space-y-6">
                        <div className="space-y-2">
                            <Label htmlFor="password" className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground ml-1">Establish Master Protocol</Label>
                            <Input
                                id="password"
                                type="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                placeholder="••••••••••••••••"
                                className="bg-white/5 border-white/10 focus:border-primary/50 h-12 rounded-sm font-mono text-xs tracking-[0.3em]"
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="confirm" className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground ml-1">Verify Master Protocol</Label>
                            <Input
                                id="confirm"
                                type="password"
                                value={confirm}
                                onChange={(e) => setConfirm(e.target.value)}
                                placeholder="••••••••••••••••"
                                className="bg-white/5 border-white/10 focus:border-primary/50 h-12 rounded-sm font-mono text-xs tracking-[0.3em]"
                            />
                        </div>
                        {error && (
                            <div className="p-2 bg-red-500/10 border-l-2 border-red-500 text-red-500 text-[10px] font-bold uppercase tracking-widest animate-pulse">
                                {`Error: ${error}`}
                            </div>
                        )}

                        <Button type="submit" className="w-full h-12 text-xs font-black uppercase tracking-[0.3em] mt-2 bg-primary hover:bg-primary/80 text-black rounded-sm shadow-[0_0_20px_rgba(255,176,0,0.2)]" disabled={loading || !password}>
                            {loading ? <Loader2 className="w-4 h-4 animate-spin mr-3" /> : null}
                            {loading ? "Generating Entropy..." : "Initialize Sector"}
                        </Button>
                    </form>
                </CardContent>
            </Card>
        </div>
    );
}
