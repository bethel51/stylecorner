import{c as s,j as a}from"./index-DwuFMMM-.js";import{C as i}from"./clock-D2Hly904.js";import{C as l}from"./circle-check-KqUFcl_f.js";/**
 * @license lucide-react v0.439.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const m=s("CircleCheckBig",[["path",{d:"M21.801 10A10 10 0 1 1 17 3.335",key:"yps3ct"}],["path",{d:"m9 11 3 3L22 4",key:"1pflzl"}]]);/**
 * @license lucide-react v0.439.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const n=s("CircleX",[["circle",{cx:"12",cy:"12",r:"10",key:"1mglay"}],["path",{d:"m15 9-6 6",key:"1uzhvr"}],["path",{d:"m9 9 6 6",key:"z0biqf"}]]);/**
 * @license lucide-react v0.439.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const o=s("Truck",[["path",{d:"M14 18V6a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2v11a1 1 0 0 0 1 1h2",key:"wrbu53"}],["path",{d:"M15 18H9",key:"1lyqi6"}],["path",{d:"M19 18h2a1 1 0 0 0 1-1v-3.65a1 1 0 0 0-.22-.624l-3.48-4.35A1 1 0 0 0 17.52 8H14",key:"lysw3i"}],["circle",{cx:"17",cy:"18",r:"2",key:"332jqn"}],["circle",{cx:"7",cy:"18",r:"2",key:"19iecd"}]]),y=({status:t})=>{const e=(t||"pending").toLowerCase(),c=(()=>{switch(e){case"accepted":case"verified":case"completed":return{label:e.toUpperCase(),className:"status-accepted",icon:l};case"shipped":return{label:"SHIPPED",className:"status-shipped",icon:o};case"rejected":case"unverified":case"cancelled":return{label:e.toUpperCase(),className:"status-rejected",icon:n};case"pending":default:return{label:"PENDING",className:"status-pending",icon:i}}})(),r=c.icon;return a.jsxs("span",{className:`status-badge ${c.className}`,children:[a.jsx(r,{size:12}),a.jsx("span",{children:c.label})]})};export{m as C,y as S,o as T,n as a};
