"""Translate the captured dashboard into native Webflow HTML/CSS; no runtime."""
from pathlib import Path
import re, json
from html.parser import HTMLParser
from html import escape
P=Path(__file__).parent
source=(P/'figma-reference.txt').read_text().split('export default function')[1]
source=source[source.index('    <div'):source.rindex('  );')].strip()
source=re.sub(r'<NavBadges[^>]*/>', '<div className="platform-production">PRD</div>', source)
source=re.sub(r'<ChevronRight([^>]*)/>',r'<div\1><img src={imgChevronRight} /></div>',source)
source=re.sub(r' style=\{\{.*?\}\}', '', source)
source=source.replace('className=', 'class=')
source=re.sub(r'<p class="([^"]*)"', lambda m:'<p class="'+m[1]+' platform-copy"', source)
def unit(v):
 return re.sub(r'(-?\d+(?:\.\d+)?)px',lambda m:f'{float(m[1])/14.4:.7f}cqi',v.replace('_',' '))
simple={'relative':{'position':'relative'},'absolute':{'position':'absolute'},'flex':{'display':'flex'},'inline-grid':{'display':'inline-grid'},'contents':{'display':'contents'},'block':{'display':'block'},'flex-col':{'flex-direction':'column'},'items-start':{'align-items':'flex-start'},'items-center':{'align-items':'center'},'items-end':{'align-items':'flex-end'},'justify-center':{'justify-content':'center'},'justify-between':{'justify-content':'space-between'},'self-stretch':{'align-self':'stretch'},'shrink-0':{'flex-shrink':'0'},'min-w-px':{'min-width':'0'},'min-w-full':{'min-width':'100%'},'max-w-none':{'max-width':'none'},'w-full':{'width':'100%'},'h-full':{'height':'100%'},'size-full':{'width':'100%','height':'100%'},'overflow-clip':{'overflow':'hidden'},'font-medium':{'font-weight':'500'},'font-semibold':{'font-weight':'600'},'font-bold':{'font-weight':'700'},'font-normal':{'font-weight':'400'},'bg-white':{'background-color':'#fff'},'text-center':{'text-align':'center'},'text-left':{'text-align':'left'},'whitespace-nowrap':{'white-space':'nowrap'},'mix-blend-multiply':{'mix-blend-mode':'multiply'},'left-0':{'left':'0'},'top-1/2':{'top':'50%'},'-translate-y-1/2':{'transform':'translateY(-50%)'},'isolate':{'isolation':'isolate'},'col-1':{'grid-column':'1'},'row-1':{'grid-row':'1'},'place-items-start':{'place-items':'start'},'ml-0':{'margin-left':'0'},'mt-0':{'margin-top':'0'},'ml-px':{'margin-left':'.0694444cqi'},'inset-0':{'top':'0','right':'0','bottom':'0','left':'0'},'not-italic':{'font-style':'normal'},'cursor-pointer':{'cursor':'default'},'[word-break:break-word]':{'overflow-wrap':'break-word'},'mask-no-repeat':{'mask-repeat':'no-repeat'},'mask-alpha':{'mask-mode':'alpha'},'mask-intersect':{'mask-composite':'intersect'},'mask-no-clip':{'mask-clip':'no-clip'}}
edges=['top','right','bottom','left']
def decl(tokens):
 d={}
 for t in tokens.split():
  if t in simple: d.update(simple[t]);continue
  if t.startswith('font-[') or t=='content-stretch': continue
  if t=='border' or t.startswith('border-[') and not t.startswith('border-[#'):
   v='.0694444cqi' if t=='border' else unit(t[8:-1]);d.update({f'border-{e}-width':v for e in edges});d.update({f'border-{e}-style':'solid' for e in edges});continue
  if t=='border-r':d.update({'border-right-width':'.0694444cqi','border-right-style':'solid'});continue
  if t=='border-solid':continue
  if t.startswith('border-[#'):d.update({f'border-{e}-color':t[8:-1] for e in edges});continue
  m=re.match(r'(.+?)-\[(.*)\]$',t)
  if not m: raise ValueError(t)
  k,v=m.groups();v=unit(v)
  if k=='bg': d['background-color']=v
  elif k=='text':d['color' if v.startswith('#') else 'font-size']=v
  elif k=='leading':d['line-height']=v
  elif k=='flex':d['flex']=v
  elif k=='gap':d.update({'column-gap':v,'row-gap':v})
  elif k in ['w','h','size']:d.update({p:v for p in ({'w':['width'],'h':['height'],'size':['width','height']}[k])})
  elif k in ['p','px','py','pt','pb','pl','pr']:d.update({f'padding-{e}':v for e in {'p':edges,'px':['left','right'],'py':['top','bottom'],'pt':['top'],'pb':['bottom'],'pl':['left'],'pr':['right']}[k]})
  elif k in ['ml','mt']:d['margin-'+('left' if k=='ml' else 'top')]=v
  elif k in ['top','right','bottom','left']:d[k]=v
  elif k=='inset':
   a=v.split();a=a*4 if len(a)==1 else a*2 if len(a)==2 else a
   d.update(dict(zip(edges,a)))
  elif k.startswith('rounded'):
   cs={'rounded':['top-left','top-right','bottom-left','bottom-right'],'rounded-bl':['bottom-left'],'rounded-br':['bottom-right'],'rounded-tl':['top-left'],'rounded-tr':['top-right']}[k]
   d.update({f'border-{c}-radius':v for c in cs})
  elif k=='z':d['z-index']=v
  elif k in ['grid-cols','grid-rows']:d['grid-template-'+('columns' if k=='grid-cols' else 'rows')]=v
  elif k=='drop-shadow':d['filter']=' '.join('drop-shadow('+x+')' for x in re.split(r'(?<=\)),',v))
  elif k=='mask-position':d['mask-position']=v
  elif k=='mask-size':d['mask-size']=v
  else: raise ValueError(t)
 return d
