"use client";
import { useEffect, useState } from "react";
import { Users, Trash2, Loader2, Search, Edit2, X, ShieldAlert } from "lucide-react";
import { useToast } from "@/components/ui/toast";

const ROLE_STYLES = {
    super_admin: "bg-purple-100 text-purple-700",
    admin: "bg-indigo-100 text-indigo-700",
    teacher: "bg-emerald-100 text-emerald-700",
    student: "bg-blue-100 text-blue-700",
};

const STATUS_STYLES = {
    active: "bg-green-100 text-green-700",
    pending_teacher_approval: "bg-yellow-100 text-yellow-700",
    pending_admin_approval: "bg-orange-100 text-orange-700",
    pending_superadmin_approval: "bg-red-100 text-red-700",
    rejected: "bg-gray-100 text-gray-500",
};

const STATUS_LABELS = {
    active: "Active",
    pending_teacher_approval: "Pending (Teacher)",
    pending_admin_approval: "Pending (Admin)",
    pending_superadmin_approval: "Pending (SuperAdmin)",
    rejected: "Rejected",
};

export default function UserManagementPage() {
    const { toast } = useToast();
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");
    const [filterRole, setFilterRole] = useState("all");
    const [deletingId, setDeletingId] = useState(null);
    const [editUser, setEditUser] = useState(null); // user being edited
    const [editForm, setEditForm] = useState({ name: "", email: "", password: "", role: "" });
    const [saving, setSaving] = useState(false);
    const [saveError, setSaveError] = useState("");
    const [error, setError] = useState("");

    useEffect(() => { fetchUsers(); }, []);

    const fetchUsers = async () => {
        setLoading(true);
        try {
            const res = await fetch("/api/admin/users");
            if (res.ok) {
                setUsers(await res.json());
            } else {
                setError("Failed to load users. Check your permissions.");
            }
        } catch {
            setError("Network error while fetching users.");
        } finally {
            setLoading(false);
        }
    };

    const openEdit = (user) => {
        setEditUser(user);
        setEditForm({ name: user.name, email: user.email, password: "", role: user.role });
        setSaveError("");
    };

    const closeEdit = () => { setEditUser(null); setSaveError(""); };

    const handleSave = async () => {
        if (!editForm.name.trim() || !editForm.email.trim()) {
            setSaveError("Name and email are required.");
            return;
        }
        setSaving(true);
        setSaveError("");
        try {
            const payload = { userId: editUser.id, name: editForm.name.trim(), email: editForm.email.trim(), role: editForm.role };
            if (editForm.password.trim()) payload.password = editForm.password.trim();

            const res = await fetch("/api/admin/users", {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(payload),
            });
            if (res.ok) {
                const updated = await res.json();
                setUsers(users.map(u => u.id === editUser.id ? { ...u, name: updated.name, email: updated.email, role: updated.role } : u));
                closeEdit();
            } else {
                const d = await res.json();
                setSaveError(d.message || "Failed to save changes.");
            }
        } catch {
            setSaveError("Network error. Please try again.");
        } finally {
            setSaving(false);
        }
    };

    const handleDelete = async (userId, userName) => {
        if (!confirm(`Permanently delete "${userName}"? This cannot be undone.`)) return;
        setDeletingId(userId);
        try {
            const res = await fetch("/api/admin/users", {
                method: "DELETE",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ userId }),
            });
            if (res.ok) {
                setUsers(users.filter(u => u.id !== userId));
                toast({ message: "User deleted successfully.", type: "success" });
            } else {
                const d = await res.json();
                toast({ message: d.message || "Failed to delete user.", type: "error" });
            }
        } catch {
            toast({ message: "Network error. Could not delete user.", type: "error" });
        } finally {
            setDeletingId(null);
        }
    };

    const filteredUsers = users.filter(u => {
        const matchSearch =
            u.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            u.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
            (u.customId && u.customId.toLowerCase().includes(searchTerm.toLowerCase()));
        const matchRole = filterRole === "all" || u.role === filterRole;
        return matchSearch && matchRole;
    });

    return (
        <div className="space-y-8 animate-in fade-in duration-500">
            <div className="page-header mb-8">
                <h1 className="page-title flex items-center gap-3">
                    <Users className="w-8 h-8 text-indigo-600" />
                    User Management
                </h1>
                <p className="page-subtitle">View, edit details, or remove users from the system.</p>
            </div>

            {error && (
                <div className="bg-red-50 border border-red-200 text-red-700 px-5 py-3 rounded-xl text-sm flex items-center gap-2">
                    <ShieldAlert className="w-4 h-4 shrink-0" /> {error}
                </div>
            )}

            <div className="content-card">
                {/* Toolbar */}
                <div className="p-5 border-b border-gray-100 flex flex-col sm:flex-row sm:items-center gap-3">
                    <div className="relative flex-1 max-w-sm">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                        <input
                            type="text"
                            placeholder="Search by name or email..."
                            className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                    <select
                        className="text-sm border border-gray-200 rounded-xl px-3 py-2 bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                        value={filterRole}
                        onChange={(e) => setFilterRole(e.target.value)}
                    >
                        <option value="all">All Roles</option>
                        <option value="super_admin">Super Admin</option>
                        <option value="admin">Admin</option>
                        <option value="teacher">Teacher</option>
                        <option value="student">Student</option>
                    </select>
                    <span className="text-sm text-gray-500 font-medium ml-auto">
                        {filteredUsers.length} user{filteredUsers.length !== 1 ? "s" : ""}
                    </span>
                </div>

                {/* Table */}
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead>
                            <tr className="bg-gray-50/70 border-b border-gray-100">
                                <th className="px-5 py-3.5 text-xs font-bold text-gray-500 uppercase tracking-wider">User</th>
                                <th className="px-5 py-3.5 text-xs font-bold text-gray-500 uppercase tracking-wider">Role</th>
                                <th className="px-5 py-3.5 text-xs font-bold text-gray-500 uppercase tracking-wider">Status</th>
                                <th className="px-5 py-3.5 text-xs font-bold text-gray-500 uppercase tracking-wider">Joined</th>
                                <th className="px-5 py-3.5 text-xs font-bold text-gray-500 uppercase tracking-wider text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {loading ? (
                                <tr>
                                    <td colSpan="5" className="px-6 py-16 text-center text-gray-400">
                                        <Loader2 className="w-7 h-7 animate-spin mx-auto mb-2 text-indigo-500" />
                                        Loading users...
                                    </td>
                                </tr>
                            ) : filteredUsers.length === 0 ? (
                                <tr>
                                    <td colSpan="5" className="px-6 py-16 text-center text-gray-400">
                                        No users found.
                                    </td>
                                </tr>
                            ) : (
                                filteredUsers.map((user) => (
                                    <tr key={user.id} className="hover:bg-gray-50/40 transition-colors">
                                        {/* User */}
                                        <td className="px-5 py-4">
                                            <div className="flex items-center gap-3">
                                                <div className="w-9 h-9 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white font-bold text-sm shrink-0">
                                                    {user.name[0].toUpperCase()}
                                                </div>
                                                <div>
                                                    <div className="text-sm font-semibold text-gray-900">{user.name}</div>
                                                    <div className="text-xs text-gray-400">{user.email}</div>
                                                    {user.customId && <div className="text-[10px] font-mono text-indigo-500 mt-0.5">ID: {user.customId}</div>}
                                                </div>
                                            </div>
                                        </td>
                                        {/* Role */}
                                        <td className="px-5 py-4">
                                            <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${ROLE_STYLES[user.role] || "bg-gray-100 text-gray-600"}`}>
                                                {user.role?.replace(/_/g, " ").replace(/\b\w/g, c => c.toUpperCase())}
                                            </span>
                                        </td>
                                        {/* Status */}
                                        <td className="px-5 py-4">
                                            <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${STATUS_STYLES[user.status] || "bg-gray-100 text-gray-500"}`}>
                                                {STATUS_LABELS[user.status] || user.status}
                                            </span>
                                        </td>
                                        {/* Joined */}
                                        <td className="px-5 py-4 text-sm text-gray-400">
                                            {new Date(user.created_at || user.createdAt).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" })}
                                        </td>
                                        {/* Actions */}
                                        <td className="px-5 py-4 text-right">
                                            <div className="flex items-center justify-end gap-1">
                                                <button
                                                    onClick={() => openEdit(user)}
                                                    className="p-2 rounded-lg text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 transition-colors"
                                                    title="Edit user details"
                                                >
                                                    <Edit2 className="w-4 h-4" />
                                                </button>
                                                <button
                                                    onClick={() => handleDelete(user.id, user.name)}
                                                    disabled={deletingId === user.id}
                                                    className="p-2 rounded-lg text-gray-400 hover:text-red-600 hover:bg-red-50 transition-colors disabled:opacity-40"
                                                    title="Delete user"
                                                >
                                                    {deletingId === user.id
                                                        ? <Loader2 className="w-4 h-4 animate-spin" />
                                                        : <Trash2 className="w-4 h-4" />}
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* ── Edit Modal ── */}
            {editUser && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: "rgba(0,0,0,0.45)", backdropFilter: "blur(4px)" }}>
                    <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md animate-in fade-in zoom-in-95 duration-200">
                        {/* Header */}
                        <div className="flex items-center justify-between px-6 py-5 border-b border-gray-100">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white font-bold">
                                    {editUser.name[0].toUpperCase()}
                                </div>
                                <div>
                                    <p className="font-semibold text-gray-900 text-sm">Edit User Details</p>
                                    <p className="text-xs text-gray-400">{editUser.email}</p>
                                </div>
                            </div>
                            <button onClick={closeEdit} className="p-1.5 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors">
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        {/* Form */}
                        <div className="px-6 py-5 space-y-4">
                            <div>
                                <label className="block text-xs font-semibold text-gray-600 mb-1.5">Full Name</label>
                                <input
                                    type="text"
                                    className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
                                    value={editForm.name}
                                    onChange={(e) => setEditForm(f => ({ ...f, name: e.target.value }))}
                                    placeholder="Full name"
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-semibold text-gray-600 mb-1.5">Email Address</label>
                                <input
                                    type="email"
                                    className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
                                    value={editForm.email}
                                    onChange={(e) => setEditForm(f => ({ ...f, email: e.target.value }))}
                                    placeholder="Email address"
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-semibold text-gray-600 mb-1.5">Role</label>
                                <select
                                    className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all bg-white"
                                    value={editForm.role}
                                    onChange={(e) => setEditForm(f => ({ ...f, role: e.target.value }))}
                                >
                                    <option value="student">Student</option>
                                    <option value="teacher">Teacher</option>
                                    <option value="admin">Admin</option>
                                    <option value="super_admin">Super Admin</option>
                                </select>
                            </div>
                            <div>
                                <label className="block text-xs font-semibold text-gray-600 mb-1.5">
                                    New Password <span className="text-gray-400 font-normal">(leave blank to keep current)</span>
                                </label>
                                <input
                                    type="password"
                                    className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
                                    value={editForm.password}
                                    onChange={(e) => setEditForm(f => ({ ...f, password: e.target.value }))}
                                    placeholder="••••••••"
                                />
                            </div>

                            {saveError && (
                                <p className="text-xs text-red-600 bg-red-50 rounded-lg px-3 py-2">{saveError}</p>
                            )}
                        </div>

                        {/* Footer */}
                        <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-gray-100">
                            <button
                                onClick={closeEdit}
                                className="px-4 py-2 text-sm font-medium text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-xl transition-colors"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleSave}
                                disabled={saving}
                                className="px-5 py-2 text-sm font-semibold bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 disabled:opacity-60 transition-colors flex items-center gap-2"
                            >
                                {saving && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                                Save Changes
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
