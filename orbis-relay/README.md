# Orbis home relay: MacBook script

Public copy of `scripts/droplet-cron/orbis-relay/mac-setup.sh` from the
workhive repo, so the spare MacBook at home can download it with one command.
It holds no passwords or keys: it makes its own key on the MacBook and prints
the public half for the droplet step.

On the MacBook (Terminal):

```
curl -fsSL https://raw.githubusercontent.com/sjcdistributionsltd-ai/DASHBOARD_URL/claude/orbis-droplet-migration-nwp5hj/orbis-relay/mac-setup.sh -o /tmp/mac-setup.sh && bash /tmp/mac-setup.sh
```

The full steps, the droplet side and the switch-back-on are in the workhive
repo: `scripts/droplet-cron/orbis-relay/README.md`.
