"use client";
import { FormEvent, useState } from "react";
import Link from "next/link";
import { ArrowLeft, ArrowRight, LockKeyhole, ShoppingBag } from "lucide-react";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault(); setError(""); setBusy(true);
    try {
      const response = await fetch("/api/auth/login", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ email, password }) });
      const data = await response.json();
      if (!response.ok) { setError(data.error || "Connexion impossible."); return; }
      window.location.href = "/espace-vendeur";
    } catch { setError("Connexion impossible pour le moment. Réessayez."); }
    finally { setBusy(false); }
  }
  return <main className="auth-shell"><section className="auth-card">
    <Link href="/" className="auth-back"><ArrowLeft size={16}/> Retour à la marketplace</Link>
    <Link href="/" className="auth-brand"><span className="brand-mark">E.</span><span>ELS SHOP<span style={{color:"#3c7a53"}}>.</span></span></Link>
    <div className="auth-heading"><span className="auth-icon"><LockKeyhole size={21}/></span><h1>Heureux de vous revoir.</h1><p>Connectez-vous pour retrouver votre compte et vos boutiques.</p></div>
    <form className="auth-form" onSubmit={submit}>
      <label htmlFor="email">Adresse e-mail</label><input id="email" type="email" autoComplete="email" required maxLength={254} value={email} onChange={e=>setEmail(e.target.value)} placeholder="vous@exemple.com"/>
      <label htmlFor="password">Mot de passe</label><input id="password" type="password" autoComplete="current-password" required maxLength={72} value={password} onChange={e=>setPassword(e.target.value)} placeholder="Votre mot de passe"/>
      {error && <p className="auth-error" role="alert">{error}</p>}
      <button className="button auth-submit" type="submit" disabled={busy}>{busy ? "Connexion..." : "Se connecter"} <ArrowRight size={16}/></button>
    </form>
    <p className="auth-switch">Vous n’avez pas encore de compte ? <Link href="/inscription">Créer un compte</Link></p>
    <div className="auth-note"><ShoppingBag size={16}/> Une marketplace pensée pour les vendeurs et acheteurs africains.</div>
  </section></main>;
}
