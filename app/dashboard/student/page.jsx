"use client";
import { useEffect, useState } from "react";
import { Clock, CheckCircle, TrendingUp, Code, GraduationCap, ArrowRight, AlertCircle } from "lucide-react";
import Link from "next/link";
import { useSession } from "next-auth/react";
import { formatDistanceToNow } from "date-fns";

export default function StudentDashboard() {
    const { data: session } = useSession();
    const [stats, setStats] = useState({
        pending: 0,
        completed: 0,
        averageGrade: 0
    });
    const [upcomingDeadlines, setUpcomingDeadlines] = useState([]);
    const [recentGrades, setRecentGrades] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            if (!session?.user?.id) return;
            try {
                const studentId = session.user.id;
                const classId = session.user.classId;

                const queryParams = new URLSearchParams();
                if (classId) queryParams.append('classId', classId);
                
                const assignmentUrl = `/api/assignments${queryParams.toString() ? '?' + queryParams.toString() : ''}`;
                const submissionUrl = `/api/submissions?studentId=${studentId}`;
                const marksUrl = `/api/marks/student/${studentId}`;

                const [assignmentsRes, submissionsRes, marksRes] = await Promise.all([
                    fetch(assignmentUrl),
                    fetch(submissionUrl),
                    fetch(marksUrl)
                ]);

                const assignments = await assignmentsRes.json();
                const submissions = await submissionsRes.json();
                const marks = await marksRes.json();

                // Check for errors in response
                if (!Array.isArray(assignments) || !Array.isArray(submissions) || !Array.isArray(marks)) {
                    console.error("Expected arrays but received:", { assignments, submissions, marks });
                    setLoading(false);
                    return;
                }

                if (Array.isArray(assignments) && Array.isArray(submissions)) {
                    // Calculate Pending vs Completed
                    const submissionMap = new Set(submissions.map((s) => {
                        const assignmentObj = s.assignment || s.assignmentId;
                        return typeof assignmentObj === 'object' && assignmentObj !== null
                            ? assignmentObj.id
                            : (s.assignment_id || s.assignmentId);
                    }));

                    const pendingCount = assignments.filter((a) => !submissionMap.has(a.id)).length;
                    const completedCount = submissions.length;

                    // Calculate Average Grade (Graded Assignments + Exams)
                    let totalScore = 0;
                    let totalCount = 0;

                    // Assignment grades
                    submissions.forEach((s) => {
                        if (s.status === 'graded' && s.grade !== null && s.grade !== undefined) {
                            totalScore += Number(s.grade);
                            totalCount++;
                        }
                    });

                    // Exam marks
                    if (Array.isArray(marks)) {
                        marks.forEach((m) => {
                            if (m.marksObtained !== null && m.marksObtained !== undefined && m.maxMarks > 0) {
                                // Normalize to percentage
                                totalScore += (Number(m.marksObtained) / Number(m.maxMarks)) * 100;
                                totalCount++;
                            }
                        });
                    }

                    const average = totalCount > 0 ? Math.round(totalScore / totalCount) : 0;

                    setStats({
                        pending: pendingCount,
                        completed: completedCount,
                        averageGrade: average
                    });

                    // Process Upcoming Deadlines
                    const now = new Date();
                    const upcoming = assignments
                        .filter((a) => !submissionMap.has(a.id) && new Date(a.deadline) > now)
                        .sort((a, b) => new Date(a.deadline).getTime() - new Date(b.deadline).getTime())
                        .slice(0, 3);

                    setUpcomingDeadlines(upcoming);

                    // Process Recent Grades (Assignments only for now)
                    const recent = submissions
                        .filter((s) => s.status === 'graded')
                        .sort((a, b) => new Date(b.submitted_at || b.submittedAt).getTime() - new Date(a.submitted_at || a.submittedAt).getTime())
                        .slice(0, 3);

                    setRecentGrades(recent);
                }
            } catch (error) {
                console.error("Error fetching student dashboard data:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [session]);

    const StatCard = ({ title, value, icon: Icon, color, suffix = "" }) => (
        <div className="stat-card">
            <div className={`stat-card-icon-wrap text-white ${color}`}>
                <Icon className="w-5 h-5" />
            </div>
            <div className="stat-card-label">{title}</div>
            <div className="stat-card-value">{loading ? "..." : value}{suffix}</div>
        </div>
    );

    return (
        <div className="space-y-8 animate-in fade-in duration-500">
            <div className="page-header mb-8">
                <div className="flex items-center gap-4">
                    <h1 className="page-title">Student Dashboard</h1>
                </div>
                <p className="page-subtitle">Welcome back, {session?.user?.name || 'Student'}! Track your progress and stay on top of your coursework.</p>
            </div>

            {/* Stats Overview */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <Link href="/dashboard/student/assignments" className="block outline-none">
                    <StatCard title="Pending Assignments" value={stats.pending} icon={Clock} color="bg-amber-500" />
                </Link>
                <Link href="/dashboard/student/assignments?tab=completed" className="block outline-none">
                    <StatCard title="Completed Work" value={stats.completed} icon={CheckCircle} color="bg-emerald-500" />
                </Link>
                <Link href="/dashboard/student/marks" className="block outline-none">
                    <StatCard title="Average Grade" value={stats.averageGrade} icon={TrendingUp} color="bg-indigo-500" suffix="%" />
                </Link>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mt-8">
                {/* Main Content Area */}
                <div className="lg:col-span-2 space-y-8">
                    {/* Quick Access */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <Link href="/dashboard/student/virtual-lab" className="block outline-none">
                            <div className="content-card hover:border-indigo-200 transition-colors border-l-4 border-l-indigo-500 h-full">
                                <div className="content-card-body p-6 flex items-center justify-between">
                                    <div className="flex items-center space-x-4">
                                        <div className="p-3 bg-indigo-50 rounded-xl">
                                            <Code className="w-6 h-6 text-indigo-600" />
                                        </div>
                                        <div>
                                            <h3 className="font-bold text-lg text-gray-900">Virtual Lab</h3>
                                            <p className="text-sm text-gray-500">Practice coding instantly</p>
                                        </div>
                                    </div>
                                    <ArrowRight className="w-5 h-5 text-gray-300" />
                                </div>
                            </div>
                        </Link>

                        <Link href="/dashboard/student/marks" className="block outline-none">
                            <div className="content-card hover:border-emerald-200 transition-colors border-l-4 border-l-emerald-500 h-full">
                                <div className="content-card-body p-6 flex items-center justify-between">
                                    <div className="flex items-center space-x-4">
                                        <div className="p-3 bg-emerald-50 rounded-xl">
                                            <GraduationCap className="w-6 h-6 text-emerald-600" />
                                        </div>
                                        <div>
                                            <h3 className="font-bold text-lg text-gray-900">My Marks</h3>
                                            <p className="text-sm text-gray-500">View performance</p>
                                        </div>
                                    </div>
                                    <ArrowRight className="w-5 h-5 text-gray-300" />
                                </div>
                            </div>
                        </Link>
                    </div>

                    {/* Upcoming Deadlines */}
                    <div className="content-card">
                        <div className="content-card-header border-b border-gray-100">
                            <h2 className="content-card-title flex items-center text-gray-900">
                                <AlertCircle className="w-5 h-5 mr-2 text-rose-500" />
                                Upcoming Deadlines
                            </h2>
                        </div>
                        <div className="content-card-body p-0">
                            <div className="divide-y divide-gray-100 pb-2">
                                {loading ? (
                                    <p className="text-gray-500 text-center py-6">Loading...</p>
                                ) : upcomingDeadlines.length > 0 ? (
                                    upcomingDeadlines.map((assignment) => (
                                        <div key={assignment.id} className="flex items-center justify-between p-5 hover:bg-gray-50/50 transition-colors">
                                            <div>
                                                <h4 className="font-semibold text-gray-900">{assignment.title}</h4>
                                                <p className="text-[13px] font-medium text-gray-500 flex items-center mt-1">
                                                    <Clock className="w-3.5 h-3.5 mr-1.5 opacity-70" />
                                                    Due {new Date(assignment.deadline).toLocaleDateString()}
                                                </p>
                                            </div>
                                            <div className="text-right flex-shrink-0 ml-4">
                                                <span className="text-[11px] font-bold text-rose-600 bg-rose-50 border border-rose-100 px-3 py-1.5 rounded-full uppercase tracking-wider">
                                                    {formatDistanceToNow(new Date(assignment.deadline), { addSuffix: true })}
                                                </span>
                                            </div>
                                        </div>
                                    ))
                                ) : (
                                    <div className="text-center py-10 px-4 text-gray-500">
                                        <div className="bg-emerald-50 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                                            <CheckCircle className="w-8 h-8 text-emerald-500" />
                                        </div>
                                        <p className="font-medium text-gray-900">You're all caught up!</p>
                                        <p className="text-sm mt-1">No upcoming deadlines at the moment.</p>
                                    </div>
                                )}
                            </div>
                            {upcomingDeadlines.length > 0 && (
                                <div className="p-4 border-t border-gray-50 bg-gray-50/50">
                                    <Link href="/dashboard/student/assignments">
                                        <button className="w-full text-indigo-600 font-semibold text-sm flex items-center justify-center hover:text-indigo-700 transition">
                                            View All Assignments
                                            <ArrowRight className="w-4 h-4 ml-1.5" />
                                        </button>
                                    </Link>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Sidebar Area - Recent Grades */}
                <div className="space-y-8 bg-white rounded-2xl">
                    <div className="content-card h-full flex flex-col">
                        <div className="content-card-header border-b border-gray-100">
                            <h2 className="content-card-title">Recent Grades</h2>
                        </div>
                        <div className="content-card-body p-0 flex flex-col flex-1">
                            <div className="divide-y divide-gray-100 flex-1">
                                {loading ? (
                                    <p className="text-gray-500 py-6 text-center">Loading...</p>
                                ) : recentGrades.length > 0 ? (
                                    recentGrades.map((submission) => (
                                        <div key={submission.id} className="flex items-center justify-between p-5">
                                            <div className="flex-1 min-w-0 mr-4">
                                                <p className="text-sm font-semibold text-gray-900 truncate">
                                                    {(submission.assignment || submission.assignmentId)?.title || "Assignment"}
                                                </p>
                                                <p className="text-xs font-medium text-gray-500 mt-1 uppercase tracking-wider">
                                                    {new Date(submission.submitted_at || submission.submittedAt).toLocaleDateString()}
                                                </p>
                                            </div>
                                            <div className="flex items-center justify-center shrink-0 w-16 h-12 bg-emerald-50 text-emerald-700 rounded-xl font-bold border border-emerald-100">
                                                {submission.grade}
                                            </div>
                                        </div>
                                    ))
                                ) : (
                                    <div className="text-center py-10 px-4 text-gray-500">
                                        <p className="text-sm">No recent grades available</p>
                                    </div>
                                )}
                            </div>
                            <div className="p-5 border-t border-gray-50 bg-gray-50/50">
                                <Link href="/dashboard/student/marks">
                                    <button className="w-full btn-primary-custom" style={{ background: '#fff', color: '#0d1117', border: '1px solid #e2e8f0', boxShadow: '0 2px 4px rgba(0,0,0,0.02)', display: 'block', textAlign: 'center' }}>
                                        View Full Report
                                    </button>
                                </Link>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
