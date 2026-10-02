import pathlib,re
p=pathlib.Path('src/embeds/assets/buy-now-pay-later')
layers=[('line-left-bottom',-16,194.5),('pulse-left-bottom',-16,194.5),('line-left-middle',-15.85,156),('pulse-left-middle',-16,156),('line-left-top',-19,75.5),('pulse-left-top',-19,75.5),('line-right-outer',356,349),('line-right-middle',396.5,349),('line-right-inner',347,318),('pulse-right-inner',347,318)]
parts=[]
for i,(name,x,y) in enumerate(layers):
 s=(p/(name+'.svg')).read_text();inner=re.search(r'<svg[^>]*>(.*)</svg>',s,re.S).group(1)
 ids=re.findall(r'id="([^"]+)"',inner)
 for ident in ids:
  new='bnpl-'+str(i)+'-'+re.sub(r'[^a-zA-Z0-9_-]','-',ident);inner=inner.replace('id="'+ident+'"','id="'+new+'"').replace('#'+ident,'#'+new)
 inner=re.sub(r'<path ',f'<path data-bnpl-line="{i}" ',inner,count=1)
 parts.append(f'<g transform="translate({x} {y}) rotate(-90)">{inner}</g>')
svg='<svg class="bnpl-line-svg" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 540 278" width="100%" height="100%" fill="none" aria-hidden="true">'+''.join(parts)+'</svg>'
pathlib.Path('src/embeds/buy-now-pay-later-lines.html').write_text(svg)
