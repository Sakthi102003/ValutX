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
        <div className="absolute inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
            {/* Scanline Overlay */}
            <div className="pointer-events-none absolute inset-0 z-10 bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.1)_50%),linear-gradient(90deg,rgba(255,0,0,0.02),rgba(0,255,0,0.01),rgba(0,0,255,0.02))] bg-[length:100%_4px,100%_100%] opacity-10" />

            <div className="w-full max-w-sm p-8 space-y-6 relative overflow-hidden bg-black/40 border border-primary/20 rounded-sm shadow-[0_0_40px_rgba(0,0,0,0.6)] group">
                {/* Background Decor */}
                <div className="absolute top-0 right-0 w-12 h-1 border-t-2 border-primary shadow-[0_0_10px_rgba(255,176,0,0.3)]" />
                <div className="absolute top-0 right-0 w-1 h-12 border-r-2 border-primary shadow-[0_0_10px_rgba(255,176,0,0.3)]" />

                <div className="flex flex-col items-center text-center space-y-3 relative z-20">
                    <div className="bg-primary/10 p-4 rounded-sm border border-primary/30 mb-2 shadow-[0_0_20px_rgba(255,176,0,0.1)]">
                        <Fingerprint className="w-10 h-10 text-primary animate-pulse" />
                    </div>
                    <h3 className="text-xs font-black uppercase tracking-[0.3em] text-white underline decoration-primary/40 underline-offset-8 decoration-2">{title}</h3>
                    <p className="text-[10px] uppercase tracking-widest text-primary/40 font-bold pt-2">Security Hash Verification Required</p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6 relative z-20">
                    <div className="space-y-2">
                        <Label className="text-[9px] font-black uppercase tracking-[0.2em] text-primary/60 ml-1">Protocol Passphrase</Label>
                        <Input
                            type="password"
                            autoFocus
                            value={password}
                            onChange={e => setPassword(e.target.value)}
                            placeholder="INPUT_ENCRYPTION_KEY..."
                            className="bg-white/5 border-white/10 focus:border-primary/50 text-xs font-mono tracking-[0.2em] h-11 rounded-sm text-primary placeholder:opacity-20"
                            required
                        />
                    </div>

                    {error && (
                        <div className="flex items-center space-x-2 text-red-500 text-[9px] font-black uppercase tracking-widest p-3 bg-red-400/5 border border-red-500/20 rounded-sm animate-in shake-1">
                            <ShieldAlert className="w-4 h-4 shrink-0" />
                            <span>ACCESS_DENIED: INCORRECT HASH</span>
                        </div>
                    )}

                    <div className="flex space-x-3 pt-2">
                        <button
                            type="button"
                            className="flex-1 h-10 text-[10px] uppercase font-black tracking-widest text-primary/40 hover:text-primary transition-colors border border-transparent hover:border-white/10 rounded-sm"
                            onClick={onCancel}
                        >
                            Abort
                        </button>
                        <Button
                            type="submit"
                            disabled={verifying}
                            className="flex-1 bg-primary text-black h-10 text-[10px] font-black uppercase tracking-widest rounded-sm shadow-[0_0_25px_rgba(255,176,0,0.3)] hover:scale-[1.02] active:scale-95 transition-all"
                        >
                            {verifying ? "VERIFYING..." : "Decipher"}
                        </Button>
                    </div>
                </form>
            </div>
        </div>
    );
}
