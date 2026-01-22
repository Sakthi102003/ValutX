import { useState } from 'react';
import { useVaultStore } from '../store/vaultStore';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Shield, Lock, ArrowRight, Loader2, AlertCircle } from 'lucide-react';

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
        <div className="min-h-screen flex items-center justify-center bg-background relative overflow-hidden">
            {/* Background Effects */}
            <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
                <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] bg-blue-600/10 rounded-full blur-[120px]" />
                <div className="absolute bottom-[-20%] right-[-10%] w-[50%] h-[50%] bg-purple-600/10 rounded-full blur-[120px]" />
            </div>

            <div className="w-full max-w-md p-8 bg-card/40 backdrop-blur-xl border border-white/10 rounded-2xl shadow-2xl relative z-10 animate-in fade-in zoom-in-95 duration-500">
                <div className="flex flex-col items-center mb-8">
                    <div className="bg-primary/20 p-4 rounded-2xl mb-4 ring-1 ring-primary/30 shadow-[0_0_15px_rgba(var(--primary),0.3)]">
                        <Shield className="w-8 h-8 text-primary" />
                    </div>
                    <h1 className="text-3xl font-bold tracking-tight text-center">ValutX</h1>
                    <p className="text-muted-foreground text-center mt-2">
                        {isLogin ? "Unlock your encrypted vault" : "Create your zero-knowledge vault"}
                    </p>
                </div>

                {error && (
                    <div className="mb-6 p-3 bg-red-500/15 border border-red-500/20 rounded-lg flex items-center gap-3 text-red-400 text-sm animate-in slide-in-from-top-2">
                        <AlertCircle className="w-4 h-4 shrink-0" />
                        <p>{error}</p>
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="space-y-1">
                        <label className="text-sm font-medium ml-1">Email</label>
                        <Input
                            type="email"
                            required
                            placeholder="name@example.com"
                            value={email}
                            onChange={e => setEmail(e.target.value)}
                            className="bg-secondary/30 border-white/5 focus:bg-background h-11"
                            disabled={isLoading}
                        />
                    </div>

                    <div className="space-y-1">
                        <label className="text-sm font-medium ml-1">Master Password</label>
                        <Input
                            type="password"
                            required
                            placeholder="••••••••••••••••"
                            value={password}
                            onChange={e => setPassword(e.target.value)}
                            className="bg-secondary/30 border-white/5 focus:bg-background h-11 font-mono"
                            disabled={isLoading}
                        />
                    </div>

                    {!isLogin && (
                        <div className="space-y-1">
                            <label className="text-sm font-medium ml-1">Confirm Password</label>
                            <Input
                                type="password"
                                required
                                placeholder="••••••••••••••••"
                                value={confirmPassword}
                                onChange={e => setConfirmPassword(e.target.value)}
                                className="bg-secondary/30 border-white/5 focus:bg-background h-11 font-mono"
                                disabled={isLoading}
                            />
                        </div>
                    )}

                    <Button className="w-full h-11 text-base font-semibold mt-4 shadow-lg shadow-primary/20" disabled={isLoading}>
                        {isLoading ? (
                            <>
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                {isLogin ? "Decrypting..." : "Generating Keys..."}
                            </>
                        ) : (
                            <>
                                {isLogin ? 'Unlock Vault' : 'Create Vault'}
                                <ArrowRight className="ml-2 w-4 h-4" />
                            </>
                        )}
                    </Button>
                </form>

                <div className="mt-8 text-center">
                    <button
                        onClick={() => { setError(null); setIsLogin(!isLogin); }}
                        className="text-sm text-muted-foreground hover:text-primary transition-colors hover:underline underline-offset-4"
                        disabled={isLoading}
                    >
                        {isLogin ? "First time? Create a new vault" : "Already have a vault? Log in"}
                    </button>
                </div>
            </div>

            <div className="absolute bottom-4 text-center w-full text-xs text-muted-foreground opacity-50">
                <p className="flex items-center justify-center gap-1">
                    <Lock className="w-3 h-3" /> End-to-End Encrypted. Zero-Knowledge Architecture.
                </p>
            </div>
        </div>
    );
}
