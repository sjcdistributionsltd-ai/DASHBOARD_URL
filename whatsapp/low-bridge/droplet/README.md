# Sending the low bridge GIF from the droplet at 12:00

The PDI droplet already posts a safety message to "DBH3 Driver Chat on the road Issues" at 12:00 UK time every day (`wa_safety_post.py`, run by `run_wa_safety.sh`). These two files are copies of the workhive `scripts/droplet-cron` versions with one change: if `/root/shell-pdi/assets/DBH3-low-bridge.gif` exists, the job posts that GIF instead of the height-warning poster. WhatsApp sends a `.gif` as a GIF, so it plays on a loop in the chat without anyone tapping it. The caption (`wa_safety_caption.txt`), the time and the fallbacks stay the same. If the GIF can't be attached, the job still sends the text caption.

`workhive-wa-safety-gif.patch` is the same change as a patch for the workhive repo (`git apply` from the workhive root), so the repo copy matches the droplet.

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
