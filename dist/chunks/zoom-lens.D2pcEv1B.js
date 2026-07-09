import{q as A}from"./auto-reveal.BjGC-pFm.js";const N="[data-zoom-lens]",f="data-zoom-lens-ui",l=220,$=1.8,E="#D1D1D1",x=.2,P=2,b="stitch-zoom-lens-styles",m=new WeakMap,p=()=>{};function Z(e=document){if(typeof window>"u"||!e)return p;U();const n=A(N,e);if(!n.length)return p;const r=n.map(o=>C(o));return()=>r.forEach(o=>o&&o())}function C(e){if(!e||m.has(e))return p;const n=document.createElement("div"),r=document.createElement("div"),o={active:!1,frame:r,lens:n,host:e,hostRect:null,sourceRect:null,source:null,clone:null,observer:null,rafId:null,apertureSize:0,x:0,y:0,sourceX:0,sourceY:0,previousPosition:"",appliedPosition:!1};n.className="stitch-zoom-lens",n.setAttribute(f,""),n.setAttribute("aria-hidden","true"),r.className="stitch-zoom-lens_frame",n.append(r);const i=c=>{if(c.pointerType!=="touch"){if(o.active){h(o,c),a(o);return}T(o,c)}},t=c=>{!o.active||c.pointerType==="touch"||(h(o,c),a(o))},s=()=>y(o),u=()=>{o.active&&(g(o),a(o))};e.addEventListener("pointerenter",i),e.addEventListener("pointermove",t),e.addEventListener("pointerleave",s),e.addEventListener("mouseenter",i),e.addEventListener("mousemove",t),e.addEventListener("mouseleave",s),window.addEventListener("resize",u);const d=()=>{e.removeEventListener("pointerenter",i),e.removeEventListener("pointermove",t),e.removeEventListener("pointerleave",s),e.removeEventListener("mouseenter",i),e.removeEventListener("mousemove",t),e.removeEventListener("mouseleave",s),window.removeEventListener("resize",u),y(o),n.remove(),m.delete(e)};return m.set(e,d),d}function T(e,n){e.lens.classList.remove("is-shrinking"),e.apertureSize=0,e.host.contains(e.lens)||e.host.append(e.lens),D(e),I(e),_(e),g(e),h(e,n),e.active=!0,R(e),e.lens.classList.add("is-active")}function y(e){var n;e.apertureSize>0&&e.lens.classList.add("is-shrinking"),e.active=!1,e.lens.classList.remove("is-active"),e.rafId!==null&&(window.cancelAnimationFrame(e.rafId),e.rafId=null),(n=e.observer)==null||n.disconnect(),e.observer=null,e.appliedPosition&&(e.host.style.position=e.previousPosition,e.appliedPosition=!1)}function D(e){window.getComputedStyle(e.host).position==="static"&&(e.previousPosition=e.host.style.position,e.host.style.position="relative",e.appliedPosition=!0)}function I(e){const n=q(e.host);if(!n)return;const r=n.cloneNode(!0);w(r),r.setAttribute("aria-hidden","true"),r.classList.add("stitch-zoom-lens_source"),e.frame.replaceChildren(r),e.source=n,e.clone=r}function _(e){var n;typeof MutationObserver>"u"||!e.source||((n=e.observer)==null||n.disconnect(),e.observer=new MutationObserver(r=>{r.forEach(o=>F(e,o))}),e.observer.observe(e.source,{attributes:!0,characterData:!0,childList:!0,subtree:!0}))}function F(e,n){if(!(!e.active||!e.clone||z(n.target))){if(n.type==="attributes"){O(e,n);return}if(n.type==="characterData"){B(e,n);return}n.type==="childList"&&M(e,n)}}function O(e,n){const r=n.attributeName;if(!r||r===f||r==="data-zoom-lens")return;const o=v(e,n.target);if(!(o!=null&&o.setAttribute))return;const i=n.target.getAttribute(r);i===null?o.removeAttribute(r):o.setAttribute(r,i),a(e)}function B(e,n){const r=v(e,n.target);r&&(r.nodeValue=n.target.nodeValue,a(e))}function M(e,n){const r=v(e,n.target);r&&(r.replaceChildren(...Array.from(n.target.childNodes).filter(o=>!z(o)).map(o=>k(o))),g(e),a(e))}function v(e,n){var i;const r=Y(e.source,n);if(!r||!e.clone)return null;let o=e.clone;for(const t of r)if(o=((i=o==null?void 0:o.childNodes)==null?void 0:i[t])??null,!o)return null;return o}function Y(e,n){if(!e||!n)return null;if(e===n)return[];const r=[];let o=n;for(;o&&o!==e;){const i=o.parentNode;if(!i)return null;const s=Array.from(i.childNodes).filter(u=>!z(u)).indexOf(o);if(s<0)return null;r.unshift(s),o=i}return o===e?r:null}function k(e){const n=e.cloneNode(!0);return w(n),n}function w(e){e.nodeType===1&&(e.querySelectorAll(`[${f}]`).forEach(n=>n.remove()),e.removeAttribute("data-zoom-lens"),e.querySelectorAll("[data-zoom-lens]").forEach(n=>n.removeAttribute("data-zoom-lens")))}function z(e){var r;if(!e)return!1;const n=e.nodeType===1?e:e.parentElement;return!!((r=n==null?void 0:n.closest)!=null&&r.call(n,`[${f}]`))}function g(e){var n;e.hostRect=e.host.getBoundingClientRect(),e.sourceRect=((n=e.source)==null?void 0:n.getBoundingClientRect())??e.hostRect,!(!e.clone||!e.sourceRect)&&Object.assign(e.clone.style,{width:`${e.sourceRect.width}px`,height:`${e.sourceRect.height}px`,minHeight:`${e.sourceRect.height}px`})}function h(e,n){var i;const r=e.hostRect??e.host.getBoundingClientRect(),o=e.sourceRect??((i=e.source)==null?void 0:i.getBoundingClientRect())??r;e.hostRect=r,e.sourceRect=o,e.x=n.clientX-r.left,e.y=n.clientY-r.top,e.sourceX=n.clientX-o.left,e.sourceY=n.clientY-o.top}function a(e){e.rafId===null&&(e.rafId=window.requestAnimationFrame(()=>{e.rafId=null,R(e)}))}function R(e){if(!e.active||!e.clone)return;const n=L(e.host.dataset.zoomLensSize,l),r=L(e.host.dataset.zoomLensScale,$),o=n/2,i=X(e),t=Math.min(n,i),s=n>0?H(t/n):0,u=e.host.dataset.zoomLensBorder||E,d=o-e.sourceX*r,c=o-e.sourceY*r,S=t<e.apertureSize-.5;e.lens.style.setProperty("--stitch-zoom-lens-size",`${n}px`),e.lens.style.setProperty("--stitch-zoom-lens-aperture-size",`${t}px`),e.lens.style.setProperty("--stitch-zoom-lens-edge-size",`${i}px`),e.lens.style.setProperty("--stitch-zoom-lens-shadow-alpha",String(x*s)),e.lens.style.borderColor=u,e.lens.style.left=`${e.x}px`,e.lens.style.top=`${e.y}px`,e.lens.classList.toggle("is-shrinking",S),e.apertureSize=t,e.clone.style.transform=`translate3d(${d}px, ${c}px, 0) scale(${r})`}function X(e){const n=e.hostRect;if(!n)return Number.POSITIVE_INFINITY;const r=Math.min(e.x,e.y,n.width-e.x,n.height-e.y);return Math.max(0,(r-P)*2)}function q(e){const n=e.dataset.zoomLensTarget||e.dataset.zoomLensSource;if(!n)return e;try{return e.querySelector(n)||e}catch{return e}}function L(e,n){const r=Number.parseFloat(e);return Number.isFinite(r)&&r>0?r:n}function H(e){return!Number.isFinite(e)||e<=0?0:e>=1?1:e}function U(){if(document.getElementById(b))return;const e=document.createElement("style");e.id=b,e.textContent=`
    .stitch-zoom-lens {
      position: absolute;
      top: 0;
      left: 0;
      z-index: 20;
      width: 0;
      height: 0;
      max-width: var(--stitch-zoom-lens-edge-size, var(--stitch-zoom-lens-size, ${l}px));
      max-height: var(--stitch-zoom-lens-edge-size, var(--stitch-zoom-lens-size, ${l}px));
      border: 1px solid ${E};
      border-radius: 999px;
      background: #fff;
      box-shadow: 6px 15px 30px rgba(0, 0, 0, var(--stitch-zoom-lens-shadow-alpha, ${x}));
      opacity: 0;
      overflow: hidden;
      pointer-events: none;
      transform: translate3d(-50%, -50%, 0);
      transition:
        width 700ms var(--motion-ease-primary, cubic-bezier(.11, .61, .27, .99)),
        height 700ms var(--motion-ease-primary, cubic-bezier(.11, .61, .27, .99)),
        opacity 160ms ease;
      transform-origin: 50% 50%;
      will-change: top, left, width, height;
    }

    .stitch-zoom-lens.is-active {
      width: var(--stitch-zoom-lens-aperture-size, var(--stitch-zoom-lens-size, ${l}px));
      height: var(--stitch-zoom-lens-aperture-size, var(--stitch-zoom-lens-size, ${l}px));
      opacity: 1;
    }

    .stitch-zoom-lens.is-shrinking {
      transition:
        width 700ms cubic-bezier(.73, .01, .89, .39),
        height 700ms cubic-bezier(.73, .01, .89, .39),
        opacity 160ms ease;
    }

    .stitch-zoom-lens_frame {
      position: absolute;
      top: 50%;
      left: 50%;
      width: var(--stitch-zoom-lens-size, ${l}px);
      height: var(--stitch-zoom-lens-size, ${l}px);
      overflow: hidden;
      border-radius: inherit;
      contain: strict;
      transform: translate3d(-50%, -50%, 0);
    }

    .stitch-zoom-lens_source {
      position: absolute !important;
      top: 0 !important;
      left: 0 !important;
      margin: 0 !important;
      pointer-events: none !important;
      transform-origin: 0 0 !important;
      will-change: transform;
    }
  `,document.head.append(e)}export{Z as i};
//# sourceMappingURL=zoom-lens.D2pcEv1B.js.map
