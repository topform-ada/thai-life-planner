import { useState, useMemo, useRef } from "react";
import { AreaChart, Area, BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, ReferenceLine, PieChart, Pie, Cell } from "recharts";

// ══════════════════════════════════════════════════════════════════
// CONSTANTS
// ══════════════════════════════════════════════════════════════════
const SUCCESS_GOALS = { MBRT:1200000, MDRT:1964400, "COT.":5893200, "TOT.":11786400 };
const STATUS_STEPS = [
  {key:"appointmentCall",label:"1.โทรทำนัด"},
  {key:"meeting",label:"2.เข้าพบ"},
  {key:"paymentAppointment",label:"3.นัดชำระเงินทำประกัน"},
  {key:"historyRequest",label:"4.ดำเนินการขอประวัติ"},
  {key:"healthCheckup",label:"5.ดำเนินการตรวจสุขภาพ"},
  {key:"memoRecord",label:"6.ดำเนินการทำบันทึก"},
  {key:"policyDelivery",label:"7.ส่งมอบกรมธรรม์"},
];
const TYPE_LABELS = {Life:"คุ้มครองชีวิต",Savings:"สะสมทรัพย์",Health:"สุขภาพ",Pension:"บำนาญ",UnitLink:"ยูนิเวอร์ซอล"};
const THAI_MONTHS = ["มกราคม","กุมภาพันธ์","มีนาคม","เมษายน","พฤษภาคม","มิถุนายน","กรกฎาคม","สิงหาคม","กันยายน","ตุลาคม","พฤศจิกายน","ธันวาคม"];
const COLORS = ["#004a99","#10b981","#f59e0b","#ef4444","#8b5cf6","#06b6d4"];

// ══════════════════════════════════════════════════════════════════
// PRESET POLICIES (สำเร็จรูป)
// ══════════════════════════════════════════════════════════════════
const PRESET_POLICIES = [
  {
    id:"preset_legacy99", name:"ไทยไลฟ์ เลกาซี 99", type:"Life",
    desc:"คุ้มครองชีวิตตลอดชีพ พร้อมปันผล",
    sumAssured:1000000, annualPremium:14000, firstYearPremium:14000,
    paymentTerm:20, coverageUntilAge:99, maturityBenefit:1000000,
    cashBackRanges:[],
    dividendRanges:[{id:"d1",amount:15000,startAge:1,endAge:99}],
    roomAndBoardPremium:0,roomAndBoard:0,dailyCompensationPremium:0,dailyCompensation:0,
    opdPremium:0,opd:0,accidentLifePremium:0,accidentLife:0,accidentMedicalPremium:0,accidentMedical:0,
    healthPremium:0,surrenderValue:0,ciRiders:[],startDate:"",endDate:""
  },
  {
    id:"preset_savings20", name:"ไทยไลฟ์ สะสมทรัพย์ 20/10", type:"Savings",
    desc:"ออมทรัพย์ 10 ปี คุ้มครอง 20 ปี",
    sumAssured:1000000, annualPremium:65000, firstYearPremium:65000,
    paymentTerm:10, coverageUntilAge:20, maturityBenefit:1000000,
    cashBackRanges:[
      {id:"c1",amount:30000,startAge:1,endAge:10},
      {id:"c2",amount:50000,startAge:11,endAge:20},
    ],
    dividendRanges:[{id:"d1",amount:20000,startAge:2,endAge:20}],
    roomAndBoardPremium:0,roomAndBoard:0,dailyCompensationPremium:0,dailyCompensation:0,
    opdPremium:0,opd:0,accidentLifePremium:0,accidentLife:0,accidentMedicalPremium:0,accidentMedical:0,
    healthPremium:0,surrenderValue:0,ciRiders:[],startDate:"",endDate:""
  },
  {
    id:"preset_pension60", name:"ไทยไลฟ์ บำนาญ 60", type:"Pension",
    desc:"รับบำนาญตั้งแต่อายุ 60-99 ปี",
    sumAssured:500000, annualPremium:40000, firstYearPremium:40000,
    paymentTerm:30, coverageUntilAge:99, maturityBenefit:500000,
    cashBackRanges:[{id:"c1",amount:60000,startAge:60,endAge:99}],
    dividendRanges:[],
    roomAndBoardPremium:0,roomAndBoard:0,dailyCompensationPremium:0,dailyCompensation:0,
    opdPremium:0,opd:0,accidentLifePremium:0,accidentLife:0,accidentMedicalPremium:0,accidentMedical:0,
    healthPremium:0,surrenderValue:0,ciRiders:[],startDate:"",endDate:""
  },
  {
    id:"preset_health_fit30", name:"Health Fit DD 30M", type:"Health",
    desc:"ค่าห้อง 12,000 บ./วัน วงเงิน 30 ล้าน",
    sumAssured:0, annualPremium:22640, firstYearPremium:22640,
    paymentTerm:99, coverageUntilAge:98, maturityBenefit:0,
    cashBackRanges:[], dividendRanges:[],
    roomAndBoardPremium:22640, roomAndBoard:12000,
    dailyCompensationPremium:0,dailyCompensation:0,
    opdPremium:0,opd:0,accidentLifePremium:0,accidentLife:0,accidentMedicalPremium:0,accidentMedical:0,
    healthPremium:22640,surrenderValue:0,ciRiders:[],startDate:"",endDate:""
  },
  {
    id:"preset_pa", name:"ประกันอุบัติเหตุ PA 1M", type:"Life",
    desc:"คุ้มครองชีวิตจากอุบัติเหตุ 1 ล้าน",
    sumAssured:1000000, annualPremium:2000, firstYearPremium:2000,
    paymentTerm:1, coverageUntilAge:70, maturityBenefit:0,
    cashBackRanges:[], dividendRanges:[],
    roomAndBoardPremium:0,roomAndBoard:0,dailyCompensationPremium:0,dailyCompensation:0,
    opdPremium:0,opd:0, accidentLifePremium:2000, accidentLife:1000000,
    accidentMedicalPremium:0,accidentMedical:0,
    healthPremium:0,surrenderValue:0,ciRiders:[],startDate:"",endDate:""
  },
  {
    id:"preset_ci", name:"โรคร้ายแรง CI Multi-Pay 1M", type:"Life",
    desc:"คุ้มครองโรคร้ายแรงหลายครั้ง 1 ล้าน",
    sumAssured:0, annualPremium:8500, firstYearPremium:8500,
    paymentTerm:20, coverageUntilAge:75, maturityBenefit:0,
    cashBackRanges:[], dividendRanges:[],
    roomAndBoardPremium:0,roomAndBoard:0,dailyCompensationPremium:0,dailyCompensation:0,
    opdPremium:0,opd:0,accidentLifePremium:0,accidentLife:0,accidentMedicalPremium:0,accidentMedical:0,
    healthPremium:0,surrenderValue:0,
    ciRiders:[{id:"ci1",type:"CI Multi Pay",sumAssured:1000000,premium:8500}],
    startDate:"",endDate:""
  },
  {
    id:"preset_unitlink", name:"TL Universal Life (Unit-Link)", type:"UnitLink",
    desc:"ยูนิเวอร์ซอล ลงทุน + คุ้มครอง",
    sumAssured:2000000, annualPremium:60000, firstYearPremium:60000,
    paymentTerm:5, coverageUntilAge:99, maturityBenefit:0,
    cashBackRanges:[], dividendRanges:[{id:"d1",amount:30000,startAge:6,endAge:99}],
    roomAndBoardPremium:0,roomAndBoard:0,dailyCompensationPremium:0,dailyCompensation:0,
    opdPremium:0,opd:0,accidentLifePremium:0,accidentLife:0,accidentMedicalPremium:0,accidentMedical:0,
    healthPremium:0,surrenderValue:0,ciRiders:[],startDate:"",endDate:""
  },
];

// ══════════════════════════════════════════════════════════════════
// HEALTH FIT PREMIUM TABLES
// ══════════════════════════════════════════════════════════════════
const HF30M_M=[{a:6,b:10,p:81140},{a:11,b:15,p:32650},{a:16,b:20,p:20590},{a:21,b:25,p:20980},{a:26,b:30,p:21750},{a:31,b:35,p:22640},{a:36,b:40,p:24040},{a:41,b:45,p:26350},{a:46,b:50,p:33710},{a:51,b:55,p:44720},{a:56,b:60,p:59320},{a:61,b:65,p:85090},{a:66,b:70,p:126210},{a:71,b:75,p:185260},{a:76,b:80,p:250910},{a:81,b:85,p:321160},{a:86,b:90,p:437390},{a:91,b:95,p:503000},{a:96,b:98,p:578450}];
const HF30M_F=[{a:6,b:10,p:77080},{a:11,b:15,p:27250},{a:16,b:20,p:20800},{a:21,b:25,p:22660},{a:26,b:30,p:24140},{a:31,b:35,p:26040},{a:36,b:40,p:26920},{a:41,b:45,p:29510},{a:46,b:50,p:38090},{a:51,b:55,p:50090},{a:56,b:60,p:62290},{a:61,b:65,p:88490},{a:66,b:70,p:130000},{a:71,b:75,p:188970},{a:76,b:80,p:253420},{a:81,b:85,p:314740},{a:86,b:90,p:428640},{a:91,b:95,p:492940},{a:96,b:98,p:566880}];
const dynP=(tbl,age)=>{const e=tbl.find(r=>age>=r.a&&age<=r.b);return e?e.p:0;};

// ══════════════════════════════════════════════════════════════════
// HELPERS
// ══════════════════════════════════════════════════════════════════
const fmt = n => Math.round(n).toLocaleString("th-TH");
const fmtK = n => n>=1e6?`${(n/1e6).toFixed(1)}M`:n>=1e3?`${Math.round(n/1e3)}K`:`${Math.round(n)}`;

const calcIRR = cfs => {
  if(cfs.length<2)return null;
  let r=0.1;
  for(let i=0;i<200;i++){
    let npv=0,d=0;
    cfs.forEach((c,t)=>{const disc=Math.pow(1+r,t);npv+=c/disc;d-=t*c/(disc*(1+r));});
    if(Math.abs(d)<1e-12)break;
    const nr=r-npv/d;
    if(Math.abs(nr-r)<1e-8){r=nr;break;}
    r=nr;if(r<-0.9999)r=-0.5;
  }
  return isFinite(r)?r:null;
};

const computeCF = fd => {
  const rows=[];let cc=fd.savings,cp=0,cr=0;
  for(let age=fd.currentAge;age<=99;age++){
    let prem=0,cb=0,div=0;const pp={};
    fd.policies.forEach(p=>{
      const ys=age-fd.currentAge;let _p=0,_r=0;
      if(ys<p.paymentTerm){
        _p+=(p.annualPremium||0)+(p.accidentLifePremium||0)+(p.accidentMedicalPremium||0)+
           (p.ciRiders||[]).reduce((s,r)=>s+r.premium,0);
      }
      if(age<p.coverageUntilAge){
        let rbp=p.roomAndBoardPremium||0;
        if(p.roomAndBoard===12000)rbp=dynP(fd.gender==="Male"?HF30M_M:HF30M_F,age)||rbp;
        _p+=rbp+(p.dailyCompensationPremium||0)+(p.opdPremium||0);
      }
      (p.cashBackRanges||[]).forEach(r=>{if(age>=r.startAge&&age<=r.endAge)_r+=r.amount;});
      (p.dividendRanges||[]).forEach(r=>{if(age>=r.startAge&&age<=r.endAge)_r+=r.amount;});
      if(age===p.coverageUntilAge)_r+=p.maturityBenefit||0;
      prem+=_p;cb+=_r;pp[p.id]={premium:_p,returns:_r};
    });
    const inc=age<fd.retirementAge?fd.income*12:(fd.postRetirementIncome||0)*12;
    const sv=inc-fd.expenses*12;
    const net=sv-prem+cb+div;
    cc+=net;cp+=prem;cr+=cb+div;
    rows.push({age,year:2026+(age-fd.currentAge),inc,sv,prem,cb,div,net,cc,cp,cr,pp});
  }
  return rows;
};

const mkPolicy = (over={}) => ({
  id:`${Date.now()}${Math.random()}`,name:"กรมธรรม์ใหม่",type:"Life",
  sumAssured:1000000,annualPremium:20000,firstYearPremium:20000,
  paymentTerm:20,coverageUntilAge:99,maturityBenefit:0,
  cashBackRanges:[],dividendRanges:[],
  roomAndBoardPremium:0,roomAndBoard:0,dailyCompensationPremium:0,dailyCompensation:0,
  opdPremium:0,opd:0,accidentLifePremium:0,accidentLife:0,accidentMedicalPremium:0,accidentMedical:0,
  healthPremium:0,surrenderValue:0,ciRiders:[],startDate:"",endDate:"",...over
});

const INIT_FD = {
  income:50000,expenses:30000,savings:200000,currentAge:30,birthDate:"01/01/1996",
  gender:"Male",occupation:"พนักงานบริษัท",goals:["Retirement","Protection"],
  retirementAge:60,postRetirementIncome:0,retirementGoal:10000000,
  policies:[
    {...PRESET_POLICIES[0],id:"p1",sumAssured:2000000,annualPremium:28000,
      dividendRanges:[{id:"d1",amount:30000,startAge:1,endAge:99}],maturityBenefit:2000000},
    {...PRESET_POLICIES[2],id:"p2"},
  ]
};

// ══════════════════════════════════════════════════════════════════
// PDF EXPORT (HTML print)
// ══════════════════════════════════════════════════════════════════
const exportPDF = (client, cashflow, metrics, irrData) => {
  const fd = client.financialData;
  const html = `<!DOCTYPE html>
<html><head><meta charset="utf-8">
<title>แผนการเงิน - ${client.name}</title>
<style>
@import url('https://fonts.googleapis.com/css2?family=Sarabun:wght@400;600;700&display=swap');
*{box-sizing:border-box;margin:0;padding:0}
body{font-family:'Sarabun',sans-serif;font-size:13px;color:#1e293b;padding:24px}
h1{font-size:20px;color:#004a99;margin-bottom:4px}
.sub{color:#64748b;font-size:12px;margin-bottom:16px}
.summary{display:grid;grid-template-columns:repeat(4,1fr);gap:12px;margin-bottom:20px}
.card{background:#f8fafc;border-radius:8px;padding:12px;border:1px solid #e2e8f0}
.card .label{font-size:10px;color:#64748b;margin-bottom:4px}
.card .val{font-size:18px;font-weight:700;color:#004a99}
table{width:100%;border-collapse:collapse;font-size:11px}
th{background:#004a99;color:#fff;padding:6px 8px;text-align:right}
th:first-child,th:nth-child(2){text-align:left}
td{padding:5px 8px;border-bottom:1px solid #f1f5f9;text-align:right}
td:first-child,td:nth-child(2){text-align:left}
tr:nth-child(even){background:#f8fafc}
.pos{color:#10b981} .neg{color:#ef4444} .blue{color:#004a99}
.footer{margin-top:16px;font-size:10px;color:#94a3b8;text-align:center}
.section{font-size:14px;font-weight:700;color:#004a99;margin:16px 0 8px;padding-bottom:4px;border-bottom:2px solid #e0edff}
</style></head><body>
<div style="display:flex;justify-content:space-between;align-items:flex-start;margin-bottom:16px">
  <div>
    <h1>Thai Life Financial Planner</h1>
    <div class="sub">แผนการเงินส่วนบุคคล · สร้างเมื่อ ${new Date().toLocaleDateString("th-TH",{year:"numeric",month:"long",day:"numeric"})}</div>
  </div>
  <div style="text-align:right;font-size:12px;color:#64748b">
    <div style="font-weight:700;font-size:15px;color:#1e293b">${client.name}</div>
    <div>อายุ ${fd.currentAge} ปี · ${fd.gender==="Male"?"ชาย":"หญิง"} · ${fd.occupation}</div>
    <div>เกษียณอายุ ${fd.retirementAge} ปี</div>
  </div>
</div>
<div class="summary">
  <div class="card"><div class="label">ความคุ้มครองรวม</div><div class="val">฿${fmtK(metrics.totalCoverage||0)}</div></div>
  <div class="card"><div class="label">เบี้ยรวม/ปี</div><div class="val neg">฿${fmtK(metrics.totalAnnualPremium||0)}</div></div>
  <div class="card"><div class="label">IRR พอร์ตรวม</div><div class="val">${irrData!=null?(irrData*100).toFixed(2)+"%":"—"}</div></div>
  <div class="card"><div class="label">อายุคืนทุน</div><div class="val">${metrics.breakEven?metrics.breakEven.age+" ปี":"—"}</div></div>
</div>
<div class="section">กรมธรรม์ที่ถืออยู่ (${fd.policies.length} ฉบับ)</div>
<table style="margin-bottom:16px">
  <tr><th style="text-align:left">ชื่อแบบประกัน</th><th>ประเภท</th><th>ทุนประกัน</th><th>เบี้ย/ปี</th><th>ชำระ(ปี)</th><th>คุ้มครองถึง</th></tr>
  ${fd.policies.map(p=>`<tr>
    <td>${p.name}</td><td style="text-align:center">${TYPE_LABELS[p.type]||p.type}</td>
    <td>฿${fmt(p.sumAssured)}</td><td class="neg">฿${fmt(p.annualPremium)}</td>
    <td style="text-align:center">${p.paymentTerm}</td><td style="text-align:center">${p.coverageUntilAge}</td>
  </tr>`).join("")}
</table>
<div class="section">ตาราง Cashflow รายปี (อายุ ${fd.currentAge}–99)</div>
<table>
  <tr><th style="text-align:left">ปี</th><th style="text-align:center">อายุ</th><th>เบี้ยจ่าย</th><th>เงินคืน</th><th>ปันผล</th><th>ผลต่างสุทธิ</th><th>เงินสะสม</th></tr>
  ${cashflow.map(r=>`<tr>
    <td>${r.year}</td><td style="text-align:center">${r.age}</td>
    <td class="neg">฿${fmt(r.prem)}</td>
    <td class="pos">฿${fmt(r.cb)}</td>
    <td class="pos">฿${fmt(r.div)}</td>
    <td class="${r.net>=0?"pos":"neg"}">฿${fmt(r.net)}</td>
    <td class="blue"><strong>฿${fmt(r.cc)}</strong></td>
  </tr>`).join("")}
</table>
<div class="footer">Thai Life Financial Planner · เอกสารนี้สร้างโดยระบบอัตโนมัติ · ข้อมูลเพื่อการวางแผนเท่านั้น</div>
</body></html>`;
  const w = window.open("","_blank","width=900,height=700");
  w.document.write(html);
  w.document.close();
  setTimeout(()=>w.print(),600);
};

