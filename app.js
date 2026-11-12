const menu=document.querySelector('.menu-toggle'),nav=document.querySelector('.main-nav');
menu?.addEventListener('click',()=>{const open=nav.classList.toggle('open');menu.setAttribute('aria-expanded',open)});
document.querySelectorAll('.main-nav a').forEach(a=>a.addEventListener('click',()=>nav.classList.remove('open')));
const toast=document.getElementById('toast');
function showToast(msg,error=false){toast.textContent=msg;toast.classList.add('show');toast.classList.toggle('error',error);setTimeout(()=>toast.classList.remove('show'),4500)}
const formTypes={partnerForm:'parceria',volunteerForm:'voluntariado',academyForm:'academia',contactForm:'contacto'};
Object.entries(formTypes).forEach(([id,type])=>{
  const form=document.getElementById(id);
  if(!form)return;
  form.addEventListener('submit',async e=>{
    e.preventDefault();
    const button=form.querySelector('[type="submit"]');
    const original=button.textContent;
    button.disabled=true;button.textContent='A enviar...';
    const payload={};
    new FormData(form).forEach((value,key)=>payload[key]=value);
    form.querySelectorAll('input[type="checkbox"]').forEach((input,index)=>{
      if(input.name)payload[input.name]=input.checked?'sim':'';
      else if(type==='academia'&&index===0)payload.consent=input.checked?'sim':'';
    });
    try{
      const response=await fetch(`/api/submissions/${type}`,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(payload)});
      const result=await response.json();
      if(!response.ok)throw new Error(result.error||'Não foi possível enviar o formulário.');
      showToast('Obrigado! O seu registo foi recebido com sucesso.');
      form.reset();
    }catch(err){showToast(err.message+' Verifique a ligação e tente novamente.',true);}
    finally{button.disabled=false;button.textContent=original;}
  });
});


// Conteúdos publicados pela administração (anúncios, notícias, eventos e galeria).
(async function loadPublishedContent(){
  const host=document.getElementById('publishedContent');
  if(!host)return;
  const labels={anuncio:'Anúncio',noticia:'Notícia',evento:'Evento',galeria:'Galeria'};
  try{
    const response=await fetch('/api/content');
    if(!response.ok)return;
    const {items=[]}=await response.json();
    host.replaceChildren();
    if(items.length)document.getElementById('novidades').hidden=false;
    for(const item of items){
      const card=document.createElement('article');card.className='published-card';
      if(item.image_path){const img=document.createElement('img');img.src=item.image_path;img.alt=item.title;img.loading='lazy';card.append(img);}
      const copy=document.createElement('div');copy.className='published-copy';
      const label=document.createElement('span');label.className='published-label';label.textContent=labels[item.category]||'Publicação';copy.append(label);
      const title=document.createElement('h3');title.textContent=item.title;copy.append(title);
      if(item.body){const body=document.createElement('p');body.textContent=item.body;copy.append(body);}
      if(item.event_date){const date=document.createElement('time');date.textContent=new Date(item.event_date+'T00:00:00').toLocaleDateString('pt-PT');copy.append(date);}
      card.append(copy);host.append(card);
    }
  }catch(error){console.warn('Não foi possível carregar as publicações.',error);}
})();
