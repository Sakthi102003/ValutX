import { useState } from 'react';
import { useVaultStore } from '../store/vaultStore';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Card, CardHeader, CardTitle, CardContent } from '../components/ui/Card';
import { Lock, Loader2, ArrowRight } from 'lucide-react';

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
        <div className="min-h-screen flex items-center justify-center bg-background p-4 relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-full overflow-hidden -z-10 opacity-10 pointer-events-none">
                <div className="absolute bottom-[0%] left-[20%] w-[60%] h-[60%] bg-primary/20 rounded-full blur-[150px]" />
            </div>

            <Card className="w-full max-w-sm border-white/5 bg-card/60 backdrop-blur-xl shadow-2xl">
                <CardHeader className="text-center pb-2">
                    <div className="mx-auto bg-secondary/50 p-4 rounded-full w-fit mb-4 ring-1 ring-white/10">
                        <Lock className="w-8 h-8 text-primary" />
                    </div>
                    <CardTitle className="text-xl font-medium tracking-wide">ValutX Locked</CardTitle>
                    <p className="text-xs text-muted-foreground uppercase tracking-widest mt-1">
                        Zero-Knowledge Encryption
                    </p>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleUnlock} className="space-y-4">
                        <div className="space-y-2">
                            <Input
                                id="password"
                                type="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                placeholder="Enter Master Password..."
                                className="bg-black/20 border-white/5 focus:border-primary/50 text-center text-lg h-12 tracking-widest placeholder:tracking-normal"
                                autoFocus
                            />
                        </div>
                        {error && <p className="text-sm text-destructive text-center">{error}</p>}

                        <Button type="submit" className="w-full h-12" disabled={loading || !password}>
                            {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <ArrowRight className="w-5 h-5" />}
                            <span className="ml-2">{loading ? "Decrypting..." : "Unlock Vault"}</span>
                        </Button>
                    </form>
                </CardContent>
            </Card>
        </div>
    );
}
