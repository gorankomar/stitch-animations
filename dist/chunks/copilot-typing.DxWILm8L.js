function m(r){const e=typeof Intl.Segmenter=="function"?Array.from(new Intl.Segmenter(void 0,{granularity:"grapheme"}).segment(r),({segment:t})=>t):Array.from(r),o=[12,8,16,10,22,9,13,17,8];let n=0;const a=e.map((t,s)=>(n+=o[s%o.length]+(/[.!?]/.test(t)&&e[s+1]===" "?85:/[, ]/.test(t)?18:0),n));return{letters:e,keys:a,total:n}}export{m as c};
//# sourceMappingURL=copilot-typing.DxWILm8L.js.map
