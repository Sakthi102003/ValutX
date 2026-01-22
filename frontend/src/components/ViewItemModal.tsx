import { useState } from 'react';
import type { DecryptedVaultItem } from '../store/vaultStore';
import { Button } from './ui/Button';
import { Label } from './ui/Label';
import { X, Copy, Eye, EyeOff, Trash2, Check } from 'lucide-react';

interface Props {
    item: DecryptedVaultItem | null;
    onClose: () => void;
    onDelete: (id: string) => void;
}

export default function ViewItemModal({ item, onClose, onDelete }: Props) {
    const [showPassword, setShowPassword] = useState(false);

    if (!item) return null;

    const copyToClipboard = (text: string) => {
        navigator.clipboard.writeText(text);
    };

    const handleDelete = () => {
        if (confirm("Are you sure? This cannot be undone.")) {
            onDelete(item.id);
            onClose();
        }
    }

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
            <div className="bg-card w-full max-w-lg border rounded-xl shadow-2xl p-6 relative animate-in fade-in zoom-in-95 duration-200">
                <button onClick={onClose} className="absolute right-4 top-4 text-muted-foreground hover:text-foreground">
                    <X className="w-5 h-5" />
                </button>

                <div className="mb-6 pr-8">
                    <h2 className="text-xl font-bold">{item.data.name}</h2>
                    <p className="text-xs text-muted-foreground uppercase tracking-wider mt-1">{item.type}</p>
                </div>

                <div className="space-y-4">
                    {item.type === 'login' && (
                        <>
                            <Field label="Username" value={item.data.username} onCopy={copyToClipboard} />
                            <Field
                                label="Password"
                                value={item.data.password}
                                isSecret
                                showSecret={showPassword}
                                onToggle={() => setShowPassword(!showPassword)}
                                onCopy={copyToClipboard}
                            />
                            {item.data.website && <Field label="Website" value={item.data.website} onCopy={copyToClipboard} />}
                        </>
                    )}

                    {item.type === 'card' && (
                        <>
                            <Field label="Card Number" value={item.data.number} isSecret showSecret={showPassword} onToggle={() => setShowPassword(!showPassword)} onCopy={copyToClipboard} />
                            <div className="grid grid-cols-2 gap-4">
                                <Field label="Expiry" value={item.data.expiry} />
                                <Field label="CVV" value={item.data.cvv} isSecret showSecret={showPassword} onToggle={() => setShowPassword(!showPassword)} />
                            </div>
                        </>
                    )}

                    {item.type === 'note' && (
                        <div className="space-y-2">
                            <Label>Note</Label>
                            <div className="p-3 rounded-md bg-secondary/30 text-sm whitespace-pre-wrap max-h-60 overflow-auto font-mono border border-white/5">
                                {item.data.note}
                            </div>
                        </div>
                    )}
                </div>

                <div className="flex justify-between pt-6 mt-2 border-t border-border">
                    <Button variant="destructive" size="sm" onClick={handleDelete} className="text-red-400 hover:text-red-300">
                        <Trash2 className="w-4 h-4 mr-2" /> Delete
                    </Button>
                    <Button onClick={onClose}>Close</Button>
                </div>
            </div>
        </div>
    );
}

function Field({ label, value, isSecret, showSecret, onToggle, onCopy }: any) {
    const [copied, setCopied] = useState(false);

    if (!value) return null;

    const handleCopy = () => {
        if (onCopy) {
            onCopy(value);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        }
    };

    return (
        <div className="space-y-1">
            <Label className="text-xs text-muted-foreground">{label}</Label>
            <div className="flex space-x-2">
                <div className="flex-1 p-2 rounded-md bg-secondary/50 border border-transparent hover:border-border transition-colors truncate text-sm font-medium h-9 flex items-center font-mono">
                    {isSecret && !showSecret ? '•'.repeat(Math.min(value.length, 20) || 8) : value}
                </div>
                {isSecret && (
                    <Button variant="ghost" size="icon" onClick={onToggle} title={showSecret ? "Hide" : "Show"}>
                        {showSecret ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </Button>
                )}
                {onCopy && (
                    <Button variant="ghost" size="icon" onClick={handleCopy} title="Copy">
                        {copied ? <Check className="w-4 h-4 text-green-500" /> : <Copy className="w-4 h-4" />}
                    </Button>
                )}
            </div>
        </div>
    )
}
