import { useState, useEffect, useCallback } from 'react';
import { Button } from './ui/Button';
import { Label } from './ui/Label';
import { Copy, RefreshCw, Shield, Zap, History, ClipboardCheck, AlertTriangle } from 'lucide-react';
import { cn } from '../lib/utils';
import { useVaultStore } from '../store/vaultStore';

interface GeneratorOptions {
    length: number;
    uppercase: boolean;
    lowercase: boolean;
    numbers: boolean;
    symbols: boolean;
    excludeSimilar: boolean;
}

const SIMILAR_CHARS = 'il1Lo0O';

export default function PasswordGenerator() {
    const { setClipboardStatus } = useVaultStore();
    const [options, setOptions] = useState<GeneratorOptions>({
        length: 24,
        uppercase: true,
        lowercase: true,
        numbers: true,
        symbols: true,
        excludeSimilar: false,
    });

    const [password, setPassword] = useState('');
    const [history, setHistory] = useState<string[]>([]);
    const [copied, setCopied] = useState(false);

    const generate = useCallback(() => {
        let charset = '';
        if (options.lowercase) charset += 'abcdefghijklmnopqrstuvwxyz';
        if (options.uppercase) charset += 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
        if (options.numbers) charset += '0123456789';
        if (options.symbols) charset += '!@#$%^&*()_+-=[]{}|;:,.<>?';

        if (options.excludeSimilar) {
            charset = charset.split('').filter(char => !SIMILAR_CHARS.includes(char)).join('');
        }

        if (charset === '') return;

        let newPassword = '';
        const array = new Uint32Array(options.length);
        window.crypto.getRandomValues(array);

        for (let i = 0; i < options.length; i++) {
            newPassword += charset[array[i] % charset.length];
        }

        setPassword(newPassword);
        setHistory(prev => [newPassword, ...prev].slice(0, 5));
    }, [options]);

    useEffect(() => {
        generate();
    }, [generate]);

    const copyToClipboard = async (text: string) => {
        await navigator.clipboard.writeText(text);
        setCopied(true);
        setClipboardStatus(text, 30); // Using the store's clipboard status
        setTimeout(() => setCopied(false), 2000);
    };

    const calculateDynamicEntropy = (pass: string) => {
        if (!pass) return 0;
        let pool = 0;
        if (/[a-z]/.test(pass)) pool += 26;
        if (/[A-Z]/.test(pass)) pool += 26;
        if (/[0-9]/.test(pass)) pool += 10;
        if (/[^a-zA-Z0-9]/.test(pass)) pool += 32;
        return Math.floor(pass.length * Math.log2(Math.max(pool, 1)));
    };

    const entropy = calculateDynamicEntropy(password);

    return (
        <div className="max-w-4xl mx-auto p-4 md:p-8">
            <div className="flex items-center space-x-4 mb-8">
                <div className="bg-primary/20 p-3 rounded-sm border border-primary/30 shadow-[0_0_20px_rgba(255,176,0,0.1)]">
                    <Zap className="w-6 h-6 text-primary" />
                </div>
                <div>
                    <h1 className="text-3xl font-black uppercase tracking-tighter text-white">Entropy Forge</h1>
                    <p className="text-[10px] uppercase tracking-[0.4em] text-primary/60 font-bold">Cryptographically Secure Generation & Analysis</p>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Main Generator Area */}
                <div className="lg:col-span-2 space-y-6">
                    {/* Password Display / Input */}
                    <div className="relative group">
                        <div className="absolute -inset-0.5 bg-gradient-to-r from-primary/50 to-primary/10 rounded-sm blur opacity-20 group-hover:opacity-40 transition-opacity" />
                        <div className="relative bg-black border border-white/10 p-4 rounded-sm flex items-center justify-between overflow-hidden">
                            <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-primary/40 to-transparent" />

                            <input
                                type="text"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="bg-transparent border-none focus:ring-0 font-mono text-xl md:text-2xl lg:text-3xl text-white break-all tracking-tight pr-12 w-full outline-none"
                                placeholder="MANUAL INPUT OR AUTO-FORGE..."
                            />

                            <div className="flex flex-col space-y-1">
                                <Button
                                    size="icon"
                                    variant="ghost"
                                    className="h-10 w-10 hover:bg-primary/20 text-primary"
                                    onClick={() => copyToClipboard(password)}
                                >
                                    {copied ? <ClipboardCheck className="w-5 h-5" /> : <Copy className="w-5 h-5" />}
                                </Button>
                                <Button
                                    size="icon"
                                    variant="ghost"
                                    className="h-10 w-10 hover:bg-primary/20 text-primary"
                                    onClick={generate}
                                >
                                    <RefreshCw className="w-5 h-5" />
                                </Button>
                            </div>
                        </div>
                    </div>

                    {/* Strength Indicator */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="bg-white/5 border border-white/5 p-4 rounded-sm">
                            <Label className="text-[10px] uppercase tracking-widest text-muted-foreground mb-2 block">Entropy Strength</Label>
                            <div className="flex items-end space-x-2">
                                <span className="text-2xl font-black text-primary font-mono">{entropy}</span>
                                <span className="text-[10px] text-muted-foreground font-bold mb-1 uppercase">Bits</span>
                            </div>
                            <div className="h-1 w-full bg-white/5 rounded-full mt-2 overflow-hidden">
                                <div
                                    className={cn(
                                        "h-full transition-all duration-1000",
                                        entropy > 100 ? "bg-cyan-500 shadow-[0_0_10px_rgba(6,182,212,0.5)]" :
                                            entropy > 80 ? "bg-green-500 shadow-[0_0_10px_rgba(34,197,94,0.5)]" :
                                                entropy > 60 ? "bg-blue-500 shadow-[0_0_10px_rgba(59,130,246,0.5)]" :
                                                    "bg-red-500"
                                    )}
                                    style={{ width: `${Math.min((entropy / 128) * 100, 100)}%` }}
                                />
                            </div>
                        </div>

                        <div className="bg-white/5 border border-white/5 p-4 rounded-sm">
                            <Label className="text-[10px] uppercase tracking-widest text-muted-foreground mb-2 block">Security Rating</Label>
                            <div className="flex items-center space-x-2">
                                <Shield className={cn(
                                    "w-5 h-5",
                                    entropy > 80 ? "text-green-500" : "text-yellow-500"
                                )} />
                                <span className="text-sm font-black uppercase tracking-widest">
                                    {entropy > 128 ? 'Quantum Resistant' :
                                        entropy > 90 ? 'Tactical Grade' :
                                            entropy > 60 ? 'Secure' : 'Vulnerable'}
                                </span>
                            </div>
                            <p className="text-[9px] text-muted-foreground uppercase tracking-tight mt-2 italic">
                                {entropy > 90 ? 'Recommended for high-value targets' : 'Consider increasing length'}
                            </p>
                        </div>

                        <div className="bg-white/5 border border-white/5 p-4 rounded-sm flex flex-col justify-center">
                            <Button
                                className="bg-primary text-black font-black uppercase tracking-[0.2em] rounded-sm shadow-[0_0_20px_rgba(255,176,0,0.2)]"
                                onClick={generate}
                            >
                                Re-Forge Sequence
                            </Button>
                        </div>
                    </div>
                </div>

                {/* Options Panel */}
                <div className="space-y-6">
                    <div className="bg-black/40 border border-white/10 p-6 rounded-sm space-y-6 relative overflow-hidden">
                        <div className="absolute top-0 right-0 p-1">
                            <Settings className="w-12 h-12 text-primary/5 -rotate-12" />
                        </div>

                        <h3 className="text-xs font-black uppercase tracking-[0.3em] text-primary mb-4 flex items-center">
                            <span className="w-2 h-2 bg-primary mr-2 animate-pulse" /> Parameters
                        </h3>

                        <div className="space-y-4">
                            <div className="space-y-3">
                                <div className="flex justify-between items-center">
                                    <Label className="text-[10px] uppercase tracking-widest font-bold">Length</Label>
                                    <span className="font-mono text-primary text-sm font-bold">{options.length}</span>
                                </div>
                                <input
                                    type="range"
                                    min="8"
                                    max="128"
                                    value={options.length}
                                    onChange={(e) => setOptions({ ...options, length: parseInt(e.target.value) })}
                                    className="w-full accent-primary bg-white/5"
                                />
                                <div className="flex justify-between text-[8px] text-muted-foreground uppercase font-bold tracking-tighter">
                                    <span>Minimal (8)</span>
                                    <span>Extreme (128)</span>
                                </div>
                            </div>

                            <div className="space-y-3 pt-2">
                                <ToggleOption
                                    label="Uppercase (A-Z)"
                                    active={options.uppercase}
                                    onClick={() => setOptions({ ...options, uppercase: !options.uppercase })}
                                />
                                <ToggleOption
                                    label="Lowercase (a-z)"
                                    active={options.lowercase}
                                    onClick={() => setOptions({ ...options, lowercase: !options.lowercase })}
                                />
                                <ToggleOption
                                    label="Numbers (0-9)"
                                    active={options.numbers}
                                    onClick={() => setOptions({ ...options, numbers: !options.numbers })}
                                />
                                <ToggleOption
                                    label="Symbols (!@#$)"
                                    active={options.symbols}
                                    onClick={() => setOptions({ ...options, symbols: !options.symbols })}
                                />
                                <ToggleOption
                                    label="Exclude Similar"
                                    active={options.excludeSimilar}
                                    onClick={() => setOptions({ ...options, excludeSimilar: !options.excludeSimilar })}
                                />
                            </div>
                        </div>

                        {(!options.lowercase && !options.uppercase && !options.numbers && !options.symbols) && (
                            <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-sm flex items-start space-x-2">
                                <AlertTriangle className="w-4 h-4 text-red-500 shrink-0 mt-0.5" />
                                <p className="text-[9px] text-red-400 uppercase font-black leading-tight">Initialization Error: Select at least one character set.</p>
                            </div>
                        )}
                    </div>

                    {/* Generator History */}
                    <div className="bg-black/20 border border-white/5 p-4 rounded-sm">
                        <div className="flex items-center space-x-2 mb-4 text-muted-foreground">
                            <History className="w-3 h-3" />
                            <span className="text-[10px] uppercase tracking-widest font-black">Temporal Stash</span>
                        </div>
                        <div className="space-y-2">
                            {history.length <= 1 ? (
                                <p className="text-[10px] uppercase opacity-30 text-center py-4 italic">No prior sequences</p>
                            ) : (
                                history.slice(1).map((pass, i) => (
                                    <div
                                        key={i}
                                        className="flex items-center justify-between p-2 hover:bg-white/5 rounded-sm group transition-colors cursor-pointer border border-transparent hover:border-white/10"
                                        onClick={() => copyToClipboard(pass)}
                                    >
                                        <span className="font-mono text-[10px] text-muted-foreground truncate max-w-[150px]">{pass}</span>
                                        <Copy className="w-3 h-3 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
                                    </div>
                                ))
                            )}
                            <p className="text-[8px] uppercase text-muted-foreground/40 text-center mt-4">History is wiped on session termination</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

function ToggleOption({ label, active, onClick }: { label: string, active: boolean, onClick: () => void }) {
    return (
        <button
            onClick={onClick}
            className={cn(
                "w-full flex items-center justify-between px-3 py-2 rounded-sm border transition-all text-[10px] font-bold uppercase tracking-wider",
                active ? "bg-primary/10 border-primary/40 text-primary" : "bg-white/5 border-white/5 text-muted-foreground hover:bg-white/10"
            )}
        >
            <span>{label}</span>
            <div className={cn(
                "w-8 h-4 rounded-full relative transition-colors",
                active ? "bg-primary/40" : "bg-white/20"
            )}>
                <div className={cn(
                    "absolute top-1 w-2 h-2 rounded-full transition-all",
                    active ? "right-1 bg-primary" : "left-1 bg-white/40"
                )} />
            </div>
        </button>
    );
}

const Settings = (props: any) => (
    <svg
        {...props}
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
    >
        <path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z" />
        <circle cx="12" cy="12" r="3" />
    </svg>
);
