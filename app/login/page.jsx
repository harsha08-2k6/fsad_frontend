"use client";
import { useRef, useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Captcha from "@/components/Captcha";

export default function LoginPage() {
  const router = useRouter();
  const captchaRef = useRef(null);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    if (!captchaRef.current?.validate()) {
      setLoading(false);
      return;
    }

    try {
      const result = await signIn("credentials", {
        email,
        password,
        redirect: false,
      });

      if (result?.error) {
        setError(result.error || "Invalid email or password.");
        captchaRef.current?.refresh();
      } else {
        router.push("/dashboard");
        router.refresh();
      }
    } catch {
      setError("Something went wrong. Please try again.");
      captchaRef.current?.refresh();
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <style>{`
        .lp-root {
          min-height: 100vh;
          display: flex;
          align-items: center;
          justify-content: center;
          background: #0d1117;
          padding: 1rem;
          position: relative;
          overflow: hidden;
        }

        /* animated background blobs */
        .lp-blob {
          position: absolute;
          border-radius: 50%;
          filter: blur(80px);
          pointer-events: none;
        }
        .lp-blob-1 {
          width: 500px; height: 500px;
          background: rgba(79,70,229,0.18);
          top: -120px; left: -120px;
          animation: blobPulse 7s ease-in-out infinite;
        }
        .lp-blob-2 {
          width: 400px; height: 400px;
          background: rgba(124,58,237,0.13);
          bottom: -100px; right: -80px;
          animation: blobPulse 9s ease-in-out infinite reverse;
        }
        @keyframes blobPulse {
          0%,100% { transform: scale(1); }
          50% { transform: scale(1.08); }
        }

        /* Card */
        .lp-card {
          background: #ffffff;
          border-radius: 20px;
          width: 100%;
          max-width: 420px;
          padding: 2.25rem 2.25rem 2rem;
          box-shadow: 0 24px 64px rgba(0,0,0,0.4), 0 0 0 1px rgba(255,255,255,0.05);
          position: relative;
          z-index: 2;
          animation: cardIn 0.4s cubic-bezier(0.22,1,0.36,1) both;
        }
        @keyframes cardIn {
          from { opacity:0; transform: translateY(24px) scale(0.97); }
          to   { opacity:1; transform: translateY(0) scale(1); }
        }

        /* Header */
        .lp-header {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          margin-bottom: 1.75rem;
          padding-bottom: 1.25rem;
          border-bottom: 1px solid #f1f5f9;
        }
        .lp-logo {
          width: 42px; height: 42px;
          border-radius: 12px;
          background: linear-gradient(135deg, #4f46e5, #7c3aed);
          display: flex; align-items: center; justify-content: center;
          font-size: 20px;
          box-shadow: 0 4px 14px rgba(79,70,229,0.4);
          flex-shrink: 0;
        }
        .lp-title {
          font-size: 1.125rem;
          font-weight: 800;
          color: #0d1117;
          letter-spacing: -0.03em;
          line-height: 1.2;
        }
        .lp-subtitle {
          font-size: 0.75rem;
          color: #94a3b8;
          font-weight: 500;
          margin-top: 1px;
        }

        /* Fields */
        .lp-field { margin-bottom: 1rem; }
        .lp-label {
          display: block;
          font-size: 0.8rem;
          font-weight: 600;
          color: #334155;
          margin-bottom: 0.35rem;
          letter-spacing: 0.01em;
        }
        .lp-input {
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
        .lp-input:focus {
          border-color: #4f46e5;
          background: #fff;
          box-shadow: 0 0 0 3px rgba(79,70,229,0.1);
        }

        /* Error */
        .lp-error {
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

        .lp-forgot {
          text-align: right;
          font-size: 0.75rem;
          margin-top: -0.25rem;
          margin-bottom: 0.75rem;
        }
        .lp-forgot a {
          color: #4f46e5;
          font-weight: 600;
          text-decoration: none;
        }
        .lp-forgot a:hover { text-decoration: underline; }

        /* Submit button */
        .lp-btn {
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
        .lp-btn:hover:not(:disabled) {
          opacity: 0.92;
          transform: translateY(-1px);
          box-shadow: 0 8px 22px rgba(79,70,229,0.45);
        }
        .lp-btn:disabled { opacity: 0.65; cursor: not-allowed; }

        /* Footer link */
        .lp-footer-link {
          text-align: center;
          font-size: 0.8125rem;
          color: #94a3b8;
          margin-top: 1.25rem;
        }
        .lp-footer-link a {
          color: #4f46e5;
          font-weight: 600;
          text-decoration: none;
        }
        .lp-footer-link a:hover { text-decoration: underline; }

        /* Captcha compact wrapper */
        .lp-captcha-wrap {
          margin-bottom: 0.875rem;
          transform-origin: top left;
          transform: scale(0.92);
          width: calc(100% / 0.92);
          margin-left: 0;
        }
      `}</style>

      <div className="lp-root">
        {/* Background blobs */}
        <div className="lp-blob lp-blob-1" />
        <div className="lp-blob lp-blob-2" />

        <div className="lp-card">
          {/* Brand header */}
          <div className="lp-header">
            <div className="lp-logo">🎓</div>
            <div>
              <div className="lp-title">EduPortal</div>
              <div className="lp-subtitle">Online Grading System</div>
            </div>
          </div>

          <form onSubmit={handleSubmit}>
            {/* Email */}
            <div className="lp-field">
              <label className="lp-label" htmlFor="email">Email address</label>
              <input
                id="email"
                type="email"
                className="lp-input"
                placeholder="you@school.edu"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                autoComplete="email"
              />
            </div>

            {/* Password */}
            <div className="lp-field">
              <label className="lp-label" htmlFor="password">Password</label>
              <input
                id="password"
                type="password"
                className="lp-input"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                autoComplete="current-password"
              />
            </div>

            <div className="lp-forgot">
              <Link href="/forgot-password">Forgot password?</Link>
            </div>

            {/* CAPTCHA — scaled down to stay compact */}
            <div className="lp-captcha-wrap">
              <Captcha ref={captchaRef} />
            </div>

            {/* Error */}
            {error && (
              <div className="lp-error">
                <span>⚠️</span> {error}
              </div>
            )}

            {/* Submit */}
            <button type="submit" className="lp-btn" disabled={loading}>
              {loading ? "Signing in…" : "Sign In →"}
            </button>

          </form>

          {/* Register */}
          <div className="lp-footer-link">
            No account?{" "}
            <Link href="/register">Register here</Link>
          </div>
        </div>
      </div>
    </>
  );
}
