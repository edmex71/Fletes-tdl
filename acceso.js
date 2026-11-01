// Acceso con usuario, contraseña y fecha de vencimiento (Supabase, proyecto flete-tdl).
// Nota: es una compuerta del lado del navegador; frena a curiosos, no es seguridad bancaria.
(function(){
  var URL_SB='https://mqwjkshosxzkiqhrvasn.supabase.co';
  var KEY_SB='sb_publishable_mM79u2QLOiIIDiDAaJEl-Q_xyPTov2z';
  var MEM={};['tdl_admin','tdl_token','tdl_vence','tdl_expira'].forEach(function(k){try{localStorage.removeItem(k)}catch(e){}});
  function ls(k,v){if(k.indexOf('tdl_')===0){if(v===undefined)return MEM[k]||null;if(v===null)delete MEM[k];else MEM[k]=v;return}try{if(v===undefined)return localStorage.getItem(k);if(v===null)localStorage.removeItem(k);else localStorage.setItem(k,v)}catch(e){return null}}
  async function rpc(fn,args){
    var r=await fetch(URL_SB+'/rest/v1/rpc/'+fn,{method:'POST',headers:{'apikey':KEY_SB,'Authorization':'Bearer '+KEY_SB,'Content-Type':'application/json'},body:JSON.stringify(args)});
    if(!r.ok)throw new Error('http '+r.status);
    return r.json();
  }
  function fechaTxt(iso){return new Date(iso).toLocaleString('es-MX',{dateStyle:'medium',timeStyle:'short'})}
  var estilo=document.createElement('style');
  estilo.textContent='#acc_gate{position:fixed;inset:0;z-index:99999;background:#12263a url(fondo.jpg) center/cover no-repeat;display:flex;align-items:flex-start;justify-content:flex-start;padding:10px}'+
  '#acc_gate .caja,#acc_adm .caja{background:rgba(255,255,255,.93);border-radius:10px;padding:20px;width:100%;max-width:360px;box-sizing:border-box;max-height:90vh;overflow:auto}'+
  '#acc_gate input,#acc_adm input{width:100%;box-sizing:border-box;margin:4px 0 10px;padding:8px;font-size:16px}'+
  '#acc_gate button,#acc_adm button.p{width:100%;padding:10px;font-size:16px}'+
  '#acc_msg{color:#b00020;min-height:20px;font-size:14px}'+
  '#acc_adm{position:fixed;inset:0;z-index:99998;background:rgba(0,0,0,.6);display:none;align-items:center;justify-content:center;padding:16px}'+
  '#acc_adm .caja{max-width:440px}#acc_adm table{width:100%;font-size:13px;border-collapse:collapse}#acc_adm td{padding:4px;border-bottom:1px solid #ddd}'+
  '#acc_gate .caja{max-width:230px;padding:10px;font-size:14px}#acc_gate h2{font-size:16px;margin:0 0 4px}#acc_gate label{font-size:13px}#acc_gate input{padding:5px;margin:2px 0 6px}#acc_gate button{padding:7px;font-size:15px}#acc_msg{min-height:16px;font-size:13px}';
  document.head.appendChild(estilo);
  var gate=document.createElement('div');gate.id='acc_gate';
  gate.innerHTML='<div class="caja"><h2 style="margin:0 0 10px">Flete TDL</h2><label>Usuario</label><input id="acc_u" autocapitalize="none" autocomplete="username"><label>Contraseña</label><input id="acc_p" type="password" autocomplete="current-password"><div id="acc_msg"></div><button id="acc_ok" type="button">Entrar</button></div>';
  document.documentElement.appendChild(gate);
  var modoAdmin=false;
  function msg(t){document.getElementById('acc_msg').textContent=t||''}
  function abrir(){gate.style.display='none'}
  function cerrar(){gate.style.display='flex'}
  async function entrar(){
    msg('');var u=document.getElementById('acc_u').value.trim(),p=document.getElementById('acc_p').value;
    if(!p||!u){msg('Escribe usuario y contraseña');return}
    try{
      if(u.toLowerCase()==='edmex71'){
        var cl=u.toLowerCase()+':'+p,l=await rpc('admin_listar',{p_admin:cl});
        if(!l.ok){msg('Usuario o contraseña incorrectos');return}
        ls('tdl_admin',cl);ls('tdl_token',null);abrir();prepararAdmin();return;
      }
      var r=await rpc('login',{p_usuario:u,p_clave:p});
      if(!r.ok){msg(r.error);return}
      ls('tdl_token',r.token);ls('tdl_vence',r.vence);ls('tdl_expira',r.expira);abrir();avisoVence(r.vence);
    }catch(e){msg('Sin conexión. Intenta de nuevo')}
  }
  document.getElementById('acc_ok').onclick=entrar;
  gate.addEventListener('keydown',function(e){if(e.key==='Enter')entrar()});
  function avisoVence(v){
    var d=document.getElementById('acc_aviso');if(!d){d=document.createElement('div');d.id='acc_aviso';d.style.cssText='font-size:12px;text-align:center;background:#fff3cd;padding:4px';document.body.insertBefore(d,document.body.firstChild)}
    d.textContent='Acceso de prueba hasta '+fechaTxt(v);
  }
  async function revisar(){
    var adm=ls('tdl_admin');
    if(adm){try{var l=await rpc('admin_listar',{p_admin:adm});if(l.ok){abrir();prepararAdmin();return}ls('tdl_admin',null)}catch(e){abrir();prepararAdmin();return}}
    var t=ls('tdl_token');
    if(!t){cerrar();return}
    try{
      var r=await rpc('validar',{p_token:t});
      if(r.ok){abrir();avisoVence(r.vence);ls('tdl_vence',r.vence)}
      else{ls('tdl_token',null);cerrar();msg('Tu acceso venció o fue desactivado')}
    }catch(e){
      var v=ls('tdl_vence'),x=ls('tdl_expira');
      if(v&&x&&new Date(v)>new Date()&&new Date(x)>new Date()){abrir();avisoVence(v)}else cerrar();
    }
  }
  // ---- Panel de administrador ----
  var panel=null;
  function prepararAdmin(){
    var ba=document.getElementById('btn_actualizar');if(ba)ba.style.display='inline-block';
    if(document.getElementById('btn_acc'))return;
    var b=document.createElement('button');b.id='btn_acc';b.type='button';b.textContent='👤 Accesos';
    b.style.cssText='font-size:12px;padding:2px 8px;margin-left:6px;width:auto;display:inline-block';
    b.onclick=abrirPanel;var h=document.querySelector('h1');if(h)h.appendChild(b);
  }
  async function listar(){
    var l=await rpc('admin_listar',{p_admin:ls('tdl_admin')});var box=document.getElementById('acc_lista');
    if(!l.ok){box.textContent=l.error;return}
    var h='<table>';
    l.accesos.forEach(function(a){
      var venc=new Date(a.vence)<new Date(),est=!a.activo?'desactivado':venc?'vencido':'activo';
      h+='<tr><td><b>'+a.usuario.replace(/</g,'&lt;')+'</b><br>'+(a.nota||'').replace(/</g,'&lt;')+'<br>'+est+' · vence '+fechaTxt(a.vence)+'<br>Entradas: '+(a.entradas||0)+' · Última: '+(a.ultimo_acceso?fechaTxt(a.ultimo_acceso):'nunca')+'</td><td>'+(a.activo?'<button type="button" data-off="'+a.usuario.replace(/"/g,'')+'" style="width:auto">Quitar</button>':'')+'</td></tr>';
    });
    box.innerHTML=h+'</table>';
    box.querySelectorAll('[data-off]').forEach(function(x){x.onclick=async function(){if(confirm('¿Quitar acceso a '+x.dataset.off+'?')){await rpc('admin_desactivar',{p_admin:ls('tdl_admin'),p_usuario:x.dataset.off});listar()}}});
  }
  function abrirPanel(){
    if(!panel){
      panel=document.createElement('div');panel.id='acc_adm';
      var man=new Date(Date.now()+7*864e5).toISOString().slice(0,10);
      panel.innerHTML='<div class="caja"><h3 style="margin:0 0 8px">Accesos de prueba</h3>'+
      '<label>Usuario</label><input id="aa_u" autocapitalize="none"><label>Contraseña (déjala vacía para solo cambiar la fecha)</label><input id="aa_p">'+
      '<label>Puede entrar hasta (fin de ese día)</label><input id="aa_f" type="date" value="'+man+'"><label>Nota (opcional)</label><input id="aa_n">'+
      '<div id="aa_msg" style="min-height:18px;font-size:14px"></div><button class="p" type="button" id="aa_g">Guardar acceso</button>'+
      '<div id="acc_lista" style="margin-top:12px"></div><button type="button" class="p" id="aa_c" style="margin-top:10px;background:#888">Cerrar</button></div>';
      document.body.appendChild(panel);
      document.getElementById('aa_c').onclick=function(){panel.style.display='none'};
      document.getElementById('aa_g').onclick=async function(){
        var u=document.getElementById('aa_u').value.trim(),p=document.getElementById('aa_p').value,f=document.getElementById('aa_f').value,n=document.getElementById('aa_n').value;
        var m=document.getElementById('aa_msg');if(!u||!f){m.textContent='Falta usuario o fecha';return}
        var vence=new Date(f+'T23:59:59').toISOString();
        var r=await rpc('admin_guardar',{p_admin:ls('tdl_admin'),p_usuario:u,p_clave:p,p_vence:vence,p_nota:n||null});
        m.textContent=r.ok?'Guardado':r.error;if(r.ok){document.getElementById('aa_p').value='';listar()}
      };
    }
    panel.style.display='flex';listar();
  }
  revisar();setInterval(function(){if(!ls('tdl_admin'))revisar()},600000);
})();
