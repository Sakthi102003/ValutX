import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useVaultStore } from '../store/vaultStore';
import type { VaultItemType, DecryptedVaultItem } from '../store/vaultStore';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { LogOut, Plus, Search, CreditCard, Key, FileText, User, ShieldAlert, Shield, Settings, Zap, Activity, Menu } from 'lucide-react';
import { cn } from '../lib/utils';
import NewItemModal from '../components/NewItemModal';
import ViewItemModal from '../components/ViewItemModal';
import PasswordGenerator from '../components/PasswordGenerator';
import SettingsPage from './SettingsPage';
import PanicOverlay from '../components/PanicOverlay';
import SecurityAudit from '../components/SecurityAudit';

export default function Dashboard() {
    const { logout, panicLock, decryptedItems, addItem, updateItem, deleteItem, fetchItems, userEmail, clipboardStatus, settings, isPanicking } = useVaultStore();
    const [activeTab, setActiveTab] = useState<VaultItemType | 'all'>('all');
    const [view, setView] = useState<'items' | 'settings' | 'generator' | 'audit'>('items');
    const [search, setSearch] = useState('');

    const [isAddOpen, setIsAddOpen] = useState(false);
    const [viewingItem, setViewingItem] = useState<DecryptedVaultItem | null>(null);
    const [editingItem, setEditingItem] = useState<DecryptedVaultItem | null>(null);
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);

    // Initial Fetch
    useEffect(() => {
        if (decryptedItems.length === 0) {
            fetchItems();
        }
    }, [fetchItems, decryptedItems.length]);

    // Close sidebar on navigation (mobile)
    useEffect(() => {
        setIsSidebarOpen(false);
    }, [view, activeTab]);

    // Feature 2: Keyboard Shortcuts
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (!settings.keyboardShortcuts) return;

            // Search: /
            if (e.key === '/' && document.activeElement?.tagName !== 'INPUT' && document.activeElement?.tagName !== 'TEXTAREA') {
                e.preventDefault();
                document.querySelector<HTMLInputElement>('input[placeholder="IDENTIFY DATA..."]')?.focus();
            }
            // New Item: Ctrl + N
            if (e.ctrlKey && e.key === 'n') {
                e.preventDefault();
                setIsAddOpen(true);
            }
            // Panic: Alt + Shift + P
            if (e.altKey && e.shiftKey && e.key === 'P') {
                e.preventDefault();
                panicLock();
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [settings.keyboardShortcuts, panicLock]);

    // Handle Add / Edit
    const handleSaveItem = async (type: VaultItemType, data: any, id?: string) => {
        if (id) {
            await updateItem(id, type, data);
        } else {
            await addItem(type, data);
        }
        setIsAddOpen(false);
        setEditingItem(null);
    }

    const handleEditItem = () => {
        if (viewingItem) {
            setEditingItem(viewingItem);
            setViewingItem(null);
            setIsAddOpen(true);
        }
    }

    // Handle Delete
    const handleDeleteItem = async (id: string) => {
        await deleteItem(id);
        setViewingItem(null);
    }

    // Filter items
    const filteredItems = decryptedItems.filter(item => {
        const matchesTab = activeTab === 'all' || item.type === activeTab;
        const searchLower = search.toLowerCase();
        const dataStr = JSON.stringify(item.data).toLowerCase();
        const matchesSearch = !search || dataStr.includes(searchLower);

        return matchesTab && matchesSearch;
    });

    return (
        <div className="flex h-screen bg-background overflow-hidden font-sans relative selection:bg-primary/30 selection:text-primary">
            {/* Scanline Overlay */}
            <div className="pointer-events-none absolute inset-0 z-[100] bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.1)_50%),linear-gradient(90deg,rgba(255,0,0,0.03),rgba(0,255,0,0.01),rgba(0,0,255,0.03))] bg-[length:100%_4px,100%_100%] opacity-20" />

            {/* Grid Background */}
            <div className="absolute inset-0 cyber-grid opacity-20 pointer-events-none" />

            {/* Mobile Sidebar Backdrop */}
            {isSidebarOpen && (
                <div
                    className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[80] md:hidden transition-all duration-300"
                    onClick={() => setIsSidebarOpen(false)}
                />
            )}

            {/* Sidebar */}
            <aside className={cn(
                "fixed inset-y-0 left-0 w-64 border-r border-primary/20 bg-black/95 md:bg-black/80 backdrop-blur-md flex flex-col p-4 space-y-4 shadow-[5px_0_30px_rgba(0,0,0,0.5)] z-[90] transition-transform duration-300 md:relative md:translate-x-0",
                isSidebarOpen ? "translate-x-0" : "-translate-x-full"
            )}>
                {/* Sidebar Edge Glow */}
                <div className="absolute top-0 right-0 w-[1px] h-full bg-gradient-to-b from-transparent via-primary/50 to-transparent opacity-30" />

                <div className="flex items-center justify-between mb-4 px-2">
                    <Link to="/" className="flex items-center space-x-3 group cursor-pointer">
                        <div className="bg-primary/20 p-1 rounded-sm ring-1 ring-primary/40 group-hover:bg-primary/30 transition-all shadow-[0_0_15px_rgba(255,176,0,0.2)]">
                            <img src="/favicon.png" alt="ValutX" className="w-6 h-6 object-contain" />
                        </div>
                        <span className="font-bold text-xl tracking-[0.2em] uppercase text-primary text-glow-amber">ValutX</span>
                    </Link>
                    <Button
                        variant="ghost"
                        size="sm"
                        className="md:hidden text-primary p-1"
                        onClick={() => setIsSidebarOpen(false)}
                    >
                        <Plus className="w-5 h-5 rotate-45" />
                    </Button>
                </div>

                <div className="px-2 pb-4 border-b border-white/5 mb-2">
                    <div className="flex items-center space-x-2 text-[10px] uppercase tracking-widest text-muted-foreground bg-white/5 p-2 rounded-sm border border-white/5 overflow-hidden">
                        <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse shadow-[0_0_8px_rgba(34,197,94,0.5)] shrink-0" />
                        <span className="truncate">{userEmail}</span>
                    </div>
                </div>

                <nav className="flex-1 space-y-2 overflow-y-auto scrollbar-hide">
                    <div className="text-[10px] font-bold text-muted-foreground px-2 py-1 uppercase tracking-tighter opacity-50">Main Directory</div>
                    <SidebarItem icon={<Key className="w-4 h-4" />} label="Master Vault" active={view === 'items' && activeTab === 'all'} onClick={() => { setView('items'); setActiveTab('all'); }} count={decryptedItems.length} />
                    <SidebarItem icon={<User className="w-4 h-4" />} label="Auth Credentials" active={view === 'items' && activeTab === 'login'} onClick={() => { setView('items'); setActiveTab('login'); }} count={decryptedItems.filter(i => i.type === 'login').length} />
                    <SidebarItem icon={<CreditCard className="w-4 h-4" />} label="Financial Keys" active={view === 'items' && activeTab === 'card'} onClick={() => { setView('items'); setActiveTab('card'); }} count={decryptedItems.filter(i => i.type === 'card').length} />
                    <SidebarItem icon={<FileText className="w-4 h-4" />} label="Secure Data" active={view === 'items' && activeTab === 'note'} onClick={() => { setView('items'); setActiveTab('note'); }} count={decryptedItems.filter(i => i.type === 'note').length} />
                    <SidebarItem icon={<Activity className="w-4 h-4" />} label="Security Audit" active={view === 'audit'} onClick={() => setView('audit')} count={0} />
                    <SidebarItem icon={<Zap className="w-4 h-4" />} label="Entropy Forge" active={view === 'generator'} onClick={() => setView('generator')} count={0} />
                </nav>

                <div className="px-2 py-2 border-t border-white/5">
                    <SidebarItem
                        icon={<Settings className="w-4 h-4" />}
                        label="System Config"
                        active={view === 'settings'}
                        onClick={() => setView('settings')}
                        count={0}
                    />
                </div>

                <div className="pt-4 border-t border-white/5 space-y-2">
                    <Button
                        variant="ghost"
                        className="w-full justify-start hover:bg-red-500/10 hover:text-red-500 group transition-all rounded-sm border border-transparent hover:border-red-500/30 text-[10px] uppercase tracking-widest font-bold px-3 py-2"
                        onClick={panicLock}
                        title="IMMEDIATE COUNTERMEASURE: Wipes all decrypted data from memory and terminates session instantly."
                    >
                        <ShieldAlert className="w-4 h-4 mr-3 group-hover:text-red-500 animate-pulse shrink-0" /> Immediate Countermeasure
                    </Button>
                    <Button variant="ghost" className="w-full justify-start hover:bg-white/5 rounded-sm text-[10px] uppercase tracking-widest opacity-60 hover:opacity-100 transition-opacity px-3 py-2" onClick={logout}>
                        <LogOut className="w-4 h-4 mr-3 shrink-0" /> Terminate Session
                    </Button>
                </div>
            </aside>

            {/* Main Content */}
            <main className="flex-1 flex flex-col overflow-hidden relative z-10 w-full">
                {/* Header */}
                <header className="h-16 border-b border-white/5 flex items-center justify-between px-4 md:px-8 bg-black/40 backdrop-blur-md shrink-0">
                    <div className="flex items-center space-x-4 max-w-[60%] md:max-w-none">
                        <Button
                            variant="ghost"
                            size="sm"
                            className="md:hidden text-primary p-2"
                            onClick={() => setIsSidebarOpen(true)}
                        >
                            <Menu className="w-6 h-6" />
                        </Button>

                        <div className="w-40 md:w-96">
                            {view === 'items' && (
                                <div className="relative group">
                                    <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
                                    <Input
                                        placeholder="IDENTIFY DATA..."
                                        className="pl-10 bg-white/5 border-white/10 focus:bg-white/10 focus:border-primary/50 transition-all h-10 shadow-inner rounded-sm font-mono text-[10px] md:text-xs uppercase tracking-wider"
                                        value={search}
                                        onChange={e => setSearch(e.target.value)}
                                    />
                                </div>
                            )}
                            {view === 'generator' && (
                                <div className="flex items-center space-x-2 text-primary/40 font-mono text-[8px] md:text-[10px] uppercase tracking-widest truncate">
                                    <Zap className="w-3 h-3 shrink-0" />
                                    <span>Generator Active // No Search Range</span>
                                </div>
                            )}
                            {view === 'audit' && (
                                <div className="flex items-center space-x-2 text-primary/40 font-mono text-[8px] md:text-[10px] uppercase tracking-widest truncate">
                                    <Activity className="w-3 h-3 shrink-0" />
                                    <span>Security Logs // Encrypted Stream</span>
                                </div>
                            )}
                        </div>
                    </div>
                    {view === 'items' && (
                        <Button size="sm" className="bg-primary hover:bg-primary/80 text-black font-bold uppercase tracking-[0.1em] md:tracking-[0.2em] rounded-sm px-3 md:px-6 shadow-[0_0_20px_rgba(255,176,0,0.3)] transition-all hover:scale-[1.02] active:scale-95 text-[10px] md:text-xs h-9 md:h-10" onClick={() => setIsAddOpen(true)}>
                            <Plus className="w-4 h-4 md:mr-2" /> <span className="hidden md:inline">Add Record</span>
                        </Button>
                    )}
                </header>

                {/* Scrollable Content */}
                {view === 'settings' ? (
                    <div className="flex-1 overflow-auto scrollbar-hide">
                        <SettingsPage />
                    </div>
                ) : view === 'generator' ? (
                    <div className="flex-1 overflow-auto scrollbar-hide">
                        <PasswordGenerator />
                    </div>
                ) : view === 'audit' ? (
                    <div className="flex-1 overflow-auto scrollbar-hide">
                        <SecurityAudit />
                    </div>
                ) : (
                    <div className="flex-1 overflow-auto p-4 md:p-8 scrollbar-hide relative group/content">
                        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-8 border-l-2 border-primary/50 pl-4 py-1 bg-primary/5 gap-4">
                            <div>
                                <h2 className="text-[10px] md:text-sm font-bold uppercase tracking-[0.3em] text-primary/70 mb-1">Secure Directory</h2>
                                <h1 className="text-xl md:text-3xl font-black uppercase tracking-tighter text-white">
                                    {activeTab === 'all' ? 'Master Vault' : activeTab + ' Archives'}
                                </h1>
                            </div>
                            <div className="text-left sm:text-right">
                                <div className="text-[8px] md:text-[10px] uppercase tracking-widest text-muted-foreground mb-1">Record Count</div>
                                <span className="font-mono text-lg md:text-xl text-primary">{filteredItems.length.toString().padStart(2, '0')}</span>
                            </div>
                        </div>

                        {filteredItems.length === 0 ? (
                            <div className="flex flex-col items-center justify-center min-h-[50vh] border border-white/5 rounded-sm bg-black/40 backdrop-blur-sm relative overflow-hidden group">
                                <div className="absolute inset-0 cyber-grid opacity-10" />
                                <div className="bg-primary/5 p-6 rounded-sm border border-primary/20 mb-4 shadow-[0_0_30px_rgba(255,176,0,0.05)]">
                                    <Search className="w-8 h-8 md:w-10 md:h-10 text-primary/40" />
                                </div>
                                <p className="text-[10px] md:text-xs uppercase tracking-[0.3em] font-bold text-muted-foreground">No Records Found</p>
                                {search ? <p className="text-[8px] md:text-[10px] uppercase opacity-40 mt-2">Adjust search parameters</p> : <p className="text-[8px] md:text-[10px] uppercase opacity-40 mt-2">Initialize directory by adding a record</p>}
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                                {filteredItems.map(item => (
                                    <div
                                        key={item.id}
                                        onClick={() => setViewingItem(item)}
                                        className="p-4 border border-white/10 rounded-sm bg-black/40 backdrop-blur-sm hover:bg-black/60 hover:border-primary/50 transition-all cursor-pointer group relative overflow-hidden shadow-xl"
                                    >
                                        {/* Card Edge Glow */}
                                        <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-primary/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />

                                        <div className="flex justify-between items-start mb-6">
                                            <div className={cn(
                                                "p-2 rounded-sm ring-1 ring-inset ring-white/10 shadow-inner group-hover:ring-primary/40 transition-all",
                                                item.type === 'login' && "text-blue-400 bg-blue-400/5",
                                                item.type === 'card' && "text-purple-400 bg-purple-400/5",
                                                item.type === 'note' && "text-amber-400 bg-amber-400/5",
                                                item.type === 'id' && "text-green-400 bg-green-400/5",
                                            )}>
                                                {item.type === 'login' && <User className="w-5 h-5 md:w-5 md:h-5" />}
                                                {item.type === 'card' && <CreditCard className="w-5 h-5 md:w-5 md:h-5" />}
                                                {item.type === 'note' && <FileText className="w-5 h-5 md:w-5 md:h-5" />}
                                                {item.type === 'id' && <Shield className="w-5 h-5 md:w-5 md:h-5" />}
                                            </div>
                                            <span className="text-[8px] md:text-[9px] font-mono text-muted-foreground uppercase tracking-widest bg-white/5 px-2 py-0.5 rounded-sm">
                                                {new Date(item.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: '2-digit' })}
                                            </span>
                                        </div>

                                        <h3 className="font-bold text-xs md:text-sm uppercase tracking-wider truncate mb-1 group-hover:text-primary transition-colors">{item.data.name || "UNNAMED RECORD"}</h3>
                                        <p className="text-[9px] md:text-[10px] font-mono text-muted-foreground truncate opacity-60 tracking-tight">
                                            {item.type === 'login' ? item.data.username : item.type === 'card' ? `•••• ${item.data.number?.slice(-4) || ''}` : item.type === 'id' ? item.data.number : "SECURE_BLOB.DAT"}
                                        </p>

                                        {/* Bottom Status bar */}
                                        <div className="mt-4 pt-3 border-t border-white/5 flex items-center justify-between">
                                            <div className="flex space-x-1">
                                                <div className="w-1 h-1 rounded-full bg-primary/40" />
                                                <div className="w-1 h-1 rounded-full bg-primary/20" />
                                                <div className="w-1 h-1 rounded-full bg-primary/10" />
                                            </div>
                                            <span className="text-[7px] md:text-[8px] font-bold text-primary/40 uppercase tracking-widest">Encr Mode: AES-GCM</span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )
                        }
                    </div >
                )
                }
            </main >

            {/* Modals */}
            < NewItemModal
                isOpen={isAddOpen}
                onClose={() => { setIsAddOpen(false); setEditingItem(null); }}
                onSave={handleSaveItem}
                initialData={editingItem}
            />

            <ViewItemModal
                item={viewingItem}
                onClose={() => setViewingItem(null)}
                onDelete={handleDeleteItem}
                onEdit={handleEditItem}
            />

            {/* Clipboard Status Overlay */}
            {
                clipboardStatus && (
                    <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-[100] animate-in slide-in-from-bottom-5 duration-300">
                        <div className="bg-primary px-4 py-2 rounded-sm border border-black/20 shadow-[0_0_30px_rgba(255,176,0,0.3)] flex items-center space-x-4">
                            <div className="flex items-center space-x-2">
                                <div className="w-2 h-2 bg-black rounded-full animate-pulse" />
                                <span className="text-[10px] font-black uppercase text-black tracking-widest">Active Clipboard</span>
                            </div>
                            <div className="h-4 w-[1px] bg-black/20" />
                            <span className="text-[10px] font-mono font-bold text-black uppercase">
                                Clearing in <span className="text-sm">{clipboardStatus.timeLeft}s</span>
                            </span>
                            <Button
                                variant="ghost"
                                size="sm"
                                className="h-6 px-2 text-[8px] border border-black/20 hover:bg-black/10 text-black font-black uppercase"
                                onClick={() => useVaultStore.getState().setClipboardStatus(null)}
                            >
                                Abstain
                            </Button>
                        </div>
                    </div>
                )
            }
            <PanicOverlay isTriggered={isPanicking} />
        </div >
    );
}

function SidebarItem({ icon, label, active, onClick, count }: any) {
    return (
        <button
            onClick={onClick}
            className={cn(
                "w-full flex items-center justify-between px-3 py-2 rounded-sm text-xs font-bold uppercase tracking-[0.15em] transition-all group relative overflow-hidden",
                active ? "text-primary bg-primary/10 border-r-2 border-primary shadow-[0_0_20px_rgba(255,176,0,0.05)]" : "text-muted-foreground hover:bg-white/5 hover:text-foreground"
            )}
        >
            <div className="flex items-center space-x-3 relative z-10">
                <div className={cn("transition-colors", active ? "text-primary" : "group-hover:text-primary/70")}>
                    {icon}
                </div>
                <span>{label}</span>
            </div>
            {count > 0 && (
                <span className={cn(
                    "text-[10px] font-mono px-2 py-0.5 rounded-sm transition-colors",
                    active ? "bg-primary text-black" : "bg-white/5 text-muted-foreground group-hover:bg-white/10"
                )}>
                    {count.toString().padStart(2, '0')}
                </span>
            )}

            {/* Hover Glitch Effect Background */}
            <div className="absolute inset-0 bg-primary/5 translate-x-[-100%] group-hover:translate-x-0 transition-transform duration-300" />
        </button>
    )
}
