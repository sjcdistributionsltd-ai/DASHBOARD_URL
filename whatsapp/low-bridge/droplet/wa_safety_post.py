#!/usr/bin/env python3
"""Daily 12:00 UK safety post into the DBH3 WhatsApp group (Scott, 10 Aug 2026:
"fully automated please"). Posts the height-bar warning IMAGE with the @all
caption through the droplet's linked WhatsApp Web session — the same one the
shadow feed reads with.

Mechanics: attach to the WhatsApp tab, open the group, dispatch a synthetic
paste event carrying the PNG (identical to a human pasting a screenshot),
type the caption into the media preview, click send. If the media path fails,
falls back to a text-only message so the reminder still lands.

Assets: /root/shell-pdi/assets/DBH3-low-bridge.gif if it is there (the low
bridge animation; WhatsApp sends a .gif as a GIF, which plays on a loop in the
chat without a tap), otherwise DBH3-height-warning.png, plus wa_safety_caption.txt
(edit the txt to change the daily message). Delete the .gif to go back to the
poster. Cron 11:00+12:00 UTC with a UK-hour
guard = always 12:00 UK. Heartbeat: wa-safety-post. Self-verifies via the DOM
after sending; the shadow feed mirrors it within a minute as a second witness.

Usage: wa_safety_post.py [--force] [--self-test] [--open-only]
  --self-test posts to the linked account's own chat instead of the group.
  --open-only opens the real group and sends NOTHING — the post-deploy check.
"""
import base64, datetime, json, os, sys, time, urllib.request
sys.path.insert(0, "/root/shell-pdi")
from cdp_mini import Tab, container_ip

SB_URL = os.environ.get("SUPABASE_URL", "").rstrip("/")
SB_KEY = os.environ.get("SUPABASE_SERVICE_KEY", "")
GROUP = "DBH3 Driver Chat on the road Issues"
GIF = "/root/shell-pdi/assets/DBH3-low-bridge.gif"
PNG = "/root/shell-pdi/assets/DBH3-height-warning.png"
# docker cp'd copy INSIDE amazon-desktop (run_wa_safety.sh makes the same choice)
IMG, CONTAINER_IMG = (GIF, "/config/safety.gif") if os.path.exists(GIF) else (PNG, "/config/safety.png")
CAPTION_FILE = "/root/shell-pdi/assets/wa_safety_caption.txt"

def log(m): print(f"[{datetime.datetime.now():%Y-%m-%d %H:%M:%S}] {m}", flush=True)

def uk_hour():
    return int((datetime.datetime.utcnow() + datetime.timedelta(hours=1)).strftime("%H"))

def heartbeat(name, summary):
    if not SB_URL: return
    try:
        req = urllib.request.Request(f"{SB_URL}/rest/v1/sjc_job_runs", method="POST",
            headers={"apikey": SB_KEY, "Authorization": f"Bearer {SB_KEY}",
                     "Content-Type": "application/json", "Prefer": "return=minimal"},
            data=json.dumps({"job_name": name, "dry_run": False, "summary": summary}).encode())
        urllib.request.urlopen(req, timeout=30).read()
    except Exception as e:
        log(f"heartbeat failed: {e}")

# Chat-list row selectors, newest WhatsApp build first. WhatsApp renamed the
# rows from [role=listitem] to [role=row] on 14 Aug 2026; keep both so a future
# rename costs one entry here rather than another silent multi-day outage.
# NOTE: wa_group_pull.open_group() carries the same two-route logic for the same
# reason. If WhatsApp renames these again, BOTH files need the new selector.
ROW_SEL = '#pane-side [role="row"], #pane-side [role="listitem"]'

def _trusted_click(t, box):
    """A real CDP mouse click. The sidebar search box ignores a synthetic
    element.click(), so anything that has to drive it needs these."""
    for typ in ("mousePressed", "mouseReleased"):
        t.send("Input.dispatchMouseEvent",
               {"type": typ, "x": box["x"], "y": box["y"], "button": "left", "clickCount": 1})
        time.sleep(0.12)

