"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSession, signOut } from "next-auth/react";
import {
    LayoutDashboard, Users, BookOpen, School,
    FileText, Megaphone, GraduationCap, Code,
    ClipboardList, Brain, ShieldAlert, Power,
    ChevronDown, Settings
} from "lucide-react";

export default function Sidebar() {
    const { data: session } = useSession();
    const pathname = usePathname();
    const role = session?.user?.role;

    if (!role) return null;

    const initials = session.user.name
        ? session.user.name.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2)
        : "U";

    /* ── Role-based nav links ── */
    const teacherLinks = [
        { href: "/dashboard/teacher", icon: LayoutDashboard, label: "Dashboard" },
        { href: "/dashboard/teacher/pending-students", icon: Users, label: "Pending Students" },
        { href: "/dashboard/teacher/students", icon: GraduationCap, label: "My Students" },
        { href: "/dashboard/teacher/subjects", icon: BookOpen, label: "Subjects" },
        { href: "/dashboard/teacher/classes", icon: School, label: "Classes" },
        { href: "/dashboard/teacher/assignments", icon: ClipboardList, label: "Assignments" },
        { href: "/dashboard/teacher/marks", icon: FileText, label: "Marks" },
        { href: "/dashboard/teacher/announcements", icon: Megaphone, label: "Announcements" },
        { href: "/dashboard/settings", icon: Settings, label: "Settings" },
    ];

    const adminLinks = [
        { href: "/dashboard/admin", icon: LayoutDashboard, label: "Admin Panel" },
        { href: "/dashboard/admin/pending-teachers", icon: Users, label: "Pending Teachers" },
        ...(role === "super_admin"
            ? [{ href: "/dashboard/admin/pending-admins", icon: ShieldAlert, label: "Admin Requests" }]
            : []),
        { href: "/dashboard/admin/users", icon: Users, label: "User Management" },
        { href: "/dashboard/settings", icon: Settings, label: "Settings" },
    ];

    const studentLinks = [
        { href: "/dashboard/student", icon: LayoutDashboard, label: "Dashboard" },
        { href: "/dashboard/student/quizzes", icon: Brain, label: "Quizzes" },
        { href: "/dashboard/student/assignments", icon: ClipboardList, label: "Assignments" },
        { href: "/dashboard/student/marks", icon: GraduationCap, label: "My Marks" },
        { href: "/dashboard/student/classes", icon: School, label: "My Classes" },
        { href: "/dashboard/student/announcements", icon: Megaphone, label: "Announcements" },
        { href: "/dashboard/student/virtual-lab", icon: Code, label: "Virtual Lab" },
        { href: "/dashboard/settings", icon: Settings, label: "Settings" },
    ];

    let links = studentLinks;
    if (role === "admin" || role === "super_admin") links = adminLinks;
    else if (role === "teacher") links = teacherLinks;

    const roleName = role.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());

    return (
        <aside className="sb hidden md:flex flex-col">

            {/* ── Brand ── */}
            <div className="sb-brand">
                <div className="sb-brand-icon">🎓</div>
                <div>
                    <div className="sb-brand-name">EduPortal</div>
                    <div className="sb-brand-sub">Online Grading System</div>
                </div>
            </div>

            <div className="sb-divider" />

            {/* ── User card ── */}
            <div className="sb-user">
                <div className="sb-avatar">{initials}</div>
                <div className="sb-user-info">
                    <div className="sb-user-name">{session.user.name}</div>
                    <div className="sb-user-role">{roleName}</div>
                </div>
                <ChevronDown className="sb-chevron" />
            </div>

            <div className="sb-divider" />

            {/* ── Nav ── */}
            <nav className="sb-nav">
                <div className="sb-section-label">Menu</div>
                <ul style={{ listStyle: "none", padding: 0, margin: 0 }}>
                    {links.map(({ href, icon: Icon, label }) => {
                        const exact = href === "/dashboard/teacher" || href === "/dashboard/student" || href === "/dashboard/admin";
                        const isActive = exact ? pathname === href : pathname.startsWith(href);
                        return (
                            <li key={href}>
                                <Link href={href} className={`sb-link${isActive ? " sb-active" : ""}`}>
                                    <span className="sb-link-icon">
                                        <Icon size={18} />
                                    </span>
                                    <span className="sb-link-label">{label}</span>
                                    {isActive && <span className="sb-active-dot" />}
                                </Link>
                            </li>
                        );
                    })}
                </ul>
            </nav>

            {/* ── Footer / Logout ── */}
            <div className="sb-footer">
                <div className="sb-divider mb-3" />
                <button
                    className="sb-logout"
                    onClick={() => signOut({ callbackUrl: `${window.location.origin}/login` })}
                >
                    <span>🚪</span>
                    <span>Sign Out</span>
                </button>
            </div>

        </aside>
    );
}
