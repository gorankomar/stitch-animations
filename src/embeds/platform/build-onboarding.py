"""Construction payloads for the native Webflow onboarding draft; not a replay source."""
import json, re
from pathlib import Path
P=Path(__file__).parent
S={}
def q(n): return f'{n/14.4:.8f}cqi'
def css(name, **props):
    S[name]={k.replace('_','-'):str(v) for k,v in props.items()}
def svg(name,cls):
    v=(P/'assets/originals'/f'onboarding-{name}.svg').read_text()
    v=re.sub(r' style="[^"]*"','',v)
    v=v.replace('<svg ',f'<svg class="{cls}" aria-hidden="true" ',1)
    ids=re.findall(r'\bid="([^"]+)"',v)
    for i,old in enumerate(ids):
        new=f'onboarding-{name}-{i}'
        v=v.replace(f'id="{old}"',f'id="{new}"').replace(f'#{old}"',f'#{new}"').replace(f'#{old})',f'#{new})')
    return v
css('platform-controls-sidebar',width='100%',height='100%',background_color='#fcfcfc',border_right=f'{q(1)} solid #e7e7e7',padding=f'0 {q(16)}',overflow='clip')
css('platform-controls-back',height=q(56),display='flex',align_items='center',padding_left=q(12))
css('platform-controls-title-row',display='flex',align_items='center',justify_content='space-between',padding=f'{q(3)} {q(8)}',margin_bottom=q(2))
css('platform-controls-title',font_size=q(14),line_height=q(20),font_weight='500',color='#6d6d6d',margin='0')
css('platform-controls-groups',display='flex',flex_direction='column',gap=q(16))
css('platform-sidebar-group',width='100%')
css('platform-sidebar-group-title',width='100%')
css('platform-sidebar-group-items',display='flex',flex_direction='column',gap=q(2),margin_left=q(16),padding_left=q(8),border_left=f'{q(1)} solid #d1d1d1')
css('platform-sidebar-subitem',width='100%',padding=f'{q(6)} {q(8)}',font_size=q(14),line_height=q(20),font_weight='500',color='#454545')
css('platform-sidebar-subitem-label',margin='0')
css('platform-flow-card',width=q(280),height=q(84),position='relative',display='flex',flex_direction='column',padding=q(6),background_color='#f9f9f9',border=f'{q(1)} solid #e7e7e7',border_radius=q(12),color='#121212',font_size=q(14),line_height=q(20))
css('platform-flow-card-header',display='flex',align_items='center',gap=q(8),padding=q(8),height=q(36),flex_shrink='0')
css('platform-flow-card-title',margin='0',font_size=q(14),line_height=q(20),font_weight='500',flex_grow='1')
css('platform-flow-card-phase',display='flex',gap=q(4),align_items='flex-start',background_color='#fff',padding=q(8),flex_grow='1')
css('platform-flow-phase-label',font_weight='500',color='#3d3d3d',margin='0')
css('platform-flow-phase-value',font_weight='400',color='#5d5d5d',margin='0')
css('platform-onboarding-icon',width=q(16),height=q(16),display='flex',align_items='center',justify_content='center',flex_shrink='0')
css('platform-onboarding-chevron',width=q(20),height=q(20),display='flex',align_items='center',justify_content='center')
css('platform-flow-card-incoming',position='absolute',left=q(-7),top=q(34),display='flex',flex_direction='column',gap=q(4))
css('platform-flow-card-outgoing',position='absolute',right=q(-7),top=q(34),display='flex',flex_direction='column',gap=q(4))
css('platform-flow-arrow',width=q(12),height=q(51),display='flex',align_items='center',justify_content='center')
css('platform-flow-arrow-vector',width=q(8),height=q(51),display='block')
css('platform-flow-event',width=q(13.2),height=q(17.2),display='flex',align_items='center',justify_content='center',padding=q(1),background_color='#888',border_radius=q(3))
css('platform-flow-event-outline',width=q(11.2),height=q(15.2),border=f'{q(1.4)} solid #fff',border_radius=q(2),padding=q(1.6),background_color='#888')
css('platform-flow-event-core',width='100%',height='100%',background_color='#888',border_radius=q(1))
css('platform-flow-endpoint',display='flex',align_items='center',justify_content='center',width='max-content',height=q(36),padding=f'{q(8)} {q(24)}',background_color='#f9f9f9',border=f'{q(1)} solid #d1d1d1',border_radius=q(100),font_size=q(14),line_height=q(20),font_weight='500',color='#121212')
css('platform-flow-endpoint-label',margin='0')
css('platform-flow-branch',width=q(444),height=q(131),position='relative')
css('platform-flow-branch-stem',position='absolute',left=q(220),top='0',width=q(4),height=q(22),display='block')
css('platform-flow-branch-diamond',position='absolute',left=q(193.5472),top=q(21.7144),width=q(56.9056),height=q(38.566),display='block')
css('platform-flow-branch-left',position='absolute',left='0',top=q(60),width=q(222.7),height=q(71),display='block')
css('platform-flow-branch-right',position='absolute',right='0',top=q(60),width=q(222.7),height=q(71),display='block',transform='scaleX(-1)')
css('platform-flow-branch-icon',position='absolute',left=q(214),top=q(32),width=q(16),height=q(16))
css('platform-onboarding-flow',position='relative',width=q(716.2),height=q(1534),flex_shrink='0')
css('platform-onboarding-content',width='100%',height='100%',padding=f'{q(16)} {q(24)}',background_color='#fff',display='flex',flex_direction='column',gap=q(16),color='#121212')
css('platform-onboarding-breadcrumbs',display='flex',align_items='center',gap=q(8),font_size=q(14),line_height=q(20),color='#5d5d5d',height=q(20))
css('platform-onboarding-crumb',margin='0')
css('platform-onboarding-header',display='flex',align_items='center',gap=q(8),padding_top=q(12),height=q(50),flex_shrink='0')
css('platform-onboarding-title',font_size=q(20),line_height=q(30),font_weight='600',margin='0',flex_grow='1')
css('platform-onboarding-edit',background_color='#121212',color='#fff',padding=f'{q(6)} {q(12)}',border=f'{q(1)} solid #121212',border_radius=q(8),font_size=q(14),line_height=q(20),font_weight='500',margin='0')
css('platform-onboarding-menu',padding=q(8),background_color='#fff',border=f'{q(1)} solid #d1d1d1',border_radius=q(8))
css('platform-onboarding-canvas',width='100%',min_height='0',flex_grow='1',position='relative',overflow='clip',background_color='#f9f9f9',border=f'{q(1)} solid #efefef')
css('platform-onboarding-flow-position',position='absolute',left=f'calc(50% - {q(358.1)})',top=q(31))
css('platform-onboarding-maximize',position='absolute',right=q(15),top=q(15),width=q(32),height=q(32),padding=q(8),background_color='#fff',border=f'{q(1)} solid #efefef',border_radius=q(8),z_index='2')
parts={
'sidebar':{'root':'platform-controls-sidebar','html':'<div class="platform-controls-back"><div class="platform-onboarding-icon" data-icon="back"></div></div><div class="platform-controls-title-row"><p class="platform-controls-title">Controls</p><div class="platform-onboarding-chevron" data-icon="chevron"></div></div>'},
'group':{'root':'platform-sidebar-group','html':''},
'subitem':{'root':'platform-sidebar-subitem','html':'<p class="platform-sidebar-subitem-label">General</p>'},
'card':{'root':'platform-flow-card','html':'<div class="platform-flow-card-header"><div class="platform-onboarding-icon" data-icon="file"></div><p class="platform-flow-card-title">Application</p><div class="platform-onboarding-icon" data-icon="menu"></div></div><div class="platform-flow-card-phase platform-radius-8"><p class="platform-flow-phase-label">Phase:</p><p class="platform-flow-phase-value">Applicant information</p></div>'},
'arrow':{'root':'platform-flow-arrow','html':svg('imgGroup1707482223','platform-flow-arrow-vector')},
'event':{'root':'platform-flow-event','html':'<div class="platform-flow-event-outline"><div class="platform-flow-event-core"><span aria-hidden="true">&#8203;</span></div></div>'},
'endpoint':{'root':'platform-flow-endpoint','html':'<p class="platform-flow-endpoint-label">Start</p>'},
'branch':{'root':'platform-flow-branch','html':svg('imgGroup1707482224','platform-flow-branch-stem')+svg('imgPolygon2','platform-flow-branch-diamond')+svg('imgGroup1707482240','platform-flow-branch-left')+svg('imgGroup1707482241','platform-flow-branch-right')+'<div class="platform-flow-branch-icon" data-icon="dataflow"></div>'},
'flow':{'root':'platform-onboarding-flow','html':''},
'content':{'root':'platform-onboarding-content','html':'<nav class="platform-onboarding-breadcrumbs"><p class="platform-onboarding-crumb">Services</p><div class="platform-onboarding-icon" data-icon="slash"></div><p class="platform-onboarding-crumb">...</p><div class="platform-onboarding-icon" data-icon="slash"></div><p class="platform-onboarding-crumb">Workflow</p><div class="platform-onboarding-icon" data-icon="slash"></div></nav><div class="platform-onboarding-header"><p class="platform-onboarding-title">Onboarding customer</p><p class="platform-onboarding-edit">Edit</p><div class="platform-onboarding-menu"><div class="platform-onboarding-icon" data-icon="dots"></div></div></div><div class="platform-onboarding-canvas platform-radius-4"><div class="platform-onboarding-maximize"><div class="platform-onboarding-icon" data-icon="maximize"></div></div><div class="platform-onboarding-flow-position"></div></div>'}
}
# Each placement is a necessary independent positioning / future-motion boundary.
placements=[]
def place(name,x,y,kind,title=None,phase=None,tall=False,ports=0,incoming=False):
    cls='platform-onboarding-'+name
    css(cls,position='absolute',left=q(x),top=q(y))
    parts['flow']['html']+=f'<div class="{cls}"></div>'
    placements.append(dict(cls=cls,kind=kind,title=title,phase=phase,tall=tall,ports=ports,incoming=incoming))
