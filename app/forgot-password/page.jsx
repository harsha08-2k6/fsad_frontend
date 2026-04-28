"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function ForgotPasswordPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const res = await fetch("/api/auth/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });

      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError(data.message || "Unable to send OTP. Please try again.");
        return;
      }

      router.push(`/verify-otp?email=${encodeURIComponent(email)}`);
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@400;600;700&display=swap');

        .fp-root {
          min-height: 100vh;
          display: flex;
          align-items: center;
          justify-content: center;
          background: radial-gradient(1200px circle at 20% 10%, rgba(79,70,229,0.18), transparent 40%), #0d1117;
          padding: 1rem;
          position: relative;
          overflow: hidden;
          font-family: "Space Grotesk", system-ui, -apple-system, "Segoe UI", sans-serif;
        }
        .fp-card {
          background: #ffffff;
          border-radius: 20px;
          width: 100%;
          max-width: 420px;
          padding: 2.25rem 2.25rem 2rem;
          box-shadow: 0 24px 64px rgba(0,0,0,0.4), 0 0 0 1px rgba(255,255,255,0.05);
          position: relative;
          z-index: 2;
          animation: fpCardIn 0.4s cubic-bezier(0.22,1,0.36,1) both;
        }
        @keyframes fpCardIn {
          from { opacity:0; transform: translateY(24px) scale(0.97); }
          to   { opacity:1; transform: translateY(0) scale(1); }
        }
        .fp-header {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          margin-bottom: 1.75rem;
          padding-bottom: 1.25rem;
          border-bottom: 1px solid #f1f5f9;
        }
        .fp-logo {
          width: 42px; height: 42px;
          border-radius: 12px;
          background: linear-gradient(135deg, #4f46e5, #7c3aed);
          display: flex; align-items: center; justify-content: center;
          font-size: 20px;
          box-shadow: 0 4px 14px rgba(79,70,229,0.4);
          flex-shrink: 0;
        }
        .fp-title {
          font-size: 1.125rem;
          font-weight: 700;
          color: #0d1117;
          letter-spacing: -0.03em;
          line-height: 1.2;
        }
        .fp-subtitle {
          font-size: 0.75rem;
          color: #94a3b8;
          font-weight: 500;
          margin-top: 1px;
        }
        .fp-field { margin-bottom: 1rem; }
        .fp-label {
          display: block;
          font-size: 0.8rem;
          font-weight: 600;
          color: #334155;
          margin-bottom: 0.35rem;
          letter-spacing: 0.01em;
        }
        .fp-input {
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
        .fp-input:focus {
          border-color: #4f46e5;
          background: #fff;
          box-shadow: 0 0 0 3px rgba(79,70,229,0.1);
        }
        .fp-error {
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
        .fp-btn {
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
        .fp-btn:hover:not(:disabled) {
          opacity: 0.92;
          transform: translateY(-1px);
          box-shadow: 0 8px 22px rgba(79,70,229,0.45);
        }
        .fp-btn:disabled { opacity: 0.65; cursor: not-allowed; }
        .fp-footer-link {
          text-align: center;
          font-size: 0.8125rem;
          color: #94a3b8;
          margin-top: 1.25rem;
        }
        .fp-footer-link a {
          color: #4f46e5;
          font-weight: 600;
          text-decoration: none;
        }
        .fp-footer-link a:hover { text-decoration: underline; }
      `}</style>

      <div className="fp-root">
        <div className="fp-card">
          <div className="fp-header">
            <div className="fp-logo">OTP</div>
            <div>
              <div className="fp-title">Forgot Password</div>
              <div className="fp-subtitle">We will send a 6-digit OTP to your email</div>
            </div>
          </div>

          <form onSubmit={handleSubmit}>
            <div className="fp-field">
              <label className="fp-label" htmlFor="email">Email address</label>
              <input
                id="email"
                type="email"
                className="fp-input"
                placeholder="you@school.edu"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                autoComplete="email"
              />
            </div>

            {error && (
              <div className="fp-error">
                <span>!</span> {error}
              </div>
            )}

            <button type="submit" className="fp-btn" disabled={loading}>
              {loading ? "Sending OTP..." : "Send OTP"}
            </button>
          </form>

          <div className="fp-footer-link">
            Remembered your password? <Link href="/login">Back to Login</Link>
          </div>
        </div>
      </div>
    </>
  );
}
