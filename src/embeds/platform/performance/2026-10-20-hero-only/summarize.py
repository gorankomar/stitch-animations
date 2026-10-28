import json,glob,statistics
from pathlib import Path
rows=[]
for p in sorted(glob.glob('/private/tmp/stitch-hero-comparison/*-*-*.report.json')):
 x=json.load(open(p));
 if x['categories']['performance']['score'] is None: continue
 a=x['audits'];r=a['network-requests']['details']['items'];name=Path(p).name.replace('.report.json',''); mode,kind,run=name.split('-')
 css=[i for i in r if i.get('resourceType')=='Stylesheet' and '/css/stitch-website.webflow.' in i['url']]
 doc=next(i for i in r if i['url']==x['finalDisplayedUrl'] and i.get('resourceType')=='Document')
 lcp=a.get('lcp-breakdown-insight',{}).get('details',{}).get('items',[]);node=next((i for i in lcp if i.get('type')=='node'),{})
 parts=next((i.get('items',[]) for i in lcp if i.get('type')=='table'),[])
 m=a['metrics']['details']['items'][0]
 row=dict(name=name,mode=mode,kind=kind,run=int(run),score=x['categories']['performance']['score']*100,fcp=a['first-contentful-paint']['numericValue'],lcp=a['largest-contentful-paint']['numericValue'],tbt=a['total-blocking-time']['numericValue'],cls=a['cumulative-layout-shift']['numericValue'],speedIndex=a['speed-index']['numericValue'],totalBytes=a['total-byte-weight']['numericValue'],requests=len(r),documentBytes=doc['transferSize'],pageCssBytes=sum(i['transferSize'] for i in css),heroImageBytes=sum(i['transferSize'] for i in r if 'hero-' in i['url']),dom=a['dom-size-insight']['details']['items'][0]['value']['value'],mainThread=a['mainthread-work-breakdown']['numericValue'],lcpElement=node.get('nodeLabel'),lcpSelector=node.get('selector'),lcpParts=parts,observedFCP=m['observedFirstContentfulPaint'],observedLCP=m['observedLargestContentfulPaint'],observedSI=m['observedSpeedIndex'],warnings=x.get('runWarnings'),fetchTime=x['fetchTime'],throttling=x['configSettings']['throttling'])
 row['lighthouseVersion']=x['lighthouseVersion']; row['hostUserAgent']=x['environment']['hostUserAgent']; row['fontBytes']=sum(i['transferSize'] for i in r if i.get('resourceType')=='Font'); row['fonts']=[dict(url=i['url'],bytes=i['transferSize']) for i in r if i.get('resourceType')=='Font']; row['cpuScripts']=a['bootup-time']['details'].get('items',[]); row['cpuBreakdown']={i['group']:i['duration'] for i in a['mainthread-work-breakdown']['details']['items']};rows.append(row)
metrics=['fontBytes','score','fcp','lcp','tbt','cls','speedIndex','totalBytes','requests','documentBytes','pageCssBytes','heroImageBytes','dom','mainThread','observedFCP','observedLCP','observedSI']
groups={}
for mode in ['mobile','desktop']:
 for kind in ['images','html']:
  rs=[r for r in rows if r['mode']==mode and r['kind']==kind]
  if not rs:continue
  groups[mode+'-'+kind]={'count':len(rs),'median':{k:statistics.median(r[k] for r in rs) for k in metrics},'range':{k:[min(r[k] for r in rs),max(r[k] for r in rs)] for k in metrics},'cpuMedian':{k:statistics.median(r['cpuBreakdown'][k] for r in rs) for k in rs[0]['cpuBreakdown']}}
result={'tool':'Lighthouse 13.5.0','date':'2026-10-20','browser':'Official Chrome for Testing 155.0.8059.84','reducedMotion':True,'runs':rows,'groups':groups}
Path('/private/tmp/stitch-hero-comparison/summary.json').write_text(json.dumps(result,indent=2))
for k,v in groups.items(): print(k,json.dumps(v))
