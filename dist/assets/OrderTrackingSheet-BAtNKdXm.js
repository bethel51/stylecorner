import{f as A,r as p,x as F,M as C,j as e,B as R,D as $,i as L,a as k}from"./index-CX8mGrc7.js";import{C as P}from"./clock-BP0rS-hU.js";import{T as B}from"./StatusBadge-h8xUjjBa.js";import{C as W}from"./circle-check-BdaDHUpF.js";import{S as E}from"./send-CKJzozQF.js";const M=s=>{if(!s)return;const m=String(s._id||"").slice(-6).toUpperCase(),t=s.createdAt?new Date(s.createdAt).toLocaleDateString("en-NG",{weekday:"short",year:"numeric",month:"short",day:"numeric"}):new Date().toLocaleDateString(),r=window.open("","_blank","width=800,height=900");if(!r)return;const o=`
    <!DOCTYPE html>
    <html>
      <head>
        <title>Style Corner — Official Order Invoice #${m}</title>
        <style>
          @import url('https://fonts.googleapis.com/css2?family=Outfit:wght@400;600;800;900&display=swap');
          body {
            font-family: 'Outfit', sans-serif;
            margin: 0;
            padding: 40px;
            color: #171717;
            background-color: #ffffff;
          }
          .invoice-box {
            max-width: 700px;
            margin: auto;
            border: 1.5px solid #d4af37;
            border-radius: 20px;
            padding: 35px;
            box-shadow: 0 10px 30px rgba(0,0,0,0.05);
          }
          .header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            border-bottom: 2px solid #171717;
            padding-bottom: 20px;
            margin-bottom: 25px;
          }
          .brand {
            font-size: 24px;
            font-weight: 900;
            letter-spacing: 1px;
            color: #171717;
          }
          .brand span {
            color: #d4af37;
          }
          .invoice-title {
            text-align: right;
          }
          .invoice-title h2 {
            margin: 0;
            font-size: 18px;
            color: #d4af37;
          }
          .invoice-title p {
            margin: 3px 0 0;
            font-size: 13px;
            color: #6b7280;
          }
          .grid {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 20px;
            margin-bottom: 25px;
            background: #faf9f5;
            padding: 20px;
            border-radius: 14px;
          }
          .grid-item span {
            display: block;
            font-size: 11px;
            color: #6b7280;
            text-transform: uppercase;
            letter-spacing: 0.5px;
            margin-bottom: 3px;
          }
          .grid-item strong {
            font-size: 14px;
            color: #171717;
          }
          table {
            width: 100%;
            border-collapse: collapse;
            margin-bottom: 25px;
          }
          th {
            background: #171717;
            color: #d4af37;
            font-weight: 800;
            text-align: left;
            padding: 12px;
            font-size: 12px;
            text-transform: uppercase;
          }
          td {
            padding: 14px 12px;
            border-bottom: 1px solid #e5e7eb;
            font-size: 14px;
          }
          .total-box {
            display: flex;
            justify-content: space-between;
            align-items: center;
            background: #171717;
            color: #ffffff;
            padding: 18px 25px;
            border-radius: 14px;
          }
          .total-box span {
            font-size: 13px;
            color: #d4af37;
            font-weight: 800;
            letter-spacing: 1px;
          }
          .total-box h3 {
            margin: 0;
            font-size: 24px;
            color: #ffffff;
          }
          .footer {
            margin-top: 30px;
            text-align: center;
            font-size: 12px;
            color: #9ca3af;
            border-top: 1px dashed #e5e7eb;
            padding-top: 15px;
          }
        </style>
      </head>
      <body>
        <div class="invoice-box">
          <div class="header">
            <div class="brand">
              STYLE <span>CORNER</span>
            </div>
            <div class="invoice-title">
              <h2>OFFICIAL RECEIPT</h2>
              <p>Order #${m} · ${t}</p>
            </div>
          </div>

          <div class="grid">
            <div class="grid-item">
              <span>Customer Details</span>
              <strong>${s.name||"Valued Customer"}</strong><br/>
              <small style="color: #6b7280;">${s.email||""} · ${s.phone||""}</small>
            </div>
            <div class="grid-item">
              <span>Delivery Address</span>
              <strong>${s.address||`${s.houseNumber||""} ${s.street||""}, ${s.lga||""}, ${s.state||""}`}</strong>
            </div>
          </div>

          <table>
            <thead>
              <tr>
                <th>Item Description</th>
                <th style="text-align: right;">Amount</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td><strong>${s.item||"Grooming Store Purchase"}</strong></td>
                <td style="text-align: right; font-weight: 800;">₦${Number(s.totalPrice||s.price||0).toLocaleString()}</td>
              </tr>
            </tbody>
          </table>

          <div class="total-box">
            <span>FINAL AMOUNT PAID</span>
            <h3>₦${Number(s.totalPrice||s.price||0).toLocaleString()}</h3>
          </div>

          <div class="footer">
            Thank you for shopping with <strong>Style Corner Atelier</strong>.<br/>
            Need assistance with this order? Contact support at support@stylecorner.com
          </div>
        </div>

        <script>
          window.onload = function() {
            window.print();
          };
        <\/script>
      </body>
    </html>
  `;r.document.write(o),r.document.close()},u=[{id:"Order Placed",label:"Order Placed",icon:F},{id:"Processing",label:"Processing",icon:P},{id:"In Transit",label:"In Transit",icon:B},{id:"Out for Delivery",label:"Out for Delivery",icon:C},{id:"Delivered",label:"Delivered",icon:W}],q=({isOpen:s,onClose:m,order:t,onOrderUpdated:r,isAdmin:o=!1})=>{const{user:_,showToast:g}=A(),[f,b]=p.useState(""),[z,y]=p.useState(!1),[v,j]=p.useState(!1),[h,T]=p.useState((t==null?void 0:t.trackingStatus)||(t==null?void 0:t.status)||"Order Placed"),[S,N]=p.useState((t==null?void 0:t.trackingNumber)||""),[w,O]=p.useState((t==null?void 0:t.estimatedDelivery)||"");if(!t)return null;const l=t.trackingStatus||t.status||"Order Placed";let n=u.findIndex(i=>i.id.toLowerCase()===l.toLowerCase());n===-1&&(l.toLowerCase()==="pending"||l.toLowerCase()==="order placed"?n=0:l.toLowerCase()==="processing"?n=1:l.toLowerCase()==="shipped"?n=2:l.toLowerCase()==="out_for_delivery"?n=3:l.toLowerCase()==="delivered"||l.toLowerCase()==="completed"?n=4:n=0);const D=async i=>{if(i.preventDefault(),!!f.trim()){y(!0);try{const a=await k.addOrderMessage(t._id,f.trim());b(""),g("Message sent to "+(o?"customer":"admin")+"!","success"),r&&r(a)}catch(a){g(a.message||"Failed to send message","error")}finally{y(!1)}}},I=async i=>{i.preventDefault(),j(!0);try{const a=await k.updateOrderTracking(t._id,{trackingStatus:h,trackingNumber:S,estimatedDelivery:w,status:h==="Delivered"?"delivered":"processing"});g("Order tracking updated!","success"),r&&r(a)}catch(a){g(a.message||"Failed to update tracking","error")}finally{j(!1)}};return e.jsx(R,{isOpen:s,onClose:m,title:`Order Tracking #${String(t._id).slice(-6).toUpperCase()}`,children:e.jsxs("div",{style:{paddingBottom:"1rem"},children:[e.jsxs("div",{style:{background:"linear-gradient(135deg, #171717, #0d0d0d)",color:"#ffffff",borderRadius:"16px",padding:"1.1rem 1rem",marginBottom:"1.25rem",border:"1px solid rgba(212,175,55,0.3)"},children:[e.jsxs("div",{style:{display:"flex",justifyContent:"space-between",alignItems:"flex-start"},children:[e.jsxs("div",{children:[e.jsx("span",{style:{fontSize:"0.7rem",color:"#d4af37",fontFamily:"Outfit",fontWeight:800,textTransform:"uppercase",letterSpacing:"0.05em"},children:"PAID ORDER"}),e.jsx("h3",{style:{fontFamily:"Outfit",fontSize:"1.1rem",fontWeight:800,marginTop:"0.2rem"},children:t.item||"Grooming Products"})]}),e.jsx("div",{style:{textAlign:"right"},children:e.jsxs("span",{style:{fontFamily:"Outfit",fontSize:"1.25rem",fontWeight:900,color:"#d4af37"},children:["₦",Number(t.totalPrice||t.price||0).toLocaleString()]})})]}),e.jsxs("div",{style:{display:"flex",justifyContent:"space-between",alignItems:"center",marginTop:"0.75rem",fontSize:"0.78rem",color:"#a1a1aa",borderTop:"1px solid rgba(255,255,255,0.08)",paddingTop:"0.65rem",flexWrap:"wrap",gap:"0.5rem"},children:[e.jsxs("div",{children:[e.jsx("span",{style:{color:"#6b7280"},children:"Tracking #: "}),e.jsx("strong",{style:{color:"#ffffff"},children:t.trackingNumber||"SC-"+String(t._id).slice(-8).toUpperCase()})]}),e.jsxs("button",{type:"button",onClick:()=>M(t),style:{background:"rgba(212,175,55,0.18)",border:"1px solid rgba(212,175,55,0.4)",color:"#d4af37",padding:"0.35rem 0.75rem",borderRadius:"50px",fontSize:"0.72rem",fontFamily:"Outfit",fontWeight:800,cursor:"pointer",display:"flex",alignItems:"center",gap:"0.3rem"},children:[e.jsx($,{size:12})," Download PDF / Receipt"]})]})]}),e.jsxs("div",{className:"app-card",style:{marginBottom:"1.25rem",padding:"1.1rem"},children:[e.jsx("h4",{style:{fontFamily:"Outfit",fontSize:"0.95rem",fontWeight:800,color:"#171717",marginBottom:"1rem"},children:"Delivery Progress"}),e.jsxs("div",{style:{display:"flex",justifyContent:"space-between",position:"relative",marginBottom:"0.75rem"},children:[e.jsx("div",{style:{position:"absolute",top:"16px",left:"20px",right:"20px",height:"3px",background:"#e5e7eb",zIndex:1}}),e.jsx("div",{style:{position:"absolute",top:"16px",left:"20px",width:`${n/(u.length-1)*90}%`,height:"3px",background:"#d4af37",zIndex:2,transition:"width 0.3s ease"}}),u.map((i,a)=>{const d=i.icon,c=a<=n,x=a===n;return e.jsxs("div",{style:{display:"flex",flexDirection:"column",alignItems:"center",zIndex:3,width:"60px"},children:[e.jsx("div",{style:{width:"32px",height:"32px",borderRadius:"50%",background:c?"#171717":"#ffffff",border:x?"2.5px solid #d4af37":c?"2px solid #171717":"2px solid #d1d5db",color:c?"#d4af37":"#9ca3af",display:"flex",alignItems:"center",justifyContent:"center",boxShadow:x?"0 0 10px rgba(212,175,55,0.5)":"none"},children:e.jsx(d,{size:15})}),e.jsx("span",{style:{fontSize:"0.65rem",fontFamily:"Outfit",fontWeight:x?800:600,color:x?"#171717":c?"#4b5563":"#9ca3af",marginTop:"0.35rem",textAlign:"center"},children:i.label})]},i.id)})]})]}),e.jsxs("div",{className:"app-card",style:{marginBottom:"1.25rem",padding:"1.1rem"},children:[e.jsxs("h4",{style:{fontFamily:"Outfit",fontSize:"0.95rem",fontWeight:800,color:"#171717",marginBottom:"0.75rem",display:"flex",alignItems:"center",gap:"0.4rem"},children:[e.jsx(C,{size:16,color:"#d4af37"})," Delivery Location Details"]}),e.jsxs("div",{style:{display:"grid",gridTemplateColumns:"1fr 1fr",gap:"0.65rem",background:"#faf9f5",padding:"0.85rem",borderRadius:"12px",border:"1px solid rgba(212,175,55,0.2)"},children:[e.jsxs("div",{children:[e.jsx("span",{style:{fontSize:"0.72rem",color:"#6b7280",display:"block"},children:"State"}),e.jsx("strong",{style:{fontSize:"0.85rem",color:"#171717",fontFamily:"Outfit"},children:t.state||"N/A"})]}),e.jsxs("div",{children:[e.jsx("span",{style:{fontSize:"0.72rem",color:"#6b7280",display:"block"},children:"LGA / District"}),e.jsx("strong",{style:{fontSize:"0.85rem",color:"#171717",fontFamily:"Outfit"},children:t.lga||"N/A"})]}),e.jsxs("div",{children:[e.jsx("span",{style:{fontSize:"0.72rem",color:"#6b7280",display:"block"},children:"Street Name"}),e.jsx("strong",{style:{fontSize:"0.85rem",color:"#171717",fontFamily:"Outfit"},children:t.street||"N/A"})]}),e.jsxs("div",{children:[e.jsx("span",{style:{fontSize:"0.72rem",color:"#6b7280",display:"block"},children:"House / Flat #"}),e.jsx("strong",{style:{fontSize:"0.85rem",color:"#171717",fontFamily:"Outfit"},children:t.houseNumber||"N/A"})]})]}),e.jsxs("p",{style:{color:"#4b5563",fontSize:"0.78rem",marginTop:"0.65rem"},children:["📍 ",e.jsx("strong",{children:"Full Address:"})," ",t.address||`${t.houseNumber||""}, ${t.street||""}, ${t.lga||""}, ${t.state||""}`]}),t.phone&&e.jsxs("p",{style:{color:"#4b5563",fontSize:"0.78rem",marginTop:"0.2rem"},children:["📞 ",e.jsx("strong",{children:"Recipient Contact:"})," ",t.phone," (",t.name||t.email,")"]})]}),o&&e.jsxs("form",{onSubmit:I,className:"app-card",style:{marginBottom:"1.25rem",padding:"1.1rem",background:"rgba(212,175,55,0.06)",border:"1.5px solid rgba(212,175,55,0.4)"},children:[e.jsx("h4",{style:{fontFamily:"Outfit",fontSize:"0.95rem",fontWeight:800,color:"#171717",marginBottom:"0.75rem"},children:"🛠️ Admin Tracking Controls"}),e.jsxs("div",{className:"app-input-group",children:[e.jsx("label",{className:"app-label",children:"Tracking Stage"}),e.jsx("select",{value:h,onChange:i=>T(i.target.value),className:"app-input",style:{appearance:"auto",background:"#ffffff"},children:u.map(i=>e.jsx("option",{value:i.id,children:i.label},i.id))})]}),e.jsxs("div",{style:{display:"grid",gridTemplateColumns:"1fr 1fr",gap:"0.65rem"},children:[e.jsxs("div",{className:"app-input-group",style:{marginBottom:0},children:[e.jsx("label",{className:"app-label",children:"Tracking Number"}),e.jsx("input",{type:"text",value:S,onChange:i=>N(i.target.value),placeholder:"SC-TRK-98765",className:"app-input"})]}),e.jsxs("div",{className:"app-input-group",style:{marginBottom:0},children:[e.jsx("label",{className:"app-label",children:"Estimated Delivery"}),e.jsx("input",{type:"text",value:w,onChange:i=>O(i.target.value),placeholder:"e.g. Aug 25, 2026",className:"app-input"})]})]}),e.jsx("button",{type:"submit",disabled:v,className:"app-btn app-btn-primary",style:{marginTop:"0.85rem"},children:v?"Saving Changes...":"Update Tracking Status"})]}),e.jsxs("div",{className:"app-card",style:{marginBottom:0,padding:"1.1rem"},children:[e.jsxs("h4",{style:{fontFamily:"Outfit",fontSize:"0.95rem",fontWeight:800,color:"#171717",marginBottom:"0.75rem",display:"flex",alignItems:"center",gap:"0.4rem"},children:[e.jsx(L,{size:16,color:"#d4af37"})," Order Communication & Support"]}),e.jsx("div",{style:{display:"flex",flexDirection:"column",gap:"0.65rem",maxHeight:"200px",overflowY:"auto",paddingRight:"4px",marginBottom:"0.85rem"},children:!t.messages||t.messages.length===0?e.jsxs("div",{style:{textAlign:"center",padding:"1rem",color:"#9ca3af",fontSize:"0.8rem"},children:["No messages yet. Send a note to ",o?"the customer":"admin"," below."]}):t.messages.map((i,a)=>{var c;const d=o&&i.senderRole==="admin"||!o&&i.senderRole!=="admin";return e.jsxs("div",{style:{alignSelf:d?"flex-end":"flex-start",maxWidth:"85%",background:d?"#171717":"#f3f4f6",color:d?"#ffffff":"#171717",padding:"0.65rem 0.85rem",borderRadius:d?"14px 14px 2px 14px":"14px 14px 14px 2px",fontSize:"0.82rem"},children:[e.jsxs("div",{style:{display:"flex",justifyContent:"space-between",alignItems:"center",gap:"0.5rem",marginBottom:"0.2rem"},children:[e.jsxs("span",{style:{fontWeight:800,fontSize:"0.7rem",color:d?"#d4af37":"#4b5563"},children:[i.sender," (",((c=i.senderRole)==null?void 0:c.toUpperCase())||"USER",")"]}),e.jsx("span",{style:{fontSize:"0.65rem",opacity:.7},children:new Date(i.createdAt).toLocaleTimeString([],{hour:"2-digit",minute:"2-digit"})})]}),e.jsx("p",{style:{margin:0,lineHeight:1.35},children:i.text})]},a)})}),e.jsxs("form",{onSubmit:D,style:{display:"flex",gap:"0.5rem"},children:[e.jsx("input",{type:"text",value:f,onChange:i=>b(i.target.value),placeholder:`Write a message to ${o?"customer":"admin"}...`,className:"app-input",style:{flex:1,minHeight:"40px",fontSize:"0.82rem"}}),e.jsx("button",{type:"submit",disabled:z||!f.trim(),className:"app-btn app-btn-accent",style:{width:"auto",minHeight:"40px",padding:"0 1rem",borderRadius:"12px"},children:e.jsx(E,{size:15})})]})]})]})})};export{q as O};
