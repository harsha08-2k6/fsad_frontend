"use client";
import { createContext, useCallback, useContext, useState } from "react";
import { CheckCircle2, XCircle, AlertTriangle, Info, X } from "lucide-react";

/* ─── Context ─────────────────────────────────────────────────────────────── */
const ToastContext = createContext(null);

export function useToast() {
    const ctx = useContext(ToastContext);
    if (!ctx) throw new Error("useToast must be used inside <ToastProvider>");
    return ctx;
}

/* ─── Provider ────────────────────────────────────────────────────────────── */
export function ToastProvider({ children }) {
    const [toasts, setToasts] = useState([]);

    const toast = useCallback(({ message, type = "success", duration = 4000 }) => {
        const id = Date.now() + Math.random();
        setToasts((prev) => [...prev, { id, message, type }]);
        setTimeout(() => {
            setToasts((prev) => prev.filter((t) => t.id !== id));
        }, duration);
    }, []);

    const dismiss = useCallback((id) => {
        setToasts((prev) => prev.filter((t) => t.id !== id));
    }, []);

    return (
        <ToastContext.Provider value={{ toast }}>
            {children}
            <Toaster toasts={toasts} dismiss={dismiss} />
        </ToastContext.Provider>
    );
}

/* ─── Variant config ──────────────────────────────────────────────────────── */
const VARIANTS = {
    success: {
        icon: CheckCircle2,
        bar: "bg-emerald-500",
        iconColor: "text-emerald-500",
        bg: "bg-white",
        border: "border-emerald-100",
    },
    error: {
        icon: XCircle,
        bar: "bg-red-500",
        iconColor: "text-red-500",
        bg: "bg-white",
        border: "border-red-100",
    },
    warning: {
        icon: AlertTriangle,
        bar: "bg-amber-400",
        iconColor: "text-amber-500",
        bg: "bg-white",
        border: "border-amber-100",
    },
    info: {
        icon: Info,
        bar: "bg-indigo-500",
        iconColor: "text-indigo-500",
        bg: "bg-white",
        border: "border-indigo-100",
    },
};

/* ─── Toaster component ───────────────────────────────────────────────────── */
function Toaster({ toasts, dismiss }) {
    if (toasts.length === 0) return null;

    return (
        <div
            style={{
                position: "fixed",
                bottom: "24px",
                right: "24px",
                zIndex: 9999,
                display: "flex",
                flexDirection: "column",
                gap: "10px",
                maxWidth: "360px",
                width: "100%",
            }}
        >
            {toasts.map((t) => {
                const v = VARIANTS[t.type] || VARIANTS.info;
                const Icon = v.icon;
                return (
                    <div
                        key={t.id}
                        style={{
                            animation: "toastSlideIn 0.3s cubic-bezier(0.34, 1.56, 0.64, 1)",
                        }}
                        className={`flex items-start gap-3 rounded-2xl border ${v.border} ${v.bg} shadow-[0_8px_30px_rgba(0,0,0,0.12)] overflow-hidden`}
                    >
                        {/* Left colour bar */}
                        <div className={`w-1 shrink-0 self-stretch ${v.bar} rounded-l-2xl`} />

                        {/* Icon */}
                        <div className="pt-3 pb-3">
                            <Icon className={`w-5 h-5 ${v.iconColor}`} />
                        </div>

                        {/* Message */}
                        <div className="flex-1 py-3 pr-1">
                            <p className="text-sm font-medium text-gray-800 leading-snug">{t.message}</p>
                        </div>

                        {/* Dismiss */}
                        <button
                            onClick={() => dismiss(t.id)}
                            className="p-2 mt-1 mr-1 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100 transition-colors"
                        >
                            <X className="w-4 h-4" />
                        </button>
                    </div>
                );
            })}

            <style>{`
                @keyframes toastSlideIn {
                    from { opacity: 0; transform: translateX(40px) scale(0.96); }
                    to   { opacity: 1; transform: translateX(0)   scale(1); }
                }
            `}</style>
        </div>
    );
}
