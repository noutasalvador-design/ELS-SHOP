const login=document.getElementById("login"), register=document.getElementById("register");
async function send(form,url){
  const msg=document.getElementById("msg"); msg.textContent="Traitement...";
  const data=Object.fromEntries(new FormData(form).entries());
  try{const r=await fetch(url,{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify(data)});const j=await r.json();
    if(!r.ok)throw new Error(j.error); msg.textContent=j.message||"OK";msg.className="msg success";
    if(url.includes("login")) setTimeout(()=>location.href=j.user.role==="admin"?"/admin.html":"/candidat.html",400);
    else setTimeout(()=>location.href="/connexion.html",600);
  }catch(e){msg.textContent=e.message;msg.className="msg error";}
}
if(login)login.addEventListener("submit",e=>{e.preventDefault();send(login,"/api/auth/login")});
if(register)register.addEventListener("submit",e=>{e.preventDefault();send(register,"/api/auth/register")});