// ══════════════════════════════════════════════════════════════════
// EXCEL EXPORT (CSV)
// ══════════════════════════════════════════════════════════════════
const exportExcel = (client, cashflow) => {
  const fd = client.financialData;
  const bom = "\uFEFF";
  const header = ["ปี","อายุ","รายได้ต่อปี","เงินออมคงเหลือ","เบี้ยจ่าย","เงินคืน","ปันผล","ผลต่างสุทธิ","เงินสดสะสม","เบี้ยสะสม","รับสะสม"].join(",");
  const rows = cashflow.map(r =>
    [r.year,r.age,r.inc,r.sv,r.prem,r.cb,r.div,r.net,r.cc,r.cp,r.cr].join(",")
  );
  const csv = bom + [
    `แผนการเงิน: ${client.name}`,
    `อายุปัจจุบัน: ${fd.currentAge} | รายได้: ${fd.income} | ค่าใช้จ่าย: ${fd.expenses}`,
    "",
    header,
    ...rows
  ].join("\n");
  const blob = new Blob([csv],{type:"text/csv;charset=utf-8;"});
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href=url; a.download=`cashflow_${client.name.replace(/\s/g,"_")}.csv`;
  a.click(); URL.revokeObjectURL(url);
};

// ══════════════════════════════════════════════════════════════════
// MAIN APP
// ══════════════════════════════════════════════════════════════════
// ══════════════════════════════════════════════════════════════════
// LOGIN SCREEN
// ══════════════════════════════════════════════════════════════════
function LoginScreen({onLogin}) {
  const [isRegister, setIsRegister] = useState(false);
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const submit = async () => {
    if (!username.trim() || !password) { setError("กรุณากรอกข้อมูลให้ครบ"); return; }
    setLoading(true); setError("");
    const endpoint = isRegister ? "/api/auth/register" : "/api/auth/login";
    try {
      const res = await fetch(endpoint, {
        method:"POST", headers:{"Content-Type":"application/json"},
        body: JSON.stringify({ username: username.trim().toLowerCase(), password })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "เกิดข้อผิดพลาด");
      onLogin(data);
    } catch(e) {
      setError(e.message);
    }
    setLoading(false);
  };

  return (
    <div style={{minHeight:"100vh",background:"linear-gradient(160deg,#001f5c 0%,#004a99 50%,#0369a1 100%)",display:"flex",alignItems:"center",justifyContent:"center",padding:20,fontFamily:"'Sarabun','Noto Sans Thai',sans-serif"}}>
      <div style={{width:"100%",maxWidth:380}}>
        {/* Logo */}
        <div style={{textAlign:"center",marginBottom:28}}>
          <div style={{width:68,height:68,background:"rgba(255,255,255,.15)",borderRadius:20,display:"flex",alignItems:"center",justifyContent:"center",margin:"0 auto 12px",border:"1px solid rgba(255,255,255,.25)"}}>
            <span style={{fontSize:32}}>🛡️</span>
          </div>
          <div style={{color:"#fff",fontSize:22,fontWeight:700}}>Thai Life Planner</div>
          <div style={{color:"rgba(255,255,255,.65)",fontSize:13,marginTop:3}}>ระบบวางแผนการเงินตลอดชีพ</div>
        </div>

        {/* Card */}
        <div style={{background:"#fff",borderRadius:20,padding:"28px 24px",boxShadow:"0 20px 60px rgba(0,0,0,.25)"}}>
          <div style={{fontWeight:700,fontSize:17,color:"#1e293b",marginBottom:20,textAlign:"center"}}>
            {isRegister ? "สมัครสมาชิก" : "เข้าสู่ระบบ"}
          </div>

          {/* Error */}
          {error && (
            <div style={{background:"#fee2e2",color:"#991b1b",borderRadius:8,padding:"9px 12px",fontSize:13,marginBottom:14,border:"1px solid #fecaca"}}>
              ⚠️ {error}
            </div>
          )}

          {/* Username */}
          <div style={{marginBottom:12}}>
            <label style={{fontSize:12,color:"#64748b",display:"block",marginBottom:4}}>Username (Email)</label>
            <input type="email" value={username} onChange={e=>setUsername(e.target.value)}
              placeholder="example@email.com"
              onKeyDown={e=>e.key==="Enter"&&submit()}
              style={{width:"100%",padding:"11px 14px",borderRadius:10,border:"1px solid #e2e8f0",fontSize:14,outline:"none",boxSizing:"border-box",color:"#1e293b"}}
              onFocus={e=>e.target.style.borderColor="#004a99"} onBlur={e=>e.target.style.borderColor="#e2e8f0"}/>
          </div>

          {/* Password */}
          <div style={{marginBottom:20}}>
            <label style={{fontSize:12,color:"#64748b",display:"block",marginBottom:4}}>รหัสผ่าน</label>
            <div style={{position:"relative"}}>
              <input type={showPw?"text":"password"} value={password} onChange={e=>setPassword(e.target.value)}
                placeholder={isRegister?"ตั้งรหัสผ่าน (ขั้นต่ำ 6 ตัว)":"รหัสผ่าน"}
                onKeyDown={e=>e.key==="Enter"&&submit()}
                style={{width:"100%",padding:"11px 44px 11px 14px",borderRadius:10,border:"1px solid #e2e8f0",fontSize:14,outline:"none",boxSizing:"border-box",color:"#1e293b"}}
                onFocus={e=>e.target.style.borderColor="#004a99"} onBlur={e=>e.target.style.borderColor="#e2e8f0"}/>
              <button onClick={()=>setShowPw(s=>!s)} style={{position:"absolute",right:12,top:"50%",transform:"translateY(-50%)",background:"none",border:"none",cursor:"pointer",fontSize:16,color:"#94a3b8"}}>
                {showPw?"🙈":"👁️"}
              </button>
            </div>
          </div>

          {/* Submit */}
          <button onClick={submit} disabled={loading}
            style={{width:"100%",background:loading?"#94a3b8":"#004a99",color:"#fff",border:"none",padding:"13px",borderRadius:12,fontWeight:700,fontSize:15,cursor:loading?"not-allowed":"pointer",marginBottom:14,transition:"background .2s"}}>
            {loading ? "⏳ กำลังดำเนินการ..." : isRegister ? "✅ สมัครสมาชิก" : "🔑 เข้าสู่ระบบ"}
          </button>

          {/* Toggle */}
          <div style={{textAlign:"center",fontSize:13,color:"#64748b"}}>
            {isRegister ? "มีบัญชีแล้ว? " : "ยังไม่มีบัญชี? "}
            <span onClick={()=>{setIsRegister(s=>!s);setError("");}}
              style={{color:"#004a99",fontWeight:700,cursor:"pointer",textDecoration:"underline"}}>
              {isRegister ? "เข้าสู่ระบบ" : "สมัครสมาชิก"}
            </span>
          </div>
        </div>

        {/* Default credentials hint */}
        <div style={{marginTop:14,background:"rgba(255,255,255,.1)",borderRadius:10,padding:"10px 14px",fontSize:11,color:"rgba(255,255,255,.7)",textAlign:"center",border:"1px solid rgba(255,255,255,.15)"}}>
          Default: admin@thailife.app / admin1234
        </div>
      </div>
    </div>
  );
}

export default function App() {
  const [authUser, setAuthUser] = useState(null);
  const [authLoading, setAuthLoading] = useState(true);

  // ── เช็ค session ที่มีอยู่ ─────────────────────────────────────
  useState(() => {
    fetch("/api/auth/me")
      .then(r => r.ok ? r.json() : null)
      .then(u => { setAuthUser(u); setAuthLoading(false); })
      .catch(() => setAuthLoading(false));
  });

  const handleLogin = (user) => setAuthUser(user);
  const handleLogout = async () => {
    await fetch("/api/auth/logout", {method:"POST"});
    setAuthUser(null);
  };

  // ── Loading ───────────────────────────────────────────────────
  if (authLoading) return (
    <div style={{minHeight:"100vh",background:"linear-gradient(160deg,#001f5c,#004a99)",display:"flex",alignItems:"center",justifyContent:"center",fontFamily:"'Sarabun',sans-serif"}}>
      <div style={{textAlign:"center",color:"#fff"}}>
        <div style={{fontSize:40,marginBottom:12}}>🛡️</div>
        <div style={{fontSize:16,fontWeight:700}}>Thai Life Planner</div>
        <div style={{fontSize:13,opacity:.6,marginTop:6}}>กำลังโหลด...</div>
      </div>
    </div>
  );

  // ── ถ้ายังไม่ได้ login → แสดง Login screen ───────────────────
  if (!authUser) return <LoginScreen onLogin={handleLogin}/>;

  const [clients, setClients] = useState([{
    id:"1", name:"ลูกค้าใหม่", financialData:INIT_FD, goals:[], statusDates:{}, calendarEvents:[]
  }]);
  const [activeTab, setActiveTab] = useState("clients");
  const [selId, setSelId] = useState(null);
  const [calDate, setCalDate] = useState(new Date(2026,3,1));
  const [calEvents, setCalEvents] = useState([]);
  const [successGoal, setSuccessGoal] = useState("MBRT");
  const [successView, setSuccessView] = useState("รายเดือน");
  const [notif, setNotif] = useState(null);
  const [aiLoading, setAiLoading] = useState(false);
  const [aiResp, setAiResp] = useState("");
  const [compareIds, setCompareIds] = useState([]);

  const client = clients.find(c=>c.id===selId);
  const fd = client?.financialData;
  const cashflow = useMemo(()=>fd?computeCF(fd):[],[fd]);
  const irr = useMemo(()=>{
    if(!fd||!cashflow.length)return null;
    const cfs=cashflow.map(r=>r.net); cfs[0]-=fd.savings; return calcIRR(cfs);
  },[cashflow,fd]);
  const metrics = useMemo(()=>{
    if(!cashflow.length||!fd)return{};
    const totalPaid=cashflow.reduce((s,r)=>s+r.prem,0);
    const totalRec=cashflow.reduce((s,r)=>s+r.cb+r.div,0);
    const be=cashflow.find(r=>r.cr>=r.cp);
    const cov=fd.policies.reduce((s,p)=>s+p.sumAssured,0);
    const ann=fd.policies.reduce((s,p)=>{
      return s+(p.annualPremium||0)+(p.roomAndBoardPremium||0)+(p.dailyCompensationPremium||0)
        +(p.opdPremium||0)+(p.accidentLifePremium||0)+(p.accidentMedicalPremium||0)
        +(p.ciRiders||[]).reduce((x,r)=>x+r.premium,0);
    },0);
    return{totalPaid,totalRec,breakEven:be,totalCoverage:cov,totalAnnualPremium:ann,
      premRatio:((ann/(fd.income*12))*100).toFixed(1)};
  },[cashflow,fd]);

  const notify = (msg,type="success") => { setNotif({msg,type}); setTimeout(()=>setNotif(null),3000); };
  const updClient = (id,patch) => setClients(cs=>cs.map(c=>c.id===id?{...c,...patch}:c));
  const updFD = patch => updClient(selId,{financialData:{...fd,...patch}});

  const askAI = async () => {
    if(!fd)return; setAiLoading(true); setAiResp("");
    try {
      const r = await fetch("https://api.anthropic.com/v1/messages",{
        method:"POST", headers:{"Content-Type":"application/json"},
        body:JSON.stringify({ model:"claude-sonnet-4-20250514", max_tokens:1000,
          messages:[{role:"user",content:`คุณเป็นที่ปรึกษาทางการเงินมืออาชีพของไทยประกันชีวิต
ข้อมูลลูกค้า: ${client.name} | อายุ ${fd.currentAge} ปี | ${fd.gender==="Male"?"ชาย":"หญิง"} | ${fd.occupation}
รายได้ ${fmt(fd.income)} บ./เดือน | ค่าใช้จ่าย ${fmt(fd.expenses)} บ./เดือน | ออม ${fmt(fd.savings)} บ.
เกษียณอายุ ${fd.retirementAge} ปี | เป้าหมายเกษียณ ${fmt(fd.retirementGoal)} บ.
ความคุ้มครองรวม: ฿${fmt(metrics.totalCoverage||0)} | เบี้ยรวม/ปี: ฿${fmt(metrics.totalAnnualPremium||0)} (${metrics.premRatio||0}% ของรายได้)
IRR: ${irr!=null?(irr*100).toFixed(2)+"%":"—"} | คืนทุน: ${metrics.breakEven?metrics.breakEven.age+" ปี":"ยังไม่คืนทุน"}
กรมธรรม์: ${fd.policies.map(p=>`${p.name}[${TYPE_LABELS[p.type]}] ทุน฿${fmt(p.sumAssured)} เบี้ย฿${fmt(p.annualPremium)}/ปี`).join("; ")}

กรุณาวิเคราะห์และให้คำแนะนำ:
1. จุดแข็ง/อ่อนของพอร์ตนี้
2. แนะนำปรับเปลี่ยนหรือเพิ่มเติม
3. วางแผนเกษียณให้บรรลุเป้าหมาย
(ภาษาไทย กระชับ อ่านง่าย ไม่เกิน 300 คำ)`}]})
      });
      const data=await r.json();
      setAiResp(data.content?.[0]?.text||"ไม่สามารถรับคำแนะนำได้");
    } catch(e) { setAiResp("❌ เกิดข้อผิดพลาด: "+e.message); }
    setAiLoading(false);
  };

  const TABS = [
    {id:"clients",icon:"👤",label:"ลูกค้า"},
    {id:"edit",icon:"✏️",label:"แก้ไขข้อมูล",need:true},
    {id:"dashboard",icon:"📊",label:"DASHBOARD",need:true},
    {id:"coverage",icon:"🛡️",label:"ความคุ้มครอง",need:true},
    {id:"advisor",icon:"💬",label:"ที่ปรึกษา AI",need:true},
    {id:"calendar",icon:"📅",label:"ปฏิทิน"},
    {id:"summary",icon:"⊞",label:"สรุปงาน"},
    {id:"admin",icon:"⚙️",label:"ADMIN"},
  ];

  return (
    <div style={{fontFamily:"'Sarabun','Noto Sans Thai',sans-serif",background:"#f0f4f8",minHeight:"100vh",color:"#1e293b"}}>
      {notif&&<div style={{position:"fixed",top:16,right:16,zIndex:9999,background:notif.type==="success"?"#10b981":"#ef4444",color:"#fff",padding:"10px 20px",borderRadius:10,fontSize:13,boxShadow:"0 4px 16px rgba(0,0,0,0.2)",animation:"fadeIn .2s"}}>{notif.msg}</div>}

      {/* HEADER */}
      <div style={{background:"#fff",borderBottom:"1px solid #e2e8f0",padding:"12px 20px",display:"flex",justifyContent:"space-between",alignItems:"center",position:"sticky",top:0,zIndex:100,boxShadow:"0 1px 4px rgba(0,0,0,0.06)"}}>
        <div style={{display:"flex",alignItems:"center",gap:10}}>
          <div style={{width:34,height:34,background:"linear-gradient(135deg,#004a99,#0ea5e9)",borderRadius:9,display:"flex",alignItems:"center",justifyContent:"center",fontSize:17}}>🛡️</div>
          <div>
            <div style={{fontWeight:700,fontSize:16,color:"#004a99"}}>Thai Life Planner</div>
            <div style={{fontSize:10,color:"#94a3b8"}}>ระบบวางแผนการเงินตลอดชีพ</div>
          </div>
          {client&&activeTab!=="clients"&&<span style={{fontSize:11,color:"#10b981",marginLeft:8}}>✓ บันทึกแล้ว {new Date().getHours()}:{String(new Date().getMinutes()).padStart(2,"0")}</span>}
        </div>
        <div style={{textAlign:"right",fontSize:12}}>
          <div style={{color:"#94a3b8",fontSize:11}}>ยินดีต้อนรับ</div>
          <div style={{fontWeight:700,fontSize:13}}>{authUser?.username||"ผู้ใช้"}</div>
          <div style={{display:"flex",gap:6,justifyContent:"flex-end",marginTop:2}}>
            <span onClick={handleLogout} style={{color:"#ef4444",fontSize:11,cursor:"pointer"}}>ออกจากระบบ</span>
            <span style={{background:"#e0edff",color:"#004a99",fontSize:10,padding:"1px 7px",borderRadius:4,fontWeight:700}}>{(authUser?.role||"USER").toUpperCase()}</span>
          </div>
        </div>
      </div>

      {/* CONTENT */}
      <div style={{maxWidth:1100,margin:"0 auto",padding:"20px 14px 90px",width:"100%"}}>
        {activeTab==="clients"&&<ClientsView clients={clients} setClients={setClients} setSelId={setSelId} setActiveTab={setActiveTab} updClient={updClient} notify={notify}/>}
        {activeTab==="edit"&&client&&<EditView client={client} updFD={updFD} updClient={updClient} notify={notify}/>}
        {activeTab==="dashboard"&&client&&<DashView client={client} fd={fd} cashflow={cashflow} metrics={metrics} irr={irr} setActiveTab={setActiveTab} exportPDF={()=>exportPDF(client,cashflow,metrics,irr)} exportExcel={()=>exportExcel(client,cashflow)}/>}
        {activeTab==="coverage"&&client&&<CovView fd={fd}/>}
        {activeTab==="advisor"&&client&&<AdvisorView fd={fd} client={client} metrics={metrics} irr={irr} aiLoading={aiLoading} aiResp={aiResp} askAI={askAI} cashflow={cashflow} clients={clients} compareIds={compareIds} setCompareIds={setCompareIds}/>}
        {activeTab==="calendar"&&<CalView date={calDate} setDate={setCalDate} events={calEvents} setEvents={setCalEvents}/>}
        {activeTab==="summary"&&<SummaryView clients={clients} successGoal={successGoal} setSuccessGoal={setSuccessGoal} successView={successView} setSuccessView={setSuccessView}/>}
        {activeTab==="admin"&&<AdminView clients={clients}/>}
      </div>

      {/* BOTTOM NAV */}
      <div style={{position:"fixed",bottom:0,left:0,right:0,background:"#fff",borderTop:"1px solid #e2e8f0",display:"flex",justifyContent:"space-around",padding:"8px 2px 10px",zIndex:100,boxShadow:"0 -2px 8px rgba(0,0,0,0.06)"}}>
        {TABS.map(t=>{
          const dis=t.need&&!selId; const act=activeTab===t.id;
          return <button key={t.id} onClick={()=>{if(!dis)setActiveTab(t.id);}} disabled={dis}
            style={{display:"flex",flexDirection:"column",alignItems:"center",gap:1,border:"none",background:"none",cursor:dis?"not-allowed":"pointer",opacity:dis?.3:1,padding:"2px 4px",minWidth:0,flex:1}}>
            <span style={{fontSize:17}}>{t.icon}</span>
            <span style={{fontSize:9.5,color:act?"#004a99":"#64748b",fontWeight:act?700:400,whiteSpace:"nowrap"}}>{t.label}</span>
            {act&&<div style={{width:14,height:2,background:"#004a99",borderRadius:1,marginTop:1}}/>}
          </button>;
        })}
      </div>
    </div>
  );
}

// ══════════════════════════════════════════════════════════════════
// CLIENTS VIEW
// ══════════════════════════════════════════════════════════════════
function ClientsView({clients,setClients,setSelId,setActiveTab,updClient,notify}) {
  const [search,setSearch]=useState("");
  const addClient=()=>{
    const nc={id:`${Date.now()}`,name:"ลูกค้าใหม่",financialData:{...INIT_FD,policies:[{...PRESET_POLICIES[0],id:`p${Date.now()}`}]},goals:[],statusDates:{}};
    setClients(cs=>[...cs,nc]); notify("เพิ่มลูกค้าใหม่แล้ว");
  };
  const del=(id)=>{setClients(cs=>cs.filter(c=>c.id!==id)); notify("ลบลูกค้าแล้ว","error");};
  const filt=clients.filter(c=>c.name.toLowerCase().includes(search.toLowerCase()));
  return(
    <div>
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:20}}>
        <h1 style={{fontSize:26,fontWeight:700}}>รายชื่อลูกค้า</h1>
        <div style={{display:"flex",gap:10}}>
          <div style={{display:"flex",alignItems:"center",gap:8,background:"#fff",border:"1px solid #e2e8f0",borderRadius:10,padding:"8px 14px"}}>
            <span style={{color:"#94a3b8"}}>🔍</span>
            <input value={search} onChange={e=>setSearch(e.target.value)} placeholder="ค้นหาชื่อลูกค้า..." style={{border:"none",outline:"none",fontSize:14,width:180,background:"transparent"}}/>
          </div>
          <button onClick={addClient} style={{background:"#004a99",color:"#fff",border:"none",padding:"10px 20px",borderRadius:10,fontWeight:700,fontSize:14,cursor:"pointer"}}>+ เพิ่มลูกค้าใหม่</button>
        </div>
      </div>
      {filt.map(c=><ClientCard key={c.id} client={c} onEdit={()=>{setSelId(c.id);setActiveTab("edit");}} onDash={()=>{setSelId(c.id);setActiveTab("dashboard");}} onDel={()=>del(c.id)} updClient={updClient}/>)}
      {filt.length===0&&<div style={{textAlign:"center",padding:48,color:"#94a3b8"}}>ไม่พบลูกค้า</div>}
    </div>
  );
}

