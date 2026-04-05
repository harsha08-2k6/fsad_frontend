"use client";
import { useEffect, useState } from "react";
import { ShieldCheck, CheckCircle, XCircle, Loader2, UserX } from "lucide-react";

export default function PendingAdminsPage() {
    const [admins, setAdmins] = useState([]);
    const [loading, setLoading] = useState(true);
    const [processingId, setProcessingId] = useState(null);

    useEffect(() => {
        fetchPendingAdmins();
    }, []);

    const fetchPendingAdmins = async () => {
        try {
            const res = await fetch("/api/superadmin/admins/pending");
            if (res.ok) {
                const data = await res.json();
                setAdmins(data);
            }
        } catch (error) {
            console.error("Failed to fetch pending admins:", error);
        } finally {
            setLoading(false);
        }
    };

    const handleAction = async (userId, action) => {
        setProcessingId(userId);
        try {
            const res = await fetch("/api/users/approve", {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ userId, action }),
            });
            if (res.ok) {
                setAdmins(admins.filter(a => a.id !== userId));
            }
        } catch (error) {
            console.error(`Failed to ${action} admin:`, error);
        } finally {
            setProcessingId(null);
        }
    };

    return (
        <div className="space-y-8 animate-in fade-in duration-500">
            <div className="page-header mb-8">
                <h1 className="page-title flex items-center gap-3">
                    <ShieldCheck className="w-8 h-8 text-indigo-600" />
                    Admin Requests
                </h1>
                <p className="page-subtitle">Super Admin: Review and approve new admin access requests.</p>
            </div>

            <div className="content-card">
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead>
                            <tr className="bg-gray-50/50">
                                <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Admin Name</th>
                                <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Email</th>
                                <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Requested</th>
                                <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {loading ? (
                                <tr>
                                    <td colSpan="4" className="px-6 py-12 text-center text-gray-500">
                                        <Loader2 className="w-8 h-8 animate-spin mx-auto mb-2 text-indigo-500" />
                                        Loading requests...
                                    </td>
                                </tr>
                            ) : admins.length === 0 ? (
                                <tr>
                                    <td colSpan="4" className="px-6 py-24 text-center">
                                        <div className="flex flex-col items-center justify-center opacity-40">
                                            <UserX className="w-12 h-12 mb-3" />
                                            <p className="text-lg font-medium">No pending admin requests</p>
                                        </div>
                                    </td>
                                </tr>
                            ) : (
                                admins.map((admin) => (
                                    <tr key={admin.id} className="hover:bg-gray-50/30 transition-colors">
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 rounded-full bg-indigo-50 flex items-center justify-center text-indigo-600 font-bold">
                                                    {admin.name[0].toUpperCase()}
                                                </div>
                                                <div className="text-sm font-semibold text-gray-900">{admin.name}</div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-sm text-gray-500">
                                            {admin.email}
                                        </td>
                                        <td className="px-6 py-4 text-sm text-gray-500">
                                            {new Date(admin.created_at || admin.createdAt).toLocaleDateString()}
                                        </td>
                                        <td className="px-6 py-4 text-right space-x-2">
                                            <button
                                                onClick={() => handleAction(admin.id, 'approve')}
                                                disabled={processingId === admin.id}
                                                className="px-4 py-1.5 rounded-lg bg-emerald-50 text-emerald-700 text-xs font-bold hover:bg-emerald-100 transition-colors disabled:opacity-50 inline-flex items-center gap-1.5"
                                            >
                                                <CheckCircle className="w-3.5 h-3.5" />
                                                Approve
                                            </button>
                                            <button
                                                onClick={() => handleAction(admin.id, 'reject')}
                                                disabled={processingId === admin.id}
                                                className="px-4 py-1.5 rounded-lg bg-red-50 text-red-700 text-xs font-bold hover:bg-red-100 transition-colors disabled:opacity-50 inline-flex items-center gap-1.5"
                                            >
                                                <XCircle className="w-3.5 h-3.5" />
                                                Reject
                                            </button>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
