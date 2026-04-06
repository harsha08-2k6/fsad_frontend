"use client";
import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
    Clock, 
    CircleCheck, 
    CircleAlert, 
    ArrowRight, 
    FileText, 
    Calendar,
    Search,
    Filter,
    GraduationCap,
    BookOpen,
    CalendarClock,
    LayoutGrid,
    ListFilter
} from "lucide-react";
import Link from "next/link";
import { format, formatDistanceToNow } from "date-fns";

export default function StudentAssignmentsPage() {
    const { data: session } = useSession();
    const [activeTab, setActiveTab] = useState("pending");
    const [assignments, setAssignments] = useState([]);
    const [submissions, setSubmissions] = useState([]);
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

                const [assignmentsRes, submissionsRes] = await Promise.all([
                    fetch(assignmentUrl),
                    fetch(`/api/submissions?studentId=${studentId}`)
                ]);
                const assignmentsData = await assignmentsRes.json();
                const submissionsData = await submissionsRes.json();
                if (Array.isArray(assignmentsData))
                    setAssignments(assignmentsData);
                if (Array.isArray(submissionsData))
                    setSubmissions(submissionsData);
            }
            catch (error) {
                console.error("Error fetching assignments:", error);
            }
            finally {
                setLoading(false);
            }
        };
        fetchData();
    }, [session]);

    // Filter Logic
    const submissionMap = new Map(
        submissions
            .filter((s) => s.assignment_id || s.assignment || s.assignmentId)
            .map((s) => {
                const assignmentObj = s.assignment || s.assignmentId;
                const id = typeof assignmentObj === 'object' && assignmentObj !== null
                    ? assignmentObj.id
                    : (s.assignment_id || s.assignmentId);
                return [id, s];
            })
    );

    const pendingAssignments = assignments.filter((a) => !submissionMap.has(a.id));
    const completedAssignments = assignments.filter((a) => submissionMap.has(a.id));

    const TabButton = ({ id, label, count, icon: Icon, colorClass }) => (
        <button 
            onClick={() => setActiveTab(id)} 
            className={`flex items-center px-8 py-4 font-black text-sm transition-all relative overflow-hidden group ${
                activeTab === id
                ? "text-navy"
                : "text-gray-400 hover:text-gray-600"
            }`}
        >
            <Icon className={`w-4 h-4 mr-2.5 ${activeTab === id ? "text-primary" : "text-gray-300"} group-hover:scale-110 transition-transform`} />
            <span className="uppercase tracking-widest">{label}</span>
            <span className={`ml-2.5 px-2 py-0.5 rounded-lg text-[10px] font-black ${
                activeTab === id ? "bg-primary text-white shadow-lg shadow-primary/20" : "bg-gray-100 text-gray-500"
            }`}>
                {count}
            </span>
            {activeTab === id && (
                <div className="absolute bottom-0 left-0 right-0 h-1 bg-primary rounded-t-full animate-in slide-in-from-bottom duration-300"></div>
            )}
        </button>
    );

    if (loading) {
        return (
            <div className="flex h-64 items-center justify-center">
                <div className="relative">
                    <div className="w-12 h-12 border-4 border-primary/20 border-t-primary rounded-full animate-spin"></div>
                    <BookOpen className="w-5 h-5 text-primary absolute inset-0 m-auto" />
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-8 animate-in fade-in duration-700 max-w-7xl mx-auto px-4 py-8">
            {/* Header Section */}
            <div className="page-header flex flex-col md:flex-row md:items-end justify-between border-b border-gray-100 pb-10 relative">
                <div className="absolute -top-10 -left-10 w-64 h-64 bg-primary/5 rounded-full blur-3xl -z-10"></div>
                <div className="space-y-2">
                    <h1 className="text-5xl font-black tracking-tighter text-navy flex items-center gap-4">
                        My <span className="text-primary italic">Assignments</span>
                    </h1>
                </div>
                
                <div className="mt-8 md:mt-0 flex items-center gap-3 bg-gray-50 p-1.5 rounded-2xl border border-gray-100">
                    <div className="p-2 bg-white rounded-xl shadow-sm text-navy">
                        <LayoutGrid className="w-5 h-5" />
                    </div>
                </div>
            </div>

            {/* Navigation Tabs */}
            <div className="flex items-center gap-2 border-b border-gray-100 mb-2 overflow-x-auto no-scrollbar">
                <TabButton id="pending" label="Pending" count={pendingAssignments.length} icon={Clock} />
                <TabButton id="completed" label="Completed" count={completedAssignments.length} icon={CircleCheck} />
            </div>

            {/* Content Feed */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {activeTab === "pending" ? (
                    pendingAssignments.length > 0 ? (
                        pendingAssignments.map((assignment, idx) => {
                            const isOverdue = new Date(assignment.deadline) < new Date();
                            return (
                                <Card key={assignment.id} className="content-card group hover:shadow-[0_32px_64px_-16px_rgba(11,31,58,0.15)] border-none overflow-hidden relative transform hover:-translate-y-2 transition-all duration-500 animate-in fade-in slide-in-from-bottom duration-500" style={{ animationDelay: `${idx * 50}ms` }}>
                                    <div className="h-2 w-full bg-gradient-to-r from-primary to-blue-400"></div>
                                    <CardContent className="p-8">
                                        <div className="flex flex-col h-full space-y-6">
                                            <div className="space-y-4">
                                                <div className="flex items-center justify-between">
                                                    <Badge className="bg-primary/10 text-primary border-none font-black text-[10px] tracking-widest uppercase py-1 px-3">
                                                        {assignment.subject?.name || "Global"}
                                                    </Badge>
                                                    {isOverdue && (
                                                        <Badge variant="destructive" className="animate-pulse shadow-lg shadow-red-200">
                                                            Late
                                                        </Badge>
                                                    )}
                                                </div>
                                                <h3 className="text-xl font-black text-navy leading-tight line-clamp-2 min-h-[3rem] group-hover:text-primary transition-colors">
                                                    {assignment.title}
                                                </h3>
                                            </div>

                                            <div className="space-y-3 pt-2 border-t border-gray-50">
                                                <div className="flex items-center gap-3 text-xs font-bold text-gray-500">
                                                    <div className="p-1.5 bg-gray-50 rounded-lg">
                                                        <Calendar className="w-3.5 h-3.5 text-gray-400" />
                                                    </div>
                                                    <span>Due {format(new Date(assignment.deadline), "MMM d, yyyy")}</span>
                                                </div>
                                                <div className={`flex items-center gap-3 text-xs font-black uppercase tracking-widest ${isOverdue ? "text-red-500" : "text-amber-600"}`}>
                                                    <div className={`p-1.5 rounded-lg ${isOverdue ? "bg-red-50" : "bg-amber-50"}`}>
                                                        <Clock className="w-3.5 h-3.5" />
                                                    </div>
                                                    {formatDistanceToNow(new Date(assignment.deadline), { addSuffix: true })}
                                                </div>
                                            </div>

                                            <div className="pt-2 flex flex-col gap-3">
                                                {(assignment.file_url || assignment.fileUrl) && (
                                                    <a 
                                                        href={assignment.file_url || assignment.fileUrl} 
                                                        target="_blank" 
                                                        rel="noopener noreferrer" 
                                                        className="flex items-center justify-center gap-2 py-3 rounded-xl bg-gray-50 text-gray-500 hover:bg-gray-100 transition-all font-black text-[10px] uppercase tracking-widest border border-transparent hover:border-gray-200"
                                                    >
                                                        <FileText className="w-4 h-4" />
                                                        View File
                                                    </a>
                                                )}
                                                <Link href={`/dashboard/student/assignments/${assignment.id}`} className="w-full">
                                                    <Button className="w-full btn-primary-custom h-14 rounded-2xl shadow-xl shadow-primary/10 group/btn">
                                                        Open
                                                        <ArrowRight className="w-4 h-4 ml-2 group-hover/btn:translate-x-1 transition-transform" />
                                                    </Button>
                                                </Link>
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>
                            );
                        })
                    ) : (
                        <div className="col-span-full py-32 flex flex-col items-center justify-center bg-gray-50/50 rounded-[3rem] border-4 border-dashed border-gray-100">
                            <h3 className="text-3xl font-black text-navy tracking-tight">All Done</h3>
                            <p className="text-gray-400 font-bold mt-2">Zero pending tasks.</p>
                        </div>
                    )
                ) : (
                    completedAssignments.length > 0 ? (
                        completedAssignments.map((assignment, idx) => {
                            const submission = submissionMap.get(assignment.id);
                            const isGraded = submission.grade !== undefined;
                            return (
                                <Card key={assignment.id} className="content-card bg-white/50 border-gray-100 group transition-all duration-300 animate-in fade-in zoom-in duration-500" style={{ animationDelay: `${idx * 50}ms` }}>
                                    <CardContent className="p-8">
                                        <div className="flex flex-col h-full space-y-6">
                                            <div className="flex items-center justify-between">
                                                <Badge variant="outline" className="text-[10px] font-black uppercase tracking-widest text-gray-400 border-gray-200">
                                                    {assignment.subject?.name || "Global"}
                                                </Badge>
                                                <div className="flex items-center gap-1.5 px-3 py-1 bg-emerald-50 border border-emerald-100 text-emerald-600 rounded-full text-[10px] font-black uppercase tracking-widest">
                                                    <CircleCheck className="w-3 h-3" />
                                                    Submitted
                                                </div>
                                            </div>
                                            
                                            <h3 className="text-xl font-black text-navy leading-tight line-clamp-1 opacity-70 group-hover:opacity-100 transition-opacity">
                                                {assignment.title}
                                            </h3>

                                            <div className="flex items-center gap-4 py-4 px-5 bg-navy/5 rounded-2xl relative overflow-hidden border border-navy/5">
                                                <div className="flex-1 space-y-1">
                                                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Status</p>
                                                    <h4 className={`text-lg font-black ${isGraded ? "text-emerald-700" : "text-amber-600"}`}>
                                                        {isGraded ? "Graded" : "Checking"}
                                                    </h4>
                                                </div>
                                                <div className="text-right">
                                                    {isGraded ? (
                                                        <div className="flex flex-col items-end">
                                                            <span className="text-3xl font-black text-emerald-600 leading-none">{submission.grade}</span>
                                                            <span className="text-[10px] font-black text-gray-300 uppercase tracking-widest">Score</span>
                                                        </div>
                                                    ) : (
                                                        <Clock className="w-8 h-8 text-amber-200 animate-pulse" />
                                                    )}
                                                </div>
                                            </div>

                                            <div className="pt-2 flex items-center justify-between gap-3">
                                                {!isGraded ? (
                                                    <div className="flex items-center gap-2 w-full">
                                                        <Link href={`/dashboard/student/assignments/${assignment.id}`} className="flex-1">
                                                            <Button variant="outline" className="w-full h-14 rounded-2xl text-[10px] font-black uppercase tracking-widest border-2 border-navy/10 hover:bg-navy hover:text-white transition-all shadow-sm">
                                                                Edit Submission
                                                            </Button>
                                                        </Link>
                                                        <Button 
                                                            variant="ghost" 
                                                            className="h-14 w-14 rounded-2xl text-red-500 hover:text-red-700 hover:bg-red-50 p-0 border-2 border-transparent hover:border-red-100"
                                                            onClick={async () => {
                                                                if (confirm("Delete this submission?")) {
                                                                    try {
                                                                        const res = await fetch(`/api/submissions/${submission.id}`, { method: "DELETE" });
                                                                        if (res.ok) window.location.reload();
                                                                    } catch (err) { console.error("Error", err); }
                                                                }
                                                            }}
                                                        >
                                                            <CircleAlert className="w-6 h-6" />
                                                        </Button>
                                                    </div>
                                                ) : (
                                                    <Link href={`/dashboard/student/assignments/${assignment.id}`} className="w-full">
                                                        <Button className="w-full h-16 btn-primary-custom rounded-2xl shadow-xl shadow-primary/20 group/btn">
                                                            <span className="font-black uppercase tracking-[0.2em] text-xs">View Result</span>
                                                            <ArrowRight className="w-4 h-4 ml-2 group-hover/btn:translate-x-1 transition-transform" />
                                                        </Button>
                                                    </Link>
                                                )}
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>
                            )
                        })
                    ) : (
                        <div className="col-span-full py-32 flex flex-col items-center justify-center bg-gray-50/50 rounded-[3rem] border-4 border-dashed border-gray-100 grayscale opacity-60">
                            <BookOpen className="w-20 h-20 text-gray-300 mb-6" />
                            <h3 className="text-3xl font-black text-gray-400 tracking-tight text-center">No Submissions</h3>
                            <p className="text-gray-400 font-medium text-lg mt-2">You haven't submitted any assignments yet.</p>
                        </div>
                    )
                )}
            </div>
        </div>
    );
}

