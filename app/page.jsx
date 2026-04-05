"use client";
import Link from "next/link";

export default function LandingPage() {
    return (
        <>
            <style>{`
        /* ── Reset ── */
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&display=swap');

        .land-body {
          font-family: 'Inter', system-ui, -apple-system, sans-serif;
          background: #ffffff;
          color: #1a1a2e;
          min-height: 100vh;
          overflow-x: hidden;
        }

        /* ── NAVBAR ── */
        .land-nav {
          position: sticky;
          top: 0;
          z-index: 100;
          background: rgba(255,255,255,0.95);
          backdrop-filter: blur(12px);
          border-bottom: 1px solid #e8edff;
          padding: 0 2rem;
          height: 64px;
          display: flex;
          align-items: center;
          justify-content: space-between;
          box-shadow: 0 1px 12px rgba(79,70,229,0.07);
        }

        /* Logo */
        .land-logo {
          display: flex;
          align-items: center;
          gap: 0.625rem;
          text-decoration: none;
        }
        .land-logo-icon {
          width: 40px;
          height: 40px;
          border-radius: 11px;
          background: linear-gradient(135deg, #4f46e5, #7c3aed);
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 19px;
          box-shadow: 0 4px 12px rgba(79,70,229,0.35);
          flex-shrink: 0;
        }
        .land-logo-text {
          display: flex;
          flex-direction: column;
          line-height: 1.15;
        }
        .land-logo-name {
          font-size: 1rem;
          font-weight: 800;
          color: #0d1117;
          letter-spacing: -0.02em;
        }
        .land-logo-tagline {
          font-size: 0.65rem;
          color: #94a3b8;
          font-weight: 500;
          letter-spacing: 0.03em;
          text-transform: uppercase;
        }

        /* Nav actions */
        .land-nav-actions {
          display: flex;
          align-items: center;
          gap: 0.75rem;
        }
        .land-btn-login {
          padding: 0.45rem 1.1rem;
          border-radius: 8px;
          border: 1.5px solid #e2e8f0;
          background: transparent;
          color: #334155;
          font-size: 0.875rem;
          font-weight: 600;
          cursor: pointer;
          text-decoration: none;
          display: inline-flex;
          align-items: center;
          gap: 0.35rem;
          transition: all 0.18s ease;
          font-family: inherit;
        }
        .land-btn-login:hover {
          border-color: #4f46e5;
          color: #4f46e5;
          background: #f0f0ff;
        }
        .land-btn-signup {
          padding: 0.45rem 1.1rem;
          border-radius: 8px;
          border: none;
          background: linear-gradient(135deg, #4f46e5, #7c3aed);
          color: #fff;
          font-size: 0.875rem;
          font-weight: 700;
          cursor: pointer;
          text-decoration: none;
          display: inline-flex;
          align-items: center;
          gap: 0.35rem;
          transition: all 0.2s ease;
          box-shadow: 0 3px 10px rgba(79,70,229,0.35);
          font-family: inherit;
        }
        .land-btn-signup:hover {
          opacity: 0.9;
          transform: translateY(-1px);
          box-shadow: 0 6px 18px rgba(79,70,229,0.45);
        }

        /* ── HERO ── */
        .land-hero {
          position: relative;
          min-height: calc(100vh - 64px);
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          text-align: center;
          padding: 5rem 1.5rem 4rem;
          overflow: hidden;
          background:
            radial-gradient(ellipse 80% 60% at 50% -10%, rgba(79,70,229,0.12) 0%, transparent 70%),
            #f9fafb;
        }

        /* Grid background */
        .land-hero::before {
          content: '';
          position: absolute;
          inset: 0;
          background-image:
            linear-gradient(rgba(79,70,229,0.05) 1px, transparent 1px),
            linear-gradient(90deg, rgba(79,70,229,0.05) 1px, transparent 1px);
          background-size: 40px 40px;
          pointer-events: none;
        }

        /* Blobs */
        .land-blob {
          position: absolute;
          border-radius: 50%;
          filter: blur(90px);
          pointer-events: none;
          z-index: 0;
        }
        .land-blob-1 {
          width: 520px; height: 520px;
          background: rgba(79,70,229,0.12);
          top: -80px; left: -140px;
          animation: blobFloat 8s ease-in-out infinite;
        }
        .land-blob-2 {
          width: 420px; height: 420px;
          background: rgba(124,58,237,0.1);
          bottom: -60px; right: -100px;
          animation: blobFloat 11s ease-in-out infinite reverse;
        }
        .land-blob-3 {
          width: 300px; height: 300px;
          background: rgba(6,182,212,0.07);
          top: 40%; left: 50%;
          transform: translate(-50%, -50%);
          animation: blobFloat 14s ease-in-out infinite;
        }
        @keyframes blobFloat {
          0%,100% { transform: scale(1) translate(0,0); }
          33% { transform: scale(1.05) translate(12px, -8px); }
          66% { transform: scale(0.97) translate(-8px, 6px); }
        }

        /* Badge */
        .land-badge {
          position: relative;
          z-index: 1;
          display: inline-flex;
          align-items: center;
          gap: 0.5rem;
          background: #eef2ff;
          border: 1px solid #c7d2fe;
          border-radius: 999px;
          padding: 0.3rem 1rem 0.3rem 0.5rem;
          font-size: 0.8rem;
          font-weight: 600;
          color: #4f46e5;
          margin-bottom: 1.75rem;
          animation: fadeUp 0.5s ease both;
        }
        .land-badge-dot {
          width: 8px; height: 8px;
          border-radius: 50%;
          background: #4f46e5;
          box-shadow: 0 0 0 3px rgba(79,70,229,0.25);
          animation: pulse 2s ease infinite;
        }
        @keyframes pulse {
          0%,100% { box-shadow: 0 0 0 3px rgba(79,70,229,0.25); }
          50% { box-shadow: 0 0 0 6px rgba(79,70,229,0.1); }
        }

        /* Headline */
        .land-headline-sub {
          position: relative;
          z-index: 1;
          font-size: clamp(1rem, 2vw, 1.25rem);
          font-weight: 600;
          color: #475569;
          margin-bottom: 0.75rem;
          animation: fadeUp 0.55s 0.05s ease both;
        }
        .land-headline {
          position: relative;
          z-index: 1;
          font-size: clamp(2.4rem, 6vw, 4.25rem);
          font-weight: 900;
          line-height: 1.08;
          letter-spacing: -0.04em;
          color: #0d1117;
          max-width: 780px;
          margin-bottom: 1.5rem;
          animation: fadeUp 0.6s 0.1s ease both;
        }
        .land-headline-accent {
          background: linear-gradient(135deg, #4f46e5, #7c3aed, #06b6d4);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }
        .land-desc {
          position: relative;
          z-index: 1;
          font-size: clamp(0.95rem, 1.6vw, 1.1rem);
          color: #64748b;
          line-height: 1.7;
          max-width: 580px;
          margin-bottom: 0.6rem;
          animation: fadeUp 0.65s 0.15s ease both;
        }
        .land-desc-2 {
          position: relative;
          z-index: 1;
          font-size: 0.925rem;
          color: #94a3b8;
          font-weight: 500;
          margin-bottom: 2.5rem;
          animation: fadeUp 0.7s 0.2s ease both;
        }

        /* CTA buttons */
        .land-cta-row {
          position: relative;
          z-index: 1;
          display: flex;
          align-items: center;
          gap: 1rem;
          flex-wrap: wrap;
          justify-content: center;
          animation: fadeUp 0.75s 0.25s ease both;
        }
        .land-cta-primary {
          display: inline-flex;
          align-items: center;
          gap: 0.5rem;
          padding: 0.85rem 2rem;
          border-radius: 12px;
          background: linear-gradient(135deg, #4f46e5, #7c3aed);
          color: #fff;
          font-size: 1rem;
          font-weight: 700;
          text-decoration: none;
          box-shadow: 0 6px 20px rgba(79,70,229,0.4);
          transition: all 0.2s ease;
          font-family: inherit;
          cursor: pointer;
          border: none;
        }
        .land-cta-primary:hover {
          transform: translateY(-2px);
          box-shadow: 0 10px 28px rgba(79,70,229,0.5);
        }
        .land-cta-secondary {
          display: inline-flex;
          align-items: center;
          gap: 0.5rem;
          padding: 0.85rem 2rem;
          border-radius: 12px;
          border: 1.5px solid #e2e8f0;
          color: #334155;
          font-size: 1rem;
          font-weight: 700;
          text-decoration: none;
          background: #fff;
          transition: all 0.2s ease;
          font-family: inherit;
          cursor: pointer;
        }
        .land-cta-secondary:hover {
          border-color: #4f46e5;
          color: #4f46e5;
          background: #f0f0ff;
          transform: translateY(-2px);
        }

        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(20px); }
          to   { opacity: 1; transform: translateY(0); }
        }

        /* ── STATS STRIP ── */
        .land-stats {
          position: relative;
          z-index: 1;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 2.5rem;
          flex-wrap: wrap;
          margin-top: 3.5rem;
          padding-top: 2.5rem;
          border-top: 1px solid #e8edff;
          max-width: 700px;
          width: 100%;
          animation: fadeUp 0.9s 0.35s ease both;
        }
        .land-stat-item {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 0.2rem;
        }
        .land-stat-num {
          font-size: 1.75rem;
          font-weight: 900;
          color: #0d1117;
          letter-spacing: -0.04em;
          line-height: 1;
        }
        .land-stat-label {
          font-size: 0.78rem;
          color: #94a3b8;
          font-weight: 500;
        }
        .land-stat-divider {
          width: 1px;
          height: 36px;
          background: #e2e8f0;
        }

        /* ── FEATURES SECTION ── */
        .land-features {
          background: #fff;
          padding: 5rem 2rem;
        }
        .land-section-label {
          text-align: center;
          font-size: 0.78rem;
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: 0.12em;
          color: #4f46e5;
          margin-bottom: 0.75rem;
        }
        .land-section-title {
          text-align: center;
          font-size: clamp(1.6rem, 3.5vw, 2.4rem);
          font-weight: 900;
          color: #0d1117;
          letter-spacing: -0.04em;
          line-height: 1.15;
          margin-bottom: 0.875rem;
        }
        .land-section-desc {
          text-align: center;
          font-size: 1rem;
          color: #64748b;
          max-width: 520px;
          margin: 0 auto 3.5rem;
          line-height: 1.65;
        }

        .land-feature-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
          gap: 1.5rem;
          max-width: 1100px;
          margin: 0 auto;
        }
        .land-feature-card {
          background: #f9fafb;
          border: 1px solid #e8edff;
          border-radius: 18px;
          padding: 1.75rem;
          transition: all 0.25s ease;
          position: relative;
          overflow: hidden;
        }
        .land-feature-card::before {
          content: '';
          position: absolute;
          inset: 0;
          background: linear-gradient(135deg, rgba(79,70,229,0.04), transparent);
          opacity: 0;
          transition: opacity 0.25s;
        }
        .land-feature-card:hover {
          transform: translateY(-4px);
          border-color: #c7d2fe;
          box-shadow: 0 8px 30px rgba(79,70,229,0.1);
        }
        .land-feature-card:hover::before { opacity: 1; }

        .land-feature-icon {
          width: 48px; height: 48px;
          border-radius: 13px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 22px;
          margin-bottom: 1.1rem;
        }
        .fi-purple { background: #eef2ff; }
        .fi-blue   { background: #eff6ff; }
        .fi-green  { background: #ecfdf5; }
        .fi-amber  { background: #fffbeb; }
        .fi-cyan   { background: #ecfeff; }
        .fi-rose   { background: #fff1f2; }

        .land-feature-title {
          font-size: 1rem;
          font-weight: 700;
          color: #0d1117;
          margin-bottom: 0.5rem;
          letter-spacing: -0.02em;
        }
        .land-feature-desc {
          font-size: 0.875rem;
          color: #64748b;
          line-height: 1.6;
        }

        /* ── HOW IT WORKS ── */
        .land-how {
          background: linear-gradient(135deg, #0d1117, #1a1240);
          padding: 5rem 2rem;
          text-align: center;
          position: relative;
          overflow: hidden;
        }
        .land-how::before {
          content: '';
          position: absolute;
          inset: 0;
          background:
            radial-gradient(ellipse 60% 80% at 20% 50%, rgba(79,70,229,0.2) 0%, transparent 60%),
            radial-gradient(ellipse 50% 60% at 80% 50%, rgba(124,58,237,0.15) 0%, transparent 60%);
          pointer-events: none;
        }
        .land-how .land-section-label { color: #a5b4fc; }
        .land-how .land-section-title { color: #f8fafc; }
        .land-how .land-section-desc  { color: #94a3b8; }

        .land-steps {
          display: flex;
          align-items: flex-start;
          justify-content: center;
          gap: 0;
          max-width: 860px;
          margin: 0 auto;
          flex-wrap: wrap;
          position: relative;
          z-index: 1;
        }
        .land-step {
          flex: 1;
          min-width: 180px;
          max-width: 220px;
          display: flex;
          flex-direction: column;
          align-items: center;
          padding: 1.5rem 1rem;
          position: relative;
        }
        .land-step-num {
          width: 52px; height: 52px;
          border-radius: 50%;
          background: linear-gradient(135deg, #4f46e5, #7c3aed);
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 1.25rem;
          font-weight: 900;
          color: #fff;
          box-shadow: 0 0 0 6px rgba(79,70,229,0.15);
          margin-bottom: 1rem;
        }
        .land-step-title {
          font-size: 0.9375rem;
          font-weight: 700;
          color: #f1f5f9;
          margin-bottom: 0.4rem;
        }
        .land-step-desc {
          font-size: 0.825rem;
          color: #94a3b8;
          line-height: 1.55;
          text-align: center;
        }
        .land-step-arrow {
          position: absolute;
          right: -20px;
          top: 2.2rem;
          font-size: 1.5rem;
          color: #4f46e5;
          opacity: 0.5;
          pointer-events: none;
        }
        .land-step:last-child .land-step-arrow { display: none; }

        /* ── FOOTER ── */
        .land-footer {
          background: #0d1117;
          border-top: 1px solid #1e293b;
          padding: 2rem;
          display: flex;
          align-items: center;
          justify-content: space-between;
          flex-wrap: wrap;
          gap: 1rem;
        }
        .land-footer-logo {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          font-size: 0.9rem;
          font-weight: 700;
          color: #e2e8f0;
        }
        .land-footer-copy {
          font-size: 0.8rem;
          color: #475569;
        }
        .land-footer-links {
          display: flex;
          gap: 1.25rem;
        }
        .land-footer-links a {
          font-size: 0.8rem;
          color: #64748b;
          text-decoration: none;
          font-weight: 500;
          transition: color 0.15s;
        }
        .land-footer-links a:hover { color: #a5b4fc; }

        /* Responsive */
        @media (max-width: 640px) {
          .land-nav { padding: 0 1rem; }
          .land-btn-login, .land-btn-signup { padding: 0.4rem 0.85rem; font-size: 0.8rem; }
          .land-stat-divider { display: none; }
          .land-step-arrow { display: none; }
          .land-footer { flex-direction: column; align-items: flex-start; }
        }
      `}</style>

            <div className="land-body">

                {/* ── NAVBAR ── */}
                <nav className="land-nav">
                    {/* Logo */}
                    <Link href="/" className="land-logo">
                        <div className="land-logo-icon">🎓</div>
                        <div className="land-logo-text">
                            <span className="land-logo-name">EduPortal</span>
                            <span className="land-logo-tagline">Online Grading System</span>
                        </div>
                    </Link>

                    {/* Login + Sign Up */}
                    <div className="land-nav-actions">
                        <Link href="/login" className="land-btn-login">
                            🔑 Login
                        </Link>
                        <Link href="/register" className="land-btn-signup">
                            ✨ Sign Up
                        </Link>
                    </div>
                </nav>

                {/* ── HERO ── */}
                <section className="land-hero">
                    <div className="land-blob land-blob-1" />
                    <div className="land-blob land-blob-2" />
                    <div className="land-blob land-blob-3" />

                    {/* Live badge */}
                    <div className="land-badge">
                        <span className="land-badge-dot" />
                        Trusted by Students &amp; Teachers Across India
                    </div>

                    {/* Sub-headline */}
                    <p className="land-headline-sub">Welcome to EduPortal — Online Grading System</p>

                    {/* Main headline */}
                    <h1 className="land-headline">
                        Tired of Manual{" "}
                        <span className="land-headline-accent">Grade Tracking?</span>
                        <br />
                        Let's Do It Smarter
                    </h1>

                    {/* Description */}
                    <p className="land-desc">
                        A unified platform for teachers to manage classes, assignments, and grades —
                        and for students to track their academic progress in real time.
                    </p>
                    <p className="land-desc-2">
                        Instant results. Zero paperwork. Full transparency. — Built for modern schools.
                    </p>

                    {/* CTA */}
                    <div className="land-cta-row">
                        <Link href="/login" className="land-cta-primary">
                            🔑 Sign In to Portal
                        </Link>
                        <Link href="/register" className="land-cta-secondary">
                            📝 Create Account →
                        </Link>
                    </div>

                    {/* Stats strip */}
                    <div className="land-stats">
                        <div className="land-stat-item">
                            <span className="land-stat-num">500+</span>
                            <span className="land-stat-label">Students Enrolled</span>
                        </div>
                        <div className="land-stat-divider" />
                        <div className="land-stat-item">
                            <span className="land-stat-num">50+</span>
                            <span className="land-stat-label">Classes Managed</span>
                        </div>
                        <div className="land-stat-divider" />
                        <div className="land-stat-item">
                            <span className="land-stat-num">10K+</span>
                            <span className="land-stat-label">Grades Recorded</span>
                        </div>
                        <div className="land-stat-divider" />
                        <div className="land-stat-item">
                            <span className="land-stat-num">100%</span>
                            <span className="land-stat-label">Paperless</span>
                        </div>
                    </div>
                </section>

                {/* ── FEATURES ── */}
                <section className="land-features">
                    <p className="land-section-label">✦ Platform Features</p>
                    <h2 className="land-section-title">Everything You Need in One Place</h2>
                    <p className="land-section-desc">
                        EduPortal streamlines academic management — from assignments to final grades — making education efficient for everyone.
                    </p>

                    <div className="land-feature-grid">
                        <div className="land-feature-card">
                            <div className="land-feature-icon fi-purple">📊</div>
                            <div className="land-feature-title">Real-Time Grading</div>
                            <p className="land-feature-desc">
                                Teachers can enter and update marks instantly. Students see their scores the moment they are published.
                            </p>
                        </div>
                        <div className="land-feature-card">
                            <div className="land-feature-icon fi-blue">📚</div>
                            <div className="land-feature-title">Class & Subject Management</div>
                            <p className="land-feature-desc">
                                Organise students into classes and subjects with ease. Assign teachers and manage enrolments in a few clicks.
                            </p>
                        </div>
                        <div className="land-feature-card">
                            <div className="land-feature-icon fi-green">📋</div>
                            <div className="land-feature-title">Assignments & Submissions</div>
                            <p className="land-feature-desc">
                                Post assignments with deadlines. Students submit work directly through the portal for fast evaluation.
                            </p>
                        </div>
                        <div className="land-feature-card">
                            <div className="land-feature-icon fi-amber">🔔</div>
                            <div className="land-feature-title">Announcements</div>
                            <p className="land-feature-desc">
                                Share important notices with the entire class instantly — no WhatsApp groups, no missed messages.
                            </p>
                        </div>
                        <div className="land-feature-card">
                            <div className="land-feature-icon fi-cyan">🧪</div>
                            <div className="land-feature-title">Virtual Lab</div>
                            <p className="land-feature-desc">
                                Students can run and test code right from the browser. Hands-on practice without any setup required.
                            </p>
                        </div>
                        <div className="land-feature-card">
                            <div className="land-feature-icon fi-rose">🛡️</div>
                            <div className="land-feature-title">Role-Based Access</div>
                            <p className="land-feature-desc">
                                Separate, secure dashboards for Students, Teachers, and Admins. Each sees exactly what they need.
                            </p>
                        </div>
                    </div>
                </section>

                {/* ── HOW IT WORKS ── */}
                <section className="land-how">
                    <p className="land-section-label">✦ How It Works</p>
                    <h2 className="land-section-title">Up and Running in Minutes</h2>
                    <p className="land-section-desc">
                        Getting started with EduPortal is effortless — follow these simple steps and transform your school's grading today.
                    </p>

                    <div className="land-steps">
                        {[
                            { num: "1", title: "Create Account", desc: "Register as a Student or Teacher in under a minute.", emoji: "👤" },
                            { num: "2", title: "Join Your Class", desc: "Teachers set up classes; students get enrolled instantly.", emoji: "🏫" },
                            { num: "3", title: "Post & Submit", desc: "Assign tasks, submit work, and track all in one feed.", emoji: "📝" },
                            { num: "4", title: "Grade & Review", desc: "Marks published in real-time on the student dashboard.", emoji: "🏆" },
                        ].map((step, i, arr) => (
                            <div className="land-step" key={step.num}>
                                <div className="land-step-num">{step.emoji}</div>
                                <div className="land-step-title">{step.title}</div>
                                <p className="land-step-desc">{step.desc}</p>
                                {i < arr.length - 1 && <span className="land-step-arrow">›</span>}
                            </div>
                        ))}
                    </div>
                </section>

                {/* ── FOOTER ── */}
                <footer className="land-footer">
                    <div className="land-footer-logo">
                        <span>🎓</span> EduPortal
                    </div>
                    <p className="land-footer-copy">© {new Date().getFullYear()} EduPortal — Online Grading System. All rights reserved.</p>
                    <div className="land-footer-links">
                        <Link href="/login">Login</Link>
                        <Link href="/register">Register</Link>
                        <Link href="/dashboard">Dashboard</Link>
                    </div>
                </footer>

            </div>
        </>
    );
}
