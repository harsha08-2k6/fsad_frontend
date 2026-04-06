"use client";
import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { 
    Calendar, 
    FileText, 
    ArrowLeft, 
    CircleCheck, 
    CircleAlert, 
    CloudUpload, 
    FileUp,
    Clock, 
    GraduationCap,
    Download,
    Target
} from "lucide-react";
import Link from "next/link";
import { format } from "date-fns";

export default function SubmitAssignmentPage() {
    const params = useParams();
    const router = useRouter();
    const { data: session } = useSession();
    const [assignment, setAssignment] = useState(null);
    const [submission, setSubmission] = useState(null);
    const [file, setFile] = useState(null);
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);

    useEffect(() => {
        const fetchData = async () => {
            if (!session?.user?.id) return;
            try {
                const assignmentRes = await fetch(`/api/assignments/${params.id}`);
                if (assignmentRes.ok) {
                    setAssignment(await assignmentRes.json());
                }
                const submissionsRes = await fetch(`/api/submissions?assignmentId=${params.id}&studentId=${session.user.id}`);
                if (submissionsRes.ok) {
                    const data = await submissionsRes.json();
                    if (data.length > 0) {
                        setSubmission(data[0]);
                    }
                }
            } catch (error) {
                console.error("Failed to fetch data", error);
            } finally {
                setLoading(false);
            }
        };
        if (params.id) {
            fetchData();
        }
    }, [params.id, session]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!file) return;
        setSubmitting(true);
        try {
            const formData = new FormData();
            formData.append("file", file);
            const uploadRes = await fetch("/api/upload", {
                method: "POST",
                body: formData,
            });
            if (uploadRes.ok) {
                const data = await uploadRes.json();
                const fileUrl = data.url;
                const url = submission ? `/api/submissions/${submission.id}` : "/api/submissions";
                const method = submission ? "PUT" : "POST";
                const res = await fetch(url, {
                    method: method,
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify({
                        assignmentId: params.id,
                        studentId: session?.user?.id,
                        fileUrl,
                    }),
                });
                if (res.ok) {
                    router.refresh();
                    window.location.reload();
                }
            }
        } catch (error) {
            console.error("Failed to submit", error);
        } finally {
            setSubmitting(false);
        }
    };

    if (loading) return (
        <div className="flex h-64 items-center justify-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
    );
    
    if (!assignment) return (
        <div className="max-w-3xl mx-auto py-12 text-center space-y-4">
            <CircleAlert className="w-16 h-16 text-red-500 mx-auto" />
            <h2 className="text-2xl font-bold text-gray-900">Assignment not found</h2>
            <Link href="/dashboard/student/assignments">
                <Button variant="outline">Back to Assignments</Button>
            </Link>
        </div>
    );

    const isOverdue = new Date(assignment.deadline) < new Date();

    return (
        <div className="space-y-8 animate-in fade-in duration-500 max-w-5xl mx-auto px-4 py-6">
            {/* Header section */}
            <div className="page-header flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="space-y-1">
                    <div className="flex items-center gap-2 text-blue-600 hover:text-blue-700 font-medium mb-4 transition-colors">
                        <Link href="/dashboard/student/assignments" className="group flex items-center gap-1.5 font-black text-xs uppercase tracking-widest text-gray-400 hover:text-navy">
                            <div className="p-1.5 rounded-lg border border-gray-100 group-hover:border-navy/20 mr-1">
                                <ArrowLeft className="w-4 h-4" />
                            </div>
                            Back
                        </Link>
                    </div>
                    <h1 className="page-title text-4xl font-black tracking-tight text-navy">{assignment.title}</h1>
                    <p className="page-subtitle flex items-center gap-1.5 pt-1 text-gray-500 font-bold uppercase text-[10px] tracking-widest">
                        <GraduationCap className="w-4 h-4 text-primary" />
                        {assignment.subject?.name || "No Subject"}
                    </p>
                </div>
                
                <div className="flex flex-col items-end gap-2">
                    <Badge variant={isOverdue ? "destructive" : "secondary"} className="text-sm font-black px-5 py-2 shadow-sm">
                        <Clock className="w-4 h-4 mr-2" />
                        Due {format(new Date(assignment.deadline), "MMM d, h:mm a")}
                    </Badge>
                    {isOverdue && <span className="text-[10px] font-black text-red-500 animate-pulse tracking-widest">LATE SUBMISSION</span>}
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
                {/* Main content - 3/5 width */}
                <div className="lg:col-span-3 space-y-8 relative">
                    <div className="absolute -top-10 -left-10 w-48 h-48 bg-primary/5 rounded-full blur-2xl -z-10"></div>
                    <Card className="content-card shadow-[0_32px_64px_-16px_rgba(11,31,58,0.15)] border-none overflow-hidden">
                        <CardHeader className="bg-navy/5 border-b border-gray-100 p-6">
                            <CardTitle className="flex items-center gap-3 text-xl font-black text-navy">
                                <FileText className="w-6 h-6 text-primary" />
                                Details
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="content-card-body pt-4">
                            <div className="prose max-w-none text-gray-700 leading-relaxed whitespace-pre-wrap">
                                {assignment.description}
                            </div>
                            
                            {(assignment.file_url || assignment.fileUrl) && (
                                <div className="mt-8 p-6 rounded-2xl bg-gray-50 border-2 border-dashed border-gray-100 flex items-center justify-between group hover:bg-gray-100 transition-all">
                                    <div className="flex items-center gap-4">
                                        <div className="p-3 bg-white rounded-xl shadow-sm border border-gray-100">
                                            <Download className="w-6 h-6 text-blue-500" />
                                        </div>
                                        <div>
                                            <h4 className="text-sm font-black text-navy uppercase tracking-widest">Reference File</h4>
                                            <p className="text-xs text-gray-400 font-bold">Download assignment materials</p>
                                        </div>
                                    </div>
                                    <a href={assignment.file_url || assignment.fileUrl} target="_blank" rel="noopener noreferrer">
                                        <Button variant="outline" className="h-10 rounded-xl border-2 font-black text-[10px] uppercase tracking-widest hover:bg-navy hover:text-white transition-all shadow-sm">
                                            Download
                                        </Button>
                                    </a>
                                </div>
                            )}
                        </CardContent>
                    </Card>

                    {submission && submission.feedback && (
                        <div className="p-8 rounded-2xl bg-gradient-to-br from-indigo-50 to-white border border-indigo-100 shadow-xl shadow-indigo-100/20 transform hover:-translate-y-1 transition-all">
                            <div className="flex items-center gap-3 mb-4">
                                <Target className="w-5 h-5 text-indigo-600" />
                                <h3 className="font-black text-navy uppercase tracking-widest text-sm">Teacher Feedback</h3>
                            </div>
                            <p className="text-gray-700 italic border-l-4 border-indigo-200 pl-5 py-2 font-medium leading-relaxed">
                                "{submission.feedback}"
                            </p>
                        </div>
                    )}
                </div>

                {/* Submission Sidebar - 2/5 width */}
                <div className="lg:col-span-2 space-y-6">
                    <Card className="content-card shadow-[0_32px_64px_-16px_rgba(11,31,58,0.15)] border-none overflow-visible relative">
                        {submission && submission.grade !== undefined && (
                            <div className="absolute -top-4 -right-4 bg-emerald-600 text-white w-24 h-24 rounded-[2rem] flex flex-col items-center justify-center shadow-xl border-4 border-white transform rotate-12 z-10">
                                <span className="text-[10px] font-black uppercase tracking-widest opacity-80">Grade</span>
                                <span className="text-3xl font-black leading-none">{submission.grade}</span>
                            </div>
                        )}
                        
                        <CardHeader className="content-card-header pb-2">
                            <CardTitle className="text-xl flex items-center gap-2">
                                <CircleCheck className="w-5 h-5 text-emerald-500" />
                                Status
                            </CardTitle>
                        </CardHeader>
                        
                        <CardContent className="content-card-body">
                            {submission ? (
                                <div className="space-y-6">
                                    <div className="flex flex-col gap-4 p-5 rounded-2xl bg-gray-50 border border-gray-100 shadow-inner">
                                        <div className="flex justify-between items-center">
                                            <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Status</span>
                                            <Badge className={`px-4 py-1.5 rounded-lg font-black text-[10px] tracking-widest uppercase ${
                                                submission.status === 'graded' ? 'bg-emerald-100 text-emerald-700' : 'bg-blue-100 text-blue-700'
                                            }`}>
                                                {submission.status === 'graded' ? 'Graded' : 'Submitted'}
                                            </Badge>
                                        </div>
                                        <div className="flex justify-between items-center">
                                            <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Submitted</span>
                                            <span className="text-sm font-black text-navy">{format(new Date(submission.submitted_at || submission.submittedAt), "MMM d, h:mm a")}</span>
                                        </div>
                                    </div>

                                    <div className="flex justify-center p-8 border-2 border-dashed border-gray-200 rounded-2xl bg-white hover:border-primary/30 hover:bg-primary/5 transition-all group">
                                        <a href={submission.file_url || submission.fileUrl} target="_blank" rel="noopener noreferrer" className="flex flex-col items-center gap-3 text-center">
                                            <div className="p-4 bg-gray-50 rounded-2xl text-gray-400 group-hover:text-primary transition-colors shadow-inner">
                                                <FileText className="w-10 h-10" />
                                            </div>
                                            <span className="text-xs font-black text-blue-600 uppercase tracking-widest hover:underline">View Submitted File</span>
                                        </a>
                                    </div>

                                    {submission.status !== "graded" && (
                                        <div className="pt-6 border-t border-gray-100">
                                            <Label className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-3 block">Update submission?</Label>
                                            <form onSubmit={handleSubmit} className="space-y-4">
                                                <div className="relative group/up">
                                                    <Input 
                                                        id="file-update" 
                                                        type="file" 
                                                        onChange={(e) => setFile(e.target.files?.[0] || null)} 
                                                        className="h-14 opacity-0 absolute inset-0 z-10 cursor-pointer"
                                                        required 
                                                    />
                                                    <div className="h-14 w-full rounded-2xl border-2 border-gray-100 bg-gray-50 group-hover/up:bg-white group-hover/up:border-primary/30 transition-all flex items-center px-4 gap-3">
                                                        <CloudUpload className="w-5 h-5 text-gray-400" />
                                                        <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest truncate">{file ? file.name : "Select new file"}</span>
                                                    </div>
                                                </div>
                                                <Button type="submit" disabled={submitting || !file} className="w-full h-14 btn-primary-custom shadow-xl shadow-primary/10 font-black text-xs uppercase tracking-[0.2em] rounded-2xl">
                                                    {submitting ? "Updating..." : "Submit Again"}
                                                </Button>
                                            </form>
                                        </div>
                                    )}
                                </div>
                            ) : (
                                <div className="space-y-6">
                                    <div className="text-center py-8 px-4 border-2 border-dashed border-primary/20 rounded-2xl bg-primary/5">
                                        <CloudUpload className="w-12 h-12 text-primary mx-auto mb-3" />
                                        <h3 className="text-xs font-black text-navy uppercase tracking-widest">Upload Work</h3>
                                        <p className="text-[10px] font-bold text-gray-400 mt-1 uppercase tracking-tighter">
                                            PDF, DOCX, or Image (Max 10MB)
                                        </p>
                                    </div>
                                    
                                    <form onSubmit={handleSubmit} className="space-y-6">
                                        <div className="space-y-2">
                                            <Label htmlFor="file" className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Select File</Label>
                                            <div className="relative group/up">
                                                <Input 
                                                    id="file" 
                                                    type="file" 
                                                    onChange={(e) => setFile(e.target.files?.[0] || null)} 
                                                    required 
                                                    className="h-14 opacity-0 absolute inset-0 z-10 cursor-pointer"
                                                />
                                                <div className="h-14 w-full rounded-2xl border-2 border-gray-100 bg-gray-50 group-hover/up:bg-white group-hover/up:border-primary/30 transition-all flex items-center px-4 gap-3">
                                                    <FileUp className="w-5 h-5 text-gray-400" />
                                                    <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest truncate">{file ? file.name : "Tap to browse"}</span>
                                                </div>
                                            </div>
                                        </div>
                                        <Button type="submit" disabled={submitting || !file} className="w-full h-16 btn-primary-custom shadow-2xl shadow-primary/20 font-black text-sm uppercase tracking-[0.2em] rounded-2xl">
                                            {submitting ? "Submitting..." : "Submit"}
                                        </Button>
                                    </form>
                                </div>
                            )}
                        </CardContent>
                    </Card>
                    
                    <div className="p-6 rounded-2xl bg-navy/5 border border-navy/5 text-center">
                        <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest leading-relaxed">
                            Submissions are tracked. Please submit before the deadline.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}