def _search_box(t):
    """The sidebar search input, asserted to live in #side and NOT in #main, so
    that no DOM change can ever route this into a message compose box."""
    return t.eval("""(() => { const el = document.querySelector('#side input[type="text"]');
      if (!el || el.closest('#main')) return null;
      const r = el.getBoundingClientRect();
      return {x: Math.round(r.left + r.width/2), y: Math.round(r.top + r.height/2)}; })()""")

def _clear_search(t):
    t.eval("""(() => { const el = document.querySelector('#side input[type="text"]');
      if (!el || el.closest('#main')) return;
      const set = Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype, 'value').set;
      set.call(el, ''); el.dispatchEvent(new Event('input', {bubbles:true})); })()""")

OPENED = {"already_open", "clicked", "clicked_via_search", "self_chat"}

def open_chat(t, self_test):
    """Put the target chat on screen. Returns a reason string; anything in
    OPENED means we got there.

    Two routes, because the chat list is VIRTUALISED: only about the top 65
    rows are ever in the DOM, so a group that has been quiet for a day or two
    drops out of it entirely. That is not "missing", it is just below the fold
    — and the old selector-only lookup could not tell those two apart, so a
    quiet week in the group read as a hard failure and the daily safety post
    silently stopped going out. Route 1 is the rendered row; route 2 is the
    sidebar search, which finds the chat wherever it is, including archived.
    The search text is always cleared again afterwards.
    """
    urllib.request.urlopen(f"http://{container_ip()}:9223/json/activate/{t.id}", timeout=10).read()
    try: t.send("Page.setWebLifecycleState", {"state": "active"})
    except Exception: pass
    if self_test:
        # "Message yourself" chat sits in the sidebar with "(You)" in the title.
        # Title varies by build: "(You)" suffix, "Message yourself", or bare
        # "You". Try the rendered rows first, then the sidebar search — the
        # self chat is subject to the same virtualised list as everything else.
        SELF_RE = "/^You$|\\(You\\)|Message yourself/i"
        r = t.eval(f"""(() => {{
          for (const row of document.querySelectorAll('{ROW_SEL}')) {{
            const s = row.querySelector('span[title]');
            if (!s || !{SELF_RE}.test(s.getAttribute('title') || '')) continue;
            row.dispatchEvent(new MouseEvent('mousedown', {{bubbles:true}}));
            s.click(); return 'clicked ' + s.getAttribute('title');
          }}
          return 'no_self_chat'; }})()""")
        log(f"self chat: {r}"); time.sleep(4)
        if "no_self_chat" not in (r or ""):
            return "self_chat"
        box = _search_box(t)
        if not box:
            return "no_search_box"
        _trusted_click(t, box); time.sleep(1)
        t.send("Input.insertText", {"text": "You"}); time.sleep(4)
        hit = t.eval(f"""(() => {{
          for (const row of document.querySelectorAll('{ROW_SEL}')) {{
            const s = row.querySelector('span[title]');
            if (!s || !{SELF_RE}.test(s.getAttribute('title') || '')) continue;
            const r = row.getBoundingClientRect();
            return {{x: Math.round(r.left + r.width/2), y: Math.round(r.top + r.height/2)}};
          }}
          return null; }})()""")
        if not hit:
            _clear_search(t); return "no_self_chat"
        _trusted_click(t, hit); time.sleep(4); _clear_search(t)
        log("self chat: clicked_via_search")
        return "self_chat"

    header = t.eval("(() => { const h = document.querySelector('#main header'); return h ? h.innerText.slice(0,300) : ''; })()") or ""
    if "DBH3 Driver Chat" in header:
        return "already_open"

    # Route 1: the row is rendered in the sidebar right now.
    clicked = t.eval(f"""(() => {{
      for (const row of document.querySelectorAll('{ROW_SEL}')) {{
        const s = row.querySelector('span[title="{GROUP}"]');
        if (!s) continue;
        row.dispatchEvent(new MouseEvent('mousedown', {{bubbles:true}}));
        s.click();
        return 'clicked';
      }}
      return 'not_rendered'; }})()""")
    log(f"open group: {clicked}")
    if clicked == "clicked":
        time.sleep(4)
        return "clicked"

    # Route 2: it has scrolled out of the virtualised list — find it by search.
    box = _search_box(t)
    if not box:
        return "no_search_box"
    _trusted_click(t, box)
    time.sleep(1)
    t.send("Input.insertText", {"text": GROUP[:28]})
    time.sleep(4)
    hit = t.eval(f"""(() => {{
      for (const row of document.querySelectorAll('{ROW_SEL}')) {{
        const s = row.querySelector('span[title]');
        if (!s || !/DBH3 Driver Chat on the road/i.test(s.getAttribute('title') || '')) continue;
        const r = row.getBoundingClientRect();
        return {{x: Math.round(r.left + r.width/2), y: Math.round(r.top + r.height/2)}};
      }}
      return null; }})()""")
    if not hit:
        _clear_search(t)
        return "not_found_by_search"
    _trusted_click(t, hit)
    time.sleep(4)
    _clear_search(t)
    log("open group: clicked_via_search")
    return "clicked_via_search"

