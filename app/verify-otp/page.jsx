"use client";
import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";

export default function VerifyOtpPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const emailParam = searchParams.get("email");
    if (emailParam) setEmail(emailParam);
  }, [searchParams]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const res = await fetch("/api/auth/verify-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, otp }),
      });

      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError(data.message || "Invalid OTP. Please try again.");
        return;
      }

      sessionStorage.setItem("resetEmail", email);
      sessionStorage.setItem("resetOtp", otp);
      router.push(`/reset-password?email=${encodeURIComponent(email)}`);
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

        .vo-root {
          min-height: 100vh;
          display: flex;
          align-items: center;
          justify-content: center;
          background: radial-gradient(1200px circle at 80% 0%, rgba(124,58,237,0.16), transparent 40%), #0d1117;
          padding: 1rem;
          position: relative;
          overflow: hidden;
          font-family: "Space Grotesk", system-ui, -apple-system, "Segoe UI", sans-serif;
        }
        .vo-card {
          background: #ffffff;
          border-radius: 20px;
          width: 100%;
          max-width: 420px;
          padding: 2.25rem 2.25rem 2rem;
          box-shadow: 0 24px 64px rgba(0,0,0,0.4), 0 0 0 1px rgba(255,255,255,0.05);
          position: relative;
          z-index: 2;
          animation: voCardIn 0.4s cubic-bezier(0.22,1,0.36,1) both;
        }
        @keyframes voCardIn {
          from { opacity:0; transform: translateY(24px) scale(0.97); }
          to   { opacity:1; transform: translateY(0) scale(1); }
        }
        .vo-header {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          margin-bottom: 1.75rem;
          padding-bottom: 1.25rem;
          border-bottom: 1px solid #f1f5f9;
        }
        .vo-logo {
          width: 42px; height: 42px;
          border-radius: 12px;
          background: linear-gradient(135deg, #4f46e5, #7c3aed);
          display: flex; align-items: center; justify-content: center;
          font-size: 20px;
          box-shadow: 0 4px 14px rgba(79,70,229,0.4);
          flex-shrink: 0;
        }
        .vo-title {
          font-size: 1.125rem;
          font-weight: 700;
          color: #0d1117;
          letter-spacing: -0.03em;
          line-height: 1.2;
        }
        .vo-subtitle {
          font-size: 0.75rem;
          color: #94a3b8;
          font-weight: 500;
          margin-top: 1px;
        }
        .vo-field { margin-bottom: 1rem; }
        .vo-label {
          display: block;
          font-size: 0.8rem;
          font-weight: 600;
          color: #334155;
          margin-bottom: 0.35rem;
          letter-spacing: 0.01em;
        }
        .vo-input {
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
        .vo-input:focus {
          border-color: #4f46e5;
          background: #fff;
          box-shadow: 0 0 0 3px rgba(79,70,229,0.1);
        }
        .vo-error {
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
        .vo-btn {
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
        .vo-btn:hover:not(:disabled) {
          opacity: 0.92;
          transform: translateY(-1px);
          box-shadow: 0 8px 22px rgba(79,70,229,0.45);
        }
        .vo-btn:disabled { opacity: 0.65; cursor: not-allowed; }
        .vo-footer-link {
          text-align: center;
          font-size: 0.8125rem;
          color: #94a3b8;
          margin-top: 1.25rem;
        }
        .vo-footer-link a {
          color: #4f46e5;
          font-weight: 600;
          text-decoration: none;
        }
        .vo-footer-link a:hover { text-decoration: underline; }
      `}</style>

      <div className="vo-root">
        <div className="vo-card">
          <div className="vo-header">
            <div className="vo-logo">OTP</div>
            <div>
              <div className="vo-title">Verify OTP</div>
              <div className="vo-subtitle">Enter the 6-digit code sent to your email</div>
            </div>
          </div>

          <form onSubmit={handleSubmit}>
            <div className="vo-field">
              <label className="vo-label" htmlFor="email">Email address</label>
              <input
                id="email"
                type="email"
                className="vo-input"
                placeholder="you@school.edu"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                autoComplete="email"
              />
            </div>
            <div className="vo-field">
              <label className="vo-label" htmlFor="otp">OTP</label>
              <input
                id="otp"
                type="text"
                className="vo-input"
                placeholder="6-digit code"
                value={otp}
                onChange={(e) => setOtp(e.target.value)}
                required
                inputMode="numeric"
                maxLength={6}
              />
            </div>

            {error && (
              <div className="vo-error">
                <span>!</span> {error}
              </div>
            )}

            <button type="submit" className="vo-btn" disabled={loading}>
              {loading ? "Verifying..." : "Verify OTP"}
            </button>
          </form>

          <div className="vo-footer-link">
            Didn't receive the code? <Link href="/forgot-password">Resend OTP</Link>
          </div>
        </div>
      </div>
    </>
  );
}
