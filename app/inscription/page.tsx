"use client";
import { FormEvent, useState } from "react";
import Link from "next/link";
import { ArrowLeft, ArrowRight, ShieldCheck } from "lucide-react";

export default function RegisterPage() {
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [countryCode, setCountryCode] = useState("BJ");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault(); setError(""); setBusy(true);
    try {
      const response = await fetch("/api/auth/register", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ fullName, email, password, countryCode }) });
      const data = await response.json();
      if (!response.ok) { setError(data.error || "Création du compte impossible."); return; }
      window.location.href = "/espace-vendeur";
    } catch { setError("Création du compte impossible pour le moment. Réessayez."); }
    finally { setBusy(false); }
  }
  return <main className="auth-shell"><section className="auth-card">
    <Link href="/" className="auth-back"><ArrowLeft size={16}/> Retour à la marketplace</Link>
    <Link href="/" className="auth-brand"><span className="brand-mark">E.</span><span>ELS SHOP<span style={{color:"#3c7a53"}}>.</span></span></Link>
    <div className="auth-heading"><span className="auth-icon"><ShieldCheck size={21}/></span><h1>Créez votre compte.</h1><p>Rejoignez ELS SHOP pour découvrir les produits ou préparer votre boutique.</p></div>
    <form className="auth-form" onSubmit={submit}>
      <label htmlFor="fullName">Nom complet</label><input id="fullName" autoComplete="name" required minLength={2} maxLength={100} value={fullName} onChange={e=>setFullName(e.target.value)} placeholder="Votre nom"/>
      <label htmlFor="email">Adresse e-mail</label><input id="email" type="email" autoComplete="email" required maxLength={254} value={email} onChange={e=>setEmail(e.target.value)} placeholder="vous@exemple.com"/>
      <label htmlFor="countryCode">Votre pays</label><select id="countryCode" value={countryCode} onChange={e=>setCountryCode(e.target.value)}>{[["BJ","Bénin"],["CI","Côte d’Ivoire"],["SN","Sénégal"],["BF","Burkina Faso"],["ML","Mali"],["TG","Togo"],["NE","Niger"],["GN","Guinée"],["CM","Cameroun"],["CD","RDC"]].map(([code,name])=><option key={code} value={code}>{name}</option>)}</select>
      <label htmlFor="password">Mot de passe <span className="auth-hint">(10 caractères minimum)</span></label><input id="password" type="password" autoComplete="new-password" required minLength={10} maxLength={72} value={password} onChange={e=>setPassword(e.target.value)} placeholder="Créez un mot de passe"/>
      {error && <p className="auth-error" role="alert">{error}</p>}
      <button className="button auth-submit" type="submit" disabled={busy}>{busy ? "Création..." : "Créer mon compte"} <ArrowRight size={16}/></button>
    </form>
    <p className="auth-switch">Vous avez déjà un compte ? <Link href="/connexion">Se connecter</Link></p>
    <div className="auth-note"><ShieldCheck size={16}/> Vos informations de compte ne sont jamais affichées publiquement.</div>
  </section></main>;
}