def _click(t, c):
    t.send("Input.dispatchMouseEvent", {"type": "mouseMoved", "x": c["x"], "y": c["y"]})
    t.send("Input.dispatchMouseEvent", {"type": "mousePressed", "x": c["x"], "y": c["y"], "button": "left", "clickCount": 1})
    time.sleep(0.15)
    t.send("Input.dispatchMouseEvent", {"type": "mouseReleased", "x": c["x"], "y": c["y"], "button": "left", "clickCount": 1})

def _rect(t, js):
    r = t.eval(js)
    return json.loads(r) if r else None

def paste_image(t, b64=None):
    """The PROVEN attach recipe (11 Aug 07:53 — the poster landed): trusted
    click on the plus button, trusted click on the "Photos & videos" menu item
    with Page.setInterceptFileChooserDialog on, catch fileChooserOpened, then
    DOM.setFileInputFiles(backendNodeId). Synthetic paste/drag events and the
    pre-mounted-input hunt all fail intermittently; this path is the one that
    behaves like a real person."""
    rc = _rect(t, """(() => {
      const b = document.querySelector('footer [data-icon="plus-rounded"], #main [data-icon="plus"], #main [data-icon="clip"]');
      if (!b) return '';
      const r = b.getBoundingClientRect();
      return JSON.stringify({x: r.x + r.width/2, y: r.y + r.height/2}); })()""")
    if not rc: return "no_attach_btn"
    _click(t, rc)
    time.sleep(2)
    item = _rect(t, """(() => {
      const el = [...document.querySelectorAll('span, div')]
        .find(e => e.offsetParent && (e.innerText||'').trim() === 'Photos & videos');
      if (!el) return '';
      const r = el.getBoundingClientRect();
      return JSON.stringify({x: r.x + r.width/2, y: r.y + r.height/2}); })()""")
    if not item: return "no_photos_menu_item"
    t.send("Page.setInterceptFileChooserDialog", {"enabled": True})
    try:
        _click(t, item)
        backend = None
        t.ws.settimeout(10)
        end = time.time() + 10
        while time.time() < end:
            try:
                m = json.loads(t.ws.recv())
            except Exception:
                break
            if m.get("method") == "Page.fileChooserOpened":
                backend = m["params"].get("backendNodeId"); break
        if not backend: return "no_file_chooser"
        t.send("DOM.setFileInputFiles", {"files": [CONTAINER_IMG], "backendNodeId": backend})
    finally:
        t.send("Page.setInterceptFileChooserDialog", {"enabled": False})
    time.sleep(4)
    opened = t.eval("""(() => {
      const send = [...document.querySelectorAll('[data-icon]')]
        .some(e => e.offsetParent && (e.getAttribute('data-icon')||'').toLowerCase().includes('send'));
      return send ? 'preview_open' : 'no_preview'; })()""")
    return "pasted" if opened == "preview_open" else opened

