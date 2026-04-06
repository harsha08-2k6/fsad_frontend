"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter,
    DialogDescription,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { 
    Trash2, 
    Edit, 
    CalendarIcon, 
    CalendarClock, 
    CheckCircle2, 
    AlertCircle, 
    FileText, 
    Plus, 
    Users, 
    Clock, 
    ChevronRight,
    Search,
    Filter,
    Download
} from "lucide-react";
import { format, isAfter, startOfDay } from "date-fns";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/lib/utils";

export default function TeacherAssignmentsPage() {
    const [assignments, setAssignments] = useState([]);
    const [submissions, setSubmissions] = useState({});
    const [loading, setLoading] = useState(true);
    const [gradingSubmission, setGradingSubmission] = useState(null);
    const [grade, setGrade] = useState("");
    const [feedback, setFeedback] = useState("");

    const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
    const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
    const [editForm, setEditForm] = useState({ id: "", title: "", description: "", deadline: null, dueTime: "23:59", fileUrl: "" });
    const [assignmentToDelete, setAssignmentToDelete] = useState(null);
    const [isUpdating, setIsUpdating] = useState(false);
    const [newTime, setNewTime] = useState("23:59");

    // Extend Deadline state
    const [isExtendDialogOpen, setIsExtendDialogOpen] = useState(false);
    const [extendTarget, setExtendTarget] = useState(null);
    const [newDeadline, setNewDeadline] = useState(null);
    const [isExtending, setIsExtending] = useState(false);
    const [extendError, setExtendError] = useState("");
    const [successMessage, setSuccessMessage] = useState("");

    useEffect(() => {
        fetchAssignments();
    }, []);

    const fetchAssignments = async () => {
        try {
            const res = await fetch('/api/assignments');
            const data = await res.json();
            if (Array.isArray(data)) {
                setAssignments(data);
                for (const assignment of data) {
                    fetchSubmissionsForAssignment(assignment.id);
                }
            }
        } catch (error) {
            console.error('Error fetching assignments:', error);
        } finally {
            setLoading(false);
        }
    };

    const fetchSubmissionsForAssignment = async (assignmentId) => {
        try {
            const res = await fetch(`/api/submissions?assignmentId=${assignmentId}`);
            const data = await res.json();
            if (Array.isArray(data)) {
                setSubmissions(prev => ({ ...prev, [assignmentId]: data }));
            }
        } catch (error) {
            console.error('Error fetching submissions:', error);
        }
    };

    const handleGradeClick = (submission) => {
        setGradingSubmission(submission.id);
        setGrade(submission.grade || "");
        setFeedback(submission.feedback || "");
    };

    const handleCancelGrade = () => {
        setGradingSubmission(null);
        setGrade("");
        setFeedback("");
    };

    const handleSubmitGrade = async (submissionId, assignmentId) => {
        try {
            const res = await fetch('/api/submissions/grade', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ submissionId, grade: Number(grade), feedback })
            });
            if (res.ok) {
                fetchSubmissionsForAssignment(assignmentId);
                handleCancelGrade();
            }
        } catch (error) {
            console.error('Error submitting grade:', error);
        }
    };

    const handleEditOpen = (assignment) => {
        const d = new Date(assignment.deadline);
        const hours = String(d.getHours()).padStart(2, '0');
        const minutes = String(d.getMinutes()).padStart(2, '0');
        
        setEditForm({
            id: assignment.id,
            title: assignment.title,
            description: assignment.description,
            deadline: d,
            dueTime: `${hours}:${minutes}`,
            fileUrl: assignment.file_url || assignment.fileUrl || ""
        });
        setIsEditDialogOpen(true);
    };

    const handleUpdateAssignment = async () => {
        if (!editForm.title || !editForm.description || !editForm.deadline) return;
        setIsUpdating(true);
        try {
            const finalDeadline = new Date(editForm.deadline);
            if (editForm.dueTime) {
                const [h, m] = editForm.dueTime.split(':');
                finalDeadline.setHours(parseInt(h), parseInt(m));
            }

            const res = await fetch(`/api/assignments/${editForm.id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    title: editForm.title,
                    description: editForm.description,
                    deadline: finalDeadline,
                    fileUrl: editForm.fileUrl
                })
            });
            if (res.ok) {
                fetchAssignments();
                setIsEditDialogOpen(false);
            }
        } catch (error) {
            console.error('Error updating assignment:', error);
        } finally {
            setIsUpdating(false);
        }
    };

    const handleDeleteClick = (assignment) => {
        setAssignmentToDelete(assignment);
        setIsDeleteDialogOpen(true);
    };

    const confirmDelete = async () => {
        if (!assignmentToDelete) return;
        try {
            const res = await fetch(`/api/assignments/${assignmentToDelete.id}`, {
                method: 'DELETE'
            });
            if (res.ok) {
                fetchAssignments();
                setIsDeleteDialogOpen(false);
                setAssignmentToDelete(null);
            }
        } catch (error) {
            console.error('Error deleting assignment:', error);
        }
    };

    // ── Extend Deadline handlers ──────────────────────────────────────────────
    const handleExtendOpen = (assignment) => {
        setExtendTarget(assignment);
        const d = new Date(assignment.deadline);
        setNewDeadline(d);
        const hours = String(d.getHours()).padStart(2, '0');
        const minutes = String(d.getMinutes()).padStart(2, '0');
        setNewTime(`${hours}:${minutes}`);
        setExtendError("");
        setIsExtendDialogOpen(true);
    };

    const handleExtendDeadline = async () => {
        if (!newDeadline) {
            setExtendError("Please select a new deadline.");
            return;
        }

        const finalDeadline = new Date(newDeadline);
        if (newTime) {
            const [h, m] = newTime.split(':');
            finalDeadline.setHours(parseInt(h), parseInt(m));
        }

        const currentDeadline = new Date(extendTarget.deadline);
        if (!isAfter(finalDeadline, currentDeadline)) {
            setExtendError("New deadline must be later than the current deadline.");
            return;
        }
        setIsExtending(true);
        setExtendError("");
        try {
            const res = await fetch(`/api/assignments/${extendTarget.id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    title: extendTarget.title,
                    description: extendTarget.description,
                    fileUrl: extendTarget.file_url || extendTarget.fileUrl,
                    deadline: finalDeadline,
                })
            });
            if (res.ok) {
                fetchAssignments();
                const msg = `Deadline for "${extendTarget.title}" extended to ${format(finalDeadline, "PPP p")}.`;
                setIsExtendDialogOpen(false);
                setExtendTarget(null);
                setNewDeadline(null);
                setSuccessMessage(msg);
                setTimeout(() => setSuccessMessage(""), 5000);
            } else {
                const data = await res.json();
                setExtendError(data.message || "Failed to extend deadline.");
            }
        } catch (error) {
            console.error('Error extending deadline:', error);
            setExtendError("An unexpected error occurred.");
        } finally {
            setIsExtending(false);
        }
    };
    // ─────────────────────────────────────────────────────────────────────────

    if (loading) {
        return (
            <div className="flex h-64 items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
            </div>
        );
    }

    return (
        <div className="space-y-8 animate-in fade-in duration-500 max-w-7xl mx-auto px-4 py-6">
            {/* Success Banner */}
            {successMessage && (
                <div className="flex items-center gap-3 rounded-2xl border border-green-200 bg-green-50 px-6 py-4 text-green-800 shadow-sm animate-in slide-in-from-top duration-300">
                    <div className="bg-green-100 p-2 rounded-full">
                        <CheckCircle2 className="h-5 w-5 text-green-600 shrink-0" />
                    </div>
                    <span className="text-sm font-bold tracking-tight">{successMessage}</span>
                </div>
            )}

            <div className="page-header flex flex-col md:flex-row md:items-center justify-between gap-6 border-b border-gray-100 pb-8">
                <div className="space-y-1">
                    <h1 className="page-title text-4xl font-black tracking-tight text-navy">
                        Assignments & <span className="text-primary italic">Grading</span>
                    </h1>
                </div>
                <Link href="/dashboard/teacher/assignments/new">
                    <Button className="btn-primary-custom h-14 px-8 shadow-2xl hover:scale-[1.02] transition-all text-base font-black uppercase tracking-widest gap-2">
                        <Plus className="w-5 h-5 stroke-[3]" />
                        Create Assignment
                    </Button>
                </Link>
            </div>

            <div className="grid grid-cols-1 gap-10">
                {assignments.map((assignment) => {
                    const assignmentSubmissions = submissions[assignment.id] || [];
                    const submissionCount = assignmentSubmissions.length;
                    const isOverdue = new Date(assignment.deadline) < new Date();
                    const gradedCount = assignmentSubmissions.filter(s => s.status === 'graded').length;
                    
                    return (
                        <Card key={assignment.id} className="content-card shadow-xl border-none overflow-visible group">
                            <CardHeader className="content-card-header bg-navy/5 border-b-0 py-8 px-8 flex flex-col md:flex-row md:items-center justify-between gap-6 relative">
                                <div className="absolute -left-1 top-8 bottom-8 w-1.5 bg-primary rounded-full transform group-hover:scale-y-110 transition-transform"></div>
                                <div className="flex-1 space-y-3">
                                    <div className="flex items-center gap-3 flex-wrap">
                                        <CardTitle className="text-2xl font-black text-navy">{assignment.title}</CardTitle>
                                        <Badge variant="outline" className="bg-white/50 border-gray-200 text-gray-400 font-black text-[10px] uppercase tracking-widest px-3 py-1">
                                            {assignment.subject?.name || "No Class"}
                                        </Badge>
                                        {isOverdue && (
                                            <Badge variant="destructive" className="animate-pulse shadow-sm shadow-red-200">
                                                Overdue
                                            </Badge>
                                        )}
                                    </div>
                                    <p className="text-gray-600 font-medium max-w-2xl leading-relaxed">{assignment.description}</p>
                                    <div className="flex items-center gap-6 pt-2">
                                        <div className="flex items-center gap-2 text-xs font-black text-gray-400 uppercase tracking-widest bg-white px-3 py-1.5 rounded-lg border border-gray-100 shadow-sm">
                                            <CalendarIcon className="w-3.5 h-3.5 text-primary" />
                                            Deadline: {format(new Date(assignment.deadline), "MMMM d, h:mm a")}
                                        </div>
                                        <div className="flex items-center gap-2 text-xs font-black text-gray-400 uppercase tracking-widest bg-white px-3 py-1.5 rounded-lg border border-gray-100 shadow-sm">
                                            <Users className="w-3.5 h-3.5 text-emerald-500" />
                                            {submissionCount} Submissions
                                        </div>
                                    </div>
                                </div>
                                <div className="flex items-center gap-2 bg-white/40 p-2 rounded-2xl backdrop-blur-sm shadow-inner border border-white/50">
                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        className="h-12 w-12 rounded-xl hover:bg-white hover:text-amber-600 transition-all active:scale-95"
                                        title="Extend Deadline"
                                        onClick={() => handleExtendOpen(assignment)}
                                    >
                                        <CalendarClock className="h-6 w-6 stroke-[2]" />
                                    </Button>
                                    <Button 
                                        variant="ghost" 
                                        size="icon" 
                                        className="h-12 w-12 rounded-xl hover:bg-white hover:text-blue-600 transition-all active:scale-95"
                                        onClick={() => handleEditOpen(assignment)}
                                        title="Edit Assignment"
                                    >
                                        <Edit className="h-6 w-6 stroke-[2]" />
                                    </Button>
                                    <Button 
                                        variant="ghost" 
                                        size="icon" 
                                        className="h-12 w-12 rounded-xl hover:bg-white hover:text-red-600 transition-all active:scale-95"
                                        onClick={() => handleDeleteClick(assignment)}
                                        title="Delete Assignment"
                                    >
                                        <Trash2 className="h-6 w-6 stroke-[2]" />
                                    </Button>
                                </div>
                            </CardHeader>
                            <CardContent className="content-card-body p-8 pt-4">
                                {submissionCount === 0 ? (
                                    <div className="text-center py-16 bg-gray-50/50 rounded-3xl border-2 border-dashed border-gray-200">
                                        <h3 className="text-lg font-bold text-gray-400">No submissions</h3>
                                    </div>
                                ) : (
                                    <div className="space-y-6">
                                        <div className="flex items-center justify-between">
                                            <h3 className="font-black text-navy text-sm uppercase tracking-widest pl-1 border-l-4 border-emerald-500 ml-1">Student Submissions</h3>
                                            <div className="text-xs font-bold text-gray-400 bg-gray-50 px-3 py-1 rounded-full border border-gray-100">
                                                Graded: <span className="text-emerald-600">{gradedCount}</span> / {submissionCount}
                                            </div>
                                        </div>
                                        
                                        <div className="grid grid-cols-1 gap-4">
                                            {assignmentSubmissions.map((submission) => (
                                                <div key={submission.id} className="relative group/sub overflow-hidden rounded-2xl border border-gray-100 bg-white hover:border-primary/30 hover:shadow-xl hover:shadow-primary/5 transition-all duration-300">
                                                    <div className="p-6 flex flex-col md:flex-row md:items-center justify-between gap-6">
                                                       {/* Student Details */}
                                                        <div className="flex items-center gap-4">
                                                            <div className="h-12 w-12 rounded-full bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center font-black text-gray-400 group-hover/sub:from-primary/10 group-hover/sub:to-primary/20 group-hover/sub:text-primary transition-all">
                                                                {((submission.student || submission.studentId)?.name || 'U').charAt(0)}
                                                            </div>
                                                            <div className="space-y-0.5">
                                                                <h4 className="font-black text-navy text-base leading-none">{(submission.student || submission.studentId)?.name || 'Unknown Student'}</h4>
                                                                <p className="text-xs font-bold text-gray-400">{(submission.student || submission.studentId)?.email}</p>
                                                            </div>
                                                        </div>

                                                        {/* Submission Meta */}
                                                        <div className="flex flex-col md:items-center gap-1">
                                                            <div className="flex items-center gap-1.5 text-xs font-bold text-gray-500 uppercase tracking-tighter bg-gray-50 px-3 py-1.5 rounded-lg shadow-inner">
                                                                <Clock className="w-3 h-3 text-gray-400" />
                                                                {format(new Date(submission.submitted_at || submission.submittedAt), "MMM d, h:mm a")}
                                                            </div>
                                                            {submission.file_url || submission.fileUrl ? (
                                                                <a 
                                                                    href={submission.file_url || submission.fileUrl} 
                                                                    target="_blank" 
                                                                    rel="noopener noreferrer" 
                                                                    className="group/file flex items-center gap-1.5 text-xs font-black text-blue-600 hover:text-blue-700 uppercase tracking-widest pl-1"
                                                                >
                                                                    <Download className="w-3.5 h-3.5 stroke-[3] group-hover/file:translate-y-0.5 transition-transform" />
                                                                    View Workspace
                                                                </a>
                                                            ) : <span className="text-[10px] font-bold text-red-300 uppercase pl-1">No File Attached</span>}
                                                        </div>

                                                        {/* Status & Grade */}
                                                        <div className="flex items-center gap-6">
                                                            {gradingSubmission === submission.id ? (
                                                                <div className="flex flex-col md:flex-row items-center gap-3 animate-in slide-in-from-right duration-300">
                                                                    <div className="relative w-full md:w-24">
                                                                        <Input
                                                                            type="number"
                                                                            placeholder="Grade"
                                                                            value={grade}
                                                                            onChange={(e) => setGrade(e.target.value)}
                                                                            max={100}
                                                                            className="h-10 text-center font-black rounded-xl border-2 border-primary/20 focus:border-primary shadow-inner"
                                                                        />
                                                                        <span className="absolute -bottom-4 left-0 right-0 text-[8px] font-black text-center text-gray-300 uppercase tracking-widest">Score / 100</span>
                                                                    </div>
                                                                    <div className="flex gap-2">
                                                                        <Button size="sm" onClick={() => handleSubmitGrade(submission.id, assignment.id)} className="btn-primary-custom h-10 px-4">
                                                                            Save
                                                                        </Button>
                                                                        <Button size="sm" variant="ghost" onClick={handleCancelGrade} className="h-10 text-xs font-bold text-gray-400 hover:text-gray-900 border-none uppercase tracking-widest">
                                                                            Cancel
                                                                        </Button>
                                                                    </div>
                                                                </div>
                                                            ) : (
                                                                <div className="flex items-center gap-6">
                                                                    <div className="text-right">
                                                                        {submission.grade !== undefined ? (
                                                                            <div className="flex flex-col items-end">
                                                                                <span className="text-3xl font-black text-emerald-600 leading-none tracking-tighter">{submission.grade}</span>
                                                                                <span className="text-[10px] font-black text-gray-300 uppercase tracking-widest">Points Secured</span>
                                                                            </div>
                                                                        ) : (
                                                                            <Badge className="bg-amber-50 text-amber-600 border-amber-100 font-black uppercase text-[10px] tracking-widest py-1.5 px-3">
                                                                                Needs Review
                                                                            </Badge>
                                                                        )}
                                                                    </div>
                                                                    <Button 
                                                                        variant="outline" 
                                                                        size="sm" 
                                                                        onClick={() => handleGradeClick(submission)} 
                                                                        className="h-12 w-12 rounded-2xl border-2 border-gray-100 hover:border-primary hover:bg-primary hover:text-white transition-all transform hover:rotate-12 duration-200 shadow-sm"
                                                                        title="Evaluate Work"
                                                                    >
                                                                        <GraduationCap className="h-5 w-5 stroke-[2]" />
                                                                    </Button>
                                                                </div>
                                                            )}
                                                        </div>
                                                    </div>
                                                    
                                                    {/* Feedback display (collapsed) */}
                                                    {submission.feedback && gradingSubmission !== submission.id && (
                                                        <div className="px-6 pb-6 pt-0">
                                                            <div className="bg-gray-50/80 p-4 rounded-xl border border-gray-100 flex items-start gap-3">
                                                                <Info className="w-4 h-4 text-gray-300 mt-1 shrink-0" />
                                                                <p className="text-sm font-medium text-gray-500 italic">"{submission.feedback}"</p>
                                                            </div>
                                                        </div>
                                                    )}

                                                    {/* Grading Textarea if active */}
                                                    {gradingSubmission === submission.id && (
                                                        <div className="px-6 pb-6 pt-0 animate-in slide-in-from-bottom duration-300">
                                                            <Label className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1.5 block">Feedback for {((submission.student || submission.studentId)?.name || '').split(' ')[0]}</Label>
                                                            <Textarea
                                                                placeholder="Add constructive feedback..."
                                                                value={feedback}
                                                                onChange={(e) => setFeedback(e.target.value)}
                                                                className="min-h-[100px] rounded-2xl border-2 border-gray-100 focus:border-primary/30 text-sm font-medium p-4 resize-none shadow-inner"
                                                            />
                                                        </div>
                                                    )}
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    );
                })}
            </div>

            {/* Edit Assignment Dialog */}
            <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
                <DialogContent className="sm:max-w-[450px] rounded-[2rem] overflow-hidden p-0 border-none shadow-2xl">
                    <div className="bg-navy p-8 text-white relative">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/2 blur-2xl"></div>
                        <DialogHeader>
                            <DialogTitle className="text-2xl font-black tracking-tight flex items-center gap-3">
                                <Edit className="w-6 h-6 text-primary" />
                                Edit Assignment
                            </DialogTitle>
                            <DialogDescription className="text-white/60 font-medium pt-1">Update parameters for this assessment.</DialogDescription>
                        </DialogHeader>
                    </div>
                    <div className="p-8 space-y-6 bg-white">
                        <div className="space-y-2">
                            <Label htmlFor="edit-title" className="text-xs font-black text-gray-500 uppercase tracking-widest pl-1">Title</Label>
                            <Input
                                id="edit-title"
                                value={editForm.title}
                                onChange={(e) => setEditForm(prev => ({ ...prev, title: e.target.value }))}
                                className="h-12 rounded-xl border-gray-100 bg-gray-50 focus:bg-white transition-all font-bold"
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="edit-description" className="text-xs font-black text-gray-500 uppercase tracking-widest pl-1">Description</Label>
                            <Textarea
                                id="edit-description"
                                value={editForm.description}
                                onChange={(e) => setEditForm(prev => ({ ...prev, description: e.target.value }))}
                                rows={4}
                                className="rounded-xl border-gray-100 bg-gray-50 focus:bg-white transition-all font-medium resize-none"
                            />
                        </div>
                        <div className="space-y-4">
                            <Label className="text-xs font-black text-gray-500 uppercase tracking-widest pl-1">Due Date & Time</Label>
                            <div className="flex gap-2">
                                <Popover>
                                    <PopoverTrigger asChild>
                                        <Button
                                            variant="outline"
                                            className={cn("flex-1 h-12 justify-start text-left font-bold rounded-xl border-gray-100 bg-gray-50 hover:bg-gray-100", !editForm.deadline && "text-muted-foreground")}
                                        >
                                            <CalendarIcon className="mr-3 h-5 w-5 text-primary" />
                                            {editForm.deadline ? format(editForm.deadline, "PPP") : <span>Select Date</span>}
                                        </Button>
                                    </PopoverTrigger>
                                    <PopoverContent className="w-auto p-0 rounded-2xl border-none shadow-2xl overflow-hidden">
                                        <Calendar
                                            mode="single"
                                            selected={editForm.deadline}
                                            onSelect={(date) => setEditForm(prev => ({ ...prev, deadline: date }))}
                                            initialFocus
                                        />
                                    </PopoverContent>
                                </Popover>
                                <Input
                                    type="time"
                                    value={editForm.dueTime}
                                    onChange={(e) => setEditForm(prev => ({ ...prev, dueTime: e.target.value }))}
                                    className="h-12 w-28 rounded-xl border-gray-100 bg-gray-50 focus:bg-white transition-all font-bold"
                                />
                            </div>
                        </div>
                    </div>
                    <DialogFooter className="p-8 pt-2 bg-gray-50 flex items-center justify-between">
                        <Button variant="ghost" onClick={() => setIsEditDialogOpen(false)} className="font-bold text-gray-400 uppercase tracking-widest text-xs h-12 px-6">Discard</Button>
                        <Button onClick={handleUpdateAssignment} disabled={isUpdating} className="btn-primary-custom h-12 px-10 shadow-lg">
                            {isUpdating ? <Loader2 className="animate-spin" /> : "Save Changes"}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Extend Deadline Dialog */}
            <Dialog open={isExtendDialogOpen} onOpenChange={(open) => {
                setIsExtendDialogOpen(open);
                if (!open) { setExtendError(""); }
            }}>
                <DialogContent className="sm:max-w-[420px] rounded-[2rem] p-0 overflow-hidden border-none shadow-2xl">
                    <div className="bg-amber-600 p-8 text-white">
                        <DialogHeader>
                            <DialogTitle className="text-2xl font-black flex items-center gap-2">
                                <CalendarClock className="h-7 w-7" />
                                Extend Deadline
                            </DialogTitle>
                            <DialogDescription className="text-amber-100 font-medium">
                                Grant extra time for <strong>{extendTarget?.title}</strong>.
                            </DialogDescription>
                        </DialogHeader>
                    </div>
                    <div className="p-8 space-y-6 bg-white">
                        <div className="rounded-2xl bg-amber-50 border border-amber-100 p-4">
                            <p className="text-[10px] text-amber-600 uppercase font-black tracking-widest mb-1.5 opacity-70">Currently Set To</p>
                            <p className="text-base font-black text-amber-900">
                                {extendTarget ? format(new Date(extendTarget.deadline), "MMMM d, h:mm a") : "—"}
                            </p>
                        </div>
                        <div className="space-y-2 flex flex-col">
                            <Label className="text-xs font-black text-gray-500 uppercase tracking-widest pl-1">New Assignment End Date & Time</Label>
                            <div className="flex gap-2">
                                <Popover>
                                    <PopoverTrigger asChild>
                                        <Button
                                            variant="outline"
                                            className={cn("flex-1 h-14 justify-start text-left font-black rounded-2xl border-2 border-gray-100 bg-gray-50 hover:border-amber-400/30 transition-all", !newDeadline && "text-muted-foreground")}
                                        >
                                            <CalendarIcon className="mr-3 h-5 w-5 text-amber-600" />
                                            {newDeadline ? format(newDeadline, "PPP") : <span>Select New Date</span>}
                                        </Button>
                                    </PopoverTrigger>
                                    <PopoverContent className="w-auto p-0 rounded-2xl border-none shadow-2xl overflow-hidden">
                                        <Calendar
                                            mode="single"
                                            selected={newDeadline}
                                            onSelect={(date) => {
                                                setNewDeadline(date);
                                                setExtendError("");
                                            }}
                                            disabled={(date) =>
                                                extendTarget
                                                    ? !isAfter(startOfDay(date), startOfDay(new Date(extendTarget.deadline)))
                                                    : false
                                            }
                                            initialFocus
                                        />
                                    </PopoverContent>
                                </Popover>
                                <Input
                                    type="time"
                                    value={newTime}
                                    onChange={(e) => {
                                        setNewTime(e.target.value);
                                        setExtendError("");
                                    }}
                                    className="h-14 w-28 rounded-2xl border-2 border-gray-100 bg-gray-50 font-black px-4"
                                />
                            </div>
                        </div>
                        {extendError && (
                            <div className="flex items-center gap-2 rounded-xl border border-red-200 bg-red-50 p-4 text-red-700 animate-in shake duration-300">
                                <AlertCircle className="h-5 w-5 shrink-0" />
                                <span className="text-sm font-bold">{extendError}</span>
                            </div>
                        )}
                    </div>
                    <DialogFooter className="p-8 bg-gray-50 flex items-center justify-between border-t border-gray-100">
                        <Button variant="ghost" onClick={() => setIsExtendDialogOpen(false)} className="text-xs font-black text-gray-400 uppercase tracking-widest">
                            Cancel
                        </Button>
                        <Button
                            onClick={handleExtendDeadline}
                            disabled={isExtending || !newDeadline}
                            className="bg-amber-600 hover:bg-amber-700 text-white h-14 px-10 rounded-2xl font-black shadow-xl shadow-amber-200 transition-all active:scale-95"
                        >
                            {isExtending ? <Loader2 className="animate-spin" /> : "Confirm Extension"}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Delete Confirmation Dialog */}
            <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
                <DialogContent className="sm:max-w-md rounded-[2.5rem] p-12 text-center border-none shadow-2xl overflow-hidden">
                    <div className="absolute top-0 inset-x-0 h-2 bg-red-600"></div>
                    <div className="w-24 h-24 bg-red-50 text-red-600 rounded-[2rem] flex items-center justify-center mx-auto mb-8 shadow-inner transform -rotate-12 transition-transform group-hover:rotate-0">
                        <Trash2 className="w-12 h-12 stroke-[2.5]" />
                    </div>
                    <DialogHeader>
                        <DialogTitle className="text-3xl font-black text-navy px-4 leading-tight mb-2">Delete This Assignment?</DialogTitle>
                        <DialogDescription className="text-base font-medium text-gray-500 px-6">
                            You are about to permanently delete <strong className="text-gray-900">"{assignmentToDelete?.title}"</strong>. All <span className="text-red-500 font-bold">{submissions[assignmentToDelete?.id]?.length || 0} student submissions</span> will be lost forever.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="flex flex-col gap-4 mt-10">
                        <Button variant="destructive" onClick={confirmDelete} className="h-16 rounded-2xl font-black text-lg shadow-2xl shadow-red-200 active:scale-95 transition-all">
                            YES, PERMANENTLY DELETE
                        </Button>
                        <Button variant="ghost" onClick={() => setIsDeleteDialogOpen(false)} className="h-12 font-bold text-gray-400 hover:text-navy uppercase tracking-widest text-xs">
                            Keep This Assignment
                        </Button>
                    </div>
                </DialogContent>
            </Dialog>
        </div>
    );
}

