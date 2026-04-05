"use client";
import React, { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ChevronDown, ChevronUp, Plus, Trash2, Pencil } from "lucide-react";
import { useToast } from "@/components/ui/toast";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter,
    DialogDescription,
} from "@/components/ui/dialog";

export default function TeacherSubjectsPage() {
    const { toast } = useToast();
    const [subjects, setSubjects] = useState([]);
    const [newSubject, setNewSubject] = useState({ name: '', code: '' });
    const [expandedSubject, setExpandedSubject] = useState(null);
    const [topics, setTopics] = useState({});
    const [newTopic, setNewTopic] = useState('');

    // Edit subject state
    const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
    const [editSubject, setEditSubject] = useState(null);

    // Delete subject state
    const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
    const [deleteSubjectId, setDeleteSubjectId] = useState(null);

    useEffect(() => {
        fetchSubjects();
    }, []);

    const fetchSubjects = () => {
        fetch('/api/subjects')
            .then(res => res.json())
            .then(data => {
                if (Array.isArray(data)) setSubjects(data);
                else setSubjects([]);
            });
    };

    const fetchTopics = async (subjectId) => {
        const res = await fetch(`/api/topics?subjectId=${subjectId}`);
        const data = await res.json();
        setTopics(prev => ({ ...prev, [subjectId]: data }));
    };

    const handleToggleExpand = (subjectId) => {
        if (expandedSubject === subjectId) {
            setExpandedSubject(null);
        } else {
            setExpandedSubject(subjectId);
            if (!topics[subjectId]) {
                fetchTopics(subjectId);
            }
        }
    };

    const handleSubmitSubject = async (e) => {
        e.preventDefault();
        try {
            const res = await fetch('/api/subjects', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(newSubject),
            });
            if (res.ok) {
                setNewSubject({ name: '', code: '' });
                fetchSubjects();
                toast({ message: "Subject added successfully!", type: "success" });
            } else {
                toast({ message: "Failed to add subject.", type: "error" });
            }
        } catch (error) {
            toast({ message: `Network error: ${error.message}`, type: "error" });
        }
    };

    const openEditSubject = (subject) => {
        setEditSubject({ id: subject.id, name: subject.name, code: subject.code, description: subject.description || '' });
        setIsEditDialogOpen(true);
    };

    const handleEditSubject = async () => {
        if (!editSubject) return;
        try {
            const res = await fetch(`/api/subjects/${editSubject.id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ name: editSubject.name, code: editSubject.code, description: editSubject.description }),
            });
            if (res.ok) {
                toast({ message: "Subject updated successfully!", type: "success" });
                setIsEditDialogOpen(false);
                setEditSubject(null);
                fetchSubjects();
            } else {
                toast({ message: "Failed to update subject.", type: "error" });
            }
        } catch {
            toast({ message: "Network error.", type: "error" });
        }
    };

    const openDeleteSubject = (subjectId) => {
        setDeleteSubjectId(subjectId);
        setIsDeleteDialogOpen(true);
    };

    const handleDeleteSubject = async () => {
        if (!deleteSubjectId) return;
        try {
            const res = await fetch(`/api/subjects/${deleteSubjectId}`, { method: 'DELETE' });
            if (res.ok) {
                toast({ message: "Subject deleted successfully!", type: "success" });
                setIsDeleteDialogOpen(false);
                setDeleteSubjectId(null);
                fetchSubjects();
            } else {
                toast({ message: "Failed to delete subject. It may be assigned to a class.", type: "error" });
            }
        } catch {
            toast({ message: "Network error.", type: "error" });
        }
    };

    const handleAddTopic = async (subjectId) => {
        if (!newTopic.trim()) return;
        try {
            const res = await fetch('/api/topics', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ subject: subjectId, name: newTopic }),
            });
            if (res.ok) {
                setNewTopic('');
                fetchTopics(subjectId);
            } else {
                toast({ message: "Failed to add topic.", type: "error" });
            }
        } catch (error) {
            toast({ message: `Network error: ${error.message}`, type: "error" });
        }
    };

    const handleDeleteTopic = async (subjectId, topicId) => {
        if (!confirm("Are you sure you want to delete this topic?")) return;
        try {
            const res = await fetch(`/api/topics/${topicId}`, { method: 'DELETE' });
            if (res.ok) {
                fetchTopics(subjectId);
            }
        } catch (error) {
            toast({ message: `Network error: ${error.message}`, type: "error" });
        }
    };

    return (
        <div className="space-y-6">
            <div className="page-header mb-8">
                <h1 className="page-title">Manage Subjects &amp; Topics</h1>
                <p className="page-subtitle">Add subjects and organize topics for AI quiz generation.</p>
            </div>

            {/* Add Subject Form */}
            <div className="content-card">
                <div className="content-card-header">
                    <h2 className="content-card-title">Add Subject</h2>
                </div>
                <div className="content-card-body">
                    <form onSubmit={handleSubmitSubject} className="flex flex-col md:flex-row gap-4 items-end">
                        <div className="flex-1">
                            <Label htmlFor="name" className="mb-2 block text-sm font-semibold text-gray-700">Subject Name</Label>
                            <Input id="name" value={newSubject.name} onChange={e => setNewSubject({ ...newSubject, name: e.target.value })} required className="form-input-styled" placeholder="e.g. Computer Graphics" />
                        </div>
                        <div className="flex-1">
                            <Label htmlFor="code" className="mb-2 block text-sm font-semibold text-gray-700">Subject Code</Label>
                            <Input id="code" value={newSubject.code} onChange={e => setNewSubject({ ...newSubject, code: e.target.value })} required className="form-input-styled" placeholder="e.g. CS401" />
                        </div>
                        <Button type="submit" className="w-full md:w-auto h-[42px]">Add Subject</Button>
                    </form>
                </div>
            </div>

            {/* Subjects Table */}
            <div className="content-card overflow-hidden">
                <table className="data-table">
                    <thead>
                        <tr>
                            <th>Subject Name</th>
                            <th>Code</th>
                            <th>Topics</th>
                            <th className="text-right">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-100">
                        {subjects.length === 0 ? (
                            <tr>
                                <td colSpan="4" className="px-6 py-10 text-center text-gray-400 italic">No subjects added yet.</td>
                            </tr>
                        ) : subjects.map((subject) => (
                            <React.Fragment key={subject.id}>
                                <tr className="hover:bg-gray-50/50 transition-colors">
                                    <td className="px-6 py-4 font-semibold text-gray-900">{subject.name}</td>
                                    <td className="px-6 py-4">
                                        <span className="badge badge-primary">{subject.code}</span>
                                    </td>
                                    <td className="px-6 py-4">
                                        <button
                                            onClick={() => handleToggleExpand(subject.id)}
                                            className="text-indigo-600 hover:text-indigo-800 text-sm font-medium flex items-center gap-1"
                                        >
                                            {expandedSubject === subject.id
                                                ? <><ChevronUp className="w-4 h-4" />Hide Topics</>
                                                : <><ChevronDown className="w-4 h-4" />Manage Topics</>
                                            }
                                        </button>
                                    </td>
                                    <td className="px-6 py-4 text-right">
                                        <div className="flex items-center justify-end space-x-2">
                                            <Button
                                                size="sm"
                                                variant="outline"
                                                onClick={() => openEditSubject(subject)}
                                                className="flex items-center gap-1 text-blue-600 border-blue-300 hover:bg-blue-50"
                                            >
                                                <Pencil className="w-3 h-3" />
                                                Edit
                                            </Button>
                                            <Button
                                                size="sm"
                                                variant="outline"
                                                onClick={() => openDeleteSubject(subject.id)}
                                                className="flex items-center gap-1 text-red-600 border-red-300 hover:bg-red-50"
                                            >
                                                <Trash2 className="w-3 h-3" />
                                                Delete
                                            </Button>
                                        </div>
                                    </td>
                                </tr>
                                {expandedSubject === subject.id && (
                                    <tr>
                                        <td colSpan="4" className="bg-gray-50/50 p-6 border-b border-gray-200">
                                            <div className="max-w-3xl ml-4 mr-4">
                                                <div className="flex items-center gap-3 mb-4">
                                                    <Input
                                                        value={newTopic}
                                                        onChange={e => setNewTopic(e.target.value)}
                                                        placeholder="Add a new topic to this subject..."
                                                        className="form-input-styled bg-white h-9"
                                                        onKeyDown={(e) => {
                                                            if (e.key === 'Enter') {
                                                                e.preventDefault();
                                                                handleAddTopic(subject.id);
                                                            }
                                                        }}
                                                    />
                                                    <Button onClick={() => handleAddTopic(subject.id)} size="sm" className="shrink-0 h-9">
                                                        <Plus className="w-4 h-4 mr-1" /> Add Topic
                                                    </Button>
                                                </div>
                                                <div className="bg-white rounded-lg border border-gray-200 overflow-hidden shadow-sm">
                                                    {topics[subject.id] ? (
                                                        topics[subject.id].length > 0 ? (
                                                            <ul className="divide-y divide-gray-100">
                                                                {topics[subject.id].map(topic => (
                                                                    <li key={topic.id} className="p-3 flex items-center justify-between hover:bg-gray-50 group">
                                                                        <div className="flex items-center gap-2">
                                                                            <span className="w-1.5 h-1.5 rounded-full bg-indigo-500"></span>
                                                                            <span className="text-gray-800 text-sm font-medium">{topic.name}</span>
                                                                        </div>
                                                                        <button onClick={() => handleDeleteTopic(subject.id, topic.id)} className="text-gray-400 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity p-1">
                                                                            <Trash2 className="w-4 h-4" />
                                                                        </button>
                                                                    </li>
                                                                ))}
                                                            </ul>
                                                        ) : (
                                                            <div className="p-6 text-center text-sm text-gray-500">
                                                                No topics created yet. Add one above!
                                                            </div>
                                                        )
                                                    ) : (
                                                        <div className="p-4 text-center text-sm text-gray-500">Loading topics...</div>
                                                    )}
                                                </div>
                                            </div>
                                        </td>
                                    </tr>
                                )}
                            </React.Fragment>
                        ))}
                    </tbody>
                </table>
            </div>

            {/* Edit Subject Dialog */}
            <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
                <DialogContent className="max-w-md">
                    <DialogHeader>
                        <DialogTitle>Edit Subject</DialogTitle>
                        <DialogDescription>Update the subject name, code, or description.</DialogDescription>
                    </DialogHeader>
                    {editSubject && (
                        <div className="space-y-4 py-4">
                            <div>
                                <Label>Subject Name</Label>
                                <Input
                                    value={editSubject.name}
                                    onChange={e => setEditSubject({ ...editSubject, name: e.target.value })}
                                    placeholder="e.g. Computer Graphics"
                                />
                            </div>
                            <div>
                                <Label>Subject Code</Label>
                                <Input
                                    value={editSubject.code}
                                    onChange={e => setEditSubject({ ...editSubject, code: e.target.value })}
                                    placeholder="e.g. CS401"
                                />
                            </div>
                            <div>
                                <Label>Description (optional)</Label>
                                <Input
                                    value={editSubject.description}
                                    onChange={e => setEditSubject({ ...editSubject, description: e.target.value })}
                                    placeholder="Brief description..."
                                />
                            </div>
                        </div>
                    )}
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>Cancel</Button>
                        <Button onClick={handleEditSubject}>Save Changes</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Delete Subject Dialog */}
            <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
                <DialogContent className="max-w-sm">
                    <DialogHeader>
                        <DialogTitle>Delete Subject</DialogTitle>
                        <DialogDescription>
                            Are you sure you want to delete <strong>{subjects.find(s => s.id === deleteSubjectId)?.name}</strong>? This will also remove it from all associated classes.
                        </DialogDescription>
                    </DialogHeader>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setIsDeleteDialogOpen(false)}>Cancel</Button>
                        <Button variant="destructive" onClick={handleDeleteSubject}>Delete Subject</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}
