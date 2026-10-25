const N=D.reduce((s,d)=>s+d.q.length,0);
let answers=new Array(N).fill(0), page=0;
const $=id=>document.getElementById(id);
const offset=i=>D.slice(0,i).reduce((s,d)=>s+d.q.length,0);
 
// Danh sách lĩnh vực và tài liệu
$("domainList").innerHTML=D.map((d,i)=>`<li><span class="dnum">${i+1}</span><div><b>${d.name}</b><span>${d.short}</span></div></li>`).join("");
$("refList").innerHTML=REFS.map(r=>`<li>${r}</li>`).join("");
 
// Tabs
document.querySelectorAll("nav.tabs button").forEach(b=>b.addEventListener("click",()=>show(b.dataset.view)));
function show(v){
  document.querySelectorAll("nav.tabs button").forEach(b=>b.setAttribute("aria-selected",b.dataset.view===v));
  ["quiz","class","basis"].forEach(x=>$("view-"+x).hidden=x!==v);
}
if(["class","basis"].includes(location.hash.slice(1))) show(location.hash.slice(1));
 
function itemScore(v,r){return r?6-v:v}
function scoreOf(ans){
  return D.map((d,i)=>{const o=offset(i);let s=0;d.q.forEach((q,j)=>s+=itemScore(ans[o+j],q[1]));
    return Math.round((s-d.q.length)/(4*d.q.length)*100)});
}
function level(p){return p>=75?["good","Tốt"]:p>=50?["warn","Cần lưu ý"]:["bad","Cần cải thiện"]}
 
function renderPage(){
  const d=D[page],o=offset(page);
  $("dEyebrow").textContent=`Lĩnh vực ${page+1} / ${D.length}`;
  $("dTitle").textContent=d.name;
  $("dBasis").textContent=d.basis;
  $("qList").innerHTML=d.q.map((q,j)=>{const k=o+j;
    return `<fieldset class="q" style="border:0;margin:0;padding-inline:0"><legend style="padding:0"><p><span class="qn">${k+1}.</span>${q[0]}</p></legend>
    <div class="opts">${SCALE.map((s,v)=>`<label class="opt"><input type="radio" name="q${k}" id="q${k}_${v+1}" value="${v+1}" ${answers[k]===v+1?"checked":""}><span><b>${v+1}</b>${s}</span></label>`).join("")}</div></fieldset>`}).join("");
  $("qList").querySelectorAll("input").forEach(inp=>inp.addEventListener("change",e=>{
    answers[+e.target.name.slice(1)]=+e.target.value; updateNav()}));
  $("prevBtn").textContent=page===0?"Về trang đầu":"Quay lại";
  $("nextBtn").textContent=page===D.length-1?"Xem kết quả":"Tiếp tục";
  updateNav(); window.scrollTo({top:0});
}
function updateNav(){
  const done=answers.filter(Boolean).length,o=offset(page);
  const pageDone=D[page].q.every((_,j)=>answers[o+j]);
  $("nextBtn").disabled=!pageDone;
  $("barFill").style.width=(done/N*100)+"%";
  $("stepLabel").textContent=D[page].name;
  $("countLabel").textContent=`${done}/${N} câu`;
}
$("startBtn").onclick=()=>{$("intro").hidden=true;$("quiz").hidden=false;page=0;renderPage()};
$("prevBtn").onclick=()=>{if(page===0){$("quiz").hidden=true;$("intro").hidden=false}else{page--;renderPage()}};
$("nextBtn").onclick=()=>{if(page<D.length-1){page++;renderPage()}else showResult()};
$("againBtn").onclick=()=>{answers.fill(0);$("result").hidden=true;$("intro").hidden=false;window.scrollTo({top:0})};
 
function flagsOf(ans){const out=[];D.forEach((d,i)=>{const o=offset(i);d.q.forEach((q,j)=>{if(q[2]&&(q[1]?ans[o+j]>=4:ans[o+j]<=2))out.push(q[0])})});return out}
 
function showResult(){
  const sc=scoreOf(answers), total=Math.round(sc.reduce((a,b)=>a+b,0)/sc.length), [cls,lab]=level(total);
  $("quiz").hidden=true;$("result").hidden=false;window.scrollTo({top:0});
  $("ring").style.setProperty("--p",total);$("totalScore").textContent=total;
  $("totalChip").className="chip "+cls;$("totalChip").textContent=lab;
  const order=sc.map((s,i)=>[s,i]).sort((a,b)=>a[0]-b[0]);
  const weak=order.filter(x=>x[0]<75);
  $("summaryText").textContent=weak.length?`Lĩnh vực cần quan tâm nhất: ${D[order[0][1]].name.toLowerCase()} (${order[0][0]} điểm).`:"Bạn đang duy trì thói quen học tập và sử dụng công nghệ số khá tốt ở cả 6 lĩnh vực.";
  $("dres").innerHTML=sc.map((s,i)=>{const [c,l]=level(s);return `<div class="drow"><span class="name">${D[i].name} <span class="chip ${c}">${l}</span></span><span class="val">${s}</span><div class="track"><i class="${c}" style="width:${s}%"></i></div></div>`}).join("");
  const fl=flagsOf(answers);
  $("alerts").innerHTML=fl.length?`<div class="alert"><b>Nên lưu ý:</b> câu trả lời của bạn ở các nội dung sau cho thấy thông tin cá nhân có thể bị lộ. Hãy xem lại thói quen này:<ul style="margin:6px 0 0;padding-left:20px">${fl.map(f=>`<li>${f}</li>`).join("")}</ul></div>`:"";
  const pick=order.slice(0,2);
  $("advice").innerHTML=pick.map(([s,i])=>`<article><h3>${D[i].name} · ${s} điểm</h3><ul>${D[i].tips.map(t=>`<li>${t}</li>`).join("")}</ul></article>`).join("");
  const cc=($("classCode").value||"").trim().replace(/[^\p{L}\p{N}_-]/gu,"").slice(0,12);
  $("resultCode").textContent=(cc?cc+"-":"")+answers.join("");
  $("copyMsg").textContent="";
}
function copyText(text,msgEl,srcEl){
  const ok=()=>msgEl.textContent="Đã sao chép.";
  const fail=()=>{msgEl.textContent="Không sao chép tự động được. Hãy bôi đen và sao chép thủ công.";
    if(srcEl&&srcEl.select){srcEl.select()}else if(srcEl){const r=document.createRange();r.selectNodeContents(srcEl);const s=getSelection();s.removeAllRanges();s.addRange(r)}};
  try{navigator.clipboard.writeText(text).then(ok,fail)}catch(e){fail()}
}
$("copyBtn").onclick=()=>copyText($("resultCode").textContent,$("copyMsg"),$("resultCode"));
 
