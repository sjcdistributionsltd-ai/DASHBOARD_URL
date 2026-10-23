#!/bin/bash
# Daily 12:00 UK height-bar safety post into the DBH3 WhatsApp group.
# Refresh the in-container copy of the creative first, so editing the PNG in
# /root/shell-pdi/assets/ is all it takes to change tomorrow's post.
cd /root/shell-pdi || exit 1
set -a; [ -f /root/shell-pdi/.env ] && . /root/shell-pdi/.env; set +a
# The low bridge GIF wins when it is there (wa_safety_post.py makes the same choice).
if [ -f /root/shell-pdi/assets/DBH3-low-bridge.gif ]; then
  docker cp /root/shell-pdi/assets/DBH3-low-bridge.gif amazon-desktop:/config/safety.gif 2>/dev/null
else
  docker cp /root/shell-pdi/assets/DBH3-height-warning.png amazon-desktop:/config/safety.png 2>/dev/null
fi
echo "=== $(date -Is) wa safety post ===" >> logs/wa-safety.log
/opt/amazon-desktop/report_job/venv/bin/python wa_safety_post.py "$@" >> logs/wa-safety.log 2>&1
