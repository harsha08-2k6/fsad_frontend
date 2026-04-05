"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function RegisterPage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("student");
  const [assignedTeacherId, setAssignedTeacherId] = useState("");
  const [teachers, setTeachers] = useState([]);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (role === 'student') {
      fetch("/api/teachers/active")
        .then(res => res.json())
        .then(data => {
          if (Array.isArray(data)) {
            setTeachers(data);
          } else {
            setTeachers([]);
          }
        })
        .catch(err => console.error("Error fetching teachers:", err));
    }
  }, [role]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setSuccess(null);
    try {
      const res = await fetch("/api/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, password, role, assignedTeacherId }),
      });
      
      const resClone = res.clone(); // Clone the response
      let data;
      try {
        data = await res.json();
      } catch (err) {
        const rawText = await resClone.text(); // Read text from the clone
        console.error("Server Error Detail:", rawText);
        throw new Error("Backend Error: " + (rawText.substring(0, 100) || "Check console"));
      }

      if (res.ok) {
        setSuccess(data.user);
        setName("");
        setEmail("");
        setPassword("");
      } else {
        setError(data.message || "Registration failed");
      }
    } catch (err) {
      setError(err.message || "An error occurred. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <style>{`
        .rp-root {
          min-height: 100vh;
          display: flex;
          align-items: center;
          justify-content: center;
          background: #0d1117;
          padding: 1rem;
          position: relative;
          overflow: hidden;
        }
        .rp-blob {
          position: absolute;
          border-radius: 50%;
          filter: blur(80px);
          pointer-events: none;
        }
        .rp-blob-1 {
          width: 500px; height: 500px;
          background: rgba(79,70,229,0.18);
          top: -120px; left: -120px;
          animation: rpBlobPulse 7s ease-in-out infinite;
        }
        .rp-blob-2 {
          width: 400px; height: 400px;
          background: rgba(124,58,237,0.13);
          bottom: -100px; right: -80px;
          animation: rpBlobPulse 9s ease-in-out infinite reverse;
        }
        @keyframes rpBlobPulse {
          0%,100% { transform: scale(1); }
          50% { transform: scale(1.08); }
        }
        .rp-card {
          background: #ffffff;
          border-radius: 20px;
          width: 100%;
          max-width: 420px;
          padding: 2.25rem 2.25rem 2rem;
          box-shadow: 0 24px 64px rgba(0,0,0,0.4), 0 0 0 1px rgba(255,255,255,0.05);
          position: relative;
          z-index: 2;
          animation: rpCardIn 0.4s cubic-bezier(0.22,1,0.36,1) both;
        }
        @keyframes rpCardIn {
          from { opacity:0; transform: translateY(24px) scale(0.97); }
          to   { opacity:1; transform: translateY(0) scale(1); }
        }
        .rp-header {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          margin-bottom: 1.75rem;
          padding-bottom: 1.25rem;
          border-bottom: 1px solid #f1f5f9;
        }
        .rp-logo {
          width: 42px; height: 42px;
          border-radius: 12px;
          background: linear-gradient(135deg, #4f46e5, #7c3aed);
          display: flex; align-items: center; justify-content: center;
          font-size: 20px;
          box-shadow: 0 4px 14px rgba(79,70,229,0.4);
          flex-shrink: 0;
        }
        .rp-title {
          font-size: 1.125rem;
          font-weight: 800;
          color: #0d1117;
          letter-spacing: -0.03em;
          line-height: 1.2;
        }
        .rp-subtitle {
          font-size: 0.75rem;
          color: #94a3b8;
          font-weight: 500;
          margin-top: 1px;
        }
        .rp-field { margin-bottom: 1rem; }
        .rp-label {
          display: block;
          font-size: 0.8rem;
          font-weight: 600;
          color: #334155;
          margin-bottom: 0.35rem;
          letter-spacing: 0.01em;
        }
        .rp-input {
          width: 100%;
          border: 1.5px solid #e2e8f0;
          border-radius: 10px;
          padding: 0.6rem 0.875rem;
          font-size: 0.9rem;
          color: #0d1117;
          background: #f8faff;
          outline: none;
          transition: border-color 0.2s, box-shadow 0.2s;
          font-family: inherit;
          box-sizing: border-box;
        }
        .rp-input:focus {
          border-color: #4f46e5;
          background: #fff;
          box-shadow: 0 0 0 3px rgba(79,70,229,0.1);
        }
        .rp-select {
          width: 100%;
          border: 1.5px solid #e2e8f0;
          border-radius: 10px;
          padding: 0.6rem 0.875rem;
          font-size: 0.9rem;
          color: #0d1117;
          background: #f8faff;
          outline: none;
          transition: border-color 0.2s, box-shadow 0.2s;
          font-family: inherit;
          box-sizing: border-box;
          cursor: pointer;
          appearance: none;
          -webkit-appearance: none;
          background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 12 12'%3E%3Cpath fill='%2394a3b8' d='M6 8L1 3h10z'/%3E%3C/svg%3E");
          background-repeat: no-repeat;
          background-position: right 0.875rem center;
          padding-right: 2.25rem;
        }
        .rp-select:focus {
          border-color: #4f46e5;
          background-color: #fff;
          box-shadow: 0 0 0 3px rgba(79,70,229,0.1);
        }
        .rp-error {
          background: #fef2f2;
          border: 1px solid #fecaca;
          border-radius: 8px;
          padding: 0.5rem 0.75rem;
          font-size: 0.82rem;
          color: #dc2626;
          font-weight: 500;
          margin-bottom: 0.875rem;
          display: flex;
          align-items: center;
          gap: 0.375rem;
        }
        .rp-btn {
          width: 100%;
          background: linear-gradient(135deg, #4f46e5, #7c3aed);
          color: #fff;
          border: none;
          border-radius: 10px;
          padding: 0.75rem;
          font-size: 0.9375rem;
          font-weight: 700;
          cursor: pointer;
          transition: opacity 0.2s, transform 0.2s, box-shadow 0.2s;
          box-shadow: 0 4px 14px rgba(79,70,229,0.35);
          font-family: inherit;
          letter-spacing: 0.01em;
          margin-top: 0.25rem;
        }
        .rp-btn:hover:not(:disabled) {
          opacity: 0.92;
          transform: translateY(-1px);
          box-shadow: 0 8px 22px rgba(79,70,229,0.45);
        }
        .rp-btn:disabled { opacity: 0.65; cursor: not-allowed; }
        .rp-footer-link {
          text-align: center;
          font-size: 0.8125rem;
          color: #94a3b8;
          margin-top: 1.25rem;
        }
        .rp-footer-link a {
          color: #4f46e5;
          font-weight: 600;
          text-decoration: none;
        }
        .rp-footer-link a:hover { text-decoration: underline; }
      `}</style>

      <div className="rp-root">
        <div className="rp-blob rp-blob-1" />
        <div className="rp-blob rp-blob-2" />

        <div className="rp-card">
          <div className="rp-header">
            <div className="rp-logo">🎓</div>
            <div>
              <div className="rp-title">EduPortal</div>
              <div className="rp-subtitle">Register for approval</div>
            </div>
          </div>

          {success ? (
            <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
              <div className="bg-emerald-50 border border-emerald-100 p-6 rounded-2xl text-center">
                <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center text-3xl mx-auto mb-4">⌛</div>
                <h3 className="text-emerald-900 font-bold text-lg mb-2">Registration Submitted!</h3>
                <p className="text-emerald-700 text-sm leading-relaxed mb-6">
                  Your request has been received. You will be able to log in once your account is activated by an administrator or teacher.
                </p>
                <Link href="/login" className="rp-btn block text-center no-underline">
                  Return to Login
                </Link>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmit}>
              <div className="rp-field">
                <label className="rp-label" htmlFor="name">Full Name</label>
                <input
                  id="name"
                  type="text"
                  className="rp-input"
                  placeholder="John Doe"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                  autoComplete="name"
                />
              </div>
              <div className="rp-field">
                <label className="rp-label" htmlFor="email">Email address</label>
                <input
                  id="email"
                  type="email"
                  className="rp-input"
                  placeholder="you@school.edu"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  autoComplete="email"
                />
              </div>
              <div className="rp-field">
                <label className="rp-label" htmlFor="password">Password</label>
                <input
                  id="password"
                  type="password"
                  className="rp-input"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  autoComplete="new-password"
                />
              </div>
              <div className="rp-field">
                <label className="rp-label" htmlFor="role">Role</label>
                <select
                  id="role"
                  className="rp-select"
                  value={role}
                  onChange={(e) => setRole(e.target.value)}
                  required
                >
                  <option value="student">Student</option>
                  <option value="teacher">Teacher</option>
                  <option value="admin">Admin</option>
                </select>
              </div>
              {role === 'student' && (
                <div className="rp-field animate-in fade-in slide-in-from-top-2 duration-300">
                  <label className="rp-label" htmlFor="teacher">Select Your Teacher</label>
                  <select
                    id="teacher"
                    className="rp-select"
                    value={assignedTeacherId}
                    onChange={(e) => setAssignedTeacherId(e.target.value)}
                    required
                  >
                    <option value="">Choose a teacher...</option>
                    {teachers.map(t => (
                      <option key={t.id} value={t.id}>{t.name}</option>
                    ))}
                  </select>
                </div>
              )}
              {error && (
                <div className="rp-error">
                  <span>⚠️</span> {error}
                </div>
              )}
              <button type="submit" className="rp-btn" disabled={loading}>
                {loading ? "Processing…" : "Request Access →"}
              </button>
            </form>
          )}

          {!success && (
            <div className="rp-footer-link">
              Already have an account?{" "}
              <Link href="/login">Sign in here</Link>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
