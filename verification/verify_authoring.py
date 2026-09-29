"""Exercise authoring CLIs in synthetic, isolated workspaces; never publish content."""
from pathlib import Path
import copy, hashlib, json, os, shutil, subprocess

ROOT = Path(__file__).resolve().parents[1]
OUT = Path(os.environ.get('IPSKILL_AUTHORING_OUTPUT', ROOT/'verification-authoring')).resolve()
OUT.mkdir(parents=True, exist_ok=False)
TRACKS = ['sql','typescript','node','react','csharp','dotnet']
checks = []

def write(path, value):
    path.parent.mkdir(parents=True, exist_ok=True)
    path.write_text(json.dumps(value), encoding='utf-8')

def workspace(name):
    root = OUT/name
    for rel in ['scripts/merge-content.mjs','scripts/validate-content.mjs','content-src/vol3/assemble.mjs']:
        target=root/rel
        target.parent.mkdir(parents=True,exist_ok=True)
        shutil.copy2(ROOT/rel,target)
    metas=[]
    for track in TRACKS:
        write(root/f'public/content/{track}.json',{'id':track,'lessons':[]})
        metas.append({'id':track,'lessonCount':0,'exerciseCount':0,'coreCount':0})
    write(root/'public/content/index.json',{'tracks':metas,'lessonCount':0,'exerciseCount':0})
    write(root/'public/content/resources.json',{'resources':[{'id':str(i),'markdown':'Synthetic manual'} for i in range(4)]})
    return root

def lesson():
    return {'slug':'practice','title':'Practice','summary':'Summary','briefing':'Briefing',
            'explanation':'Explanation','fullReadme':'Readme','fullReading':'Reading',
            'exercises':[{'id':'ex1','title':'First task','kind':'core','xp':100,
                          'prompt':'Write a query','hints':'Try a filter','importantHints':'Check rows',
                          'references':{'answer.sql':'SELECT 1;'}}]}

def fingerprints(root):
    return {p.name:hashlib.sha256(p.read_bytes()).hexdigest() for p in (root/'public/content').glob('*.json')}

def command(root, script, *args, success=True):
    result=subprocess.run(['node',script,*args],cwd=root,capture_output=True,text=True,encoding='utf-8',timeout=180)
    with (OUT/'commands.log').open('a',encoding='utf-8') as log:
        log.write(json.dumps({'workspace':root.name,'script':script,'args':args,'exitCode':result.returncode})+'\n'+result.stdout+result.stderr+'\n')
    assert (result.returncode==0)==success, result.stdout+result.stderr

def check(name, fn):
    try:
        fn()
        checks.append({'name':name,'passed':True})
    except Exception as error:
        checks.append({'name':name,'passed':False,'error':str(error)})
        raise
    finally:
        (OUT/'results.json').write_text(json.dumps({'passed':len(checks)==7 and all(c['passed'] for c in checks),'total':len(checks),'checks':checks},indent=2),encoding='utf-8')

def candidate_success():
    root=workspace('candidate-success'); before=fingerprints(root)
    write(root/'content-src/new/lesson.json',{'track':'sql','lessons':[lesson()]})
    command(root,'scripts/merge-content.mjs','new','review')
    command(root,'scripts/validate-content.mjs','review')
    assert fingerprints(root)==before
    candidate=root/'content-candidates/review'
    assert json.loads((candidate/'index.json').read_text())['exerciseCount']==1
    assert json.loads((candidate/'catalog.json').read_text())==[{'id':'sql/practice/ex1','track':'sql','lesson':'sql/practice','kind':'core','xp':100}]
check('candidate contains consistent packs index catalog and leaves published bytes unchanged',candidate_success)

def no_overwrite():
    root=OUT/'candidate-success'; path=root/'content-candidates/review/catalog.json'; before=path.read_bytes()
    command(root,'scripts/merge-content.mjs','new','review',success=False)
    assert path.read_bytes()==before
check('existing candidate is refused without replacing its files',no_overwrite)

def reject_volume(name, lessons):
    root=workspace(name); before=fingerprints(root)
    write(root/'content-src/new/lesson.json',{'track':'sql','lessons':lessons})
    command(root,'scripts/merge-content.mjs','new','review',success=False)
    assert fingerprints(root)==before and not (root/'content-candidates/review').exists()

def incomplete():
    item=lesson();item['exercises'][0]['hints']=''
    reject_volume('incomplete',[item])
check('incomplete mission rejects the whole candidate without publishing',incomplete)
check('duplicate lesson rejects the whole candidate without publishing',lambda:reject_volume('duplicate',[lesson(),lesson()]))

def traversal():
    root=workspace('traversal');before=fingerprints(root)
    command(root,'scripts/merge-content.mjs','../outside','review',success=False)
    command(root,'scripts/merge-content.mjs','new','../outside',success=False)
    command(root,'scripts/validate-content.mjs','../outside',success=False)
    assert fingerprints(root)==before and not (root/'content-candidates').exists()
check('authoring names reject path traversal before candidate writes',traversal)

def assembler_fixture(name):
    root=workspace(name); parts=root/'content-src/vol3/parts/01'
    write(parts/'meta.json',{'slug':'fixture','title':'Fixture'})
    for file in ['summary.txt','briefing.md','explanation.md','readme.md','reading.md']:
        (parts/file).write_text('Synthetic teaching text',encoding='utf-8')
    for file in [*[f'ex{i}.md' for i in range(1,9)],'challenge.md','review1.md']:
        (parts/file).write_text('@@PROMPT@@\nTask\n@@HINTS@@\nHint\n@@IMPORTANT@@\nBoundary\n@@REF@@\nreturn 1;\n',encoding='utf-8')
    return root,parts

def assembler_success():
    root,parts=assembler_fixture('assemble-success')
    command(root,'content-src/vol3/assemble.mjs','review')
    path=root/'content-src/vol3/review.json'; before=path.read_bytes()
    assert len(json.loads(before)['lessons'][0]['exercises'])==10
    command(root,'content-src/vol3/assemble.mjs','review',success=False)
    assert path.read_bytes()==before
check('assembler creates ten missions and refuses an existing output',assembler_success)

def assembler_duplicate():
    root,parts=assembler_fixture('assemble-duplicate')
    file=parts/'ex1.md';file.write_text(file.read_text()+'@@PROMPT@@\nAmbiguous second task\n',encoding='utf-8')
    command(root,'content-src/vol3/assemble.mjs','review',success=False)
    assert not (root/'content-src/vol3/review.json').exists()
check('duplicate authoring section rejects before output creation',assembler_duplicate)
print(json.dumps({'passed':True,'total':len(checks)}))
