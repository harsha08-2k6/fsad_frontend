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
import { Trash2, Edit, CalendarIcon, CalendarClock, CheckCircle2, AlertCircle, FileText } from "lucide-react";
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
    const [editForm, setEditForm] = useState({ id: "", title: "", description: "", deadline: null, fileUrl: "" });
    const [assignmentToDelete, setAssignmentToDelete] = useState(null);
    const [isUpdating, setIsUpdating] = useState(false);

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
        setEditForm({
            id: assignment.id,
            title: assignment.title,
            description: assignment.description,
            deadline: new Date(assignment.deadline),
            fileUrl: assignment.file_url || assignment.fileUrl || ""
        });
        setIsEditDialogOpen(true);
    };

    const handleUpdateAssignment = async () => {
        if (!editForm.title || !editForm.description || !editForm.deadline) return;
        setIsUpdating(true);
        try {
            const res = await fetch(`/api/assignments/${editForm.id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    title: editForm.title,
                    description: editForm.description,
                    deadline: editForm.deadline,
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
        setNewDeadline(new Date(assignment.deadline));
        setExtendError("");
        setIsExtendDialogOpen(true);
    };

    const handleExtendDeadline = async () => {
        if (!newDeadline) {
            setExtendError("Please select a new deadline.");
            return;
        }
        const currentDeadline = new Date(extendTarget.deadline);
        if (!isAfter(startOfDay(newDeadline), startOfDay(currentDeadline))) {
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
                    deadline: newDeadline,
                })
            });
            if (res.ok) {
                fetchAssignments();
                const msg = `Deadline for "${extendTarget.title}" extended to ${format(newDeadline, "PPP")}.`;
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
        return <div>Loading...</div>;
    }

    return (
        <div className="p-6">
            {/* Success Banner */}
            {successMessage && (
                <div className="mb-4 flex items-center gap-3 rounded-lg border border-green-200 bg-green-50 px-4 py-3 text-green-800">
                    <CheckCircle2 className="h-5 w-5 text-green-600 shrink-0" />
                    <span className="text-sm font-medium">{successMessage}</span>
                </div>
            )}

            <div className="flex justify-between items-center mb-6">
                <h1 className="text-2xl font-bold">Assignments &amp; Submissions</h1>
                <Link href="/dashboard/teacher/assignments/new">
                    <Button>Create New Assignment</Button>
                </Link>
            </div>

            <div className="space-y-6">
                {assignments.map((assignment) => {
                    const assignmentSubmissions = submissions[assignment.id] || [];
                    const submissionCount = assignmentSubmissions.length;
                    const isOverdue = new Date(assignment.deadline) < new Date();
                    return (
                        <Card key={assignment.id}>
                            <CardHeader>
                                <div className="flex justify-between items-start">
                                    <div className="flex-1">
                                        <CardTitle>{assignment.title}</CardTitle>
                                        <p className="text-sm text-gray-500 mt-1">{assignment.description}</p>
                                        <div className="flex items-center gap-2 mt-2">
                                            <p className="text-xs text-gray-400">
                                                Deadline: {new Date(assignment.deadline).toLocaleDateString()}
                                            </p>
                                            {isOverdue && (
                                                <Badge variant="destructive" className="text-xs py-0 px-1.5">
                                                    Overdue
                                                </Badge>
                                            )}
                                        </div>
                                    </div>
                                    <div className="flex items-center space-x-1">
                                        <Badge variant="secondary">
                                            {submissionCount} {submissionCount === 1 ? 'Submission' : 'Submissions'}
                                        </Badge>
                                        {/* Extend Deadline button */}
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            title="Extend Deadline"
                                            onClick={() => handleExtendOpen(assignment)}
                                        >
                                            <CalendarClock className="h-4 w-4 text-amber-600" />
                                        </Button>
                                        <Button variant="ghost" size="icon" onClick={() => handleEditOpen(assignment)}>
                                            <Edit className="h-4 w-4 text-blue-600" />
                                        </Button>
                                        <Button variant="ghost" size="icon" onClick={() => handleDeleteClick(assignment)}>
                                            <Trash2 className="h-4 w-4 text-red-600" />
                                        </Button>
                                    </div>
                                </div>
                            </CardHeader>
                            <CardContent>
                                {submissionCount === 0 ? (
                                    <p className="text-gray-500 text-sm">No submissions yet</p>
                                ) : (
                                    <div className="space-y-2">
                                        <h3 className="font-semibold text-sm mb-2">Submissions:</h3>
                                        <div className="bg-gray-50 rounded-lg overflow-hidden">
                                            <table className="w-full border-collapse">
                                                <thead className="bg-gray-100">
                                                    <tr>
                                                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Student</th>
                                                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Submitted At</th>
                                                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">File</th>
                                                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Grade / Status</th>
                                                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
                                                    </tr>
                                                </thead>
                                                <tbody className="bg-white divide-y divide-gray-200">
                                                    {assignmentSubmissions.map((submission) => (
                                                        <tr key={submission.id}>
                                                            <td className="px-4 py-2 text-sm">
                                                                <div>
                                                                    <div className="font-medium">{(submission.student || submission.studentId)?.name || 'Unknown'}</div>
                                                                    <div className="text-xs text-gray-500">{(submission.student || submission.studentId)?.email}</div>
                                                                </div>
                                                            </td>
                                                            <td className="px-4 py-2 text-sm">
                                                                {new Date(submission.submitted_at || submission.submittedAt).toLocaleString()}
                                                            </td>
                                                            <td className="px-4 py-2 text-sm">
                                                                {(submission.file_url || submission.fileUrl) ? (
                                                                    <a href={submission.file_url || submission.fileUrl} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline inline-flex items-center gap-1">
                                                                        <FileText className="w-3 h-3" />
                                                                        Download
                                                                    </a>
                                                                ) : '-'}
                                                            </td>
                                                            <td className="px-4 py-2 text-sm">
                                                                {gradingSubmission === submission.id ? (
                                                                    <div className="space-y-2">
                                                                        <Input
                                                                            type="number"
                                                                            placeholder="Grade (0-100)"
                                                                            value={grade}
                                                                            onChange={(e) => setGrade(e.target.value)}
                                                                            max={100}
                                                                        />
                                                                        <Textarea
                                                                            placeholder="Feedback (Optional)"
                                                                            value={feedback}
                                                                            onChange={(e) => setFeedback(e.target.value)}
                                                                            className="h-20"
                                                                        />
                                                                    </div>
                                                                ) : (
                                                                    <div>
                                                                        <Badge variant={submission.status === 'graded' ? 'default' : 'secondary'}>
                                                                            {submission.status}
                                                                        </Badge>
                                                                        {submission.grade !== undefined && (
                                                                            <div className="mt-1 font-semibold">
                                                                                {submission.grade} / 100
                                                                            </div>
                                                                        )}
                                                                    </div>
                                                                )}
                                                            </td>
                                                            <td className="px-4 py-2 text-sm">
                                                                {gradingSubmission === submission.id ? (
                                                                    <div className="flex space-x-2">
                                                                        <Button size="sm" onClick={() => handleSubmitGrade(submission.id, assignment.id)}>Save</Button>
                                                                        <Button size="sm" variant="outline" onClick={handleCancelGrade}>Cancel</Button>
                                                                    </div>
                                                                ) : (
                                                                    <Button size="sm" variant="outline" onClick={() => handleGradeClick(submission)}>
                                                                        {submission.status === 'graded' ? 'Edit Grade' : 'Grade'}
                                                                    </Button>
                                                                )}
                                                            </td>
                                                        </tr>
                                                    ))}
                                                </tbody>
                                            </table>
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
                <DialogContent className="sm:max-w-[425px]">
                    <DialogHeader>
                        <DialogTitle>Edit Assignment</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4 py-4">
                        <div className="space-y-2">
                            <Label htmlFor="edit-title">Title</Label>
                            <Input
                                id="edit-title"
                                value={editForm.title}
                                onChange={(e) => setEditForm(prev => ({ ...prev, title: e.target.value }))}
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="edit-description">Description</Label>
                            <Textarea
                                id="edit-description"
                                value={editForm.description}
                                onChange={(e) => setEditForm(prev => ({ ...prev, description: e.target.value }))}
                            />
                        </div>
                        <div className="space-y-2 flex flex-col">
                            <Label>Deadline</Label>
                            <Popover>
                                <PopoverTrigger asChild>
                                    <Button
                                        variant={"outline"}
                                        className={cn("w-full justify-start text-left font-normal", !editForm.deadline && "text-muted-foreground")}
                                    >
                                        <CalendarIcon className="mr-2 h-4 w-4" />
                                        {editForm.deadline ? format(editForm.deadline, "PPP") : <span>Pick a date</span>}
                                    </Button>
                                </PopoverTrigger>
                                <PopoverContent className="w-auto p-0">
                                    <Calendar
                                        mode="single"
                                        selected={editForm.deadline}
                                        onSelect={(date) => setEditForm(prev => ({ ...prev, deadline: date }))}
                                        initialFocus
                                    />
                                </PopoverContent>
                            </Popover>
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>Cancel</Button>
                        <Button onClick={handleUpdateAssignment} disabled={isUpdating}>
                            {isUpdating ? "Saving..." : "Save Changes"}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Extend Deadline Dialog */}
            <Dialog open={isExtendDialogOpen} onOpenChange={(open) => {
                setIsExtendDialogOpen(open);
                if (!open) { setExtendError(""); }
            }}>
                <DialogContent className="sm:max-w-[420px]">
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2">
                            <CalendarClock className="h-5 w-5 text-amber-600" />
                            Extend Deadline
                        </DialogTitle>
                        <DialogDescription>
                            Choose a new deadline for <strong>{extendTarget?.title}</strong>. The new date must be after the current deadline.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="py-4 space-y-4">
                        {/* Current deadline display */}
                        <div className="rounded-md bg-gray-50 border border-gray-200 px-4 py-3">
                            <p className="text-xs text-gray-500 uppercase font-medium tracking-wide mb-1">Current Deadline</p>
                            <p className="text-sm font-semibold text-gray-800">
                                {extendTarget ? format(new Date(extendTarget.deadline), "PPP") : "—"}
                            </p>
                        </div>
                        {/* New deadline picker */}
                        <div className="space-y-2 flex flex-col">
                            <Label>New Deadline</Label>
                            <Popover>
                                <PopoverTrigger asChild>
                                    <Button
                                        variant="outline"
                                        className={cn("w-full justify-start text-left font-normal", !newDeadline && "text-muted-foreground")}
                                    >
                                        <CalendarIcon className="mr-2 h-4 w-4" />
                                        {newDeadline ? format(newDeadline, "PPP") : <span>Pick a new date</span>}
                                    </Button>
                                </PopoverTrigger>
                                <PopoverContent className="w-auto p-0">
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
                        </div>
                        {/* Error message */}
                        {extendError && (
                            <div className="flex items-center gap-2 rounded-md border border-red-200 bg-red-50 px-3 py-2 text-red-700">
                                <AlertCircle className="h-4 w-4 shrink-0" />
                                <span className="text-sm">{extendError}</span>
                            </div>
                        )}
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setIsExtendDialogOpen(false)}>
                            Cancel
                        </Button>
                        <Button
                            onClick={handleExtendDeadline}
                            disabled={isExtending || !newDeadline}
                            className="bg-amber-600 hover:bg-amber-700 text-white"
                        >
                            {isExtending ? "Extending..." : "Extend Deadline"}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Delete Confirmation Dialog */}
            <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Confirm Delete</DialogTitle>
                    </DialogHeader>
                    <p className="py-4">
                        Are you sure you want to delete the assignment <strong>{assignmentToDelete?.title}</strong>?
                        This action cannot be undone and will delete all associated submissions.
                    </p>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setIsDeleteDialogOpen(false)}>Cancel</Button>
                        <Button variant="destructive" onClick={confirmDelete}>Delete</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}
