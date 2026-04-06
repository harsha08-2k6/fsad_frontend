"use client";
import { useEffect, useState } from "react";
import {
    Megaphone, Users, BookOpen, GraduationCap,
    CalendarDays, MessageSquare
} from "lucide-react";

/* ── Target badge config (Same as Teacher for consistency) ── */
const TARGET_CONFIG = {
    all: { label: "Everyone", icon: Users, bg: "bg-blue-50", text: "text-blue-700", border: "border-blue-200" },
    teachers: { label: "Teachers Area", icon: BookOpen, bg: "bg-violet-50", text: "text-violet-700", border: "border-violet-200" },
    students: { label: "Students Only", icon: GraduationCap, bg: "bg-emerald-50", text: "text-emerald-700", border: "border-emerald-200" },
};

export default function StudentAnnouncementsPage() {
    const [announcements, setAnnouncements] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetch('/api/announcements')
            .then(res => res.json())
            .then(data => {
                if (Array.isArray(data)) {
                    setAnnouncements(data);
                } else {
                    setAnnouncements([]);
                }
            })
            .catch(err => {
                console.error("Fetch error:", err);
                setAnnouncements([]);
            })
            .finally(() => setLoading(false));
    }, []);

    if (loading) {
        return (
            <div className="flex h-64 items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            </div>
        );
    }

    return (
        <div className="space-y-8 animate-in fade-in duration-500 max-w-6xl mx-auto px-4 py-8">
            {/* Page Header */}
            <div className="page-header border-b border-gray-100 pb-8 mb-10">
                <div className="flex items-center gap-4">
                    <div className="p-3 bg-blue-600 rounded-2xl shadow-lg shadow-blue-200">
                        <Megaphone className="w-8 h-8 text-white" />
                    </div>
                    <div>
                        <h1 className="page-title text-3xl font-black tracking-tight text-navy">General Announcements</h1>
                        <p className="page-subtitle text-gray-500 font-medium">Read the latest updates from your school's faculty and administrators.</p>
                    </div>
                </div>
            </div>

            {/* Announcements Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-10 pt-4">
                {announcements.length > 0 ? (
                    announcements.map((ann) => {
                        const cfg = TARGET_CONFIG[ann.target] || TARGET_CONFIG.all;
                        const Icon = cfg.icon;
                        return (
                            <div key={ann.id} className="group relative flex flex-col h-full mt-6">
                                {/* Audience Badge Floating */}
                                <div className={`absolute -top-4 left-6 flex items-center gap-2 text-[10px] font-black uppercase tracking-widest px-4 py-2 rounded-2xl shadow-xl ${cfg.bg} ${cfg.text} border-2 ${cfg.border} z-30 transition-all group-hover:scale-110 group-hover:-translate-y-1`}>
                                    <Icon className="w-4 h-4" />
                                    {cfg.label}
                                </div>

                                <div className="content-card overflow-visible h-full flex flex-col border-none shadow-[0_15px_40px_rgba(0,0,0,0.06)] group-hover:shadow-[0_20px_60px_rgba(37,99,235,0.12)] transition-all duration-500 rounded-[2.5rem] bg-white">
                                    <div className="content-card-header bg-navy/5 border-b-0 pt-12 pb-2 rounded-t-[2.5rem]">
                                        <h3 className="px-8 font-black text-navy text-2xl tracking-tighter leading-tight group-hover:text-blue-600 transition-colors line-clamp-2">{ann.title}</h3>
                                    </div>
                                    
                                    <div className="px-8 pb-4 pt-1 flex items-center gap-2 text-[12px] font-bold text-gray-400 uppercase tracking-widest">
                                        <div className="p-1 px-2.5 bg-gray-100 rounded-lg flex items-center gap-1.5">
                                            <CalendarDays className="w-3.5 h-3.5 text-blue-500" />
                                            {new Date(ann.date || ann.created_at || ann.createdAt).toLocaleDateString("en-IN", {
                                                day: "2-digit", month: "long", year: "numeric"
                                            })}
                                        </div>
                                    </div>

                                    <div className="content-card-body px-8 flex-1 pt-2 pb-10">
                                        <p className="text-gray-600 text-base leading-relaxed line-clamp-6 font-bold opacity-80 whitespace-pre-wrap">
                                            {ann.content}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        );
                    })
                ) : (
                    <div className="md:col-span-2 text-center py-32 bg-gray-50/50 border-dashed border-2 border-gray-200 rounded-[3rem]">
                        <div className="inline-flex p-6 bg-white rounded-full shadow-inner mb-6">
                            <MessageSquare className="w-12 h-12 text-gray-300" />
                        </div>
                        <h3 className="text-2xl font-bold text-gray-400">All Quiet Here</h3>
                        <p className="text-sm text-gray-300 mt-2">There aren't any announcements to show right now.</p>
                    </div>
                )}
            </div>
        </div>
    );
}


