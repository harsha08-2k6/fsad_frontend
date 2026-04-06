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
    BookOpen,
    LayoutGrid
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

    const TabButton = ({ id, label, count, icon: Icon }) => (
        <button 
            onClick={() => setActiveTab(id)} 
            className={`flex items-center px-6 py-3 font-bold text-sm transition-all border-b-2 ${
                activeTab === id
                ? "border-blue-600 text-blue-600"
                : "border-transparent text-gray-500 hover:text-gray-700"
            }`}
        >
            <Icon className="w-4 h-4 mr-2" />
            <span className="uppercase tracking-wider">{label}</span>
            <span className={`ml-2 px-2 py-0.5 rounded-full text-[10px] ${
                activeTab === id ? "bg-blue-600 text-white" : "bg-gray-100 text-gray-500"
            }`}>
                {count}
            </span>
        </button>
    );

    if (loading) {
        return (
            <div className="flex h-64 items-center justify-center">
                <div className="w-10 h-10 border-4 border-blue-100 border-t-blue-600 rounded-full animate-spin"></div>
            </div>
        );
    }

    return (
        <div className="space-y-6 max-w-7xl mx-auto px-4 py-8">
            {/* Header Section */}
            <div className="flex flex-col md:flex-row md:items-center justify-between border-b border-gray-100 pb-6">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900">
                        Assignments
                    </h1>
                    <p className="text-gray-500 mt-1">Manage and track your coursework performance.</p>
                </div>
                
                <div className="mt-4 md:mt-0 flex items-center gap-3 bg-gray-50 p-1.5 rounded-xl border border-gray-100">
                    <div className="p-2 bg-white rounded-lg shadow-sm text-gray-600">
                        <LayoutGrid className="w-5 h-5" />
                    </div>
                </div>
            </div>

            {/* Navigation Tabs */}
            <div className="flex items-center gap-6 border-b border-gray-100 mb-6 overflow-x-auto no-scrollbar">
                <TabButton id="pending" label="To-Do" count={pendingAssignments.length} icon={Clock} />
                <TabButton id="completed" label="Completed" count={completedAssignments.length} icon={CircleCheck} />
            </div>

            {/* Content Feed */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {activeTab === "pending" ? (
                    pendingAssignments.length > 0 ? (
                        pendingAssignments.map((assignment) => {
                            const isOverdue = new Date(assignment.deadline) < new Date();
                            return (
                                <Card key={assignment.id} className="group hover:shadow-md border border-gray-200 transition-shadow duration-300">
                                    <div className={`h-1.5 w-full ${isOverdue ? "bg-red-500" : "bg-blue-600"}`}></div>
                                    <CardContent className="p-6">
                                        <div className="flex flex-col h-full space-y-4">
                                            <div className="flex items-center justify-between">
                                                <Badge variant="secondary" className="bg-gray-100 text-gray-600 border-none font-bold text-[10px] tracking-wider px-2.5 py-1">
                                                    {assignment.subject?.name || "Global"}
                                                </Badge>
                                                {isOverdue && (
                                                    <span className="text-[10px] font-bold text-red-600 uppercase flex items-center gap-1">
                                                        <CircleAlert className="w-3 h-3" />
                                                        Overdue
                                                    </span>
                                                )}
                                            </div>
                                            <h3 className="text-lg font-bold text-gray-900 leading-tight line-clamp-2 min-h-[2.5rem]">
                                                {assignment.title}
                                            </h3>

                                            <div className="space-y-2.5 pt-4 border-t border-gray-50">
                                                <div className="flex items-center gap-2 text-xs text-gray-500">
                                                    <Calendar className="w-3.5 h-3.5" />
                                                    <span>Due {format(new Date(assignment.deadline), "MMM d, yyyy")}</span>
                                                </div>
                                                <div className={`flex items-center gap-2 text-xs font-bold ${isOverdue ? "text-red-600" : "text-amber-600"}`}>
                                                    <Clock className="w-3.5 h-3.5" />
                                                    {formatDistanceToNow(new Date(assignment.deadline), { addSuffix: true })}
                                                </div>
                                            </div>

                                            <div className="pt-2 flex flex-col gap-2">
                                                <Link href={`/dashboard/student/assignments/${assignment.id}`} className="w-full">
                                                    <Button className="w-full bg-blue-600 hover:bg-blue-700 h-11 rounded-lg shadow-sm">
                                                        View Details
                                                    </Button>
                                                </Link>
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>
                            );
                        })
                    ) : (
                        <div className="col-span-full py-20 flex flex-col items-center justify-center bg-gray-50 rounded-2xl border-2 border-dashed border-gray-200">
                            <h3 className="text-xl font-bold text-gray-900">All caught up!</h3>
                            <p className="text-gray-500 mt-1">No pending assignments found.</p>
                        </div>
                    )
                ) : (
                    completedAssignments.length > 0 ? (
                        completedAssignments.map((assignment) => {
                            const submission = submissionMap.get(assignment.id);
                            const isGraded = submission.grade !== undefined;
                            return (
                                <Card key={assignment.id} className="bg-gray-50/30 border-gray-200">
                                    <CardContent className="p-6">
                                        <div className="flex flex-col h-full space-y-4">
                                            <div className="flex items-center justify-between">
                                                <Badge variant="outline" className="text-[10px] font-bold uppercase tracking-wider text-gray-400">
                                                    {assignment.subject?.name || "Global"}
                                                </Badge>
                                                <div className="flex items-center gap-1.5 text-emerald-600 text-[10px] font-bold uppercase">
                                                    <CircleCheck className="w-3 h-3" />
                                                    Submitted
                                                </div>
                                            </div>
                                            
                                            <h3 className="text-lg font-bold text-gray-700 leading-tight line-clamp-1">
                                                {assignment.title}
                                            </h3>

                                            <div className="flex items-center gap-4 py-3 px-4 bg-white rounded-xl border border-gray-100">
                                                <div className="flex-1">
                                                    <p className="text-[10px] font-bold text-gray-400 uppercase">Grade Status</p>
                                                    <h4 className={`text-sm font-bold ${isGraded ? "text-emerald-600" : "text-amber-600"}`}>
                                                        {isGraded ? "Graded" : "In Review"}
                                                    </h4>
                                                </div>
                                                {isGraded && (
                                                    <div className="text-right">
                                                        <span className="text-2xl font-bold text-emerald-600">{submission.grade}</span>
                                                        <span className="text-[10px] text-gray-400 ml-1">pts</span>
                                                    </div>
                                                )}
                                            </div>

                                            <Link href={`/dashboard/student/assignments/${assignment.id}`} className="w-full pt-2">
                                                <Button variant="outline" className="w-full h-11 rounded-lg text-sm border-gray-200 hover:bg-gray-50">
                                                    {isGraded ? "View Feedback" : "Edit Submission"}
                                                </Button>
                                            </Link>
                                        </div>
                                    </CardContent>
                                </Card>
                            )
                        })
                    ) : (
                        <div className="col-span-full py-20 flex flex-col items-center justify-center bg-gray-50 rounded-2xl border-2 border-dashed border-gray-200">
                            <BookOpen className="w-12 h-12 text-gray-200 mb-4" />
                            <h3 className="text-xl font-bold text-gray-400 text-center">No Submissions</h3>
                        </div>
                    )
                )}
            </div>
        </div>
    );
}
