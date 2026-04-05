"use client";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/components/ui/toast";
import {
    Megaphone, Pencil, Trash2, X, Loader2,
    CalendarDays, Users, BookOpen, GraduationCap, CheckCircle2
} from "lucide-react";

/* ── Target badge config ── */
const TARGET_CONFIG = {
    all: { label: "Everyone", icon: Users, bg: "bg-blue-50", text: "text-blue-700", border: "border-blue-200" },
    teachers: { label: "Teachers", icon: BookOpen, bg: "bg-violet-50", text: "text-violet-700", border: "border-violet-200" },
    students: { label: "Students", icon: GraduationCap, bg: "bg-emerald-50", text: "text-emerald-700", border: "border-emerald-200" },
};

export default function TeacherAnnouncementsPage() {
    const { toast } = useToast();

    /* ── State ── */
    const [announcements, setAnnouncements] = useState([]);
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [newAnnouncement, setNewAnnouncement] = useState({ title: "", content: "", target: "all" });

    /* Edit dialog */
    const [editTarget, setEditTarget] = useState(null); // announcement being edited
    const [editForm, setEditForm] = useState({ title: "", content: "", target: "all" });
    const [editSaving, setEditSaving] = useState(false);

    /* Delete confirm */
    const [deleteTarget, setDeleteTarget] = useState(null); // announcement being deleted
    const [deleting, setDeleting] = useState(false);

    /* ── Data fetching ── */
    useEffect(() => { fetchAnnouncements(); }, []);

    const fetchAnnouncements = async () => {
        setLoading(true);
        try {
            const res = await fetch("/api/announcements");
            const data = await res.json();
            setAnnouncements(Array.isArray(data) ? data : []);
        } catch {
            toast({ message: "Failed to load announcements.", type: "error" });
        } finally {
            setLoading(false);
        }
    };

    /* ── Create ── */
    const handleSubmit = async (e) => {
        e.preventDefault();
        setSubmitting(true);
        try {
            const res = await fetch("/api/announcements", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(newAnnouncement),
            });
            if (res.ok) {
                setNewAnnouncement({ title: "", content: "", target: "all" });
                fetchAnnouncements();
                toast({ message: "Announcement posted successfully!", type: "success" });
            } else {
                const d = await res.json();
                toast({ message: d.message || "Failed to post announcement.", type: "error" });
            }
        } catch {
            toast({ message: "Network error. Please try again.", type: "error" });
        } finally {
            setSubmitting(false);
        }
    };

    /* ── Edit ── */
    const openEdit = (ann) => {
        setEditTarget(ann);
        setEditForm({ title: ann.title, content: ann.content, target: ann.target });
    };

    const handleEdit = async () => {
        if (!editForm.title.trim() || !editForm.content.trim()) {
            toast({ message: "Title and content cannot be empty.", type: "warning" });
            return;
        }
        setEditSaving(true);
        try {
            const res = await fetch(`/api/announcements/${editTarget.id}`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(editForm),
            });
            if (res.ok) {
                setEditTarget(null);
                fetchAnnouncements();
                toast({ message: "Announcement updated successfully!", type: "success" });
            } else {
                const d = await res.json();
                toast({ message: d.message || "Failed to update.", type: "error" });
            }
        } catch {
            toast({ message: "Network error. Please try again.", type: "error" });
        } finally {
            setEditSaving(false);
        }
    };

    /* ── Delete ── */
    const handleDelete = async () => {
        setDeleting(true);
        try {
            const res = await fetch(`/api/announcements/${deleteTarget.id}`, { method: "DELETE" });
            if (res.ok) {
                setDeleteTarget(null);
                setAnnouncements((prev) => prev.filter((a) => a.id !== deleteTarget.id));
                toast({ message: "Announcement deleted.", type: "success" });
            } else {
                const d = await res.json();
                toast({ message: d.message || "Failed to delete.", type: "error" });
            }
        } catch {
            toast({ message: "Network error. Please try again.", type: "error" });
        } finally {
            setDeleting(false);
        }
    };

    /* ── Render ── */
    return (
        <div className="space-y-6 animate-in fade-in duration-500">

            {/* Page Header */}
            <div className="page-header mb-8">
                <h1 className="page-title flex items-center gap-3">
                    <Megaphone className="w-8 h-8 text-blue-500" />
                    Manage Announcements
                </h1>
                <p className="page-subtitle">Post, edit, or delete announcements for your students and colleagues.</p>
            </div>

            {/* ── Create Form ── */}
            <div className="content-card">
                <div className="content-card-header">
                    <h2 className="content-card-title">Post New Announcement</h2>
                </div>
                <div className="content-card-body">
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div>
                            <Label htmlFor="title" className="mb-1.5 block text-sm font-semibold text-gray-700">Title</Label>
                            <Input
                                id="title"
                                placeholder="e.g. Exam schedule changed"
                                value={newAnnouncement.title}
                                onChange={(e) => setNewAnnouncement({ ...newAnnouncement, title: e.target.value })}
                                required
                                className="form-input-styled"
                            />
                        </div>
                        <div>
                            <Label htmlFor="content" className="mb-1.5 block text-sm font-semibold text-gray-700">Content</Label>
                            <Textarea
                                id="content"
                                placeholder="Write the announcement details here..."
                                value={newAnnouncement.content}
                                onChange={(e) => setNewAnnouncement({ ...newAnnouncement, content: e.target.value })}
                                required
                                rows={4}
                                className="form-input-styled resize-none"
                            />
                        </div>
                        <div>
                            <Label className="mb-1.5 block text-sm font-semibold text-gray-700">Target Audience</Label>
                            <Select
                                value={newAnnouncement.target}
                                onValueChange={(value) => setNewAnnouncement({ ...newAnnouncement, target: value })}
                            >
                                <SelectTrigger className="w-48">
                                    <SelectValue placeholder="Select audience" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">Everyone</SelectItem>
                                    <SelectItem value="teachers">Teachers only</SelectItem>
                                    <SelectItem value="students">Students only</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="flex justify-end pt-1">
                            <Button type="submit" disabled={submitting} className="flex items-center gap-2">
                                {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Megaphone className="w-4 h-4" />}
                                {submitting ? "Posting..." : "Post Announcement"}
                            </Button>
                        </div>
                    </form>
                </div>
            </div>

            {/* ── Announcements List ── */}
            <div className="content-card">
                <div className="content-card-header">
                    <h2 className="content-card-title">
                        All Announcements
                        <span className="ml-2 text-sm font-normal text-gray-400">({announcements.length})</span>
                    </h2>
                </div>

                {loading ? (
                    <div className="flex items-center justify-center py-16 gap-3 text-gray-400">
                        <Loader2 className="w-6 h-6 animate-spin text-blue-500" />
                        <span className="font-medium">Loading announcements...</span>
                    </div>
                ) : announcements.length === 0 ? (
                    <div className="py-16 text-center">
                        <Megaphone className="w-10 h-10 text-gray-200 mx-auto mb-3" />
                        <p className="text-gray-400 font-medium">No announcements yet.</p>
                        <p className="text-sm text-gray-300 mt-1">Post one above to get started.</p>
                    </div>
                ) : (
                    <ul className="divide-y divide-gray-100">
                        {announcements.map((ann) => {
                            const cfg = TARGET_CONFIG[ann.target] || TARGET_CONFIG.all;
                            const Icon = cfg.icon;
                            return (
                                <li key={ann.id} className="p-5 hover:bg-gray-50/60 transition-colors group">
                                    <div className="flex items-start justify-between gap-4">
                                        {/* Left — content */}
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center gap-2 mb-1 flex-wrap">
                                                <h3 className="font-semibold text-gray-900 text-base leading-tight">{ann.title}</h3>
                                                <span className={`inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-0.5 rounded-full border ${cfg.bg} ${cfg.text} ${cfg.border}`}>
                                                    <Icon className="w-3 h-3" />
                                                    {cfg.label}
                                                </span>
                                            </div>
                                            <div className="flex items-center gap-1.5 text-xs text-gray-400 mb-2">
                                                <CalendarDays className="w-3.5 h-3.5" />
                                                {new Date(ann.date || ann.created_at || ann.createdAt).toLocaleDateString("en-IN", {
                                                    day: "numeric", month: "short", year: "numeric"
                                                })}
                                            </div>
                                            <p className="text-sm text-gray-600 leading-relaxed line-clamp-3">{ann.content}</p>
                                        </div>

                                        {/* Right — actions */}
                                        <div className="flex items-center gap-1 shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
                                            <button
                                                onClick={() => openEdit(ann)}
                                                title="Edit announcement"
                                                className="p-2 rounded-lg text-gray-400 hover:text-blue-600 hover:bg-blue-50 transition-colors"
                                            >
                                                <Pencil className="w-4 h-4" />
                                            </button>
                                            <button
                                                onClick={() => setDeleteTarget(ann)}
                                                title="Delete announcement"
                                                className="p-2 rounded-lg text-gray-400 hover:text-red-600 hover:bg-red-50 transition-colors"
                                            >
                                                <Trash2 className="w-4 h-4" />
                                            </button>
                                        </div>
                                    </div>
                                </li>
                            );
                        })}
                    </ul>
                )}
            </div>

            {/* ════════════════════════════
                EDIT DIALOG
            ════════════════════════════ */}
            {editTarget && (
                <div
                    className="fixed inset-0 z-50 flex items-center justify-center p-4"
                    style={{ background: "rgba(11,31,58,0.45)", backdropFilter: "blur(4px)" }}
                >
                    <div
                        className="bg-white rounded-2xl shadow-2xl w-full max-w-lg"
                        style={{ animation: "toastSlideIn 0.25s cubic-bezier(0.34,1.56,0.64,1)" }}
                    >
                        {/* Header */}
                        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
                            <div className="flex items-center gap-2">
                                <div className="w-8 h-8 rounded-lg bg-blue-50 flex items-center justify-center">
                                    <Pencil className="w-4 h-4 text-blue-600" />
                                </div>
                                <h3 className="font-bold text-gray-900">Edit Announcement</h3>
                            </div>
                            <button
                                onClick={() => setEditTarget(null)}
                                className="p-1.5 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors"
                            >
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        {/* Body */}
                        <div className="px-6 py-5 space-y-4">
                            <div>
                                <label className="block text-xs font-semibold text-gray-600 mb-1.5">Title</label>
                                <input
                                    type="text"
                                    className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all bg-gray-50 focus:bg-white"
                                    value={editForm.title}
                                    onChange={(e) => setEditForm((f) => ({ ...f, title: e.target.value }))}
                                    placeholder="Announcement title"
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-semibold text-gray-600 mb-1.5">Content</label>
                                <textarea
                                    rows={5}
                                    className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all bg-gray-50 focus:bg-white resize-none"
                                    value={editForm.content}
                                    onChange={(e) => setEditForm((f) => ({ ...f, content: e.target.value }))}
                                    placeholder="Announcement content"
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-semibold text-gray-600 mb-1.5">Target Audience</label>
                                <select
                                    className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all bg-gray-50 focus:bg-white"
                                    value={editForm.target}
                                    onChange={(e) => setEditForm((f) => ({ ...f, target: e.target.value }))}
                                >
                                    <option value="all">Everyone</option>
                                    <option value="teachers">Teachers only</option>
                                    <option value="students">Students only</option>
                                </select>
                            </div>
                        </div>

                        {/* Footer */}
                        <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-gray-100">
                            <button
                                onClick={() => setEditTarget(null)}
                                className="px-4 py-2 text-sm font-medium text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-xl transition-colors"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleEdit}
                                disabled={editSaving}
                                className="px-5 py-2 text-sm font-semibold bg-blue-600 text-white rounded-xl hover:bg-blue-700 disabled:opacity-60 transition-colors flex items-center gap-2"
                            >
                                {editSaving
                                    ? <><Loader2 className="w-3.5 h-3.5 animate-spin" /> Saving...</>
                                    : <><CheckCircle2 className="w-3.5 h-3.5" /> Save Changes</>
                                }
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* ════════════════════════════
                DELETE CONFIRM DIALOG
            ════════════════════════════ */}
            {deleteTarget && (
                <div
                    className="fixed inset-0 z-50 flex items-center justify-center p-4"
                    style={{ background: "rgba(11,31,58,0.45)", backdropFilter: "blur(4px)" }}
                >
                    <div
                        className="bg-white rounded-2xl shadow-2xl w-full max-w-sm"
                        style={{ animation: "toastSlideIn 0.25s cubic-bezier(0.34,1.56,0.64,1)" }}
                    >
                        {/* Header */}
                        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
                            <div className="flex items-center gap-2">
                                <div className="w-8 h-8 rounded-lg bg-red-50 flex items-center justify-center">
                                    <Trash2 className="w-4 h-4 text-red-600" />
                                </div>
                                <h3 className="font-bold text-gray-900">Delete Announcement</h3>
                            </div>
                            <button
                                onClick={() => setDeleteTarget(null)}
                                className="p-1.5 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors"
                            >
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        {/* Body */}
                        <div className="px-6 py-5">
                            <p className="text-sm text-gray-600 leading-relaxed">
                                Are you sure you want to delete{" "}
                                <span className="font-semibold text-gray-900">"{deleteTarget.title}"</span>?
                                This action <span className="text-red-600 font-semibold">cannot be undone</span>.
                            </p>
                        </div>

                        {/* Footer */}
                        <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-gray-100">
                            <button
                                onClick={() => setDeleteTarget(null)}
                                className="px-4 py-2 text-sm font-medium text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-xl transition-colors"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleDelete}
                                disabled={deleting}
                                className="px-5 py-2 text-sm font-semibold bg-red-600 text-white rounded-xl hover:bg-red-700 disabled:opacity-60 transition-colors flex items-center gap-2"
                            >
                                {deleting
                                    ? <><Loader2 className="w-3.5 h-3.5 animate-spin" /> Deleting...</>
                                    : <><Trash2 className="w-3.5 h-3.5" /> Yes, Delete</>
                                }
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
