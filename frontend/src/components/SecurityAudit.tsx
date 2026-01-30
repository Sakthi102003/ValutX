import { useEffect, useState } from 'react';
import axios from 'axios';
import { Shield, Terminal, Activity, AlertTriangle } from 'lucide-react';
import { cn } from '../lib/utils';

interface AuditLog {
    id: string;
    event_type: string;
    severity: string;
    details: string;
    ip_address: string;
    timestamp: string;
}

export default function SecurityAudit() {
    const [logs, setLogs] = useState<AuditLog[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchLogs = async () => {
            try {
                const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api/v1';
                const res = await axios.get(`${API_URL}/audit/`);
                setLogs(res.data);
            } catch (err) {
                console.error("Failed to fetch audit logs", err);
            } finally {
                setIsLoading(false);
            }
        };
        fetchLogs();
    }, []);

    return (
        <div className="p-4 md:p-8 space-y-6 md:y-8 animate-in fade-in duration-500">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-l-2 border-primary/50 pl-4 py-1 bg-primary/5">
                <div>
                    <h2 className="text-[10px] md:text-sm font-bold uppercase tracking-[0.3em] text-primary/70 mb-1">Telemetry Monitor</h2>
                    <h1 className="text-xl md:text-3xl font-black uppercase tracking-tighter text-white">Security Audit Log</h1>
                </div>
                <div className="text-left sm:text-right">
                    <div className="text-[10px] uppercase tracking-widest text-muted-foreground mb-1">Node Status</div>
                    <span className="font-mono text-[10px] md:text-xs text-green-500 flex items-center">
                        <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse mr-2" />
                        ENCRYPTED_LINK_ACTIVE
                    </span>
                </div>
            </div>

            <div className="bg-black/60 border border-white/10 rounded-sm overflow-hidden backdrop-blur-md relative group">
                {/* Terminal Header */}
                <div className="bg-white/5 border-b border-white/10 px-3 md:px-4 py-2 flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                        <Terminal className="w-3 h-3 text-primary/60" />
                        <span className="text-[8px] md:text-[10px] font-mono font-bold uppercase tracking-widest text-primary/40">Audit_Daemon_V1.0.4</span>
                    </div>
                    <div className="flex space-x-1">
                        <div className="w-1.5 h-1.5 md:w-2 md:h-2 rounded-full bg-red-500/20" />
                        <div className="w-1.5 h-1.5 md:w-2 md:h-2 rounded-full bg-yellow-500/20" />
                        <div className="w-1.5 h-1.5 md:w-2 md:h-2 rounded-full bg-green-500/20" />
                    </div>
                </div>

                <div className="max-h-[500px] md:max-h-[600px] overflow-auto scrollbar-hide p-2 md:p-4 space-y-2 font-mono text-[9px] md:text-[11px]">
                    {isLoading ? (
                        <div className="py-20 text-center opacity-40 animate-pulse uppercase tracking-[0.5em] text-[10px]">
                            Scanning encrypted sectors...
                        </div>
                    ) : logs.length === 0 ? (
                        <div className="py-20 text-center opacity-40 uppercase tracking-[0.2em] text-[10px]">
                            No security events detected in current epoch.
                        </div>
                    ) : (
                        logs.map((log) => (
                            <div key={log.id} className="group/item flex flex-col md:flex-row md:items-start md:space-x-4 p-2 hover:bg-white/5 rounded-sm transition-colors border border-transparent hover:border-white/5 gap-2 md:gap-0">
                                <div className="flex items-center justify-between md:justify-start md:space-x-4">
                                    <div className="text-muted-foreground/40 whitespace-nowrap order-2 md:order-1">
                                        [{new Date(log.timestamp).toLocaleTimeString([], { hour12: false, hour: '2-digit', minute: '2-digit' })}]
                                    </div>

                                    <div className={cn(
                                        "px-2 py-0.5 rounded-sm font-black uppercase text-[8px] md:text-[9px] tracking-tighter order-1 md:order-2",
                                        log.severity === 'CRITICAL' ? "bg-red-500 text-black shadow-[0_0_10px_rgba(239,68,68,0.3)]" :
                                            log.severity === 'WARNING' ? "bg-yellow-500 text-black" : "bg-primary/20 text-primary"
                                    )}>
                                        {log.event_type}
                                    </div>
                                </div>

                                <div className="flex-1 text-white/80 group-hover/item:text-primary transition-colors break-words">
                                    {log.details || `Access verified from node: ${log.ip_address}`}
                                </div>

                                <div className="text-muted-foreground/30 text-[8px] md:text-[9px] group-hover/item:text-primary/40 transition-colors md:self-start">
                                    IP: {log.ip_address}
                                </div>
                            </div>
                        ))
                    )}
                </div>

                {/* Footer status */}
                <div className="bg-white/5 border-t border-white/10 px-3 md:px-4 py-2 flex items-center justify-between text-[7px] md:text-[9px] font-mono text-muted-foreground/50">
                    <div className="flex items-center space-x-2 md:space-x-4">
                        <span className="uppercase tracking-widest">End of Stream</span>
                        <div className="h-2 w-[1px] bg-white/10" />
                        <span className="animate-pulse hidden sm:inline">_CURSOR_BLINK</span>
                    </div>
                    <div className="uppercase tracking-[0.15em] md:tracking-[0.25em]">ValutX // Quantum_Secure_Audit</div>
                </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 md:gap-6">
                <SecurityStat icon={<Shield className="w-4 h-4" />} label="Identity Integrity" status="Validated" color="text-green-500" />
                <SecurityStat icon={<AlertTriangle className="w-4 h-4" />} label="Recent Alerts" status={logs.filter(l => l.severity !== 'INFO').length.toString()} color="text-yellow-500" />
                <SecurityStat icon={<Activity className="w-4 h-4" />} label="Sub-System Load" status="Nominal" color="text-primary" />
            </div>
        </div>
    );
}

function SecurityStat({ icon, label, status, color }: any) {
    return (
        <div className="p-4 bg-black/40 border border-white/5 rounded-sm backdrop-blur-sm relative overflow-hidden group">
            <div className="absolute inset-0 cyber-grid opacity-5" />
            <div className="relative z-10 flex flex-col">
                <div className="flex items-center space-x-2 text-muted-foreground/60 mb-2">
                    {icon}
                    <span className="text-[10px] font-black uppercase tracking-widest">{label}</span>
                </div>
                <span className={cn("text-xl font-mono uppercase tracking-tighter", color)}>{status}</span>
            </div>
        </div>
    );
}
