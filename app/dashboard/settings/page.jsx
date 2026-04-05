"use client";
import { useState } from "react";
import { useSession } from "next-auth/react";
import { ShieldCheck, KeyRound, Lock, Eye, EyeOff, Loader2, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/components/ui/toast";

export default function SettingsPage() {
    const { data: session } = useSession();
    const { toast } = useToast();
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState(false);

    const [formData, setFormData] = useState({
        currentPassword: "",
        newPassword: "",
        confirmPassword: ""
    });

    const [showPasswords, setShowPasswords] = useState({
        current: false,
        new: false,
        confirm: false
    });

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (formData.newPassword !== formData.confirmPassword) {
            toast({ message: "New passwords do not match", type: "error" });
            return;
        }

        if (formData.newPassword.length < 6) {
            toast({ message: "Password must be at least 6 characters", type: "error" });
            return;
        }

        setLoading(true);
        try {
            const res = await fetch("/api/user/change-password", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    currentPassword: formData.currentPassword,
                    newPassword: formData.newPassword
                })
            });

            const data = await res.json();

            if (res.ok) {
                setSuccess(true);
                setFormData({ currentPassword: "", newPassword: "", confirmPassword: "" });
                toast({ message: "Password changed successfully!", type: "success" });
                setTimeout(() => setSuccess(false), 5000);
            } else {
                toast({ message: data.message || "Failed to update password", type: "error" });
            }
        } catch (error) {
            toast({ message: "An unexpected error occurred", type: "error" });
        } finally {
            setLoading(false);
        }
    };

    const togglePassword = (field) => {
        setShowPasswords(prev => ({ ...prev, [field]: !prev[field] }));
    };

    return (
        <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in duration-700">
            {/* Header */}
            <div className="page-header flex justify-between items-end mb-8">
                <div>
                    <h1 className="page-title flex items-center gap-3">
                        <ShieldCheck className="w-8 h-8 text-indigo-600" />
                        Account Settings
                    </h1>
                    <p className="page-subtitle">Manage your account security and authentication preferences.</p>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                {/* Information Side */}
                <div className="space-y-6">
                    <div className="content-card p-6 border-l-4 border-l-indigo-500 bg-indigo-50/30">
                        <h3 className="font-bold text-indigo-900 mb-2 flex items-center gap-2">
                            <KeyRound className="w-4 h-4" />
                            Security Tip
                        </h3>
                        <p className="text-sm text-indigo-700 leading-relaxed text-balance">
                            Use a strong password with at least 8 characters, including numbers and symbols to keep your account secure.
                        </p>
                    </div>

                    <div className="content-card p-6">
                        <h3 className="font-bold text-gray-900 mb-4 text-sm uppercase tracking-wider">Account Info</h3>
                        <div className="space-y-4">
                            <div>
                                <p className="text-[10px] font-bold text-gray-400 uppercase">Logged in as</p>
                                <p className="text-sm font-semibold text-gray-700">{session?.user?.name}</p>
                            </div>
                            <div>
                                <p className="text-[10px] font-bold text-gray-400 uppercase">Role</p>
                                <span className="text-[11px] font-bold px-2 py-0.5 bg-gray-100 rounded text-gray-600 uppercase tracking-tighter shadow-sm">
                                    {session?.user?.role?.replace('_', ' ')}
                                </span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Change Password Form */}
                <div className="md:col-span-2">
                    <div className="content-card overflow-hidden border-indigo-100 shadow-xl shadow-indigo-100/20">
                        <div className="p-6 border-b border-gray-100 bg-gray-50/50 flex items-center justify-between">
                            <h2 className="font-bold text-gray-800 flex items-center gap-2">
                                <Lock className="w-5 h-5 text-indigo-500" />
                                Change Password
                            </h2>
                            {success && (
                                <span className="flex items-center gap-1.5 text-xs font-bold text-emerald-600 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-100 animate-in slide-in-from-right-4">
                                    <CheckCircle2 className="w-3.5 h-3.5" />
                                    Updated Successfully
                                </span>
                            )}
                        </div>

                        <form onSubmit={handleSubmit} className="p-8 space-y-6">
                            {/* Current Password */}
                            <div className="space-y-2">
                                <Label htmlFor="currentPassword text-xs font-bold text-gray-500 uppercase">Current Password</Label>
                                <div className="relative group">
                                    <Input
                                        id="currentPassword"
                                        type={showPasswords.current ? "text" : "password"}
                                        placeholder="••••••••"
                                        className="pr-12 bg-gray-50/30 border-gray-200 focus:bg-white transition-all rounded-xl h-11"
                                        value={formData.currentPassword}
                                        onChange={(e) => setFormData({ ...formData, currentPassword: e.target.value })}
                                        required
                                    />
                                    <button
                                        type="button"
                                        onClick={() => togglePassword('current')}
                                        className="absolute right-3 top-1/2 -translate-y-1/2 p-1.5 text-gray-400 hover:text-indigo-500 transition-colors"
                                    >
                                        {showPasswords.current ? <EyeOff size={18} /> : <Eye size={18} />}
                                    </button>
                                </div>
                            </div>

                            <hr className="border-gray-100" />

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                                {/* New Password */}
                                <div className="space-y-2">
                                    <Label htmlFor="newPassword text-xs font-bold text-gray-500 uppercase">New Password</Label>
                                    <div className="relative">
                                        <Input
                                            id="newPassword"
                                            type={showPasswords.new ? "text" : "password"}
                                            placeholder="••••••••"
                                            className="pr-12 bg-gray-50/30 border-gray-200 focus:bg-white transition-all rounded-xl h-11"
                                            value={formData.newPassword}
                                            onChange={(e) => setFormData({ ...formData, newPassword: e.target.value })}
                                            required
                                        />
                                        <button
                                            type="button"
                                            onClick={() => togglePassword('new')}
                                            className="absolute right-3 top-1/2 -translate-y-1/2 p-1.5 text-gray-400 hover:text-indigo-500 transition-colors"
                                        >
                                            {showPasswords.new ? <EyeOff size={18} /> : <Eye size={18} />}
                                        </button>
                                    </div>
                                </div>

                                {/* Confirm Password */}
                                <div className="space-y-2">
                                    <Label htmlFor="confirmPassword text-xs font-bold text-gray-500 uppercase">Confirm New Password</Label>
                                    <div className="relative">
                                        <Input
                                            id="confirmPassword"
                                            type={showPasswords.confirm ? "text" : "password"}
                                            placeholder="••••••••"
                                            className="pr-12 bg-gray-50/30 border-gray-200 focus:bg-white transition-all rounded-xl h-11"
                                            value={formData.confirmPassword}
                                            onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                                            required
                                        />
                                        <button
                                            type="button"
                                            onClick={() => togglePassword('confirm')}
                                            className="absolute right-3 top-1/2 -translate-y-1/2 p-1.5 text-gray-400 hover:text-indigo-500 transition-colors"
                                        >
                                            {showPasswords.confirm ? <EyeOff size={18} /> : <Eye size={18} />}
                                        </button>
                                    </div>
                                </div>
                            </div>

                            <div className="pt-4 flex justify-end">
                                <Button
                                    type="submit"
                                    disabled={loading}
                                    className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold px-8 py-6 rounded-xl shadow-lg shadow-indigo-200 transition-all hover:scale-[1.02] active:scale-95 disabled:opacity-70 h-12"
                                >
                                    {loading ? (
                                        <>
                                            <Loader2 className="w-4 h-4 animate-spin mr-2" />
                                            Updating...
                                        </>
                                    ) : (
                                        "Update Password"
                                    )}
                                </Button>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        </div>
    );
}
