"use client";
import { useEffect, useState } from "react";

export default function StudentAnnouncementsPage() {
    const [announcements, setAnnouncements] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetch('/api/announcements')
            .then(res => res.json())
            .then(data => {
                if (Array.isArray(data)) {
                    setAnnouncements(data);
                } else {
                    setAnnouncements([]);
                }
            })
            .catch(err => {
                console.error("Fetch error:", err);
                setAnnouncements([]);
            })
            .finally(() => setLoading(false));
    }, []);

    if (loading) return <div className="p-6">Loading announcements...</div>;

    return (
        <div className="p-6">
            <h1 className="page-title mb-6">Announcements</h1>
            <div className="space-y-4">
                {Array.isArray(announcements) && announcements.length > 0 ? (
                    announcements.map((announcement) => (
                        <div key={announcement.id} className="content-card content-card-body p-4 border rounded-lg shadow-sm">
                            <h2 className="text-xl font-semibold">{announcement.title}</h2>
                            <p className="text-gray-500 text-sm mb-2">
                                {new Date(announcement.date || announcement.created_at || announcement.createdAt || Date.now()).toLocaleDateString()}
                            </p>
                            <p className="text-gray-700">{announcement.content}</p>
                        </div>
                    ))
                ) : (
                    <div className="text-center py-10 bg-gray-50 rounded-lg">
                        <p className="text-gray-500">No announcements found at the moment.</p>
                    </div>
                )}
            </div>
        </div>
    );
}