def type_caption_and_send(t, caption):
    time.sleep(3)   # media preview settles
    # Caption box = the last VISIBLE contenteditable (the preview's). Use a
    # REAL click + CDP Input.insertText: execCommand insert into the preview
    # silently failed on 11 Aug (image sent with no caption).
    box = _rect(t, """(() => {
      const boxes = [...document.querySelectorAll('div[contenteditable="true"]')]
        .filter(b => b.offsetParent !== null);
      const el = boxes[boxes.length - 1];
      if (!el) return '';
      const r = el.getBoundingClientRect();
      return JSON.stringify({x: r.x + Math.min(60, r.width/2), y: r.y + r.height/2}); })()""")
    if not box: return "no_caption_box"
    _click(t, box)
    time.sleep(0.5)
    t.send("Input.insertText", {"text": caption})
    time.sleep(1.5)
    src = _rect(t, """(() => {
      const cands = [...document.querySelectorAll('[data-icon]')]
        .filter(e => e.offsetParent && (e.getAttribute('data-icon')||'').toLowerCase().includes('send'));
      const el = cands[cands.length - 1];
      if (!el) return '';
      const r = el.getBoundingClientRect();
      return JSON.stringify({x: r.x + r.width/2, y: r.y + r.height/2}); })()""")
    if not src: return "no_send_button"
    _click(t, src)
    return "sent"

def send_text_only(t, text):
    """Trusted-input recipe (11 Aug): real click to focus, Ctrl+A+Backspace to
    kill any stale draft (execCommand cannot clear WhatsApp's composer), then
    CDP Input.insertText — the ONLY insertion that keeps multi-line text intact
    and unscrambled (execCommand insertText loses or reorders lines)."""
    rect = t.eval("""(() => {
      const c = document.querySelector('#main footer div[contenteditable="true"]');
      if (!c) return '';
      const r = c.getBoundingClientRect();
      return JSON.stringify({x: r.x + 60, y: r.y + r.height/2}); })()""")
    if not rect: return "no_composer"
    c = json.loads(rect)
    t.send("Input.dispatchMouseEvent", {"type": "mousePressed", "x": c["x"], "y": c["y"], "button": "left", "clickCount": 1})
    t.send("Input.dispatchMouseEvent", {"type": "mouseReleased", "x": c["x"], "y": c["y"], "button": "left", "clickCount": 1})
    time.sleep(0.5)
    for vk, k, code, mods in [(65, "a", "KeyA", 2), (8, "Backspace", "Backspace", 0)]:
        t.send("Input.dispatchKeyEvent", {"type": "rawKeyDown", "key": k, "code": code, "windowsVirtualKeyCode": vk, "modifiers": mods})
        t.send("Input.dispatchKeyEvent", {"type": "keyUp", "key": k, "code": code, "windowsVirtualKeyCode": vk, "modifiers": mods})
        time.sleep(0.2)
    t.send("Input.insertText", {"text": text})
    time.sleep(1)
    got = t.eval("""((txt) => {
      const c = document.querySelector('#main footer div[contenteditable="true"]');
      return (c.innerText || '').trim() === txt.trim() ? 'exact' : 'mismatch:' + (c.innerText || '').length;
    })(%s)""" % json.dumps(text))
    if got != "exact":
        log(f"composer content check: {got} — not sending")
        return "insert_mismatch"
    src = t.eval("""(() => {
      const cands = [...document.querySelectorAll('#main footer [data-icon], footer [data-icon]')]
        .filter(e => e.offsetParent && (e.getAttribute('data-icon')||'').toLowerCase().includes('send'));
      const el = cands[cands.length - 1];
      if (!el) return '';
      const r = el.getBoundingClientRect();
      return JSON.stringify({x: r.x + r.width/2, y: r.y + r.height/2}); })()""")
    if not src: return "no_send_button"
    sc = json.loads(src)
    t.send("Input.dispatchMouseEvent", {"type": "mousePressed", "x": sc["x"], "y": sc["y"], "button": "left", "clickCount": 1})
    t.send("Input.dispatchMouseEvent", {"type": "mouseReleased", "x": sc["x"], "y": sc["y"], "button": "left", "clickCount": 1})
    return "sent"

