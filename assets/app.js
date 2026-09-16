(()=>{
  'use strict';
  const script=document.currentScript;
  const root=new URL('../',script.src);
  const url=path=>new URL(path,root).href;
  const path=location.pathname.toLowerCase();
  const h1=document.querySelector('h1');
  const title=(h1?.textContent||document.title).trim();
  const isCompetition=path.includes('/competitie/');
  const isClubDirectory=path.includes('/cluburi/');
  const isList=/\/lista\.html$/i.test(path);
  const isClub=!isCompetition&&!isClubDirectory&&!isList&&document.querySelector('.category-block');
  const isDashboard=document.body.classList.contains('dashboard-page');
  const current=isCompetition?'competitie':isClubDirectory?'cluburi':isDashboard?'dashboard':'club';

  const header=document.createElement('header');
  header.className='app-header';
  header.innerHTML=`<a class="brand" href="${url('')}"><span class="brand-mark">MF</span><span class="brand-copy"><strong>Cupa Masaki</strong><small>Făgăraș</small></span></a><nav class="app-nav" aria-label="Navigare principală"><a href="${url('')}" ${current==='dashboard'?'aria-current="page"':''}>Dashboard</a><a href="${url('competitie/')}" ${current==='competitie'?'aria-current="page"':''}>Program</a><a href="${url('cluburi/')}" ${current==='cluburi'?'aria-current="page"':''}>Cluburi</a><a href="${url('bracketuri.pdf')}" target="_blank">Bracketuri</a></nav><button class="icon-button" type="button" data-theme aria-label="Schimbă tema">◐</button>`;
  document.body.prepend(header);document.body.classList.add('has-shell');
  const saved=localStorage.getItem('masaki-theme');if(saved==='dark')document.body.classList.add('dark-mode');
  header.querySelector('[data-theme]').addEventListener('click',()=>{document.body.classList.toggle('dark-mode');localStorage.setItem('masaki-theme',document.body.classList.contains('dark-mode')?'dark':'light')});
  if(isDashboard)return;
  if(h1)h1.classList.add('page-title');

  const plain=s=>(s||'').replace(/\s+/g,' ').trim();
  const addIntro=text=>{const p=document.createElement('p');p.className='page-intro';p.textContent=text;h1?.after(p);return p};
  const tools=(placeholder='Caută după cod, categorie sau sportiv…')=>{const bar=document.createElement('div');bar.className='page-tools';bar.innerHTML=`<label class="control"><span aria-hidden="true">⌕</span><input type="search" data-search placeholder="${placeholder}" aria-label="Căutare"></label><button class="btn btn-secondary" type="button" data-print>Tipărește</button>`;const anchor=document.querySelector('.page-intro')||h1;anchor?.after(bar);bar.querySelector('[data-print]').onclick=()=>print();return bar};
  const metrics=items=>{const box=document.createElement('div');box.className='metric-strip';box.innerHTML=items.map(([value,label])=>`<div class="metric"><strong>${value}</strong><span>${label}</span></div>`).join('');const anchor=document.querySelector('.page-tools')||document.querySelector('.page-intro');anchor?.after(box);return box};
  const filterNodes=(input,nodes)=>{const q=plain(input.value).toLocaleLowerCase('ro');let visible=0;nodes.forEach(node=>{const show=!q||plain(node.textContent).toLocaleLowerCase('ro').includes(q);node.classList.toggle('is-hidden',!show);if(show)visible++});return visible};

  if(isCompetition){
    document.body.classList.add('schedule-page');
    addIntro('Programul complet pe suprafețe. Folosește filtrul pentru o categorie, o probă sau un interval de vârstă; codul deschide direct bracketul.');
    const bar=tools('Ex: FKU, Kata, 8-9 ani…');
    const select=document.createElement('label');select.className='control';select.innerHTML='<span class="control-label">Suprafață</span><select data-tatami><option value="">Toate</option><option value="Tatami 1">Tatami 1</option><option value="Tatami 2">Tatami 2</option><option value="Tatami 3">Tatami 3</option><option value="Tatami 4">Tatami 4</option></select>';bar.insertBefore(select,bar.lastElementChild);
    const columns=[...document.querySelectorAll('.column')],rows=[...document.querySelectorAll('.column tr')].filter(r=>r.querySelector('.code'));
    const entries=rows.reduce((sum,row)=>{
      const count=Number(row.children[2]?.textContent)||0;
      const code=plain(row.querySelector('.code')?.textContent);
      return sum+count*(code.includes('KATTEAM')?3:1);
    },0);
    metrics([[rows.length,'categorii programate'],[entries,'intrări în bracketuri'],[columns.length,'suprafețe'],['13:00','pauza de masă']]);
    const apply=()=>{const q=bar.querySelector('[data-search]').value.toLocaleLowerCase('ro'),tatami=bar.querySelector('[data-tatami]').value;columns.forEach(col=>{const colName=plain(col.querySelector('h2')?.textContent).replace(' — Traseu','');let shown=0;col.querySelectorAll('tr').forEach(row=>{if(!row.querySelector('.code'))return;const ok=(!q||plain(row.textContent).toLocaleLowerCase('ro').includes(q))&&(!tatami||colName===tatami);row.classList.toggle('is-hidden',!ok);if(ok)shown++});col.classList.toggle('is-hidden',!!tatami&&colName!==tatami||!!q&&!shown)})};
    bar.querySelector('[data-search]').addEventListener('input',apply);bar.querySelector('[data-tatami]').addEventListener('change',apply);
  }else if(isClub){
    document.body.classList.add('club-page');
    const club=title.replace(/^(?:Timetable|Program)\s*[—-]\s*/i,'');
    addIntro(`Program personalizat pentru ${club}. Categoriile sunt ordonate cronologic și includ suprafața, bracketul și culoarea primului meci.`);
    const bar=tools('Caută sportiv sau categorie…');
    const listLink=document.createElement('a');listLink.className='btn btn-primary';listLink.href='lista.html';listLink.textContent='Lista clubului';bar.appendChild(listLink);
    const blocks=[...document.querySelectorAll('.category-block')],athletes=new Set();blocks.forEach(b=>b.querySelectorAll('tbody td:first-child, tr td:first-child').forEach(td=>{const n=plain(td.textContent);if(n&&n!=='Sportiv / echipă')athletes.add(n)}));
    metrics([[blocks.length,'categorii'],[athletes.size,'sportivi / echipe'],[new Set(blocks.map(b=>(plain(b.querySelector('.category-title')?.textContent).match(/Tatami\s+\d/)||[])[0]).filter(Boolean)).size,'suprafețe'],['PDF','bracketuri conectate']]);
    bar.querySelector('[data-search]').addEventListener('input',e=>filterNodes(e.target,blocks));
  }else if(isList){
    document.body.classList.add('club-list-page');
    const club=title.replace(/^Lista\s*[—-]\s*/i,'');
    addIntro(`Sportivii și înscrierile pentru ${club}. Poți comuta între sportivi și categorii sau căuta direct un nume.`);
    const bar=tools('Caută sportiv, categorie sau cod…');
    const schedule=document.createElement('a');schedule.className='btn btn-primary';schedule.href='./';schedule.textContent='Programul clubului';bar.appendChild(schedule);
    const tables=[...document.querySelectorAll('table')];tables.forEach(t=>{if(!t.parentElement.classList.contains('table-wrap')){const w=document.createElement('div');w.className='table-wrap';t.parentNode.insertBefore(w,t);w.appendChild(t)}});
    const rows=[...document.querySelectorAll('table tr')].filter(r=>r.querySelector('td'));
    metrics([[new Set(rows.map(r=>plain(r.cells?.[0]?.textContent))).size,'înregistrări'],[rows.length,'rânduri în liste'],[document.querySelectorAll('a[href*="bracketuri.pdf"]').length,'legături bracket'],['2','moduri de vizualizare']]);
    bar.querySelector('[data-search]').addEventListener('input',e=>filterNodes(e.target,rows));
  }else if(isClubDirectory){
    document.body.classList.add('clubs-page');
    addIntro('Alege clubul pentru programul personalizat și lista completă a înscrierilor.');tools('Caută un club…');
    const list=document.querySelector('ul');if(list)list.classList.add('club-grid');const items=[...document.querySelectorAll('li')];
    metrics([[Math.max(0,items.length-1),'cluburi participante'],['146','sportivi individuali'],['18','echipe kata'],['81','bracketuri']]);
    document.querySelector('[data-search]').addEventListener('input',e=>filterNodes(e.target,items));
  }
})();
