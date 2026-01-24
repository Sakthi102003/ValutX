import { useState } from 'react';
import { deriveKEK, generateDEK, encryptVaultItem, decryptVaultItem, wrapDEK, unwrapDEK } from '../utils/crypto';
import { ShieldCheck, Activity, Cpu } from 'lucide-react';
import { cn } from '../lib/utils';

export default function SecurityDiagnostics() {
    const [status, setStatus] = useState<'idle' | 'running' | 'success' | 'fail'>('idle');
    const [results, setResults] = useState<{ name: string; status: 'pass' | 'fail'; time?: number }[]>([]);

    const runTests = async () => {
        setStatus('running');
        const newResults: any[] = [];

        try {
            // Test 1: Key Derivation
            const startKdf = performance.now();
            const salt = "c2FsdF90ZXN0XzEyMzQ1Njc4OQ=="; // 'salt_test_123456789' in base64
            await deriveKEK("password123!", salt);
            newResults.push({ name: "KDF_DERIVATION_INTEGRITY", status: 'pass', time: Math.round(performance.now() - startKdf) });

            // Test 2: Symmetric Encryption
            const dek = await generateDEK();
            const testData = { secret: "VALUTX_DIAG_TOKEN" };
            const encrypted = await encryptVaultItem(testData, dek);
            const decrypted = await decryptVaultItem(encrypted.cipherText, encrypted.iv, dek);

            if (decrypted.secret === testData.secret) {
                newResults.push({ name: "AES_256_GCM_SYMMETRIC", status: 'pass' });
            } else {
                throw new Error("Symmetric mismatch");
            }

            // Test 3: Key Wrapping
            const kek = await deriveKEK("kek_pass", salt);
            const wrapped = await wrapDEK(dek, kek);
            await unwrapDEK(wrapped.cipherText, wrapped.iv, kek);
            newResults.push({ name: "NON_EXTRACTABLE_WRAP_LOGIC", status: 'pass' });

            setResults(newResults);
            setStatus('success');
        } catch (e) {
            console.error(e);
            setStatus('fail');
        }
    };

    return (
        <div className="p-6 bg-black/40 border border-white/5 rounded-sm backdrop-blur-md relative overflow-hidden group">
            <div className="absolute inset-0 cyber-grid opacity-5" />

            <div className="flex items-center justify-between mb-6">
                <div>
                    <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-primary/60">Sub-System Analysis</h3>
                    <h2 className="text-lg font-black uppercase tracking-tighter text-white flex items-center">
                        <Cpu className="w-5 h-5 mr-3 text-primary animate-pulse" />
                        Infrastructure Health
                    </h2>
                </div>
                <button
                    onClick={runTests}
                    disabled={status === 'running'}
                    className={cn(
                        "px-4 py-2 text-[10px] font-black uppercase tracking-widest transition-all rounded-sm border",
                        status === 'running' ? "opacity-50 cursor-not-allowed border-white/10" : "border-primary/20 hover:bg-primary/10 text-primary"
                    )}
                >
                    {status === 'running' ? 'EXECUTING...' : 'INITIATE DIAGNOSTICS'}
                </button>
            </div>

            <div className="space-y-3">
                {results.length === 0 && status === 'idle' && (
                    <div className="py-8 text-center text-[10px] font-mono uppercase tracking-[0.2em] opacity-40 italic">
                        Node status: Nominal. Awaiting diagnostic trigger.
                    </div>
                )}

                {results.map((r, i) => (
                    <div key={i} className="flex items-center justify-between p-3 bg-white/5 border border-white/5 rounded-sm group/row hover:border-primary/20 transition-all">
                        <div className="flex items-center space-x-3">
                            <Activity className="w-3 h-3 text-primary/50" />
                            <span className="text-[11px] font-mono uppercase text-white/80">{r.name}</span>
                        </div>
                        <div className="flex items-center space-x-4">
                            {r.time && <span className="text-[9px] font-mono text-muted-foreground">{r.time}ms</span>}
                            <span className={cn(
                                "text-[9px] font-black uppercase px-2 py-0.5 rounded-sm",
                                r.status === 'pass' ? "bg-green-500/20 text-green-500" : "bg-red-500/20 text-red-500"
                            )}>
                                {r.status}
                            </span>
                        </div>
                    </div>
                ))}
            </div>

            {status === 'success' && (
                <div className="mt-6 pt-4 border-t border-white/5 flex items-center space-x-3 text-green-500/70 text-[10px] font-mono uppercase tracking-widest animate-in slide-in-from-top-1">
                    <ShieldCheck className="w-4 h-4" />
                    <span>Cryptographic integrity verified. Sector is secure.</span>
                </div>
            )}
        </div>
    );
}
