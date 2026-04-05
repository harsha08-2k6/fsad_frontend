"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { format } from "date-fns";
import { CalendarIcon, ArrowLeft, AlertCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import Link from "next/link";

export default function CreateAssignmentPage() {
    const router = useRouter();
    const [title, setTitle] = useState("");
    const [description, setDescription] = useState("");
    const [deadline, setDeadline] = useState();
    const [file, setFile] = useState(null);
    const [classId, setClassId] = useState("");
    const [classes, setClasses] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    useEffect(() => {
        fetchClasses();
    }, []);

    const fetchClasses = async () => {
        try {
            const res = await fetch("/api/classes");
            const data = await res.json();
            if (Array.isArray(data)) {
                setClasses(data);
            }
        } catch (err) {
            console.error("Failed to load classes", err);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError("");

        if (!classId) {
            setError("Please select a class for this assignment.");
            return;
        }
        if (!deadline) {
            setError("Please select a deadline for this assignment.");
            return;
        }

        setLoading(true);
        let fileUrl = "";

        // Upload file separately — failure here is non-fatal
        if (file) {
            try {
                const formData = new FormData();
                formData.append("file", file);
                const uploadRes = await fetch("/api/upload", {
                    method: "POST",
                    body: formData,
                });
                if (uploadRes.ok) {
                    const data = await uploadRes.json();
                    fileUrl = data.url || "";
                } else {
                    console.warn("File upload failed, proceeding without attachment.");
                }
            } catch (uploadErr) {
                console.warn("File upload error (backend may be unreachable):", uploadErr.message);
                // Non-fatal: continue creating the assignment without a file URL
            }
        }

        try {
            const res = await fetch("/api/assignments", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    title,
                    description,
                    deadline,
                    fileUrl,
                    classId,
                }),
            });

            if (res.ok) {
                router.push("/dashboard/teacher/assignments");
            } else {
                const data = await res.json().catch(() => ({}));
                setError(data.message || "Failed to create assignment. Please check that the backend server is running.");
            }
        } catch (err) {
            console.error("Failed to create assignment:", err);
            setError("Cannot connect to the server. Please make sure the backend is running on port 8081.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="p-6">
            <div className="mb-6">
                <Link href="/dashboard/teacher/assignments" className="flex items-center text-sm text-gray-500 hover:text-gray-700">
                    <ArrowLeft className="mr-2 h-4 w-4" />
                    Back to Assignments
                </Link>
            </div>

            <div className="max-w-2xl mx-auto">
                <Card>
                    <CardHeader>
                        <CardTitle>Create New Assignment</CardTitle>
                    </CardHeader>
                    <CardContent>
                        {error && (
                            <div className="mb-4 flex items-center gap-2 rounded-md border border-red-200 bg-red-50 px-3 py-2 text-red-700">
                                <AlertCircle className="h-4 w-4 shrink-0" />
                                <span className="text-sm">{error}</span>
                            </div>
                        )}
                        <form onSubmit={handleSubmit} className="space-y-6">
                            <div className="space-y-2">
                                <Label htmlFor="title">Title</Label>
                                <Input id="title" value={title} onChange={(e) => setTitle(e.target.value)} required placeholder="Assignment Title" />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="description">Description</Label>
                                <Textarea id="description" value={description} onChange={(e) => setDescription(e.target.value)} required placeholder="Describe the assignment task..." />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="class">Class <span className="text-red-500">*</span></Label>
                                <select
                                    id="class"
                                    value={classId}
                                    onChange={(e) => setClassId(e.target.value)}
                                    required
                                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                                >
                                    <option value="">Select a class...</option>
                                    {classes.map((cls) => (
                                        <option key={cls.id} value={cls.id}>
                                            {cls.name}
                                        </option>
                                    ))}
                                </select>
                                {classes.length === 0 && (
                                    <p className="text-xs text-amber-600">No classes found. Please create a class first.</p>
                                )}
                            </div>
                            <div className="space-y-2 flex flex-col">
                                <Label>Deadline <span className="text-red-500">*</span></Label>
                                <Popover>
                                    <PopoverTrigger asChild>
                                        <Button variant={"outline"} className={cn("w-full justify-start text-left font-normal", !deadline && "text-muted-foreground")}>
                                            <CalendarIcon className="mr-2 h-4 w-4" />
                                            {deadline ? format(deadline, "PPP") : <span>Pick a date</span>}
                                        </Button>
                                    </PopoverTrigger>
                                    <PopoverContent className="w-auto p-0">
                                        <Calendar mode="single" selected={deadline} onSelect={setDeadline} initialFocus />
                                    </PopoverContent>
                                </Popover>
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="file">Attachment (Optional)</Label>
                                <Input id="file" type="file" onChange={(e) => setFile(e.target.files?.[0] || null)} />
                            </div>
                            <Button type="submit" className="w-full" disabled={loading}>
                                {loading ? "Creating..." : "Create Assignment"}
                            </Button>
                        </form>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
