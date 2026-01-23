import { useState } from 'react';
import { useVaultStore } from '../store/vaultStore';
import { Button } from './ui/Button';
import { Input } from './ui/Input';
import { Label } from './ui/Label';
import { ShieldAlert, Fingerprint } from 'lucide-react';

interface Props {
    onSuccess: () => void;
    onCancel: () => void;
    title?: string;
}

export default function MasterPasswordVerify({ onSuccess, onCancel, title = "Confirm Security Protocol" }: Props) {
    const { verifyMasterPassword } = useVaultStore();
    const [password, setPassword] = useState('');
    const [error, setError] = useState(false);
    const [verifying, setVerifying] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setVerifying(true);
        setError(false);

        const ok = await verifyMasterPassword(password);
        if (ok) {
            onSuccess();
        } else {
            setError(true);
            setVerifying(false);
        }
    };

    return (
        <div className="absolute inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-md rounded-xl animate-in fade-in duration-200">
            <div className="w-full max-w-sm p-6 space-y-6 relative overflow-hidden">
                {/* Background Decor */}
                <div className="absolute top-0 right-0 w-16 h-16 border-t-2 border-r-2 border-primary/20" />

                <div className="flex flex-col items-center text-center space-y-2">
                    <div className="bg-primary/10 p-3 rounded-sm border border-primary/30 mb-2">
                        <Fingerprint className="w-8 h-8 text-primary animate-pulse" />
                    </div>
                    <h3 className="text-sm font-black uppercase tracking-[0.2em] text-white">{title}</h3>
                    <p className="text-[10px] uppercase tracking-wider text-muted-foreground">Verification required for sensitive data access</p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="space-y-2">
                        <Label className="text-[9px] font-bold uppercase tracking-widest text-primary/70 ml-1">Master Password</Label>
                        <Input
                            type="password"
                            autoFocus
                            value={password}
                            onChange={e => setPassword(e.target.value)}
                            placeholder="INPUT KEY..."
                            className="bg-white/5 border-white/10 focus:border-primary/50 text-xs font-mono tracking-widest h-10"
                            required
                        />
                    </div>

                    {error && (
                        <div className="flex items-center space-x-2 text-red-500 text-[9px] font-bold uppercase tracking-widest p-2 bg-red-400/10 border-l-2 border-red-500 animate-in slide-in-from-left-1">
                            <ShieldAlert className="w-3 h-3" />
                            <span>Authentication Failure</span>
                        </div>
                    )}

                    <div className="flex space-x-2 pt-2">
                        <Button
                            type="button"
                            variant="ghost"
                            className="flex-1 text-[9px] uppercase font-bold tracking-widest hover:bg-white/5"
                            onClick={onCancel}
                        >
                            Abstain
                        </Button>
                        <Button
                            type="submit"
                            disabled={verifying}
                            className="flex-1 bg-primary text-black text-[9px] font-black uppercase tracking-widest shadow-[0_0_15px_rgba(255,176,0,0.3)]"
                        >
                            {verifying ? "Validating..." : "Decrypt Sector"}
                        </Button>
                    </div>
                </form>
            </div>
        </div>
    );
}
