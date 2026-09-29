"""Verify the built IPSKILL app with disposable browser data and an owned loopback server."""
from pathlib import Path
import json, os, socket, subprocess, time, urllib.request
from playwright.sync_api import sync_playwright, expect

expect.set_options(timeout=30000)

ROOT = Path(__file__).resolve().parents[1]
OUT = Path(os.environ.get('IPSKILL_BROWSER_OUTPUT', ROOT / 'verification-output')).resolve()
PORT = int(os.environ.get('IPSKILL_BROWSER_PORT', '5587'))
URL = f'http://127.0.0.1:{PORT}'
OUT.mkdir(parents=True, exist_ok=True)
if any(OUT.iterdir()):
    raise SystemExit('Use a new empty output directory; previous evidence is preserved.')
with socket.socket() as probe:
    if probe.connect_ex(('127.0.0.1', PORT)) == 0:
        raise SystemExit('Verification port is occupied; no existing server is reused.')
(OUT / 'images').mkdir()
checks, errors = [], []
page = None

def record(name, fn):
    started = time.time()
    try:
        fn()
        checks.append({'name': name, 'passed': True, 'seconds': round(time.time()-started, 3)})
        print('PASS', name, flush=True)
    except Exception as error:
        checks.append({'name': name, 'passed': False, 'error': str(error)})
        if page and not page.is_closed():
            page.screenshot(path=str(OUT / 'failure.png'), full_page=True)
            (OUT / 'failure.html').write_text(page.content(), encoding='utf-8')
        raise

def state(target):
    return target.evaluate('''() => new Promise((resolve,reject)=>{
      const r=indexedDB.open('ipskill-workspace-v2',1);
      r.onsuccess=()=>{const db=r.result,tx=db.transaction('workspace','readonly'),q=tx.objectStore('workspace').get('current');let value=null;q.onsuccess=()=>value=q.result??null;tx.oncomplete=()=>{db.close();resolve(value)};tx.onabort=()=>reject(tx.error)};r.onerror=()=>reject(r.error);
    })''')

def snapshots(target):
    return target.evaluate('''() => new Promise((resolve,reject)=>{const r=indexedDB.open('ipskill-workspace-v2',1);r.onsuccess=()=>{const db=r.result,tx=db.transaction('backups','readonly'),q=tx.objectStore('backups').getAll();let value;q.onsuccess=()=>value=q.result;tx.oncomplete=()=>{db.close();resolve(value)};tx.onabort=()=>reject(tx.error)}})''')

def seed(target, value):
    target.evaluate('''value => new Promise((resolve,reject)=>{const r=indexedDB.open('ipskill-workspace-v2',1);r.onsuccess=()=>{const db=r.result,tx=db.transaction('workspace','readwrite');tx.objectStore('workspace').put(value,'current');tx.oncomplete=()=>{db.close();resolve(true)};tx.onabort=()=>reject(tx.error)}})''', value)

def nav(name, target=None):
    target = target or page
    target.bring_to_front()
    target.locator('nav').get_by_role('button', name=name, exact=True).click()

def save(target=None):
    target = target or page
    expect(target.locator('.workspace-toolbar').first).to_contain_text('Unsaved changes')
    target.get_by_role('button', name='Save workspace', exact=True).click()
    expect(target.locator('.workspace-toolbar').first).to_contain_text('Accepted locally', timeout=60000)
    expect(target.get_by_role('status')).to_contain_text('Saved locally at revision', timeout=60000)
    expect(target.get_by_role('button', name='Save workspace', exact=True)).to_be_disabled()

def shot(name):
    page.bring_to_front()
    page.evaluate('window.scrollTo({top: 0, behavior: "instant"})')
    page.evaluate('() => new Promise(resolve => requestAnimationFrame(() => requestAnimationFrame(resolve)))')
    if name.startswith('06-practice-form-'):
        # Focus this evidence on the responsive form, not ten unrelated cards below it.
        page.locator('form.practice-form').screenshot(path=str(OUT / 'images' / name))
    else:
        page.screenshot(path=str(OUT / 'images' / name), full_page=True)
    assert page.evaluate('document.documentElement.scrollWidth <= innerWidth + 1'), 'Horizontal overflow'

