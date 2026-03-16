document.addEventListener("DOMContentLoaded", () => {

window.closeTodo = function(){
  document.getElementById("todoWidget").style.display="none";
}

  window.closeTodo = function(){
  document.getElementById("todoWidget").style.display="none";
}

////////////////////////////
// FOLDERS
////////////////////////////

function ordenarCarpetas(){
  const carpetas=[...document.querySelectorAll(".folder")];
  let x=30,y=80;
  const alto=110,ancho=110;
  const limite=window.innerHeight-150;

  carpetas.forEach(f=>{
    f.style.left=x+"px";
    f.style.top=y+"px";
    y+=alto;
    if(y>limite){y=80;x+=ancho;}
  });
}
ordenarCarpetas();
window.addEventListener("resize",ordenarCarpetas);

document.querySelectorAll(".folder").forEach(f=>{
  f.addEventListener("dblclick", ()=>{
    const id = f.dataset.open;
    if(id) openWin(id);
  });
});

////////////////////////////
// WINDOWS
////////////////////////////

let z=10;

window.openWin = function(id){

  const win = document.getElementById(id);
  if(!win) return;

  win.style.display = "block";
  win.style.zIndex = ++z;

  requestAnimationFrame(()=>{

    const w = win.offsetWidth;
    const h = win.offsetHeight;

    win.style.left = (window.innerWidth/2 - w/2) + "px";
    win.style.top  = (window.innerHeight/2 - h/2) + "px";

  });

  addToTaskbar(id);

  document.getElementById("blur-layer").classList.add("active");

}

window.closeWin = function(id){
  document.getElementById(id).style.display="none";
  removeFromTaskbar(id);

  const algunaAbierta=[...document.querySelectorAll(".window")]
    .some(w=>w.style.display==="block");

  document.getElementById("blur-layer")
    .classList.toggle("active",algunaAbierta);
}

  function addToTaskbar(id){
  if(document.querySelector(`.task-item[data-id="${id}"]`)) return;

  const task=document.createElement("div");
  task.className="task-item active";
  task.dataset.id=id;

  const title=document.querySelector(`#${id} .titlebar`).childNodes[0].textContent.trim();
  task.textContent=title;

  task.onclick=()=>{
    const win=document.getElementById(id);

    if(win.style.display==="block"){
      win.style.display="none";
      task.classList.remove("active");
    }else{
      win.style.display="block";
      win.style.zIndex=++z;
      task.classList.add("active");
    }
  };

  document.getElementById("taskApps").appendChild(task);
}

function removeFromTaskbar(id){
  const task=document.querySelector(`.task-item[data-id="${id}"]`);
  if(task) task.remove();
}

function makeDraggable(win){
  const bar = win.querySelector(".titlebar");
  let offsetX = 0;
  let offsetY = 0;
  let dragging = false;

  bar.addEventListener("mousedown", e => {
    dragging = true;

    offsetX = e.clientX - win.offsetLeft;
    offsetY = e.clientY - win.offsetTop;

    win.style.zIndex = ++z;
  });

  document.addEventListener("mousemove", e => {
    if(!dragging) return;

    win.style.left = (e.clientX - offsetX) + "px";
    win.style.top  = (e.clientY - offsetY) + "px";
  });

  document.addEventListener("mouseup", () => {
    dragging = false;
  });
}

// activar drag en todas las ventanas
document.querySelectorAll(".window").forEach(makeDraggable);
 
////////////////////////////
// PLAYER PRO VISUALIZER
////////////////////////////

const tracks = [
  {name:"Justin Bieber - Confidence",src:"song.mp3"},
  {name:"Yapi - ¿Dónde te escondes?",src:"song2.mp3"}
];

const audio = document.getElementById("audio");
const play = document.getElementById("play");
const bar = document.getElementById("bar");
const waveBars = document.querySelectorAll(".wave-bar");

let current = 0;
let audioContext, analyser, source, dataArray;

function loadTrack(i){
  current = i;
  audio.src = tracks[i].src;
  bar.style.width = "0%";
}

loadTrack(0);

// 🔊 Setup audio analyser
function setupAudio(){
  audioContext = new (window.AudioContext || window.webkitAudioContext)();
  analyser = audioContext.createAnalyser();
  source = audioContext.createMediaElementSource(audio);

  source.connect(analyser);
  analyser.connect(audioContext.destination);

  analyser.fftSize = 64;
  const bufferLength = analyser.frequencyBinCount;
  dataArray = new Uint8Array(bufferLength);

  animateWave();
}

play.onclick = async () => {

  if(!audioContext) setupAudio();

  if(audioContext.state === "suspended"){
    await audioContext.resume();
  }

  if(audio.paused){
    audio.play();
    play.textContent = "⏸";
  }else{
    audio.pause();
    play.textContent = "▶";
  }
};

audio.ontimeupdate = () => {
  if(audio.duration){
    bar.style.width = (audio.currentTime / audio.duration * 100) + "%";
  }
};

audio.onended = () => {
  current = (current + 1) % tracks.length;
  loadTrack(current);
  audio.play();
};

// 🎵 Real visualizer
function animateWave(){
  requestAnimationFrame(animateWave);

  analyser.getByteFrequencyData(dataArray);

  waveBars.forEach((barEl, i) => {
    const value = dataArray[i * 2];
    const height = Math.max(4, value / 6);
    barEl.style.height = height + "px";
    barEl.style.opacity = value > 40 ? 1 : 0.4;
  });
}

 let zoomLevel = 1;

function openViewer(src){

  const viewer = document.getElementById("imageViewer");
  const img = document.getElementById("viewerImg");

  zoomLevel = 1;
  img.style.transform = "scale(1)";
  img.src = src;

  viewer.style.display = "flex";

}

function closeViewer(e){

  if(e && e.target.id !== "imageViewer" && !e.target.classList.contains("viewer-close")) return;

  document.getElementById("imageViewer").style.display = "none";

}
  const viewerImg = document.getElementById("viewerImg");

viewerImg.addEventListener("wheel", function(e){

  e.preventDefault();

  if(e.deltaY < 0){
    zoomLevel += 0.1;
  }else{
    zoomLevel -= 0.1;
  }

  zoomLevel = Math.max(0.5, Math.min(3, zoomLevel));

  viewerImg.style.transform = "scale(" + zoomLevel + ")";

});

////////////////////////////
// CHAT
////////////////////////////

const chats={
  Chris:{
    photo:"https://i.ibb.co/CKXkQQnS/dice2.png",
    bg:"https://i.postimg.cc/pTKxwzsN/giphy.gif",
    status:"online",
    msgs:["Hola 👋","El space está en mantenimiento"]
  },
  Taiga:{
    photo:"https://i.ibb.co/Kzc35TgL/41-2.png",
    bg:"https://i.postimg.cc/NfDGG8Bs/giphy-(2).gif",
    status:"away",
    msgs:["Eres cotilla 😅"]
  }
};

const friends=document.getElementById("friends");
const chatBox=document.getElementById("chatBox");
const header=document.getElementById("chatHeader");

Object.keys(chats).forEach(name=>{
  const f=document.createElement("div");
  f.className="friend";
  f.innerHTML=`<img src="${chats[name].photo}">${name}`;
  f.onclick=()=>loadChat(name);
  friends.appendChild(f);
});

// cargar primer chat
loadChat(Object.keys(chats)[0]);

function loadChat(name){
  document.querySelectorAll(".friend")
    .forEach(f=>f.classList.remove("active"));

  [...document.querySelectorAll(".friend")]
    .find(f=>f.textContent.trim()===name)
    ?.classList.add("active");

  const user=chats[name];
  chatBox.innerHTML="";
  chatBox.scrollTop=0;

  header.innerHTML=`
    <img src="${user.photo}">
    <div>
      <b>${name}</b><br>
      <small>${user.status}</small>
    </div>
  `;

  user.msgs.forEach((m,i)=>{
    const msg=document.createElement("div");
    msg.className="msg "+(i%2?"me":"them");
    msg.textContent=m;
    chatBox.appendChild(msg);
  });
}

const input=document.getElementById("chatInput");
const btn=document.getElementById("sendBtn");

function sendMessage(){
  const text=input.value.trim();
  if(!text) return;

  const msg=document.createElement("div");
  msg.className="msg me";
  msg.textContent=text;

  chatBox.appendChild(msg);

  chatBox.scrollTo({
    top:chatBox.scrollHeight,
    behavior:"smooth"
  });

  input.value="";
}

btn.onclick=sendMessage;
input.addEventListener("keydown",e=>{
  if(e.key==="Enter") sendMessage();
});

////////////////////////////
// CLOCK
////////////////////////////

function clock(){
  const d=new Date();

  document.getElementById("clock").textContent=
    d.toLocaleTimeString("de-DE",{hour:"2-digit",minute:"2-digit"});

  document.getElementById("date").textContent=
    d.toLocaleDateString("de-DE",{day:"2-digit",month:"2-digit",year:"numeric"});
}
clock();
setInterval(clock,1000);

////////////////////////////
// WEATHER
////////////////////////////

async function loadWeather(){
  try{
    const res=await fetch(
      "https://api.open-meteo.com/v1/forecast?latitude=52.37&longitude=9.72&current_weather=true"
    );
    const data=await res.json();
    const temp=Math.round(data.current_weather.temperature);
    document.getElementById("weather").textContent=`Hannover ${temp}°`;
  }catch{
    document.getElementById("weather").textContent="Hannover --°";
  }
}
loadWeather();
setInterval(loadWeather,600000);

 function openGallery(type){

  const gallery = document.getElementById("galleryGrid");
  gallery.innerHTML = "";

  const images = galerias[type];

  if(!images || images.length === 0){
    gallery.innerHTML = "<p>No hay diseños todavía.</p>";
    openWin("galleryWin");
    return;
  }

images.forEach(src=>{
  const img = document.createElement("img");

  img.src = src;
  img.className = "gallery-img";

  img.onclick = () => openViewer(src);

  gallery.appendChild(img);
});

  openWin("galleryWin");

}

////////////////////////////
// PARTICLES
////////////////////////////

const canvas=document.getElementById("particles");
const ctx=canvas.getContext("2d");

function resizeCanvas(){
  canvas.width=window.innerWidth;
  canvas.height=window.innerHeight;
}
resizeCanvas();
window.addEventListener("resize",resizeCanvas);

const mouse={x:null,y:null};
window.addEventListener("mousemove",e=>{
  mouse.x=e.clientX;
  mouse.y=e.clientY;
});

const particles=[];
for(let i=0;i<90;i++){
  particles.push({
    x:Math.random()*canvas.width,
    y:Math.random()*canvas.height,
    vx:(Math.random()-0.5)*0.6,
    vy:(Math.random()-0.5)*0.6,
    r:Math.random()*2+1
  });
}

function animate(){
  ctx.clearRect(0,0,canvas.width,canvas.height);

  particles.forEach(p=>{
    p.x+=p.vx;
    p.y+=p.vy;

    if(p.x<0||p.x>canvas.width) p.vx*=-1;
    if(p.y<0||p.y>canvas.height) p.vy*=-1;

    if(mouse.x){
      const dx=p.x-mouse.x;
      const dy=p.y-mouse.y;
      const dist=Math.sqrt(dx*dx+dy*dy);
      if(dist<120){
        const force=(120-dist)/120;
        p.x+=dx*force*0.02;
        p.y+=dy*force*0.02;
      }
    }

    ctx.beginPath();
    ctx.arc(p.x,p.y,p.r,0,Math.PI*2);
    ctx.fillStyle="rgba(255,255,255,.6)";
    ctx.fill();
  });

  requestAnimationFrame(animate);
}
animate();

  ////////////////////////////
// TRABAJOS GRID
////////////////////////////

const trabajos = [
  {
    title:"Pcbacks",
    desc:"Dale un estilo único a tu privado",
    price:"Animado (sencillo): 500 xats // estático: 300 xats",
    img:"https://i.ibb.co/bjXCrNWr/fondo-molonisimo-hermosisismo-copia.gif"
  },

  {
    title:"Banner de perfil",
    desc:"Tu perfil más único que nunca",
    price:"xxx xats",
    img:"https://i.ibb.co/C3JXWwJF/perfilllll-copia.gif"
  },

  {
    title:"Otro tipo de diseño",
    desc:"Portadas de twitter, pack de icons, diseño de space...",
    price:"Háblame por privado",
    img:"https://i.ibb.co/9mW2jhVm/banneeer.png"
  }
];

const galerias = {

  "Pcbacks":[
    "https://i.ibb.co/bjXCrNWr/fondo-molonisimo-hermosisismo-copia.gif",
    "https://i.ibb.co/d0C9p3G/pcback2.gif",
    "https://i.ibb.co/7jvXnsh/pcback3.gif"
  ],

  "Banner de perfil":[
    "https://i.ibb.co/C3JXWwJF/perfilllll-copia.gif",
    "https://i.ibb.co/vmQkV7Q/banner2.gif",
    "https://i.ibb.co/mz6kn8r/banner3.gif"
  ],

  "Otro tipo de diseño":[
    "https://i.ibb.co/9mW2jhVm/banneeer.png"
  ]

};


const designGrid = document.getElementById("designGrid");

trabajos.forEach(work=>{

  const card=document.createElement("div");
  card.className="portfolio-item";

  card.innerHTML=`
    <img src="${work.img}">
    <div class="work-info">
      <b>${work.title}</b>
      <span>${work.desc}</span>
      <div class="price">${work.price}</div>
    </div>
  `;

  card.onclick = () => openGallery(work.title);

  designGrid.appendChild(card);

});
  

////////////////////////////
// WALLPAPERS
////////////////////////////

const wallpapers=[
  "https://i.ibb.co/S4wLCz9M/1399771.png",
  "https://i.ibb.co/Mk7tsD8f/1400584.png",
  "https://i.ibb.co/HyZHc46/1271005.png"
];

const layers=document.querySelectorAll(".wallpaper-layer");
const selector=document.getElementById("wallSelector");

let currentWall=Number(localStorage.getItem("wall"))||0;
let activeLayer=0;

layers[activeLayer].style.backgroundImage=`url(${wallpapers[currentWall]})`;
layers[activeLayer].classList.add("active");

wallpapers.forEach((src,i)=>{
  const thumb=document.createElement("div");
  thumb.className="wall-thumb";
  thumb.style.backgroundImage=`url(${src})`;

  thumb.onclick=()=>{
    localStorage.setItem("wall",i);
    const next=activeLayer?0:1;
    layers[next].style.backgroundImage=`url(${src})`;
    layers[next].classList.add("active");
    layers[activeLayer].classList.remove("active");
    activeLayer=next;
  };

  selector.appendChild(thumb);
});

