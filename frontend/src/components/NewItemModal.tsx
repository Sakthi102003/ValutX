import { useState, useEffect } from 'react';
import type { VaultItemType, DecryptedVaultItem } from '../store/vaultStore';
import { Button } from './ui/Button';
import { Input } from './ui/Input';
import { Label } from './ui/Label';
import { X } from 'lucide-react';
import { cn } from '../lib/utils';

interface Props {
    isOpen: boolean;
    onClose: () => void;
    onSave: (type: VaultItemType, data: any, id?: string) => void;
    initialData?: DecryptedVaultItem | null;
}

const calculateDynamicEntropy = (pass: string) => {
    if (!pass) return { bits: 0, label: 'Empty', color: 'bg-transparent', score: 0 };
    let pool = 0;
    if (/[a-z]/.test(pass)) pool += 26;
    if (/[A-Z]/.test(pass)) pool += 26;
    if (/[0-9]/.test(pass)) pool += 10;
    if (/[^a-zA-Z0-9]/.test(pass)) pool += 32;
    const bits = Math.floor(pass.length * Math.log2(Math.max(pool, 1)));

    let label = 'Very Weak';
    let color = 'bg-red-500';
    if (bits > 128) { label = 'Quantum Resistant'; color = 'bg-cyan-500'; }
    else if (bits > 80) { label = 'Tactical Grade'; color = 'bg-green-500'; }
    else if (bits > 60) { label = 'Secure'; color = 'bg-blue-500'; }
    else if (bits > 40) { label = 'Standard'; color = 'bg-yellow-500'; }
    else if (bits > 20) { label = 'Vulnerable'; color = 'bg-orange-500'; }

    return { bits, label, color };
};

