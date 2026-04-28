"use client";
import { Suspense, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={<div style={{ padding: "1rem", textAlign: "center" }}>Loading...</div>}>
      <ResetPasswordContent />
    </Suspense>
  );
}

function ResetPasswordContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const emailParam = searchParams.get("email") || "";
    const storedEmail = sessionStorage.getItem("resetEmail") || "";
    const storedOtp = sessionStorage.getItem("resetOtp") || "";
    setEmail(emailParam || storedEmail);
    setOtp(storedOtp);
  }, [searchParams]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!newPassword || !confirmPassword) {
      setError("Please enter and confirm your new password.");
      return;
    }
    if (newPassword !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }
    if (!email || !otp) {
      setError("Your OTP session has expired. Please verify again.");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/auth/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, otp, newPassword }),
      });

      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError(data.message || "Failed to update password.");
        return;
      }

      sessionStorage.removeItem("resetEmail");
      sessionStorage.removeItem("resetOtp");
      setSuccess(true);
      setTimeout(() => router.push("/login"), 1500);
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const missingOtp = !email || !otp;

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@400;600;700&display=swap');

        .rpw-root {
          min-height: 100vh;
          display: flex;
          align-items: center;
          justify-content: center;
          background: radial-gradient(1200px circle at 50% 0%, rgba(16,185,129,0.16), transparent 40%), #0d1117;
          padding: 1rem;
          position: relative;
          overflow: hidden;
          font-family: "Space Grotesk", system-ui, -apple-system, "Segoe UI", sans-serif;
        }
        .rpw-card {
          background: #ffffff;
          border-radius: 20px;
          width: 100%;
          max-width: 420px;
          padding: 2.25rem 2.25rem 2rem;
          box-shadow: 0 24px 64px rgba(0,0,0,0.4), 0 0 0 1px rgba(255,255,255,0.05);
          position: relative;
          z-index: 2;
          animation: rpwCardIn 0.4s cubic-bezier(0.22,1,0.36,1) both;
        }
        @keyframes rpwCardIn {
          from { opacity:0; transform: translateY(24px) scale(0.97); }
          to   { opacity:1; transform: translateY(0) scale(1); }
        }
        .rpw-header {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          margin-bottom: 1.75rem;
          padding-bottom: 1.25rem;
          border-bottom: 1px solid #f1f5f9;
        }
        .rpw-logo {
          width: 42px; height: 42px;
          border-radius: 12px;
          background: linear-gradient(135deg, #10b981, #4f46e5);
          display: flex; align-items: center; justify-content: center;
          font-size: 20px;
          box-shadow: 0 4px 14px rgba(16,185,129,0.35);
          flex-shrink: 0;
        }
        .rpw-title {
          font-size: 1.125rem;
          font-weight: 700;
          color: #0d1117;
          letter-spacing: -0.03em;
          line-height: 1.2;
        }
        .rpw-subtitle {
          font-size: 0.75rem;
          color: #94a3b8;
          font-weight: 500;
          margin-top: 1px;
        }
        .rpw-field { margin-bottom: 1rem; }
        .rpw-label {
          display: block;
          font-size: 0.8rem;
          font-weight: 600;
          color: #334155;
          margin-bottom: 0.35rem;
          letter-spacing: 0.01em;
        }
        .rpw-input {
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
        .rpw-input:focus {
          border-color: #10b981;
          background: #fff;
          box-shadow: 0 0 0 3px rgba(16,185,129,0.15);
        }
        .rpw-error {
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
        .rpw-success {
          background: #ecfdf3;
          border: 1px solid #bbf7d0;
          border-radius: 8px;
          padding: 0.5rem 0.75rem;
          font-size: 0.82rem;
          color: #047857;
          font-weight: 600;
          margin-bottom: 0.875rem;
          display: flex;
          align-items: center;
          gap: 0.375rem;
        }
        .rpw-btn {
          width: 100%;
          background: linear-gradient(135deg, #10b981, #4f46e5);
          color: #fff;
          border: none;
          border-radius: 10px;
          padding: 0.75rem;
          font-size: 0.9375rem;
          font-weight: 700;
          cursor: pointer;
          transition: opacity 0.2s, transform 0.2s, box-shadow 0.2s;
          box-shadow: 0 4px 14px rgba(16,185,129,0.35);
          font-family: inherit;
          letter-spacing: 0.01em;
          margin-top: 0.25rem;
        }
        .rpw-btn:hover:not(:disabled) {
          opacity: 0.92;
          transform: translateY(-1px);
          box-shadow: 0 8px 22px rgba(16,185,129,0.4);
        }
        .rpw-btn:disabled { opacity: 0.65; cursor: not-allowed; }
        .rpw-footer-link {
          text-align: center;
          font-size: 0.8125rem;
          color: #94a3b8;
          margin-top: 1.25rem;
        }
        .rpw-footer-link a {
          color: #4f46e5;
          font-weight: 600;
          text-decoration: none;
        }
        .rpw-footer-link a:hover { text-decoration: underline; }
      `}</style>

      <div className="rpw-root">
        <div className="rpw-card">
          <div className="rpw-header">
            <div className="rpw-logo">OK</div>
            <div>
              <div className="rpw-title">Set New Password</div>
              <div className="rpw-subtitle">Choose a strong password for your account</div>
            </div>
          </div>

          {missingOtp ? (
            <>
              <div className="rpw-error">
                <span>!</span> Your OTP session is missing or expired. Please verify again.
              </div>
              <div className="rpw-footer-link">
                <Link href="/forgot-password">Restart password reset</Link>
              </div>
            </>
          ) : (
            <form onSubmit={handleSubmit}>
              <div className="rpw-field">
                <label className="rpw-label" htmlFor="newPassword">New password</label>
                <input
                  id="newPassword"
                  type="password"
                  className="rpw-input"
                  placeholder="••••••••"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  required
                  autoComplete="new-password"
                />
              </div>
              <div className="rpw-field">
                <label className="rpw-label" htmlFor="confirmPassword">Confirm password</label>
                <input
                  id="confirmPassword"
                  type="password"
                  className="rpw-input"
                  placeholder="••••••••"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                  autoComplete="new-password"
                />
              </div>

              {error && (
                <div className="rpw-error">
                  <span>!</span> {error}
                </div>
              )}
              {success && (
                <div className="rpw-success">
                  <span>OK</span> Password updated! Redirecting to login...
                </div>
              )}

              <button type="submit" className="rpw-btn" disabled={loading || success}>
                {loading ? "Updating..." : "Update Password"}
              </button>
            </form>
          )}

          {!missingOtp && (
            <div className="rpw-footer-link">
              Back to <Link href="/login">Login</Link>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
