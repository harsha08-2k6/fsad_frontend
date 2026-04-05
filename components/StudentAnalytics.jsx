"use client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";
export default function StudentAnalytics({ submissions, marks }) {
    // Process assignment grades data
    const assignmentData = submissions
        .filter((sub) => sub.grade !== undefined)
        .map((sub) => ({
        name: sub.assignmentId?.title || "Assignment",
        grade: sub.grade,
        date: new Date(sub.submittedAt).toLocaleDateString(),
    }))
        .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
    // Process exam marks data - group by exam type
    const examData = marks.map((mark) => ({
        name: `${mark.subjectId?.name || 'Subject'} - ${mark.examType}`,
        percentage: Math.round((mark.marksObtained / mark.maxMarks) * 100),
        marks: mark.marksObtained,
        maxMarks: mark.maxMarks,
    }));
    // Calculate statistics
    const avgAssignmentGrade = assignmentData.length > 0
        ? Math.round(assignmentData.reduce((sum, item) => sum + item.grade, 0) / assignmentData.length)
        : 0;
    const avgExamPercentage = examData.length > 0
        ? Math.round(examData.reduce((sum, item) => sum + item.percentage, 0) / examData.length)
        : 0;
    return (<div className="space-y-6">
            <h1 className="text-2xl font-bold">Performance Analytics</h1>

            {/* Statistics Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Card>
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium text-gray-500">Total Assignments</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-3xl font-bold">{assignmentData.length}</div>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium text-gray-500">Avg. Assignment Grade</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-3xl font-bold text-blue-600">{avgAssignmentGrade}%</div>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium text-gray-500">Avg. Exam Score</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-3xl font-bold text-green-600">{avgExamPercentage}%</div>
                    </CardContent>
                </Card>
            </div>

            {/* Assignment Grades Chart */}
            {assignmentData.length > 0 && (<Card>
                    <CardHeader>
                        <CardTitle>Assignment Grades Over Time</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <ResponsiveContainer width="100%" height={300}>
                            <LineChart data={assignmentData}>
                                <CartesianGrid strokeDasharray="3 3"/>
                                <XAxis dataKey="name" angle={-45} textAnchor="end" height={100} interval={0}/>
                                <YAxis domain={[0, 100]}/>
                                <Tooltip />
                                <Legend />
                                <Line type="monotone" dataKey="grade" stroke="#3b82f6" strokeWidth={2} name="Grade (%)" dot={{ fill: '#3b82f6', r: 5 }} activeDot={{ r: 8 }}/>
                            </LineChart>
                        </ResponsiveContainer>
                    </CardContent>
                </Card>)}

            {/* Exam Performance Chart */}
            {examData.length > 0 && (<Card>
                    <CardHeader>
                        <CardTitle>Exam Performance by Subject</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <ResponsiveContainer width="100%" height={300}>
                            <LineChart data={examData}>
                                <CartesianGrid strokeDasharray="3 3"/>
                                <XAxis dataKey="name" angle={-45} textAnchor="end" height={100} interval={0}/>
                                <YAxis domain={[0, 100]}/>
                                <Tooltip content={({ active, payload }) => {
                if (active && payload && payload.length) {
                    const data = payload[0].payload;
                    return (<div className="bg-white p-3 border rounded shadow-lg">
                                                    <p className="font-semibold">{data.name}</p>
                                                    <p className="text-sm">Score: {data.marks}/{data.maxMarks}</p>
                                                    <p className="text-sm text-green-600">Percentage: {data.percentage}%</p>
                                                </div>);
                }
                return null;
            }}/>
                                <Legend />
                                <Line type="monotone" dataKey="percentage" stroke="#10b981" strokeWidth={2} name="Score (%)" dot={{ fill: '#10b981', r: 5 }} activeDot={{ r: 8 }}/>
                            </LineChart>
                        </ResponsiveContainer>
                    </CardContent>
                </Card>)}

            {/* Empty state */}
            {assignmentData.length === 0 && examData.length === 0 && (<Card>
                    <CardContent className="py-12">
                        <p className="text-center text-gray-500">No performance data available yet. Complete assignments and exams to see your analytics.</p>
                    </CardContent>
                </Card>)}
        </div>);
}
