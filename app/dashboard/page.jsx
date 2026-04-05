"use client";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
export default function DashboardPage() {
    const { data: session, status } = useSession();
    const router = useRouter();
    useEffect(() => {
        if (status === "authenticated") {
            if (session.user.role === "admin" || session.user.role === "super_admin") {
                router.push("/dashboard/admin");
            } else if (session.user.role === "teacher") {
                router.push("/dashboard/teacher");
            } else {
                router.push("/dashboard/student");
            }
        }
    }, [status, session, router]);
    return <div className="flex items-center justify-center h-full">Redirecting...</div>;
}
