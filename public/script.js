// Frontend sem bibliotecas: todas as informações vêm da API Express.
const API = '/api';
const $ = id => document.getElementById(id);
const state = { usuario: null, agendamentos: [], espera: [], procedimentos: [], profissionais: [], filtro: 'todos' };
const msg = (text, auth = false) => { $(auth ? 'authMessage' : 'appMessage').textContent = text || ''; };
const escapeHTML = value => String(value ?? '').replace(/[&<>"']/g, ch => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[ch]));
const formData = id => Object.fromEntries(new FormData($(id)).entries());
const dateISO = value => String(value || '').slice(0, 10);
function formatDate(value) { const v = dateISO(value); if (!/^\d{4}-\d{2}-\d{2}$/.test(v)) return 'Data não informada'; const [y,m,d] = v.split('-'); return `${d}/${m}/${y}`; }
function dateParts(value) { const v = dateISO(value); if (!/^\d{4}-\d{2}-\d{2}$/.test(v)) return ['--','---']; const [y,m,d] = v.split('-'); return [d, ['JAN','FEV','MAR','ABR','MAI','JUN','JUL','AGO','SET','OUT','NOV','DEZ'][Number(m)-1]]; }
function isPast(a) { return dateISO(a.data) && dateISO(a.data) < new Date().toLocaleDateString('en-CA'); }
function isFinished(a) { return /realizad|conclu|finaliz|cancelad|faltou/i.test(a.status || '') || isPast(a); }
function isConfirmed(a) { return /confirmad/i.test(a.status || '') && !/aguardando|não confirmad/i.test(a.status || ''); }
function isPending(a) { return !isConfirmed(a) && !isFinished(a); }
function statusClass(a) { return isFinished(a) ? 'done' : isConfirmed(a) ? 'confirmed' : ''; }
function statusText(a) { return a.status || 'Status não informado'; }
function appointmentName(a) { return a.procedimento?.descricao || a.especialidade || 'Consulta'; }
function appointmentDoctor(a) { return a.profissional?.nome || 'Profissional não informado'; }
function appointmentPlace(a) { return [a.endereco,a.bairro,a.cidade].filter(Boolean).join(', ') || 'Local não informado'; }
function empty(text) { return `<div class="empty-state">${escapeHTML(text)}</div>`; }
function badge(a) { const [day,month] = dateParts(a.data); return `<div class="date-badge"><strong>${day}</strong><small>${month}</small></div>`; }
function appointmentRow(a, small=false) {
  return `<article class="${small?'small-appointment':'appointment-row'}">${badge(a)}<div class="appointment-name"><strong>${escapeHTML(appointmentName(a))}</strong><p>${escapeHTML(appointmentDoctor(a))}</p></div>${small ? '' : `<div class="appointment-location"><strong>${escapeHTML(formatDate(a.data))}</strong><p>${escapeHTML(appointmentPlace(a))}</p></div><span class="status ${statusClass(a)}">${escapeHTML(statusText(a))}</span><button class="row-details" data-detail="${Number(a.codigo)}">Ver detalhes</button>`}</article>`;
}
async function request(path, method='GET', data) {
  const opts = { method, headers: {'Content-Type':'application/json'} };
  if (data !== undefined) opts.body = JSON.stringify(data);
  let res; try { res = await fetch(API+path,opts); } catch { throw Error('Não foi possível conectar à API. Inicie o servidor na porta 3000.'); }
  const json = await res.json().catch(() => ({}));
  if (!res.ok) throw Error(json.mensagem || `Erro HTTP ${res.status}`);
  return json;
}
function navigate(page) {
  document.querySelectorAll('.page').forEach(el => el.hidden = el.id !== `page-${page}`);
  document.querySelectorAll('.nav-item').forEach(el => el.classList.toggle('active',el.dataset.page===page));
  $('appMessage').textContent = '';
  document.querySelector('.sidebar').classList.remove('open');
  window.scrollTo(0,0);
}
function setAuthMode(register) {
  $('formLogin').hidden=register; $('formCadastro').hidden=!register;
  $('authTitle').textContent=register?'Criar conta':'Entrar';
  $('authSubtitle').textContent=register?'Cadastre um CPF fictício para testar o portal.':'Use seu CPF e sua senha para acessar.';
  $('toggleAuth').textContent=register?'Já tem conta? Entrar':'Não tem conta? Cadastre-se';
  msg('',true);
}
let registerMode=false;
$('toggleAuth').addEventListener('click',()=>{registerMode=!registerMode;setAuthMode(registerMode)});
$('formLogin').addEventListener('submit',async e=>{
  e.preventDefault(); msg('',true);
  try { const result=await request('/usuarios/login','POST',formData('formLogin')); state.usuario=result.usuario; $('authScreen').hidden=true; $('appShell').hidden=false; $('sidebarUser').textContent='Paciente'; $('profileLogin').textContent=state.usuario.login; $('profileCode').textContent=state.usuario.codigo; navigate('inicio'); await reload(); }
  catch(err){msg(err.message,true)}
});
$('formCadastro').addEventListener('submit',async e=>{
  e.preventDefault(); try { const data=formData('formCadastro'); if(!/^\d{11}$/.test(data.login)) throw Error('Informe 11 números para o CPF de teste.'); const result=await request('/usuarios','POST',data); registerMode=false;setAuthMode(false); $('formLogin').elements.login.value=data.login; msg((result.mensagem||'Conta criada!')+' Agora faça login.',true); } catch(err){msg(err.message,true)}
});
$('logout').addEventListener('click',()=>{state.usuario=null;state.agendamentos=[];state.espera=[];$('appShell').hidden=true;$('authScreen').hidden=false;$('formLogin').reset();msg('',true)});
$('menuButton').addEventListener('click',()=>document.querySelector('.sidebar').classList.toggle('open'));
document.querySelectorAll('[data-page],[data-goto]').forEach(el=>el.addEventListener('click',()=>navigate(el.dataset.page||el.dataset.goto)));
document.querySelectorAll('[data-filter]').forEach(el=>el.addEventListener('click',()=>{state.filtro=el.dataset.filter;document.querySelectorAll('[data-filter]').forEach(b=>b.classList.toggle('active',b===el));renderAppointments()}));
function renderDashboard() {
  const upcoming=state.agendamentos.filter(a=>!isFinished(a)).sort((a,b)=>dateISO(a.data).localeCompare(dateISO(b.data)));
  const next=upcoming[0];
  $('greeting').textContent='Bem-vindo ao Saúde na Mão!';
  $('nextAppointment').innerHTML=next?`<span class="eyebrow">Próxima consulta</span><h2>${escapeHTML(appointmentName(next))}</h2><p>${escapeHTML(appointmentDoctor(next))}</p><div class="next-footer"><span>▦ ${escapeHTML(formatDate(next.data))}</span><span>⌖ ${escapeHTML(appointmentPlace(next))}</span></div><button class="light-btn" data-detail="${Number(next.codigo)}">Ver detalhes</button>`:`<span class="eyebrow">Próxima consulta</span><h2>Nenhuma consulta futura</h2><p>Seus próximos agendamentos aparecerão aqui.</p><button class="light-btn" data-goto="agendamentos">Ver agendamentos</button>`;
  $('otherAppointments').innerHTML=upcoming.slice(1,4).map(a=>appointmentRow(a,true)).join('')||empty('Nenhuma outra consulta agendada.');
  $('waitSummary').innerHTML=state.espera.length?state.espera.slice(0,3).map(e=>{const p=Math.max(0,Math.min(100,100-Number(e.nroOrdem||0)));return `<div class="wait-mini"><div class="wait-mini-head"><span>${escapeHTML(e.necessidade)}</span><strong>${escapeHTML(e.nroOrdem)}º na fila</strong></div><div class="progress"><div style="width:${p}%"></div></div></div>`}).join(''):empty('Nenhuma solicitação em espera.');
}
function renderAppointments(){let items=state.agendamentos.filter(a=>!isFinished(a));if(state.filtro==='confirmados')items=items.filter(isConfirmed);if(state.filtro==='aguardando')items=items.filter(isPending);items.sort((a,b)=>dateISO(a.data).localeCompare(dateISO(b.data)));$('appointmentList').innerHTML=items.map(a=>appointmentRow(a)).join('')||empty('Nenhum agendamento encontrado neste filtro.');}
function renderHistory(){const items=state.agendamentos.filter(isFinished).sort((a,b)=>dateISO(b.data).localeCompare(dateISO(a.data)));$('historyList').innerHTML=items.map(a=>appointmentRow(a)).join('')||empty('Nenhum registro anterior encontrado.');}
function renderWait(){ $('waitList').innerHTML=state.espera.length?state.espera.map(e=>`<article class="wait-row"><div><h3>${escapeHTML(e.necessidade)}</h3><p>Solicitado em ${escapeHTML(formatDate(e.dataSolicitacao))} · ${escapeHTML(e.situacao)}</p></div><div class="wait-position">${escapeHTML(e.nroOrdem)}º<small>posição informada</small></div></article>`).join(''):empty('Você não possui solicitações na lista de espera.'); }
function renderAll(){renderDashboard();renderAppointments();renderHistory();renderWait();}
async function reload(){if(!state.usuario)return;try{const [agendamentos,espera,procedimentos,profissionais]=await Promise.all([request('/agendamentos'),request('/lista-espera'),request('/procedimentos'),request('/profissionais')]);if(!state.usuario)return;state.agendamentos=agendamentos.filter(a=>Number(a.paciente?.codigo)===Number(state.usuario.codigo));state.espera=espera.filter(e=>Number(e.paciente?.codigo)===Number(state.usuario.codigo));state.procedimentos=procedimentos;state.profissionais=profissionais;fillSelect('procedimentoSelect',procedimentos,p=>p.descricao);fillSelect('profissionalSelect',profissionais,p=>`${p.nome} — ${p.especialidade||'Sem especialidade'}`);renderAll();}catch(err){msg(err.message)}}
function fillSelect(id,items,label){const el=$(id);el.replaceChildren(new Option('Selecione',''));items.forEach(item=>el.add(new Option(label(item),String(item.codigo))))}
function showDetails(code){const a=state.agendamentos.find(a=>Number(a.codigo)===Number(code));if(!a)return;const fields={'Procedimento':appointmentName(a),'Data':formatDate(a.data),'Profissional':appointmentDoctor(a),'Especialidade':a.especialidade,'Status':a.status,'Endereço':appointmentPlace(a),'CEP':a.CEP,'Observação':a.observacao||'Nenhuma'};$('detailContent').innerHTML=Object.entries(fields).map(([key,val])=>`<div class="detail-line"><strong>${escapeHTML(key)}</strong><span>${escapeHTML(val)}</span></div>`).join('');$('detailDialog').showModal()}
document.addEventListener('click',e=>{const target=e.target.closest('[data-detail],[data-goto]');if(!target)return;if(target.dataset.detail)showDetails(target.dataset.detail);else if(target.dataset.goto)navigate(target.dataset.goto)});
$('closeDialog').addEventListener('click',()=>$('detailDialog').close());$('closeDialogBottom').addEventListener('click',()=>$('detailDialog').close());
function bindForm(id,path,transform){$(id).addEventListener('submit',async e=>{e.preventDefault();try{const data=transform?transform(formData(id)):formData(id);const result=await request(path,'POST',data);$(id).reset();await reload();navigate(id==='formAgendamento'?'agendamentos':'teste');msg(result.mensagem||'Cadastro realizado com sucesso!')}catch(err){msg(err.message)}})}
bindForm('formProcedimento','/procedimentos');
bindForm('formProfissional','/profissionais');
bindForm('formEspera','/lista-espera',data=>({...data,codigoPaciente:state.usuario.codigo,nroOrdem:Number(data.nroOrdem)}));
bindForm('formAgendamento','/agendamentos',data=>({...data,codigoPaciente:state.usuario.codigo,codigoProcedimento:Number(data.codigoProcedimento),codigoProfissional:Number(data.codigoProfissional)}));
