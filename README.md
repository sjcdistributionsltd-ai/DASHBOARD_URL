# WorkHive JS upgrade proposal

A proposal for JavaScript improvements to the WorkHive staff app (`public/app.html`) and the manager/owner dashboard (`public/dashboard.html`) in the `workhive` repo.

- `proposal/index.html` lists the bugs to fix first, the staff app and dashboard upgrades, the guardrails and the rollout order, with before/after screenshots in `proposal/img/`.
- `prototype/` holds the working prototype that produced the "after" screenshots:
  - `enhance-staff.js` and `enhance-dash.js` are the enhancement layers, loaded on top of the real pages.
  - `mock-supabase.js` and `fixtures-*.js` swap in a fake Supabase client with made-up data, so no production data is used.
  - `shoot.js` renders a page and takes a screenshot with Playwright.

Regenerate a screenshot (run from `prototype/`, with `workhive` cloned next to this repo):

```bash
node shoot.js "app.html?scene=hero" fixtures-staff.js out.png enhance-staff.js 390 844
node shoot.js "dashboard.html?scene=overview" fixtures-dash.js out.png enhance-dash.js 1440 900
```

Staff scenes: `hero`, `clocked`, `offline`, `geofence`, `rota`. Dashboard scenes: `overview`, `palette`, `table`, `confirm`.

The prototype is for the screenshots only. It is not production code, and nothing in the `workhive` repo has been changed.

## Clock-in and clock-out moments

`prototype/celebrate.js` holds the animations: a tick, confetti and a thank-you message on clock-in, and a wave with the shift's numbers on clock-out. `hook-fun.js` connects it to the real Clock in button. To record a video or take a still:

```bash
cat enhance-staff.js celebrate.js hook-fun.js > enhance-fun.js
node record.js in fun-in fixtures-staff.js,fixtures-fun.js enhance-fun.js video   # or: still
node record.js out fun-out fixtures-staff.js enhance-fun.js video
node record.js milestone fun-milestone fixtures-staff.js,fixtures-fun.js enhance-fun.js video
```
