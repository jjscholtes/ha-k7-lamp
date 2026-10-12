# Example: a complete aquarium dashboard

A working setup built around the K7 lamp, shared as a starting point. It runs a 60 cm reef cube with:

- a **K7 Pro IV** lamp (this integration),
- a **Jebao** Wi-Fi return pump ([chrisc123/jebao_aqua-homeassistant](https://github.com/chrisc123/jebao_aqua-homeassistant), local mode),
- a **Shelly Power Strip 4 Gen4** for the wavemaker, return pump, lamp and heater (core Shelly integration),
- a **Zigbee leak sensor** in the cabinet (any `moisture` binary sensor works).

Nothing here is required by the integration. Take what you need.

## What's in it

| File | Contents |
|---|---|
| [`dashboard.yaml`](dashboard.yaml) | Three views: **Overview** (status header, alerts, maintenance buttons, light, flow, power strip), **Light** (the schedule card plus lamp status) and **Energy** (power graph, energy per day, totals). |
| [`scripts.yaml`](scripts.yaml) | **Feed** (pump to feed mode, wavemaker off), **Water change** (pumps off for 30 min, heater stays on) and **Pumps back on**. |
| [`automations.yaml`](automations.yaml) | Pumps back on when a pause timer ends · lamp clock sync after an interruption · leak → return pump off + critical notification · leak-sensor battery low · power-strip outage and recovery notifications. |

### Design choices worth copying

- **Pauses always end.** Feed and water-change pauses run on `timer` helpers with *restore* enabled, and an automation on `timer.finished` switches the pumps back on. A timer that runs out while Home Assistant is restarting still fires afterwards, so a restart can't leave your pumps off.
- **Resync the lamp clock.** The K7 keeps its own clock. After a power cut it may be wrong until the next daily sync, so the clock is synced a minute after the lamp becomes reachable again.
- **Outlets default to on.** Set every outlet's *power-on default* to **on** in the Shelly app/web UI, so equipment restarts by itself after a power cut. (Shelly's default is *off*.)
- **Confirm before cutting power.** Outlet tiles only toggle via the icon, after a confirmation.
- **Leak → return pump off.** This stops leaks in pressurised return plumbing. If your sump itself can overflow (e.g. a stuck auto top-off), stopping the return pump makes that worse: decide what fits your setup.

## Helpers to create

Create these under **Settings → Devices & services → Helpers** (names as used in the YAML):

| Helper | Type and settings |
|---|---|
| `timer.aquarium_feed_pause` | Timer, 10 min, **Restore** on |
| `timer.aquarium_water_change` | Timer, 30 min, **Restore** on |
| `input_boolean.aquarium_power_outage` | Toggle (used to only send "power restored" after an outage) |
| `sensor.aquarium_power` | *Combine the state of several sensors* (min/max) → **sum** of the four outlet power sensors |
| `sensor.aquarium_energy` | *Integral* (Riemann sum) of `sensor.aquarium_power`, method **left**, prefix **k**, unit time **h**, max sub-interval 5 min |
| `sensor.aquarium_energy_today` | *Utility meter* on `sensor.aquarium_energy`, cycle **daily** |
| `sensor.aquarium_energy_this_month` | *Utility meter* on `sensor.aquarium_energy`, cycle **monthly** |

## Entity IDs to replace

The YAML uses placeholder entity IDs. Search and replace them with yours:

| Placeholder | What it is |
|---|---|
| `k7_lamp_…` (e.g. `sensor.k7_lamp_mode`) | Your K7 entities. The prefix follows your lamp's name, e.g. `k7_pro12345_`. |
| `return_pump_…` | The Jebao pump entities (`switch.…_power`, `select.…_mode`, `number.…_flow_rate`, fault sensors). |
| `power_strip_wavemaker`, `power_strip_return_pump`, `power_strip_lamp`, `power_strip_heater` | The four outlets of the strip (`switch.…` and `sensor.…_power`). |
| `binary_sensor.aquarium_leak_sensor`, `…_battery_low` | Your leak sensor. |
| `notify.mobile_app_your_phone` | Your phone's notify service. Critical notifications (`interruption-level: critical`) are iOS-specific. |

## Custom cards used

- `custom:k7-schedule-card` (this integration),
- [`custom:mini-graph-card`](https://github.com/kalkih/mini-graph-card) for the power graph (HACS).

Everything else is built in. The `distribution` card needs Home Assistant 2026.x or newer.
