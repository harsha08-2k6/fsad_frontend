"use client";
import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
export default function GradeSubmissionPage() {
    const params = useParams();
    const router = useRouter();
    const [submission, setSubmission] = useState(null);
    const [grade, setGrade] = useState("");
    const [feedback, setFeedback] = useState("");
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    useEffect(() => {
        // Since we don't have a direct GET /api/submissions/:id, we might need to fetch all or update the API.
        // Wait, I didn't create GET /api/submissions/:id, only PUT.
        // I should update the API to support GET /api/submissions/:id or just fetch the list and filter (inefficient but works for now)
        // Or better, I'll just add GET to the single submission route.
        // Let's assume I will add GET to /api/submissions/[id] quickly.
        const fetchSubmission = async () => {
            try {
                const res = await fetch(`/api/submissions/${params.id}`);
                if (res.ok) {
                    const data = await res.json();
                    setSubmission(data);
                    if (data.grade)
                        setGrade(data.grade.toString());
                    if (data.feedback)
                        setFeedback(data.feedback);
                }
            }
            catch (error) {
                console.error("Failed to fetch submission", error);
            }
            finally {
                setLoading(false);
            }
        };
        if (params.id) {
            fetchSubmission();
        }
    }, [params.id]);
    const handleGrade = async (e) => {
        e.preventDefault();
        setSubmitting(true);
        try {
            const res = await fetch(`/api/submissions/${params.id}`, {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    grade: Number(grade),
                    feedback,
                }),
            });
            if (res.ok) {
                router.back();
            }
        }
        catch (error) {
            console.error("Failed to grade submission", error);
        }
        finally {
            setSubmitting(false);
        }
    };
    if (loading)
        return <div>Loading...</div>;
    if (!submission)
        return <div>Submission not found</div>;
    return (<div className="max-w-2xl mx-auto space-y-6">
            <h1 className="text-3xl font-bold">Grade Submission</h1>

            <Card>
                <CardHeader>
                    <CardTitle>Student Details</CardTitle>
                </CardHeader>
                <CardContent>
                    <p><strong>Name:</strong> {submission.studentId?.name}</p>
                    <p><strong>Email:</strong> {submission.studentId?.email}</p>
                    <div className="mt-4">
                        <a href={submission.fileUrl} target="_blank" rel="noopener noreferrer">
                            <Button variant="outline">View Submitted File</Button>
                        </a>
                    </div>
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle>Grading</CardTitle>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleGrade} className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="grade">Grade (0-100)</Label>
                            <Input id="grade" type="number" min="0" max="100" value={grade} onChange={(e) => setGrade(e.target.value)} required/>
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="feedback">Feedback</Label>
                            <Textarea id="feedback" value={feedback} onChange={(e) => setFeedback(e.target.value)} placeholder="Great work!"/>
                        </div>
                        <Button type="submit" disabled={submitting}>
                            {submitting ? "Saving..." : "Save Grade"}
                        </Button>
                    </form>
                </CardContent>
            </Card>
        </div>);
}