def main():
    force = "--force" in sys.argv
    self_test = "--self-test" in sys.argv
    text_only = "--text-only" in sys.argv
    # --open-only: open the REAL driver group exactly as the daily run does,
    # confirm the header, send nothing. This is the test that matters after a
    # deploy — it exercises the two-route lookup the group path depends on,
    # with no message and no heartbeat, so it can be run at any hour. (The
    # --self-test path opens a different chat by a different lookup, so a
    # passing self-test says nothing about whether the group can be found.)
    open_only = "--open-only" in sys.argv
    if open_only: force = True
    if not force and uk_hour() != 12:
        log(f"UK hour {uk_hour()} != 12 — exiting (BST/GMT guard)"); return 0
    caption = open(CAPTION_FILE).read().strip() if os.path.exists(CAPTION_FILE) else "@all daily height check"
    b64 = base64.b64encode(open(IMG, "rb").read()).decode() if os.path.exists(IMG) else None

    t = Tab("http://" + container_ip() + ":9223", attach_url_substr="web.whatsapp.com")
    ok, mode = False, "none"
    try:
        why = open_chat(t, self_test)
        if why not in OPENED:
            # Name the actual reason. Every failure used to report the same
            # "chat not found", which told nobody whether WhatsApp had been
            # signed out, renamed its DOM, or simply scrolled the group away.
            log(f"could not open target chat: {why}")
            heartbeat("wa-safety-post-error", f"could not open chat: {why}")
            return 1
        if open_only:
            header = t.eval("(() => { const h = document.querySelector('#main header'); return h ? h.innerText.slice(0,120) : ''; })()") or ""
            good = "DBH3 Driver Chat" in header
            log(f"open-only: route={why} header={header!r} -> {'OK' if good else 'WRONG CHAT'}")
            return 0 if good else 1
        if b64 and not text_only:
            p = paste_image(t, b64)
            log(f"paste: {p}")
            if p == "pasted":
                s = type_caption_and_send(t, caption)
                log(f"send: {s}")
                ok, mode = (s == "sent"), "image"
        if not ok:
            log("image path failed — falling back to text only")
            s = send_text_only(t, caption)
            log(f"text send: {s}")
            ok, mode = (s == "sent"), "text"
        time.sleep(8)
        # Look at the LAST THREE messages for the image — the freshly-sent bubble
        # can render behind an older row for a few seconds, and a too-early
        # single-row check called a SUCCESSFUL send a failure on 11 Aug (the
        # poster was in the chat all along). Post-send this is informational
        # only: we never fall back after clicking send (double-post risk).
        last = t.eval("""(() => {
          const rows = [...document.querySelectorAll('#main [data-id]')].slice(-3);
          const img = rows.some(el => el.querySelector('img[src^="blob:"], [data-icon="status-image"], img[draggable], video, [data-icon="media-gif"]'));
          const tail = rows.length ? (rows[rows.length-1].innerText || '').slice(0, 80) : 'none';
          return (img ? 'WITH_IMAGE | ' : 'NO_IMAGE_SEEN | ') + tail;
        })()""") or ""
        log(f"post-send check: {last[:130]!r}")
    finally:
        pass   # NEVER close the shared WhatsApp tab
    heartbeat("wa-safety-post" if ok else "wa-safety-post-error",
              f"{mode} {'sent' if ok else 'FAILED'}{' (self-test)' if self_test else ''}")
    return 0 if ok else 1

if __name__ == "__main__":
    sys.exit(main())