export default function NewItemModal({ isOpen, onClose, onSave, initialData }: Props) {
    const [type, setType] = useState<VaultItemType>('login');
    const [formData, setFormData] = useState<any>({});

    useEffect(() => {
        if (isOpen) {
            if (initialData) {
                setType(initialData.type);
                setFormData(initialData.data);
            } else {
                setFormData({});
                setType('login');
            }
        }
    }, [isOpen, initialData]);

    if (!isOpen) return null;

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSave(type, { ...formData, name: formData.name || "Untitled" }, initialData?.id);
        setFormData({});
        onClose();
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4 animate-in fade-in duration-300 overflow-y-auto">
            {/* Scanline Overlay */}
            <div className="pointer-events-none absolute inset-0 z-10 bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.1)_50%),linear-gradient(90deg,rgba(255,0,0,0.02),rgba(0,255,0,0.01),rgba(0,0,255,0.02))] bg-[length:100%_4px,100%_100%] opacity-20" />

            <div className="bg-black/90 w-full max-w-lg border border-primary/20 rounded-sm shadow-[0_0_50px_rgba(0,0,0,0.8)] p-6 md:p-8 relative animate-in zoom-in-95 duration-200 overflow-hidden group my-auto">
                {/* Edge Accents */}
                <div className="absolute top-0 left-0 w-12 md:w-16 h-1 border-t-2 border-primary shadow-[0_0_10px_rgba(255,176,0,0.5)]" />
                <div className="absolute top-0 left-0 w-1 h-12 md:w-16 border-l-2 border-primary shadow-[0_0_10px_rgba(255,176,0,0.5)]" />
                <div className="absolute bottom-0 right-0 w-12 md:w-16 h-1 border-b-2 border-primary shadow-[0_0_10px_rgba(255,176,0,0.5)]" />
                <div className="absolute bottom-0 right-0 w-1 h-12 md:w-16 border-r-2 border-primary shadow-[0_0_10px_rgba(255,176,0,0.5)]" />

                <button onClick={onClose} className="absolute right-4 top-4 md:right-6 md:top-6 text-primary/40 hover:text-primary transition-colors z-50 p-2">
                    <X className="w-6 h-6" />
                </button>

                <div className="mb-6 md:mb-8 relative z-20">
                    <h2 className="text-[10px] md:text-sm font-black uppercase tracking-[0.4em] text-primary/70 mb-1">Sector Initialization</h2>
                    <h1 className="text-2xl md:text-3xl font-black uppercase tracking-tighter text-white">
                        {initialData ? 'Update Record' : 'Forge New Entry'}
                    </h1>
                </div>

                <div className="flex flex-wrap gap-2 mb-6 md:mb-8 p-1 bg-white/5 border border-white/10 rounded-sm w-fit relative z-20">
                    {(['login', 'card', 'id', 'note'] as VaultItemType[]).map(t => (
                        <button
                            key={t}
                            type="button"
                            onClick={() => setType(t)}
                            className={cn(
                                "px-3 md:px-4 py-1.5 text-[10px] font-black uppercase tracking-widest transition-all rounded-sm",
                                type === t
                                    ? "bg-primary text-black shadow-[0_0_15px_rgba(255,176,0,0.3)]"
                                    : "text-primary/40 hover:text-primary/70 hover:bg-white/5"
                            )}
                        >
                            {t}
                        </button>
                    ))}
                </div>

                <form onSubmit={handleSubmit} className="space-y-6 relative z-20">
                    <div className="space-y-2">
                        <Label className="text-[10px] font-black uppercase tracking-widest text-primary/60 ml-1">Archive Identifier</Label>
                        <Input
                            value={formData.name || ''}
                            onChange={e => setFormData({ ...formData, name: e.target.value })}
                            placeholder="NAME_RECORD..."
                            className="bg-white/5 border-white/10 focus:border-primary/50 h-11 rounded-sm font-mono text-xs uppercase tracking-widest"
                            autoFocus
                            required
                        />
                    </div>

                    {type === 'login' && (
                        <>
                            <div className="space-y-2">
                                <Label className="text-[10px] font-black uppercase tracking-widest text-primary/60 ml-1">Identity Access</Label>
                                <Input
                                    value={formData.username || ''}
                                    onChange={e => setFormData({ ...formData, username: e.target.value })}
                                    placeholder="USERNAME / EMAIL..."
                                    className="bg-white/5 border-white/10 focus:border-primary/50 h-11 rounded-sm font-mono text-xs tracking-widest"
                                />
                            </div>
                            <div className="space-y-2">
                                <Label className="text-[10px] font-black uppercase tracking-widest text-primary/60 ml-1">Security Key</Label>
                                <div className="space-y-4">
                                    <Input
                                        type="text"
                                        value={formData.password || ''}
                                        onChange={e => setFormData({ ...formData, password: e.target.value })}
                                        className="bg-white/5 border-white/10 focus:border-primary/50 h-11 rounded-sm font-mono text-xs tracking-widest text-primary"
                                        placeholder="ESTABLISH_PASSPHRASE..."
                                    />
                                    {formData.password && (() => {
                                        const entropy = calculateDynamicEntropy(formData.password);
                                        return (
                                            <div className="p-3 bg-primary/5 border border-primary/10 rounded-sm animate-in fade-in slide-in-from-top-1">
                                                <div className="flex justify-between items-center px-1 mb-2">
                                                    <span className="text-[8px] font-black uppercase tracking-widest text-primary/60">Entropy Analysis</span>
                                                    <span className="text-[10px] font-mono text-primary font-bold">{entropy.bits} BITS</span>
                                                </div>
                                                <div className="h-1 w-full bg-white/5 rounded-full overflow-hidden">
                                                    <div
                                                        className={cn("h-full transition-all duration-500 ease-out", entropy.color)}
                                                        style={{ width: `${Math.min((entropy.bits / 128) * 100, 100)}%` }}
                                                    />
                                                </div>
                                                <p className="text-[9px] text-right font-black uppercase tracking-tighter mt-2 text-primary/80">
                                                    STATUS: <span className="text-white">{entropy.label}</span>
                                                </p>
                                            </div>
                                        );
                                    })()}
                                </div>
                            </div>
                            <div className="space-y-2">
                                <Label className="text-[10px] font-black uppercase tracking-widest text-primary/60 ml-1">Domain Link</Label>
                                <Input
                                    value={formData.website || ''}
                                    onChange={e => setFormData({ ...formData, website: e.target.value })}
                                    placeholder="HTTPS://TARGET_ORIGIN..."
                                    className="bg-white/5 border-white/10 focus:border-primary/50 h-11 rounded-sm font-mono text-xs tracking-widest"
                                />
                            </div>
                        </>
                    )}

                    {type === 'card' && (
                        <>
                            <div className="space-y-2">
                                <Label className="text-[10px] font-black uppercase tracking-widest text-primary/60 ml-1">Credit Sequence</Label>
                                <Input
                                    value={formData.number || ''}
                                    onChange={e => setFormData({ ...formData, number: e.target.value })}
                                    placeholder="#### #### #### ####"
                                    className="bg-white/5 border-white/10 focus:border-primary/50 h-11 rounded-sm font-mono text-xs tracking-widest"
                                />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label className="text-[10px] font-black uppercase tracking-widest text-primary/60 ml-1">Expiration</Label>
                                    <Input
                                        value={formData.expiry || ''}
                                        onChange={e => setFormData({ ...formData, expiry: e.target.value })}
                                        placeholder="MM/YY"
                                        className="bg-white/5 border-white/10 focus:border-primary/50 h-11 rounded-sm font-mono text-xs tracking-widest"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label className="text-[10px] font-black uppercase tracking-widest text-primary/60 ml-1">Validation Code</Label>
                                    <Input
                                        type="password"
                                        value={formData.cvv || ''}
                                        onChange={e => setFormData({ ...formData, cvv: e.target.value })}
                                        placeholder="###"
                                        className="bg-white/5 border-white/10 focus:border-primary/50 h-11 rounded-sm font-mono text-xs tracking-widest"
                                    />
                                </div>
                            </div>
                        </>
                    )}

                    {type === 'id' && (
                        <>
                            <div className="space-y-2">
                                <Label className="text-[10px] font-black uppercase tracking-widest text-primary/60 ml-1">Identification Serial</Label>
                                <Input
                                    value={formData.number || ''}
                                    onChange={e => setFormData({ ...formData, number: e.target.value })}
                                    placeholder="PASSPORT / LICENSE / SSN..."
                                    className="bg-white/5 border-white/10 focus:border-primary/50 h-11 rounded-sm font-mono text-xs tracking-widest"
                                />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label className="text-[10px] font-black uppercase tracking-widest text-primary/60 ml-1">Issue Temporal</Label>
                                    <Input
                                        value={formData.issueDate || ''}
                                        onChange={e => setFormData({ ...formData, issueDate: e.target.value })}
                                        placeholder="YYYY-MM-DD"
                                        className="bg-white/5 border-white/10 focus:border-primary/50 h-11 rounded-sm font-mono text-xs tracking-widest"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label className="text-[10px] font-black uppercase tracking-widest text-primary/60 ml-1">Sunset Temporal</Label>
                                    <Input
                                        value={formData.expiryDate || ''}
                                        onChange={e => setFormData({ ...formData, expiryDate: e.target.value })}
                                        placeholder="YYYY-MM-DD"
                                        className="bg-white/5 border-white/10 focus:border-primary/50 h-11 rounded-sm font-mono text-xs tracking-widest"
                                    />
                                </div>
                            </div>
                        </>
                    )}

                    {type === 'note' && (
                        <div className="space-y-2">
                            <Label className="text-[10px] font-black uppercase tracking-widest text-primary/60 ml-1">Secure Data Stream</Label>
                            <textarea
                                className="flex min-h-[150px] w-full bg-white/5 border border-white/10 focus:border-primary/50 rounded-sm px-4 py-3 text-xs font-mono tracking-widest text-white placeholder:text-white/20 outline-none transition-all resize-none"
                                value={formData.note || ''}
                                onChange={e => setFormData({ ...formData, note: e.target.value })}
                                placeholder="INITIALIZE DATA UPLOAD..."
                            />
                        </div>
                    )}

                    <div className="flex justify-end pt-6 gap-3">
                        <Button
                            type="button"
                            variant="ghost"
                            onClick={onClose}
                            className="text-[10px] font-black uppercase tracking-widest border border-white/5 hover:bg-white/5 h-11 px-6 rounded-sm opacity-60 hover:opacity-100"
                        >
                            Abort
                        </Button>
                        <Button
                            type="submit"
                            className="text-[10px] font-black uppercase tracking-widest bg-primary text-black h-11 px-8 rounded-sm shadow-[0_0_20px_rgba(255,176,0,0.2)] hover:scale-[1.02] active:scale-95 transition-all"
                        >
                            Encrypt Sector
                        </Button>
                    </div>
                </form>
            </div>
        </div>
    );
}
