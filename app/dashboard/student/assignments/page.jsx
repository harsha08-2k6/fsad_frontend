"use client";
import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Clock, CheckCircle, AlertCircle, ArrowRight, FileText, Calendar } from "lucide-react";
import Link from "next/link";
import { formatDistanceToNow } from "date-fns";
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
    const TabButton = ({ id, label, count, icon: Icon }) => (<button onClick={() => setActiveTab(id)} className={`flex items-center px-6 py-3 font-medium text-sm transition-all border-b-2 ${activeTab === id
        ? "border-blue-600 text-blue-600"
        : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"}`}>
        <Icon className="w-4 h-4 mr-2" />
        {label}
        <span className={`ml-2 px-2 py-0.5 rounded-full text-xs ${activeTab === id ? "bg-blue-100 text-blue-600" : "bg-gray-100 text-gray-600"}`}>
            {count}
        </span>
    </button>);
    if (loading) {
        return <div className="p-8 text-center text-gray-500">Loading assignments...</div>;
    }
    return (<div className="space-y-6">
        <div>
            <h1 className="text-3xl font-bold text-gray-900">My Assignments</h1>
            <p className="text-gray-500 mt-1">Manage your coursework and track your submissions.</p>
        </div>

        {/* Tabs */}
        <div className="border-b border-gray-200">
            <div className="flex space-x-4">
                <TabButton id="pending" label="Pending" count={pendingAssignments.length} icon={Clock} />
                <TabButton id="completed" label="Completed" count={completedAssignments.length} icon={CheckCircle} />
            </div>
        </div>

        {/* Content */}
        <div className="grid grid-cols-1 gap-4">
            {activeTab === "pending" ? (pendingAssignments.length > 0 ? (pendingAssignments.map((assignment) => (<Card key={assignment.id} className="hover:shadow-md transition-shadow">
                <CardContent className="p-6">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                        <div className="space-y-2">
                            <div className="flex items-center space-x-2">
                                <Badge variant="outline" className="text-blue-600 border-blue-200 bg-blue-50">
                                    {assignment.subject?.name || "Subject"}
                                </Badge>
                                {new Date(assignment.deadline) < new Date() && (<Badge variant="destructive">Overdue</Badge>)}
                            </div>
                            <h3 className="text-lg font-semibold text-gray-900">{assignment.title}</h3>
                            <div className="flex items-center text-sm text-gray-500 space-x-4">
                                <div className="flex items-center">
                                    <Calendar className="w-4 h-4 mr-1" />
                                    Due {new Date(assignment.deadline).toLocaleDateString()}
                                </div>
                                <div className="flex items-center text-orange-600">
                                    <AlertCircle className="w-4 h-4 mr-1" />
                                    {formatDistanceToNow(new Date(assignment.deadline), { addSuffix: true })}
                                </div>
                            </div>
                            {(assignment.file_url || assignment.fileUrl) && (
                                <div className="mt-4 pt-4 border-t border-gray-100">
                                    <a 
                                        href={assignment.file_url || assignment.fileUrl} 
                                        target="_blank" 
                                        rel="noopener noreferrer" 
                                        className="inline-flex items-center text-sm font-medium text-blue-600 hover:text-blue-800 bg-blue-50 px-3 py-1.5 rounded-md transition-colors"
                                    >
                                        <FileText className="w-4 h-4 mr-2" />
                                        View Attachment
                                    </a>
                                </div>
                            )}
                        </div>
                        <Link href={`/dashboard/student/assignments/${assignment.id}`}>
                            <Button className="w-full md:w-auto">
                                Submit Assignment
                                <ArrowRight className="w-4 h-4 ml-2" />
                            </Button>
                        </Link>
                    </div>
                </CardContent>
            </Card>))) : (<div className="text-center py-12 bg-gray-50 rounded-lg border-2 border-dashed border-gray-200">
                <CheckCircle className="w-12 h-12 mx-auto text-green-500 mb-4" />
                <h3 className="text-lg font-medium text-gray-900">All caught up!</h3>
                <p className="text-gray-500">You have no pending assignments.</p>
            </div>)) : (completedAssignments.length > 0 ? (completedAssignments.map((assignment) => {
                const submission = submissionMap.get(assignment.id);
                return (<Card key={assignment.id} className="bg-gray-50/50">
                    <CardContent className="p-6">
                        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                            <div className="space-y-2">
                                <div className="flex items-center space-x-2">
                                    <Badge variant="outline" className="text-gray-600">
                                        {assignment.subject?.name || "Subject"}
                                    </Badge>
                                    <Badge className="bg-green-100 text-green-700 hover:bg-green-100 border-green-200">
                                        Submitted
                                    </Badge>
                                </div>
                                <h3 className="text-lg font-semibold text-gray-900">{assignment.title}</h3>
                                <div className="flex items-center text-sm text-gray-500">
                                    <Clock className="w-4 h-4 mr-1" />
                                    Submitted on {new Date(submission.submitted_at || submission.submittedAt).toLocaleDateString()}
                                </div>
                                {(assignment.file_url || assignment.fileUrl) && (
                                    <div className="mt-3">
                                        <a 
                                            href={assignment.file_url || assignment.fileUrl} 
                                            target="_blank" 
                                            rel="noopener noreferrer" 
                                            className="inline-flex items-center text-xs font-medium text-blue-600 hover:text-blue-800 bg-blue-50/50 px-2.5 py-1 rounded-md transition-colors border border-blue-100"
                                        >
                                            <FileText className="w-3 h-3 mr-1.5" />
                                            Original Attachment
                                        </a>
                                    </div>
                                )}
                            </div>
                            <div className="flex items-center space-x-2">
                                {submission.grade !== undefined ? (<div className="text-right mr-2">
                                    <p className="text-xs text-gray-500 uppercase font-semibold">Grade</p>
                                    <p className="text-2xl font-bold text-green-600">{submission.grade}/100</p>
                                </div>) : (<>
                                    <div className="px-3 py-1 bg-yellow-50 text-yellow-700 rounded-md text-xs font-medium border border-yellow-200 mr-2">
                                        Pending Grading
                                    </div>
                                    <Link href={`/dashboard/student/assignments/${assignment.id}`}>
                                        <Button variant="outline" size="sm" className="h-8">
                                            <FileText className="w-3 h-3 mr-1" />
                                            Edit
                                        </Button>
                                    </Link>
                                    <Button variant="destructive" size="sm" className="h-8" onClick={async () => {
                                        if (confirm("Are you sure you want to delete this submission?")) {
                                            try {
                                                const res = await fetch(`/api/submissions/${submission.id}`, {
                                                    method: "DELETE"
                                                });
                                                if (res.ok) {
                                                    window.location.reload();
                                                }
                                            }
                                            catch (err) {
                                                console.error("Failed to delete", err);
                                            }
                                        }
                                    }}>
                                        <AlertCircle className="w-3 h-3 mr-1" />
                                        Delete
                                    </Button>
                                </>)}
                                {submission.grade !== undefined && (<Link href={`/dashboard/student/assignments/${assignment.id}`}>
                                    <Button variant="outline" size="sm">
                                        View Details
                                    </Button>
                                </Link>)}
                            </div>
                        </div>
                    </CardContent>
                </Card>);
            })) : (<div className="text-center py-12 bg-gray-50 rounded-lg border-2 border-dashed border-gray-200">
                <FileText className="w-12 h-12 mx-auto text-gray-400 mb-4" />
                <h3 className="text-lg font-medium text-gray-900">No completed work yet</h3>
                <p className="text-gray-500">Finish your pending assignments to see them here.</p>
            </div>))}
        </div>
    </div>);
}
