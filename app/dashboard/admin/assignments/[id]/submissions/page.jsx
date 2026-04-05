"use client";
import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
export default function ViewSubmissionsPage() {
    const params = useParams();
    const [submissions, setSubmissions] = useState([]);
    const [loading, setLoading] = useState(true);
    useEffect(() => {
        const fetchSubmissions = async () => {
            try {
                const res = await fetch(`/api/submissions?assignmentId=${params.id}`);
                if (res.ok) {
                    const data = await res.json();
                    setSubmissions(data);
                }
            }
            catch (error) {
                console.error("Failed to fetch submissions", error);
            }
            finally {
                setLoading(false);
            }
        };
        if (params.id) {
            fetchSubmissions();
        }
    }, [params.id]);
    return (<div className="space-y-6">
            <div className="flex justify-between items-center">
                <h1 className="text-3xl font-bold">Submissions</h1>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>Student Submissions</CardTitle>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Student Name</TableHead>
                                <TableHead>Submitted At</TableHead>
                                <TableHead>Status</TableHead>
                                <TableHead>Grade</TableHead>
                                <TableHead>Action</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {loading ? (<TableRow>
                                    <TableCell colSpan={5} className="text-center">Loading...</TableCell>
                                </TableRow>) : submissions.length === 0 ? (<TableRow>
                                    <TableCell colSpan={5} className="text-center">No submissions yet.</TableCell>
                                </TableRow>) : (submissions.map((submission) => (<TableRow key={submission.id}>
                                        <TableCell>{submission.studentId.name}</TableCell>
                                        <TableCell>{new Date(submission.submittedAt).toLocaleString()}</TableCell>
                                        <TableCell>
                                            <Badge variant={submission.status === "graded" ? "default" : "secondary"}>
                                                {submission.status}
                                            </Badge>
                                        </TableCell>
                                        <TableCell>{submission.grade !== undefined ? submission.grade : "-"}</TableCell>
                                        <TableCell>
                                            <Link href={`/dashboard/admin/submissions/${submission.id}`}>
                                                <Button size="sm">Grade</Button>
                                            </Link>
                                        </TableCell>
                                    </TableRow>)))}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>
        </div>);
}
