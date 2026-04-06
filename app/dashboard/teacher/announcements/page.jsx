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
    CalendarDays, Users, BookOpen, GraduationCap, CheckCircle2,
    Plus, Send, MessageSquare, Info, AlertTriangle
} from "lucide-react";

/* ── Target badge config ── */
const TARGET_CONFIG = {
    all: { label: "Everyone", icon: Users, bg: "bg-blue-50", text: "text-blue-700", border: "border-blue-200", gradient: "from-blue-500 to-blue-600" },
    teachers: { label: "Teachers", icon: BookOpen, bg: "bg-violet-50", text: "text-violet-700", border: "border-violet-200", gradient: "from-violet-500 to-violet-600" },
    students: { label: "Students", icon: GraduationCap, bg: "bg-emerald-50", text: "text-emerald-700", border: "border-emerald-200", gradient: "from-emerald-500 to-emerald-600" },
};

export default function TeacherAnnouncementsPage() {
    const { toast } = useToast();

    /* ── State ── */
    const [announcements, setAnnouncements] = useState([]);
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [newAnnouncement, setNewAnnouncement] = useState({ title: "", content: "", target: "all" });
    const [showCreateForm, setShowCreateForm] = useState(false);

    /* Edit dialog */
    const [editTarget, setEditTarget] = useState(null);
    const [editForm, setEditForm] = useState({ title: "", content: "", target: "all" });
    const [editSaving, setEditSaving] = useState(false);

    /* Delete confirm */
    const [deleteTarget, setDeleteTarget] = useState(null);
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
                setShowCreateForm(false);
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
        <div className="space-y-8 animate-in fade-in duration-500 max-w-6xl mx-auto px-4 py-6">

            {/* Page Header */}
            <div className="page-header flex flex-col md:flex-row md:items-center justify-between gap-6 border-b border-gray-100 pb-8">
                <div className="space-y-1">
                    <h1 className="page-title flex items-center gap-4 text-3xl font-extrabold tracking-tight">
                        <div className="p-3 bg-blue-600 rounded-2xl shadow-lg shadow-blue-200">
                            <Megaphone className="w-8 h-8 text-white" />
                        </div>
                        Announcements
                    </h1>
                    <p className="page-subtitle text-gray-500 font-medium pt-1">Keep your educational community informed and engaged.</p>
                </div>
                
                <Button 
                    onClick={() => setShowCreateForm(!showCreateForm)}
                    className="btn-primary-custom h-12 px-6 gap-2 shadow-xl hover:scale-105 transition-all text-base font-bold"
                >
                    {showCreateForm ? <X className="w-5 h-5" /> : <Plus className="w-5 h-5" />}
                    {showCreateForm ? "Cancel Posting" : "New Announcement"}
                </Button>
            </div>

            {/* ── Create Form (Collapsible) ── */}
            {showCreateForm && (
                <div className="content-card border-2 border-blue-100 bg-gradient-to-br from-blue-50/50 to-white animate-in slide-in-from-top duration-300 shadow-2xl">
                    <div className="content-card-header border-b-blue-100">
                        <h2 className="content-card-title flex items-center gap-2 text-blue-900">
                            <Send className="w-5 h-5 text-blue-600" />
                            Draft your message
                        </h2>
                    </div>
                    <div className="content-card-body p-6">
                        <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-4 md:col-span-1">
                                <div>
                                    <Label htmlFor="title" className="text-sm font-bold text-gray-700 mb-1.5 block uppercase tracking-wider">Heading</Label>
                                    <Input
                                        id="title"
                                        placeholder="e.g. Important update regarding midterms..."
                                        value={newAnnouncement.title}
                                        onChange={(e) => setNewAnnouncement({ ...newAnnouncement, title: e.target.value })}
                                        required
                                        className="form-input-styled h-12 bg-white text-base"
                                    />
                                </div>
                                <div>
                                    <Label className="text-sm font-bold text-gray-700 mb-1.5 block uppercase tracking-wider">Visibility</Label>
                                    <Select
                                        value={newAnnouncement.target}
                                        onValueChange={(value) => setNewAnnouncement({ ...newAnnouncement, target: value })}
                                    >
                                        <SelectTrigger className="w-full h-12 bg-white rounded-xl border-1.5 border-gray-200">
                                            <SelectValue placeholder="Who should see this?" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="all">Everyone</SelectItem>
                                            <SelectItem value="teachers">Teachers Only</SelectItem>
                                            <SelectItem value="students">Students Only</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>
                            
                            <div className="space-y-4 md:col-span-1">
                                <div>
                                    <Label htmlFor="content" className="text-sm font-bold text-gray-700 mb-1.5 block uppercase tracking-wider">Announcement Content</Label>
                                    <Textarea
                                        id="content"
                                        placeholder="Detailed message here..."
                                        value={newAnnouncement.content}
                                        onChange={(e) => setNewAnnouncement({ ...newAnnouncement, content: e.target.value })}
                                        required
                                        rows={5}
                                        className="form-input-styled bg-white text-base leading-relaxed resize-none"
                                    />
                                </div>
                                <div className="flex justify-end pt-2">
                                    <Button type="submit" disabled={submitting} className="h-12 px-8 btn-primary-custom group">
                                        {submitting ? <Loader2 className="w-5 h-5 animate-spin" /> : <Send className="w-5 h-5 transition-transform group-hover:translate-x-1 group-hover:-translate-y-1" />}
                                        <span className="ml-2 font-bold text-base">Post Announcement</span>
                                    </Button>
                                </div>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* ── Announcements Feed ── */}
            <div className="space-y-6">
                <div className="flex items-center justify-between px-2">
                    <h2 className="text-xl font-extrabold text-gray-900 border-l-4 border-blue-600 pl-4">
                        Recent Group Posts
                        <span className="ml-3 text-sm font-bold text-blue-600 bg-blue-50 px-3 py-1 rounded-full uppercase tracking-tighter shadow-sm">{announcements.length} Messages</span>
                    </h2>
                </div>

                {loading ? (
                    <div className="content-card py-24 flex flex-col items-center justify-center gap-4">
                        <div className="relative">
                            <div className="w-16 h-16 border-4 border-blue-600/20 border-t-blue-600 rounded-full animate-spin"></div>
                            <Megaphone className="w-6 h-6 text-blue-600 absolute inset-0 m-auto" />
                        </div>
                        <span className="text-gray-400 font-bold tracking-widest uppercase text-sm">Synchronizing Feed...</span>
                    </div>
                ) : announcements.length === 0 ? (
                    <div className="content-card py-32 text-center bg-gray-50/50 border-dashed border-2 border-gray-200">
                        <div className="inline-flex p-6 bg-white rounded-full shadow-inner mb-6">
                            <MessageSquare className="w-12 h-12 text-gray-300" />
                        </div>
                        <h3 className="text-2xl font-bold text-gray-400">No active announcements</h3>
                        <p className="text-sm text-gray-300 mt-2 max-w-xs mx-auto">Click "New Announcement" to start communicating with your portal users.</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {announcements.map((ann) => {
                            const cfg = TARGET_CONFIG[ann.target] || TARGET_CONFIG.all;
                            const Icon = cfg.icon;
                            return (
                                <div key={ann.id} className="content-card group hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 border-t-0 overflow-visible relative h-full flex flex-col">
                                    {/* Audience Badge Floating */}
                                    <div className={`absolute -top-3 left-6 flex items-center gap-1.5 text-[10px] font-black uppercase tracking-widest px-3 py-1 rounded-full shadow-lg ${cfg.bg} ${cfg.text} border-2 ${cfg.border} z-10`}>
                                        <Icon className="w-3 h-3" />
                                        {cfg.label}
                                    </div>

                                    <div className="content-card-header bg-gray-50/50 border-b-0 pt-8 pb-2">
                                        <h3 className="font-black text-gray-900 text-lg leading-tight group-hover:text-blue-600 transition-colors line-clamp-1">{ann.title}</h3>
                                    </div>
                                    
                                    <div className="px-6 pb-2 pt-1 flex items-center gap-2 text-[11px] font-bold text-gray-400 uppercase tracking-tighter">
                                        <CalendarDays className="w-3 h-3" />
                                        {new Date(ann.date || ann.created_at || ann.createdAt).toLocaleDateString("en-IN", {
                                            day: "2-digit", month: "long", year: "numeric"
                                        })}
                                    </div>

                                    <div className="content-card-body flex-1 pt-2">
                                        <p className="text-gray-600 text-sm leading-relaxed line-clamp-4 font-medium whitespace-pre-wrap">
                                            {ann.content}
                                        </p>
                                    </div>

                                    <div className="p-4 border-t border-gray-50 bg-gray-50/10 flex items-center justify-between">
                                        <div className="flex items-center gap-1">
                                            <button
                                                onClick={() => openEdit(ann)}
                                                className="p-2 rounded-xl text-gray-400 hover:text-blue-600 hover:bg-blue-50 transition-all active:scale-95"
                                                title="Edit Message"
                                            >
                                                <Pencil className="w-4 h-4" />
                                            </button>
                                            <button
                                                onClick={() => setDeleteTarget(ann)}
                                                className="p-2 rounded-xl text-gray-400 hover:text-red-500 hover:bg-red-50 transition-all active:scale-95"
                                                title="Remove Post"
                                            >
                                                <Trash2 className="w-4 h-4" />
                                            </button>
                                        </div>
                                        
                                        <div className="flex items-center gap-1">
                                            <div className={`w-2 h-2 rounded-full animate-pulse bg-gradient-to-r ${cfg.gradient}`}></div>
                                            <span className="text-[10px] font-black text-gray-300 uppercase tracking-widest">Active</span>
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>

            {/* ════════════════════════════
                EDIT DIALOG (Glassmorphism)
            ════════════════════════════ */}
            {editTarget && (
                <div
                    className="fixed inset-0 z-50 flex items-center justify-center p-4 backdrop-blur-xl bg-navy/30 animate-in fade-in duration-200"
                    onClick={() => setEditTarget(null)}
                >
                    <div
                        className="bg-white rounded-3xl shadow-[0_32px_64px_-16px_rgba(11,31,58,0.25)] w-full max-w-xl overflow-hidden border border-white/20"
                        onClick={(e) => e.stopPropagation()}
                        style={{ animation: "toastSlideIn 0.3s cubic-bezier(0.34,1.56,0.64,1)" }}
                    >
                        {/* Header */}
                        <div className="bg-gradient-to-r from-blue-600 to-indigo-700 px-8 py-6 relative overflow-hidden">
                            <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2 blur-2xl"></div>
                            <div className="flex items-center justify-between relative z-10">
                                <div className="flex items-center gap-3">
                                    <div className="p-2 bg-white/20 rounded-xl backdrop-blur-md">
                                        <Pencil className="w-5 h-5 text-white" />
                                    </div>
                                    <div>
                                        <h3 className="font-black text-white text-xl tracking-tight leading-none uppercase text-xs opacity-70 mb-1">Editing Post</h3>
                                        <h4 className="text-white font-black text-lg line-clamp-1">{editTarget.title}</h4>
                                    </div>
                                </div>
                                <button
                                    onClick={() => setEditTarget(null)}
                                    className="p-2 rounded-full bg-white/10 text-white hover:bg-white/20 transition-colors"
                                >
                                    <X className="w-5 h-5" />
                                </button>
                            </div>
                        </div>

                        {/* Body */}
                        <div className="p-8 space-y-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <label className="text-xs font-black text-gray-500 uppercase tracking-widest pl-1">Target Audience</label>
                                    <select
                                        className="w-full h-12 px-4 border-2 border-gray-100 rounded-2xl text-sm font-bold focus:outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-600 transition-all bg-gray-50/50"
                                        value={editForm.target}
                                        onChange={(e) => setEditForm((f) => ({ ...f, target: e.target.value }))}
                                    >
                                        <option value="all">Everyone</option>
                                        <option value="teachers">Teachers Only</option>
                                        <option value="students">Students Only</option>
                                    </select>
                                </div>
                                <div className="space-y-2">
                                    <label className="text-xs font-black text-gray-500 uppercase tracking-widest pl-1">Heading</label>
                                    <input
                                        type="text"
                                        className="w-full h-12 px-4 border-2 border-gray-100 rounded-2xl text-sm font-bold focus:outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-600 transition-all bg-gray-50/50"
                                        value={editForm.title}
                                        onChange={(e) => setEditForm((f) => ({ ...f, title: e.target.value }))}
                                        placeholder="Enter title..."
                                    />
                                </div>
                            </div>
                            <div className="space-y-2">
                                <label className="text-xs font-black text-gray-500 uppercase tracking-widest pl-1">Message Body</label>
                                <textarea
                                    rows={6}
                                    className="w-full px-4 py-4 border-2 border-gray-100 rounded-2xl text-sm font-medium focus:outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-600 transition-all bg-gray-50/50 resize-none leading-relaxed"
                                    value={editForm.content}
                                    onChange={(e) => setEditForm((f) => ({ ...f, content: e.target.value }))}
                                    placeholder="Type your message details..."
                                />
                            </div>
                        </div>

                        {/* Footer */}
                        <div className="px-8 py-6 bg-gray-50 flex items-center justify-end gap-4 shadow-inner">
                            <button
                                onClick={() => setEditTarget(null)}
                                className="px-6 py-2.5 text-sm font-bold text-gray-400 hover:text-gray-600 transition-colors uppercase tracking-widest"
                            >
                                Discard
                            </button>
                            <Button
                                onClick={handleEdit}
                                disabled={editSaving}
                                className="h-12 px-8 btn-primary-custom"
                            >
                                {editSaving
                                    ? <><Loader2 className="w-5 h-5 animate-spin" /> Publishing...</>
                                    : <><CheckCircle2 className="w-5 h-5" /> Update Live Post</>
                                }
                            </Button>
                        </div>
                    </div>
                </div>
            )}

            {/* ════════════════════════════
                DELETE CONFIRM DIALOG
            ════════════════════════════ */}
            {deleteTarget && (
                <div
                    className="fixed inset-0 z-50 flex items-center justify-center p-4 backdrop-blur-md bg-red-900/10 animate-in fade-in duration-200"
                    onClick={() => setDeleteTarget(null)}
                >
                    <div
                        className="bg-white rounded-[2rem] shadow-2xl w-full max-w-sm overflow-hidden"
                        onClick={(e) => e.stopPropagation()}
                        style={{ animation: "toastSlideIn 0.25s cubic-bezier(0.34,1.56,0.64,1)" }}
                    >
                        <div className="p-10 text-center space-y-6">
                            <div className="w-20 h-20 bg-red-50 text-red-600 rounded-3xl flex items-center justify-center mx-auto shadow-inner transform -rotate-6">
                                <Trash2 className="w-10 h-10" />
                            </div>
                            
                            <div className="space-y-2">
                                <h3 className="text-2xl font-black text-gray-900 tracking-tight leading-none">Delete Post?</h3>
                                <p className="text-gray-500 text-sm font-medium px-4">
                                    Are you sure you want to remove <span className="text-red-600 font-bold">"{deleteTarget.title}"</span>? This action is permanent.
                                </p>
                            </div>
                            
                            <div className="flex flex-col gap-3">
                                <Button
                                    onClick={handleDelete}
                                    disabled={deleting}
                                    variant="destructive"
                                    className="h-14 rounded-2xl font-black text-base shadow-xl shadow-red-200 active:scale-95 transition-all"
                                >
                                    {deleting ? <Loader2 className="animate-spin" /> : "YES, DELETE NOW"}
                                </Button>
                                <button
                                    onClick={() => setDeleteTarget(null)}
                                    className="h-12 font-bold text-gray-400 hover:text-gray-600 transition-colors uppercase text-xs tracking-widest"
                                >
                                    No, Keep it
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

