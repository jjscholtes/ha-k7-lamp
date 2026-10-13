# Changelog

## 0.7.0

- Manual mode: a **Manual mode** switch and a **Manual <channel>** slider (0–100 %) per channel. They send the lamp's live mode and manual-level commands, so the schedule is left alone and the lamp doesn't pause for a full write. Tested on a K7 Pro IV: all channels at 100 % hold steady (about 93 W) until the switch goes back to auto.
- Changing a manual level also updates the stored program's manual levels, so a later Apply doesn't put the old ones back.

## 0.6.1

- Schedule card: the chart axis, hover pill and slot header show lamp output (the mean of the channels, 100 % = every channel at full power) instead of a sum of channel levels that could exceed 100 %.

## 0.6.0

- Schedule card redesign. The chart is now a stacked area of the channels (height = total light, layers = spectrum), drawn in plain SVG at the card's real width; Chart.js and its drag plugin are no longer bundled.
- A segmented control switches between the target/draft and what the lamp runs today (acclimation step, moonlight); the other one stays visible as a dashed line. Switching animates.
- Hovering shows the time and total; tapping the chart or the hour strip selects a slot; sliders update the chart live. Dragging points in the chart is gone (edit with the sliders).
- New look: soft gradients, a glowing "now" marker, an iOS-style settings list, channel chips, switches and sliders, with separate light and dark themes that follow Home Assistant.
- Dutch translation, used when Home Assistant's language is Dutch (including moon phases and dates).
- The hour strip shows each slot's light colour with opacity by level, so dim slots no longer look darker than dark ones.

## 0.5.3

- Schedule card: an untouched draft now follows a target or lamp schedule changed elsewhere (service call, another browser), instead of showing "Draft differs from target". Edited drafts are left alone.
- Schedule card: opens on the slot in effect now and marks the current time with a dashed "now" line in the chart and a dashed cell in the hour strip, using Home Assistant's time zone.
- Docs: card screenshot in the README and a complete aquarium dashboard example (`examples/aquarium`) with feed/water-change scripts, leak and power-outage alerts and energy tracking.

## 0.5.2

- Preserve duplicate schedule slots and app padding through reads, QR exchange, profiles and writes; exclude disabled slots from interpolation and moonlight.
- Validate moon channel indices before storage and quarantine previously invalid programs without blocking other lamps.
- Restore Home Assistant 2025.2 compatibility and reject K7 Mini model prefixes.
- Serialize complete program changes; confirm writes by read-back and persist applied cycle/percentage.
- Respect manual mode during automatic updates, avoid daytime restart writes, and retry failures within an actual dark interval of at most 30 minutes.
- Shift real timestamps (including minutes), select individual editor slots, and refuse unrepresentable midnight dark boundaries.
- Keep original backups per lamp and display actual read-back schedules and pending updates.
- Fix moonlight form submission and stop QR camera streams on panel changes, including delayed permission responses.
- Add schedule, Home Assistant integration and frontend regression coverage to CI.
- Write at most one acknowledged ALL_SET per night automatically, even when the read-back differs; Apply can still write.
- Read the lamp every 5 minutes instead of every 30 seconds; output sensors update every minute; one failed read is tolerated.
- Migrate stored programs (storage 1.2) so upgrading neither rewrites the lamp nor reports a pending plan.
- Report invalid saved programs as a repair issue, cleared when a new program replaces them.
- Move the plan rules into `planner.py` and the program into a validated `Program` model, both without Home Assistant imports.
- Test the card's copy of the schedule maths against the same vectors as `protocol.py`; lint with ruff.
- `tools/k7_test.py`: list read-back differences, `midnight-test`, `restore` and `demo`.

## 0.5.1

- Pass Home Assistant's hassfest validation (manifest key order, no braces in action descriptions).

## 0.5.0 (first public release)

- Local control of a Noo-Psyche K7 Pro over the LAN (TCP 8266); no cloud, no extra hardware.
- Sensors: mode, estimated output per channel, acclimation intensity, moonlight level, connectivity.
- Schedule editor card: drag-chart editor, colour preview, saved profiles, bundled presets,
  QR import (paste / image / camera) and export in the Noo-Psyche app format.
- "Day starts at": shifts loaded profiles so the photoperiod starts at your hour.
- Acclimation: linear ramp from a start % to 100% over N days.
- Moonlight that follows the real moon (phase, moonrise/moonset) at your HA location.
- The daily plan is written once, in the dark shortly before lights-on; the lamp runs it on its own.
