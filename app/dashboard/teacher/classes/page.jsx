"use client";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/components/ui/toast";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter,
    DialogDescription,
} from "@/components/ui/dialog";
import { Search, UserPlus, Pencil, Trash2 } from "lucide-react";

export default function TeacherClassesPage() {
    const { toast } = useToast();
    const [classes, setClasses] = useState([]);
    const [subjects, setSubjects] = useState([]);
    const [students, setStudents] = useState([]);
    const [newClass, setNewClass] = useState({ name: '', subjects: [] });
    const [isBulkDialogOpen, setIsBulkDialogOpen] = useState(false);
    const [selectedClassId, setSelectedClassId] = useState(null);
    const [selectedStudentIds, setSelectedStudentIds] = useState([]);
    const [searchTerm, setSearchTerm] = useState("");
    const [isLoadingStudents, setIsLoadingStudents] = useState(false);

    // Edit state
    const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
    const [editClass, setEditClass] = useState(null);

    // Delete state
    const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
    const [deleteClassId, setDeleteClassId] = useState(null);

    useEffect(() => {
        fetchClasses();
        fetchSubjects();
        fetchStudents();
    }, []);

    const fetchClasses = () => {
        fetch('/api/classes')
            .then(res => res.json())
            .then(data => {
                if (Array.isArray(data)) setClasses(data);
                else setClasses([]);
            })
            .catch(() => setClasses([]));
    };

    const fetchSubjects = () => {
        fetch('/api/subjects')
            .then(res => res.json())
            .then(data => {
                if (Array.isArray(data)) setSubjects(data);
                else setSubjects([]);
            })
            .catch(() => setSubjects([]));
    };

    const fetchStudents = () => {
        setIsLoadingStudents(true);
        fetch('/api/students')
            .then(res => res.json())
            .then(data => {
                if (Array.isArray(data)) setStudents(data);
                else setStudents([]);
            })
            .catch(() => setStudents([]))
            .finally(() => setIsLoadingStudents(false));
    };

    const handleSubjectChange = (subjectId, checked) => {
        if (checked) setNewClass({ ...newClass, subjects: [...newClass.subjects, subjectId] });
        else setNewClass({ ...newClass, subjects: (newClass.subjects || []).filter(id => id !== subjectId) });
    };

    const handleEditSubjectChange = (subjectId, checked) => {
        if (!editClass) return;
        const currentSubjects = editClass.subjects || [];
        if (checked) setEditClass({ ...editClass, subjects: [...currentSubjects, subjectId] });
        else setEditClass({ ...editClass, subjects: currentSubjects.filter(id => id !== subjectId) });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const res = await fetch('/api/classes', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(newClass),
            });
            if (res.ok) {
                setNewClass({ name: '', subjects: [] });
                fetchClasses();
                toast({ message: "Class created successfully!", type: "success" });
            } else {
                toast({ message: "Failed to create class.", type: "error" });
            }
        } catch (error) {
            toast({ message: "Network error.", type: "error" });
        }
    };

    const openEditDialog = (cls) => {
        setEditClass({
            id: cls.id,
            name: cls.name,
            subjects: Array.isArray(cls.subjects) ? cls.subjects.map(s => s.id) : [],
        });
        setIsEditDialogOpen(true);
    };

    const handleEditSubmit = async () => {
        if (!editClass) return;
        try {
            const res = await fetch(`/api/classes/${editClass.id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ name: editClass.name, subjects: editClass.subjects }),
            });
            if (res.ok) {
                toast({ message: "Class updated successfully!", type: "success" });
                setIsEditDialogOpen(false);
                setEditClass(null);
                fetchClasses();
            } else {
                toast({ message: "Failed to update class.", type: "error" });
            }
        } catch {
            toast({ message: "Network error.", type: "error" });
        }
    };

    const openDeleteDialog = (classId) => {
        setDeleteClassId(classId);
        setIsDeleteDialogOpen(true);
    };

    const handleDeleteClass = async () => {
        if (!deleteClassId) return;
        try {
            const res = await fetch(`/api/classes/${deleteClassId}`, { method: 'DELETE' });
            if (res.ok) {
                toast({ message: "Class deleted successfully!", type: "success" });
                setIsDeleteDialogOpen(false);
                setDeleteClassId(null);
                fetchClasses();
            } else {
                toast({ message: "Failed to delete class.", type: "error" });
            }
        } catch {
            toast({ message: "Network error.", type: "error" });
        }
    };

    const handleBulkEnroll = async () => {
        if (!selectedClassId || selectedStudentIds.length === 0) return;
        try {
            const res = await fetch(`/api/classes/${selectedClassId}/enroll-bulk`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ studentIds: selectedStudentIds }),
            });
            if (res.ok) {
                toast({ message: "Students enrolled successfully!", type: "success" });
                setIsBulkDialogOpen(false);
                setSelectedStudentIds([]);
                fetchClasses();
            } else {
                toast({ message: "Failed to enroll students.", type: "error" });
            }
        } catch {
            toast({ message: "Failed to enroll students.", type: "error" });
        }
    };

    const toggleStudentSelection = (studentId) => {
        if (selectedStudentIds.includes(studentId))
            setSelectedStudentIds(selectedStudentIds.filter(id => id !== studentId));
        else
            setSelectedStudentIds([...selectedStudentIds, studentId]);
    };

    const filteredStudents = Array.isArray(students) ? students.filter(student =>
        student.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        student.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        student.custom_id?.toLowerCase().includes(searchTerm.toLowerCase())
    ) : [];

    const openBulkEnroll = (classId) => {
        setSelectedClassId(classId);
        const currentClass = Array.isArray(classes) ? classes.find(c => c.id === classId) : null;
        const existingStudentIds = Array.isArray(currentClass?.students) ? currentClass.students.map(s => s.id) : [];
        setSelectedStudentIds(existingStudentIds);
        setIsBulkDialogOpen(true);
    };

    return (
        <div>
            <h1 className="page-title mb-6">Manage Classes</h1>

            {/* Add Class Form */}
            <div className="content-card content-card-body mb-6">
                <h2 className="text-lg font-semibold mb-4">Add Class</h2>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <Label htmlFor="name">Class Name</Label>
                        <Input id="name" value={newClass.name} onChange={e => setNewClass({ ...newClass, name: e.target.value })} required placeholder="e.g. Class 10A" />
                    </div>
                    <div>
                        <Label className="mb-2 block">Subjects</Label>
                        <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                            {Array.isArray(subjects) && subjects.map((subject) => (
                                <div key={subject.id} className="flex items-center space-x-2">
                                    <input type="checkbox" id={`subject-${subject.id}`}
                                        checked={(newClass.subjects || []).includes(subject.id)}
                                        onChange={(e) => handleSubjectChange(subject.id, e.target.checked)}
                                        className="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500" />
                                    <label htmlFor={`subject-${subject.id}`} className="text-sm text-gray-700">{subject.name}</label>
                                </div>
                            ))}
                        </div>
                    </div>
                    <Button type="submit">Add Class</Button>
                </form>
            </div>

            {/* Classes Table */}
            <div className="content-card overflow-hidden">
                <table className="data-table">
                    <thead>
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Class Name</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Subjects</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Students</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                        {Array.isArray(classes) && classes.length > 0 ? (
                            classes.map((cls) => (
                                <tr key={cls.id}>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="text-sm font-medium text-gray-900">{cls.name}</div>
                                        <div className="text-xs text-gray-500">{cls.students?.length || 0} Students</div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="flex flex-wrap gap-1">
                                            {Array.isArray(cls.subjects) && cls.subjects.map((sub) => (
                                                <span key={sub.id} className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-blue-100 text-blue-800">
                                                    {sub.name}
                                                </span>
                                            ))}
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <Button size="sm" variant="outline" onClick={() => openBulkEnroll(cls.id)} className="flex items-center gap-1">
                                            <UserPlus className="w-3 h-3" />
                                            Manage Students
                                        </Button>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="flex items-center space-x-2">
                                            <Button size="sm" variant="outline" onClick={() => openEditDialog(cls)} className="flex items-center gap-1 text-blue-600 border-blue-300 hover:bg-blue-50">
                                                <Pencil className="w-3 h-3" />
                                                Edit
                                            </Button>
                                            <Button size="sm" variant="outline" onClick={() => openDeleteDialog(cls.id)} className="flex items-center gap-1 text-red-600 border-red-300 hover:bg-red-50">
                                                <Trash2 className="w-3 h-3" />
                                                Delete
                                            </Button>
                                        </div>
                                    </td>
                                </tr>
                            ))
                        ) : (
                            <tr>
                                <td colSpan="4" className="px-6 py-10 text-center text-gray-500 italic">No classes found.</td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>

            {/* Edit Class Dialog */}
            <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
                <DialogContent className="max-w-lg">
                    <DialogHeader>
                        <DialogTitle>Edit Class</DialogTitle>
                        <DialogDescription>Update the class name and assigned subjects.</DialogDescription>
                    </DialogHeader>
                    {editClass && (
                        <div className="space-y-4 py-4">
                            <div>
                                <Label>Class Name</Label>
                                <Input value={editClass.name} onChange={e => setEditClass({ ...editClass, name: e.target.value })} placeholder="Class name" />
                            </div>
                            <div>
                                <Label className="mb-2 block">Subjects</Label>
                                <div className="grid grid-cols-2 gap-2 max-h-48 overflow-y-auto border rounded-md p-3">
                                    {Array.isArray(subjects) && subjects.map((subject) => (
                                        <div key={subject.id} className="flex items-center space-x-2">
                                            <input type="checkbox" id={`edit-subject-${subject.id}`}
                                                checked={(editClass.subjects || []).includes(subject.id)}
                                                onChange={(e) => handleEditSubjectChange(subject.id, e.target.checked)}
                                                className="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500" />
                                            <label htmlFor={`edit-subject-${subject.id}`} className="text-sm text-gray-700">{subject.name}</label>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    )}
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>Cancel</Button>
                        <Button onClick={handleEditSubmit}>Save Changes</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Delete Confirmation Dialog */}
            <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
                <DialogContent className="max-w-sm">
                    <DialogHeader>
                        <DialogTitle>Delete Class</DialogTitle>
                        <DialogDescription>
                            Are you sure you want to delete <strong>{classes.find(c => c.id === deleteClassId)?.name}</strong>? This action cannot be undone. Students in this class will be unassigned.
                        </DialogDescription>
                    </DialogHeader>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setIsDeleteDialogOpen(false)}>Cancel</Button>
                        <Button variant="destructive" onClick={handleDeleteClass}>Delete Class</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Bulk Enroll Dialog */}
            <Dialog open={isBulkDialogOpen} onOpenChange={setIsBulkDialogOpen}>
                <DialogContent className="max-w-2xl">
                    <DialogHeader>
                        <DialogTitle>Enroll Students</DialogTitle>
                        <DialogDescription>
                            Select students to add to {Array.isArray(classes) ? classes.find(c => c.id === selectedClassId)?.name : 'Class'}
                        </DialogDescription>
                    </DialogHeader>
                    <div className="py-4 space-y-4">
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                            <Input
                                placeholder="Search by name, email or ID..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="pl-10"
                            />
                        </div>
                        <div className="max-h-[300px] overflow-y-auto border rounded-md">
                            <table className="w-full text-sm">
                                <thead className="bg-gray-50 sticky top-0">
                                    <tr>
                                        <th className="px-4 py-2 text-left">Select</th>
                                        <th className="px-4 py-2 text-left">Name</th>
                                        <th className="px-4 py-2 text-left">Email</th>
                                        <th className="px-4 py-2 text-left">Current Class</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y">
                                    {isLoadingStudents ? (
                                        <tr>
                                            <td colSpan="4" className="py-8 text-center">
                                                <div className="flex flex-col items-center gap-2 text-gray-400">
                                                    <div className="w-5 h-5 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                                                    <span>Loading students...</span>
                                                </div>
                                            </td>
                                        </tr>
                                    ) : filteredStudents.length === 0 ? (
                                        <tr>
                                            <td colSpan="4" className="py-8 text-center text-gray-400 italic">
                                                {searchTerm ? "No students match your search." : "No active students available."}
                                            </td>
                                        </tr>
                                    ) : (
                                        filteredStudents.map(student => (
                                            <tr key={student.id} className="hover:bg-gray-50">
                                                <td className="px-4 py-2">
                                                    <input
                                                        type="checkbox"
                                                        className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                                                        checked={selectedStudentIds.includes(student.id)}
                                                        onChange={() => toggleStudentSelection(student.id)}
                                                    />
                                                </td>
                                                <td className="px-4 py-2">
                                                    <div className="font-medium text-gray-900">{student.name}</div>
                                                </td>
                                                <td className="px-4 py-2 text-gray-500 text-xs">{student.email}</td>
                                                <td className="px-4 py-2">
                                                    {student.class?.name ? (
                                                        <span className="text-[10px] bg-gray-100 text-gray-600 px-2 py-1 rounded-full">{student.class.name}</span>
                                                    ) : (
                                                        <span className="text-gray-400 text-[10px] uppercase tracking-wider font-semibold">Unassigned</span>
                                                    )}
                                                </td>
                                            </tr>
                                        ))
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setIsBulkDialogOpen(false)}>Cancel</Button>
                        <Button onClick={handleBulkEnroll} disabled={selectedStudentIds.length === 0}>
                            Enroll {selectedStudentIds.length} Students
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}
