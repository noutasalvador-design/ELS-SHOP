import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, BadgeCheck, Globe2, ShieldCheck } from "lucide-react";
import { prisma } from "@/lib/prisma";

type PageProps={params:Promise<{storeSlug:string;productSlug:string}>};
async function getProduct(storeSlug:string,productSlug:string){
  return prisma.product.findFirst({
    where:{slug:productSlug,status:"ACTIVE",store:{is:{slug:storeSlug,isActive:true,isVerified:true}}},
    select:{title:true,description:true,type:true,priceMinor:true,currency:true,countryCode:true,imageUrls:true,stockQuantity:true,store:{select:{name:true,slug:true,countryCode:true,isVerified:true}}}
  });
}
function price(amount:number,currency:string){try{return new Intl.NumberFormat("fr-FR",{style:"currency",currency,maximumFractionDigits:0}).format(amount);}catch{return amount.toLocaleString("fr-FR")+" "+currency;}}
export async function generateMetadata({params}:PageProps):Promise<Metadata>{
 const {storeSlug,productSlug}=await params;
 try{const product=await getProduct(storeSlug,productSlug);if(!product)return {title:"Produit introuvable"};return {title:product.title,description:product.description.slice(0,155),openGraph:{title:product.title,description:product.description.slice(0,155),type:"website"}};}catch{return {title:"Produit | ELS SHOP MARKETPLACE"};}
}
export default async function ProductPage({params}:PageProps){
 const {storeSlug,productSlug}=await params;
 let product: Awaited<ReturnType<typeof getProduct>>;
 try{product=await getProduct(storeSlug,productSlug);}catch{notFound();}
 if(!product)notFound();
 return <main className="catalogue-shell"><div className="container"><Link href="/catalogue" className="auth-back"><ArrowLeft size={15}/> Retour au catalogue</Link>
 <div className="detail-grid"><div className="detail-image">{product.imageUrls[0]?<img src={product.imageUrls[0]} alt={product.title}/>:<div className="detail-placeholder">ELS SHOP</div>}</div>
 <section className="detail-copy"><span className="eyebrow">{product.type==="DIGITAL"?"Produit numérique":"Produit physique"}</span><h1>{product.title}</h1><p className="detail-price">{price(product.priceMinor,product.currency)}</p><p className="detail-description">{product.description}</p><div className="detail-store"><span className="trust-icon"><Globe2 size={18}/></span><div><strong>{product.store.name}</strong><small>{product.store.countryCode} · Boutique vérifiée</small></div>{product.store.isVerified&&<BadgeCheck size={18} color="#34794f"/>}</div>
 {product.type==="PHYSICAL"&&<p className="detail-stock">{product.stockQuantity&&product.stockQuantity>0?"Disponible en stock":"Stock non disponible"}</p>}
 <div className="dashboard-status">Le paiement et la commande en ligne seront activés après la finalisation et les tests du parcours de paiement sécurisé.</div><button className="button" disabled style={{opacity:.65,cursor:"not-allowed"}}>Achat en ligne en préparation</button><div className="detail-security"><ShieldCheck size={16}/> Les paiements réels ne sont pas activés dans cette version.</div>
 </section></div></div></main>;
}
