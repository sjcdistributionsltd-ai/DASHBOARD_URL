#!/bin/bash
# SJC Orbis home relay — run ONCE on the spare MacBook at home (Terminal).
#
# What it does: keeps an SSH link open from this Mac to the PDI droplet
# (46.101.30.183). The droplet sends its Orbis traffic, and only that, back
# down the link, so Orbis sees Scott's home broadband instead of the droplet's
# cloud address, which PDI refuses on and off (1 Nov 2026). Nothing on the
# router changes: the Mac connects OUT. The Orbis scripts, password and 2FA
# stay on the droplet; none of them are on this Mac.
#
# It makes a key for this link only (~/.ssh/sjc_orbis_relay), and a launchd
# job (uk.co.sjc.orbis-relay) that starts at log-in and reconnects within
# 30s after sleep, a reboot or a Wi-Fi drop. Safe to run again.
#
# Undo:  launchctl bootout gui/$(id -u)/uk.co.sjc.orbis-relay; rm ~/Library/LaunchAgents/uk.co.sjc.orbis-relay.plist
set -euo pipefail
DROPLET=46.101.30.183
RUSER=orbisrelay
PORT=1080
LABEL=uk.co.sjc.orbis-relay
KEY="$HOME/.ssh/sjc_orbis_relay"
KNOWN="$HOME/.ssh/sjc_orbis_known_hosts"
PLIST="$HOME/Library/LaunchAgents/$LABEL.plist"
LOG="$HOME/Library/Logs/sjc-orbis-relay.log"

mkdir -p "$HOME/.ssh" "$HOME/Library/LaunchAgents" "$HOME/Library/Logs"
chmod 700 "$HOME/.ssh"
[ -f "$KEY" ] || ssh-keygen -q -t ed25519 -N "" -C "sjc-orbis-relay@$(scutil --get LocalHostName 2>/dev/null || hostname)" -f "$KEY"

cat > "$PLIST" <<PL
<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0">
<dict>
  <key>Label</key><string>$LABEL</string>
  <key>ProgramArguments</key>
  <array>
    <string>/usr/bin/ssh</string><string>-N</string><string>-T</string>
    <string>-i</string><string>$KEY</string>
    <string>-o</string><string>BatchMode=yes</string>
    <string>-o</string><string>ExitOnForwardFailure=yes</string>
    <string>-o</string><string>ServerAliveInterval=30</string>
    <string>-o</string><string>ServerAliveCountMax=3</string>
    <string>-o</string><string>StrictHostKeyChecking=accept-new</string>
    <string>-o</string><string>UserKnownHostsFile=$KNOWN</string>
    <string>-R</string><string>127.0.0.1:$PORT</string>
    <string>$RUSER@$DROPLET</string>
  </array>
  <key>RunAtLoad</key><true/>
  <key>KeepAlive</key><true/>
  <key>ThrottleInterval</key><integer>30</integer>
  <key>StandardErrorPath</key><string>$LOG</string>
</dict>
</plist>
PL

launchctl bootout "gui/$(id -u)/$LABEL" 2>/dev/null || true
launchctl bootstrap "gui/$(id -u)" "$PLIST"

echo
echo "Relay installed on this Mac. It keeps trying to connect every 30 seconds."
echo "Now copy the ONE line below (it starts ssh-ed25519) into the droplet step:"
echo
cat "$KEY.pub"
echo
