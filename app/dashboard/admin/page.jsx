"use client";
import { useEffect, useState } from "react";
import { Users, BookOpen, FileText, Megaphone, Plus, ArrowRight, ShieldCheck, UserCog } from "lucide-react";
import Link from "next/link";
import { useSession } from "next-auth/react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';

export default function AdminDashboard() {
    const { data: session } = useSession();
    const [stats, setStats] = useState({
        users: 0,
        teachers: 0,
        students: 0,
        classes: 0,
        assignments: 0,
        announcements: 0,
        pendingTeachers: 0,
        pendingAdmins: 0
    });
    const [assignments, setAssignments] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [statsRes, assignmentsRes] = await Promise.all([
                    fetch('/api/admin/stats'),
                    fetch('/api/assignments')
                ]);

                if (statsRes.ok) {
                    const statsData = await statsRes.json();
                    setStats(statsData);
                }

                if (assignmentsRes.ok) {
                    const assignmentsData = await assignmentsRes.json();
                    setAssignments(assignmentsData.slice(0, 5));
                }
            } catch (error) {
                console.error("Error fetching admin dashboard data:", error);
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

    const chartData = [
        { name: 'Teachers', count: stats.teachers, color: '#4f46e5' },
        { name: 'Students', count: stats.students, color: '#10b981' },
    ];

    return (
        <div className="space-y-8 animate-in fade-in duration-500">
            <div className="page-header flex justify-between items-end mb-8">
                <div>
                    <div className="flex items-center gap-4">
                        <h1 className="page-title flex items-center gap-3">
                            <ShieldCheck className="w-8 h-8 text-indigo-600" />
                            Admin Panel
                        </h1>
                    </div>
                    <p className="page-subtitle">Welcome, {session?.user?.name || 'Administrator'}! System overview and management dashboard.</p>
                </div>
                <div className="flex space-x-3">
                    <Link href="/dashboard/admin/users">
                        <button className="btn-primary-custom">
                            <UserCog className="w-4 h-4" />
                            Manage Users
                        </button>
                    </Link>
                </div>
            </div>

            {/* Stats Overview */}
            <div className={`grid grid-cols-1 md:grid-cols-2 lg:grid-cols-${session?.user?.role === 'super_admin' ? '6' : '5'} gap-6`}>
                <StatCard title="Total Users" value={stats.users} icon={Users} color="bg-blue-500" link="/dashboard/admin/users" />
                <StatCard title="Pending Teachers" value={stats.pendingTeachers} icon={Users} color="bg-amber-500" link="/dashboard/admin/pending-teachers" />
                {session?.user?.role === 'super_admin' && (
                    <StatCard title="Admin Requests" value={stats.pendingAdmins} icon={ShieldCheck} color="bg-rose-500" link="/dashboard/admin/pending-admins" />
                )}
                <StatCard title="Total Classes" value={stats.classes} icon={BookOpen} color="bg-emerald-500" link="/dashboard/admin/classes" />
                <StatCard title="Active Assignments" value={stats.assignments} icon={FileText} color="bg-violet-500" link="/dashboard/admin/assignments" />
                <StatCard title="Announcements" value={stats.announcements} icon={Megaphone} color="bg-amber-500" link="/dashboard/admin/announcements" />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mt-8">
                {/* User Distribution Chart */}
                <div className="content-card lg:col-span-2 flex flex-col">
                    <div className="content-card-header">
                        <h2 className="content-card-title">User Distribution</h2>
                    </div>
                    <div className="content-card-body flex-1">
                        <div className="h-[300px] w-full">
                            {loading ? (
                                <div className="h-full flex items-center justify-center text-gray-400 font-medium">Loading chart...</div>
                            ) : (
                                <ResponsiveContainer width="100%" height="100%">
                                    <BarChart data={chartData}>
                                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
                                        <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 12 }} dy={10} />
                                        <YAxis allowDecimals={false} axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 12 }} dx={-10} />
                                        <Tooltip cursor={{ fill: '#f8fafc' }} contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 20px rgba(0,0,0,0.08)' }} />
                                        <Bar dataKey="count" radius={[6, 6, 0, 0]} barSize={60}>
                                            {chartData.map((entry, index) => (
                                                <Cell key={`cell-${index}`} fill={entry.color} />
                                            ))}
                                        </Bar>
                                    </BarChart>
                                </ResponsiveContainer>
                            )}
                        </div>
                    </div>
                </div>

                {/* Recent Activity / Assignments */}
                <div className="content-card flex flex-col">
                    <div className="content-card-header">
                        <h2 className="content-card-title">Recent Assignments</h2>
                    </div>
                    <div className="content-card-body p-0 flex flex-col flex-1">
                        <div className="divide-y divide-gray-100 p-5 flex-1 space-y-4">
                            {loading ? (
                                <p className="text-gray-500 text-center py-4 font-medium">Loading...</p>
                            ) : assignments.length > 0 ? (
                                assignments.map((assignment) => (
                                    <div key={assignment.id} className="pt-4 first:pt-0 pb-1 flex items-start space-x-4">
                                        <div className="bg-violet-50 p-2.5 rounded-xl shrink-0 mt-0.5">
                                            <FileText className="w-4 h-4 text-violet-600" />
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <p className="text-sm font-semibold text-gray-900 truncate">{assignment.title}</p>
                                            <p className="text-xs text-gray-500 mt-1">Due: {new Date(assignment.deadline).toLocaleDateString()}</p>
                                        </div>
                                        <Link href={`/dashboard/admin/assignments/${assignment.id}/submissions`}>
                                            <ArrowRight className="w-4 h-4 text-gray-400 hover:text-indigo-600 mt-1" />
                                        </Link>
                                    </div>
                                ))
                            ) : (
                                <p className="text-gray-500 text-sm py-4 text-center">No recent assignments</p>
                            )}
                        </div>
                        <div className="p-4 border-t border-gray-50 bg-gray-50/50">
                            <Link href="/dashboard/admin/assignments">
                                <button className="w-full text-indigo-600 font-semibold text-sm flex items-center justify-center hover:text-indigo-700 transition">
                                    View All Assignments
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
