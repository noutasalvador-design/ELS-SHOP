"use client";
import { FormEvent, useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { ArrowRight, Search, SlidersHorizontal } from "lucide-react";

type Product = {
  id:string; title:string; slug:string; description:string; type:"PHYSICAL"|"DIGITAL";
  priceMinor:number; currency:string; countryCode:string; imageUrls:string[];
  store:{name:string;slug:string;countryCode:string;isVerified:boolean};
};
type ApiResult = {items:Product[];page:number;pageSize:number;total:number;error?:string};
const countryNames:Record<string,string>={BJ:"Bénin",CI:"Côte d’Ivoire",SN:"Sénégal",BF:"Burkina Faso",ML:"Mali",TG:"Togo",NE:"Niger",GN:"Guinée",CM:"Cameroun",CD:"RDC"};
function formatPrice(amount:number,currency:string){try{return new Intl.NumberFormat("fr-FR",{style:"currency",currency,maximumFractionDigits:0}).format(amount);}catch{return amount.toLocaleString("fr-FR")+" "+currency;}}
export default function CataloguePage(){
 const [items,setItems]=useState<Product[]>([]);const [q,setQ]=useState("");const [country,setCountry]=useState("");const [type,setType]=useState("");const [loading,setLoading]=useState(true);const [error,setError]=useState("");const [total,setTotal]=useState(0);
 const load = useCallback(async (search:string,selectedCountry:string,selectedType:string) => {
  setLoading(true);setError("");
  const params=new URLSearchParams();if(search.trim())params.set("q",search.trim());if(selectedCountry)params.set("country",selectedCountry);if(selectedType)params.set("type",selectedType);
  try{const response=await fetch("/api/products?"+params.toString(),{cache:"no-store"});const data:ApiResult=await response.json();if(!response.ok)throw new Error(data.error||"Catalogue indisponible.");setItems(data.items||[]);setTotal(data.total||0);}
  catch(e){setError(e instanceof Error?e.message:"Impossible de charger les produits.");setItems([]);}
  finally{setLoading(false);}
 },[]);
 useEffect(()=>{const params=new URLSearchParams(window.location.search);const initialQ=params.get("q")||"";setQ(initialQ);load(initialQ,"","");},[load]);
 function submit(e:FormEvent){e.preventDefault();load(q,country,type);}
 return <main className="catalogue-shell"><div className="container">
  <Link href="/" className="auth-back">← Retour à l’accueil</Link>
  <div className="catalogue-head"><div><span className="eyebrow">Le catalogue ELS</span><h1>Découvrez les produits.</h1><p>Parcourez les offres actives des boutiques de nos premiers marchés africains.</p></div><span className="dashboard-chip">{total} produit{total===1?"":"s"}</span></div>
  <form className="catalogue-filters" onSubmit={submit}><div className="catalogue-search"><Search size={17}/><input value={q} onChange={e=>setQ(e.target.value)} placeholder="Rechercher un produit..." aria-label="Rechercher un produit"/></div><select aria-label="Filtrer par pays" value={country} onChange={e=>setCountry(e.target.value)}><option value="">Tous les pays</option>{Object.entries(countryNames).map(([code,name])=><option key={code} value={code}>{name}</option>)}</select><select aria-label="Filtrer par type" value={type} onChange={e=>setType(e.target.value)}><option value="">Tous les types</option><option value="PHYSICAL">Produits physiques</option><option value="DIGITAL">Produits numériques</option></select><button className="button" type="submit"><SlidersHorizontal size={15}/> Filtrer</button></form>
  {error&&<div className="dashboard-status dashboard-error">{error}</div>}
  {loading?<div className="catalogue-empty">Chargement des produits…</div>:items.length===0?<div className="catalogue-empty"><h2>Aucun produit disponible pour le moment.</h2><p>Les nouvelles offres apparaîtront ici après la validation des boutiques et des produits.</p><Link className="button" href="/espace-vendeur">Ouvrir une boutique <ArrowRight size={15}/></Link></div>:
   <div className="product-grid">{items.map(product=><article className="product-card" key={product.id}><Link href={`/boutique/${product.store.slug}/${product.slug}`}><div className="product-image"><img src={product.imageUrls[0]||"https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&w=700&q=80"} alt={product.title} loading="lazy"/><span className="product-tag">{product.type==="DIGITAL"?"Numérique":"Physique"}</span></div><div className="product-info"><span className="product-category">{product.store.name}</span><h2 className="product-title">{product.title}</h2><div className="product-meta"><span className="product-price">{formatPrice(product.priceMinor,product.currency)}</span><span className="product-country">{countryNames[product.countryCode]||product.countryCode}</span></div>{product.store.isVerified&&<div className="product-rating">Boutique vérifiée</div>}</div></Link></article>)}</div>}
 </div></main>;
}