def svg(name,cls):
 s=(P/'assets/originals'/f'{name}.svg').read_text()
 # Preserve viewBox, path geometry, masks, gradients and root dimensions.
 s=re.sub(r' style="[^"]*"','',s)
 s=s.replace('<svg ',f'<svg class="{cls}" aria-hidden="true" ',1)
 # Namespace IDs to make repeated inline exports safe.
 prefix=cls+'-'
 s=re.sub(r'id="([^"]+)"',lambda m:'id="'+prefix+m[1]+'"',s)
 s=re.sub(r'url\(#([^\)]+)\)',lambda m:'url(#'+prefix+m[1]+')',s)
 return s
styles={}; n=0
def classes(m):
 global n
 ts=m[1]
 if ts=='platform-production':return 'class="platform-production"'
 n+=1;c=f'platform-ui-{n}';styles[c]=decl(ts.replace(' platform-copy',''));
 if 'platform-copy' in ts:
  styles[c].setdefault('margin-top','0');styles[c].setdefault('margin-bottom','0')
 return f'class="{c}"'
source=re.sub(r'class="([^"]*)"',classes,source)
counter=0
def image(m):
 global counter
 counter+=1; attrs,name=m.groups();c=f'platform-vector-{counter}'
 inherited=re.search(r'class="([^"]+)"',attrs)
 d=styles[inherited[1]].copy() if inherited else {}
 d.update({'display':'block','width':'100%','height':'100%'});styles[c]=d
 return svg(name,c)
source=re.sub(r'<img ([^>]*?)src=\{(img\w+)\}[^>]*/>',image,source)
source=re.sub(r'\s+data-node-id="[^"]*"','',source)
# HTMLParser serializes the JSX self-closing divs correctly and keeps SVG geometry.
class Normalize(HTMLParser):
 def __init__(self):super().__init__(convert_charrefs=False);self.out=[]
 def handle_starttag(self,tag,attrs):self.out.append('<'+tag+''.join(' '+k+'="'+escape(v or '',quote=True)+'"' for k,v in attrs)+'>')
 def handle_endtag(self,tag):self.out.append('</'+tag+'>')
 def handle_startendtag(self,tag,attrs):self.handle_starttag(tag,attrs);self.handle_endtag(tag)
 def handle_data(self,d):self.out.append(d)
 def handle_entityref(self,n):self.out.append('&'+n+';')
# Don't lowercase SVG attributes: source already HTML-compatible except self-closing divs.
source=re.sub(r'<div([^>]*?)/>',r'<div\1></div>',source)
source=source.replace('<button ', '<div ').replace('</button>','</div>')
styles['platform-production']={'background-color':'#edfcf2','color':'#087443','font-size':'.8333333cqi','line-height':'1.25cqi','border-radius':'.4166667cqi','padding':'.1388889cqi .4166667cqi','border':'.0694444cqi solid #aaf0c4'}
# Use original root as full platform frame, with a separate measuring ancestor.
source='<div class="platform-screen-measure">'+source+'</div>'
css='\n'.join('.'+c+' { '+ '; '.join(k+': '+v for k,v in d.items())+'; }' for c,d in styles.items())
css+='\n.platform-screen-measure { width:100%; max-width:1440px; margin-left:auto; margin-right:auto; font-family:Abcdiatype, sans-serif; color:#101828; }\n.platform-ui-1 { width:100%; height:43.4722222cqi; background-color:#f5f5f5; }'
(P/'dashboard.html').write_text(source)
(P/'dashboard-native.css').write_text(css)
(P/'dashboard-data.json').write_text(json.dumps({'html':source,'css':css}))
print('Generated',n,'native styles;',counter,'inline vectors')
