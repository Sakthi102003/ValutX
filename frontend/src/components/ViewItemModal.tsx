import { useState } from 'react';
import { useVaultStore } from '../store/vaultStore';
import type { DecryptedVaultItem } from '../store/vaultStore';
import { Button } from './ui/Button';
import { Label } from './ui/Label';
import { X, Copy, Eye, EyeOff, Trash2, Check, Shield, Search } from 'lucide-react';
import MasterPasswordVerify from './MasterPasswordVerify';
import { cn } from '../lib/utils';

interface Props {
    item: DecryptedVaultItem | null;
    onClose: () => void;
    onDelete: (id: string) => void;
    onEdit: () => void;
}

export default function ViewItemModal({ item, onClose, onDelete, onEdit }: Props) {
    const { setClipboardStatus } = useVaultStore();
    const [showSecrets, setShowSecrets] = useState(false);
    const [isVerifying, setIsVerifying] = useState(false);

    if (!item) return null;

    const copyToClipboard = (text: string) => {
        navigator.clipboard.writeText(text);
        setClipboardStatus(text, 30);
    };

    const toggleSecrets = () => {
        if (!showSecrets) {
            setIsVerifying(true);
        } else {
            setShowSecrets(false);
        }
    };

    const handleVerificationSuccess = () => {
        setShowSecrets(true);
        setIsVerifying(false);
    };

    const handleDelete = () => {
        if (confirm("Are you sure? This cannot be undone.")) {
            onDelete(item.id);
            onClose();
        }
    }

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4 animate-in fade-in duration-300">
            {/* Scanline Overlay */}
            <div className="pointer-events-none absolute inset-0 z-10 bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.1)_50%),linear-gradient(90deg,rgba(255,0,0,0.02),rgba(0,255,0,0.01),rgba(0,0,255,0.02))] bg-[length:100%_4px,100%_100%] opacity-20" />

            <div className="bg-black/90 w-full max-w-lg border border-primary/20 rounded-sm shadow-[0_0_50px_rgba(0,0,0,0.8)] p-8 relative animate-in zoom-in-95 duration-200 overflow-hidden group">
                {/* Edge Accents */}
                <div className="absolute top-0 left-0 w-16 h-1 border-t-2 border-primary shadow-[0_0_10px_rgba(255,176,0,0.5)]" />
                <div className="absolute top-0 left-0 w-1 h-16 border-l-2 border-primary shadow-[0_0_10px_rgba(255,176,0,0.5)]" />
                <div className="absolute bottom-0 right-0 w-16 h-1 border-b-2 border-primary shadow-[0_0_10px_rgba(255,176,0,0.5)]" />
                <div className="absolute bottom-0 right-0 w-1 h-16 border-r-2 border-primary shadow-[0_0_10px_rgba(255,176,0,0.5)]" />

                <button onClick={onClose} className="absolute right-6 top-6 text-primary/40 hover:text-primary transition-colors z-20">
                    <X className="w-6 h-6" />
                </button>

                <div className="mb-8 relative z-20">
                    <div className="flex items-center space-x-3 mb-2">
                        <div className={cn(
                            "p-1.5 rounded-sm ring-1 ring-inset ring-primary/20 bg-primary/5",
                            item.type === 'login' && "text-blue-400",
                            item.type === 'card' && "text-purple-400",
                            item.type === 'note' && "text-amber-400",
                            item.type === 'id' && "text-green-400",
                        )}>
                            {item.type === 'login' && <Shield className="w-4 h-4" />}
                            {item.type === 'card' && <Check className="w-4 h-4" />}
                            {item.type === 'note' && <Search className="w-4 h-4" />}
                            {item.type === 'id' && <Shield className="w-4 h-4" />}
                        </div>
                        <h2 className="text-xs font-black uppercase tracking-[0.4em] text-primary/70">{item.type} Archive</h2>
                    </div>
                    <h1 className="text-3xl font-black uppercase tracking-tighter text-white break-all">
                        {item.data.name}
                    </h1>
                </div>

                <div className="space-y-6 relative z-20">
                    {item.type === 'login' && (
                        <>
                            <Field label="Identity Index" value={item.data.username} onCopy={copyToClipboard} />
                            <Field
                                label="Security Protocol"
                                value={item.data.password}
                                isSecret
                                showSecret={showSecrets}
                                onToggle={toggleSecrets}
                                onCopy={copyToClipboard}
                            />
                            {item.data.website && <Field label="Domain Origin" value={item.data.website} onCopy={copyToClipboard} />}
                        </>
                    )}

                    {item.type === 'card' && (
                        <>
                            <Field label="Credit Identifier" value={item.data.number} isSecret showSecret={showSecrets} onToggle={toggleSecrets} onCopy={copyToClipboard} />
                            <div className="grid grid-cols-2 gap-6">
                                <Field label="Temporal End" value={item.data.expiry} />
                                <Field label="Validation Vector" value={item.data.cvv} isSecret showSecret={showSecrets} onToggle={toggleSecrets} />
                            </div>
                        </>
                    )}

                    {item.type === 'id' && (
                        <>
                            <Field label="Serial Identifier" value={item.data.number} onCopy={copyToClipboard} />
                            <div className="grid grid-cols-2 gap-6">
                                <Field label="Genesis Temporal" value={item.data.issueDate} />
                                <Field label="Sunset Temporal" value={item.data.expiryDate} />
                            </div>
                        </>
                    )}

                    {item.type === 'note' && (
                        <div className="space-y-2">
                            <Label className="text-[10px] font-black uppercase tracking-widest text-primary/60 ml-1">Secure Data Stream</Label>
                            <div className="p-4 bg-white/5 border border-white/10 rounded-sm text-xs font-mono tracking-widest text-primary/90 whitespace-pre-wrap max-h-60 overflow-auto scrollbar-hide">
                                {item.data.note}
                            </div>
                        </div>
                    )}
                </div>

                <div className="mt-10 pt-6 border-t border-white/10 relative z-20">
                    <details className="group/details">
                        <summary className="list-none cursor-pointer flex items-center justify-between text-primary/30 hover:text-primary transition-colors">
                            <div className="flex items-center space-x-2">
                                <div className="flex -space-x-1">
                                    <div className="w-1.5 h-1.5 rounded-full bg-primary/20" />
                                    <div className="w-1.5 h-1.5 rounded-full bg-primary/40 animate-pulse" />
                                    <div className="w-1.5 h-1.5 rounded-full bg-primary/20" />
                                </div>
                                <span className="text-[9px] font-black uppercase tracking-[0.2em]">Provenance Telemetry</span>
                            </div>
                            <span className="text-[8px] font-mono opacity-50">NODE_VER_1.0.4</span>
                        </summary>

                        <div className="mt-6 space-y-5 animate-in fade-in slide-in-from-top-2 duration-300">
                            <div className="space-y-1">
                                <Label className="text-[8px] uppercase tracking-widest text-primary/50 ml-1">Initialization Vector (IV)</Label>
                                <div className="p-3 bg-black/40 border border-white/5 rounded-sm font-mono text-[9px] break-all text-amber-500/70 shadow-inner">
                                    {item.rawIv}
                                </div>
                            </div>
                            <div className="space-y-1">
                                <Label className="text-[8px] uppercase tracking-widest text-primary/50 ml-1">Encrypted Payload (AES-256-GCM)</Label>
                                <div className="p-3 bg-black/40 border border-white/5 rounded-sm font-mono text-[9px] break-all text-blue-500/70 max-h-32 overflow-auto scrollbar-hide shadow-inner">
                                    {item.rawEnc}
                                </div>
                            </div>
                            <div className="p-3 bg-white/5 border border-white/5 rounded-sm">
                                <p className="text-[8px] uppercase tracking-widest text-primary/40 leading-relaxed italic">
                                    * ZERO-KNOWLEDGE PROTOCOL: EVERY ENCRYPTION CYCLE GENERATES A UNIQUE IV. IDENTICAL INPUTS PRODUCE DISTINCT CIPHERTEXTS.
                                </p>
                            </div>
                        </div>
                    </details>
                </div>

                <div className="flex justify-between pt-8 mt-6 border-t border-white/10 relative z-20">
                    <div className="flex space-x-3">
                        <button
                            onClick={handleDelete}
                            className="flex items-center space-x-2 px-4 py-2 text-[10px] font-black uppercase tracking-widest text-red-500 hover:bg-red-500/10 border border-red-500/20 rounded-sm transition-all shadow-[0_0_15px_rgba(239,68,68,0.1)]"
                        >
                            <Trash2 className="w-4 h-4" />
                            <span>Purge Record</span>
                        </button>
                        <button
                            onClick={onEdit}
                            className="px-6 py-2 text-[10px] font-black uppercase tracking-widest text-primary/60 hover:text-primary hover:bg-white/5 border border-white/10 rounded-sm transition-all"
                        >
                            Re-Forge
                        </button>
                    </div>
                    <Button
                        onClick={onClose}
                        className="bg-primary text-black text-[10px] font-black uppercase tracking-widest px-8 h-10 rounded-sm shadow-[0_0_20px_rgba(255,176,0,0.2)]"
                    >
                        Secure Close
                    </Button>
                </div>

                {/* Verification Overlay */}
                {isVerifying && (
                    <MasterPasswordVerify
                        onSuccess={handleVerificationSuccess}
                        onCancel={() => setIsVerifying(false)}
                    />
                )}
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
        <div className="space-y-2">
            <Label className="text-[10px] font-black uppercase tracking-widest text-primary/60 ml-1">{label}</Label>
            <div className="flex space-x-2">
                <div className="flex-1 p-3 rounded-sm bg-white/5 border border-white/10 group-hover:border-primary/20 transition-all truncate text-xs font-mono tracking-widest text-white/90 h-11 flex items-center">
                    {isSecret && !showSecret ? '•'.repeat(Math.min(value.length, 16) || 12) : value}
                </div>
                {isSecret && (
                    <button
                        onClick={onToggle}
                        className="w-11 h-11 flex items-center justify-center rounded-sm bg-white/5 border border-white/10 text-primary/60 hover:text-primary hover:border-primary/40 transition-all"
                        title={showSecret ? "Hide" : "Decrypt View"}
                    >
                        {showSecret ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                )}
                {onCopy && (
                    <button
                        onClick={handleCopy}
                        className="w-11 h-11 flex items-center justify-center rounded-sm bg-white/5 border border-white/10 text-primary/60 hover:text-primary hover:border-primary/40 transition-all"
                        title="Copy to Clipboard"
                    >
                        {copied ? <Check className="w-4 h-4 text-green-500" /> : <Copy className="w-4 h-4" />}
                    </button>
                )}
            </div>
        </div>
    )
}
