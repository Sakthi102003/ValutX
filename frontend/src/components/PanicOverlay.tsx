import { useEffect, useState } from 'react';
import { ShieldAlert } from 'lucide-react';
import { cn } from '../lib/utils';

interface Props {
    isTriggered: boolean;
}

export default function PanicOverlay({ isTriggered }: Props) {
    const [phase, setPhase] = useState(0);

    useEffect(() => {
        if (isTriggered) {
            // Sequence: 
            // 0: Initial Trigger
            // 1: Glitch + Red Alert
            // 2: System Wipe Message
            // 3: Blackout / Reload
            const steps = [
                { time: 100, phase: 1 },
                { time: 800, phase: 2 },
                { time: 1800, phase: 3 },
            ];

            steps.forEach(step => {
                setTimeout(() => setPhase(step.phase), step.time);
            });
        }
    }, [isTriggered]);

    if (!isTriggered) return null;

    return (
        <div className={cn(
            "fixed inset-0 z-[1000] flex items-center justify-center transition-all duration-300",
            phase === 0 && "bg-black/0",
            phase >= 1 && "bg-red-950/90 backdrop-blur-xl",
            phase >= 3 && "bg-black"
        )}>
            {/* Glitch Effects */}
            {phase >= 1 && phase < 3 && (
                <>
                    <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-20 animate-pulse" />
                    <div className="absolute inset-0 bg-red-900/20 mix-blend-overlay animate-flicker" />
                    <div className="absolute inset-0 flex flex-col items-center justify-center overflow-hidden pointer-events-none">
                        {[...Array(20)].map((_, i) => (
                            <div
                                key={i}
                                className="w-full h-[1px] bg-red-500/30 my-4 animate-scan"
                                style={{ animationDelay: `${i * 0.1}s`, top: `${i * 5}%` }}
                            />
                        ))}
                    </div>
                </>
            )}

            <div className={cn(
                "relative z-50 flex flex-col items-center text-center space-y-6 transform transition-all duration-500",
                phase === 1 ? "scale-110 opacity-100" : "scale-100 opacity-0",
                phase === 2 && "opacity-100 scale-95"
            )}>
                <div className="bg-red-500 p-6 rounded-sm shadow-[0_0_50px_rgba(239,68,68,0.8)] animate-bounce">
                    <ShieldAlert className="w-16 h-16 text-white" />
                </div>

                <div className="space-y-2">
                    <h1 className="text-5xl font-black text-white uppercase tracking-tighter">Panic Protocol</h1>
                    <p className="text-xl font-mono text-red-500 animate-pulse uppercase tracking-[0.3em]">Sector Purge Initialized</p>
                </div>

                <div className="flex flex-col items-center space-y-1 pt-8">
                    <div className="text-[10px] font-black text-red-400/60 uppercase tracking-widest mb-2">Memory Wipe in Progress</div>
                    <div className="w-64 h-1 bg-white/10 rounded-full overflow-hidden">
                        <div className="h-full bg-red-500 animate-loading-bar" />
                    </div>
                    <div className="flex justify-between w-full text-[8px] font-mono text-red-500/40 mt-1 uppercase">
                        <span>Purging RAM</span>
                        <span>Destroying Keys</span>
                    </div>
                </div>

                {phase === 2 && (
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-screen h-screen flex items-center justify-center pointer-events-none">
                        <div className="text-[20vw] font-black text-red-500/5 uppercase select-none rotate-12">MELTDOWN</div>
                    </div>
                )}
            </div>

            {/* Final Blackout Message */}
            {phase === 3 && (
                <div className="text-white font-mono text-xs uppercase tracking-[1em] animate-pulse">
                    Node Offline
                </div>
            )}
        </div>
    );
}
