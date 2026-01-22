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
        <div className="min-h-screen flex items-center justify-center bg-background p-4 relative overflow-hidden">
            {/* Background decoration */}
            <div className="absolute top-0 left-0 w-full h-full overflow-hidden -z-10 opacity-20 pointer-events-none">
                <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] bg-primary/30 rounded-full blur-[120px]" />
                <div className="absolute bottom-[-20%] right-[-10%] w-[50%] h-[50%] bg-primary/20 rounded-full blur-[120px]" />
            </div>

            <Card className="w-full max-w-md border-primary/20 bg-card/50 backdrop-blur-md shadow-2xl">
                <CardHeader className="text-center">
                    <div className="mx-auto bg-primary/10 p-4 rounded-full w-fit mb-4 ring-1 ring-primary/20">
                        <ShieldCheck className="w-12 h-12 text-primary" />
                    </div>
                    <CardTitle className="text-2xl font-bold tracking-tight">ValutX Setup</CardTitle>
                    <p className="text-muted-foreground mt-2">
                        Create a master password to encrypt your vault using AES-256-GCM.
                        <br /><span className="text-destructive/80 text-xs font-semibold uppercase tracking-wider mt-2 block">Warning: If you lose this password, your data is unrecoverable.</span>
                    </p>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleSetup} className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="password">Master Password</Label>
                            <Input
                                id="password"
                                type="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                placeholder="••••••••"
                                className="bg-background/50 border-white/10 focus:border-primary/50"
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="confirm">Confirm Password</Label>
                            <Input
                                id="confirm"
                                type="password"
                                value={confirm}
                                onChange={(e) => setConfirm(e.target.value)}
                                placeholder="••••••••"
                                className="bg-background/50 border-white/10 focus:border-primary/50"
                            />
                        </div>
                        {error && <p className="text-sm text-destructive font-medium animate-pulse">{error}</p>}

                        <Button type="submit" className="w-full font-bold" disabled={loading || !password} size="lg">
                            {loading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
                            {loading ? "Generating Encryption Keys..." : "Initialize Vault"}
                        </Button>
                    </form>
                </CardContent>
            </Card>
        </div>
    );
}