function ClientCard({client,onEdit,onDash,onDel,updClient}) {
  const cov=(client.financialData?.policies||[]).reduce((s,p)=>s+p.sumAssured,0);
  const sd=client.statusDates||{};
  const upd=(k,f,v)=>updClient(client.id,{statusDates:{...sd,[k]:{...(sd[k]||{}),[f]:v}}});
  return(
    <div style={{background:"#fff",borderRadius:14,padding:20,border:"1px solid #e2e8f0",marginBottom:14,boxShadow:"0 1px 4px rgba(0,0,0,0.04)"}}>
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:16}}>
        <div style={{display:"flex",alignItems:"center",gap:12}}>
          <div style={{width:44,height:44,borderRadius:"50%",background:"#f1f5f9",display:"flex",alignItems:"center",justifyContent:"center",fontSize:20}}>👤</div>
          <div>
            <div style={{fontWeight:700,fontSize:17}}>{client.name}</div>
            <div style={{fontSize:12,color:"#64748b"}}>ความคุ้มครองรวม: ฿{fmt(cov)}</div>
          </div>
        </div>
        <div style={{display:"flex",gap:8}}>
          <button onClick={onEdit} style={{background:"#f8fafc",border:"1px solid #e2e8f0",padding:"7px 14px",borderRadius:8,cursor:"pointer",fontSize:13,fontWeight:500}}>✏️ แก้ไข</button>
          <button onClick={onDel} style={{background:"#fff",border:"1px solid #e2e8f0",padding:"7px 10px",borderRadius:8,cursor:"pointer"}}>🗑️</button>
          <button onClick={onDash} style={{background:"#004a99",color:"#fff",border:"none",padding:"7px 14px",borderRadius:8,cursor:"pointer",fontSize:13,fontWeight:600}}>Dashboard ›</button>
        </div>
      </div>
      <div style={{fontSize:11,fontWeight:600,color:"#475569",marginBottom:8}}>สถานะการดำเนินการ</div>
      <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(140px,1fr))",gap:8}}>
        {STATUS_STEPS.map(step=>{
          const s=sd[step.key]||{};
          return(
            <div key={step.key} style={{background:"#f8fafc",borderRadius:10,padding:"10px 11px",border:`1px solid ${s.isCompleted?"#bbf7d0":s.isSkipped?"#fecaca":"#e2e8f0"}`}}>
              <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:6}}>
                <span style={{fontSize:10,fontWeight:600,color:"#475569",lineHeight:1.2}}>{step.label}</span>
                <div style={{display:"flex",gap:3}}>
                  <button onClick={()=>upd(step.key,"isCompleted",!s.isCompleted)}
                    style={{width:20,height:20,borderRadius:4,border:"none",background:s.isCompleted?"#10b981":"#e2e8f0",color:"#fff",cursor:"pointer",fontSize:10,display:"flex",alignItems:"center",justifyContent:"center",fontWeight:700}}>✓</button>
                  <button onClick={()=>upd(step.key,"isSkipped",!s.isSkipped)}
                    style={{width:20,height:20,borderRadius:4,border:"none",background:s.isSkipped?"#ef4444":"#e2e8f0",color:"#fff",cursor:"pointer",fontSize:10,display:"flex",alignItems:"center",justifyContent:"center",fontWeight:700}}>✕</button>
                </div>
              </div>
              <input type="date" value={s.date||""} onChange={e=>upd(step.key,"date",e.target.value)}
                style={{width:"100%",padding:"3px 6px",borderRadius:5,border:"1px solid #e2e8f0",fontSize:10,boxSizing:"border-box"}}/>
              {step.key==="meeting"&&<input value={s.note||""} onChange={e=>upd(step.key,"note",e.target.value)}
                placeholder="เบี้ยที่คาดปิดได้" style={{width:"100%",marginTop:3,padding:"3px 6px",borderRadius:5,border:"1px solid #e2e8f0",fontSize:10,boxSizing:"border-box"}}/>}
              {step.key==="paymentAppointment"&&<input value={s.premium||""} onChange={e=>upd(step.key,"premium",e.target.value)}
                placeholder="เบี้ยปีแรก" style={{width:"100%",marginTop:3,padding:"3px 6px",borderRadius:5,border:"1px solid #e2e8f0",fontSize:10,boxSizing:"border-box"}}/>}
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ══════════════════════════════════════════════════════════════════
// EDIT VIEW
// ══════════════════════════════════════════════════════════════════
function EditView({client,updFD,updClient,notify}) {
  const fd=client.financialData;
  const [open,setOpen]=useState({s1:true,s2:false,s3:false});
  const [draft,setDraft]=useState(null);
  const [showPreset,setShowPreset]=useState(false);
  const [name,setName]=useState(client.name);

  const editP=p=>{setDraft({...p});};
  const saveP=()=>{
    if(!draft)return;
    const exists=fd.policies.find(p=>p.id===draft.id);
    if(exists)updFD({policies:fd.policies.map(p=>p.id===draft.id?draft:p)});
    else updFD({policies:[...fd.policies,draft]});
    setDraft(null); notify("บันทึกกรมธรรม์แล้ว");
  };
  const addPreset=p=>{
    const np={...p,id:`${Date.now()}`};
    updFD({policies:[...fd.policies,np]});
    setShowPreset(false); notify(`เพิ่ม "${p.name}" แล้ว`);
  };
  const remP=id=>updFD({policies:fd.policies.filter(p=>p.id!==id)});
  const addRange=(f)=>setDraft(d=>({...d,[f]:[...(d[f]||[]),{id:`${Date.now()}`,amount:0,startAge:fd.currentAge,endAge:99}]}));
  const remRange=(f,id)=>setDraft(d=>({...d,[f]:(d[f]||[]).filter(r=>r.id!==id)}));
  const updRange=(f,id,k,v)=>setDraft(d=>({...d,[f]:(d[f]||[]).map(r=>r.id===id?{...r,[k]:v}:r)}));

  const F=({label,field,type="number",sel})=>(
    <div>
      <label style={{fontSize:11,color:"#64748b",display:"block",marginBottom:3}}>{label}</label>
      {sel?<select value={draft?.[field]||""} onChange={e=>setDraft(d=>({...d,[field]:e.target.value}))} style={{width:"100%",padding:"9px 10px",borderRadius:8,border:"1px solid #e2e8f0",fontSize:13}}>
        {sel.map(o=><option key={o.v} value={o.v}>{o.l}</option>)}
      </select>:<input type={type} value={draft?.[field]||""} onChange={e=>setDraft(d=>({...d,[field]:type==="number"?+e.target.value:e.target.value}))} style={{width:"100%",padding:"9px 10px",borderRadius:8,border:"1px solid #e2e8f0",fontSize:13,boxSizing:"border-box"}}/>}
    </div>
  );

  return(
    <div style={{maxWidth:700,margin:"0 auto"}}>
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:16}}>
        <h2 style={{fontSize:19,fontWeight:700}}>แก้ไขข้อมูลลูกค้า: {client.name}</h2>
        <span style={{fontSize:11,color:"#10b981"}}>● บันทึกอัตโนมัติ {new Date().toLocaleTimeString("th-TH")}</span>
      </div>

      {/* S1 */}
      <Sec title="👤 ส่วนที่ 1: ข้อมูลลูกค้า" open={open.s1} toggle={()=>setOpen(o=>({...o,s1:!o.s1}))}>
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:12}}>
          <div style={{gridColumn:"1/-1"}}>
            <label style={{fontSize:11,color:"#64748b",display:"block",marginBottom:3}}>ชื่อ-นามสกุล</label>
            <input value={name} onChange={e=>{setName(e.target.value);updClient(client.id,{name:e.target.value});}} style={{width:"100%",padding:"10px 14px",borderRadius:10,border:"1px solid #e2e8f0",fontSize:14,boxSizing:"border-box"}}/>
          </div>
          <div>
            <label style={{fontSize:11,color:"#64748b",display:"block",marginBottom:3}}>เพศ</label>
            <select value={fd.gender} onChange={e=>updFD({gender:e.target.value})} style={{width:"100%",padding:"10px 14px",borderRadius:10,border:"1px solid #e2e8f0",fontSize:14}}>
              <option value="Male">ชาย</option><option value="Female">หญิง</option>
            </select>
          </div>
          {[["วันเดือนปีเกิด","birthDate","text"],["อายุปัจจุบัน","currentAge"],["อายุเกษียณ","retirementAge"],["อาชีพ","occupation","text"],["รายได้/เดือน","income"],["รายจ่าย/เดือน","expenses"],["รายได้หลังเกษียณ/เดือน","postRetirementIncome"]].map(([l,f,t="number"])=>(
            <div key={f}>
              <label style={{fontSize:11,color:"#64748b",display:"block",marginBottom:3}}>{l}</label>
              <input type={t} value={fd[f]||""} onChange={e=>updFD({[f]:t==="number"?+e.target.value:e.target.value})} style={{width:"100%",padding:"10px 14px",borderRadius:10,border:"1px solid #e2e8f0",fontSize:14,boxSizing:"border-box"}}/>
            </div>
          ))}
          <div>
            <label style={{fontSize:11,color:"#64748b",display:"block",marginBottom:3}}>เงินออมคงเหลือ/เดือน</label>
            <div style={{padding:"10px 14px",borderRadius:10,border:"2px solid #10b981",background:"#f0fdf4",fontWeight:700,fontSize:16,color:"#10b981"}}>฿{fmt(fd.income-fd.expenses)}</div>
          </div>
        </div>
      </Sec>

      {/* S2 */}
      <Sec title="🛡️ ส่วนที่ 2: ข้อมูลกรมธรรม์" open={open.s2} toggle={()=>setOpen(o=>({...o,s2:!o.s2}))}>
        {/* Preset picker */}
        <div style={{marginBottom:14}}>
          <button onClick={()=>setShowPreset(s=>!s)} style={{background:"#eff6ff",color:"#004a99",border:"1px solid #bfdbfe",padding:"8px 16px",borderRadius:8,cursor:"pointer",fontWeight:600,fontSize:13,marginRight:8}}>
            📋 เลือกจากแบบสำเร็จรูป
          </button>
          <button onClick={()=>{setDraft(mkPolicy());}} style={{background:"#f0fdf4",color:"#10b981",border:"1px dashed #86efac",padding:"8px 16px",borderRadius:8,cursor:"pointer",fontWeight:600,fontSize:13}}>
            + เพิ่มกรมธรรม์กำหนดเอง
          </button>
        </div>

        {showPreset&&(
          <div style={{background:"#f8fafc",borderRadius:12,padding:16,marginBottom:14,border:"1px solid #e2e8f0"}}>
            <div style={{fontWeight:600,marginBottom:10,fontSize:14}}>เลือกแบบประกันสำเร็จรูป</div>
            <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(200px,1fr))",gap:10}}>
              {PRESET_POLICIES.map(p=>(
                <div key={p.id} style={{background:"#fff",borderRadius:10,padding:"12px 14px",border:"1px solid #e2e8f0",cursor:"pointer"}} onClick={()=>addPreset(p)}>
                  <div style={{fontWeight:600,fontSize:13,marginBottom:4}}>{p.name}</div>
                  <div style={{fontSize:11,color:"#64748b",marginBottom:6}}>{p.desc}</div>
                  <div style={{display:"flex",gap:6,flexWrap:"wrap"}}>
                    <span style={{background:"#eff6ff",color:"#004a99",fontSize:10,padding:"2px 7px",borderRadius:5,fontWeight:600}}>{TYPE_LABELS[p.type]}</span>
                    {p.sumAssured>0&&<span style={{background:"#f0fdf4",color:"#10b981",fontSize:10,padding:"2px 7px",borderRadius:5}}>฿{fmtK(p.sumAssured)}</span>}
                    <span style={{background:"#fff7ed",color:"#f59e0b",fontSize:10,padding:"2px 7px",borderRadius:5}}>฿{fmtK(p.annualPremium)}/ปี</span>
                  </div>
                </div>
              ))}
            </div>
            <button onClick={()=>setShowPreset(false)} style={{marginTop:10,background:"#f1f5f9",border:"none",padding:"6px 14px",borderRadius:6,cursor:"pointer",fontSize:12}}>ปิด</button>
          </div>
        )}

        {/* Policy editor */}
        {draft&&(
          <div style={{background:"#f8fafc",borderRadius:12,padding:18,marginBottom:14,border:"2px solid #004a99"}}>
            <div style={{fontWeight:700,marginBottom:14,fontSize:14,color:"#004a99"}}>✏️ {fd.policies.find(p=>p.id===draft.id)?"แก้ไข":"เพิ่ม"}กรมธรรม์</div>
            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10,marginBottom:12}}>
              <F label="ชื่อแบบประกัน" field="name" type="text"/>
              <F label="ประเภท" field="type" sel={Object.entries(TYPE_LABELS).map(([v,l])=>({v,l}))}/>
              <F label="ทุนประกัน (บาท)" field="sumAssured"/>
              <F label="เบี้ยสัญญาหลัก/ปี" field="annualPremium"/>
              <F label="เบี้ยปีแรก" field="firstYearPremium"/>
              <F label="ระยะเวลาชำระ (ปี)" field="paymentTerm"/>
              <F label="คุ้มครองถึงอายุ" field="coverageUntilAge"/>
              <F label="ผลประโยชน์ครบสัญญา" field="maturityBenefit"/>
              <F label="เบี้ยค่าห้อง/ปี" field="roomAndBoardPremium"/>
              <F label="ค่าห้อง/วัน (บาท)" field="roomAndBoard"/>
              <F label="เบี้ยชดเชยรายวัน/ปี" field="dailyCompensationPremium"/>
              <F label="เบี้ย OPD/ปี" field="opdPremium"/>
              <F label="เบี้ยอุบัติเหตุชีวิต/ปี" field="accidentLifePremium"/>
              <F label="เบี้ยอุบัติเหตุรักษา/ปี" field="accidentMedicalPremium"/>
            </div>
            <RangeEd label="เงินคืนตามช่วงอายุ" color="#10b981" ranges={draft.cashBackRanges||[]}
              onAdd={()=>addRange("cashBackRanges")} onRem={id=>remRange("cashBackRanges",id)}
              onChange={(id,k,v)=>updRange("cashBackRanges",id,k,v)}/>
            <RangeEd label="เงินปันผลตามช่วงอายุ" color="#f59e0b" ranges={draft.dividendRanges||[]}
              onAdd={()=>addRange("dividendRanges")} onRem={id=>remRange("dividendRanges",id)}
              onChange={(id,k,v)=>updRange("dividendRanges",id,k,v)}/>
            <div style={{display:"flex",gap:8,marginTop:12}}>
              <button onClick={saveP} style={{background:"#004a99",color:"#fff",border:"none",padding:"10px 22px",borderRadius:8,fontWeight:700,cursor:"pointer"}}>💾 บันทึก</button>
              <button onClick={()=>setDraft(null)} style={{background:"#f1f5f9",border:"none",padding:"10px 16px",borderRadius:8,cursor:"pointer",color:"#64748b"}}>ยกเลิก</button>
            </div>
          </div>
        )}

        {fd.policies.map((p,i)=>(
          <div key={p.id} style={{background:draft?.id===p.id?"#eff6ff":"#f8fafc",borderRadius:10,padding:"12px 14px",marginBottom:8,border:`1px solid ${draft?.id===p.id?"#004a99":"#e2e8f0"}`,display:"flex",justifyContent:"space-between",alignItems:"center"}}>
            <div>
              <div style={{fontWeight:600,fontSize:13}}>{i+1}. {p.name} <span style={{fontSize:11,color:"#64748b",fontWeight:400}}>[{TYPE_LABELS[p.type]}]</span></div>
              <div style={{fontSize:11,color:"#94a3b8",marginTop:2}}>ทุน ฿{fmt(p.sumAssured)} · เบี้ย ฿{fmt(p.annualPremium)}/ปี · ชำระ {p.paymentTerm} ปี · คุ้มครองถึงอายุ {p.coverageUntilAge}</div>
            </div>
            <div style={{display:"flex",gap:6}}>
              <button onClick={()=>editP(p)} style={{background:"#eff6ff",color:"#004a99",border:"none",padding:"5px 12px",borderRadius:6,cursor:"pointer",fontSize:12,fontWeight:600}}>แก้ไข</button>
              <button onClick={()=>remP(p.id)} style={{background:"#fee2e2",color:"#ef4444",border:"none",padding:"5px 10px",borderRadius:6,cursor:"pointer",fontSize:12}}>ลบ</button>
            </div>
          </div>
        ))}
      </Sec>

      {/* S3 */}
      <Sec title="🎯 ส่วนที่ 3: เป้าหมายการเงิน" open={open.s3} toggle={()=>setOpen(o=>({...o,s3:!o.s3}))}>
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:12}}>
          {[["เป้าหมายเงินเกษียณ (บาท)","retirementGoal"],["เงินออมปัจจุบัน (บาท)","savings"]].map(([l,f])=>(
            <div key={f}>
              <label style={{fontSize:11,color:"#64748b",display:"block",marginBottom:3}}>{l}</label>
              <input type="number" value={fd[f]||0} onChange={e=>updFD({[f]:+e.target.value})} style={{width:"100%",padding:"10px 14px",borderRadius:10,border:"1px solid #e2e8f0",fontSize:14,boxSizing:"border-box"}}/>
            </div>
          ))}
        </div>
      </Sec>

      <button onClick={()=>notify("💾 บันทึกข้อมูลเรียบร้อยแล้ว")} style={{width:"100%",background:"linear-gradient(135deg,#10b981,#059669)",color:"#fff",border:"none",padding:"16px",borderRadius:14,fontWeight:700,fontSize:16,cursor:"pointer",marginTop:4}}>
        💾 บันทึกข้อมูล
      </button>
    </div>
  );
}

