"use client";
import { useEffect, useState } from "react";
import { Users, BookOpen, FileText, Megaphone, Plus, ArrowRight, Clock } from "lucide-react";
import Link from "next/link";
import { useSession } from "next-auth/react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

export default function TeacherDashboard() {
    const { data: session } = useSession();
    const [stats, setStats] = useState({
        classes: 0,
        students: 0,
        assignments: 0,
        announcements: 0,
        pendingStudents: 0
    });
    const [recentAnnouncements, setRecentAnnouncements] = useState([]);
    const [loading, setLoading] = useState(true);
    const [classData, setClassData] = useState([]);
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
        const fetchData = async () => {
            try {
                const [classesRes, studentsRes, assignmentsRes, announcementsRes, pendingRes] = await Promise.all([
                    fetch('/api/classes'),
                    fetch('/api/students'),
                    fetch('/api/assignments'),
                    fetch('/api/announcements'),
                    fetch('/api/teacher/students/pending')
                ]);
                const classes = await classesRes.json();
                const students = await studentsRes.json();
                const assignments = await assignmentsRes.json();
                const announcements = await announcementsRes.json();
                const pending = await pendingRes.json();

                // Process stats
                setStats({
                    classes: Array.isArray(classes) ? classes.length : 0,
                    students: Array.isArray(students) ? students.length : 0,
                    assignments: Array.isArray(assignments) ? assignments.length : 0,
                    announcements: Array.isArray(announcements) ? announcements.length : 0,
                    pendingStudents: Array.isArray(pending) ? pending.length : 0
                });

                // Process recent announcements (take top 3)
                if (Array.isArray(announcements)) {
                    setRecentAnnouncements(announcements.slice(0, 3));
                }

                // Process class data for chart (students per class)
                if (Array.isArray(classes)) {
                    const chartData = classes.map((c) => ({
                        name: c.name,
                        students: c.students?.length || 0
                    }));
                    setClassData(chartData);
                }
            } catch (error) {
                console.error("Error fetching dashboard data:", error);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, []);

    const StatCard = ({ title, value, icon: Icon, color, link }) => (
        <div className="stat-card">
            <div className={`stat-card-icon-wrap text-white ${color}`}>
                <Icon className="w-5 h-5" />
            </div>
            <div className="stat-card-label">{title}</div>
            <div className="flex items-center justify-between">
                <div className="stat-card-value">{loading ? "..." : value}</div>
                {link && (
                    <Link href={link} className="text-gray-400 hover:text-indigo-600 transition-colors">
                        <ArrowRight className="w-5 h-5" />
                    </Link>
                )}
            </div>
        </div>
    );

    return (
        <div className="space-y-8 animate-in fade-in duration-500">
            <div className="page-header flex justify-between items-end mb-8">
                <div>
                    <div className="flex items-center gap-3">
                        <h1 className="page-title">Teacher Dashboard</h1>
                    </div>
                    <p className="page-subtitle">Welcome back, {session?.user?.name || 'Teacher'}! Here's what's happening today.</p>
                </div>
                <div className="flex space-x-3">
                    <Link href="/dashboard/teacher/assignments/new">
                        <button className="btn-primary-custom">
                            <Plus className="w-4 h-4" />
                            Create Assignment
                        </button>
                    </Link>
                    <Link href="/dashboard/teacher/announcements">
                        <button className="btn-primary-custom" style={{ background: '#fff', color: '#0d1117', border: '1px solid #e2e8f0', boxShadow: '0 2px 4px rgba(0,0,0,0.02)' }}>
                            <Megaphone className="w-4 h-4" />
                            Post Announcement
                        </button>
                    </Link>
                </div>
            </div>

            {/* Stats Overview */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
                <StatCard title="Total Classes" value={stats.classes} icon={BookOpen} color="bg-indigo-500" link="/dashboard/teacher/classes" />
                <StatCard title="Total Students" value={stats.students} icon={Users} color="bg-emerald-500" link="/dashboard/teacher/students" />
                <StatCard title="Pending Students" value={stats.pendingStudents} icon={Users} color="bg-blue-500" link="/dashboard/teacher/pending-students" />
                <StatCard title="Active Assignments" value={stats.assignments} icon={FileText} color="bg-violet-500" link="/dashboard/teacher/assignments" />
                <StatCard title="Announcements" value={stats.announcements} icon={Megaphone} color="bg-amber-500" link="/dashboard/teacher/announcements" />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mt-8">
                {/* Class Distribution Chart */}
                <div className="content-card lg:col-span-2 flex flex-col">
                    <div className="content-card-header">
                        <h2 className="content-card-title">Student Distribution by Class</h2>
                    </div>
                    <div className="content-card-body flex-1">
                        <div className="h-[300px] w-full">
                            {loading ? (
                                <div className="h-full flex items-center justify-center text-gray-400 font-medium italic underline decoration-primary/20 transition-all">Loading analytics...</div>
                            ) : mounted && classData.length > 0 ? (
                                <ResponsiveContainer width="100%" height="100%">
                                    <BarChart data={classData}>
                                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
                                        <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 11, fontWeight: 700 }} dy={10} />
                                        <YAxis allowDecimals={false} axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 11, fontWeight: 700 }} dx={-10} />
                                        <Tooltip 
                                            cursor={{ fill: '#f8fafc', radius: 8 }} 
                                            contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 30px rgba(0,0,0,0.1)', fontWeight: 800 }} 
                                        />
                                        <Bar dataKey="students" fill="url(#colorStudents)" radius={[6, 6, 0, 0]} barSize={40} />
                                        <defs>
                                            <linearGradient id="colorStudents" x1="0" y1="0" x2="0" y2="1">
                                                <stop offset="5%" stopColor="#4f46e5" stopOpacity={0.8}/>
                                                <stop offset="95%" stopColor="#4f46e5" stopOpacity={0.2}/>
                                            </linearGradient>
                                        </defs>
                                    </BarChart>
                                </ResponsiveContainer>
                            ) : (
                                <div className="h-full flex items-center justify-center text-gray-400 font-medium">No class data available</div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Recent Activity */}
                <div className="content-card flex flex-col">
                    <div className="content-card-header">
                        <h2 className="content-card-title">Recent Announcements</h2>
                    </div>
                    <div className="content-card-body p-0 flex flex-col flex-1">
                        <div className="divide-y divide-gray-100 p-5 flex-1 space-y-4">
                            {loading ? (
                                <p className="text-gray-500 text-center py-4 font-medium">Loading...</p>
                            ) : recentAnnouncements.length > 0 ? (
                                recentAnnouncements.map((announcement) => (
                                    <div key={announcement.id} className="pt-4 first:pt-0 pb-1 flex items-start space-x-4">
                                        <div className="bg-indigo-50 p-2.5 rounded-xl shrink-0 mt-0.5">
                                            <Megaphone className="w-4 h-4 text-indigo-600" />
                                        </div>
                                        <div>
                                            <p className="text-sm font-semibold text-gray-900 leading-tight">{announcement.title}</p>
                                            <p className="text-xs text-gray-500 mt-1.5 line-clamp-2 leading-relaxed">{announcement.content}</p>
                                            <div className="flex items-center mt-2.5 text-[11px] font-medium text-gray-400 uppercase tracking-wider">
                                                <Clock className="w-3 h-3 mr-1" />
                                                {new Date(announcement.created_at || announcement.createdAt).toLocaleDateString()}
                                            </div>
                                        </div>
                                    </div>
                                ))
                            ) : (
                                <p className="text-gray-500 text-sm py-4 text-center">No recent announcements</p>
                            )}
                        </div>
                        <div className="p-4 border-t border-gray-50 bg-gray-50/50">
                            <Link href="/dashboard/teacher/announcements">
                                <button className="w-full text-indigo-600 font-semibold text-sm flex items-center justify-center hover:text-indigo-700 transition">
                                    View All Announcements
                                    <ArrowRight className="w-4 h-4 ml-1.5" />
                                </button>
                            </Link>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
