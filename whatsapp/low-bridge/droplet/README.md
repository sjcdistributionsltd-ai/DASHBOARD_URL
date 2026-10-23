# Sending the low bridge GIF from the droplet at 12:00

The PDI droplet already posts a safety message to "DBH3 Driver Chat on the road Issues" at 12:00 UK time every day (`wa_safety_post.py`, run by `run_wa_safety.sh`). These two files are copies of the workhive `scripts/droplet-cron` versions with one change: if `/root/shell-pdi/assets/DBH3-low-bridge.gif` exists, the job posts that GIF instead of the height-warning poster. WhatsApp sends a `.gif` as a GIF, so it plays on a loop in the chat without anyone tapping it. The caption (`wa_safety_caption.txt`), the time and the fallbacks stay the same. If the GIF can't be attached, the job still sends the text caption.

`workhive-wa-safety-gif.patch` is the same change as a patch for the workhive repo (`git apply` from the workhive root), so the repo copy matches the droplet.

## Deploy without the SSH key (DigitalOcean web console)

This repository is public, so the droplet can download the files itself. In DigitalOcean, open the droplet and choose **Access → Launch Droplet Console**, then paste:

```bash
cd /root/shell-pdi && mkdir -p assets backup && cp -n wa_safety_post.py run_wa_safety.sh backup/ 2>/dev/null
B=https://raw.githubusercontent.com/sjcdistributionsltd-ai/DASHBOARD_URL/claude/kava-van-bridge-animation-wd3470/whatsapp/low-bridge
curl -fsSL "$B/low-bridge.gif" -o assets/DBH3-low-bridge.gif
curl -fsSL "$B/droplet/wa_safety_post.py" -o wa_safety_post.py
curl -fsSL "$B/droplet/run_wa_safety.sh" -o run_wa_safety.sh && chmod +x run_wa_safety.sh
./run_wa_safety.sh --open-only; tail -3 logs/wa-safety.log
```

`--open-only` opens the real group and sends nothing; it should end `-> OK`. (The `--self-test` route needs a "Message yourself" chat on the linked account, which this one does not have.) The old scripts are kept in `/root/shell-pdi/backup/`.

The cron line was commented out on 3 Oct 2026. To switch the daily post back on, once a day at 12:00 UK all year:

```bash
crontab -l | sed 's|^# STOPPED 3 Oct 2026.*run_wa_safety.sh$|0 11,12 * * * /root/shell-pdi/run_wa_safety.sh|' | crontab -
crontab -l | grep run_wa_safety
```

It runs at 11:00 and 12:00 UTC, and the UK-hour guard lets exactly one of them post (11:00 UTC in summer, 12:00 UTC in winter).

## Deploy (from a machine with the droplet key)

```bash
cd whatsapp/low-bridge
scp -i ~/.ssh/sjc_droplet low-bridge.gif root@46.101.30.183:/root/shell-pdi/assets/DBH3-low-bridge.gif
scp -i ~/.ssh/sjc_droplet droplet/wa_safety_post.py droplet/run_wa_safety.sh root@46.101.30.183:/root/shell-pdi/
```

## Test before 12:00

```bash
ssh -i ~/.ssh/sjc_droplet root@46.101.30.183
cd /root/shell-pdi
./run_wa_safety.sh --self-test --force   # posts to the linked account's own chat, not the group
tail -20 logs/wa-safety.log               # look for "paste: pasted" and "send: sent"
```

Check the self chat on the phone that the GIF plays on its own. If it does, the next 12:00 run sends it to the group. To go back to the poster, delete `/root/shell-pdi/assets/DBH3-low-bridge.gif`.
