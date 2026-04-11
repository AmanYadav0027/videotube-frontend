import { useState, useRef } from "react";
import { useSelector, useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import axios from "axios";
import { logout as authLogout, updateUser } from "../store/authSlice";
import {
  LogOut,
  Mail,
  User,
  Shield,
  Camera,
  Lock,
  AlertTriangle,
  X,
  Check,
  Eye,
  EyeOff,
  Loader2,
} from "lucide-react";

const styles = `
  @import url('https://fonts.googleapis.com/css2?family=Syne:wght@400;500;600;700;800&family=DM+Sans:ital,opsz,wght@0,9..40,300;0,9..40,400;0,9..40,500;1,9..40,300&display=swap');

  * { box-sizing: border-box; }

  .profile-root {
    font-family: 'DM Sans', sans-serif;
  }

  .profile-root h1,
  .profile-root h2,
  .profile-root h3 {
    font-family: 'Syne', sans-serif;
  }

  @keyframes fadeUp {
    from { opacity: 0; transform: translateY(22px); }
    to   { opacity: 1; transform: translateY(0); }
  }
  @keyframes fadeIn {
    from { opacity: 0; }
    to   { opacity: 1; }
  }
  @keyframes scaleIn {
    from { opacity: 0; transform: scale(0.92) translateY(10px); }
    to   { opacity: 1; transform: scale(1) translateY(0); }
  }
  @keyframes shimmer {
    0%   { transform: translateX(-100%); }
    100% { transform: translateX(100%); }
  }
  @keyframes pulseRing {
    0%   { transform: scale(1); opacity: 0.6; }
    70%  { transform: scale(1.8); opacity: 0; }
    100% { transform: scale(1.8); opacity: 0; }
  }
  @keyframes gradientFlow {
    0%, 100% { background-position: 0% 50%; }
    50%       { background-position: 100% 50%; }
  }
  @keyframes floatOrb1 {
    0%, 100% { transform: translate(0, 0) scale(1); }
    33%       { transform: translate(30px, -20px) scale(1.05); }
    66%       { transform: translate(-15px, 15px) scale(0.97); }
  }
  @keyframes floatOrb2 {
    0%, 100% { transform: translate(0, 0) scale(1); }
    33%       { transform: translate(-25px, 20px) scale(1.04); }
    66%       { transform: translate(20px, -10px) scale(0.96); }
  }
  @keyframes borderPulse {
    0%, 100% { opacity: 0.5; }
    50%       { opacity: 1; }
  }
  @keyframes statusPing {
    0%, 100% { transform: scale(1); opacity: 1; }
    50%       { transform: scale(1.4); opacity: 0.6; }
  }
  @keyframes slideInRight {
    from { opacity: 0; transform: translateX(12px); }
    to   { opacity: 1; transform: translateX(0); }
  }
  @keyframes modalBackdrop {
    from { opacity: 0; backdrop-filter: blur(0px); }
    to   { opacity: 1; backdrop-filter: blur(12px); }
  }
  @keyframes modalCard {
    from { opacity: 0; transform: scale(0.88) translateY(20px); }
    to   { opacity: 1; transform: scale(1) translateY(0); }
  }
  @keyframes iconBounce {
    0%, 100% { transform: translateY(0); }
    40%       { transform: translateY(-4px); }
    60%       { transform: translateY(-2px); }
  }
  @keyframes scanLine {
    0%   { top: 0%; opacity: 0.6; }
    100% { top: 100%; opacity: 0; }
  }
  @keyframes glowPulse {
    0%, 100% { box-shadow: 0 0 20px rgba(99,102,241,0.15), 0 0 60px rgba(99,102,241,0.05); }
    50%       { box-shadow: 0 0 30px rgba(99,102,241,0.25), 0 0 80px rgba(99,102,241,0.12); }
  }
  @keyframes progressFill {
    from { width: 0%; }
    to   { width: var(--target-width); }
  }
  @keyframes ripple {
    0%   { transform: scale(0); opacity: 0.4; }
    100% { transform: scale(4); opacity: 0; }
  }
  @keyframes staggerFade {
    from { opacity: 0; transform: translateY(16px) scale(0.98); }
    to   { opacity: 1; transform: translateY(0) scale(1); }
  }

  .anim-fade-up   { animation: fadeUp 0.55s cubic-bezier(0.16,1,0.3,1) both; }
  .anim-fade-in   { animation: fadeIn 0.4s ease both; }
  .anim-scale-in  { animation: scaleIn 0.45s cubic-bezier(0.34,1.56,0.64,1) both; }

  .card-stagger-1 { animation: staggerFade 0.6s cubic-bezier(0.16,1,0.3,1) 0.05s both; }
  .card-stagger-2 { animation: staggerFade 0.6s cubic-bezier(0.16,1,0.3,1) 0.15s both; }
  .card-stagger-3 { animation: staggerFade 0.6s cubic-bezier(0.16,1,0.3,1) 0.25s both; }
  .card-stagger-4 { animation: staggerFade 0.6s cubic-bezier(0.16,1,0.3,1) 0.35s both; }

  .shimmer-btn::after {
    content: '';
    position: absolute;
    inset: 0;
    background: linear-gradient(105deg, transparent 40%, rgba(255,255,255,0.18) 50%, transparent 60%);
    transform: translateX(-100%);
    transition: none;
  }
  .shimmer-btn:hover::after {
    animation: shimmer 0.7s ease forwards;
  }

  .glass-card {
    background: rgba(15,17,23,0.85);
    backdrop-filter: blur(20px);
    -webkit-backdrop-filter: blur(20px);
    border: 1px solid rgba(255,255,255,0.065);
    transition: border-color 0.35s ease, box-shadow 0.35s ease, transform 0.35s ease;
  }
  .glass-card:hover {
    border-color: rgba(99,102,241,0.18);
    box-shadow: 0 4px 40px rgba(0,0,0,0.4), 0 0 0 1px rgba(99,102,241,0.08);
  }

  .input-field {
    display: block;
    width: 100%;
    padding: 0.65rem 1rem 0.65rem 2.25rem;
    border-radius: 0.875rem;
    font-size: 0.875rem;
    font-family: 'DM Sans', sans-serif;
    background: rgba(255,255,255,0.025);
    border: 1px solid rgba(255,255,255,0.07);
    color: #e2e8f0;
    transition: all 0.25s cubic-bezier(0.4,0,0.2,1);
    outline: none;
  }
  .input-field::placeholder { color: rgba(148,163,184,0.35); }
  .input-field:hover {
    background: rgba(255,255,255,0.04);
    border-color: rgba(255,255,255,0.12);
  }
  .input-field:focus {
    background: rgba(99,102,241,0.06);
    border-color: rgba(99,102,241,0.45);
    box-shadow: 0 0 0 3px rgba(99,102,241,0.12), 0 1px 8px rgba(99,102,241,0.1);
    transform: translateY(-1px);
  }
  .input-field.error {
    border-color: rgba(244,63,94,0.45);
    background: rgba(244,63,94,0.04);
  }
  .input-field.error:focus {
    box-shadow: 0 0 0 3px rgba(244,63,94,0.12);
    border-color: rgba(244,63,94,0.6);
  }

  .submit-btn {
    position: relative;
    overflow: hidden;
    padding: 0.65rem 1.5rem;
    border-radius: 0.875rem;
    font-size: 0.875rem;
    font-family: 'Syne', sans-serif;
    font-weight: 600;
    color: white;
    background: linear-gradient(135deg, #4f46e5, #7c3aed);
    background-size: 200% 200%;
    border: none;
    cursor: pointer;
    transition: all 0.3s cubic-bezier(0.4,0,0.2,1);
    letter-spacing: 0.01em;
  }
  .submit-btn:hover:not(:disabled) {
    background: linear-gradient(135deg, #4338ca, #6d28d9);
    transform: translateY(-2px);
    box-shadow: 0 8px 25px rgba(99,102,241,0.35), 0 4px 12px rgba(0,0,0,0.3);
  }
  .submit-btn:active:not(:disabled) {
    transform: translateY(0px) scale(0.98);
    box-shadow: 0 2px 8px rgba(99,102,241,0.2);
  }
  .submit-btn:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
  .submit-btn .ripple-effect {
    position: absolute;
    border-radius: 50%;
    background: rgba(255,255,255,0.25);
    pointer-events: none;
    animation: ripple 0.6s ease-out forwards;
  }

  .sign-out-btn {
    position: relative;
    overflow: hidden;
    display: flex;
    align-items: center;
    gap: 0.5rem;
    padding: 0.625rem 1.125rem;
    border-radius: 0.875rem;
    font-size: 0.875rem;
    font-family: 'Syne', sans-serif;
    font-weight: 600;
    color: #fb7185;
    border: 1px solid rgba(244,63,94,0.2);
    background: rgba(244,63,94,0.05);
    cursor: pointer;
    transition: all 0.3s cubic-bezier(0.4,0,0.2,1);
  }
  .sign-out-btn:hover {
    color: #fff;
    background: rgba(244,63,94,0.18);
    border-color: rgba(244,63,94,0.4);
    transform: translateY(-1px);
    box-shadow: 0 6px 20px rgba(244,63,94,0.2);
  }
  .sign-out-btn::before {
    content: '';
    position: absolute;
    inset: 0;
    background: linear-gradient(135deg, rgba(244,63,94,0.15), transparent);
    opacity: 0;
    transition: opacity 0.3s ease;
  }
  .sign-out-btn:hover::before { opacity: 1; }

  .cover-area {
    position: relative;
    cursor: pointer;
    overflow: hidden;
  }
  .cover-area::after {
    content: '';
    position: absolute;
    top: 0; left: 0; right: 0;
    height: 2px;
    background: linear-gradient(90deg, transparent, rgba(99,102,241,0.8), transparent);
    opacity: 0;
    animation: scanLine 2.5s linear infinite;
    animation-play-state: paused;
  }
  .cover-area:hover::after {
    animation-play-state: running;
  }
  .cover-overlay {
    position: absolute; inset: 0;
    background: rgba(0,0,0,0);
    display: flex; align-items: center; justify-content: center; gap: 0.5rem;
    opacity: 0;
    transition: background 0.3s ease, opacity 0.3s ease;
  }
  .cover-area:hover .cover-overlay {
    background: rgba(0,0,0,0.55);
    opacity: 1;
  }

  .avatar-wrap {
    position: relative;
    cursor: pointer;
    transition: transform 0.3s cubic-bezier(0.34,1.56,0.64,1);
  }
  .avatar-wrap:hover { transform: scale(1.05) translateY(-2px); }
  .avatar-img-wrap {
    width: 5.5rem; height: 5.5rem;
    border-radius: 1.25rem;
    border: 3px solid #0f1117;
    overflow: hidden;
    box-shadow: 0 8px 32px rgba(0,0,0,0.5), 0 0 0 1px rgba(99,102,241,0.15);
    transition: box-shadow 0.35s ease;
  }
  .avatar-wrap:hover .avatar-img-wrap {
    box-shadow: 0 12px 40px rgba(0,0,0,0.6), 0 0 0 2px rgba(99,102,241,0.4), 0 0 30px rgba(99,102,241,0.15);
  }
  @media(min-width: 640px) {
    .avatar-img-wrap { width: 6.5rem; height: 6.5rem; }
  }
  .avatar-hover-overlay {
    position: absolute; inset: 0;
    border-radius: 1.25rem;
    background: rgba(0,0,0,0);
    display: flex; align-items: center; justify-content: center;
    opacity: 0;
    transition: background 0.25s ease, opacity 0.25s ease;
  }
  .avatar-wrap:hover .avatar-hover-overlay {
    background: rgba(0,0,0,0.55);
    opacity: 1;
  }

  .online-dot {
    position: absolute;
    bottom: -2px; right: -2px;
    width: 1rem; height: 1rem;
    border-radius: 50%;
    background: #10b981;
    border: 2.5px solid #0f1117;
  }
  .online-dot::before {
    content: '';
    position: absolute; inset: -3px;
    border-radius: 50%;
    background: rgba(16,185,129,0.4);
    animation: pulseRing 2s ease-out infinite;
  }

  .chip {
    display: flex; align-items: center; gap: 0.375rem;
    padding: 0.25rem 0.625rem;
    border-radius: 0.625rem;
    font-size: 0.6875rem;
    transition: all 0.25s ease;
  }
  .chip:hover { transform: translateY(-1px); }

  .section-divider {
    height: 1px;
    background: linear-gradient(90deg, transparent, rgba(99,102,241,0.35), transparent);
    animation: borderPulse 3s ease-in-out infinite;
  }

  .danger-divider {
    height: 1px;
    background: linear-gradient(90deg, transparent, rgba(244,63,94,0.35), transparent);
    animation: borderPulse 3s ease-in-out 1.5s infinite;
  }

  .status-badge {
    display: flex; align-items: flex-start; gap: 0.5rem;
    padding: 0.625rem 0.875rem;
    border-radius: 0.75rem;
    font-size: 0.75rem;
    animation: slideInRight 0.35s cubic-bezier(0.16,1,0.3,1) both;
  }

  .label-text {
    display: block;
    font-size: 0.75rem;
    font-family: 'Syne', sans-serif;
    font-weight: 500;
    color: rgba(148,163,184,0.8);
    margin-bottom: 0.375rem;
    letter-spacing: 0.02em;
    transition: color 0.2s ease;
  }
  .field-wrap:focus-within .label-text { color: rgba(129,140,248,0.9); }

  .toggle-vis {
    position: absolute; right: 0.75rem; top: 50%; transform: translateY(-50%);
    background: none; border: none; cursor: pointer;
    color: rgba(100,116,139,0.7);
    transition: color 0.2s ease, transform 0.2s ease;
    padding: 0.25rem;
    border-radius: 0.375rem;
  }
  .toggle-vis:hover { color: rgba(148,163,184,0.9); transform: translateY(-50%) scale(1.1); }

  .icon-slot {
    position: absolute; left: 0.75rem; top: 50%; transform: translateY(-50%);
    color: rgba(100,116,139,0.6);
    pointer-events: none;
    transition: color 0.25s ease;
  }
  .field-wrap:focus-within .icon-slot { color: rgba(99,102,241,0.8); }

  .orb1 { animation: floatOrb1 12s ease-in-out infinite; }
  .orb2 { animation: floatOrb2 16s ease-in-out infinite; }

  .modal-backdrop { animation: modalBackdrop 0.3s ease both; }
  .modal-card     { animation: modalCard 0.4s cubic-bezier(0.34,1.4,0.64,1) both; }

  .logout-icon-wrap {
    animation: iconBounce 2.5s ease-in-out infinite;
  }

  .system-status {
    display: flex; align-items: center; justify-content: center; gap: 0.5rem;
    animation: fadeIn 1s ease 0.8s both;
  }

  .glow-card { animation: glowPulse 4s ease-in-out infinite; }

  .cancel-btn {
    flex: 1; padding: 0.625rem;
    border-radius: 0.875rem;
    font-size: 0.875rem;
    font-family: 'DM Sans', sans-serif;
    font-weight: 500;
    color: rgba(148,163,184,0.8);
    background: rgba(255,255,255,0.04);
    border: 1px solid rgba(255,255,255,0.07);
    cursor: pointer;
    transition: all 0.25s ease;
  }
  .cancel-btn:hover:not(:disabled) {
    color: #e2e8f0;
    background: rgba(255,255,255,0.08);
    border-color: rgba(255,255,255,0.14);
  }
  .cancel-btn:disabled { opacity: 0.5; cursor: not-allowed; }

  .confirm-logout-btn {
    flex: 1; position: relative; overflow: hidden;
    padding: 0.625rem;
    border-radius: 0.875rem;
    font-size: 0.875rem;
    font-family: 'Syne', sans-serif;
    font-weight: 600;
    color: white;
    background: linear-gradient(135deg, #e11d48, #be123c);
    border: none;
    cursor: pointer;
    transition: all 0.3s cubic-bezier(0.4,0,0.2,1);
  }
  .confirm-logout-btn:hover:not(:disabled) {
    background: linear-gradient(135deg, #f43f5e, #e11d48);
    transform: translateY(-1px);
    box-shadow: 0 8px 24px rgba(225,29,72,0.35);
  }
  .confirm-logout-btn:disabled { opacity: 0.5; cursor: not-allowed; }

  .cover-hint {
    font-size: 0.6875rem;
    color: rgba(71,85,105,0.7);
    margin-top: 0.75rem;
    transition: color 0.3s ease;
  }
  .cover-hint:hover { color: rgba(100,116,139,0.8); }

  .hero-card {
    background: rgba(15,17,23,0.9);
    border: 1px solid rgba(255,255,255,0.065);
    border-radius: 1.25rem;
    overflow: hidden;
    transition: border-color 0.4s ease, box-shadow 0.4s ease;
  }
  .hero-card:hover {
    border-color: rgba(99,102,241,0.15);
    box-shadow: 0 0 60px rgba(99,102,241,0.07);
  }

  .danger-card {
    background: rgba(15,17,23,0.85);
    border: 1px solid rgba(244,63,94,0.12);
    border-radius: 1.25rem;
    overflow: hidden;
    transition: border-color 0.35s ease, box-shadow 0.35s ease;
  }
  .danger-card:hover {
    border-color: rgba(244,63,94,0.25);
    box-shadow: 0 0 40px rgba(244,63,94,0.06);
  }

  .field-wrap { position: relative; margin-bottom: 1rem; }
  .field-wrap:last-child { margin-bottom: 0; }

  .section-title {
    font-size: 0.875rem;
    font-family: 'Syne', sans-serif;
    font-weight: 600;
    color: #e2e8f0;
    letter-spacing: -0.01em;
  }
  .section-desc {
    font-size: 0.75rem;
    color: rgba(100,116,139,0.8);
    margin-top: 0.2rem;
  }

  .verified-chip {
    background: rgba(99,102,241,0.1);
    border: 1px solid rgba(99,102,241,0.18);
    color: rgba(129,140,248,0.9);
  }
  .verified-chip:hover {
    background: rgba(99,102,241,0.16);
    box-shadow: 0 0 12px rgba(99,102,241,0.12);
  }

  .email-chip {
    background: rgba(255,255,255,0.03);
    border: 1px solid rgba(255,255,255,0.07);
    color: rgba(100,116,139,0.9);
    max-width: 14rem;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .form-footer {
    display: flex; align-items: center; justify-content: space-between;
    padding-top: 0.5rem; flex-wrap: wrap; gap: 0.75rem;
  }
`;

function useRipple() {
  const btnRef = useRef(null);
  const handleRipple = (e) => {
    const btn = btnRef.current;
    if (!btn) return;
    const rect = btn.getBoundingClientRect();
    const size = Math.max(rect.width, rect.height);
    const x = e.clientX - rect.left - size / 2;
    const y = e.clientY - rect.top - size / 2;
    const el = document.createElement("span");
    el.className = "ripple-effect";
    el.style.cssText = `width:${size}px;height:${size}px;left:${x}px;top:${y}px;`;
    btn.appendChild(el);
    setTimeout(() => el.remove(), 600);
  };
  return { btnRef, handleRipple };
}

function inputCls(err) {
  return "input-field" + (err ? " error" : "");
}

function Field({ id, label, icon: Icon, error, children, required }) {
  return (
    <div className="field-wrap">
      <label htmlFor={id} className="label-text">
        {label}
        {required && (
          <span style={{ color: "#fb7185", marginLeft: "2px" }}>*</span>
        )}
      </label>
      <div style={{ position: "relative" }}>
        <span className="icon-slot">
          <Icon size={14} />
        </span>
        {children}
      </div>
      {error && (
        <p
          style={{
            marginTop: "0.375rem",
            fontSize: "0.75rem",
            color: "#fb7185",
            animation: "slideInRight 0.3s ease both",
          }}
        >
          {error}
        </p>
      )}
    </div>
  );
}

function SectionCard({ title, description, children, className = "" }) {
  return (
    <div
      className={`glass-card ${className}`}
      style={{ borderRadius: "1.25rem", overflow: "hidden" }}
    >
      <div className="section-divider" />
      <div style={{ padding: "1.5rem" }}>
        <div style={{ marginBottom: "1.25rem" }}>
          <h2 className="section-title">{title}</h2>
          {description && <p className="section-desc">{description}</p>}
        </div>
        {children}
      </div>
    </div>
  );
}

function StatusBadge({ success, message }) {
  if (!message) return null;
  return (
    <div
      className="status-badge"
      style={
        success
          ? {
              background: "rgba(16,185,129,0.08)",
              border: "1px solid rgba(16,185,129,0.2)",
              color: "#34d399",
            }
          : {
              background: "rgba(244,63,94,0.08)",
              border: "1px solid rgba(244,63,94,0.2)",
              color: "#fb7185",
            }
      }
    >
      {success ? (
        <Check size={13} style={{ flexShrink: 0, marginTop: "1px" }} />
      ) : (
        <AlertTriangle size={13} style={{ flexShrink: 0, marginTop: "1px" }} />
      )}
      <span>{message}</span>
    </div>
  );
}

function SubmitButton({ loading, label, loadingLabel }) {
  const { btnRef, handleRipple } = useRipple();
  return (
    <button
      type="submit"
      ref={btnRef}
      disabled={loading}
      className="submit-btn shimmer-btn"
      onClick={handleRipple}
    >
      {loading ? (
        <span style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
          <Loader2 size={14} style={{ animation: "spin 1s linear infinite" }} />
          {loadingLabel}
        </span>
      ) : (
        label
      )}
    </button>
  );
}

function LogoutModal({ onConfirm, onCancel, loading, error }) {
  return (
    <div
      className="modal-backdrop"
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 50,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "1rem",
        background: "rgba(0,0,0,0.65)",
        backdropFilter: "blur(12px)",
      }}
      onClick={onCancel}
    >
      <div
        className="modal-card"
        style={{
          position: "relative",
          width: "100%",
          maxWidth: "22rem",
          background: "rgba(11,13,19,0.97)",
          border: "1px solid rgba(255,255,255,0.08)",
          borderRadius: "1.5rem",
          overflow: "hidden",
          boxShadow:
            "0 32px 80px rgba(0,0,0,0.7), 0 0 0 1px rgba(244,63,94,0.08)",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="danger-divider" />
        <div style={{ padding: "1.75rem 1.5rem 1.5rem" }}>
          <button
            onClick={onCancel}
            style={{
              position: "absolute",
              top: "1rem",
              right: "1rem",
              background: "none",
              border: "none",
              cursor: "pointer",
              color: "rgba(100,116,139,0.7)",
              transition: "color 0.2s ease, transform 0.2s ease",
              padding: "0.25rem",
              borderRadius: "0.375rem",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.color = "#e2e8f0";
              e.currentTarget.style.transform = "rotate(90deg)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.color = "rgba(100,116,139,0.7)";
              e.currentTarget.style.transform = "rotate(0deg)";
            }}
          >
            <X size={15} />
          </button>

          <div
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              textAlign: "center",
              marginBottom: "1.5rem",
            }}
          >
            <span
              className="logout-icon-wrap"
              style={{
                width: "3.5rem",
                height: "3.5rem",
                borderRadius: "1rem",
                background: "rgba(244,63,94,0.1)",
                border: "1px solid rgba(244,63,94,0.2)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                marginBottom: "1rem",
                boxShadow: "0 0 30px rgba(244,63,94,0.1)",
              }}
            >
              <LogOut
                size={20}
                strokeWidth={1.75}
                style={{ color: "#fb7185" }}
              />
            </span>
            <h3
              style={{
                fontFamily: "'Syne', sans-serif",
                fontSize: "1.0625rem",
                fontWeight: 700,
                color: "#f1f5f9",
                marginBottom: "0.375rem",
              }}
            >
              Sign out?
            </h3>
            <p
              style={{
                fontSize: "0.8125rem",
                color: "rgba(100,116,139,0.8)",
                lineHeight: 1.6,
              }}
            >
              You'll need to sign in again to access your workspace.
            </p>
          </div>

          {error && (
            <div
              className="status-badge"
              style={{
                background: "rgba(244,63,94,0.08)",
                border: "1px solid rgba(244,63,94,0.2)",
                color: "#fb7185",
                marginBottom: "1rem",
              }}
            >
              <AlertTriangle
                size={13}
                style={{ flexShrink: 0, marginTop: "1px" }}
              />
              <span>{error}</span>
            </div>
          )}

          <div style={{ display: "flex", gap: "0.625rem" }}>
            <button
              className="cancel-btn"
              onClick={onCancel}
              disabled={loading}
            >
              Cancel
            </button>
            <button
              className="confirm-logout-btn shimmer-btn"
              onClick={onConfirm}
              disabled={loading}
            >
              {loading ? (
                <span
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: "0.5rem",
                  }}
                >
                  <Loader2
                    size={13}
                    style={{ animation: "spin 1s linear infinite" }}
                  />
                  Signing out…
                </span>
              ) : (
                "Yes, sign out"
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function Profile() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const user = useSelector((state) => state.auth.userData);

  const [showLogout, setShowLogout] = useState(false);
  const [logoutLoading, setLogoutLoading] = useState(false);
  const [logoutError, setLogoutError] = useState("");

  const handleLogout = async () => {
    setLogoutError("");
    setLogoutLoading(true);
    try {
      await axios.post("/api/v2/users/logout");
      dispatch(authLogout());
      navigate("/login");
    } catch (err) {
      setLogoutError(
        err.response?.data?.message || "Logout failed. Please try again.",
      );
    } finally {
      setLogoutLoading(false);
    }
  };

  const {
    register: regDetails,
    handleSubmit: submitDetails,
    formState: { errors: detailErrors },
  } = useForm({
    defaultValues: { fullName: user?.fullName || "", email: user?.email || "" },
  });
  const [detailsLoading, setDetailsLoading] = useState(false);
  const [detailsStatus, setDetailsStatus] = useState({
    success: false,
    message: "",
  });

  const saveDetails = async (data) => {
    setDetailsStatus({ success: false, message: "" });
    setDetailsLoading(true);
    try {
      const res = await axios.patch("/api/v2/users/update-account", data);
      dispatch(updateUser(res.data.data));
      setDetailsStatus({
        success: true,
        message: "Account details updated successfully.",
      });
    } catch (err) {
      setDetailsStatus({
        success: false,
        message: err.response?.data?.message || "Update failed.",
      });
    } finally {
      setDetailsLoading(false);
    }
  };

  const {
    register: regPass,
    handleSubmit: submitPass,
    reset: resetPass,
    formState: { errors: passErrors },
  } = useForm();
  const [passLoading, setPassLoading] = useState(false);
  const [passStatus, setPassStatus] = useState({ success: false, message: "" });
  const [showOld, setShowOld] = useState(false);
  const [showNew, setShowNew] = useState(false);

  const changePassword = async (data) => {
    setPassStatus({ success: false, message: "" });
    setPassLoading(true);
    try {
      await axios.post("/api/v2/users/change-password", {
        oldPassword: data.oldPassword,
        newPassword: data.newPassword,
      });
      setPassStatus({
        success: true,
        message: "Password changed successfully.",
      });
      resetPass();
    } catch (err) {
      setPassStatus({
        success: false,
        message: err.response?.data?.message || "Password change failed.",
      });
    } finally {
      setPassLoading(false);
    }
  };

  const avatarRef = useRef();
  const [avatarLoading, setAvatarLoading] = useState(false);
  const [avatarStatus, setAvatarStatus] = useState({
    success: false,
    message: "",
  });

  const handleAvatarChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setAvatarStatus({ success: false, message: "" });
    setAvatarLoading(true);
    const form = new FormData();
    form.append("avatar", file);
    try {
      const res = await axios.patch("/api/v2/users/avatar", form);
      dispatch(updateUser(res.data.data));
      setAvatarStatus({ success: true, message: "Avatar updated." });
    } catch (err) {
      setAvatarStatus({
        success: false,
        message: err.response?.data?.message || "Upload failed.",
      });
    } finally {
      setAvatarLoading(false);
    }
  };

  const coverRef = useRef();
  const [coverLoading, setCoverLoading] = useState(false);
  const [coverStatus, setCoverStatus] = useState({
    success: false,
    message: "",
  });

  const handleCoverChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setCoverStatus({ success: false, message: "" });
    setCoverLoading(true);
    const form = new FormData();
    form.append("coverImage", file);
    try {
      const res = await axios.patch("/api/v2/users/cover-image", form);
      dispatch(updateUser(res.data.data));
      setCoverStatus({ success: true, message: "Cover image updated." });
    } catch (err) {
      setCoverStatus({
        success: false,
        message: err.response?.data?.message || "Upload failed.",
      });
    } finally {
      setCoverLoading(false);
    }
  };

  const initials = user?.fullName
    ? user.fullName
        .split(" ")
        .map((n) => n[0])
        .slice(0, 2)
        .join("")
        .toUpperCase()
    : user?.username?.[0]?.toUpperCase() || "?";

  return (
    <>
      <style>{styles}</style>
      <div
        className="profile-root"
        style={{
          minHeight: "100%",
          background: "#080a0f",
          position: "relative",
        }}
      >
        <div
          style={{
            pointerEvents: "none",
            position: "fixed",
            inset: 0,
            zIndex: 0,
            overflow: "hidden",
          }}
        >
          <div
            className="orb1"
            style={{
              position: "absolute",
              top: "-5rem",
              left: "20%",
              width: "28rem",
              height: "28rem",
              background:
                "radial-gradient(circle, rgba(79,70,229,0.09) 0%, transparent 70%)",
              borderRadius: "50%",
            }}
          />
          <div
            className="orb2"
            style={{
              position: "absolute",
              bottom: "5%",
              right: "15%",
              width: "22rem",
              height: "22rem",
              background:
                "radial-gradient(circle, rgba(124,58,237,0.07) 0%, transparent 70%)",
              borderRadius: "50%",
            }}
          />
          <div
            style={{
              position: "absolute",
              top: "50%",
              left: "60%",
              width: "18rem",
              height: "18rem",
              background:
                "radial-gradient(circle, rgba(16,185,129,0.04) 0%, transparent 70%)",
              borderRadius: "50%",
              animation: "floatOrb1 20s ease-in-out 6s infinite",
            }}
          />
        </div>

        <div
          style={{
            position: "relative",
            zIndex: 10,
            maxWidth: "42rem",
            margin: "0 auto",
            padding: "2rem 1rem",
            display: "flex",
            flexDirection: "column",
            gap: "1.25rem",
          }}
        >
          <div className="hero-card card-stagger-1 glow-card">
            <div className="section-divider" />

            <div
              className="cover-area"
              style={{ height: "9rem" }}
              onClick={() => !coverLoading && coverRef.current?.click()}
            >
              {user?.coverImage ? (
                <img
                  src={user.coverImage}
                  alt="Cover"
                  style={{ width: "100%", height: "100%", objectFit: "cover" }}
                />
              ) : (
                <div
                  style={{
                    width: "100%",
                    height: "100%",
                    background:
                      "linear-gradient(135deg, rgba(49,46,129,0.7) 0%, rgba(76,29,149,0.4) 40%, rgba(15,17,23,1) 100%)",
                    position: "relative",
                    overflow: "hidden",
                  }}
                >
                  <div
                    style={{
                      position: "absolute",
                      top: "-2rem",
                      left: "-2rem",
                      width: "12rem",
                      height: "12rem",
                      background: "rgba(99,102,241,0.15)",
                      borderRadius: "50%",
                      filter: "blur(2.5rem)",
                    }}
                  />
                  <div
                    style={{
                      position: "absolute",
                      bottom: "-3rem",
                      right: "-3rem",
                      width: "16rem",
                      height: "16rem",
                      background: "rgba(124,58,237,0.12)",
                      borderRadius: "50%",
                      filter: "blur(3rem)",
                    }}
                  />
                  <div
                    style={{
                      position: "absolute",
                      top: "50%",
                      left: "50%",
                      transform: "translate(-50%,-50%)",
                      width: "100%",
                      height: "1px",
                      background:
                        "linear-gradient(90deg, transparent, rgba(99,102,241,0.25), transparent)",
                    }}
                  />
                  <div
                    style={{
                      position: "absolute",
                      top: "30%",
                      left: "30%",
                      width: "1px",
                      height: "40%",
                      background:
                        "linear-gradient(180deg, transparent, rgba(99,102,241,0.15), transparent)",
                    }}
                  />
                </div>
              )}

              <div className="cover-overlay">
                {coverLoading ? (
                  <Loader2
                    size={18}
                    style={{
                      color: "white",
                      animation: "spin 1s linear infinite",
                    }}
                  />
                ) : (
                  <>
                    <Camera size={15} style={{ color: "white" }} />
                    <span
                      style={{
                        color: "white",
                        fontSize: "0.75rem",
                        fontFamily: "'Syne', sans-serif",
                        fontWeight: 600,
                        letterSpacing: "0.02em",
                      }}
                    >
                      {user?.coverImage ? "Change cover" : "Add cover"}
                    </span>
                  </>
                )}
              </div>

              <div
                style={{
                  position: "absolute",
                  inset: "0 0 0 0",
                  height: "100%",
                  background:
                    "linear-gradient(to bottom, transparent 40%, rgba(8,10,15,1) 100%)",
                  pointerEvents: "none",
                }}
              />
              <input
                ref={coverRef}
                type="file"
                accept="image/*"
                style={{ display: "none" }}
                onChange={handleCoverChange}
              />
            </div>

            <div
              style={{
                padding: "0 1.5rem 1.5rem",
                marginTop: "-3rem",
                position: "relative",
              }}
            >
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  gap: "1rem",
                }}
              >
                <div
                  style={{
                    display: "flex",
                    alignItems: "flex-end",
                    justifyContent: "space-between",
                    gap: "1rem",
                    flexWrap: "wrap",
                  }}
                >
                  <div
                    className="avatar-wrap"
                    onClick={() => !avatarLoading && avatarRef.current?.click()}
                  >
                    <div className="avatar-img-wrap">
                      {user?.avatar ? (
                        <img
                          src={user.avatar}
                          alt={user?.fullName}
                          style={{
                            width: "100%",
                            height: "100%",
                            objectFit: "cover",
                          }}
                        />
                      ) : (
                        <div
                          style={{
                            width: "100%",
                            height: "100%",
                            background:
                              "linear-gradient(135deg, #4f46e5, #7c3aed, #a855f7)",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                          }}
                        >
                          <span
                            style={{
                              color: "white",
                              fontFamily: "'Syne', sans-serif",
                              fontWeight: 800,
                              fontSize: "1.75rem",
                              letterSpacing: "-0.02em",
                              userSelect: "none",
                            }}
                          >
                            {initials}
                          </span>
                        </div>
                      )}
                      <div className="avatar-hover-overlay">
                        {avatarLoading ? (
                          <Loader2
                            size={14}
                            style={{
                              animation: "spin 1s linear infinite",
                              color: "white",
                            }}
                          />
                        ) : (
                          <Camera size={14} style={{ color: "white" }} />
                        )}
                      </div>
                    </div>
                    <span className="online-dot" />
                    <input
                      ref={avatarRef}
                      type="file"
                      accept="image/*"
                      style={{ display: "none" }}
                      onChange={handleAvatarChange}
                    />
                  </div>

                  <div
                    style={{ flex: 1, minWidth: 0, paddingBottom: "0.25rem" }}
                  >
                    <h1
                      style={{
                        fontFamily: "'Syne', sans-serif",
                        fontSize: "1.375rem",
                        fontWeight: 800,
                        color: "#f8fafc",
                        letterSpacing: "-0.025em",
                        lineHeight: 1.2,
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                        whiteSpace: "nowrap",
                      }}
                    >
                      {user?.fullName || "Your Name"}
                    </h1>
                    <p
                      style={{
                        fontSize: "0.8125rem",
                        color: "rgba(100,116,139,0.8)",
                        marginTop: "0.2rem",
                        fontWeight: 300,
                        letterSpacing: "0.01em",
                      }}
                    >
                      @{user?.username || "username"}
                    </p>

                    <div
                      style={{
                        display: "flex",
                        flexWrap: "wrap",
                        alignItems: "center",
                        gap: "0.5rem",
                        marginTop: "0.75rem",
                      }}
                    >
                      <span className="chip email-chip">
                        <Mail size={10} style={{ flexShrink: 0 }} />
                        {user?.email || "email@example.com"}
                      </span>
                      <span className="chip verified-chip">
                        <Shield size={10} />
                        Verified
                      </span>
                    </div>
                  </div>
                </div>

                {(avatarStatus.message || coverStatus.message) && (
                  <div
                    style={{
                      display: "flex",
                      flexDirection: "column",
                      gap: "0.375rem",
                    }}
                  >
                    {avatarStatus.message && (
                      <StatusBadge
                        success={avatarStatus.success}
                        message={avatarStatus.message}
                      />
                    )}
                    {coverStatus.message && (
                      <StatusBadge
                        success={coverStatus.success}
                        message={coverStatus.message}
                      />
                    )}
                  </div>
                )}
              </div>

              <p className="cover-hint">
                Hover avatar or cover to upload a new image.
              </p>
            </div>
          </div>

          <SectionCard
            title="Account Details"
            description="Update your display name and email address."
            className="card-stagger-2"
          >
            <form onSubmit={submitDetails(saveDetails)} noValidate>
              <Field
                id="fullName"
                label="Full Name"
                icon={User}
                error={detailErrors.fullName?.message}
                required
              >
                <input
                  id="fullName"
                  type="text"
                  placeholder="Jane Doe"
                  {...regDetails("fullName", {
                    required: "Full name is required",
                  })}
                  className={inputCls(detailErrors.fullName)}
                />
              </Field>

              <Field
                id="email"
                label="Email Address"
                icon={Mail}
                error={detailErrors.email?.message}
                required
              >
                <input
                  id="email"
                  type="email"
                  placeholder="jane@example.com"
                  {...regDetails("email", { required: "Email is required" })}
                  className={inputCls(detailErrors.email)}
                />
              </Field>

              <div className="form-footer">
                <StatusBadge
                  success={detailsStatus.success}
                  message={detailsStatus.message}
                />
                <SubmitButton
                  loading={detailsLoading}
                  label="Save changes"
                  loadingLabel="Saving…"
                />
              </div>
            </form>
          </SectionCard>

          <SectionCard
            title="Change Password"
            description="Use a strong password you don't use elsewhere."
            className="card-stagger-3"
          >
            <form onSubmit={submitPass(changePassword)} noValidate>
              <div className="field-wrap">
                <label htmlFor="oldPassword" className="label-text">
                  Current Password <span style={{ color: "#fb7185" }}>*</span>
                </label>
                <div style={{ position: "relative" }}>
                  <span className="icon-slot">
                    <Lock size={14} />
                  </span>
                  <input
                    id="oldPassword"
                    type={showOld ? "text" : "password"}
                    placeholder="••••••••"
                    {...regPass("oldPassword", {
                      required: "Current password is required",
                    })}
                    className={inputCls(passErrors.oldPassword)}
                    style={{ paddingRight: "2.5rem" }}
                  />
                  <button
                    type="button"
                    className="toggle-vis"
                    onClick={() => setShowOld((v) => !v)}
                  >
                    {showOld ? <EyeOff size={14} /> : <Eye size={14} />}
                  </button>
                </div>
                {passErrors.oldPassword && (
                  <p
                    style={{
                      marginTop: "0.375rem",
                      fontSize: "0.75rem",
                      color: "#fb7185",
                      animation: "slideInRight 0.3s ease both",
                    }}
                  >
                    {passErrors.oldPassword.message}
                  </p>
                )}
              </div>

              <div className="field-wrap">
                <label htmlFor="newPassword" className="label-text">
                  New Password <span style={{ color: "#fb7185" }}>*</span>
                </label>
                <div style={{ position: "relative" }}>
                  <span className="icon-slot">
                    <Lock size={14} />
                  </span>
                  <input
                    id="newPassword"
                    type={showNew ? "text" : "password"}
                    placeholder="Min. 8 characters"
                    {...regPass("newPassword", {
                      required: "New password is required",
                      minLength: {
                        value: 8,
                        message: "Must be at least 8 characters",
                      },
                    })}
                    className={inputCls(passErrors.newPassword)}
                    style={{ paddingRight: "2.5rem" }}
                  />
                  <button
                    type="button"
                    className="toggle-vis"
                    onClick={() => setShowNew((v) => !v)}
                  >
                    {showNew ? <EyeOff size={14} /> : <Eye size={14} />}
                  </button>
                </div>
                {passErrors.newPassword && (
                  <p
                    style={{
                      marginTop: "0.375rem",
                      fontSize: "0.75rem",
                      color: "#fb7185",
                      animation: "slideInRight 0.3s ease both",
                    }}
                  >
                    {passErrors.newPassword.message}
                  </p>
                )}
              </div>

              <div className="form-footer">
                <StatusBadge
                  success={passStatus.success}
                  message={passStatus.message}
                />
                <SubmitButton
                  loading={passLoading}
                  label="Update password"
                  loadingLabel="Updating…"
                />
              </div>
            </form>
          </SectionCard>

          <div className="danger-card card-stagger-4">
            <div className="danger-divider" />
            <div
              style={{
                padding: "1.25rem 1.5rem",
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                gap: "1rem",
                flexWrap: "wrap",
              }}
            >
              <div>
                <h2
                  style={{
                    fontFamily: "'Syne', sans-serif",
                    fontSize: "0.875rem",
                    fontWeight: 600,
                    color: "#e2e8f0",
                  }}
                >
                  Sign out
                </h2>
                <p
                  style={{
                    fontSize: "0.75rem",
                    color: "rgba(100,116,139,0.7)",
                    marginTop: "0.2rem",
                  }}
                >
                  You'll be redirected to the login page.
                </p>
              </div>
              <button
                className="sign-out-btn"
                onClick={() => setShowLogout(true)}
              >
                <LogOut size={14} strokeWidth={2} />
                Sign out
              </button>
            </div>
          </div>

          <div className="system-status" style={{ paddingBottom: "0.5rem" }}>
            <span
              style={{
                position: "relative",
                display: "flex",
                width: "0.5rem",
                height: "0.5rem",
              }}
            >
              <span
                style={{
                  position: "absolute",
                  inset: 0,
                  borderRadius: "50%",
                  background: "#10b981",
                  opacity: 0.6,
                  animation: "pulseRing 2s ease-out infinite",
                }}
              />
              <span
                style={{
                  position: "relative",
                  width: "0.5rem",
                  height: "0.5rem",
                  borderRadius: "50%",
                  background: "#10b981",
                  display: "block",
                }}
              />
            </span>
            <span
              style={{
                fontSize: "0.6875rem",
                color: "rgba(71,85,105,0.8)",
                fontFamily: "'DM Sans', sans-serif",
              }}
            >
              System Online
            </span>
            <span
              style={{
                fontSize: "0.6875rem",
                color: "rgba(71,85,105,0.5)",
                fontFamily: "'Syne', sans-serif",
                fontWeight: 600,
              }}
            >
              v1.0.0
            </span>
          </div>
        </div>

        {showLogout && (
          <LogoutModal
            onConfirm={handleLogout}
            onCancel={() => {
              setShowLogout(false);
              setLogoutError("");
            }}
            loading={logoutLoading}
            error={logoutError}
          />
        )}
      </div>
    </>
  );
}
