# HA-MGP FP1 capture – Portugal 20 November 2026

This standalone read-only collector uses Python 3 standard library on an always-on Linux machine (for example a Raspberry Pi), **not** HACS. It never writes commands or entities to Home Assistant.

Start **09:45 CET Friday 20 Nov**, end **12:45 CET**. Moto3 FP1 starts 10:00 CET, Moto2 FP1 10:50, MotoGP FP1 11:45. Every 15 s it samples the specified HA sensors using up to five REST GET calls. The JSONL output contains timestamp, states, relevant attributes, live feed freshness/polling, TV-delay info, riders/laps and source diagnostics. This is NOT a raw network capture.

## Setup on an always-on Raspberry Pi / Linux machine

1. Clone the repository's dev branch:
   git clone --branch dev https://github.com/Jocke1970/HA-MGP.git ~/HA-MGP

2. Generate a Home Assistant Long-Lived Access Token in your HA profile.
   Save it as an environment file in your Linux HOME, NOT in Git:
   mkdir -p ~/.config
   ( umask 077; nano ~/.config/ha-mgp-fp1.env )

   Enter the following two lines, replacing the placeholder:
   HA_URL=http://homeassistant.local:8123
   HA_TOKEN=YOUR_PRIVATE_TOKEN

   Restrict file permissions:
   chmod 600 ~/.config/ha-mgp-fp1.env

3. Install the provided systemd user service/timer:
   mkdir -p ~/.config/systemd/user
   cp ~/HA-MGP/scripts/diagnostics/systemd/ha-mgp-fp1.* ~/.config/systemd/user/
   systemctl --user daemon-reload
   systemctl --user enable --now ha-mgp-fp1.timer
   systemctl --user list-timers ha-mgp-fp1.timer

4. Ensure user services survive SSH logout:
   loginctl show-user "$USER" -p Linger
   If it shows Linger=no, run:
   sudo loginctl enable-linger "$USER"

5. Verify HA connectivity before Friday, using a brief FUTURE interval:
   set -a; . ~/.config/ha-mgp-fp1.env; set +a
   python3 ~/HA-MGP/scripts/diagnostics/capture_fp1.py --start 2026-11-19T21:00:00+01:00 --end 2026-11-19T21:01:00+01:00 --output ~/ha-mgp-captures/smoke.jsonl

   Adjust the two times to a future one-minute interval. Check the smoke JSONL for errors. If DNS homeassistant.local does not work, use your HA LAN IP in the env file.

6. After FP1:
   systemctl --user status ha-mgp-fp1.service
   journalctl --user -u ha-mgp-fp1.service --no-pager -n 40
   File: ~/ha-mgp-captures/mgp-fp1-2026-11-20.jsonl

The collector reads sensor.motogp_next_race, sensor.motogp_rider_positions, sensor.motogp_current_session, sensor.motogp_session_status and sensor.motogp_api_debug. A missing/disabled entity appears as HTTP 404; it does not stop collection. The debug entity is disabled by default; opt in through HA entity registry if desired.

The output contains public rider and lap data, but not your HA token. Do not send the environment/token file. Output files are created with mode 0600.

**This is not scheduled until someone actually installs/enables the timer on an always-on machine.** GitHub does not schedule anything on your HA system. Existing backend event archives also continue independently.
