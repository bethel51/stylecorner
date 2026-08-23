import{c as a,j as s}from"./index-DjZFx_pu.js";import{C as i}from"./clock-DZpqTy42.js";import{C as n}from"./circle-check-CR_RiB-3.js";/**
 * @license lucide-react v0.439.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const l=a("CircleX",[["circle",{cx:"12",cy:"12",r:"10",key:"1mglay"}],["path",{d:"m15 9-6 6",key:"1uzhvr"}],["path",{d:"m9 9 6 6",key:"z0biqf"}]]);/**
 * @license lucide-react v0.439.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const o=a("Truck",[["path",{d:"M14 18V6a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2v11a1 1 0 0 0 1 1h2",key:"wrbu53"}],["path",{d:"M15 18H9",key:"1lyqi6"}],["path",{d:"M19 18h2a1 1 0 0 0 1-1v-3.65a1 1 0 0 0-.22-.624l-3.48-4.35A1 1 0 0 0 17.52 8H14",key:"lysw3i"}],["circle",{cx:"17",cy:"18",r:"2",key:"332jqn"}],["circle",{cx:"7",cy:"18",r:"2",key:"19iecd"}]]),h=({status:t})=>{const e=(t||"pending").toLowerCase(),c=(()=>{switch(e){case"accepted":case"verified":case"completed":return{label:e.toUpperCase(),className:"status-accepted",icon:n};case"shipped":return{label:"SHIPPED",className:"status-shipped",icon:o};case"rejected":case"unverified":case"cancelled":return{label:e.toUpperCase(),className:"status-rejected",icon:l};case"pending":default:return{label:"PENDING",className:"status-pending",icon:i}}})(),r=c.icon;return s.jsxs("span",{className:`status-badge ${c.className}`,children:[s.jsx(r,{size:12}),s.jsx("span",{children:c.label})]})};export{l as C,h as S,o as T};