log = (OUT / 'server.log').open('wb')
server = subprocess.Popen(['node', 'node_modules/vite/bin/vite.js', 'preview', '--host', '127.0.0.1', '--port', str(PORT), '--strictPort'], cwd=ROOT, stdout=log, stderr=subprocess.STDOUT, creationflags=getattr(subprocess, 'CREATE_NO_WINDOW', 0))
fatal = None
try:
    deadline = time.time()+300
    while True:
        if server.poll() is not None:
            raise RuntimeError('Owned preview server exited before readiness.')
        try:
            with urllib.request.urlopen(URL, timeout=3) as response:
                if response.status == 200:
                    break
        except Exception:
            if time.time() >= deadline:
                raise
            time.sleep(1)
    with sync_playwright() as p:
        browser = p.chromium.launch(executable_path=os.environ.get('ASTRA_BROWSER_EXECUTABLE'), headless=True, args=['--disable-dev-shm-usage'])
        context = browser.new_context(viewport={'width': 1440, 'height': 1000}, accept_downloads=True)
        page = context.new_page()
        page.set_default_timeout(60000)
        page.on('pageerror', lambda e: errors.append(str(e)))
        page.goto(URL)

        def empty():
            expect(page.get_by_role('heading', name='Start your local learning workspace')).to_be_visible()
            assert state(page) is None
            assert page.evaluate("localStorage.getItem('ipskill.save.v1')") is None
        record('Opening the application does not invent progress or create an accepted workspace', empty)

        def initialize():
            page.get_by_role('button', name='Create empty local workspace').click()
            expect(page.get_by_text('Build your edge.', exact=False)).to_be_visible(timeout=120000)
            assert state(page)['revision'] == 0
            nav('Save data')
            page.get_by_label('Operative name', exact=True).fill('Browser learner')
            assert state(page)['save']['playerName'] == 'Rookie'
            save()
            assert state(page)['save']['playerName'] == 'Browser learner'
        record('Explicit initialization and saving distinguish draft input from accepted data', initialize)

        def rejection():
            nav('CRUD practice')
            page.get_by_role('button', name='New practice project', exact=True).click()
            page.get_by_label('Project title', exact=True).fill('Contact book')
            page.get_by_label('Observable goal', exact=True).fill('Create, edit and delete contacts while preserving rejected duplicate-email drafts.')
            page.get_by_label('Project status', exact=True).select_option('complete')
            page.get_by_role('button', name='Apply project to workspace draft').click()
            expect(page.get_by_role('alert')).to_contain_text('Completion evidence')
            expect(page.get_by_label('Project title', exact=True)).to_have_value('Contact book')
            assert state(page)['projects'] == []
            shot('01-rejected-practice-form.png')
        record('Invalid completion evidence retains the practice form and leaves accepted storage unchanged', rejection)

        def create():
            page.get_by_label('Implementation and test evidence', exact=True).fill('Changed contact validation and form handling. Ran duplicate-email, valid rename and deletion checks; rejected drafts retained their original input. Pagination remains a follow-up.')
            page.get_by_role('button', name='Apply project to workspace draft').click()
            expect(page.get_by_label('Project title', exact=True)).to_have_count(0)
            assert state(page)['projects'] == []
            save()
            assert state(page)['projects'][0]['version'] == 1
            page.reload()
            nav('CRUD practice')
            expect(page.get_by_role('heading', name='Contact book', exact=True)).to_be_visible(timeout=120000)
            shot('02-practice-project.png')
        record('A valid practice project is persisted only after the workspace save and survives reload', create)

        def edit():
            page.get_by_role('button', name='Edit Contact book', exact=True).click()
            page.get_by_label('Project title', exact=True).fill('Contact book reviewed')
            nav('Command')
            expect(page.get_by_role('alert')).to_contain_text('Apply or cancel')
            expect(page.get_by_label('Project title', exact=True)).to_have_value('Contact book reviewed')
            page.get_by_role('button', name='Apply project to workspace draft').click()
            save()
            assert state(page)['projects'][0]['version'] == 2
        record('Project editing increments its version and navigation guards retain an unfinished form', edit)

        def filter_pages():
            value = state(page)
            fixture = value['projects'][0]
            import uuid
            for i in range(13):
                value['projects'].append({**fixture, 'id': str(uuid.uuid4()), 'title': f'Issue fixture {i:02}', 'status': 'planned'})
            value['revision'] += 1
            seed(page, value)
            page.reload()
            nav('CRUD practice')
            page.get_by_label('Search practice projects', exact=True).fill('Issue fixture')
            expect(page.get_by_text('13 projects · page 1 of 2', exact=True)).to_be_visible()
            page.get_by_role('button', name='Next projects', exact=True).click()
            expect(page.locator('.practice-list article')).to_have_count(3)
            page.get_by_label('Filter project status', exact=True).select_option('complete')
            expect(page.locator('.practice-list article')).to_have_count(0)
            page.get_by_label('Search practice projects', exact=True).fill('Contact')
            expect(page.locator('.practice-list article')).to_have_count(1)
            shot('03-filtered-projects.png')
        record('Search and status filtering paginate the actual project set', filter_pages)

        def deletion():
            page.once('dialog', lambda d: d.accept())
            page.get_by_role('button', name='Delete Contact book reviewed', exact=True).click()
            assert len(state(page)['projects']) == 14
            save()
            assert len(state(page)['projects']) == 13
            assert all(p['title'] != 'Contact book reviewed' for p in state(page)['projects'])
        record('Confirmed deletion removes only the chosen project after saving the workspace', deletion)

        def archive():
            nav('Knowledge vault')
            expect(page.locator('.manual-strip button')).to_have_count(4)
            page.get_by_label('Filter archive', exact=True).fill('no-such-lesson-xyz')
            expect(page.get_by_text('No lessons match.', exact=True)).to_be_visible()
            page.get_by_label('Filter archive', exact=True).fill('')
            expect(page.get_by_role('button', name='Next lessons', exact=True)).to_be_enabled()
            locked = page.locator('.archive-missions button:disabled')
            assert locked.count() > 0
        record('Archive filtering works while later practice missions remain gated', archive)

        def mission():
            nav('Command')
            page.get_by_role('button', name='Continue mission', exact=False).click()
            expect(page.get_by_text('This is written practice and self-review.', exact=False)).to_be_visible()
            page.get_by_label('Mission workspace', exact=True).fill('Ran SELECT 1 AS answer in a SQL workspace; observed one row with the expected value and explained the column alias.')
            page.get_by_role('button', name='Compare with reference', exact=True).click()
            page.get_by_role('button', name='Record self-reviewed completion', exact=False).click()
            save()
            first = state(page)
            assert len(first['save']['completed']) == 1
            page.get_by_role('button', name='Compare with reference', exact=True).click()
            page.get_by_role('button', name='Record successful recall', exact=False).click()
            save()
            assert state(page)['save']['earnedXp'] == first['save']['earnedXp']
            shot('04-self-review-workspace.png')
        record('Written self-review records progress while repeat completion awards no duplicate XP', mission)

        other = context.new_page()
        other.set_default_timeout(60000)
        def conflict():
            other.goto(URL)
            other.bring_to_front()
            nav('Save data', other)
            other.get_by_label('Operative name', exact=True).fill('Retained second tab')
            page.bring_to_front()
            nav('Save data')
            page.get_by_label('Operative name', exact=True).fill('First tab winner')
            save()
            other.bring_to_front()
            other.get_by_role('button', name='Save workspace', exact=True).click()
            expect(other.get_by_role('alert')).to_contain_text('Another tab saved')
            expect(other.get_by_label('Operative name', exact=True)).to_have_value('Retained second tab')
            assert state(other)['save']['playerName'] == 'First tab winner'
            with other.expect_download() as event:
                other.get_by_role('button', name='Export workspace draft', exact=True).click()
            export = OUT / 'conflicting-draft.json'; event.value.save_as(str(export))
            assert json.loads(export.read_text())['save']['playerName'] == 'Retained second tab'
            other.once('dialog', lambda d: d.accept())
            other.get_by_role('button', name='Load current data', exact=True).click()
            expect(other.get_by_label('Operative name', exact=True)).to_have_value('First tab winner')
            page.bring_to_front()
        record('Two-tab conflict retains and exports the losing draft before explicit current-data recovery', conflict)

        def aborted():
            before = state(page)
            page.get_by_label('Operative name', exact=True).fill('Abort candidate')
            page.evaluate('''() => {const original=IDBObjectStore.prototype.put;IDBObjectStore.prototype.put=function(...args){const r=original.apply(this,args);if(this.name==='workspace'){IDBObjectStore.prototype.put=original;r.addEventListener('success',()=>this.transaction.abort())}return r}}''')
            page.get_by_role('button', name='Save workspace', exact=True).click()
            expect(page.get_by_role('alert')).to_be_visible()
            expect(page.get_by_label('Operative name', exact=True)).to_have_value('Abort candidate')
            assert state(page) == before
            page.once('dialog', lambda d: d.accept())
            page.get_by_role('button', name='Load current data', exact=True).click()
            expect(page.get_by_label('Operative name', exact=True)).to_have_value(before['save']['playerName'])
        record('A real transaction abort after put success preserves accepted data and the draft', aborted)

        def bad_import():
            before = state(page)
            page.get_by_label('Choose workspace import', exact=True).set_input_files({'name':'bad.json','mimeType':'application/json','buffer':b'{"version":1,"playerName":42}'})
            expect(page.get_by_role('alert')).to_be_visible()
            expect(page.get_by_role('button', name='Apply reviewed import', exact=True)).to_have_count(0)
            assert state(page) == before
        record('Malformed imports are rejected without replacing the accepted workspace', bad_import)

        def replacement():
            before = state(page)
            imported = json.loads(json.dumps(before)); imported['save']['playerName'] = 'Reviewed import'
            page.get_by_label('Choose workspace import', exact=True).set_input_files({'name':'reviewed.json','mimeType':'application/json','buffer':json.dumps(imported).encode()})
            assert state(page) == before
            page.once('dialog', lambda d: d.accept())
            page.get_by_role('button', name='Apply reviewed import', exact=True).click()
            expect(page.get_by_role('status')).to_contain_text('Reviewed import accepted')
            assert state(page)['id'] != before['id']
            assert json.loads(snapshots(page)[0]['raw']) == before
            other.bring_to_front()
            other.get_by_label('Operative name', exact=True).fill('Obsolete identity')
            other.get_by_role('button', name='Save workspace', exact=True).click()
            expect(other.get_by_role('alert')).to_contain_text('Another tab saved or replaced')
            assert state(other)['save']['playerName'] == 'Reviewed import'
            other.close()
            page.bring_to_front()
            shot('05-reviewed-import.png')
        record('Reviewed replacement snapshots accepted data and rejects an obsolete workspace identity', replacement)

        def backup_export():
            with page.expect_download() as event:
                page.get_by_role('button', name='Download recovery snapshot', exact=True).click()
            path = OUT / 'snapshot.json';event.value.save_as(str(path))
            assert path.read_text() == snapshots(page)[0]['raw']
        record('Recovery snapshot download preserves the stored recovery document', backup_export)

        def layouts():
            nav('CRUD practice')
            page.get_by_role('button', name='New practice project', exact=True).click()
            for width in [1440,800,390]:
                page.set_viewport_size({'width':width,'height':1000})
                expect(page.get_by_label('Project title', exact=True)).to_be_visible()
                shot(f'06-practice-form-{width}.png')
            page.set_viewport_size({'width':1440,'height':1000})
            page.once('dialog', lambda d: d.accept())
            page.get_by_role('button', name='Cancel practice form', exact=True).click()
        record('Practice forms remain usable at desktop, tablet and phone widths', layouts)

        legacy = {'version':1,'playerName':'Legacy learner','completed':{},'earnedXp':{},'attempts':{},'work':{},'reviews':{},'streak':0,'lastActive':None,'selectedTrack':'sql'}
        def migrate():
            ctx=browser.new_context();raw=json.dumps(legacy,indent=4)+'\n'
            ctx.add_init_script('localStorage.setItem("ipskill.save.v1", '+json.dumps(raw)+')')
            target=ctx.new_page();target.set_default_timeout(60000);target.goto(URL)
            target.get_by_role('button', name='Review and migrate existing save').click()
            expect(target.get_by_role('status')).to_contain_text('Local workspace ready')
            assert state(target)['save']['playerName']=='Legacy learner'
            assert target.evaluate("localStorage.getItem('ipskill.save.v1')")==raw
            assert snapshots(target)[0]['raw']==raw
            ctx.close()
        record('Reviewed legacy migration preserves exact original text in place and in a snapshot', migrate)

        def corrupt_legacy():
            ctx=browser.new_context();raw='{broken legacy'
            ctx.add_init_script('localStorage.setItem("ipskill.save.v1", '+json.dumps(raw)+')')
            target=ctx.new_page();target.set_default_timeout(60000);target.goto(URL)
            target.get_by_role('button', name='Review and migrate existing save').click()
            expect(target.get_by_role('alert')).to_be_visible()
            assert state(target) is None
            assert target.evaluate("localStorage.getItem('ipskill.save.v1')")==raw
            ctx.close()
        record('Malformed legacy data is retained and never auto-reset', corrupt_legacy)

        def corrupt_active():
            ctx=browser.new_context();target=ctx.new_page();target.set_default_timeout(60000);target.goto(URL)
            target.get_by_role('button',name='Create empty local workspace').click()
            expect(target.get_by_role('status')).to_contain_text('Local workspace ready')
            seed(target,{'corrupt':'preserve me'});target.reload()
            expect(target.get_by_role('alert')).to_be_visible()
            assert state(target)=={'corrupt':'preserve me'}
            with target.expect_download() as event:target.get_by_role('button',name='Export accepted raw data',exact=True).click()
            path=OUT/'corrupt-active.json';event.value.save_as(str(path));assert json.loads(path.read_text())=={'corrupt':'preserve me'}
            ctx.close()
        record('Corrupt active data remains exportable and is never replaced by an empty workspace', corrupt_active)

        def reload_final():
            page.reload();nav('CRUD practice')
            expect(page.get_by_text('13 projects · page 1 of 2',exact=True)).to_be_visible(timeout=120000)
            assert state(page)['save']['playerName']=='Reviewed import'
            assert not errors,errors
            shot('07-final-practice-list.png')
        record('Final reload preserves accepted projects and no uncaught application errors occurred', reload_final)
        browser.close()
except Exception as error:
    fatal=str(error)
finally:
    server.terminate()
    try:server.wait(timeout=20)
    except subprocess.TimeoutExpired:server.kill();server.wait()
    log.close()
    result={'passed':fatal is None and len(checks)==19 and all(c['passed'] for c in checks),'total':len(checks),'expected':19,'checks':checks,'fatal':fatal,'pageErrors':errors}
    (OUT/'results.json').write_text(json.dumps(result,indent=2),encoding='utf-8')
if not result['passed']:
    raise SystemExit(fatal or 'Browser scenario count mismatch.')