const Sec=({title,open,toggle,children})=>(
  <div style={{background:"#fff",borderRadius:16,marginBottom:12,border:"1px solid #e2e8f0",overflow:"hidden"}}>
    <button onClick={toggle} style={{width:"100%",padding:"16px 20px",display:"flex",justifyContent:"space-between",alignItems:"center",border:"none",background:"none",cursor:"pointer",textAlign:"left"}}>
      <span style={{fontWeight:700,fontSize:15}}>{title}</span>
      <span style={{fontSize:16,color:"#94a3b8"}}>{open?"∧":"∨"}</span>
    </button>
    {open&&<div style={{padding:"0 20px 20px"}}>{children}</div>}
  </div>
);

const RangeEd=({label,color,ranges,onAdd,onRem,onChange})=>(
  <div style={{marginBottom:12}}>
    <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:6}}>
      <span style={{fontSize:12,fontWeight:600,color:"#475569"}}>{label}</span>
      <button onClick={onAdd} style={{fontSize:11,background:`${color}20`,color,border:"none",padding:"3px 10px",borderRadius:5,cursor:"pointer",fontWeight:600}}>+ เพิ่ม</button>
    </div>
    {ranges.map(r=>(
      <div key={r.id} style={{display:"grid",gridTemplateColumns:"1fr 70px 70px 26px",gap:6,marginBottom:5}}>
        <input type="number" placeholder="จำนวน บ./ปี" value={r.amount} onChange={e=>onChange(r.id,"amount",+e.target.value)} style={{padding:"6px 8px",borderRadius:6,border:"1px solid #e2e8f0",fontSize:12}}/>
        <input type="number" placeholder="อายุเริ่ม" value={r.startAge} onChange={e=>onChange(r.id,"startAge",+e.target.value)} style={{padding:"6px 8px",borderRadius:6,border:"1px solid #e2e8f0",fontSize:12}}/>
        <input type="number" placeholder="ถึงอายุ" value={r.endAge} onChange={e=>onChange(r.id,"endAge",+e.target.value)} style={{padding:"6px 8px",borderRadius:6,border:"1px solid #e2e8f0",fontSize:12}}/>
        <button onClick={()=>onRem(r.id)} style={{background:"#fee2e2",color:"#ef4444",border:"none",borderRadius:5,cursor:"pointer",fontWeight:700}}>×</button>
      </div>
    ))}
  </div>
);

// ══════════════════════════════════════════════════════════════════
// DASHBOARD VIEW
// ══════════════════════════════════════════════════════════════════
function DashView({client,fd,cashflow,metrics,irr,setActiveTab,exportPDF,exportExcel}) {
  return(
    <div style={{display:"flex",flexDirection:"column",gap:16}}>
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",flexWrap:"wrap",gap:8}}>
        <div style={{display:"flex",alignItems:"center",gap:6,fontSize:13}}>
          <button onClick={()=>setActiveTab("clients")} style={{background:"none",border:"none",color:"#004a99",cursor:"pointer",fontWeight:700}}>‹ กลับไปรายชื่อลูกค้า</button>
          <span style={{color:"#94a3b8"}}>/</span>
          <span style={{fontWeight:600}}>Dashboard: {client.name}</span>
        </div>
        <div style={{display:"flex",gap:8}}>
          <button onClick={exportExcel} style={{background:"#fff",border:"1px solid #e2e8f0",padding:"7px 16px",borderRadius:8,fontSize:13,cursor:"pointer",fontWeight:500}}>📊 Excel</button>
          <button onClick={exportPDF} style={{background:"#004a99",color:"#fff",border:"none",padding:"7px 16px",borderRadius:8,fontSize:13,cursor:"pointer",fontWeight:600}}>📄 PDF</button>
        </div>
      </div>

      {/* Exec summary */}
      <div style={{background:"#004a99",borderRadius:16,padding:"22px 26px",color:"#fff"}}>
        <div style={{fontWeight:700,fontSize:16,marginBottom:14}}>ℹ Executive Summary</div>
        <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(130px,1fr))",gap:18}}>
          {[{l:"ความคุ้มครองรวม",v:`฿${fmt(metrics.totalCoverage||0)}`},
            {l:"ภาระเบี้ยต่อรายได้",v:`${metrics.premRatio||0}%`},
            {l:"อายุที่เริ่มคืนทุน",v:metrics.breakEven?`${metrics.breakEven.age} ปี`:"—"},
            {l:"IRR พอร์ตรวม",v:irr!=null?`${(irr*100).toFixed(2)}%`:"—"},
          ].map((m,i)=>(
            <div key={i}><div style={{fontSize:10,opacity:.7,marginBottom:3}}>{m.l}</div><div style={{fontSize:20,fontWeight:700}}>{m.v}</div></div>
          ))}
        </div>
      </div>

      <div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:12}}>
        {[{l:"รายได้สุทธิ/เดือน",v:`฿${fmt(fd.income-fd.expenses)}`,i:"💳",bg:"#eff6ff"},
          {l:"จำนวนกรมธรรม์",v:`${fd.policies.length} ฉบับ`,i:"🛡️",bg:"#fffbeb"},
          {l:"เงินออมสะสมปัจจุบัน",v:`฿${fmt(fd.savings)}`,i:"📈",bg:"#f0fdf4"}
        ].map((m,i)=>(
          <div key={i} style={{background:"#fff",borderRadius:14,padding:18,border:"1px solid #e2e8f0"}}>
            <div style={{width:34,height:34,background:m.bg,borderRadius:8,fontSize:16,display:"flex",alignItems:"center",justifyContent:"center",marginBottom:10}}>{m.i}</div>
            <div style={{fontSize:11,color:"#64748b",marginBottom:3}}>{m.l}</div>
            <div style={{fontSize:18,fontWeight:700}}>{m.v}</div>
          </div>
        ))}
      </div>

      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:14}}>
        <div style={{background:"#fff",borderRadius:14,padding:18,border:"1px solid #e2e8f0"}}>
          <div style={{fontWeight:600,fontSize:13,marginBottom:10}}>⚡ กระแสเงินสดสะสม (จนอายุ 99)</div>
          <ResponsiveContainer width="100%" height={220}>
            <AreaChart data={cashflow}>
              <defs><linearGradient id="gc" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="#004a99" stopOpacity={.12}/><stop offset="95%" stopColor="#004a99" stopOpacity={0}/></linearGradient></defs>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9"/>
              <XAxis dataKey="age" tick={{fontSize:9}} tickLine={false} axisLine={false} tickFormatter={v=>v%10===0?v:""} interval={0}/>
              <YAxis tickFormatter={v=>`฿${fmtK(v)}`} tick={{fontSize:9}} tickLine={false} axisLine={false}/>
              <Tooltip formatter={v=>[`฿${fmt(v)}`,"เงินสดสะสม"]} labelFormatter={l=>`อายุ ${l}`}/>
              <ReferenceLine y={0} stroke="#ef4444" strokeDasharray="4 2"/>
              <Area type="monotone" dataKey="cc" stroke="#004a99" fill="url(#gc)" strokeWidth={2.5} dot={false}/>
            </AreaChart>
          </ResponsiveContainer>
        </div>
        <div style={{background:"#fff",borderRadius:14,padding:18,border:"1px solid #e2e8f0"}}>
          <div style={{fontWeight:600,fontSize:13,marginBottom:10}}>📈 วิเคราะห์เงินออมและเบี้ยรายปี</div>
          <div style={{display:"flex",gap:10,marginBottom:6,fontSize:10,flexWrap:"wrap"}}>
            {[{c:"#10b981",l:"เงินออมคงเหลือ"},{c:"#ef4444",l:"เบี้ยประกัน"},{c:"#004a99",l:"ผลต่างสุทธิ"}].map((x,i)=>(
              <span key={i} style={{display:"flex",alignItems:"center",gap:3,color:"#64748b"}}>
                <span style={{width:8,height:8,background:x.c,borderRadius:2,display:"inline-block"}}/>{x.l}
              </span>
            ))}
          </div>
          <ResponsiveContainer width="100%" height={200}>
            <AreaChart data={cashflow}>
              <defs>
                <linearGradient id="gs" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="#10b981" stopOpacity={.1}/><stop offset="95%" stopColor="#10b981" stopOpacity={0}/></linearGradient>
                <linearGradient id="gp" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="#ef4444" stopOpacity={.1}/><stop offset="95%" stopColor="#ef4444" stopOpacity={0}/></linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9"/>
              <XAxis dataKey="age" tick={{fontSize:9}} tickLine={false} axisLine={false} tickFormatter={v=>v%10===0?v:""} interval={0}/>
              <YAxis tickFormatter={v=>`฿${fmtK(v)}`} tick={{fontSize:9}} tickLine={false} axisLine={false}/>
              <Tooltip labelFormatter={l=>`อายุ ${l}`} formatter={(v,n)=>[`฿${fmt(v)}`,n]}/>
              <Area name="เงินออมคงเหลือ" type="monotone" dataKey="sv" stroke="#10b981" fill="url(#gs)" strokeWidth={2} dot={false}/>
              <Area name="เบี้ยประกัน" type="monotone" dataKey="prem" stroke="#ef4444" fill="url(#gp)" strokeWidth={2} dot={false}/>
              <Line name="ผลต่างสุทธิ" type="monotone" dataKey="net" stroke="#004a99" strokeWidth={2} strokeDasharray="5 3" dot={false}/>
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Table */}
      <div style={{background:"#fff",borderRadius:14,padding:18,border:"1px solid #e2e8f0"}}>
        <div style={{fontWeight:600,fontSize:14,marginBottom:12}}>📋 ตารางกระแสเงินสดรายปี</div>
        <div style={{overflowX:"auto",maxHeight:400,overflowY:"auto"}}>
          <table style={{width:"100%",borderCollapse:"collapse",fontSize:12}}>
            <thead style={{position:"sticky",top:0,background:"#f8fafc",zIndex:5}}>
              <tr>{["ปี","อายุ","เงินออม/ปี","เบี้ยจ่าย","เงินคืน","ปันผล","ผลต่าง","เงินสะสม"].map((h,i)=>(
                <th key={i} style={{padding:"9px 10px",textAlign:i<=1?"left":"right",color:"#64748b",fontWeight:600,fontSize:11,borderBottom:"2px solid #e2e8f0",whiteSpace:"nowrap"}}>{h}</th>
              ))}</tr>
            </thead>
            <tbody>
              {cashflow.map((r,i)=>(
                <tr key={r.age} style={{background:metrics.breakEven?.age===r.age?"#fef9c3":i%2===0?"#fff":"#f8fafc"}}>
                  <td style={{padding:"7px 10px",fontWeight:r.age%10===0?700:400}}>{r.year}</td>
                  <td style={{padding:"7px 10px"}}>{r.age}{r.age===fd.currentAge?" ★":""}</td>
                  <td style={{padding:"7px 10px",textAlign:"right"}}>฿{fmt(r.sv)}</td>
                  <td style={{padding:"7px 10px",textAlign:"right",color:"#ef4444"}}>฿{fmt(r.prem)}</td>
                  <td style={{padding:"7px 10px",textAlign:"right",color:"#10b981"}}>฿{fmt(r.cb)}</td>
                  <td style={{padding:"7px 10px",textAlign:"right",color:"#0ea5e9"}}>฿{fmt(r.div)}</td>
                  <td style={{padding:"7px 10px",textAlign:"right",fontWeight:600,color:r.net>=0?"#10b981":"#ef4444"}}>฿{fmt(r.net)}</td>
                  <td style={{padding:"7px 10px",textAlign:"right",fontWeight:700,color:"#004a99"}}>฿{fmt(r.cc)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div style={{textAlign:"center",fontSize:11,color:"#94a3b8",marginTop:8,fontStyle:"italic"}}>แสดงข้อมูลจนถึงอายุ 99 ปี · 🟡 = อายุคืนทุน · ★ = อายุปัจจุบัน</div>
      </div>
    </div>
  );
}

// ══════════════════════════════════════════════════════════════════
// COVERAGE
// ══════════════════════════════════════════════════════════════════
function CovView({fd}) {
  const cov=(fd?.policies||[]).reduce((s,p)=>s+p.sumAssured,0);
  const b={
    life:fd.policies.filter(p=>p.type==="Life").reduce((s,p)=>s+p.sumAssured,0),
    savings:fd.policies.filter(p=>p.type==="Savings").reduce((s,p)=>s+p.sumAssured,0),
    pension:fd.policies.filter(p=>p.type==="Pension").reduce((s,p)=>s+p.sumAssured,0),
    unitLink:fd.policies.filter(p=>p.type==="UnitLink").reduce((s,p)=>s+p.sumAssured,0),
    rb:fd.policies.reduce((s,p)=>s+p.roomAndBoard,0),
    opd:fd.policies.reduce((s,p)=>s+p.opd,0),
    dc:fd.policies.reduce((s,p)=>s+p.dailyCompensation,0),
    al:fd.policies.reduce((s,p)=>s+p.accidentLife,0),
    am:fd.policies.reduce((s,p)=>s+p.accidentMedical,0),
    ci:fd.policies.reduce((s,p)=>s+(p.ciRiders||[]).reduce((x,r)=>x+r.sumAssured,0),0),
  };
  const ideal=fd.income*12*5; const gap=Math.max(0,ideal-(b.life+b.savings+b.pension));
  const Item=({l,v,unit="บาท",g,sub})=>(
    <div style={{display:"flex",alignItems:"center",gap:12,padding:"13px 0",borderBottom:"1px solid #f8fafc"}}>
      <div style={{flex:1}}>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:3}}>
          <div><div style={{fontSize:13,fontWeight:500}}>{l}</div>{sub&&<div style={{fontSize:10,color:"#94a3b8",marginTop:1}}>{sub}</div>}</div>
          <span style={{color:"#e2e8f0",fontSize:14}}>›</span>
        </div>
        <div style={{height:3,background:"#f1f5f9",borderRadius:2,marginBottom:5}}>
          <div style={{height:"100%",background:g&&g>0?"#fbbf24":"#38bdf8",borderRadius:2,width:v>0?"100%":"0%"}}/>
        </div>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center"}}>
          <span style={{fontWeight:700,fontSize:13}}>{fmt(v)} <span style={{fontWeight:400,fontSize:10,color:"#94a3b8"}}>{unit}</span></span>
          {g!=null&&<span style={{fontSize:10,padding:"2px 7px",borderRadius:8,background:g>0?"#fef3c7":"#f0fdf4",color:g>0?"#f59e0b":"#10b981",fontWeight:500}}>{g>0?`ขาดอีก ฿${fmt(g)}`:"เหมาะสม"}</span>}
        </div>
      </div>
    </div>
  );
  return(
    <div style={{display:"flex",flexDirection:"column",gap:14}}>
      <div style={{background:"linear-gradient(135deg,#38bdf8,#0284c7)",borderRadius:18,padding:"26px",color:"#fff",textAlign:"center"}}>
        <div style={{fontSize:12,opacity:.8,marginBottom:5}}>จำนวนเงินเอาประกันภัยรวม ℹ</div>
        <div style={{fontSize:36,fontWeight:700}}>฿{fmt(cov)} บาท</div>
        <div style={{fontSize:11,opacity:.6,marginTop:4}}>{fd.policies.length} กรมธรรม์</div>
      </div>
      <div style={{background:"#fff",borderRadius:14,padding:"4px 18px",border:"1px solid #e2e8f0"}}>
        <div style={{fontWeight:700,fontSize:14,padding:"14px 0 6px"}}>สัญญาประกันชีวิต</div>
        <Item l="เน้นคุ้มครองชีวิต" v={b.life} sub={`เป้า: ฿${fmt(ideal)} (รายได้ 5 ปี)`} g={gap}/>
        <Item l="เน้นสะสมทรัพย์" v={b.savings}/>
        <Item l="เน้นการลงทุน" v={b.unitLink}/>
        <Item l="เน้นการเกษียณ" v={b.pension} g={b.pension===0?1:0}/>
      </div>
      <div style={{background:"#fff",borderRadius:14,padding:"4px 18px",border:"1px solid #e2e8f0"}}>
        <div style={{fontWeight:700,fontSize:14,padding:"14px 0 6px"}}>สัญญาเพิ่มเติม</div>
        <Item l="ค่าห้อง/อาหาร ผู้ป่วยใน" v={b.rb} unit="บาท/วัน"/>
        <Item l="ค่ารักษา OPD" v={b.opd} unit="บาท/ปี"/>
        <Item l="ค่าชดเชยรายวัน" v={b.dc} unit="บาท/วัน"/>
        <Item l="อุบัติเหตุ (ชีวิต)" v={b.al}/>
        <Item l="อุบัติเหตุ (ค่ารักษา)" v={b.am} unit="บาท/ครั้ง"/>
        <Item l="โรคร้ายแรง (CI)" v={b.ci}/>
      </div>
    </div>
  );
}

