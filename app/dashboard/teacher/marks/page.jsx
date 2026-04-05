"use client";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/components/ui/toast";

export default function TeacherMarksPage() {
    const { toast } = useToast();
    const [classes, setClasses] = useState([]);
    const [selectedClass, setSelectedClass] = useState('');
    const [selectedSubject, setSelectedSubject] = useState('');
    const [examType, setExamType] = useState('');
    const [students, setStudents] = useState([]);
    const [marks, setMarks] = useState({});
    const [maxMarks, setMaxMarks] = useState(100);

    useEffect(() => {
        fetch('/api/classes')
            .then(res => res.json())
            .then(data => {
                if (Array.isArray(data)) {
                    setClasses(data);
                } else {
                    console.error('Classes API returned non-array data:', data);
                    setClasses([]);
                }
            })
            .catch(error => {
                console.error('Error fetching classes:', error);
                setClasses([]);
            });
    }, []);

    useEffect(() => {
        if (selectedClass) {
            fetch('/api/students')
                .then(res => res.json())
                .then(data => {
                    if (Array.isArray(data)) {
                        const classStudents = data.filter((s) => s.classId?.id === selectedClass || s.classId === selectedClass);
                        setStudents(classStudents);
                    } else {
                        console.error('Students API returned non-array data:', data);
                        setStudents([]);
                    }
                })
                .catch(error => {
                    console.error('Error fetching students:', error);
                    setStudents([]);
                });
        }
    }, [selectedClass]);

    const handleMarkChange = (studentId, value) => {
        setMarks({ ...marks, [studentId]: Number(value) });
    };

    const handleSubmit = async () => {
        if (!selectedClass || !selectedSubject || !examType) return;
        const promises = students.map(async (student) => {
            const mark = marks[student.id];
            if (mark !== undefined) {
                return fetch('/api/marks', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        studentId: student.id,
                        subjectId: selectedSubject,
                        marksObtained: mark,
                        maxMarks,
                        examType,
                    }),
                });
            }
        });
        await Promise.all(promises);
        toast({ message: "Marks saved successfully!", type: "success" });
    };

    const currentClass = classes.find((c) => c.id === selectedClass);

    return (
        <div>
            <h1 className="page-title mb-6">Enter Marks</h1>

            <div className="content-card content-card-body mb-6 space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                        <Label>Class</Label>
                        <Select onValueChange={setSelectedClass}>
                            <SelectTrigger>
                                <SelectValue placeholder="Select Class" />
                            </SelectTrigger>
                            <SelectContent>
                                {classes.map((c) => (<SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>))}
                            </SelectContent>
                        </Select>
                    </div>
                    <div>
                        <Label>Subject</Label>
                        <Select onValueChange={setSelectedSubject} disabled={!selectedClass}>
                            <SelectTrigger>
                                <SelectValue placeholder="Select Subject" />
                            </SelectTrigger>
                            <SelectContent>
                                {currentClass?.subjects?.map((s) => (<SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>))}
                            </SelectContent>
                        </Select>
                    </div>
                    <div>
                        <Label>Exam Type</Label>
                        <Input value={examType} onChange={e => setExamType(e.target.value)} placeholder="e.g. Midterm" />
                    </div>
                </div>
                <div>
                    <Label>Max Marks</Label>
                    <Input type="number" value={maxMarks} onChange={e => setMaxMarks(Number(e.target.value))} />
                </div>
            </div>

            {selectedClass && selectedSubject && (
                <div className="content-card overflow-hidden">
                    <table className="data-table">
                        <thead>
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Student Name</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Marks Obtained</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {students.map((student) => (
                                <tr key={student.id}>
                                    <td className="px-6 py-4 whitespace-nowrap">{student.name}</td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <Input type="number" className="w-24" onChange={(e) => handleMarkChange(student.id, e.target.value)} />
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                    <div className="p-4 bg-gray-50 border-t">
                        <Button onClick={handleSubmit}>Save Marks</Button>
                    </div>
                </div>
            )}
        </div>
    );
}
