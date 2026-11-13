"""Build a vector atlas from untouched Figma component exports; no path optimization."""
import json, re, pathlib, hashlib
base=pathlib.Path(__file__).resolve().parents[2]
assets=base/'src/embeds/assets'
flags=sorted(json.loads((assets/'stitch-country-flags.figma.json').read_text()),key=lambda f:f['code'])
parts=['<svg xmlns="http://www.w3.org/2000/svg" width="512" height="384" viewBox="0 0 512 384">']
positions={}
for i,f in enumerate(flags):
    x,y=i%16*32,i//16*24
    # Remove only the component's inset perimeter stroke; CSS draws it outside.
    svg=re.sub(r'<rect x="0.5" y="0.5" width="[0-9.]+" height="23" rx="1.5" stroke="#EFEFEF"\s*/>', '', f['svg'])
    # Rounded perimeter clipping belongs to the CSS artwork slot. Keep any
    # illustration-specific masks/clips; nested SVG viewports still bound each cell.
    rounded = re.findall(r'<clipPath id="([^"]+)">\s*<rect width="[0-9.]+" height="24" rx="2" fill="white"/>\s*</clipPath>', svg)
    for ident in rounded:
        svg=svg.replace(' clip-path="url(#'+ident+')"','')
        svg=re.sub(r'<clipPath id="'+re.escape(ident)+r'">.*?</clipPath>', '', svg, flags=re.S)
    for ident in re.findall(r'\bid="([^"]+)"',svg):
        svg=svg.replace('id="'+ident+'"','id="'+f['code']+'-'+ident+'"').replace('#'+ident,'#'+f['code']+'-'+ident)
    svg=re.sub(r'<svg\b[^>]*>',f'<svg x="{x}" y="{y}" width="27" height="18" viewBox="0 0 36 24" fill="none">',svg,count=1)
    parts.append(svg);positions[f['code']]=[x,y]
parts.append('</svg>')
out=assets/'stitch-country-flags.svg';out.write_text('\n'.join(parts))
(assets/'stitch-country-flags.positions.json').write_text(json.dumps(positions,separators=(',',':'))+'\n')
print(json.dumps({'count':len(flags),'bytes':out.stat().st_size,'md5':hashlib.md5(out.read_bytes()).hexdigest()}))
