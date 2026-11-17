"""Build the client review pack from canonical subtitle cues (no dependencies)."""
import html, json, pathlib, shutil, zipfile
base=pathlib.Path(__file__).resolve().parents[1]
source=base/'src/embeds/real-ai-film/subtitles'
out=base/'deliverables/real-ai-subtitle-review'
out.mkdir(parents=True,exist_ok=True)
cues=json.loads((source/'cues.json').read_text())
labels={'en':'English','ar':'العربية — Arabic','vi':'Tiếng Việt — Vietnamese','id':'Bahasa Indonesia — Indonesian'}
def stamp(t):
 m=round(t*1000);return f'{m//60000:02}:{m//1000%60:02}.{m%1000:03}'
def reference(c):
 if c['en']:return c['en']
 return {76.62:'Anyone can be a hero with Stitch AI.',80.14:'Real AI for real banking.'}.get(c['start'],'On-screen title')+' [Already on screen; omitted from English subtitles.]'
for lang,label in labels.items():
 (out/f'{lang}.txt').write_text(f'Stitch AI — {label}\nDRAFT FOR CLIENT REVIEW — 17 November 2026\n\n'+'\n\n'.join(f'{i:02} | {stamp(c["start"])} – {stamp(c["end"])}\n{c[lang]}' for i,c in enumerate(cues,1) if c[lang])+'\n',encoding='utf-8')
 shutil.copy2(source/f'{lang}.vtt',out/f'{lang}.vtt')
sections=[]
for lang,label in labels.items():
 rows=''.join(f'<tr><th scope="row">{i:02}<small>{stamp(c["start"])}–{stamp(c["end"])}</small></th><td lang="en">{html.escape(reference(c))}</td><td lang="{lang}" dir="{"rtl" if lang=="ar" else "ltr"}">{html.escape(c[lang] or "Intentionally omitted: already displayed in the video.")}</td></tr>' for i,c in enumerate(cues,1))
 sections.append(f'<section id="{lang}"><h2>{label}</h2><table><thead><tr><th>Cue / time</th><th>English reference</th><th>Subtitle text</th></tr></thead><tbody>{rows}</tbody></table></section>')
(out/'review.html').write_text('''<!doctype html><html lang="en"><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Stitch AI — Subtitle review</title><style>body{font:16px/1.6 system-ui,sans-serif;color:#191919;max-width:1100px;margin:40px auto;padding:0 20px}h1{line-height:1.2}nav{display:flex;flex-wrap:wrap;gap:24px;margin:24px 0}a{color:#a52d0d}section{margin:48px 0}table{width:100%;border-collapse:collapse;table-layout:fixed}td,th{vertical-align:top;border:1px solid #ddd;padding:12px;text-align:start;white-space:pre-line;overflow-wrap:anywhere}th:first-child{width:135px}td[lang=ar]{font-size:21px;line-height:1.8}small{display:block;font-size:12px;font-weight:400;margin-top:6px}.note{background:#f5f5f5;border-radius:8px;padding:16px}@media(max-width:600px){td,th{padding:6px;font-size:13px}th:first-child{width:68px}td[lang=ar]{font-size:17px}}@media print{nav{display:none}section{break-before:page}tr{break-inside:avoid}thead{display:table-header-group}}</style><h1>Stitch AI — Subtitle review</h1><p>Draft for client review · 17 November 2026</p><div class="note">Please check meaning, natural phrasing, spelling, punctuation and terminology. Song lyrics (♪) are included. Reply with the language, cue number and preferred replacement. The two closing titles are omitted only from English subtitles because they are already on screen; translations retain them. Arabic is displayed right to left. These are AI transcription/translation drafts and have not received native-speaker approval.</div><nav>'''+''.join(f'<a href="#{lang}">{label}</a>' for lang,label in labels.items())+'</nav>'+''.join(sections)+'</html>',encoding='utf-8')
(out/'READ-ME.txt').write_text('Open review.html in a web browser for timed English/translation comparisons.\nArabic is right to left. Each language also has a readable UTF-8 .txt transcript and playback-ready .vtt subtitle file.\nDrafts for client review: please return the language, cue number and corrected text.\nThe English reference includes the two visible closing titles solely to help translators review them; the English subtitle track intentionally omits them.\n',encoding='utf-8')
archive=out.parent/'stitch-ai-subtitle-review.zip'
with zipfile.ZipFile(archive,'w',zipfile.ZIP_DEFLATED) as z:
 for p in sorted(out.iterdir()):z.write(p,arcname='Stitch AI Subtitle Review/'+p.name)
print(archive)
