"use client";
import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
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
            }
            catch (error) {
                console.error("Failed to fetch data", error);
            }
            finally {
                setLoading(false);
            }
        };
        if (params.id) {
            fetchData();
        }
    }, [params.id, session]);
    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!file)
            return;
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
                    // Reload page to show submission
                    window.location.reload();
                }
            }
        }
        catch (error) {
            console.error("Failed to submit", error);
        }
        finally {
            setSubmitting(false);
        }
    };
    if (loading)
        return <div>Loading...</div>;
    if (!assignment)
        return <div>Assignment not found</div>;
    return (<div className="max-w-3xl mx-auto space-y-6">
        <Card>
            <CardHeader>
                <CardTitle>{assignment.title}</CardTitle>
                <p className="text-sm text-gray-500">Deadline: {new Date(assignment.deadline).toLocaleString()}</p>
            </CardHeader>
            <CardContent className="space-y-4">
                <div className="prose max-w-none">
                    <p>{assignment.description}</p>
                </div>
                {(assignment.file_url || assignment.fileUrl) && (<div>
                    <h3 className="font-semibold mb-2">Attachment:</h3>
                    <a href={assignment.file_url || assignment.fileUrl} target="_blank" rel="noopener noreferrer">
                        <Button variant="outline">View Attachment</Button>
                    </a>
                </div>)}
            </CardContent>
        </Card>

        <Card>
            <CardHeader>
                <CardTitle>Your Submission</CardTitle>
            </CardHeader>
            <CardContent>
                {submission ? (<div className="space-y-4">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="font-semibold">Status: <Badge>{submission.status}</Badge></p>
                            <p className="text-sm text-gray-500">Submitted at: {new Date(submission.submitted_at || submission.submittedAt).toLocaleString()}</p>
                        </div>
                        {submission.grade !== undefined && (<div className="text-right">
                            <p className="text-2xl font-bold text-green-600">{submission.grade}/100</p>
                            <p className="text-sm text-gray-500">Grade</p>
                        </div>)}
                    </div>

                    <div>
                        <a href={submission.file_url || submission.fileUrl} target="_blank" rel="noopener noreferrer">
                            <Button variant="outline">View Your File</Button>
                        </a>
                    </div>

                    {submission.feedback && (<div className="bg-gray-50 p-4 rounded-md">
                        <h3 className="font-semibold mb-2">Feedback:</h3>
                        <p>{submission.feedback}</p>
                    </div>)}

                    {submission.status !== "graded" && (<div className="pt-4 border-t">
                        <h3 className="font-semibold mb-2">Update Submission</h3>
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div className="space-y-2">
                                <Label htmlFor="file">Upload New File (Overwrites previous)</Label>
                                <Input id="file" type="file" onChange={(e) => setFile(e.target.files?.[0] || null)} required />
                            </div>
                            <Button type="submit" disabled={submitting || !file}>
                                {submitting ? "Updating..." : "Update Submission"}
                            </Button>
                        </form>
                    </div>)}
                </div>) : (<form onSubmit={handleSubmit} className="space-y-4">
                    <div className="space-y-2">
                        <Label htmlFor="file">Upload Assignment (PDF, DOCX, Image)</Label>
                        <Input id="file" type="file" onChange={(e) => setFile(e.target.files?.[0] || null)} required />
                    </div>
                    <Button type="submit" disabled={submitting || !file}>
                        {submitting ? "Submitting..." : "Submit Assignment"}
                    </Button>
                </form>)}
            </CardContent>
        </Card>
    </div>);
}
