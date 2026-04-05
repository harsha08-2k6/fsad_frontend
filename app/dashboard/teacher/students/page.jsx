"use client";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/components/ui/toast";
import { Users, UserPlus, Mail, Shield, GraduationCap, Loader2, Search, ArrowRight, Clock } from "lucide-react";
import Link from "next/link";

export default function TeacherStudentsPage() {
    const { toast } = useToast();
    const [students, setStudents] = useState([]);
    const [pendingCount, setPendingCount] = useState(0);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");
    const [newStudent, setNewStudent] = useState({ name: '', email: '', password: '' });

    useEffect(() => {
        fetchStudents();
        fetchPendingCount();
    }, []);

    const fetchPendingCount = async () => {
        try {
            const res = await fetch("/api/teacher/students/pending");
            if (res.ok) {
                const data = await res.json();
                setPendingCount(data.length);
            }
        } catch (error) {
            console.error("Failed to fetch pending count:", error);
        }
    };

    const fetchStudents = async () => {
        setLoading(true);
        try {
            const res = await fetch('/api/students');
            const data = await res.json();
            if (res.ok && Array.isArray(data)) {
                setStudents(data);
            } else {
                console.error('API Error:', data);
                setStudents([]);
            }
        } catch (error) {
            console.error('Network error:', error);
            setStudents([]);
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const res = await fetch('/api/students', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(newStudent),
            });
            const data = await res.json();
            if (res.ok) {
                setNewStudent({ name: '', email: '', password: '' });
                fetchStudents();
                toast({ message: "Student added successfully!", type: "success" });
            } else {
                toast({ message: `Failed to add student: ${data.message || res.statusText}`, type: "error" });
            }
        } catch (error) {
            toast({ message: `Network error: ${error.message}`, type: "error" });
        }
    };

    const filteredStudents = students.filter(s =>
        s.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        s.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (s.custom_id && s.custom_id.toLowerCase().includes(searchTerm.toLowerCase()))
    );

    return (
        <div className="space-y-8 animate-in fade-in duration-500">
            <div className="page-header mb-8">
                <h1 className="page-title flex items-center gap-3">
                    <Users className="w-8 h-8 text-indigo-600" />
                    Student Management
                </h1>
                <p className="page-subtitle">Add new students manually or view the current active student list.</p>
            </div>

            <div className="content-card content-card-body">
                <div className="flex items-center gap-2 mb-4 text-indigo-600 font-semibold">
                    <UserPlus className="w-5 h-5" />
                    <h2>Add New Student</h2>
                </div>
                <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
                    <div className="space-y-1.5">
                        <Label htmlFor="name" className="text-xs uppercase font-bold text-gray-500">Student Name</Label>
                        <Input
                            id="name"
                            placeholder="Full Name"
                            value={newStudent.name}
                            onChange={e => setNewStudent({ ...newStudent, name: e.target.value })}
                            required
                            className="bg-gray-50/50 border-gray-100 focus:bg-white"
                        />
                    </div>
                    <div className="space-y-1.5">
                        <Label htmlFor="email" className="text-xs uppercase font-bold text-gray-500">Email Address</Label>
                        <Input
                            id="email"
                            type="email"
                            placeholder="email@school.com"
                            value={newStudent.email}
                            onChange={e => setNewStudent({ ...newStudent, email: e.target.value })}
                            required
                            className="bg-gray-50/50 border-gray-100 focus:bg-white"
                        />
                    </div>
                    <div className="space-y-1.5">
                        <Label htmlFor="password" className="text-xs uppercase font-bold text-gray-500">Initial Password</Label>
                        <div className="flex gap-2">
                            <Input
                                id="password"
                                type="password"
                                placeholder="••••••••"
                                value={newStudent.password}
                                onChange={e => setNewStudent({ ...newStudent, password: e.target.value })}
                                required
                                className="bg-gray-50/50 border-gray-100 focus:bg-white"
                            />
                            <Button type="submit" className="bg-indigo-600 hover:bg-indigo-700 shadow-md shadow-indigo-200">
                                Add
                            </Button>
                        </div>
                    </div>
                </form>
            </div>

            <div className="content-card overflow-hidden">
                <div className="p-4 border-b border-gray-100 bg-gray-50/30 flex justify-between items-center">
                    <h3 className="font-bold text-gray-700">Active Students ({filteredStudents.length})</h3>
                    <div className="relative w-64">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                        <Input
                            placeholder="Find by name, email or ID..."
                            className="pl-10 h-9 text-sm bg-white"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead>
                            <tr className="bg-gray-50/50">
                                <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Student Details</th>
                                <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Student ID</th>
                                <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Assigned Class</th>
                                <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Join Date</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-100">
                            {loading ? (
                                <tr>
                                    <td colSpan="4" className="px-6 py-12 text-center text-gray-500">
                                        <Loader2 className="w-8 h-8 animate-spin mx-auto mb-2 text-indigo-500" />
                                        Loading student directory...
                                    </td>
                                </tr>
                            ) : filteredStudents.length === 0 ? (
                                <tr>
                                    <td colSpan="4" className="px-6 py-20 text-center">
                                        <div className="flex flex-col items-center justify-center">
                                            <div className="bg-gray-50 p-4 rounded-full mb-4">
                                                <GraduationCap className="w-12 h-12 text-gray-300" />
                                            </div>
                                            <p className="text-lg font-medium text-gray-900 mb-1">No active students found</p>
                                            <p className="text-sm text-gray-500 max-w-xs mx-auto mb-6">
                                                {searchTerm
                                                    ? "Try a different search term to find the student you're looking for."
                                                    : "Students will appear here once they are approved or added manually."}
                                            </p>
                                            {pendingCount > 0 && !searchTerm && (
                                                <Link
                                                    href="/dashboard/teacher/pending-students"
                                                    className="inline-flex items-center gap-2 px-6 py-3 bg-indigo-600 text-white rounded-xl font-bold hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-100"
                                                >
                                                    View {pendingCount} Pending Approvals
                                                    <ArrowRight className="w-4 h-4" />
                                                </Link>
                                            )}
                                        </div>
                                    </td>
                                </tr>
                            ) : (
                                filteredStudents.map((student) => (
                                    <tr key={student.id} className="hover:bg-gray-50/30 transition-colors">
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white font-bold text-sm">
                                                    {student.name[0].toUpperCase()}
                                                </div>
                                                <div>
                                                    <div className="text-sm font-semibold text-gray-900">{student.name}</div>
                                                    <div className="text-xs text-gray-400 flex items-center gap-1">
                                                        <Mail className="w-3 h-3" /> {student.email}
                                                    </div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className="text-xs font-mono bg-gray-100 text-gray-600 px-2 py-1 rounded">
                                                {student.custom_id || student.id.slice(0, 8)}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4">
                                            {student.class?.name ? (
                                                <span className="text-xs font-bold text-indigo-600 bg-indigo-50 px-2.5 py-1 rounded-full border border-indigo-100">
                                                    {student.class.name}
                                                </span>
                                            ) : (
                                                <span className="text-xs text-gray-400">Not Assigned</span>
                                            )}
                                        </td>
                                        <td className="px-6 py-4 text-xs text-gray-500">
                                            {new Date(student.created_at || student.createdAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
