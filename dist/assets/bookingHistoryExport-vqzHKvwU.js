import{c,j as a}from"./index-BX_MZ8vQ.js";/**
 * @license lucide-react v0.439.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const f=c("Activity",[["path",{d:"M22 12h-2.48a2 2 0 0 0-1.93 1.46l-2.35 8.36a.25.25 0 0 1-.48 0L9.24 2.18a.25.25 0 0 0-.48 0l-2.35 8.36A2 2 0 0 1 4.49 12H2",key:"169zse"}]]),p=()=>a.jsxs("div",{className:"app-card",style:{display:"flex",flexDirection:"column",gap:"0.75rem"},children:[a.jsx("div",{className:"skeleton",style:{height:"20px",width:"60%"}}),a.jsx("div",{className:"skeleton",style:{height:"14px",width:"90%"}}),a.jsx("div",{className:"skeleton",style:{height:"14px",width:"40%"}})]}),g=({count:o=3})=>a.jsx("div",{style:{display:"flex",flexDirection:"column",gap:"1rem"},children:Array.from({length:o}).map((r,n)=>a.jsx(p,{},n))}),h=(o,r="StyleCorner_Booking_History.csv")=>{if(!o||o.length===0)return!1;const n=["Booking ID","Service","Specialist / Stylist","Client Name","Client Email","Client Phone","Date","Time","Price (₦)","Status","Created At"],s=o.map(e=>[`"${e._id||""}"`,`"${(e.service||"").replace(/"/g,'""')}"`,`"${(e.stylist||"").replace(/"/g,'""')}"`,`"${(e.clientName||e.clientEmail||"").replace(/"/g,'""')}"`,`"${(e.clientEmail||"").replace(/"/g,'""')}"`,`"${(e.clientPhone||"").replace(/"/g,'""')}"`,`"${e.date||""}"`,`"${e.time||""}"`,`"${e.price||0}"`,`"${(e.status||"").toUpperCase()}"`,`"${e.createdAt?new Date(e.createdAt).toLocaleString():""}"`]),l="\uFEFF"+[n.join(","),...s.map(e=>e.join(","))].join(`\r
`),d=new Blob([l],{type:"text/csv;charset=utf-8;"}),t=URL.createObjectURL(d),i=document.createElement("a");return i.setAttribute("href",t),i.setAttribute("download",r),document.body.appendChild(i),i.click(),setTimeout(()=>{document.body.removeChild(i),URL.revokeObjectURL(t)},100),!0},u=(o,r="Booking History Statement")=>{if(!o||o.length===0)return!1;const n=window.open("","_blank");if(!n)return!1;const s=o.map((t,i)=>`
    <tr style="border-bottom: 1px solid #e5e7eb; background: ${i%2===0?"#ffffff":"#fafafa"};">
      <td style="padding: 10px 12px; font-weight: bold; font-family: monospace; font-size: 0.85rem; color: #171717;">#${String(t._id||i+1).slice(-6).toUpperCase()}</td>
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
  `).join(""),l=o.reduce((t,i)=>t+(Number(i.price)||0),0),d=`
    <!DOCTYPE html>
    <html>
      <head>
        <title>Style Corner - ${r}</title>
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

        <h2 style="font-size: 1.2rem; margin-bottom: 0.5rem;">${r}</h2>
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
            ${s}
          </tbody>
        </table>

        <div class="summary">
          <div><strong>Total Records:</strong> ${o.length} Bookings</div>
          <div><strong>Total Value:</strong> <span style="font-size: 1.2rem; color: #d4af37; font-weight: 900;">₦${Number(l).toLocaleString()}</span></div>
        </div>
      </body>
    </html>
  `;return n.document.write(d),n.document.close(),!0};export{f as A,g as S,h as d,u as p};
