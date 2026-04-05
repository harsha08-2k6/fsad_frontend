"use client";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import Sidebar from "@/components/Sidebar";

export default function DashboardLayout({ children }) {
    const { data: session, status } = useSession();
    const router = useRouter();

    useEffect(() => {
        if (status === "unauthenticated") {
            router.push("/login");
        }
    }, [status, router]);

    if (status === "loading") {
        return (
            <div className="loading-screen">
                <div className="loading-spinner" />
                <span className="loading-text">Loading your dashboard…</span>
            </div>
        );
    }

    if (!session) return null;

    return (
        <div className="dashboard-root">
            {/* Sidebar */}
            <Sidebar />

            {/* Main area */}
            <div className="dashboard-content-wrapper">
                {/* Page content */}
                <main className="dashboard-main">
                    {children}
                </main>
            </div>
        </div>
    );
}
