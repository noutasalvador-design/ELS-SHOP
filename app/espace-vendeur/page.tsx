"use client";
import { FormEvent, useEffect, useState } from "react";
import Link from "next/link";
import { ArrowLeft, ArrowRight, BadgeCheck, LogOut, PackagePlus, Store } from "lucide-react";

type User = { id: string; email: string; fullName: string; role: "CUSTOMER" | "SELLER" | "ADMIN"; countryCode: string };
type StoreData = { id: string; name: string; slug: string; countryCode: string; currency: string; isVerified: boolean; isActive: boolean; _count: { products: number } };
const countries = [["BJ","Bénin"],["CI","Côte d’Ivoire"],["SN","Sénégal"],["BF","Burkina Faso"],["ML","Mali"],["TG","Togo"],["NE","Niger"],["GN","Guinée"],["CM","Cameroun"],["CD","RDC"]];

export default function SellerSpacePage() {
  const [user,setUser] = useState<User | null>(null);
  const [store,setStore] = useState<StoreData | null>(null);
  const [loading,setLoading] = useState(true);
  const [busy,setBusy] = useState(false);
  const [message,setMessage] = useState("");
  const [error,setError] = useState("");
  const [storeName,setStoreName] = useState("");
  const [slug,setSlug] = useState("");
  const [countryCode,setCountryCode] = useState("BJ");
  const [description,setDescription] = useState("");
  const [title,setTitle] = useState("");
  const [productSlug,setProductSlug] = useState("");
  const [productDescription,setProductDescription] = useState("");
  const [price,setPrice] = useState("");
  const [type,setType] = useState<"PHYSICAL"|"DIGITAL">("PHYSICAL");
  const [stock,setStock] = useState("1");
  const [imageUrl,setImageUrl] = useState("");

  useEffect(() => {
    let cancelled = false;
    async function load() {
      try {
        const response = await fetch("/api/auth/me",{cache:"no-store"});
        const data = await response.json();
        if (!data.user) { window.location.href="/connexion"; return; }
        if (cancelled) return;
        setUser(data.user);
        setCountryCode(data.user.countryCode || "BJ");
        const storeResponse = await fetch("/api/stores",{cache:"no-store"});
        const storeData = await storeResponse.json();
        if (!cancelled && storeData.store) setStore(storeData.store);
      } catch { if (!cancelled) setError("Impossible de charger votre espace. Vérifiez votre connexion."); }
      finally { if (!cancelled) setLoading(false); }
    }
    load();
    return () => { cancelled = true; };
  },[]);

  function slugify(value:string) {
    return value.normalize("NFD").replace(/[\u0300-\u036f]/g,"").toLowerCase().trim().replace(/[^a-z0-9]+/g,"-").replace(/^-|-$/g,"").slice(0,60);
  }
  async function createStore(event:FormEvent<HTMLFormElement>) {
    event.preventDefault(); setBusy(true); setError(""); setMessage("");
    try {
      const response = await fetch("/api/stores",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({name:storeName,slug,countryCode,description})});
      const data = await response.json();
      if (!response.ok) { setError(data.error || "Création de la boutique impossible."); return; }
      setStore({...data.store,_count:{products:0}});
      setMessage("Votre boutique est créée. Elle doit être vérifiée avant la mise en vente publique.");
    } catch { setError("Service indisponible. Réessayez."); }
    finally { setBusy(false); }
  }
  async function createProduct(event:FormEvent<HTMLFormElement>) {
    event.preventDefault(); setBusy(true); setError(""); setMessage("");
    const parsedPrice = Number(price);
    if (!Number.isSafeInteger(parsedPrice) || parsedPrice <= 0) { setError("Saisissez un prix entier positif en monnaie locale."); setBusy(false); return; }
    const parsedStock = Number(stock);
    try {
      const response = await fetch("/api/products",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({
        title,slug:productSlug,description:productDescription,type,priceMinor:parsedPrice,
        ...(type==="PHYSICAL" ? {stockQuantity:parsedStock} : {}),
        imageUrls:imageUrl.trim() ? [imageUrl.trim()] : []
      })});
      const data = await response.json();
      if (!response.ok) { setError(data.error || "Enregistrement du produit impossible."); return; }
      setMessage("Produit enregistré en brouillon. Il sera visible publiquement après validation de la boutique et du produit.");
      setTitle(""); setProductSlug(""); setProductDescription(""); setPrice(""); setStock("1"); setImageUrl("");
      setStore(current => current ? {...current,_count:{products:current._count.products+1}} : current);
    } catch { setError("Service indisponible. Réessayez."); }
    finally { setBusy(false); }
  }
  async function logout() {
    await fetch("/api/auth/logout",{method:"POST"});
    window.location.href="/";
  }

  if (loading) return <main className="dashboard-shell"><div className="container"><div className="dashboard-empty">Chargement de votre espace sécurisé…</div></div></main>;
  return <main className="dashboard-shell"><div className="container">
    <div className="dashboard-top"><div className="dashboard-title"><Link href="/" className="auth-back"><ArrowLeft size={15}/> Retour à ELS SHOP</Link><h1>Votre espace vendeur</h1><p>Bonjour {user?.fullName}. Gérez votre boutique et préparez vos produits à la vente.</p></div><button className="button button-light" onClick={logout}><LogOut size={15}/> Déconnexion</button></div>
    {error && <div className="dashboard-status dashboard-error" role="alert">{error}</div>}
    {message && <div className="dashboard-status" role="status">{message}</div>}
    {!store ? <div className="dashboard-grid"><section className="dashboard-card"><span className="dashboard-chip">Étape 1 sur 2</span><h2 style={{marginTop:14}}>Créez votre boutique</h2><p>Choisissez le nom public de votre boutique et le pays dans lequel vous vendez. Les pays activés correspondent aux premiers marchés prévus pour les paiements.</p>
      <form className="dashboard-form" onSubmit={createStore}>
        <label htmlFor="storeName">Nom de la boutique</label><input id="storeName" required minLength={2} maxLength={80} value={storeName} onChange={e=>{setStoreName(e.target.value);setSlug(slugify(e.target.value));}} placeholder="Ex. Boutique ELS"/>
        <label htmlFor="slug">Adresse de la boutique</label><input id="slug" required minLength={3} maxLength={60} pattern="[a-z0-9]+(-[a-z0-9]+)*" value={slug} onChange={e=>setSlug(e.target.value)} placeholder="boutique-els"/><small className="auth-hint">Adresse courte, sans espaces ni accents.</small>
        <label htmlFor="countryCode">Pays de la boutique</label><select id="countryCode" value={countryCode} onChange={e=>setCountryCode(e.target.value)}>{countries.map(([code,name])=><option key={code} value={code}>{name}</option>)}</select>
        <label htmlFor="description">Présentation (facultatif)</label><textarea id="description" maxLength={1000} value={description} onChange={e=>setDescription(e.target.value)} placeholder="Présentez votre boutique en quelques phrases."/>
        <button className="button auth-submit" disabled={busy}>{busy?"Création...":"Créer ma boutique"} <ArrowRight size={16}/></button>
      </form>
    </section><section className="dashboard-card"><span className="trust-icon"><Store size={20}/></span><h2>Vendre sur ELS SHOP</h2><p>Votre boutique vous permettra de publier des articles physiques et des produits numériques.</p><div className="dashboard-stat"><span>Compte connecté</span><strong>{user?.email}</strong></div><div className="dashboard-stat"><span>Rôle actuel</span><strong>{user?.role}</strong></div><div className="dashboard-stat"><span>Marchés de départ</span><strong>10 pays</strong></div><div className="dashboard-stat"><span>Validation</span><strong>Avant publication</strong></div></section></div>
    : <div className="dashboard-grid"><section className="dashboard-card"><span className="dashboard-chip">{store.isVerified?"Boutique vérifiée":"En attente de vérification"}</span><h2 style={{marginTop:14}}>{store.name}</h2><p>Votre boutique est configurée pour {countries.find(([code])=>code===store.countryCode)?.[1] || store.countryCode}. Les nouveaux produits sont enregistrés en brouillon pour une vérification avant publication.</p><div className="dashboard-stat"><span>Adresse</span><strong>{store.slug}</strong></div><div className="dashboard-stat"><span>Devise</span><strong>{store.currency}</strong></div><div className="dashboard-stat"><span>Produits enregistrés</span><strong>{store._count.products}</strong></div><div className="dashboard-stat"><span>Statut</span><strong>{store.isActive?"Active":"Suspendue"}</strong></div></section>
      <section className="dashboard-card"><span className="trust-icon"><PackagePlus size={20}/></span><h2>Ajouter un produit</h2><p>Les prix sont saisis en unités entières de la devise de votre boutique. Les fichiers numériques privés seront ajoutés via le module de stockage sécurisé à venir.</p>
        <form className="dashboard-form" onSubmit={createProduct}>
          <label htmlFor="title">Nom du produit</label><input id="title" required minLength={3} maxLength={140} value={title} onChange={e=>{setTitle(e.target.value);setProductSlug(slugify(e.target.value));}} placeholder="Ex. Sac artisanal"/>
          <label htmlFor="productSlug">Adresse du produit</label><input id="productSlug" required minLength={3} maxLength={140} pattern="[a-z0-9]+(-[a-z0-9]+)*" value={productSlug} onChange={e=>setProductSlug(e.target.value)} placeholder="sac-artisanal"/>
          <label htmlFor="productDescription">Description</label><textarea id="productDescription" required minLength={10} maxLength={5000} value={productDescription} onChange={e=>setProductDescription(e.target.value)} placeholder="Décrivez les caractéristiques du produit."/>
          <label htmlFor="type">Type de produit</label><select id="type" value={type} onChange={e=>setType(e.target.value as "PHYSICAL"|"DIGITAL")}><option value="PHYSICAL">Produit physique</option><option value="DIGITAL">Produit numérique</option></select>
          <label htmlFor="price">Prix ({store.currency})</label><input id="price" type="number" min="1" step="1" required value={price} onChange={e=>setPrice(e.target.value)} placeholder="12500"/>
          {type==="PHYSICAL" && <><label htmlFor="stock">Stock disponible</label><input id="stock" type="number" min="0" step="1" required value={stock} onChange={e=>setStock(e.target.value)}/></>}
          <label htmlFor="imageUrl">Image principale (URL HTTPS, facultatif)</label><input id="imageUrl" type="url" value={imageUrl} onChange={e=>setImageUrl(e.target.value)} placeholder="https://..."/>
          <button className="button auth-submit" disabled={busy}>{busy?"Enregistrement...":"Enregistrer en brouillon"} <ArrowRight size={16}/></button>
        </form>
      </section></div>}
    <p className="auth-note" style={{marginTop:24}}><BadgeCheck size={16}/> Les commandes et paiements réels ne sont pas encore activés. Les secrets de paiement restent côté serveur.</p>
  </div></main>;
}
