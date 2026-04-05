"use client";
import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { Badge } from "@/components/ui/badge";
import StudentAnalytics from "@/components/StudentAnalytics";
export default function StudentMarksPage() {
    const { data: session } = useSession();
    const [marks, setMarks] = useState([]);
    const [submissions, setSubmissions] = useState([]);
    useEffect(() => {
        if (session?.user?.id) {
            // Fetch exam marks
            fetch(`/api/marks?studentId=${session.user.id}`)
                .then(res => res.json())
                .then(data => setMarks(data));
            // Fetch assignment submissions
            fetch('/api/submissions')
                .then(res => res.json())
                .then(data => {
                if (Array.isArray(data)) {
                    setSubmissions(data);
                }
            });
        }
    }, [session]);
    return (<div className="space-y-8">
            {/* Analytics Section */}
            <StudentAnalytics submissions={submissions} marks={marks}/>

            {/* Detailed Data Tables */}
            <div>
                <h1 className="page-title mb-6">Exam Marks</h1>
                <div className="content-card overflow-hidden">
                    <table className="data-table">
                        <thead>
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Subject</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Exam</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Percentage</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Score</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {marks.length === 0 ? (<tr>
                                    <td colSpan={4} className="px-6 py-4 text-center text-gray-500">No exam marks available</td>
                                </tr>) : (marks.map((mark) => {
                                    const percentage = mark.maxMarks > 0 ? Math.round((mark.marksObtained / mark.maxMarks) * 100) : 0;
                                    return (
                                        <tr key={mark.id}>
                                            <td className="px-6 py-4 whitespace-nowrap">{mark.subjectId?.name || "Python Full Stack"}</td>
                                            <td className="px-6 py-4 whitespace-nowrap">{mark.examType}</td>
                                            <td className="px-6 py-4 whitespace-nowrap font-semibold">{mark.marksObtained} / {mark.maxMarks}</td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <Badge className={percentage >= 70 ? "bg-green-100 text-green-700" : "bg-blue-100 text-blue-700"}>
                                                    {percentage}%
                                                </Badge>
                                            </td>
                                        </tr>
                                    );
                                }))}
                        </tbody>
                    </table>
                </div>
            </div>

            <div>
                <h1 className="page-title mb-6">Assignment Grades</h1>
                <div className="content-card overflow-hidden">
                    <table className="data-table">
                        <thead>
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Assignment</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Submitted At</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Grade</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Feedback</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {submissions.length === 0 ? (<tr>
                                    <td colSpan={5} className="px-6 py-4 text-center text-gray-500">No assignment submissions yet</td>
                                </tr>) : (submissions.map((submission) => (<tr key={submission.id}>
                                        <td className="px-6 py-4 whitespace-nowrap font-medium">{(submission.assignment || submission.assignmentId)?.title || 'Unknown'}</td>
                                        <td className="px-6 py-4 whitespace-nowrap">{new Date(submission.submitted_at || submission.submittedAt).toLocaleDateString()}</td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <Badge variant={submission.status === 'graded' ? 'default' : 'secondary'}>
                                                {submission.status}
                                            </Badge>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap font-bold text-green-600">
                                            {submission.grade !== undefined ? `${submission.grade}/100` : '-'}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                            {submission.feedback || '-'}
                                        </td>
                                    </tr>)))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>);
}
