import { useState } from 'react';
import { useVaultStore } from '../store/vaultStore';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Label } from '../components/ui/Label';
import { ShieldCheck, AlertTriangle } from 'lucide-react';

export default function SettingsPage() {
    const { changeMasterPassword, userEmail, isLoading, error, setError } = useVaultStore();
    const [oldPass, setOldPass] = useState('');
    const [newPass, setNewPass] = useState('');
    const [confirmPass, setConfirmPass] = useState('');
    const [successMsg, setSuccessMsg] = useState<string | null>(null);

    const handleChangePassword = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);
        setSuccessMsg(null);

        if (newPass !== confirmPass) {
            setError("New passwords do not match.");
            return;
        }

        if (newPass.length < 8) {
            setError("New password must be at least 8 characters.");
            return;
        }

        const success = await changeMasterPassword(oldPass, newPass);
        if (success) {
            setSuccessMsg("Master Password updated successfully!");
            setOldPass('');
            setNewPass('');
            setConfirmPass('');
        }
    };

    return (
        <div className="p-8 max-w-4xl mx-auto animate-in fade-in duration-500">
            <h2 className="text-3xl font-bold mb-8 flex items-center">
                <ShieldCheck className="w-8 h-8 mr-3 text-primary" />
                Security Settings
            </h2>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Profile Info */}
                <div className="bg-card/30 backdrop-blur-sm border border-white/5 rounded-xl p-6">
                    <h3 className="text-xl font-semibold mb-4 text-white/90">Account Information</h3>
                    <div className="space-y-4">
                        <div>
                            <Label className="text-muted-foreground">Email Address</Label>
                            <div className="p-3 bg-secondary/30 rounded-md border border-white/5 font-mono text-sm mt-1">
                                {userEmail}
                            </div>
                        </div>
                        <div className="p-4 bg-yellow-500/10 border border-yellow-500/20 rounded-lg flex items-start space-x-3 text-yellow-200/80 text-sm">
                            <AlertTriangle className="w-5 h-5 shrink-0" />
                            <p>
                                Your Master Password is the key to your vault. We cannot recover it if you forget it.
                            </p>
                        </div>
                    </div>
                </div>

                {/* Change Password */}
                <div className="bg-card/40 backdrop-blur-md border border-white/10 rounded-xl p-6 shadow-xl">
                    <h3 className="text-xl font-semibold mb-6 text-white/90">Change Master Password</h3>

                    <form onSubmit={handleChangePassword} className="space-y-4">
                        <div className="space-y-2">
                            <Label>Current Password</Label>
                            <Input
                                type="password"
                                value={oldPass}
                                onChange={e => setOldPass(e.target.value)}
                                placeholder="Enter current master password"
                                required
                            />
                        </div>
                        <div className="space-y-2">
                            <Label>New Password</Label>
                            <Input
                                type="password"
                                value={newPass}
                                onChange={e => setNewPass(e.target.value)}
                                placeholder="Enter new strong password"
                                required
                            />
                        </div>
                        <div className="space-y-2">
                            <Label>Confirm New Password</Label>
                            <Input
                                type="password"
                                value={confirmPass}
                                onChange={e => setConfirmPass(e.target.value)}
                                placeholder="Repeat new password"
                                required
                            />
                        </div>

                        {error && <div className="text-red-400 text-sm p-2 bg-red-400/10 rounded border border-red-400/20">{error}</div>}
                        {successMsg && <div className="text-green-400 text-sm p-2 bg-green-400/10 rounded border border-green-400/20">{successMsg}</div>}

                        <Button type="submit" className="w-full" disabled={isLoading}>
                            {isLoading ? "Encrypting & Updating..." : "Update Master Password"}
                        </Button>
                    </form>
                </div>
            </div>
        </div>
    );
}
