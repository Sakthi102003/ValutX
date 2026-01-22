import { useState } from 'react';
import type { VaultItemType } from '../store/vaultStore';
import { Button } from './ui/Button';
import { Input } from './ui/Input';
import { Label } from './ui/Label';
import { X, RefreshCw } from 'lucide-react';

interface Props {
    isOpen: boolean;
    onClose: () => void;
    onSave: (type: VaultItemType, data: any) => void;
}

export default function NewItemModal({ isOpen, onClose, onSave }: Props) {
    const [type, setType] = useState<VaultItemType>('login');
    const [formData, setFormData] = useState<any>({});

    if (!isOpen) return null;

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSave(type, { ...formData, name: formData.name || "Untitled" });
        setFormData({});
        onClose();
    };

    const generatePassword = () => {
        const chars = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*()_+";
        const len = 16;
        let pass = "";
        for (let i = 0; i < len; i++) {
            pass += chars.charAt(Math.floor(Math.random() * chars.length));
        }
        setFormData({ ...formData, password: pass });
    }

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
            <div className="bg-card w-full max-w-lg border rounded-xl shadow-2xl p-6 relative animate-in fade-in zoom-in-95 duration-200">
                <button onClick={onClose} className="absolute right-4 top-4 text-muted-foreground hover:text-foreground">
                    <X className="w-5 h-5" />
                </button>

                <h2 className="text-xl font-bold mb-6">Add New Item</h2>

                <div className="flex space-x-2 mb-6 p-1 bg-secondary/50 rounded-lg w-fit">
                    {(['login', 'card', 'note'] as VaultItemType[]).map(t => (
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
                                        type="text" // Show clear text when creating/editing for UX, or password? usually user wants to see what they typed or generated.
                                        value={formData.password || ''}
                                        onChange={e => setFormData({ ...formData, password: e.target.value })}
                                        className="font-mono"
                                    />
                                    <Button type="button" variant="outline" size="icon" onClick={generatePassword} title="Generate Password">
                                        <RefreshCw className="w-4 h-4" />
                                    </Button>
                                </div>
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
