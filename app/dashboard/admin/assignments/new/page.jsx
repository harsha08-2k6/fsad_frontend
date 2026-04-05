"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea"; // Need to check if I installed textarea
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { format } from "date-fns";
import { CalendarIcon } from "lucide-react";
import { cn } from "@/lib/utils";
export default function CreateAssignmentPage() {
    const router = useRouter();
    const [title, setTitle] = useState("");
    const [description, setDescription] = useState("");
    const [deadline, setDeadline] = useState();
    const [file, setFile] = useState(null);
    const [loading, setLoading] = useState(false);
    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            let fileUrl = "";
            if (file) {
                const formData = new FormData();
                formData.append("file", file);
                const uploadRes = await fetch("/api/upload", {
                    method: "POST",
                    body: formData,
                });
                if (uploadRes.ok) {
                    const data = await uploadRes.json();
                    fileUrl = data.url;
                }
            }
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
                }),
            });
            if (res.ok) {
                router.push("/dashboard/admin");
            }
        }
        catch (error) {
            console.error("Failed to create assignment", error);
        }
        finally {
            setLoading(false);
        }
    };
    return (<div className="max-w-2xl mx-auto">
            <Card>
                <CardHeader>
                    <CardTitle>Create New Assignment</CardTitle>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div className="space-y-2">
                            <Label htmlFor="title">Title</Label>
                            <Input id="title" value={title} onChange={(e) => setTitle(e.target.value)} required/>
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="description">Description</Label>
                            <Textarea id="description" value={description} onChange={(e) => setDescription(e.target.value)} required/>
                        </div>
                        <div className="space-y-2 flex flex-col">
                            <Label>Deadline</Label>
                            <Popover>
                                <PopoverTrigger asChild>
                                    <Button variant={"outline"} className={cn("w-full justify-start text-left font-normal", !deadline && "text-muted-foreground")}>
                                        <CalendarIcon className="mr-2 h-4 w-4"/>
                                        {deadline ? format(deadline, "PPP") : <span>Pick a date</span>}
                                    </Button>
                                </PopoverTrigger>
                                <PopoverContent className="w-auto p-0">
                                    <Calendar mode="single" selected={deadline} onSelect={setDeadline} initialFocus/>
                                </PopoverContent>
                            </Popover>
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="file">Attachment (Optional)</Label>
                            <Input id="file" type="file" onChange={(e) => setFile(e.target.files?.[0] || null)}/>
                        </div>
                        <Button type="submit" className="w-full" disabled={loading}>
                            {loading ? "Creating..." : "Create Assignment"}
                        </Button>
                    </form>
                </CardContent>
            </Card>
        </div>);
}