// ══════════════════════════════════════════════════════════════════
// ADVISOR + IRR + COMPARE
// ══════════════════════════════════════════════════════════════════
function AdvisorView({fd,client,metrics,irr,aiLoading,aiResp,askAI,cashflow,clients,compareIds,setCompareIds}) {
  const [tab,setTab]=useState("advisor");
  const pIRRs=(fd?.policies||[]).map(p=>{
    const cfs=cashflow.map(r=>(r.pp[p.id]?.returns||0)-(r.pp[p.id]?.premium||0));
    return{...p,irr:calcIRR(cfs)};
  });
  const cmpData=useMemo(()=>{
    if(compareIds.length<2)return null;
    return compareIds.map(id=>{
      const c=clients.find(x=>x.id===id); if(!c)return null;
      const cf=computeCF(c.financialData);
      const cfs=cf.map(r=>r.net); cfs[0]-=c.financialData.savings;
      const i=calcIRR(cfs);
      return{id,name:c.name,cf,irr:i,totalPaid:cf.reduce((s,r)=>s+r.prem,0),totalRec:cf.reduce((s,r)=>s+r.cb+r.div,0),be:cf.find(r=>r.cr>=r.cp)?.age};
    }).filter(Boolean);
  },[compareIds,clients]);

  return(
    <div style={{display:"flex",flexDirection:"column",gap:14}}>
      <div style={{display:"flex",gap:0,borderBottom:"1px solid #e2e8f0"}}>
        {[{id:"advisor",l:"💬 AI Advisor"},{id:"irr",l:"📊 IRR"},{id:"compare",l:"⚖️ เปรียบเทียบ"}].map(t=>(
          <button key={t.id} onClick={()=>setTab(t.id)} style={{padding:"10px 18px",border:"none",background:"none",cursor:"pointer",fontSize:13,fontWeight:tab===t.id?700:400,color:tab===t.id?"#004a99":"#64748b",borderBottom:tab===t.id?"2px solid #004a99":"2px solid transparent"}}>{t.l}</button>
        ))}
      </div>

      {tab==="advisor"&&(
        <div style={{display:"flex",flexDirection:"column",gap:14}}>
          <div style={{background:"linear-gradient(135deg,#004a99,#7c3aed)",borderRadius:14,padding:"18px 22px",color:"#fff"}}>
            <div style={{fontSize:16,fontWeight:700,marginBottom:3}}>💬 AI Financial Advisor</div>
            <div style={{fontSize:12,opacity:.85}}>วิเคราะห์พอร์ตประกันด้วย Claude AI · คำแนะนำเฉพาะบุคคลภาษาไทย</div>
          </div>
          <div style={{background:"#fff",borderRadius:14,padding:18,border:"1px solid #e2e8f0"}}>
            <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(150px,1fr))",gap:8,marginBottom:14}}>
              {[{l:"ลูกค้า",v:client.name},{l:"อายุ",v:`${fd.currentAge} ปี`},{l:"ความคุ้มครองรวม",v:`฿${fmtK(metrics.totalCoverage||0)}`},
                {l:"เบี้ย/รายได้",v:`${metrics.premRatio||0}%`},{l:"IRR รวม",v:irr!=null?`${(irr*100).toFixed(2)}%`:"—"},{l:"คืนทุนอายุ",v:metrics.breakEven?`${metrics.breakEven.age} ปี`:"—"}
              ].map((m,i)=>(
                <div key={i} style={{background:"#f8fafc",borderRadius:8,padding:"9px 11px"}}>
                  <div style={{fontSize:10,color:"#94a3b8"}}>{m.l}</div>
                  <div style={{fontWeight:600,fontSize:12,marginTop:2}}>{m.v}</div>
                </div>
              ))}
            </div>
            <button onClick={askAI} disabled={aiLoading} style={{background:aiLoading?"#94a3b8":"linear-gradient(135deg,#004a99,#0ea5e9)",color:"#fff",border:"none",padding:"12px 28px",borderRadius:10,fontWeight:700,cursor:aiLoading?"not-allowed":"pointer",fontSize:14}}>
              {aiLoading?"🔄 กำลังวิเคราะห์...":"✨ วิเคราะห์พอร์ตด้วย AI"}
            </button>
          </div>
          {aiResp&&(
            <div style={{background:"#fff",borderRadius:14,padding:22,border:"1px solid #bfdbfe"}}>
              <div style={{fontWeight:600,marginBottom:10,fontSize:13,display:"flex",alignItems:"center",gap:6}}>
                <span style={{background:"linear-gradient(135deg,#004a99,#7c3aed)",color:"#fff",borderRadius:6,padding:"2px 8px",fontSize:10,fontWeight:700}}>AI</span>
                คำแนะนำจาก Claude AI
              </div>
              <div style={{lineHeight:1.85,fontSize:13.5,color:"#374151",whiteSpace:"pre-wrap"}}>{aiResp}</div>
            </div>
          )}
          <div style={{background:"#fffbeb",borderRadius:10,padding:"10px 14px",fontSize:11,color:"#92400e",border:"1px solid #fde68a"}}>⚠️ คำแนะนำจาก AI เป็นข้อมูลเบื้องต้น ควรปรึกษาตัวแทนที่ได้รับใบอนุญาตก่อนตัดสินใจ</div>
        </div>
      )}

      {tab==="irr"&&(
        <div style={{display:"flex",flexDirection:"column",gap:14}}>
          <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(170px,1fr))",gap:12}}>
            <div style={{background:"#eff6ff",borderRadius:14,padding:"18px 20px",border:"1px solid #bfdbfe"}}>
              <div style={{fontSize:11,color:"#64748b"}}>IRR พอร์ตรวม</div>
              <div style={{fontSize:32,fontWeight:700,color:"#004a99",margin:"4px 0"}}>{irr!=null?`${(irr*100).toFixed(2)}%`:"—"}</div>
              <div style={{fontSize:10,color:"#94a3b8"}}>ต่อปี (ตลอดชีพถึง 99)</div>
            </div>
            {pIRRs.map(p=>(
              <div key={p.id} style={{background:"#f8fafc",borderRadius:14,padding:"18px 20px",border:"1px solid #e2e8f0"}}>
                <div style={{fontSize:11,color:"#64748b",marginBottom:4,lineHeight:1.3}}>{p.name}</div>
                <div style={{fontSize:26,fontWeight:700,color:p.irr&&p.irr>0.02?"#10b981":"#f59e0b",margin:"2px 0"}}>{p.irr!=null?`${(p.irr*100).toFixed(2)}%`:"—"}</div>
                <div style={{fontSize:10,color:"#94a3b8"}}>ต่อปี</div>
              </div>
            ))}
          </div>
          <div style={{background:"#f0fdf4",borderRadius:10,padding:"10px 14px",fontSize:12,color:"#166534",border:"1px solid #bbf7d0"}}>
            📊 <strong>อ่านค่า IRR:</strong> ≥4% = ดีมาก | 2–4% = ปานกลาง | &lt;2% = ควรทบทวน | ค่าลบ = ขาดทุน
          </div>
          <div style={{background:"#fff",borderRadius:14,padding:18,border:"1px solid #e2e8f0"}}>
            <div style={{fontWeight:600,marginBottom:10,fontSize:13}}>📈 กราฟจุดคืนทุน</div>
            <ResponsiveContainer width="100%" height={200}>
              <LineChart data={cashflow}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9"/>
                <XAxis dataKey="age" tick={{fontSize:9}} tickLine={false} axisLine={false} tickFormatter={v=>v%10===0?v:""} interval={0}/>
                <YAxis tickFormatter={v=>`฿${fmtK(v)}`} tick={{fontSize:9}} tickLine={false} axisLine={false}/>
                <Tooltip labelFormatter={l=>`อายุ ${l}`} formatter={(v,n)=>[`฿${fmt(v)}`,n]}/>
                <Legend iconSize={10} wrapperStyle={{fontSize:11}}/>
                <Line type="monotone" dataKey="cp" name="เบี้ยสะสม" stroke="#ef4444" strokeWidth={2} dot={false}/>
                <Line type="monotone" dataKey="cr" name="รับสะสม" stroke="#10b981" strokeWidth={2} dot={false}/>
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {tab==="compare"&&(
        <div style={{display:"flex",flexDirection:"column",gap:14}}>
          <div style={{fontSize:13,color:"#64748b"}}>เลือกลูกค้าที่ต้องการเปรียบเทียบ (≥ 2 คน)</div>
          <div style={{display:"flex",flexWrap:"wrap",gap:8}}>
            {clients.map(c=>(
              <label key={c.id} style={{display:"flex",alignItems:"center",gap:6,padding:"7px 14px",borderRadius:20,border:`1px solid ${compareIds.includes(c.id)?"#004a99":"#e2e8f0"}`,background:compareIds.includes(c.id)?"#eff6ff":"#f8fafc",cursor:"pointer",fontSize:13,fontWeight:compareIds.includes(c.id)?600:400}}>
                <input type="checkbox" checked={compareIds.includes(c.id)} onChange={()=>setCompareIds(p=>p.includes(c.id)?p.filter(x=>x!==c.id):[...p,c.id])} style={{accentColor:"#004a99"}}/>{c.name}
              </label>
            ))}
          </div>
          {cmpData&&cmpData.length>=2&&(
            <>
              <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(180px,1fr))",gap:10}}>
                {cmpData.map((d,i)=>(
                  <div key={d.id} style={{background:"#f8fafc",borderRadius:12,padding:14,border:`2px solid ${COLORS[i%COLORS.length]}`}}>
                    <div style={{fontWeight:700,color:COLORS[i%COLORS.length],marginBottom:8,fontSize:13}}>{d.name}</div>
                    {[{l:"IRR",v:d.irr!=null?`${(d.irr*100).toFixed(2)}%`:"—"},{l:"เบี้ยรวม",v:`฿${fmtK(d.totalPaid)}`},{l:"รับรวม",v:`฿${fmtK(d.totalRec)}`},{l:"คืนทุน",v:d.be?`อายุ ${d.be} ปี`:"—"}].map((m,j)=>(
                      <div key={j} style={{display:"flex",justifyContent:"space-between",fontSize:12,marginBottom:5}}>
                        <span style={{color:"#64748b"}}>{m.l}</span><span style={{fontWeight:600}}>{m.v}</span>
                      </div>
                    ))}
                  </div>
                ))}
              </div>
              <div style={{background:"#fff",borderRadius:14,padding:18,border:"1px solid #e2e8f0"}}>
                <div style={{fontWeight:600,marginBottom:10,fontSize:13}}>เปรียบเทียบ Cashflow สะสม</div>
                <ResponsiveContainer width="100%" height={200}>
                  <LineChart>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9"/>
                    <XAxis type="number" dataKey="age" domain={[0,99]} tick={{fontSize:9}} tickLine={false} axisLine={false}/>
                    <YAxis tickFormatter={fmtK} tick={{fontSize:9}} tickLine={false} axisLine={false}/>
                    <Tooltip labelFormatter={l=>`อายุ ${l}`} formatter={(v,n)=>[`฿${fmt(v)}`,n]}/>
                    <Legend iconSize={10} wrapperStyle={{fontSize:11}}/>
                    <ReferenceLine y={0} stroke="#94a3b8" strokeDasharray="3 3"/>
                    {cmpData.map((d,i)=><Line key={d.id} data={d.cf} type="monotone" dataKey="cc" name={d.name} stroke={COLORS[i%COLORS.length]} strokeWidth={2} dot={false}/>)}
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
}

// ══════════════════════════════════════════════════════════════════
// CALENDAR
// ══════════════════════════════════════════════════════════════════
const EVENT_COLORS = [
  {bg:"#dbeafe",text:"#1d4ed8",dot:"#3b82f6"},
  {bg:"#dcfce7",text:"#166534",dot:"#22c55e"},
  {bg:"#fef9c3",text:"#854d0e",dot:"#eab308"},
  {bg:"#fce7f3",text:"#9d174d",dot:"#ec4899"},
  {bg:"#ede9fe",text:"#5b21b6",dot:"#8b5cf6"},
  {bg:"#ffedd5",text:"#9a3412",dot:"#f97316"},
];
const getEventColor = (id) => EVENT_COLORS[parseInt(id||"0",36)%EVENT_COLORS.length];

function CalView({date,setDate,events,setEvents}) {
  const [showAdd,setShowAdd]=useState(false);
  const [selectedDay,setSelectedDay]=useState(null);
  const [nev,setNev]=useState({title:"",date:"",time:"09:00",endTime:"10:00",desc:"",color:0});
  const y=date.getFullYear(),m=date.getMonth();
  const dim=new Date(y,m+1,0).getDate();
  const firstDow=new Date(y,m,1).getDay();
  const today=new Date();
  const toDateStr=d=>`${y}-${String(m+1).padStart(2,"0")}-${String(d).padStart(2,"0")}`;
  const dayEv=d=>events.filter(e=>e.date===toDateStr(d)).sort((a,b)=>a.time.localeCompare(b.time));
  const selectedEv=selectedDay?dayEv(selectedDay):[];
  const monthEvents=events.filter(e=>{const[ey,em]=e.date.split("-");return+ey===y&&+em===m+1;}).sort((a,b)=>a.date.localeCompare(b.date)||a.time.localeCompare(b.time));

  const add=()=>{
    if(!nev.title||!nev.date)return;
    setEvents(ev=>[...ev,{...nev,id:`${Date.now()}`}]);
    // auto-select the day added
    const d=parseInt(nev.date.split("-")[2]);
    if(+nev.date.split("-")[0]===y&&+nev.date.split("-")[1]-1===m) setSelectedDay(d);
    setNev({title:"",date:selectedDay?toDateStr(selectedDay):"",time:"09:00",endTime:"10:00",desc:"",color:0});
    setShowAdd(false);
  };

  const selectDay=(d)=>{
    setSelectedDay(prev=>prev===d?null:d);
    setNev(n=>({...n,date:toDateStr(d)}));
  };

  const todayStr=`${today.getFullYear()}-${String(today.getMonth()+1).padStart(2,"0")}-${String(today.getDate()).padStart(2,"0")}`;

  return(
    <div>
      {/* Header */}
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:16}}>
        <div style={{fontWeight:700,fontSize:17}}>📅 ปฏิทินนัดหมาย</div>
        <div style={{display:"flex",alignItems:"center",gap:8}}>
          <button onClick={()=>{setDate(new Date(y,m-1,1));setSelectedDay(null);}} style={{background:"#fff",border:"1px solid #e2e8f0",borderRadius:8,width:32,height:32,cursor:"pointer",fontSize:16,display:"flex",alignItems:"center",justifyContent:"center"}}>‹</button>
          <span style={{fontWeight:600,minWidth:126,textAlign:"center",fontSize:15}}>{THAI_MONTHS[m]} {y+543}</span>
          <button onClick={()=>{setDate(new Date(y,m+1,1));setSelectedDay(null);}} style={{background:"#fff",border:"1px solid #e2e8f0",borderRadius:8,width:32,height:32,cursor:"pointer",fontSize:16,display:"flex",alignItems:"center",justifyContent:"center"}}>›</button>
          <button onClick={()=>{setShowAdd(s=>!s);setNev(n=>({...n,date:selectedDay?toDateStr(selectedDay):""}));}}
            style={{background:"#004a99",color:"#fff",border:"none",padding:"7px 16px",borderRadius:8,cursor:"pointer",fontWeight:700,fontSize:13,marginLeft:4}}>
            + เพิ่มนัด
          </button>
        </div>
      </div>

      {/* Add form */}
      {showAdd&&(
        <div style={{background:"#fff",borderRadius:14,padding:18,border:"2px solid #004a99",marginBottom:16,boxShadow:"0 4px 16px rgba(0,74,153,0.08)"}}>
          <div style={{fontWeight:700,marginBottom:12,fontSize:14,color:"#004a99"}}>✏️ เพิ่มนัดหมายใหม่</div>
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10,marginBottom:10}}>
            {[["ชื่อกิจกรรม","title","text"],["วันที่","date","date"],["เวลาเริ่ม","time","time"],["เวลาสิ้นสุด","endTime","time"]].map(([l,f,t])=>(
              <div key={f}>
                <label style={{fontSize:11,color:"#64748b",display:"block",marginBottom:3}}>{l}</label>
                <input type={t} value={nev[f]} onChange={e=>setNev(n=>({...n,[f]:e.target.value}))}
                  style={{width:"100%",padding:"9px 10px",borderRadius:8,border:"1px solid #e2e8f0",fontSize:13,boxSizing:"border-box"}}/>
              </div>
            ))}
            <div style={{gridColumn:"1/-1"}}>
              <label style={{fontSize:11,color:"#64748b",display:"block",marginBottom:3}}>รายละเอียด</label>
              <input value={nev.desc} onChange={e=>setNev(n=>({...n,desc:e.target.value}))} placeholder="รายละเอียดเพิ่มเติม (ถ้ามี)"
                style={{width:"100%",padding:"9px 10px",borderRadius:8,border:"1px solid #e2e8f0",fontSize:13,boxSizing:"border-box"}}/>
            </div>
            <div style={{gridColumn:"1/-1"}}>
              <label style={{fontSize:11,color:"#64748b",display:"block",marginBottom:6}}>สีกิจกรรม</label>
              <div style={{display:"flex",gap:8}}>
                {EVENT_COLORS.map((c,i)=>(
                  <button key={i} onClick={()=>setNev(n=>({...n,color:i}))}
                    style={{width:26,height:26,borderRadius:"50%",background:c.dot,border:nev.color===i?"3px solid #1e293b":"2px solid transparent",cursor:"pointer"}}/>
                ))}
              </div>
            </div>
          </div>
          <div style={{display:"flex",gap:8}}>
            <button onClick={add} style={{background:"#004a99",color:"#fff",border:"none",padding:"9px 20px",borderRadius:8,cursor:"pointer",fontWeight:700,fontSize:13}}>💾 บันทึก</button>
            <button onClick={()=>setShowAdd(false)} style={{background:"#f1f5f9",color:"#475569",border:"none",padding:"9px 16px",borderRadius:8,cursor:"pointer",fontSize:13}}>ยกเลิก</button>
          </div>
        </div>
      )}

      {/* Main layout: calendar + sidebar */}
      <div style={{display:"grid",gridTemplateColumns:selectedDay?"1fr 280px":"1fr",gap:14,alignItems:"start"}}>

        {/* Calendar grid */}
        <div style={{background:"#fff",borderRadius:16,border:"1px solid #e2e8f0",overflow:"hidden"}}>
          {/* Day headers */}
          <div style={{display:"grid",gridTemplateColumns:"repeat(7,1fr)",background:"#f8fafc",borderBottom:"1px solid #e2e8f0"}}>
            {["อา","จ","อ","พ","พฤ","ศ","ส"].map((d,i)=>(
              <div key={d} style={{padding:"10px 4px",textAlign:"center",fontSize:12,color:i===0?"#ef4444":i===6?"#3b82f6":"#64748b",fontWeight:600}}>{d}</div>
            ))}
          </div>
          {/* Day cells */}
          <div style={{display:"grid",gridTemplateColumns:"repeat(7,1fr)"}}>
            {Array(firstDow).fill(null).map((_,i)=>(
              <div key={`blank${i}`} style={{minHeight:90,borderRight:"1px solid #f1f5f9",borderBottom:"1px solid #f1f5f9",background:"#fafafa"}}/>
            ))}
            {Array(dim).fill(null).map((_,i)=>{
              const d=i+1;
              const ds=toDateStr(d);
              const isToday=ds===todayStr;
              const isSel=selectedDay===d;
              const ev=dayEv(d);
              const dow=(firstDow+i)%7;
              return(
                <div key={d} onClick={()=>selectDay(d)}
                  style={{minHeight:90,borderRight:"1px solid #f1f5f9",borderBottom:"1px solid #f1f5f9",padding:"6px 5px",cursor:"pointer",
                    background:isSel?"#eff6ff":"#fff",
                    transition:"background .15s"}}>
                  <div style={{width:28,height:28,borderRadius:"50%",
                    background:isToday?"#004a99":isSel?"#dbeafe":"transparent",
                    color:isToday?"#fff":dow===0?"#ef4444":dow===6?"#3b82f6":"#1e293b",
                    fontWeight:isToday||isSel?700:400,fontSize:13,
                    display:"flex",alignItems:"center",justifyContent:"center",marginBottom:3}}>
                    {d}
                  </div>
                  {ev.slice(0,3).map(e=>{
                    const c=EVENT_COLORS[e.color??parseInt(e.id,36)%EVENT_COLORS.length];
                    return(
                      <div key={e.id} style={{fontSize:10,background:c.bg,color:c.text,borderRadius:4,padding:"2px 5px",marginBottom:2,
                        overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap",lineHeight:1.4,fontWeight:500}}>
                        <span style={{marginRight:3}}>●</span>{e.title}
                      </div>
                    );
                  })}
                  {ev.length>3&&<div style={{fontSize:9,color:"#94a3b8",paddingLeft:3}}>+{ev.length-3} อื่นๆ</div>}
                </div>
              );
            })}
          </div>
        </div>

        {/* Sidebar: selected day events */}
        {selectedDay&&(
          <div style={{display:"flex",flexDirection:"column",gap:10}}>
            {/* Day title */}
            <div style={{background:"#004a99",borderRadius:12,padding:"14px 16px",color:"#fff"}}>
              <div style={{fontSize:12,opacity:.75,marginBottom:2}}>กิจกรรมวันที่</div>
              <div style={{fontSize:20,fontWeight:700}}>{selectedDay} {THAI_MONTHS[m]} {y+543}</div>
              <div style={{fontSize:12,opacity:.75,marginTop:3}}>{selectedEv.length} กิจกรรม</div>
            </div>

            {/* Quick add for this day */}
            <button onClick={()=>{setNev(n=>({...n,date:toDateStr(selectedDay)}));setShowAdd(true);}}
              style={{background:"#fff",border:"1px dashed #93c5fd",color:"#004a99",padding:"9px",borderRadius:10,cursor:"pointer",fontWeight:600,fontSize:13}}>
              + เพิ่มกิจกรรมวันนี้
            </button>

            {/* Events list */}
            {selectedEv.length===0?(
              <div style={{background:"#fff",borderRadius:12,padding:20,border:"1px solid #e2e8f0",textAlign:"center",color:"#94a3b8",fontSize:13}}>
                <div style={{fontSize:28,marginBottom:6}}>📭</div>
                ไม่มีกิจกรรมในวันนี้
              </div>
            ):(
              selectedEv.map(e=>{
                const c=EVENT_COLORS[e.color??parseInt(e.id,36)%EVENT_COLORS.length];
                return(
                  <div key={e.id} style={{background:"#fff",borderRadius:12,padding:"14px 16px",border:`1px solid ${c.bg}`,borderLeft:`4px solid ${c.dot}`,boxShadow:"0 1px 4px rgba(0,0,0,0.04)"}}>
                    <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:6}}>
                      <div style={{fontWeight:700,fontSize:14,color:"#1e293b",flex:1,paddingRight:8}}>{e.title}</div>
                      <button onClick={()=>{setEvents(ev=>ev.filter(x=>x.id!==e.id));if(dayEv(selectedDay).length<=1)setSelectedDay(null);}}
                        style={{background:"#fee2e2",color:"#ef4444",border:"none",width:22,height:22,borderRadius:"50%",cursor:"pointer",fontSize:12,flexShrink:0,display:"flex",alignItems:"center",justifyContent:"center",fontWeight:700}}>×</button>
                    </div>
                    <div style={{display:"flex",alignItems:"center",gap:6,fontSize:12,color:"#64748b",marginBottom:e.desc?6:0}}>
                      <span>🕐</span>
                      <span style={{fontWeight:500}}>{e.time} – {e.endTime}</span>
                    </div>
                    {e.desc&&<div style={{fontSize:12,color:"#64748b",background:"#f8fafc",borderRadius:6,padding:"6px 8px",marginTop:6,lineHeight:1.5}}>{e.desc}</div>}
                  </div>
                );
              })
            )}

            {/* Close panel */}
            <button onClick={()=>setSelectedDay(null)}
              style={{background:"#f1f5f9",color:"#475569",border:"none",padding:"8px",borderRadius:8,cursor:"pointer",fontSize:12,fontWeight:500}}>
              ปิดแผงกิจกรรม ✕
            </button>
          </div>
        )}
      </div>

      {/* Month event list (all events this month) */}
      {monthEvents.length>0&&(
        <div style={{marginTop:16,background:"#fff",borderRadius:14,padding:18,border:"1px solid #e2e8f0"}}>
          <div style={{fontWeight:700,marginBottom:12,fontSize:14}}>📋 กิจกรรมทั้งหมดใน{THAI_MONTHS[m]} ({monthEvents.length} รายการ)</div>
          <div style={{display:"flex",flexDirection:"column",gap:6}}>
            {monthEvents.map(e=>{
              const c=EVENT_COLORS[e.color??parseInt(e.id,36)%EVENT_COLORS.length];
              const dayNum=parseInt(e.date.split("-")[2]);
              const isSel=selectedDay===dayNum;
              return(
                <div key={e.id} onClick={()=>selectDay(dayNum)}
                  style={{display:"flex",alignItems:"center",gap:10,padding:"9px 12px",borderRadius:10,border:`1px solid ${isSel?"#93c5fd":"#f1f5f9"}`,background:isSel?"#eff6ff":"#f8fafc",cursor:"pointer",transition:"all .15s"}}>
                  <div style={{width:8,height:8,borderRadius:"50%",background:c.dot,flexShrink:0}}/>
                  <div style={{width:44,flexShrink:0}}>
                    <span style={{fontWeight:700,fontSize:13,color:"#004a99"}}>{dayNum}</span>
                    <span style={{fontSize:11,color:"#94a3b8",marginLeft:3}}>{THAI_MONTHS[m].slice(0,3)}</span>
                  </div>
                  <div style={{flex:1,minWidth:0}}>
                    <div style={{fontWeight:600,fontSize:13,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{e.title}</div>
                    {e.desc&&<div style={{fontSize:11,color:"#94a3b8",overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{e.desc}</div>}
                  </div>
                  <div style={{fontSize:11,color:"#64748b",flexShrink:0,fontWeight:500}}>{e.time}–{e.endTime}</div>
                  <button onClick={ev=>{ev.stopPropagation();setEvents(x=>x.filter(x=>x.id!==e.id));}}
                    style={{background:"#fee2e2",color:"#ef4444",border:"none",padding:"3px 8px",borderRadius:5,cursor:"pointer",fontSize:11,flexShrink:0}}>ลบ</button>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

// ══════════════════════════════════════════════════════════════════
// SUMMARY
// ══════════════════════════════════════════════════════════════════
function SummaryView({clients,successGoal,setSuccessGoal,successView,setSuccessView}) {
  const now=new Date();

  // ── Profile state ──────────────────────────────────────────────
  const [profile,setProfile]=useState(()=>{
    try{return JSON.parse(localStorage.getItem("tl_profile")||"{}");}catch{return{};}
  });
  const [profileSaved,setProfileSaved]=useState(false);
  const saveProfile=()=>{
    localStorage.setItem("tl_profile",JSON.stringify(profile));
    setProfileSaved(true);
    setTimeout(()=>setProfileSaved(false),2500);
  };
  const setP=(k,v)=>setProfile(p=>({...p,[k]:v}));

  const getStep=(key,period)=>{
    let n=0;
    clients.forEach(c=>{
      const s=c.statusDates?.[key]; if(!s?.date)return;
      const d=new Date(s.date);
      if(period==="today"&&d.toDateString()===now.toDateString())n++;
      if(period==="week"){const wa=new Date(now);wa.setDate(now.getDate()-7);if(d>=wa)n++;}
      if(period==="month"&&d.getMonth()===now.getMonth()&&d.getFullYear()===now.getFullYear())n++;
    });
    return n;
  };
  const goalAmt=SUCCESS_GOALS[successGoal]||0;
  const monthlyPrem=clients.reduce((s,c)=>s+(parseFloat(c.statusDates?.paymentAppointment?.premium||0)),0);
  const pct=goalAmt>0?Math.min(100,(monthlyPrem/(goalAmt/12))*100):0;
  const mtgNeeded=Math.ceil((goalAmt/12)/30000);
  const propNeed=mtgNeeded*5;
  const barData=STATUS_STEPS.map(s=>({name:s.label,รายวัน:getStep(s.key,"today"),รายสัปดาห์:getStep(s.key,"week"),รายเดือน:getStep(s.key,"month")}));
  return(
    <div style={{display:"flex",flexDirection:"column",gap:16}}>

      {/* ── PROFILE CARD ── */}
      <div style={{background:"#fff",borderRadius:14,padding:20,border:"1px solid #e2e8f0"}}>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:16}}>
          <div style={{fontWeight:700,fontSize:15}}>⚙️ ตั้งค่าโปรไฟล์ส่วนตัว</div>
          <span style={{background:"#004a99",color:"#fff",fontSize:10,padding:"2px 10px",borderRadius:5,fontWeight:700}}>OWNER</span>
        </div>
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:12,marginBottom:14}}>
          {[["ชื่อ","first_name","ชื่อของคุณ","text"],["นามสกุล","last_name","นามสกุลของคุณ","text"]].map(([l,k,ph])=>(
            <div key={k}>
              <label style={{fontSize:11,color:"#64748b",display:"block",marginBottom:3}}>{l}</label>
              <input value={profile[k]||""} onChange={e=>setP(k,e.target.value)} placeholder={ph}
                style={{width:"100%",padding:"10px 12px",borderRadius:8,border:"1px solid #e2e8f0",fontSize:13,boxSizing:"border-box",outline:"none"}}
                onFocus={e=>e.target.style.borderColor="#004a99"} onBlur={e=>e.target.style.borderColor="#e2e8f0"}/>
            </div>
          ))}
          <div>
            <label style={{fontSize:11,color:"#64748b",display:"block",marginBottom:3}}>ตำแหน่ง</label>
            <select value={profile.position||""} onChange={e=>setP("position",e.target.value)}
              style={{width:"100%",padding:"10px 12px",borderRadius:8,border:"1px solid #e2e8f0",fontSize:13}}>
              <option value="">เลือกตำแหน่ง</option>
              {["ฝ่าย","ภาค","ศูนย์","หน่วย","ตัวแทน"].map(o=><option key={o} value={o}>{o}</option>)}
            </select>
          </div>
          <div>
            <label style={{fontSize:11,color:"#64748b",display:"block",marginBottom:3}}>สังกัด (AFFILIATION)</label>
            <input value={profile.affiliation||""} onChange={e=>setP("affiliation",e.target.value)}
              placeholder="ระบุสังกัดเพื่อดูผลงานทีม"
              style={{width:"100%",padding:"10px 12px",borderRadius:8,border:"1px solid #e2e8f0",fontSize:13,boxSizing:"border-box",outline:"none"}}
              onFocus={e=>e.target.style.borderColor="#004a99"} onBlur={e=>e.target.style.borderColor="#e2e8f0"}/>
          </div>
          <div style={{gridColumn:"1/-1"}}>
            <label style={{fontSize:11,color:"#64748b",display:"block",marginBottom:3}}>หมายเหตุ / โน้ต</label>
            <textarea value={profile.notes||""} onChange={e=>setP("notes",e.target.value)}
              placeholder="โน้ตส่วนตัว..."
              rows={2}
              style={{width:"100%",padding:"10px 12px",borderRadius:8,border:"1px solid #e2e8f0",fontSize:13,boxSizing:"border-box",resize:"vertical",outline:"none",fontFamily:"inherit"}}
              onFocus={e=>e.target.style.borderColor="#004a99"} onBlur={e=>e.target.style.borderColor="#e2e8f0"}/>
          </div>
        </div>
        <div style={{display:"flex",alignItems:"center",gap:10}}>
          <button onClick={saveProfile}
            style={{background:"#004a99",color:"#fff",border:"none",padding:"10px 24px",borderRadius:9,fontWeight:700,fontSize:14,cursor:"pointer",display:"flex",alignItems:"center",gap:7,transition:"background .15s"}}
            onMouseEnter={e=>e.currentTarget.style.background="#0055b3"} onMouseLeave={e=>e.currentTarget.style.background="#004a99"}>
            💾 บันทึกโปรไฟล์
          </button>
          {profileSaved&&(
            <span style={{color:"#10b981",fontWeight:600,fontSize:13,display:"flex",alignItems:"center",gap:4}}>
              ✓ บันทึกแล้ว
            </span>
          )}
        </div>
        {/* Preview */}
        {(profile.first_name||profile.last_name)&&(
          <div style={{marginTop:14,padding:"10px 14px",background:"#f0fdf4",borderRadius:8,border:"1px solid #bbf7d0",fontSize:13,color:"#166534",display:"flex",alignItems:"center",gap:8}}>
            <span style={{fontSize:16}}>👤</span>
            <span><strong>{[profile.first_name,profile.last_name].filter(Boolean).join(" ")}</strong>
              {profile.position&&<span style={{color:"#64748b",marginLeft:6}}>· {profile.position}</span>}
              {profile.affiliation&&<span style={{color:"#64748b",marginLeft:6}}>· {profile.affiliation}</span>}
            </span>
          </div>
        )}
      </div>

      <div style={{background:"#fff",borderRadius:14,padding:18,border:"1px solid #e2e8f0"}}>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:14,flexWrap:"wrap",gap:8}}>
          <div style={{fontWeight:700,fontSize:15}}>⊞ Dashboard สรุปการทำงาน</div>
          <div style={{display:"flex",gap:6}}>
            {["รายวัน","รายสัปดาห์","รายเดือน"].map(v=>(
              <button key={v} onClick={()=>setSuccessView(v)} style={{padding:"5px 12px",borderRadius:16,border:`1px solid ${successView===v?"#004a99":"#e2e8f0"}`,background:successView===v?"#004a99":"#fff",color:successView===v?"#fff":"#64748b",cursor:"pointer",fontSize:12,fontWeight:successView===v?700:400}}>{v}</button>
            ))}
          </div>
        </div>

        <div style={{background:"#004a99",borderRadius:12,padding:"14px 18px",marginBottom:14,display:"flex",alignItems:"center",gap:10,flexWrap:"wrap"}}>
          <span style={{color:"#fff",fontWeight:600,fontSize:13}}>🎯 เป้าหมายปีนี้:</span>
          <div style={{display:"flex",gap:6}}>
            {Object.keys(SUCCESS_GOALS).map(g=>(
              <button key={g} onClick={()=>setSuccessGoal(g)} style={{padding:"3px 10px",borderRadius:6,border:"1px solid rgba(255,255,255,.4)",background:successGoal===g?"#fff":"transparent",color:successGoal===g?"#004a99":"#fff",cursor:"pointer",fontSize:12,fontWeight:700}}>{g}</button>
            ))}
          </div>
          <span style={{color:"#fff",fontWeight:700,fontSize:14}}>฿{fmt(goalAmt)}</span>
        </div>

        <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(145px,1fr))",gap:10,marginBottom:16}}>
          {[
            {l:`เป้าเบี้ย/เดือน (${successGoal})`,v:`฿${fmt(goalAmt/12)}`,sub:`ทำได้: ฿${fmt(monthlyPrem)} (${pct.toFixed(1)}%)`},
            {l:"เคสที่ต้องเข้าพบ",v:`${mtgNeeded} ครั้ง`,sub:`ต่อเดือน (5 เข้า/เคส)`},
            {l:"เคสที่ต้องเสนอ",v:`${propNeed} เคส`,sub:`ต่อเดือน (30K/เคส)`},
            {l:"อัตราปิดการขาย",v:"0%",sub:"ยังไม่มีข้อมูล"},
            {l:"คะแนนความขยัน",v:"☆☆☆☆☆",sub:"0 กิจกรรม"},
          ].map((m,i)=>(
            <div key={i} style={{background:"#f8fafc",borderRadius:10,padding:"12px 14px"}}>
              <div style={{fontSize:10,color:"#64748b",marginBottom:5,lineHeight:1.4}}>{m.l}</div>
              <div style={{fontSize:18,fontWeight:700,color:"#004a99"}}>{m.v}</div>
              <div style={{fontSize:10,color:"#94a3b8",marginTop:3}}>{m.sub}</div>
              {i===0&&<div style={{height:3,background:"#e2e8f0",borderRadius:2,marginTop:6}}><div style={{height:"100%",background:"#10b981",borderRadius:2,width:`${pct}%`,transition:"width .4s"}}/></div>}
            </div>
          ))}
        </div>

        <div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:10,marginBottom:16}}>
          {[{l:"งานวันนี้",k:"today"},{l:"งานสัปดาห์นี้",k:"week"},{l:`งาน${THAI_MONTHS[now.getMonth()]}`,k:"month"}].map(m=>(
            <div key={m.k} style={{background:"#f8fafc",borderRadius:10,padding:"12px 14px"}}>
              <div style={{fontSize:11,color:"#64748b",marginBottom:4}}>{m.l}</div>
              <div style={{fontSize:22,fontWeight:700}}>{STATUS_STEPS.reduce((s,st)=>s+getStep(st.key,m.k),0)} <span style={{fontSize:12,fontWeight:400,color:"#94a3b8"}}>รายการ</span></div>
            </div>
          ))}
        </div>

        <div style={{fontWeight:600,marginBottom:10,fontSize:13}}>📊 สถิติแยกตามขั้นตอน (7 ขั้นตอน)</div>
        <ResponsiveContainer width="100%" height={180}>
          <BarChart data={barData} margin={{bottom:42}}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9"/>
            <XAxis dataKey="name" tick={{fontSize:9}} angle={-30} textAnchor="end" tickLine={false} axisLine={false} interval={0}/>
            <YAxis tick={{fontSize:10}} tickLine={false} axisLine={false}/>
            <Tooltip/>
            <Legend iconSize={10} wrapperStyle={{fontSize:11}}/>
            <Bar name="รายวัน" dataKey="รายวัน" fill="#cbd5e1" radius={[3,3,0,0]}/>
            <Bar name="รายสัปดาห์" dataKey="รายสัปดาห์" fill="#004a99" radius={[3,3,0,0]}/>
            <Bar name="รายเดือน" dataKey="รายเดือน" fill="#10b981" radius={[3,3,0,0]}/>
          </BarChart>
        </ResponsiveContainer>

        <table style={{width:"100%",borderCollapse:"collapse",fontSize:12,marginTop:12}}>
          <thead><tr>{["ขั้นตอน","วันนี้","สัปดาห์นี้","เดือนนี้"].map((h,i)=><th key={i} style={{padding:"8px 10px",textAlign:i===0?"left":"right",color:"#64748b",fontWeight:600,borderBottom:"1px solid #e2e8f0",fontSize:11}}>{h}</th>)}</tr></thead>
          <tbody>
            {STATUS_STEPS.map(s=>(
              <tr key={s.key} style={{borderBottom:"1px solid #f8fafc"}}>
                <td style={{padding:"10px"}}>{s.label}</td>
                {["today","week","month"].map((p,j)=>(
                  <td key={p} style={{padding:"10px",textAlign:"right"}}>
                    <div style={{fontWeight:700,color:["#1e293b","#004a99","#10b981"][j]}}>{getStep(s.key,p)}</div>
                    <div style={{fontSize:10,color:"#94a3b8"}}>(0%)</div>
                  </td>
                ))}
              </tr>
            ))}
            <tr style={{background:"#f8fafc",borderTop:"2px solid #e2e8f0"}}>
              <td style={{padding:"10px",fontWeight:600,fontSize:11,color:"#004a99"}}>📊 เบี้ยที่คาดปิดได้ (เข้าพบ)</td>
              {["today","week","month"].map((p,j)=><td key={p} style={{padding:"10px",textAlign:"right",fontWeight:700,color:["#1e293b","#004a99","#10b981"][j]}}>฿0</td>)}
            </tr>
            <tr style={{background:"#f0fdf4"}}>
              <td style={{padding:"10px",fontWeight:600,fontSize:11,color:"#10b981"}}>🏆 เบี้ยปีแรกรวม (นัดชำระ)</td>
              {["today","week","month"].map((p,j)=><td key={p} style={{padding:"10px",textAlign:"right",fontWeight:700,color:"#10b981"}}>฿{fmt(p==="month"?monthlyPrem:0)}</td>)}
            </tr>
            <tr><td style={{padding:"10px",fontWeight:700}}>รวมทั้งหมด</td>
              {["today","week","month"].map(p=><td key={p} style={{padding:"10px",textAlign:"right",fontWeight:700}}>{STATUS_STEPS.reduce((s,st)=>s+getStep(st.key,p),0)} (100%)</td>)}
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
}

// ══════════════════════════════════════════════════════════════════
// ADMIN
// ══════════════════════════════════════════════════════════════════
// ── Google Sheets sync helpers ────────────────────────────────────
const SHEET_ID          = "1994W1KrzB3KLYTclYMh6t4FE0fpWIFxDhZbRiprKoY8";
const CLIENTS_SHEET_ID  = SHEET_ID;
const USERS_SHEET_ID    = "1aymHEw-h9H9oOz06vHW93EtsxddQYQr5DpQO3E8lRyc";
const SHEET_URL         = `https://docs.google.com/spreadsheets/d/${SHEET_ID}/edit`;

// Build flat row from client object
const clientToRow = (c) => {
  const fd = c.financialData || {};
  const policies = fd.policies || [];
  const totalCov = policies.reduce((s,p)=>s+(p.sumAssured||0),0);
  const totalPrem = policies.reduce((s,p)=>s+(p.annualPremium||0),0);
  const sd = c.statusDates || {};
  return [
    c.id,
    c.name,
    fd.currentAge||"",
    fd.gender==="Male"?"ชาย":"หญิง",
    fd.occupation||"",
    fd.income||0,
    fd.expenses||0,
    fd.savings||0,
    fd.retirementAge||60,
    policies.length,
    totalCov,
    totalPrem,
    policies.map(p=>p.name).join(" | "),
    sd.appointmentCall?.date||"",
    sd.meeting?.date||"",
    sd.paymentAppointment?.date||"",
    sd.paymentAppointment?.premium||"",
    sd.historyRequest?.date||"",
    sd.healthCheckup?.date||"",
    sd.memoRecord?.date||"",
    sd.policyDelivery?.date||"",
    new Date().toLocaleString("th-TH"),
  ];
};

const HEADERS = [
  "ID","ชื่อลูกค้า","อายุ","เพศ","อาชีพ",
  "รายได้/เดือน","ค่าใช้จ่าย/เดือน","เงินออม",
  "อายุเกษียณ","จำนวนกรมธรรม์","ทุนประกันรวม","เบี้ยรวม/ปี",
  "รายชื่อกรมธรรม์",
  "1.โทรทำนัด","2.เข้าพบ","3.นัดชำระเงิน","เบี้ยปีแรก",
  "4.ขอประวัติ","5.ตรวจสุขภาพ","6.ทำบันทึก","7.ส่งมอบ",
  "อัพเดตล่าสุด"
];

function AdminView({clients}) {
  const CSHEET_URL = `https://docs.google.com/spreadsheets/d/${CLIENTS_SHEET_ID}/edit`;
  const USHEET_URL = `https://docs.google.com/spreadsheets/d/${USERS_SHEET_ID}/edit`;

  const USER_ROLES     = ["owner","admin","user"];
  const USER_SUBS      = ["none","monthly","annual"];
  const USER_POSITIONS = ["ฝ่าย","ภาค","ศูนย์","หน่วย","ตัวแทน"];

  const [users, setUsers] = useState(() => {
    try { return JSON.parse(localStorage.getItem("tl_users")||"null") || [
      {id:"u1",username:"phi.takij@gmail.com",password:"",role:"owner",
       first_name:"",last_name:"",position:"ฝ่าย",affiliation:"",
       subscription_status:"annual",subscription_expiry:"2026-12-31",
       created_at:new Date().toISOString(),notes:""}
    ]; } catch { return []; }
  });
  const saveUsers = (next) => { setUsers(next); localStorage.setItem("tl_users",JSON.stringify(next)); };

  const [clientScript,setClientScript] = useState(()=>localStorage.getItem("tl_client_script")||"");
  const [userScript,  setUserScript]   = useState(()=>localStorage.getItem("tl_user_script")||"");
  const [syncSt,  setSyncSt]  = useState({clients:null,users:null});
  const [syncMsg, setSyncMsg] = useState({clients:"",users:""});
  const [lastSync,setLastSync]= useState({
    clients:localStorage.getItem("tl_last_sync_clients")||"",
    users:  localStorage.getItem("tl_last_sync_users")||""
  });
  const [userTab,  setUserTab]  = useState("list");
  const [editUser, setEditUser] = useState(null);
  const [userSearch,setUserSearch] = useState("");
  const [previewTab,setPreviewTab] = useState(null);
  const [showSetup, setShowSetup] = useState(false);
  const BLANK_FORM = {username:"",password:"",role:"user",first_name:"",last_name:"",position:"ตัวแทน",affiliation:"",subscription_status:"none",subscription_expiry:"",notes:""};
  const [userForm, setUserForm] = useState(BLANK_FORM);
  const setF = (k,v) => setUserForm(f=>({...f,[k]:v}));

  const startAdd  = () => { setUserForm(BLANK_FORM); setEditUser(null); setUserTab("add"); };
  const startEdit = (u) => { setUserForm({...u}); setEditUser(u); setUserTab("edit"); };
  const cancelForm= () => { setUserTab("list"); setEditUser(null); };
  const saveUser  = () => {
    if (!userForm.username.trim()) return;
    if (editUser) saveUsers(users.map(u=>u.id===editUser.id?{...u,...userForm}:u));
    else saveUsers([...users,{...userForm,id:"u"+Date.now(),created_at:new Date().toISOString()}]);
    cancelForm();
  };
  const deleteUser = (id) => { if(window.confirm("ลบผู้ใช้นี้?")) saveUsers(users.filter(u=>u.id!==id)); };

  const USER_HEADERS = ["ID","Username","ชื่อ","นามสกุล","ตำแหน่ง","สังกัด","Role","Subscription","หมดอายุ","สร้างเมื่อ","หมายเหตุ"];
  const userToRow = u => [u.id,u.username,u.first_name||"",u.last_name||"",u.position||"",u.affiliation||"",u.role,u.subscription_status||"none",u.subscription_expiry||"",u.created_at?new Date(u.created_at).toLocaleDateString("th-TH"):"",u.notes||""];

  const testConnection = async (which) => {
    const url = which==="clients"?clientScript:userScript;
    if (!url.trim()) { setShowSetup(true); return; }
    setSyncMsg(m=>({...m,[which]:"🔍 กำลังทดสอบ..."}));
    try {
      await fetch(url+"?test=1",{method:"GET",mode:"no-cors"});
      setSyncMsg(m=>({...m,[which]:"✓ URL ใช้ได้ — กด Sync ได้เลย"}));
    } catch(e) { setSyncMsg(m=>({...m,[which]:"❌ "+e.message})); }
  };

  const doSync = (which) => {
    const url = which==="clients"?clientScript:userScript;
    const sheetId = which==="clients"?CLIENTS_SHEET_ID:USERS_SHEET_ID;
    const sheetName = which==="clients"?"ลูกค้า":"ผู้ใช้งาน";
    const headers = which==="clients"?HEADERS:USER_HEADERS;
    const rows    = which==="clients"?clients.map(clientToRow):users.map(userToRow);
    if (!url.trim()) { setShowSetup(true); return; }
    setSyncSt(s=>({...s,[which]:"syncing"}));
    setSyncMsg(m=>({...m,[which]:"⏳ กำลังส่ง "+rows.length+" แถว..."}));

    // ── วิธีที่ 1: fetch ปกติ (ถ้า Apps Script เปิด CORS) ──────────
    fetch(url, {
      method:"POST",
      headers:{"Content-Type":"text/plain"},
      body: JSON.stringify({action:"sync",sheetId,sheetName,headers,rows})
    })
    .then(r => r.text())
    .then(text => {
      if (text.startsWith("ok")) {
        const ts = new Date().toLocaleString("th-TH");
        setLastSync(s=>({...s,[which]:ts}));
        localStorage.setItem("tl_last_sync_"+which,ts);
        setSyncSt(s=>({...s,[which]:"ok"}));
        setSyncMsg(m=>({...m,[which]:"✓ ซิงค์สำเร็จ "+rows.length+" แถว"}));
      } else {
        throw new Error(text||"Apps Script error");
      }
    })
    .catch(() => {
      // ── วิธีที่ 2: form submit ผ่าน hidden iframe (หลีกเลี่ยง CORS) ──
      try {
        const iid = "tl-sync-iframe-"+which;
        let ifr = document.getElementById(iid);
        if (!ifr) {
          ifr = document.createElement("iframe");
          ifr.id = iid; ifr.name = iid;
          ifr.style.cssText = "display:none;width:0;height:0;border:none";
          document.body.appendChild(ifr);
        }
        const form = document.createElement("form");
        form.method = "POST";
        form.action = url;
        form.target = iid;
        form.style.display = "none";
        // ส่ง payload เป็น field เดียว
        const inp = document.createElement("input");
        inp.type = "hidden"; inp.name = "payload";
        inp.value = JSON.stringify({action:"sync",sheetId,sheetName,headers,rows});
        form.appendChild(inp);
        document.body.appendChild(form);
        form.submit();
        setTimeout(() => {
          try { document.body.removeChild(form); } catch(_){}
        }, 1000);
        const ts = new Date().toLocaleString("th-TH");
        setLastSync(s=>({...s,[which]:ts}));
        localStorage.setItem("tl_last_sync_"+which,ts);
        setSyncSt(s=>({...s,[which]:"ok"}));
        setSyncMsg(m=>({...m,[which]:"✓ ส่งผ่าน form แล้ว "+rows.length+" แถว — รอ 5 วิ แล้วเปิด Sheet"}));
      } catch(e2) {
        setSyncSt(s=>({...s,[which]:"error"}));
        setSyncMsg(m=>({...m,[which]:"❌ ส่งไม่ได้: "+e2.message}));
      }
    });
    setTimeout(()=>setSyncSt(s=>({...s,[which]:null})),8000);
  };

  const exportCSV = (which) => {
    const bom="\uFEFF";
    const [hdrs,rows]=which==="clients"?[HEADERS,clients.map(clientToRow)]:[USER_HEADERS,users.map(userToRow)];
    const csv=bom+[hdrs,...rows].map(r=>r.map(v=>'"'+String(v).replace(/"/g,'""')+'"').join(",")).join("\n");
    const a=document.createElement("a"); a.href=URL.createObjectURL(new Blob([csv],{type:"text/csv;charset=utf-8;"}));
    a.download=(which==="clients"?"clients_db":"users_db")+".csv"; a.click();
  };

  const SCRIPT_CODE =
`// Thai Life Planner — Apps Script v2
// รองรับทั้ง fetch (POST body) และ form submit (parameter.payload)

function doPost(e) {
  try {
    // รับ payload ได้ 2 ทาง
    var raw = "";
    if (e.postData && e.postData.contents) {
      raw = e.postData.contents;            // มาจาก fetch
    } else if (e.parameter && e.parameter.payload) {
      raw = e.parameter.payload;            // มาจาก form submit
    }
    if (!raw) throw new Error("ไม่พบข้อมูล");

    var d = JSON.parse(raw);
    var ss = SpreadsheetApp.openById(d.sheetId);

    // สร้าง Sheet ถ้ายังไม่มี
    var sh = ss.getSheetByName(d.sheetName);
    if (!sh) sh = ss.insertSheet(d.sheetName);

    // เขียนข้อมูล
    sh.clearContents();
    sh.appendRow(d.headers);
    for (var i = 0; i < d.rows.length; i++) {
      sh.appendRow(d.rows[i]);
    }

    // จัดสไตล์ header
    var hdr = sh.getRange(1, 1, 1, d.headers.length);
    hdr.setBackground("#004a99")
       .setFontColor("#ffffff")
       .setFontWeight("bold");
    sh.setFrozenRows(1);
    sh.autoResizeColumns(1, d.headers.length);

    return out("ok:" + d.rows.length);
  } catch(err) {
    return out("error:" + err.message);
  }
}

function doGet(e) {
  return out("ready:Thai Life Planner API v2");
}

function out(msg) {
  return ContentService
    .createTextOutput(msg)
    .setMimeType(ContentService.MimeType.TEXT);
}`;

  const filteredUsers = users.filter(u =>
    u.username.toLowerCase().includes(userSearch.toLowerCase())||
    (u.first_name||"").includes(userSearch)||(u.last_name||"").includes(userSearch)
  );
  const ROLE_C = {owner:{bg:"#fef9c3",c:"#854d0e"},admin:{bg:"#ede9fe",c:"#6d28d9"},user:{bg:"#f0fdf4",c:"#166534"}};
  const SUB_C  = {none:{bg:"#f8fafc",c:"#64748b"},monthly:{bg:"#eff6ff",c:"#1d4ed8"},annual:{bg:"#f0fdf4",c:"#166534"}};

  const SyncBtn = ({which,label}) => {
    const st = syncSt[which];
    return (
      <button onClick={()=>doSync(which)} disabled={st==="syncing"}
        style={{background:st==="ok"?"#10b981":st==="error"?"#ef4444":which==="users"?"#7c3aed":"#10b981",
          color:"#fff",border:"none",padding:"8px 14px",borderRadius:8,cursor:st==="syncing"?"not-allowed":"pointer",fontWeight:700,fontSize:13}}>
        {st==="syncing"?"⏳ กำลังส่ง...":st==="ok"?"✓ Synced!":label}
      </button>
    );
  };

  const SheetUrlInput = ({which,placeholder}) => {
    const val = which==="clients"?clientScript:userScript;
    const setVal = which==="clients"
      ? v=>{setClientScript(v);localStorage.setItem("tl_client_script",v);}
      : v=>{setUserScript(v);localStorage.setItem("tl_user_script",v);};
    return (
      <div style={{display:"flex",gap:6,marginBottom:10,alignItems:"center"}}>
        <input value={val} onChange={e=>setVal(e.target.value)} placeholder={placeholder}
          style={{flex:1,padding:"8px 10px",borderRadius:8,border:"1px solid #e2e8f0",fontSize:11,fontFamily:"monospace",outline:"none",
            borderColor:val?"#10b981":"#e2e8f0"}}/>
        {val && <span style={{fontSize:11,color:"#10b981",fontWeight:600,flexShrink:0}}>✓</span>}
      </div>
    );
  };

  return (
    <div style={{display:"flex",flexDirection:"column",gap:14}}>

      {/* ── STATS ── */}
      <div style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:10}}>
        {[
          {i:"👥",l:"ผู้ใช้ทั้งหมด",v:users.length,             bg:"#eff6ff",c:"#1d4ed8"},
          {i:"🛡️",l:"Owner/Admin",   v:users.filter(u=>u.role!=="user").length, bg:"#fef9c3",c:"#854d0e"},
          {i:"💳",l:"Subscription",  v:users.filter(u=>u.subscription_status!=="none").length, bg:"#f0fdf4",c:"#166534"},
          {i:"🗄️",l:"ลูกค้า",        v:clients.length,           bg:"#fff7ed",c:"#c2410c"},
        ].map((m,i)=>(
          <div key={i} style={{background:"#fff",borderRadius:12,padding:"14px 10px",border:"1px solid #e2e8f0",textAlign:"center"}}>
            <div style={{fontSize:20,marginBottom:4}}>{m.i}</div>
            <div style={{fontWeight:700,fontSize:22,color:m.c}}>{m.v}</div>
            <div style={{fontSize:10,color:"#64748b",marginTop:2}}>{m.l}</div>
          </div>
        ))}
      </div>

      {/* ── USER DATABASE ── */}
      <div style={{background:"#fff",borderRadius:14,padding:20,border:"2px solid #7c3aed"}}>

        {/* Header */}
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:14,flexWrap:"wrap",gap:8}}>
          <div style={{display:"flex",alignItems:"center",gap:10}}>
            <div style={{width:38,height:38,background:"#ede9fe",borderRadius:10,display:"flex",alignItems:"center",justifyContent:"center",fontSize:18}}>👤</div>
            <div>
              <div style={{fontWeight:700,fontSize:15}}>ฐานข้อมูล Admin / User</div>
              <a href={USHEET_URL} target="_blank" rel="noreferrer"
                style={{fontSize:10,color:"#7c3aed",textDecoration:"none",fontFamily:"monospace"}}>
                {USERS_SHEET_ID.slice(0,36)}...
              </a>
            </div>
          </div>
          <div style={{display:"flex",gap:6,flexWrap:"wrap"}}>
            <button onClick={startAdd}
              style={{background:"#7c3aed",color:"#fff",border:"none",padding:"8px 14px",borderRadius:8,cursor:"pointer",fontWeight:700,fontSize:13}}>
              + เพิ่มผู้ใช้
            </button>
            <SyncBtn which="users" label="🔄 Sync Users"/>
            <button onClick={()=>testConnection("users")}
              style={{background:"#fff7ed",color:"#c2410c",border:"1px solid #fed7aa",padding:"8px 10px",borderRadius:8,cursor:"pointer",fontSize:12,fontWeight:600}}>
              🔍 ทดสอบ
            </button>
            <button onClick={()=>exportCSV("users")}
              style={{background:"#f5f3ff",color:"#7c3aed",border:"1px solid #ddd6fe",padding:"8px 10px",borderRadius:8,cursor:"pointer",fontSize:12}}>
              📥 CSV
            </button>
            <a href={USHEET_URL} target="_blank" rel="noreferrer"
              style={{background:"#f5f3ff",color:"#7c3aed",border:"1px solid #ddd6fe",padding:"8px 10px",borderRadius:8,fontSize:12,textDecoration:"none"}}>
              🔗 เปิด
            </a>
          </div>
        </div>

        {/* Sync status */}
        {syncMsg.users&&<div style={{fontSize:12,color:syncSt.users==="ok"?"#10b981":syncSt.users==="error"?"#ef4444":"#64748b",marginBottom:8,fontWeight:500,padding:"6px 10px",background:"#f8fafc",borderRadius:6}}>{syncMsg.users}</div>}
        {lastSync.users&&<div style={{fontSize:11,color:"#94a3b8",marginBottom:10}}>🕐 Sync ล่าสุด: {lastSync.users}</div>}

        {/* Script URL */}
        <SheetUrlInput which="users" placeholder="Apps Script URL สำหรับ Users Sheet → https://script.google.com/macros/s/.../exec"/>

        {/* Add/Edit form */}
        {(userTab==="add"||userTab==="edit")&&(
          <div style={{background:"#faf5ff",borderRadius:12,padding:18,marginBottom:14,border:"1px solid #ddd6fe"}}>
            <div style={{fontWeight:700,marginBottom:12,fontSize:14,color:"#7c3aed"}}>
              {userTab==="add"?"➕ เพิ่มผู้ใช้ใหม่":"✏️ แก้ไข: "+editUser?.username}
            </div>
            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10,marginBottom:10}}>
              {[["Username (email)","username","text"],["Password","password","password"],
                ["ชื่อ","first_name","text"],["นามสกุล","last_name","text"],
                ["สังกัด","affiliation","text"],["หมดอายุ Subscription","subscription_expiry","date"]
              ].map(([l,k,t])=>(
                <div key={k}>
                  <label style={{fontSize:11,color:"#64748b",display:"block",marginBottom:3}}>{l}</label>
                  <input type={t} value={userForm[k]||""} onChange={e=>setF(k,e.target.value)}
                    style={{width:"100%",padding:"9px 10px",borderRadius:8,border:"1px solid #e2e8f0",
                      fontSize:13,boxSizing:"border-box",outline:"none"}}
                    onFocus={e=>e.target.style.borderColor="#7c3aed"}
                    onBlur={e=>e.target.style.borderColor="#e2e8f0"}/>
                </div>
              ))}
              {[["Role","role",USER_ROLES],["ตำแหน่ง","position",USER_POSITIONS],
                ["Subscription","subscription_status",USER_SUBS]
              ].map(([l,k,opts])=>(
                <div key={k}>
                  <label style={{fontSize:11,color:"#64748b",display:"block",marginBottom:3}}>{l}</label>
                  <select value={userForm[k]||""} onChange={e=>setF(k,e.target.value)}
                    style={{width:"100%",padding:"9px 10px",borderRadius:8,border:"1px solid #e2e8f0",fontSize:13}}>
                    {opts.map(o=><option key={o} value={o}>{o}</option>)}
                  </select>
                </div>
              ))}
              <div style={{gridColumn:"1/-1"}}>
                <label style={{fontSize:11,color:"#64748b",display:"block",marginBottom:3}}>หมายเหตุ</label>
                <input value={userForm.notes||""} onChange={e=>setF("notes",e.target.value)}
                  style={{width:"100%",padding:"9px 10px",borderRadius:8,border:"1px solid #e2e8f0",fontSize:13,boxSizing:"border-box"}}/>
              </div>
            </div>
            <div style={{display:"flex",gap:8}}>
              <button onClick={saveUser}
                style={{background:"#7c3aed",color:"#fff",border:"none",padding:"10px 22px",borderRadius:8,fontWeight:700,cursor:"pointer",fontSize:13}}>
                💾 {userTab==="add"?"บันทึก":"อัพเดต"}
              </button>
              <button onClick={cancelForm}
                style={{background:"#f1f5f9",border:"none",padding:"10px 16px",borderRadius:8,cursor:"pointer",color:"#64748b",fontSize:13}}>
                ยกเลิก
              </button>
            </div>
          </div>
        )}

        {/* Search bar */}
        <div style={{display:"flex",gap:8,marginBottom:10,alignItems:"center"}}>
          <div style={{flex:1,display:"flex",alignItems:"center",gap:8,background:"#f8fafc",border:"1px solid #e2e8f0",borderRadius:8,padding:"7px 12px"}}>
            <span style={{color:"#94a3b8",fontSize:16}}>🔍</span>
            <input value={userSearch} onChange={e=>setUserSearch(e.target.value)}
              placeholder="ค้นหาชื่อ / username..."
              style={{border:"none",background:"transparent",outline:"none",fontSize:13,flex:1}}/>
          </div>
          <span style={{fontSize:12,color:"#94a3b8",whiteSpace:"nowrap"}}>{filteredUsers.length}/{users.length} คน</span>
        </div>

        {/* User rows */}
        <div style={{display:"flex",flexDirection:"column",gap:6,maxHeight:360,overflowY:"auto"}}>
          {filteredUsers.length===0&&(
            <div style={{textAlign:"center",padding:24,color:"#94a3b8",fontSize:13}}>ไม่พบผู้ใช้</div>
          )}
          {filteredUsers.map(u=>{
            const rc=ROLE_C[u.role]||ROLE_C.user;
            const sc=SUB_C[u.subscription_status]||SUB_C.none;
            const expired=u.subscription_expiry&&new Date(u.subscription_expiry)<new Date();
            const initials=[(u.first_name||"")[0],(u.last_name||"")[0]].filter(Boolean).join("").toUpperCase()||u.username[0].toUpperCase();
            return (
              <div key={u.id} style={{display:"flex",alignItems:"center",gap:10,padding:"10px 14px",border:"1px solid #e2e8f0",borderRadius:10,background:"#fafafa"}}>
                <div style={{width:38,height:38,borderRadius:"50%",background:"#ede9fe",display:"flex",alignItems:"center",justifyContent:"center",fontWeight:700,fontSize:14,color:"#7c3aed",flexShrink:0}}>{initials}</div>
                <div style={{flex:1,minWidth:0}}>
                  <div style={{fontWeight:600,fontSize:13,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>
                    {[u.first_name,u.last_name].filter(Boolean).join(" ")||u.username}
                  </div>
                  <div style={{fontSize:11,color:"#64748b",overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>
                    {u.username}{u.position&&" · "+u.position}{u.affiliation&&" · "+u.affiliation}
                  </div>
                </div>
                <div style={{display:"flex",gap:4,flexShrink:0,flexWrap:"wrap",justifyContent:"flex-end"}}>
                  <span style={{background:rc.bg,color:rc.c,fontSize:10,padding:"2px 7px",borderRadius:4,fontWeight:700}}>{u.role.toUpperCase()}</span>
                  <span style={{background:sc.bg,color:expired?"#ef4444":sc.c,fontSize:10,padding:"2px 7px",borderRadius:4,textDecoration:expired?"line-through":"none"}}>
                    {u.subscription_status}{expired?" (หมด)":""}
                  </span>
                </div>
                <div style={{display:"flex",gap:4,flexShrink:0}}>
                  <button onClick={()=>startEdit(u)} style={{background:"#eff6ff",color:"#004a99",border:"none",padding:"5px 10px",borderRadius:6,cursor:"pointer",fontSize:12,fontWeight:600}}>แก้ไข</button>
                  {u.role!=="owner"&&<button onClick={()=>deleteUser(u.id)} style={{background:"#fee2e2",color:"#ef4444",border:"none",padding:"5px 8px",borderRadius:6,cursor:"pointer",fontSize:12,fontWeight:700}}>✕</button>}
                </div>
              </div>
            );
          })}
        </div>

        {/* Preview toggle */}
        <button onClick={()=>setPreviewTab(p=>p==="users"?null:"users")}
          style={{marginTop:10,background:"#f5f3ff",color:"#7c3aed",border:"1px solid #ddd6fe",padding:"7px 14px",borderRadius:7,cursor:"pointer",fontSize:12,fontWeight:600}}>
          👁 {previewTab==="users"?"ซ่อน":"ดู"}ตัวอย่างข้อมูลที่จะส่ง Sheet
        </button>
        {previewTab==="users"&&(
          <div style={{marginTop:8,overflowX:"auto"}}>
            <table style={{borderCollapse:"collapse",fontSize:11,whiteSpace:"nowrap"}}>
              <thead><tr style={{background:"#7c3aed"}}>{USER_HEADERS.map(h=><th key={h} style={{padding:"6px 9px",color:"#fff",fontWeight:600,textAlign:"left"}}>{h}</th>)}</tr></thead>
              <tbody>{users.map((u,i)=>(
                <tr key={u.id} style={{background:i%2===0?"#fff":"#faf5ff"}}>
                  {userToRow(u).map((v,j)=><td key={j} style={{padding:"5px 9px",borderBottom:"1px solid #f1f5f9",maxWidth:120,overflow:"hidden",textOverflow:"ellipsis"}}>{v}</td>)}
                </tr>
              ))}</tbody>
            </table>
          </div>
        )}
      </div>

      {/* ── CLIENTS DATABASE ── */}
      <div style={{background:"#fff",borderRadius:14,padding:20,border:"2px solid #10b981"}}>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:12,flexWrap:"wrap",gap:8}}>
          <div style={{display:"flex",alignItems:"center",gap:10}}>
            <div style={{width:38,height:38,background:"#dcfce7",borderRadius:10,display:"flex",alignItems:"center",justifyContent:"center",fontSize:18}}>📗</div>
            <div>
              <div style={{fontWeight:700,fontSize:15}}>ฐานข้อมูลลูกค้า</div>
              <a href={CSHEET_URL} target="_blank" rel="noreferrer"
                style={{fontSize:10,color:"#10b981",textDecoration:"none",fontFamily:"monospace"}}>
                {CLIENTS_SHEET_ID.slice(0,36)}...
              </a>
            </div>
          </div>
          <div style={{display:"flex",gap:6,flexWrap:"wrap"}}>
            <SyncBtn which="clients" label="🔄 Sync ลูกค้า"/>
            <button onClick={()=>testConnection("clients")}
              style={{background:"#fff7ed",color:"#c2410c",border:"1px solid #fed7aa",padding:"8px 10px",borderRadius:8,cursor:"pointer",fontSize:12,fontWeight:600}}>
              🔍 ทดสอบ
            </button>
            <button onClick={()=>exportCSV("clients")}
              style={{background:"#f0fdf4",color:"#166534",border:"1px solid #bbf7d0",padding:"8px 10px",borderRadius:8,cursor:"pointer",fontSize:12}}>
              📥 CSV
            </button>
            <a href={CSHEET_URL} target="_blank" rel="noreferrer"
              style={{background:"#f0fdf4",color:"#166534",border:"1px solid #bbf7d0",padding:"8px 10px",borderRadius:8,fontSize:12,textDecoration:"none"}}>
              🔗 เปิด
            </a>
          </div>
        </div>

        {syncMsg.clients&&<div style={{fontSize:12,color:syncSt.clients==="ok"?"#10b981":syncSt.clients==="error"?"#ef4444":"#64748b",marginBottom:8,fontWeight:500,padding:"6px 10px",background:"#f8fafc",borderRadius:6}}>{syncMsg.clients}</div>}
        {lastSync.clients&&<div style={{fontSize:11,color:"#94a3b8",marginBottom:10}}>🕐 Sync ล่าสุด: {lastSync.clients}</div>}

        <SheetUrlInput which="clients" placeholder="Apps Script URL สำหรับ Clients Sheet → https://script.google.com/macros/s/.../exec"/>

        <button onClick={()=>setPreviewTab(p=>p==="clients"?null:"clients")}
          style={{background:"#f0fdf4",color:"#166534",border:"1px solid #bbf7d0",padding:"7px 14px",borderRadius:7,cursor:"pointer",fontSize:12,fontWeight:600}}>
          👁 {previewTab==="clients"?"ซ่อน":"ดู"}ตัวอย่าง ({clients.length} แถว)
        </button>
        {previewTab==="clients"&&(
          <div style={{marginTop:8,overflowX:"auto",maxHeight:260,overflowY:"auto"}}>
            <table style={{borderCollapse:"collapse",fontSize:11,whiteSpace:"nowrap"}}>
              <thead>
                <tr style={{background:"#004a99",position:"sticky",top:0}}>
                  {HEADERS.slice(0,10).map(h=><th key={h} style={{padding:"6px 9px",color:"#fff",fontWeight:600,textAlign:"left"}}>{h}</th>)}
                  <th style={{padding:"6px 9px",color:"#fff"}}>+{HEADERS.length-10}...</th>
                </tr>
              </thead>
              <tbody>
                {clients.map(clientToRow).map((r,i)=>(
                  <tr key={i} style={{background:i%2===0?"#fff":"#f0fdf4"}}>
                    {r.slice(0,10).map((v,j)=><td key={j} style={{padding:"5px 9px",borderBottom:"1px solid #f1f5f9",maxWidth:120,overflow:"hidden",textOverflow:"ellipsis"}}>{v}</td>)}
                    <td style={{padding:"5px 9px",color:"#94a3b8"}}>...</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* ── SETUP GUIDE ── */}
      <div style={{background:"#fff",borderRadius:14,padding:20,border:"1px solid #e2e8f0"}}>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:showSetup?14:0}}>
          <div style={{fontWeight:700,fontSize:14}}>📋 วิธีตั้งค่า Apps Script</div>
          <button onClick={()=>setShowSetup(s=>!s)}
            style={{background:"#f1f5f9",border:"none",padding:"6px 12px",borderRadius:7,cursor:"pointer",fontSize:12,fontWeight:600,color:"#64748b"}}>
            {showSetup?"▲ ซ่อน":"▼ แสดง"}
          </button>
        </div>
        {showSetup&&(
          <div>
            <ol style={{paddingLeft:20,color:"#475569",fontSize:13,lineHeight:2,marginBottom:12}}>
              <li>เปิด Google Sheet → <strong>Extensions → Apps Script</strong></li>
              <li>ลบโค้ดเดิมออก → วางโค้ดด้านล่าง → <strong>Ctrl+S</strong></li>
              <li><strong>Deploy → New deployment → Web app</strong></li>
              <li>Execute as: <strong>Me</strong> | Access: <strong>Anyone</strong></li>
              <li>Deploy → Authorize → <strong>Copy URL</strong> → วางในช่องด้านบน</li>
              <li style={{color:"#ef4444",fontWeight:600}}>⚠️ ทำซ้ำสำหรับทั้ง 2 Sheet (ใช้โค้ดเดียวกัน)</li>
            </ol>
            <div style={{background:"#1e293b",borderRadius:10,padding:16,overflowX:"auto"}}>
              <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:8}}>
                <span style={{color:"#94a3b8",fontSize:12,fontFamily:"monospace"}}>Code.gs</span>
                <button onClick={()=>navigator.clipboard?.writeText(SCRIPT_CODE).then(()=>alert("คัดลอกแล้ว!"))}
                  style={{background:"#334155",color:"#e2e8f0",border:"none",padding:"4px 10px",borderRadius:5,cursor:"pointer",fontSize:11}}>📋 คัดลอก</button>
              </div>
              <pre style={{color:"#e2e8f0",fontSize:11,fontFamily:"monospace",lineHeight:1.6,margin:0,whiteSpace:"pre-wrap"}}>{SCRIPT_CODE}</pre>
            </div>
          </div>
        )}
      </div>

    </div>
  );
}


