import CredentialsProvider from "next-auth/providers/credentials";

export const authOptions = {
    providers: [
        CredentialsProvider({
            name: "Credentials",
            credentials: {
                email: { label: "Email", type: "text" },
                password: { label: "Password", type: "password" },
            },
            async authorize(credentials) {
                if (!credentials?.email || !credentials?.password) {
                    throw new Error("Email and password are required.");
                }

                try {
                    // Call the Spring Boot backend to verify the user
                    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8081'}/api/auth/login`, {
                        method: "POST",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({
                            email: credentials.email.trim().toLowerCase(),
                            password: credentials.password
                        }),
                    });

                    if (!response.ok) {
                        const errorData = await response.json().catch(() => ({}));
                        throw new Error(errorData.message || "Invalid credentials.");
                    }
                    
                    const user = await response.json();
                    return {
                        id: user.id,
                        name: user.name,
                        email: user.email,
                        role: user.role,
                        status: user.status,
                        classId: user.schoolClass?.id || user.classId || null
                    };
                } catch (error) {
                    console.error("Auth error:", error.message);
                    // If it's a network error (backend down), tell the user
                    if (error.message.toLowerCase().includes("fetch") || error.message.toLowerCase().includes("failed")) {
                        throw new Error("Backend connection failed. Check NEXT_PUBLIC_API_URL on Render.");
                    }
                    throw new Error(error.message || "Login failed.");
                }
            },
        }),
    ],
    callbacks: {
        async jwt({ token, user }) {
            if (user) {
                token.name = user.name;
                token.role = user.role;
                token.id = user.id;
                token.status = user.status;
                token.classId = user.classId;
            }
            return token;
        },
        async session({ session, token }) {
            if (session.user) {
                session.user.name = token.name;
                session.user.role = token.role;
                session.user.id = token.id;
                session.user.status = token.status;
                session.user.classId = token.classId;
            }
            return session;
        },
    },
    pages: {
        signIn: "/login",
    },
    session: {
        strategy: "jwt",
    },
    secret: process.env.NEXTAUTH_SECRET,
};

