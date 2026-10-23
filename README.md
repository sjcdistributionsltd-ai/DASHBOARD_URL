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

## Rewards for forecourt staff

`prototype/rewards.js` holds the badges shelf, the badge-unlock moment, the shout-out card and the Monday weekly recap. `enhance-kudos-dash.js` adds the manager's "🙌 Thank" button and shout-out dialog to the dashboard. Staff scenes are run with `rec2.js`:

```bash
node rec2.js r=shelf rw-shelf still
node rec2.js r=unlock rw-unlock video 5
node rec2.js r=shout rw-shout video 5
node rec2.js "r=recap&s=2" rw-recap-2 still 1 5400   # s = slide to hold on
node shoot.js "dashboard.html?k=modal" fixtures-dash.js rw-dash-thank.png enhance-kudos-dash.js 1440 900
```

## Birthdays and work anniversaries

`prototype/birthday.js` adds the floating balloons you can tap to pop, the top banner and the Today card. It plays once on the day, using `date_of_birth` and `start_date`, which the staff app already loads. Run `node rec2.js r=bday bd-bday video 13` or `r=anniv`.

## On-time stamp and training complete

- `celebrate.js` now adds an "ON TIME" stamp, the message "Right on time! Have a great shift" and confetti for an on-time clock-in. An on-time clock-out (within 10 minutes of the shift end) gets "Shift done, right on time. Thank you!". Late clock-ins get the friendly message only. Run `node record.js out ot-out fixtures-staff.js,fixtures-outontime.js enhance-fun.js video`.
- `training.js` compares the two latest `shell_training_rag` rows. When nothing is outstanding it shows the graduation-cap certificate. When some modules are done it shows a "Module complete, N to go" progress card. Run `node rec2.js r=train tr-done video 7` or `r=trainstep`.

## Game of the week

`prototype/games.js` holds four mini games that rotate every Monday: Balloon Blitz, Fuel Gauge Hangman, Memory Match and GO+ Grab. They run entirely on the phone, save personal bests on the phone and are locked while clocked in. An optional site top-scores list would need one small table. `hook-games.js` stages each scene with scripted taps:

```bash
node rec2.js g=card gm-card still 1 2600
node rec2.js "g=blitz&auto=1&s=15" gm-blitz video 24
node rec2.js "g=hangman&auto=1" gm-hm video 13
node rec2.js "g=memory&auto=1" gm-mem video 23
node rec2.js "g=goplus&auto=1&s=15" gm-go video 22
```

## SJC Arcade (15 games)

`prototype/games-more.js` adds 11 games on top of `games.js`: Forecourt Racer, Shelf Stacker, Coffee Rush, Fuel Up, Till Change, Word Scramble, Forecourt Quiz, Car Wash, Queue Buster, Crate Stack and Pump Simon. It also adds the Arcade screen (`whArcade`) and a weekly featured game. `boards.js` holds a sample SJC-wide leaderboard with positions (example names). Hangman (71 words), Word Scramble (48) and the Quiz (32) draw from shuffled lists kept on the phone, so nothing repeats until the whole list has been used.

```bash
node rec2.js g=arcade gx-arcade still 1 2500
node rec2.js "g=racer&auto=1" gx-racer video 34           # autopilot, 3 laps
node rec2.js "g=shelves&auto=1" gx-shelves video 14        # also: coffee, fuelup, till, scramble, quiz, wash, queue, stack, simon
```

## WhatsApp: low bridge reminder

`whatsapp/low-bridge/low-bridge.mp4` is a 15-second, 1080×1080 H.264 video for the drivers' WhatsApp group. It shows a 2.7 m van hitting a 2.2 m bridge and coming out without a roof. It ends on the message "Don't make the van a convertible! Know the height of your van before driving. If in doubt, get out!"

- `low-bridge.html` is the JavaScript canvas animation. Open it in a browser to watch it loop.
- `render.js` steps through the animation frame by frame and encodes the MP4 with ffmpeg (libx264):

```bash
cd whatsapp/low-bridge
node render.js                      # writes low-bridge.mp4 (set FFMPEG=/path/to/ffmpeg if needed)
node render.js --stills 2.2,5,14 s  # PNG stills at those seconds, for checking
```

`low-bridge.gif` is a 480×480 copy that WhatsApp plays straight away on a loop. `droplet/` holds the changes that make the droplet's 12:00 DBH3 safety post send it. See `droplet/README.md` to deploy and test.
