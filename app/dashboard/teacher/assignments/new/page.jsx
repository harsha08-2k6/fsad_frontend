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
import { 
    CalendarIcon, 
    ArrowLeft, 
    AlertCircle, 
    Rocket, 
    BookOpen, 
    FileUp, 
    Target,
    HelpCircle,
    CheckCircle2,
    Loader2,
    Users
} from "lucide-react";
import { cn } from "@/lib/utils";
import Link from "next/link";

export default function CreateAssignmentPage() {
    const router = useRouter();
    const [title, setTitle] = useState("");
    const [description, setDescription] = useState("");
    const [deadline, setDeadline] = useState();
    const [dueTime, setDueTime] = useState("23:59");
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
                }
            } catch (uploadErr) {
                console.warn("File upload error:", uploadErr.message);
            }
        }

        try {
            const finalDeadline = new Date(deadline);
            if (dueTime) {
                const [hours, minutes] = dueTime.split(':');
                finalDeadline.setHours(parseInt(hours), parseInt(minutes));
            }

            const res = await fetch("/api/assignments", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    title,
                    description,
                    deadline: finalDeadline,
                    fileUrl,
                    classId,
                }),
            });

            if (res.ok) {
                router.push("/dashboard/teacher/assignments");
            } else {
                const data = await res.json().catch(() => ({}));
                setError(data.message || "Failed to create assignment.");
            }
        } catch (err) {
            console.error("Failed to create assignment:", err);
            setError("Cannot connect to the server. Please ensure backend is running.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="space-y-8 animate-in fade-in duration-700 max-w-4xl mx-auto px-4 py-8">
            {/* Back Navigation */}
            <div className="flex items-center justify-between">
                <Link href="/dashboard/teacher/assignments" className="group flex items-center text-sm font-black text-gray-400 hover:text-navy transition-colors uppercase tracking-widest">
                    <div className="p-1.5 rounded-lg border border-gray-100 group-hover:border-navy/20 mr-2 transition-all">
                        <ArrowLeft className="h-4 w-4" />
                    </div>
                    Back to Assignments
                </Link>
            </div>

            {/* Header Area */}
            <div className="page-header border-b border-gray-100 pb-8">
                <div className="flex items-start gap-4">
                    <div className="p-4 bg-navy rounded-2xl shadow-lg shadow-navy/10 transform">
                        <FileUp className="w-8 h-8 text-primary stroke-[2]" />
                    </div>
                    <div>
                        <h1 className="text-4xl font-black tracking-tight text-navy">
                            Create <span className="text-primary italic">Assignment</span>
                        </h1>
                    </div>
                </div>
            </div>

            <div className="relative">
                {/* Decorative blob */}
                <div className="absolute -top-10 -right-10 w-64 h-64 bg-primary/5 rounded-full blur-3xl -z-10"></div>
                <div className="absolute -bottom-10 -left-10 w-64 h-64 bg-navy/5 rounded-full blur-3xl -z-10"></div>

                <Card className="content-card shadow-[0_32px_64px_-16px_rgba(11,31,58,0.15)] border-none overflow-hidden hover:shadow-[0_48px_80px_-20px_rgba(11,31,58,0.2)] transition-shadow duration-500">
                    <CardHeader className="bg-navy/5 border-b border-gray-100 p-8">
                        <CardTitle className="text-xl font-black text-navy flex items-center gap-3">
                            <BookOpen className="w-6 h-6 text-primary" />
                            Assignment Details
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="p-10">
                        {error && (
                            <div className="mb-8 flex items-start gap-3 rounded-2xl border-2 border-red-100 bg-red-50 p-6 text-red-700 animate-in shake duration-500">
                                <AlertCircle className="h-6 w-6 shrink-0 mt-0.5" />
                                <div>
                                    <h4 className="font-black text-sm uppercase tracking-wider mb-1">Configuration Error</h4>
                                    <p className="text-sm font-medium">{error}</p>
                                </div>
                            </div>
                        )}

                        <form onSubmit={handleSubmit} className="space-y-8">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                {/* Title Input */}
                                <div className="space-y-2.5">
                                    <Label htmlFor="title" className="text-[11px] font-black text-gray-400 uppercase tracking-widest ml-1 flex items-center gap-2">
                                        <Target className="w-3 h-3 text-primary" />
                                        Assignment Title
                                    </Label>
                                    <Input 
                                        id="title" 
                                        value={title} 
                                        onChange={(e) => setTitle(e.target.value)} 
                                        required 
                                        placeholder="e.g. Quantum Physics Quiz - Module 4" 
                                        className="form-input-styled h-14 bg-gray-50/50 border-2 font-black text-lg focus:bg-white"
                                    />
                                </div>

                                {/* Class Picker */}
                                <div className="space-y-2.5">
                                    <Label htmlFor="class" className="text-[11px] font-black text-gray-400 uppercase tracking-widest ml-1 flex items-center gap-2">
                                        <Users className="w-3 h-3 text-emerald-500" />
                                        Select Class
                                    </Label>
                                    <div className="relative">
                                        <select
                                            id="class"
                                            value={classId}
                                            onChange={(e) => setClassId(e.target.value)}
                                            required
                                            className="appearance-none h-14 w-full rounded-2xl border-2 border-gray-100 bg-gray-50/50 px-5 py-2 text-base font-black text-navy focus:outline-none focus:ring-4 focus:ring-primary/10 focus:border-primary transition-all pr-12 focus:bg-white"
                                        >
                                            <option value="" className="font-bold">Select a class...</option>
                                            {classes.map((cls) => (
                                                <option key={cls.id} value={cls.id} className="font-bold py-2">
                                                    {cls.name}
                                                </option>
                                            ))}
                                        </select>
                                        <div className="absolute right-5 top-1/2 -translate-y-1/2 pointer-events-none text-gray-400">
                                            <HelpCircle className="w-5 h-5" />
                                        </div>
                                    </div>
                                    {classes.length === 0 && (
                                        <p className="text-[10px] font-black text-amber-600 uppercase tracking-widest bg-amber-50 px-3 py-1 rounded-lg inline-block"> No active classes detected</p>
                                    )}
                                </div>

                                {/* Description Area */}
                                <div className="space-y-2.5 md:col-span-2">
                                    <Label htmlFor="description" className="text-[11px] font-black text-gray-400 uppercase tracking-widest ml-1">Instructions</Label>
                                    <Textarea 
                                        id="description" 
                                        value={description} 
                                        onChange={(e) => setDescription(e.target.value)} 
                                        required 
                                        placeholder="Add instructions here..." 
                                        className="form-input-styled min-h-[140px] bg-gray-50/50 border-2 font-medium text-base p-5 leading-relaxed resize-none focus:bg-white" 
                                    />
                                </div>

                                {/* Deadline Picker */}
                                <div className="space-y-2.5">
                                    <Label className="text-[11px] font-black text-gray-400 uppercase tracking-widest ml-1 flex items-center gap-2">
                                        <CalendarIcon className="w-3 h-3 text-amber-500" />
                                        Submission Deadline
                                    </Label>
                                    <div className="flex gap-2">
                                        <Popover>
                                            <PopoverTrigger asChild>
                                                <Button 
                                                    variant={"outline"} 
                                                    className={cn(
                                                        "flex-1 h-14 justify-start text-left font-black rounded-2xl border-2 border-gray-100 bg-gray-50/50 hover:bg-white transition-all px-5", 
                                                        !deadline && "text-muted-foreground"
                                                    )}
                                                >
                                                    <CalendarIcon className="mr-3 h-5 w-5 text-primary stroke-[2.5]" />
                                                    {deadline ? format(deadline, "PPP") : <span>Select date</span>}
                                                </Button>
                                            </PopoverTrigger>
                                            <PopoverContent className="w-auto p-0 rounded-3xl overflow-hidden shadow-2xl border-none">
                                                <Calendar 
                                                    mode="single" 
                                                    selected={deadline} 
                                                    onSelect={setDeadline} 
                                                    initialFocus 
                                                />
                                            </PopoverContent>
                                        </Popover>
                                        <div className="relative group/time">
                                            <Input
                                                type="time"
                                                value={dueTime}
                                                onChange={(e) => setDueTime(e.target.value)}
                                                className="h-14 w-32 rounded-2xl border-2 border-gray-100 bg-gray-50/50 font-black px-4 focus:bg-white transition-all"
                                            />
                                            <div className="absolute -top-6 left-0 right-0 text-[8px] font-black text-center text-gray-300 uppercase tracking-widest group-hover/time:text-primary transition-colors">Time (optional)</div>
                                        </div>
                                    </div>
                                </div>

                                {/* File Upload */}
                                <div className="space-y-2.5">
                                    <Label htmlFor="file" className="text-[11px] font-black text-gray-400 uppercase tracking-widest ml-1 flex items-center gap-2">
                                        <FileUp className="w-3 h-3 text-blue-500" />
                                        Reference Material (PDF/DOC)
                                    </Label>
                                    <div className="relative group/file">
                                        <Input 
                                            id="file" 
                                            type="file" 
                                            onChange={(e) => setFile(e.target.files?.[0] || null)} 
                                            className="h-14 opacity-0 absolute inset-0 z-10 cursor-pointer"
                                        />
                                        <div className="h-14 w-full rounded-2xl border-2 border-dashed border-gray-200 bg-gray-50/50 group-hover/file:border-primary/50 group-hover/file:bg-primary/5 transition-all flex items-center px-5 gap-3">
                                            <div className="p-1.5 bg-white rounded-lg shadow-sm">
                                                <FileUp className="w-5 h-5 text-gray-400 group-hover/file:text-primary transition-colors" />
                                            </div>
                                            <span className="text-sm font-bold text-gray-400 truncate max-w-[200px]">
                                                {file ? file.name : "Tap to browse or drop here"}
                                            </span>
                                            {file && <CheckCircle2 className="w-5 h-5 text-emerald-500 ml-auto animate-in zoom-in" />}
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Submit Area */}
                            <div className="pt-6 flex flex-col items-center gap-6">
                                <Button 
                                    type="submit" 
                                    className="w-full md:w-auto h-16 px-12 btn-primary-custom text-lg font-black uppercase tracking-[0.2em] shadow-2xl shadow-primary/20 gap-3 group relative overflow-hidden"
                                    disabled={loading}
                                >
                                    {loading ? (
                                        <Loader2 className="w-6 h-6 animate-spin" />
                                    ) : (
                                        <>
                                            <CheckCircle2 className="w-6 h-6 group-hover:scale-110 transition-transform" />
                                            Post Assignment
                                        </>
                                    )}
                                </Button>
                            </div>
                        </form>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}

