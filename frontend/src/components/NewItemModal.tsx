import { useState, useEffect } from 'react';
import type { VaultItemType, DecryptedVaultItem } from '../store/vaultStore';
import { Button } from './ui/Button';
import { Input } from './ui/Input';
import { Label } from './ui/Label';
import { X } from 'lucide-react';

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
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
            <div className="bg-card w-full max-w-lg border rounded-xl shadow-2xl p-6 relative animate-in fade-in zoom-in-95 duration-200">
                <button onClick={onClose} className="absolute right-4 top-4 text-muted-foreground hover:text-foreground">
                    <X className="w-5 h-5" />
                </button>

                <h2 className="text-xl font-bold mb-6">{initialData ? 'Edit Item' : 'Add New Item'}</h2>

                <div className="flex space-x-2 mb-6 p-1 bg-secondary/50 rounded-lg w-fit">
                    {(['login', 'card', 'id', 'note'] as VaultItemType[]).map(t => (
                        <Button
                            key={t}
                            type="button"
                            variant={type === t ? 'default' : 'ghost'}
                            size="sm"
                            onClick={() => setType(t)}
                            className="capitalize"
                        >
                            {t}
                        </Button>
                    ))}
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="space-y-2">
                        <Label>Name</Label>
                        <Input
                            value={formData.name || ''}
                            onChange={e => setFormData({ ...formData, name: e.target.value })}
                            placeholder="e.g. Google, Chase Bank"
                            autoFocus
                            required
                        />
                    </div>

                    {type === 'login' && (
                        <>
                            <div className="space-y-2">
                                <Label>Username/Email</Label>
                                <Input
                                    value={formData.username || ''}
                                    onChange={e => setFormData({ ...formData, username: e.target.value })}
                                />
                            </div>
                            <div className="space-y-2">
                                <Label>Password</Label>
                                <div className="flex space-x-2">
                                    <Input
                                        type="text"
                                        value={formData.password || ''}
                                        onChange={e => setFormData({ ...formData, password: e.target.value })}
                                        className="font-mono"
                                        placeholder="MANUAL INPUT..."
                                    />
                                </div>
                                {formData.password && (() => {
                                    const entropy = calculateDynamicEntropy(formData.password);
                                    return (
                                        <div className="mt-3 space-y-2 p-2 bg-white/5 border border-white/5 rounded-sm animate-in fade-in slide-in-from-top-1 duration-300">
                                            <div className="flex justify-between items-center px-1">
                                                <span className="text-[8px] font-black uppercase tracking-widest text-primary/60">Entropy Analysis</span>
                                                <span className="text-[10px] font-mono text-white">{entropy.bits} BITS</span>
                                            </div>
                                            <div className="h-1 w-full bg-secondary/50 rounded-full overflow-hidden">
                                                <div
                                                    className={`h-full transition-all duration-500 ease-out ${entropy.color}`}
                                                    style={{ width: `${Math.min((entropy.bits / 128) * 100, 100)}%` }}
                                                />
                                            </div>
                                            <p className="text-[9px] text-right font-black uppercase tracking-tighter" style={{ color: `var(--${entropy.color.split('-')[1]})` }}>
                                                {entropy.label}
                                            </p>
                                        </div>
                                    );
                                })()}
                            </div>
                            <div className="space-y-2">
                                <Label>Website</Label>
                                <Input
                                    value={formData.website || ''}
                                    onChange={e => setFormData({ ...formData, website: e.target.value })}
                                    placeholder="https://"
                                />
                            </div>
                        </>
                    )}

                    {type === 'card' && (
                        <>
                            <div className="space-y-2">
                                <Label>Card Number</Label>
                                <Input
                                    value={formData.number || ''}
                                    onChange={e => setFormData({ ...formData, number: e.target.value })}
                                    placeholder="0000 0000 0000 0000"
                                />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label>Expiry</Label>
                                    <Input
                                        value={formData.expiry || ''}
                                        onChange={e => setFormData({ ...formData, expiry: e.target.value })}
                                        placeholder="MM/YY"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label>CVV</Label>
                                    <Input
                                        type="password"
                                        value={formData.cvv || ''}
                                        onChange={e => setFormData({ ...formData, cvv: e.target.value })}
                                        placeholder="123"
                                    />
                                </div>
                            </div>
                        </>
                    )}

                    {type === 'id' && (
                        <>
                            <div className="space-y-2">
                                <Label>ID Number</Label>
                                <Input
                                    value={formData.number || ''}
                                    onChange={e => setFormData({ ...formData, number: e.target.value })}
                                    placeholder="Passport, SSN, License..."
                                />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label>Issue Date</Label>
                                    <Input
                                        value={formData.issueDate || ''}
                                        onChange={e => setFormData({ ...formData, issueDate: e.target.value })}
                                        placeholder="YYYY-MM-DD"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label>Expiry Date</Label>
                                    <Input
                                        value={formData.expiryDate || ''}
                                        onChange={e => setFormData({ ...formData, expiryDate: e.target.value })}
                                        placeholder="YYYY-MM-DD"
                                    />
                                </div>
                            </div>
                        </>
                    )}

                    {type === 'note' && (
                        <div className="space-y-2">
                            <Label>Secure Note</Label>
                            <textarea
                                className="flex min-h-[150px] w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
                                value={formData.note || ''}
                                onChange={e => setFormData({ ...formData, note: e.target.value })}
                                placeholder="Your secret thoughts..."
                            />
                        </div>
                    )}

                    <div className="flex justify-end pt-4 gap-2">
                        <Button type="button" variant="ghost" onClick={onClose}>Cancel</Button>
                        <Button type="submit">Encrypt & Save</Button>
                    </div>
                </form>
            </div>
        </div>
    );
}
