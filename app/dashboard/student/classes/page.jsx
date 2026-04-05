"use client";
import { useEffect, useState } from "react";
export default function StudentClassesPage() {
    const [classes, setClasses] = useState([]);
    const [loading, setLoading] = useState(true);
    useEffect(() => {
        fetch('/api/classes')
            .then(res => res.json())
            .then(data => {
            if (Array.isArray(data)) {
                setClasses(data);
            }
            setLoading(false);
        })
            .catch(err => {
            console.error("Failed to fetch classes", err);
            setLoading(false);
        });
    }, []);
    if (loading) {
        return <div>Loading...</div>;
    }
    return (<div>
            <h1 className="page-title mb-8">My Classes & Subjects</h1>

            {classes.length === 0 ? (<div className="content-card content-card-body text-center text-gray-500">
                    You are not enrolled in any classes yet.
                </div>) : (<div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {classes.map((cls) => (<div key={cls.id} className="content-card overflow-hidden">
                            <div className="bg-indigo-600 px-6 py-4">
                                <h2 className="text-xl font-bold text-white">{cls.name}</h2>
                                <p className="text-indigo-100 text-sm mt-1">
                                    Teacher: {cls.teacherId?.name || 'Unknown'}
                                </p>
                            </div>
                            <div className="p-6">
                                <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-4">
                                    Subjects
                                </h3>
                                <div className="space-y-3">
                                    {cls.subjects && cls.subjects.length > 0 ? (cls.subjects.map((subject) => (<div key={subject.id} className="flex items-center p-3 bg-gray-50 rounded-lg">
                                                <div className="flex-shrink-0 h-10 w-10 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600 font-bold">
                                                    {subject.code ? subject.code.substring(0, 2) : 'SUB'}
                                                </div>
                                                <div className="ml-4">
                                                    <div className="text-sm font-medium text-gray-900">{subject.name}</div>
                                                    <div className="text-xs text-gray-500">{subject.code}</div>
                                                </div>
                                            </div>))) : (<p className="text-gray-500 text-sm">No subjects assigned to this class.</p>)}
                                </div>
                            </div>
                        </div>))}
                </div>)}
        </div>);
}
