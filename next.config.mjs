/** @type {import('next').NextConfig} */
const nextConfig = {
    async rewrites() {
        return [
            {
                source: "/api/register",
                destination: `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8081'}`/api/register",
            },
            {
                source: "/api/teachers/active",
                destination: `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8081'}`/api/teachers/active",
            },
            {
                source: "/api/classes",
                destination: `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8081'}`/api/classes",
            },
            {
                source: "/api/classes/:path*",
                destination: `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8081'}`/api/classes/:path*",
            },
            {
                source: "/api/subjects",
                destination: `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8081'}`/api/subjects",
            },
            {
                source: "/api/subjects/:path*",
                destination: `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8081'}`/api/subjects/:path*",
            },
            {
                source: "/api/students",
                destination: `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8081'}`/api/students",
            },
            {
                source: "/api/students/:path*",
                destination: `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8081'}`/api/students/:path*",
            },
            {
                source: "/api/topics",
                destination: `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8081'}`/api/topics",
            },
            {
                source: "/api/topics/:path*",
                destination: `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8081'}`/api/topics/:path*",
            },
            {
                source: "/api/assignments/:path*",
                destination: `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8081'}`/api/assignments/:path*",
            },
            {
                source: "/api/assignments",
                destination: `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8081'}`/api/assignments",
            },
            {
                source: "/api/submissions/:path*",
                destination: `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8081'}`/api/submissions/:path*",
            },
            {
                source: "/api/submissions",
                destination: `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8081'}`/api/submissions",
            },
            {
                source: "/api/marks/:path*",
                destination: `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8081'}`/api/marks/:path*",
            },
            {
                source: "/api/marks",
                destination: `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8081'}`/api/marks",
            },
            {
                source: "/api/quizzes/:path*",
                destination: `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8081'}`/api/quizzes/:path*",
            },
            {
                source: "/api/quizzes",
                destination: `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8081'}`/api/quizzes",
            },
            {
                source: "/api/announcements/:path*",
                destination: `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8081'}`/api/announcements/:path*",
            },
            {
                source: "/api/announcements",
                destination: `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8081'}`/api/announcements",
            },
            {
                source: "/api/upload",
                destination: `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8081'}`/api/upload",
            },
            {
                source: "/api/code-execute",
                destination: `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8081'}`/api/code-execute",
            },
            {
                source: "/api/admin/:path*",
                destination: `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8081'}`/api/admin/:path*",
            },
            {
                source: "/api/users/:path*",
                destination: `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8081'}`/api/users/:path*",
            },
            {
                source: "/api/teacher/:path*",
                destination: `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8081'}`/api/teacher/:path*",
            },
            {
                source: "/api/superadmin/:path*",
                destination: `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8081'}`/api/admin/:path*",
            }
        ];
    },
    /* Allow cross-origin API calls */
    async headers() {
        return [
            {
                source: "/api/:path*",
                headers: [
                    { key: "Access-Control-Allow-Origin", value: "*" },
                    { key: "Access-Control-Allow-Methods", value: "GET, POST, PUT, PATCH, DELETE, OPTIONS" },
                    { key: "Access-Control-Allow-Headers", value: "Content-Type, Authorization" },
                ],
            },
        ];
    },
};

export default nextConfig;
