/* DeutschFlow cloud sync: publishable browser key + Supabase Auth / RLS.
   No service-role or database secrets belong in this frontend. */
const CLOUD_URL="https://emrbvdnvobosgcqpdwua.supabase.co";
const CLOUD_PUBLISHABLE_KEY="sb_publishable_9VTKnv-Vk-noMpvfqax7Qw_9Av1NlAq";
let cloudClient=null, cloudUser=null, cloudBusy=false, cloudTimer=null, cloudLastError="", cloudLastSync="", cloudReady=false, cloudChanged=false, syncing=false;
const CLOUD_DEVICE_KEY="deutschflow_bound_user_v1";
function cloudStatus(){return !cloudClient?"Thư viện Supabase chưa tải":!cloudUser?"Chưa đăng nhập — chỉ lưu trên thiết bị":cloudBusy?"Đang đồng bộ...":cloudLastError?"Lỗi: "+cloudLastError:cloudLastSync?"Đã đồng bộ "+new Date(cloudLastSync).toLocaleTimeString("vi-VN"):"Đã đăng nhập — chờ đồng bộ";}
function refreshCloudLabel(){const badge=document.getElementById("saved");if(badge)badge.textContent=cloudStatus();const elem=document.getElementById("cloud_status");if(elem)elem.textContent=cloudStatus();}
function authPanel(){return '<div class="card"><h2>Đăng nhập và đồng bộ Supabase</h2><p class="muted">Đăng nhập cùng một email trên điện thoại và máy tính. Mỗi tài khoản chỉ đọc/ghi dữ liệu của chính mình nhờ Row Level Security.</p><p class="info" id="cloud_status">'+esc(cloudStatus())+'</p>'+(cloudUser?'<p>Đang đăng nhập: <b>'+esc(cloudUser.email||"Tài khoản Supabase")+'</b></p><div class="row"><button class="btn" onclick="syncNow()">Đồng bộ ngay</button><button class="btn ghost" onclick="signOutCloud()">Đăng xuất</button></div>':'<label for="cloud_email">Email đăng nhập</label><input id="cloud_email" type="email" placeholder="you@example.com" autocomplete="email"><div class="row" style="margin-top:12px"><button class="btn" onclick="sendMagicLink()">Gửi link đăng nhập tới email</button></div><p class="muted tiny">Mở link trong email trên thiết bị đang đăng nhập. Nếu chuyển sang thiết bị khác, đăng nhập lại bằng cùng email.</p>')+'</div>';}
const priorSettings=settings;
settings=function(){return authPanel()+priorSettings();};
function notifyCloud(msg){cloudLastError=msg||"";refreshCloudLabel();const elem=document.getElementById("cloud_status");if(elem)elem.textContent=cloudStatus();}
async function sendMagicLink(){const input=document.getElementById("cloud_email");const email=input?.value?.trim();if(!email||!email.includes("@")){alert("Nhập email hợp lệ.");return;}if(!cloudClient){alert("Chưa tải thư viện Supabase.");return;}const {error}=await cloudClient.auth.signInWithOtp({email,options:{emailRedirectTo:location.origin+location.pathname,shouldCreateUser:true}});if(error){notifyCloud(error.message);alert("Không gửi được email: "+error.message);}else{alert("Đã yêu cầu gửi email đăng nhập. Kiểm tra Inbox và Spam.");}}
async function signOutCloud(){if(!cloudClient)return;try{await syncNow();const {error}=await cloudClient.auth.signOut();if(error)throw error;}catch(e){if(!confirm("Có lỗi khi đồng bộ/đăng xuất: "+e.message+". Vẫn đăng xuất?"))return;await cloudClient.auth.signOut();}cloudUser=null;state=JSON.parse(JSON.stringify(defaults));localStorage.removeItem(CLOUD_DEVICE_KEY);localStorage.setItem(KEY,JSON.stringify(state));cloudReady=false;render();refreshCloudLabel();}
function freshState(){return JSON.parse(JSON.stringify(defaults));}
function mergeState(a,b,preferB){a=a||{};b=b||{};const out=freshState();for(const name of ["done","results","daily"]){out[name]={...(a[name]||{}),...(b[name]||{})};}
out.done=Object.fromEntries(Object.keys({...a.done,...b.done}).map(k=>[k,Boolean(a.done?.[k]||b.done?.[k])]));
out.daily={...(a.daily||{})};for(const [k,val] of Object.entries(b.daily||{}))out.daily[k]=Math.max(Number(out.daily[k]||0),Number(val||0));
for(const name of ["misses","notes","vocab"]){out[name]={...(preferB?(a[name]||{}):(b[name]||{})),...(preferB?(b[name]||{}):(a[name]||{}))};}
out.currentUnit=preferB?(b.currentUnit||a.currentUnit||defaults.currentUnit):(a.currentUnit||b.currentUnit||defaults.currentUnit);
return out;}
async function cloudRead(){const {data,error}=await cloudClient.from("learning_progress").select("payload,updated_at").eq("user_id",cloudUser.id).maybeSingle();if(error)throw error;return data;}
async function cloudWrite(payload){const {error}=await cloudClient.from("learning_progress").upsert({user_id:cloudUser.id,payload,updated_at:new Date().toISOString()},{onConflict:"user_id"});if(error)throw error;}
function boundStateKey(uid){return "deutschflow_user_v1_"+uid;}
async function attachCloudUser(user){if(!user?.id){cloudUser=null;cloudReady=false;refreshCloudLabel();return;}if(cloudUser?.id===user.id&&cloudReady)return;
cloudBusy=true;cloudUser=user;cloudReady=false;refreshCloudLabel();
try{
 const priorId=localStorage.getItem(CLOUD_DEVICE_KEY);
 const scoped=localStorage.getItem(boundStateKey(user.id));
 const legacy=priorId===null?state:freshState();
 state=scoped?Object.assign(freshState(),JSON.parse(scoped)):legacy;
 const remote=await cloudRead();
 const localTs=Number(localStorage.getItem("deutschflow_user_updated_"+user.id)||0);
 const remoteTs=remote?.updated_at?new Date(remote.updated_at).getTime():0;
 state=mergeState(remote?.payload||freshState(),state,localTs>=remoteTs);
 cloudReady=true;
 localStorage.setItem(CLOUD_DEVICE_KEY,user.id);
 localStorage.setItem(KEY,JSON.stringify(state));
 localStorage.setItem(boundStateKey(user.id),JSON.stringify(state));
 await cloudWrite(state);
 cloudLastSync=new Date().toISOString();cloudLastError="";
}catch(e){cloudReady=false;cloudLastError=e.message;console.warn("DeutschFlow sync init:",e);}
finally{cloudBusy=false;render();refreshCloudLabel();}
}
function scheduleCloudSave(){if(!cloudUser||!cloudReady)return;localStorage.setItem(boundStateKey(cloudUser.id),JSON.stringify(state));localStorage.setItem("deutschflow_user_updated_"+cloudUser.id,String(Date.now()));cloudChanged=true;if(cloudTimer)clearTimeout(cloudTimer);cloudTimer=setTimeout(()=>syncNow(),900);}
async function syncNow(){if(!cloudClient||!cloudUser||!cloudReady||cloudBusy)return;cloudBusy=true;refreshCloudLabel();
try{const remote=await cloudRead();const localTs=Number(localStorage.getItem("deutschflow_user_updated_"+cloudUser.id)||0);const remoteTs=remote?.updated_at?new Date(remote.updated_at).getTime():0;
state=mergeState(remote?.payload||freshState(),state,localTs>=remoteTs);
localStorage.setItem(KEY,JSON.stringify(state));localStorage.setItem(boundStateKey(cloudUser.id),JSON.stringify(state));
await cloudWrite(state);localStorage.setItem("deutschflow_user_updated_"+cloudUser.id,String(Date.now()));
cloudLastSync=new Date().toISOString();cloudLastError="";cloudChanged=false;render();
}catch(e){cloudLastError=e.message;console.warn("DeutschFlow cloud sync:",e);}
finally{cloudBusy=false;refreshCloudLabel();}}
async function initCloud(){
if(!window.supabase?.createClient){notifyCloud("Không tải được thư viện Supabase. Kiểm tra mạng.");return;}
try{cloudClient=window.supabase.createClient(CLOUD_URL,CLOUD_PUBLISHABLE_KEY,{auth:{persistSession:true,autoRefreshToken:true,detectSessionInUrl:true}});
cloudClient.auth.onAuthStateChange((event,session)=>{if(event==="SIGNED_IN"||event==="INITIAL_SESSION"){setTimeout(()=>attachCloudUser(session?.user||null),0);}else if(event==="SIGNED_OUT"){setTimeout(()=>{cloudUser=null;cloudReady=false;refreshCloudLabel();render();},0);}});
const {data,error}=await cloudClient.auth.getUser();if(error&&error.name!=="AuthSessionMissingError")throw error;
if(data?.user)await attachCloudUser(data.user);else refreshCloudLabel();
document.addEventListener("visibilitychange",()=>{if(!document.hidden&&cloudUser&&cloudReady)syncNow();});
setInterval(()=>{if(cloudUser&&cloudReady&&!document.hidden)syncNow();},60000);
}catch(e){notifyCloud(e.message);}
}
initCloud();