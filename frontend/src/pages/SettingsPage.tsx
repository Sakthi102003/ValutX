import { useState } from 'react';
import { useVaultStore } from '../store/vaultStore';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Label } from '../components/ui/Label';
import { ShieldCheck, AlertTriangle } from 'lucide-react';

export default function SettingsPage() {
    const { changeMasterPassword, userEmail, isLoading, error, setError } = useVaultStore();
    const [oldPass, setOldPass] = useState('');
    const [newPass, setNewPass] = useState('');
    const [confirmPass, setConfirmPass] = useState('');
    const [successMsg, setSuccessMsg] = useState<string | null>(null);

    const handleChangePassword = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);
        setSuccessMsg(null);

        if (newPass !== confirmPass) {
            setError("New passwords do not match.");
            return;
        }

        if (newPass.length < 8) {
            setError("New password must be at least 8 characters.");
            return;
        }

        const success = await changeMasterPassword(oldPass, newPass);
        if (success) {
            setSuccessMsg("Master Password updated successfully!");
            setOldPass('');
            setNewPass('');
            setConfirmPass('');
        }
    };

    return (
        <div className="p-8 max-w-5xl mx-auto animate-in fade-in duration-500 relative">
            <div className="flex items-center justify-between mb-10 border-b border-white/5 pb-6">
                <div className="flex items-center">
                    <div className="bg-primary/10 p-2 rounded-sm ring-1 ring-primary/30 mr-4 shadow-[0_0_15px_rgba(255,176,0,0.1)]">
                        <ShieldCheck className="w-8 h-8 text-primary h-glow" />
                    </div>
                    <div>
                        <h2 className="text-3xl font-black uppercase tracking-tighter text-white">Security Config</h2>
                        <span className="text-[10px] uppercase tracking-[0.4em] text-primary/50 font-bold">Protocol Management Node</span>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Profile Info */}
                <div className="bg-black/40 backdrop-blur-sm border border-white/10 rounded-sm p-8 relative overflow-hidden group">
                    <div className="absolute top-0 left-0 w-1 h-full bg-primary/20 group-hover:bg-primary/50 transition-colors" />
                    <h3 className="text-xs font-black uppercase tracking-[0.2em] mb-8 text-primary/70">Account Identifier</h3>
                    <div className="space-y-6">
                        <div className="space-y-2">
                            <Label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground ml-1">Assigned Identity</Label>
                            <div className="p-4 bg-white/5 rounded-sm border border-white/5 font-mono text-xs uppercase tracking-widest text-primary/90">
                                {userEmail}
                            </div>
                        </div>
                        <div className="p-4 bg-amber-500/5 border border-amber-500/20 rounded-sm flex items-start space-x-4 text-amber-200/60 text-[10px] leading-relaxed uppercase tracking-wider">
                            <AlertTriangle className="w-5 h-5 shrink-0 text-amber-500 animate-pulse" />
                            <p>
                                CRITICAL: MASTER PROTOCOL (PASSWORD) IS THE SOLE ENCRYPTION KEY. ZERO-RECOVERY ARCHITECTURE IN EFFECT.
                            </p>
                        </div>
                    </div>
                </div>

                {/* Change Password */}
                <div className="bg-black/60 backdrop-blur-md border border-primary/20 rounded-sm p-8 shadow-2xl relative">
                    <div className="absolute top-0 right-0 w-8 h-8 border-t-2 border-r-2 border-primary/30" />
                    <h3 className="text-xs font-black uppercase tracking-[0.2em] mb-8 text-white">Re-Initialize Protocol</h3>

                    <form onSubmit={handleChangePassword} className="space-y-5">
                        <div className="space-y-2">
                            <Label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground ml-1">Current Protocol</Label>
                            <Input
                                type="password"
                                value={oldPass}
                                onChange={e => setOldPass(e.target.value)}
                                placeholder="VALIDATE CURRENT..."
                                className="bg-white/5 border-white/10 focus:border-primary/50 h-10 rounded-sm font-mono text-xs tracking-widest"
                                required
                            />
                        </div>
                        <div className="space-y-2">
                            <Label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground ml-1">New Protocol</Label>
                            <Input
                                type="password"
                                value={newPass}
                                onChange={e => setNewPass(e.target.value)}
                                placeholder="ESTABLISH NEW..."
                                className="bg-white/5 border-white/10 focus:border-primary/50 h-10 rounded-sm font-mono text-xs tracking-widest"
                                required
                            />
                        </div>
                        <div className="space-y-2">
                            <Label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground ml-1">Confirm New Protocol</Label>
                            <Input
                                type="password"
                                value={confirmPass}
                                onChange={e => setConfirmPass(e.target.value)}
                                placeholder="VERIFY NEW..."
                                className="bg-white/5 border-white/10 focus:border-primary/50 h-10 rounded-sm font-mono text-xs tracking-widest"
                                required
                            />
                        </div>

                        {error && <div className="text-red-500 text-[9px] font-bold uppercase tracking-widest p-2 bg-red-400/10 border-l-2 border-red-500">{`Error: ${error}`}</div>}
                        {successMsg && <div className="text-green-500 text-[9px] font-bold uppercase tracking-widest p-2 bg-green-400/10 border-l-2 border-green-500">{successMsg}</div>}

                        <Button type="submit" className="w-full h-11 text-[10px] font-black uppercase tracking-[0.2em] bg-primary hover:bg-primary/80 text-black rounded-sm shadow-[0_0_20px_rgba(255,176,0,0.1)] mt-4" disabled={isLoading}>
                            {isLoading ? "Encrypting Sector..." : "Rotate Protocol Keys"}
                        </Button>
                    </form>
                </div>
            </div>
        </div>
    );
}
