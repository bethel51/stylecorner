import{c as S,j as e,r as c,T as M}from"./index-DwuFMMM-.js";import{f as H,C as q}from"./NotificationSheet-BVYw2Odz.js";import{u as _,g as w}from"./ScrollToTop-C4Ks9Vgd.js";import{C as V}from"./StatusBadge-D805Khbk.js";import{C as G}from"./clock-D2Hly904.js";import{S as Y}from"./App-D5AFsNfd.js";import{L as J}from"./lock-CXd0usI1.js";/**
 * @license lucide-react v0.439.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const oe=S("Activity",[["path",{d:"M22 12h-2.48a2 2 0 0 0-1.93 1.46l-2.35 8.36a.25.25 0 0 1-.48 0L9.24 2.18a.25.25 0 0 0-.48 0l-2.35 8.36A2 2 0 0 1 4.49 12H2",key:"169zse"}]]);/**
 * @license lucide-react v0.439.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const K=S("ArrowUpRight",[["path",{d:"M7 7h10v10",key:"1tivn9"}],["path",{d:"M7 17 17 7",key:"1vkiza"}]]);/**
 * @license lucide-react v0.439.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const se=S("History",[["path",{d:"M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8",key:"1357e3"}],["path",{d:"M3 3v5h5",key:"1xhq8a"}],["path",{d:"M12 7v5l4 2",key:"1fdv2h"}]]),Q=()=>e.jsxs("div",{className:"app-card",style:{display:"flex",flexDirection:"column",gap:"0.75rem"},children:[e.jsx("div",{className:"skeleton",style:{height:"20px",width:"60%"}}),e.jsx("div",{className:"skeleton",style:{height:"14px",width:"90%"}}),e.jsx("div",{className:"skeleton",style:{height:"14px",width:"40%"}})]}),le=({count:o=3})=>e.jsx("div",{style:{display:"flex",flexDirection:"column",gap:"1rem"},children:Array.from({length:o}).map((f,s)=>e.jsx(Q,{},s))}),de=({isOpen:o,onClose:f,walletBalance:s=0,onSuccess:h})=>{const{user:m,showToast:p}=_(),[t,l]=c.useState(""),[n,R]=c.useState([]),[b,j]=c.useState(""),[k,N]=c.useState(""),[y,C]=c.useState(""),[x,v]=c.useState(""),[$,z]=c.useState(!1),[A,g]=c.useState(""),[W,B]=c.useState(!1),[i,T]=c.useState({isOpen:!1,nextThirdSaturday:"Loading schedule...",daysUntilNext:0,message:""}),[X,L]=c.useState(!0);c.useEffect(()=>{o&&(F(),D(),g(""),l(""),C(""),v(""),j(""),N(""))},[o]);const F=async()=>{L(!0);try{const a=await w.getWithdrawalWindow();a&&T(a)}catch(a){console.warn("Could not fetch withdrawal window status",a)}finally{L(!1)}},D=async()=>{try{const a=await w.getBanksList();Array.isArray(a)&&a.length>0&&R(a)}catch(a){console.warn("Failed to load banks list",a)}},U=a=>{const r=a.target.value;j(r);const d=n.find(P=>P.code===r);N(d?d.name:""),v(""),g(""),y.trim().length===10&&r&&O(y.trim(),r)},E=a=>{const r=a.target.value.replace(/\D/g,"").slice(0,10);C(r),v(""),g(""),r.length===10&&b&&O(r,b)},O=async(a,r)=>{z(!0),g("");try{const d=await w.resolveBankAccount(a,r);d&&d.accountName?v(d.accountName):g("Could not verify account name. Please check bank and number.")}catch(d){g(d.message||"Account verification failed. Please verify bank & account number.")}finally{z(!1)}},I=async a=>{a.preventDefault();const r=Number(t);if(!r||r<1e3){p("Minimum withdrawal amount is ₦1,000.","error");return}if(r>s){p(`Insufficient balance. Maximum withdrawable: ₦${Number(s).toLocaleString()}`,"error");return}if(!x||!k||!y){p("Please resolve and confirm your destination bank account first.","error");return}if(!i.isOpen&&(m==null?void 0:m.role)!=="admin"){p(`Withdrawals are only accepted on the 3rd Saturday of the month. Next window: ${i.nextThirdSaturday}.`,"error");return}B(!0);try{const d=await w.requestWithdrawal({amount:r,bankName:k,bankCode:b,accountNumber:y.trim(),accountName:x.trim()});p(`Withdrawal of ₦${r.toLocaleString()} submitted successfully! Admin will process transfer.`,"success"),f(),h&&h(d.walletBalance!==void 0?d.walletBalance:s-r)}catch(d){p(d.message||"Withdrawal failed. Please try again.","error")}finally{B(!1)}},u=!i.isOpen&&(m==null?void 0:m.role)!=="admin";return e.jsx(H,{isOpen:o,onClose:f,title:"Withdraw Funds to Nigerian Bank",children:e.jsxs("form",{onSubmit:I,style:{padding:"0.25rem 0"},children:[e.jsxs("div",{style:{borderRadius:"14px",padding:"0.85rem 1rem",marginBottom:"1rem",border:i.isOpen?"1px solid rgba(34,197,94,0.35)":"1px solid rgba(234,179,8,0.35)",backgroundColor:i.isOpen?"rgba(34,197,94,0.08)":"rgba(234,179,8,0.08)",display:"flex",alignItems:"flex-start",gap:"0.75rem"},children:[e.jsx("div",{style:{width:"32px",height:"32px",borderRadius:"8px",backgroundColor:i.isOpen?"#16a34a":"#ca8a04",color:"#ffffff",display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0},children:i.isOpen?e.jsx(V,{size:16}):e.jsx(q,{size:16})}),e.jsxs("div",{children:[e.jsx("div",{style:{fontSize:"0.78rem",fontWeight:800,fontFamily:"Outfit",color:i.isOpen?"#15803d":"#854d0e"},children:i.isOpen?"🟢 Withdrawal Window OPEN Today!":"🗓️ Monthly Withdrawal Window: 3rd Saturday"}),e.jsx("div",{style:{fontSize:"0.72rem",color:i.isOpen?"#166534":"#713f12",marginTop:"0.15rem",lineHeight:1.4},children:i.isOpen?"Requests submitted today will be processed and disbursed directly to your verified bank account.":`Withdrawals open exclusively on the 3rd Saturday of every month. Next Window: ${i.nextThirdSaturday}${i.daysUntilNext?` (${i.daysUntilNext} day${i.daysUntilNext===1?"":"s"} away)`:""}.`})]})]}),e.jsxs("div",{style:{background:"#fafaf9",border:"1px solid rgba(212,175,55,0.3)",borderRadius:"14px",padding:"0.75rem 1rem",marginBottom:"1rem",display:"flex",justifyContent:"space-between",alignItems:"center"},children:[e.jsxs("div",{children:[e.jsx("div",{style:{fontSize:"0.68rem",color:"#78716c",fontWeight:800,textTransform:"uppercase"},children:"Withdrawable Balance"}),e.jsxs("div",{style:{fontFamily:"Outfit",fontSize:"1.25rem",fontWeight:900,color:"#171717"},children:["₦",Number(s).toLocaleString()]})]}),e.jsx("button",{type:"button",onClick:()=>l(String(s)),style:{background:"rgba(212,175,55,0.15)",border:"1px solid rgba(212,175,55,0.4)",color:"#b5952f",padding:"0.35rem 0.65rem",borderRadius:"50px",fontSize:"0.72rem",fontFamily:"Outfit",fontWeight:800,cursor:"pointer"},children:"Withdraw All"})]}),e.jsxs("div",{className:"app-input-group",style:{marginBottom:"0.85rem"},children:[e.jsx("label",{className:"app-label",children:"Withdrawal Amount (₦)"}),e.jsx("input",{type:"number",min:"1000",max:s,required:!0,value:t,onChange:a=>l(a.target.value),placeholder:"Minimum ₦1,000",className:"app-input",style:{fontFamily:"Outfit",fontSize:"1rem",fontWeight:700}})]}),e.jsxs("div",{className:"app-input-group",style:{marginBottom:"0.85rem"},children:[e.jsx("label",{className:"app-label",children:"Select Destination Bank"}),e.jsxs("select",{value:b,onChange:U,required:!0,className:"app-input",style:{fontFamily:"Outfit",fontSize:"0.85rem",fontWeight:700},children:[e.jsx("option",{value:"",children:"Select a Nigerian Bank..."}),n.map((a,r)=>e.jsx("option",{value:a.code,children:a.name},`${a.code}-${r}`))]})]}),e.jsxs("div",{className:"app-input-group",style:{marginBottom:"0.85rem"},children:[e.jsx("label",{className:"app-label",children:"10-Digit NUBAN Account Number"}),e.jsx("input",{type:"text",maxLength:10,required:!0,value:y,onChange:E,placeholder:"0123456789",className:"app-input",style:{fontFamily:"monospace",fontSize:"1.05rem",fontWeight:800,letterSpacing:"0.08em"}})]}),$&&e.jsxs("div",{style:{background:"#f8fafc",border:"1px dashed #94a3b8",borderRadius:"12px",padding:"0.75rem",marginBottom:"1rem",display:"flex",alignItems:"center",gap:"0.5rem",fontSize:"0.8rem",color:"#64748b"},children:[e.jsx(G,{size:16,className:"spin-slow"}),e.jsx("span",{children:"Resolving official NUBAN account name live..."})]}),x&&!$&&e.jsxs("div",{style:{background:"rgba(34,197,94,0.08)",border:"1.5px solid rgba(34,197,94,0.4)",borderRadius:"12px",padding:"0.75rem 1rem",marginBottom:"1rem",display:"flex",alignItems:"center",gap:"0.6rem"},children:[e.jsx(Y,{size:20,color:"#16a34a"}),e.jsxs("div",{children:[e.jsx("div",{style:{fontSize:"0.65rem",color:"#16a34a",fontWeight:800,textTransform:"uppercase"},children:"Verified Account Name"}),e.jsx("div",{style:{fontFamily:"Outfit",fontWeight:900,color:"#0f172a",fontSize:"0.95rem"},children:x})]})]}),A&&e.jsxs("div",{style:{background:"rgba(239,68,68,0.08)",border:"1px solid rgba(239,68,68,0.25)",borderRadius:"12px",padding:"0.65rem 0.85rem",marginBottom:"1rem",display:"flex",alignItems:"center",gap:"0.5rem",color:"#ef4444",fontSize:"0.78rem"},children:[e.jsx(M,{size:15}),e.jsx("span",{children:A})]}),e.jsx("button",{type:"submit",disabled:W||!x||!t||Number(t)<1e3||Number(t)>s||u,style:{width:"100%",padding:"0.85rem",borderRadius:"12px",backgroundColor:u?"#94a3b8":"#d4af37",color:u?"#f1f5f9":"#111111",fontWeight:800,fontSize:"0.9rem",border:"none",cursor:u?"not-allowed":"pointer",fontFamily:"Outfit",display:"flex",alignItems:"center",justifyContent:"center",gap:"0.4rem",boxShadow:u?"none":"0 4px 14px rgba(212,175,55,0.3)",transition:"all 0.15s ease"},children:u?e.jsxs(e.Fragment,{children:[e.jsx(J,{size:15}),e.jsx("span",{children:"Withdrawals Open on 3rd Saturday"})]}):e.jsxs(e.Fragment,{children:[e.jsx(K,{size:16}),e.jsx("span",{children:W?"Processing Payout Request...":`Authorize ₦${Number(t||0).toLocaleString()} Payout`})]})}),u&&e.jsxs("div",{style:{textAlign:"center",fontSize:"0.72rem",color:"#64748b",marginTop:"0.65rem"},children:["Next window opens: ",e.jsx("strong",{children:i.nextThirdSaturday})]})]})})},ce=(o,f="StyleCorner_Booking_History.csv")=>{if(!o||o.length===0)return!1;const s=["Booking ID","Service","Specialist / Stylist","Client Name","Client Email","Client Phone","Date","Time","Price (₦)","Status","Created At"],h=o.map(n=>[`"${n._id||""}"`,`"${(n.service||"").replace(/"/g,'""')}"`,`"${(n.stylist||"").replace(/"/g,'""')}"`,`"${(n.clientName||n.clientEmail||"").replace(/"/g,'""')}"`,`"${(n.clientEmail||"").replace(/"/g,'""')}"`,`"${(n.clientPhone||"").replace(/"/g,'""')}"`,`"${n.date||""}"`,`"${n.time||""}"`,`"${n.price||0}"`,`"${(n.status||"").toUpperCase()}"`,`"${n.createdAt?new Date(n.createdAt).toLocaleString():""}"`]),m="\uFEFF"+[s.join(","),...h.map(n=>n.join(","))].join(`\r
`),p=new Blob([m],{type:"text/csv;charset=utf-8;"}),t=URL.createObjectURL(p),l=document.createElement("a");return l.setAttribute("href",t),l.setAttribute("download",f),document.body.appendChild(l),l.click(),setTimeout(()=>{document.body.removeChild(l),URL.revokeObjectURL(t)},100),!0},me=(o,f="Booking History Statement")=>{if(!o||o.length===0)return!1;const s=window.open("","_blank");if(!s)return!1;const h=o.map((t,l)=>`
    <tr style="border-bottom: 1px solid #e5e7eb; background: ${l%2===0?"#ffffff":"#fafafa"};">
      <td style="padding: 10px 12px; font-weight: bold; font-family: monospace; font-size: 0.85rem; color: #171717;">#${String(t._id||l+1).slice(-6).toUpperCase()}</td>
      <td style="padding: 10px 12px; font-size: 0.9rem; font-weight: 600; color: #171717;">${t.service||"Service"}</td>
      <td style="padding: 10px 12px; font-size: 0.85rem; color: #4b5563;">${t.stylist||"Specialist"}</td>
      <td style="padding: 10px 12px; font-size: 0.85rem; color: #4b5563;">${t.clientName||t.clientEmail||"Client"}</td>
      <td style="padding: 10px 12px; font-size: 0.85rem; color: #4b5563;">${t.date||""} @ ${t.time||""}</td>
      <td style="padding: 10px 12px; font-size: 0.9rem; font-weight: bold; color: #b5952f;">₦${Number(t.price||0).toLocaleString()}</td>
      <td style="padding: 10px 12px;">
        <span style="display: inline-block; padding: 3px 8px; border-radius: 50px; font-size: 0.72rem; font-weight: 800; text-transform: uppercase; 
          background: ${t.status==="completed"?"#d1fae5":t.status==="accepted"?"#dbeafe":t.status==="pending"?"#fef3c7":"#fee2e2"};
          color: ${t.status==="completed"?"#047857":t.status==="accepted"?"#1e40af":t.status==="pending"?"#b45309":"#b91c1c"};">
          ${t.status||"STATUS"}
        </span>
      </td>
    </tr>
  `).join(""),m=o.reduce((t,l)=>t+(Number(l.price)||0),0),p=`
    <!DOCTYPE html>
    <html>
      <head>
        <title>Style Corner - ${f}</title>
        <meta charset="utf-8" />
        <style>
          body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; padding: 2rem; color: #171717; background: #ffffff; }
          .header { display: flex; justify-content: space-between; align-items: center; border-bottom: 2px solid #d4af37; padding-bottom: 1rem; margin-bottom: 1.5rem; }
          .logo { font-size: 1.5rem; font-weight: 900; color: #171717; letter-spacing: -0.02em; }
          .logo span { color: #d4af37; }
          table { width: 100%; border-collapse: collapse; margin-top: 1rem; text-align: left; }
          th { background: #171717; color: #ffffff; padding: 10px 12px; font-size: 0.82rem; text-transform: uppercase; letter-spacing: 0.05em; }
          .summary { display: flex; justify-content: space-between; margin-top: 1.5rem; padding: 1rem; background: #faf9f5; border: 1px solid #e5e7eb; border-radius: 8px; }
          .btn-print { background: #d4af37; color: #fff; border: none; padding: 10px 20px; font-weight: bold; border-radius: 6px; cursor: pointer; }
          @media print { .no-print { display: none; } }
        </style>
      </head>
      <body>
        <div class="header">
          <div>
            <div class="logo">STYLE <span>CORNER</span></div>
            <div style="font-size: 0.85rem; color: #6b7280; margin-top: 2px;">Official Booking History Statement</div>
          </div>
          <div class="no-print">
            <button class="btn-print" onclick="window.print()">Print / Save PDF</button>
          </div>
        </div>

        <h2 style="font-size: 1.2rem; margin-bottom: 0.5rem;">${f}</h2>
        <div style="font-size: 0.85rem; color: #6b7280; margin-bottom: 1rem;">Generated on ${new Date().toLocaleDateString()} at ${new Date().toLocaleTimeString()}</div>

        <table>
          <thead>
            <tr>
              <th>ID</th>
              <th>Service</th>
              <th>Stylist</th>
              <th>Client</th>
              <th>Date & Time</th>
              <th>Amount</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            ${h}
          </tbody>
        </table>

        <div class="summary">
          <div><strong>Total Records:</strong> ${o.length} Bookings</div>
          <div><strong>Total Value:</strong> <span style="font-size: 1.2rem; color: #d4af37; font-weight: 900;">₦${Number(m).toLocaleString()}</span></div>
        </div>
      </body>
    </html>
  `;return s.document.write(p),s.document.close(),!0};export{K as A,se as H,le as S,de as W,oe as a,ce as d,me as p};
