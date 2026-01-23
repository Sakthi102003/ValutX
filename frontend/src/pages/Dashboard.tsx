import { useEffect, useState } from 'react';
import { useVaultStore } from '../store/vaultStore';
import type { VaultItemType, DecryptedVaultItem } from '../store/vaultStore';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Lock, LogOut, Plus, Search, CreditCard, Key, FileText, User, ShieldAlert, Shield, Settings } from 'lucide-react';
import { cn } from '../lib/utils';
import NewItemModal from '../components/NewItemModal';
import ViewItemModal from '../components/ViewItemModal';
import SettingsPage from './SettingsPage';

export default function Dashboard() {
    const { logout, panicLock, decryptedItems, addItem, updateItem, deleteItem, fetchItems, userEmail } = useVaultStore();
    const [activeTab, setActiveTab] = useState<VaultItemType | 'all'>('all');
    const [view, setView] = useState<'items' | 'settings'>('items');
    const [search, setSearch] = useState('');

    const [isAddOpen, setIsAddOpen] = useState(false);
    const [viewingItem, setViewingItem] = useState<DecryptedVaultItem | null>(null);
    const [editingItem, setEditingItem] = useState<DecryptedVaultItem | null>(null);

    // Initial Fetch
    // We should fetch if list is empty? Or always on mount?
    // Since decryptedItems might be empty on reload (handled by persist usually, or re-fetch).
    // Our store holds them in RAM. If we are authenticated, we should have them or fetch them.
    // Let's fetch on mount if empty.
    useEffect(() => {
        if (decryptedItems.length === 0) {
            fetchItems();
        }
    }, [fetchItems, decryptedItems.length]);

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
        <div className="flex h-screen bg-background overflow-hidden font-sans">
            {/* Sidebar */}
            <aside className="w-64 border-r border-white/5 bg-card/30 backdrop-blur-md flex flex-col p-4 space-y-4 shadow-xl z-20">
                <div className="flex items-center space-x-3 px-2 py-2 mb-4">
                    <div className="bg-primary/20 p-2 rounded-lg ring-1 ring-primary/30"><Lock className="w-5 h-5 text-primary" /></div>
                    <span className="font-bold text-lg tracking-tight">ValutX</span>
                </div>

                <div className="px-2 pb-4 border-b border-white/5 mb-2">
                    <div className="flex items-center space-x-2 text-xs text-muted-foreground bg-secondary/30 p-2 rounded-md">
                        <User className="w-3 h-3" />
                        <span className="truncate">{userEmail}</span>
                    </div>
                </div>

                <nav className="flex-1 space-y-1">
                    <SidebarItem icon={<Key className="w-4 h-4" />} label="All Items" active={view === 'items' && activeTab === 'all'} onClick={() => { setView('items'); setActiveTab('all'); }} count={decryptedItems.length} />
                    <SidebarItem icon={<User className="w-4 h-4" />} label="Logins" active={view === 'items' && activeTab === 'login'} onClick={() => { setView('items'); setActiveTab('login'); }} count={decryptedItems.filter(i => i.type === 'login').length} />
                    <SidebarItem icon={<CreditCard className="w-4 h-4" />} label="Cards" active={view === 'items' && activeTab === 'card'} onClick={() => { setView('items'); setActiveTab('card'); }} count={decryptedItems.filter(i => i.type === 'card').length} />
                    <SidebarItem icon={<FileText className="w-4 h-4" />} label="Notes" active={view === 'items' && activeTab === 'note'} onClick={() => { setView('items'); setActiveTab('note'); }} count={decryptedItems.filter(i => i.type === 'note').length} />
                </nav>

                <div className="px-2 py-2">
                    <SidebarItem
                        icon={<Settings className="w-4 h-4" />}
                        label="Settings"
                        active={view === 'settings'}
                        onClick={() => setView('settings')}
                        count={0}
                    />
                </div>

                <div className="pt-4 border-t border-white/5 space-y-2">
                    <Button variant="ghost" className="w-full justify-start hover:bg-red-500/10 hover:text-red-400 group transition-all" onClick={panicLock}>
                        <ShieldAlert className="w-4 h-4 mr-2 group-hover:text-red-400" /> Panic Lock
                    </Button>
                    <Button variant="ghost" className="w-full justify-start hover:bg-white/5" onClick={logout}>
                        <LogOut className="w-4 h-4 mr-2" /> Log Out
                    </Button>
                </div>
            </aside>

            {/* Main Content */}
            <main className="flex-1 flex flex-col overflow-hidden relative">
                {/* Decorative background */}
                <div className="absolute top-0 left-0 w-full h-full overflow-hidden -z-10 opacity-5 pointer-events-none">
                    <div className="absolute top-[10%] right-[10%] w-[40%] h-[40%] bg-primary/30 rounded-full blur-[100px]" />
                </div>

                {/* Header */}
                <header className="h-20 border-b border-white/5 flex items-center justify-between px-8 bg-card/10 backdrop-blur-sm z-10">
                    <div className="w-96">
                        <div className="relative group">
                            <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
                            <Input
                                placeholder="Search your vault..."
                                className="pl-10 bg-secondary/30 border-transparent focus:bg-background focus:ring-1 focus:ring-primary/50 transition-all h-10 shadow-inner"
                                value={search}
                                onChange={e => setSearch(e.target.value)}
                            />
                        </div>
                    </div>
                    <Button size="lg" className="bg-primary hover:bg-primary/90 shadow-lg shadow-primary/20 transition-all hover:scale-105 active:scale-95" onClick={() => setIsAddOpen(true)}>
                        <Plus className="w-5 h-5 mr-2" /> Add Item
                    </Button>
                </header>

                {/* Scrollable Content */}
                {view === 'settings' ? (
                    <div className="flex-1 overflow-auto scrollbar-hide">
                        <SettingsPage />
                    </div>
                ) : (
                    <div className="flex-1 overflow-auto p-8 scrollbar-hide">
                        <div className="flex items-center justify-between mb-6">
                            <h2 className="text-2xl font-bold capitalize tracking-tight text-white/90">
                                {activeTab === 'all' ? 'All Items' : activeTab + 's'}
                            </h2>
                            <span className="text-muted-foreground text-sm">{filteredItems.length} items</span>
                        </div>

                        {filteredItems.length === 0 ? (
                            <div className="flex flex-col items-center justify-center h-96 text-muted-foreground border-2 border-dashed border-white/5 rounded-2xl bg-white/5">
                                <div className="bg-secondary/50 p-4 rounded-full mb-4">
                                    <Search className="w-8 h-8 opacity-50" />
                                </div>
                                <p className="text-lg font-medium">No items found</p>
                                {search ? <p className="text-sm opacity-50">Try a different search term</p> : <p className="text-sm opacity-50">Add your first item to get started</p>}
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                                {filteredItems.map(item => (
                                    <div
                                        key={item.id}
                                        onClick={() => setViewingItem(item)}
                                        className="p-5 border border-white/5 rounded-2xl bg-card/40 backdrop-blur-sm hover:bg-card/60 hover:border-primary/30 transition-all cursor-pointer group shadow-lg hover:shadow-primary/5 relative overflow-hidden"
                                    >
                                        <div className="absolute top-0 right-0 p-2 bg-gradient-to-bl from-white/5 to-transparent rounded-bl-2xl opacity-0 group-hover:opacity-100 transition-opacity">
                                            <span className="sr-only">View</span>
                                        </div>

                                        <div className="flex justify-between items-start mb-4">
                                            <div className={cn(
                                                "p-3 rounded-xl ring-1 ring-inset ring-white/10 shadow-inner",
                                                item.type === 'login' && "bg-blue-500/10 text-blue-400",
                                                item.type === 'card' && "bg-purple-500/10 text-purple-400",
                                                item.type === 'note' && "bg-yellow-500/10 text-yellow-400",
                                                item.type === 'id' && "bg-green-500/10 text-green-400",
                                            )}>
                                                {item.type === 'login' && <User className="w-6 h-6" />}
                                                {item.type === 'card' && <CreditCard className="w-6 h-6" />}
                                                {item.type === 'note' && <FileText className="w-6 h-6" />}
                                                {item.type === 'id' && <Shield className="w-6 h-6" />}
                                            </div>
                                            <span className="text-[10px] text-muted-foreground bg-secondary/50 px-2 py-1 rounded-full">{new Date(item.createdAt).toLocaleDateString()}</span>
                                        </div>
                                        <h3 className="font-semibold text-lg truncate pr-2 mb-1 group-hover:text-primary transition-colors">{item.data.name || "Untitled"}</h3>
                                        <p className="text-sm text-muted-foreground truncate font-mono opacity-70">
                                            {item.type === 'login' ? item.data.username : item.type === 'card' ? `•••• ${item.data.number?.slice(-4) || ''}` : item.type === 'id' ? item.data.number : "Secure Note"}
                                        </p>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                )}
            </main>

            {/* Modals */}
            <NewItemModal
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
        </div>
    );
}

function SidebarItem({ icon, label, active, onClick, count }: any) {
    return (
        <button
            onClick={onClick}
            className={cn(
                "w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-sm font-medium transition-all group",
                active ? "bg-primary/10 text-primary shadow-sm" : "text-muted-foreground hover:bg-white/5 hover:text-foreground"
            )}
        >
            <div className="flex items-center space-x-3">
                {icon}
                <span>{label}</span>
            </div>
            {count > 0 && <span className={cn("text-xs px-2 py-0.5 rounded-full bg-secondary/50 group-hover:bg-secondary transition-colors", active && "bg-primary/20 text-primary")}>{count}</span>}
        </button>
    )
}