// Tổng hợp lớp
function parseCodes(text){
  const rows=[],bad=[];
  text.split(/\r?\n/).map(s=>s.trim()).filter(Boolean).forEach((line,i)=>{
    const m=line.match(/^(?:(.+)-)?([1-5]{36})$/u);
    if(m) rows.push({cls:m[1]||"",ans:m[2].split("").map(Number)}); else bad.push(i+1);
  });return {rows,bad};
}
$("sampleBtn").onclick=()=>{
  // Dữ liệu minh họa sinh ngẫu nhiên, không phải kết quả thật
  let seed=7;const rnd=()=>(seed=(seed*9301+49297)%233280)/233280;
  const lines=[];for(let k=0;k<24;k++){let s="";D.forEach(d=>d.q.forEach(q=>{let v=q[1]?1+Math.floor(rnd()*4.2):2+Math.floor(rnd()*3.99);s+=Math.min(5,Math.max(1,v))}));lines.push("VIDU-"+s)}
  $("codesIn").value=lines.join("\n");$("aggMsg").textContent="Đã điền 24 mã ví dụ được sinh ngẫu nhiên, chỉ để xem thử, không phải kết quả thật.";
};
$("aggBtn").onclick=()=>{
  const {rows,bad}=parseCodes($("codesIn").value);
  if(!rows.length){$("aggMsg").textContent="Chưa có mã hợp lệ. Mỗi mã gồm 36 chữ số từ 1 đến 5, có thể có mã lớp và dấu gạch ở đầu.";$("aggOut").hidden=true;return}
  $("aggMsg").textContent=`Đã đọc ${rows.length} mã hợp lệ`+(bad.length?`; bỏ qua dòng ${bad.join(", ")} vì sai định dạng.`:".");
  const scores=rows.map(r=>scoreOf(r.ans));
  $("aggTable").innerHTML=`<thead><tr><th>Lĩnh vực</th><th class="num">Trung bình</th><th class="num">Tốt</th><th class="num">Cần lưu ý</th><th class="num">Cần cải thiện</th></tr></thead><tbody>`+
    D.map((d,i)=>{const col=scores.map(s=>s[i]);const avg=Math.round(col.reduce((a,b)=>a+b,0)/col.length);
      const c=[0,0,0];col.forEach(v=>c[v>=75?0:v>=50?1:2]++);const pc=n=>Math.round(n/col.length*100)+"%";
      return `<tr><td>${d.name}</td><td class="num"><span class="chip ${level(avg)[0]}">${avg}</span></td><td class="num">${pc(c[0])}</td><td class="num">${pc(c[1])}</td><td class="num">${pc(c[2])}</td></tr>`}).join("")+"</tbody>";
  const items=[];D.forEach((d,i)=>{const o=offset(i);d.q.forEach((q,j)=>{const k=o+j;
    const risk=rows.filter(r=>q[1]?r.ans[k]>=4:r.ans[k]<=2).length/rows.length;items.push([risk,k,q[0],d.name])})});
  items.sort((a,b)=>b[0]-a[0]);
  $("riskTable").innerHTML=`<thead><tr><th>Câu</th><th>Nội dung</th><th class="num">Tỷ lệ nguy cơ</th></tr></thead><tbody>`+
    items.slice(0,8).map(x=>`<tr><td>${x[1]+1}</td><td>${x[2]}</td><td class="num">${Math.round(x[0]*100)}%</td></tr>`).join("")+"</tbody>";
  const head=["STT","Lop",...D.map(d=>d.name),"Tong",...Array.from({length:N},(_,i)=>"C"+(i+1))];
  const csv=[head.join(",")].concat(rows.map((r,i)=>{const s=scores[i];const t=Math.round(s.reduce((a,b)=>a+b,0)/s.length);return [i+1,r.cls,...s,t,...r.ans].join(",")}));
  $("csvOut").value=csv.join("\n");$("csvMsg").textContent="";
  $("aggOut").hidden=false;
};
$("copyCsv").onclick=()=>copyText($("csvOut").value,$("csvMsg"),$("csvOut"));