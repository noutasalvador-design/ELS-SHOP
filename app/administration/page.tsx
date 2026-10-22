"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowLeft, BadgeCheck, Check, LogOut, RefreshCw, ShieldCheck } from "lucide-react";

type StoreItem={id:string;name:string;slug:string;countryCode:string;currency:string;owner:{fullName:string;email:string}};
type ProductItem={id:string;title:string;slug:string;type:"PHYSICAL"|"DIGITAL";priceMinor:number;currency:string;countryCode:string;stockQuantity:number|null;digitalAssetKey:string|null;store:{id:string;name:string;isVerified:boolean;isActive:boolean}};
type ReviewData={stores:StoreItem[];products:ProductItem[];error?:string};
export default function AdministrationPage(){
 const [data,setData]=useState<ReviewData>({stores:[],products:[]});const [loading,setLoading]=useState(true);const [error,setError]=useState("");const [message,setMessage]=useState("");const [busyId,setBusyId]=useState("");
 async function load(){setLoading(true);setError("");try{const res=await fetch("/api/admin/review",{cache:"no-store"});const json=await res.json();if(!res.ok)throw new Error(json.error||"Accès administrateur requis.");setData(json);}catch(e){setError(e instanceof Error?e.message:"Chargement impossible.");}finally{setLoading(false);}}
 useEffect(()=>{load();},[]);
 async function action(payload:{action:"verify-store";storeId:string}|{action:"publish-product";productId:string},id:string){setBusyId(id);setError("");setMessage("");try{const res=await fetch("/api/admin/review",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify(payload)});const json=await res.json();if(!res.ok)throw new Error(json.error||"Action impossible.");setMessage("Action de modération effectuée.");await load();}catch(e){setError(e instanceof Error?e.message:"Action impossible.");}finally{setBusyId("");}}
 async function logout(){await fetch("/api/auth/logout",{method:"POST"});window.location.href="/";}
 return <main className="dashboard-shell"><div className="container"><div className="dashboard-top"><div className="dashboard-title"><Link href="/" className="auth-back"><ArrowLeft size={15}/> Retour à ELS SHOP</Link><h1>Administration</h1><p>Vérifiez les boutiques et contrôlez les produits avant leur publication.</p></div><div style={{display:"flex",gap:8,flexWrap:"wrap"}}><button className="button button-light" onClick={load}><RefreshCw size={15}/> Actualiser</button><button className="button button-light" onClick={logout}><LogOut size={15}/> Déconnexion</button></div></div>
 {error&&<div className="dashboard-status dashboard-error" role="alert">{error}</div>}{message&&<div className="dashboard-status" role="status">{message}</div>}
 {loading?<div className="dashboard-empty">Chargement de la file de modération…</div>:<>
 <div className="dashboard-grid">
 <section className="dashboard-card"><span className="trust-icon"><ShieldCheck size={20}/></span><h2 style={{marginTop:14}}>Boutiques à vérifier</h2><p>Vérifiez le nom et les informations du vendeur avant d’autoriser la publication des produits.</p>
 {data.stores.length===0?<div className="dashboard-empty">Aucune boutique en attente.</div>:data.stores.map(store=><div key={store.id} className="review-item"><div><strong>{store.name}</strong><p>{store.owner.fullName} · {store.owner.email}</p><small>{store.countryCode} · {store.currency} · /{store.slug}</small></div><button className="button" disabled={busyId===store.id} onClick={()=>action({action:"verify-store",storeId:store.id},store.id)}><Check size={15}/> Vérifier</button></div>)}
 </section>
 <section className="dashboard-card"><span className="trust-icon"><BadgeCheck size={20}/></span><h2 style={{marginTop:14}}>Produits en brouillon</h2><p>Les produits physiques peuvent être publiés si la boutique est vérifiée et que le stock est disponible. Les fichiers numériques doivent être stockés de façon privée avant publication.</p>
 {data.products.length===0?<div className="dashboard-empty">Aucun produit en attente.</div>:data.products.map(product=><div key={product.id} className="review-item"><div><strong>{product.title}</strong><p>{product.store.name} · {product.type==="DIGITAL"?"Numérique":"Physique"}</p><small>{product.priceMinor.toLocaleString("fr-FR")} {product.currency} · {product.countryCode} · {product.store.isVerified?"Boutique vérifiée":"Boutique non vérifiée"}</small></div><button className="button" disabled={busyId===product.id||!product.store.isVerified||!product.store.isActive} onClick={()=>action({action:"publish-product",productId:product.id},product.id)}><Check size={15}/> Publier</button></div>)}
 </section></div><p className="auth-note" style={{marginTop:24}}>Les comptes administrateurs doivent être attribués manuellement et de façon sécurisée dans la base de données. Aucun formulaire public ne peut créer un administrateur.</p></>}
 </div></main>;
}