place('start',315,0,'endpoint','Start')
for i,y in enumerate([40,183,326]): place(f'upper-arrow-{i}',350,y,'arrow')
for i,(t,p) in enumerate([('Application','Applicant information'),('Reports','Customer reports'),('Integration','Customer create')]):
    place(f'upper-card-{i}',216,95+i*143,'card',t,p,ports=2 if i==2 else 1,incoming=i==1)
place('decision',134,469,'branch')
place('archive-left',0,604,'card','Archive application','---')
place('archive-left-arrow',134,692,'arrow')
place('end-left',103,747,'endpoint','End')
for i,(t,p) in enumerate([('Archive application','Tahaquq'),('Yakeen','Yakeen'),('AML','Mozn AML'),('External phase','Raya User Creation'),('Customer creation','Customer creation'),('Archive application','Customer onboarded')]):
    y=604 if i==0 else 604+179+(i-1)*143
    place(f'right-card-{i}',429.5 if i==0 else 431.1 if i==5 else 428,y,'card',t,p,tall=i==0,ports=5 if i==0 else 0 if i==5 else 1)
    place(f'right-arrow-{i}',565.1,y+(124 if i==0 else 88),'arrow')
place('end-right',534.1,1498,'endpoint','End')
out={'parts':parts,'styles':S,'placements':placements}
(P/'onboarding-construction.json').write_text(json.dumps(out))
print(len(S),'native styles;',len(placements),'flow placements')
