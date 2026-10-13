/*
 * K7 schedule editor card for the k7_lamp integration.
 *
 * Edits the lamp's 24-point schedule, imports/exports Noo-Psyche app QR codes
 * and applies the result with one ALL_SET. The chart is plain SVG: a stacked area
 * of the channels, drawn at the card's real width. Editor design, QR format and the
 * bundled presets come from bitbarista/k7-led-controller (MIT); see NOTICE.md.
 */
const BASE = "/k7_lamp";
const VERSION = "0.7.1";
// Physical LED colours: only used to mix the light colour of a slot (strip and chart backdrop).
const COLORS = ["#f5f5f5", "#3b3bff", "#22c55e", "#9b30ff", "#00d5ff", "#ff3030"];
// Chart colours per theme. Blue/UV and red/green stay close for colour-blind readers,
// so every colour is always shown next to its channel name.
const CHANNEL_COLORS = {
  dark: ["#f2f2f7", "#5e7bff", "#32d583", "#bf5af2", "#64d2ff", "#ff6961"],
  light: ["#48484a", "#3456e0", "#1f8a45", "#a62fba", "#0b8fb0", "#d6382c"],
};
// Bottom to top in the stacked chart: the strongest channels of a reef profile first.
const STACK = [1, 4, 0, 3, 2, 5];

const STRINGS = {
  en: {
    title: "K7 schedule", auto: "Auto", manual: "Manual", offline: "Offline",
    differs_target: "Draft differs from target", differs_lamp: "Draft differs from lamp",
    matches_target: "Matches target", matches_lamp: "Matches lamp",
    pending: "A plan update is pending. It will retry in the next safe window, or you can apply now.",
    loading: "Loading…",
    acc: "Acclimation", acc_day: "day {d} of {n}", acc_range: "{s}% → 100%, ends {e}",
    acc_window: "Daily update window starts at {t}.", acc_nowindow: "No safe dark interval; automatic updates are paused.",
    acc_confirmed: "Last confirmed: {p}.", unknown: "unknown", stop: "Stop…",
    seg_target: "Target", seg_draft: "Draft", seg_today: "Today", seg_lamp: "Lamp",
    w_title: "Light", w_on: "On", w_off: "Off", w_off_at: "off at {t}", w_of_full: "{p}% of full power", w_fixed: "fixed levels",
    now: "Now", dark: "dark", on_at: "on at {t}", full: "full light", rising: "ramping up", falling: "ramping down",
    day_starts: "Day starts at", not_set: "not set", shift_to: "Shift to {h}",
    photoperiod: "Photoperiod", no_dark: "no dark period to shift", h: "h",
    moon: "Moon", rises: "rises", sets: "sets",
    moon_now: "moonlight now {p}%", moon_on: "moonlight on (up to {p}%)", moon_off: "moonlight off",
    align: "Align loaded profiles", channels: "Channels", linked: "Move together",
    slot_dark: "dark", slot_today: "today {p}%", of_max: "{p}% of full output",
    load: "Load a schedule…", cur_lamp: "Current lamp schedule", saved: "Saved profiles", presets: "Presets (bitbarista)",
    community: "(community)", legacy: "Original (legacy, lamp unknown)",
    save_as: "Save as…", delete: "Delete", really_delete: "Really delete \"{n}\"?",
    import: "Import QR", export: "Show QR", sync: "Sync clock", acclimate: "Acclimate…", moonlight: "Moonlight…",
    revert: "Revert", update_target: "Update target", apply_lamp: "Apply to lamp",
    no_changes: "No changes", unsaved: "Unsaved changes", update_pending: "Update pending",
    cancel: "Cancel", close: "Close",
    confirm_acc: "This becomes the new acclimation target. The lamp gets it right away at today's <b>{p}%</b>, then rises daily as planned.",
    confirm_lamp: "This rewrites the lamp's stored schedule and puts it in <b>auto</b> mode with the current time.",
    confirm_pause: "The lamp pauses for a few seconds and its output resets.", write: "Write to lamp",
    acc_intro: "Ramp up linearly to the <b>schedule in the editor</b> (the full target). Today's step is written now; after that {w}.",
    acc_intro_w: "the daily update window starts at {t}, in the target's dark interval",
    acc_intro_nw: "automatic updates require a dark interval in the target schedule",
    start_at: "Start at", over: "over", days: "days", start_acc: "Start acclimation",
    moon_intro: "Night-time light that follows the real moon over your home: brightness tracks the moon's illumination. {w} Daylight hours are never dimmed; the moon level is only used where it's brighter than your schedule.",
    moon_intro_w: "The daily update window starts at {t}, in the target's dark interval.",
    moon_intro_nw: "Automatic updates are paused until the target has a dark interval.",
    moon_enabled: "Moonlight on", moon_level: "Level at full moon", moon_follow: "Only while the moon is up",
    moon_share: "Share of the moon level per channel (0 = off):", moon_save: "Save moonlight",
    stop_q: "Stop the acclimation now?", keep_conf: "Keep confirmed {p}", go_full: "Go to the full schedule",
    profile_name: "Profile name", save: "Save",
    import_intro: "Paste the QR text, choose a screenshot or photo of the QR code, or scan it with the camera.",
    image: "Image…", camera: "Camera", stop_camera: "Stop camera", load_text: "Load text", copy: "Copy text",
    m_day_cleared: "Day start cleared.", m_day_is: "Day starts at {h}.", m_day_shift: "Draft shifted to start at {h}. Apply to send it to the lamp.",
    m_loaded_lamp: "Loaded the current schedule.", m_loaded: "Loaded into the draft.{n} Nothing changes on the lamp until you apply.",
    m_writing: "Writing schedule to the lamp…", m_acc_updated: "Acclimation target updated.",
    m_written: "Schedule written. The lamp is in auto mode.", m_same: "The lamp already had this schedule; nothing written.",
    m_reset_acc: "Draft reset to the acclimation target.", m_reset_lamp: "Draft reset to the lamp's schedule.",
    m_moon_range: "Level at full moon must be 1–50%.", m_moon_saving: "Saving moonlight…",
    m_moon_saved: "Moonlight saved; the lamp has tonight's moon.", m_moon_off: "Moonlight off.",
    m_shifted: "Draft shifted.{n} Apply to send it to the lamp.",
    m_acc_range: "Start must be 1–99% and duration 1–120 days.", m_acc_starting: "Starting acclimation…",
    m_acc_started: "Acclimation started at {s}% over {d} days.",
    m_acc_kept: "Acclimation stopped; the lamp keeps the reduced schedule.", m_acc_full: "Acclimation stopped; full schedule written.",
    m_synced: "Lamp clock set to Home Assistant's local time.", m_saved: "Saved profile \"{n}\".", m_deleted: "Deleted profile \"{n}\".",
    m_copied: "QR text copied.", m_qr_loaded: "QR code loaded into the draft.{n} Check it, then apply.",
    m_no_qr: "No QR code found in that image. Try a sharper or closer crop.",
    m_no_camera: "Camera not available here (needs HTTPS). Use an image instead.",
    m_aligned: " Shifted {d} h to start at {h}.",
  },
  nl: {
    title: "K7-schema", auto: "Auto", manual: "Handmatig", offline: "Offline",
    differs_target: "Concept wijkt af van doel", differs_lamp: "Concept wijkt af van lamp",
    matches_target: "Gelijk aan doel", matches_lamp: "Gelijk aan lamp",
    pending: "Er staat een update klaar. Die wordt in het volgende veilige moment opnieuw geprobeerd, of je stuurt hem nu.",
    loading: "Laden…",
    acc: "Acclimatisatie", acc_day: "dag {d} van {n}", acc_range: "{s}% → 100%, klaar op {e}",
    acc_window: "Dagelijkse update vanaf {t}.", acc_nowindow: "Geen veilige donkere periode; automatische updates staan stil.",
    acc_confirmed: "Laatst bevestigd: {p}.", unknown: "onbekend", stop: "Stop…",
    seg_target: "Doel", seg_draft: "Concept", seg_today: "Vandaag", seg_lamp: "Lamp",
    w_title: "Licht", w_on: "Aan", w_off: "Uit", w_off_at: "uit om {t}", w_of_full: "{p}% van vol vermogen", w_fixed: "vaste waarden",
    now: "Nu", dark: "donker", on_at: "aan om {t}", full: "vol licht", rising: "opkomst", falling: "afbouw",
    day_starts: "Dag begint om", not_set: "niet ingesteld", shift_to: "Verschuif naar {h}",
    photoperiod: "Fotoperiode", no_dark: "geen donkere periode", h: "u",
    moon: "Maan", rises: "op", sets: "onder",
    moon_now: "maanlicht nu {p}%", moon_on: "maanlicht aan (tot {p}%)", moon_off: "maanlicht uit",
    align: "Geladen profielen uitlijnen", channels: "Kanalen", linked: "Samen bewegen",
    slot_dark: "donker", slot_today: "vandaag {p}%", of_max: "{p}% van vol vermogen",
    load: "Schema laden…", cur_lamp: "Huidig lampschema", saved: "Opgeslagen profielen", presets: "Presets (bitbarista)",
    community: "(community)", legacy: "Origineel (oud, lamp onbekend)",
    save_as: "Opslaan als…", delete: "Verwijderen", really_delete: "\"{n}\" echt verwijderen?",
    import: "QR importeren", export: "QR tonen", sync: "Klok gelijkzetten", acclimate: "Acclimatiseren…", moonlight: "Maanlicht…",
    revert: "Herstel", update_target: "Doel bijwerken", apply_lamp: "Naar lamp sturen",
    no_changes: "Geen wijzigingen", unsaved: "Niet toegepaste wijzigingen", update_pending: "Update staat klaar",
    cancel: "Annuleren", close: "Sluiten",
    confirm_acc: "Dit wordt het nieuwe acclimatisatiedoel. De lamp krijgt het meteen op <b>{p}%</b> van vandaag en loopt daarna dagelijks op.",
    confirm_lamp: "Dit overschrijft het opgeslagen schema van de lamp en zet hem in <b>auto</b> met de huidige tijd.",
    confirm_pause: "De lamp hapert een paar seconden en begint opnieuw.", write: "Naar lamp schrijven",
    acc_intro: "Loop lineair op naar het <b>schema in de editor</b> (het volle doel). De stap van vandaag wordt nu geschreven; daarna {w}.",
    acc_intro_w: "begint de dagelijkse update om {t}, in de donkere periode van het doel",
    acc_intro_nw: "zijn automatische updates alleen mogelijk met een donkere periode in het doel",
    start_at: "Begin op", over: "in", days: "dagen", start_acc: "Acclimatisatie starten",
    moon_intro: "Nachtlicht dat de echte maan boven je huis volgt: de helderheid gaat mee met de verlichte maan. {w} Overdag wordt nooit gedimd; het maanniveau telt alleen waar het feller is dan je schema.",
    moon_intro_w: "De dagelijkse update begint om {t}, in de donkere periode van het doel.",
    moon_intro_nw: "Automatische updates staan stil tot het doel een donkere periode heeft.",
    moon_enabled: "Maanlicht aan", moon_level: "Niveau bij volle maan", moon_follow: "Alleen als de maan op is",
    moon_share: "Aandeel van het maanniveau per kanaal (0 = uit):", moon_save: "Maanlicht opslaan",
    stop_q: "Acclimatisatie nu stoppen?", keep_conf: "Bevestigde {p} houden", go_full: "Naar het volle schema",
    profile_name: "Naam van het profiel", save: "Opslaan",
    import_intro: "Plak de QR-tekst, kies een screenshot of foto van de QR-code, of scan hem met de camera.",
    image: "Afbeelding…", camera: "Camera", stop_camera: "Camera stoppen", load_text: "Tekst laden", copy: "Tekst kopiëren",
    m_day_cleared: "Dagstart gewist.", m_day_is: "De dag begint om {h}.", m_day_shift: "Concept verschoven naar start om {h}. Stuur het naar de lamp om het toe te passen.",
    m_loaded_lamp: "Huidig schema geladen.", m_loaded: "In het concept geladen.{n} Er verandert pas iets aan de lamp als je het toepast.",
    m_writing: "Schema naar de lamp schrijven…", m_acc_updated: "Acclimatisatiedoel bijgewerkt.",
    m_written: "Schema geschreven. De lamp staat op auto.", m_same: "De lamp had dit schema al; niets geschreven.",
    m_reset_acc: "Concept teruggezet naar het acclimatisatiedoel.", m_reset_lamp: "Concept teruggezet naar het lampschema.",
    m_moon_range: "Niveau bij volle maan moet 1–50% zijn.", m_moon_saving: "Maanlicht opslaan…",
    m_moon_saved: "Maanlicht opgeslagen; de lamp heeft de maan van vannacht.", m_moon_off: "Maanlicht uit.",
    m_shifted: "Concept verschoven.{n} Stuur het naar de lamp om het toe te passen.",
    m_acc_range: "Begin moet 1–99% zijn en de duur 1–120 dagen.", m_acc_starting: "Acclimatisatie starten…",
    m_acc_started: "Acclimatisatie gestart op {s}% over {d} dagen.",
    m_acc_kept: "Acclimatisatie gestopt; de lamp houdt het verlaagde schema.", m_acc_full: "Acclimatisatie gestopt; volle schema geschreven.",
    m_synced: "Klok van de lamp gelijkgezet met Home Assistant.", m_saved: "Profiel \"{n}\" opgeslagen.", m_deleted: "Profiel \"{n}\" verwijderd.",
    m_copied: "QR-tekst gekopieerd.", m_qr_loaded: "QR-code in het concept geladen.{n} Controleer het en pas het toe.",
    m_no_qr: "Geen QR-code gevonden in die afbeelding. Probeer een scherpere of kleinere uitsnede.",
    m_no_camera: "Camera niet beschikbaar (vereist HTTPS). Gebruik een afbeelding.",
    m_aligned: " {d} u verschoven naar start om {h}.",
  },
};

const loaded = {};
function loadScript(path, globalName) {
  if (window[globalName]) return Promise.resolve();
  if (!loaded[path]) {
    loaded[path] = new Promise((resolve, reject) => {
      const s = document.createElement("script");
      s.src = `${BASE}/${path}?v=${VERSION}`;
      s.onload = resolve;
      s.onerror = () => reject(new Error(`Could not load ${path}`));
      document.head.appendChild(s);
    });
  }
  return loaded[path];
}

const clone = (x) => JSON.parse(JSON.stringify(x));
const clamp = (v) => Math.max(0, Math.min(100, Math.round(Number(v) || 0)));
const pad = (n) => String(n).padStart(2, "0");
const rowsKey = (d) => JSON.stringify([d.manual, d.schedule]);
const esc = (s) => String(s).replace(/[&<>"']/g, (c) =>
  ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));

// Mirrors protocol.py day_start / photoperiod / shift_rows / align_day_start.
const lit = (r) => r.slice(2).some((v) => v > 0);
const sortRows = (s) => [...s].sort((a, b) => a[0] - b[0] || a[1] - b[1]);
const activeRows = (s) => sortRows([...new Map(s.filter((r) => r.some((v) => v !== 0))
  .map((r) => [r[0] * 60 + r[1], r])).values()]);
const fmtHour = (h) => `${pad(Math.floor(h))}:${pad(Math.round((h % 1) * 60))}`;
function dayStart(schedule) {
  const rows = activeRows(schedule);
  for (let i = 0; i < rows.length; i++) {
    if (lit(rows[i]) && !lit(rows[(i - 1 + rows.length) % rows.length])) return rows[i][0] + rows[i][1] / 60;
  }
  return null;
}
function photoperiod(schedule) {
  const start = dayStart(schedule);
  if (start === null) return null;
  const rows = activeRows(schedule);
  const idx = rows.findIndex((r, i) => lit(r) && !lit(rows[(i - 1 + rows.length) % rows.length]));
  for (let k = 1; k <= rows.length; k++) {
    const r = rows[(idx + k) % rows.length];
    if (!lit(r)) return [start, r[0] + r[1] / 60];
  }
  return null;
}
function shiftRows(schedule, hours) {
  const delta = Math.round(hours * 60);
  const shiftedMinute = (r) => ((r[0] * 60 + r[1] + delta) % 1440 + 1440) % 1440;
  const active = activeRows(schedule);
  active.forEach((r, i) => {
    if (shiftedMinute(r) === 0 && !lit(r)
      && (lit(active[(i - 1 + active.length) % active.length]) || lit(active[(i + 1) % active.length]))) {
      throw new Error("Cannot shift a dark boundary to 00:00: K7 treats it as a disabled slot");
    }
  });
  return sortRows(schedule.map((r) => {
    if (!r.some((v) => v !== 0)) return [...r];
    const minute = shiftedMinute(r);
    return [Math.floor(minute / 60), minute % 60, ...r.slice(2)];
  }));
}
function alignDayStart(schedule, hour) {
  const cur = dayStart(schedule);
  return cur === null ? clone(schedule) : shiftRows(schedule, hour - cur);
}
const fmtTime = (iso, locale) => (iso ? new Date(iso).toLocaleTimeString(locale || [], { hour: "2-digit", minute: "2-digit" }) : "—");
const fmtDate = (day, locale) => { const d = new Date(`${day}T12:00:00`); return isNaN(d) ? day : d.toLocaleDateString(locale || [], { day: "numeric", month: "short" }); };

// The lamp runs on HA's local time, so "now" uses HA's time zone rather than the browser's.
function nowHours(timeZone, date = new Date()) {
  try {
    const parts = new Intl.DateTimeFormat("en-GB", { timeZone, hour: "2-digit", minute: "2-digit", hourCycle: "h23" })
      .formatToParts(date);
    const get = (t) => Number(parts.find((p) => p.type === t)?.value);
    return get("hour") + get("minute") / 60;
  } catch {
    return date.getHours() + date.getMinutes() / 60;
  }
}
// Index of the row in effect at `hours`: the latest row at or before it (first of duplicates), else the last row.
function slotAt(schedule, hours) {
  const minute = Math.floor(hours * 60);
  let best = -1;
  let bestMin = -1;
  let last = 0;
  let lastMin = -1;
  schedule.forEach((r, i) => {
    const m = r[0] * 60 + r[1];
    if (m <= minute && m > bestMin) { best = i; bestMin = m; }
    if (m > lastMin) { last = i; lastMin = m; }
  });
  return best >= 0 ? best : last;
}

function hexToRgb(h) {
  const n = parseInt(h.slice(1), 16);
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
}
function blend(levels) {
  // Additive mix of the channel colours, brightness set by the strongest channel.
  const rgb = [0, 0, 0];
  levels.forEach((v, i) => hexToRgb(COLORS[i]).forEach((c, k) => (rgb[k] += c * v)));
  const peak = Math.max(...rgb);
  if (!peak) return "rgb(0,0,0)";
  const scale = (255 * Math.max(...levels)) / 100 / peak;
  return `rgb(${rgb.map((c) => Math.round(c * scale)).join(",")})`;
}

const MOON_NL = { "New moon": "Nieuwe maan", "Waxing crescent": "Wassende sikkel", "First quarter": "Eerste kwartier",
  "Waxing gibbous": "Wassende maan", "Full moon": "Volle maan", "Waning gibbous": "Afnemende maan",
  "Last quarter": "Laatste kwartier", "Waning crescent": "Afnemende sikkel" };
const CHANNEL_NL = { White: "Wit", "Royal Blue": "Royal blue", Green: "Groen", UV: "UV", Cyan: "Cyaan", Red: "Rood" };

// Channel levels at `hours`, interpolated between the active rows the way the lamp ramps, wrapping over midnight.
function levelsAt(rows, hours) {
  const act = activeRows(rows || []);
  if (!act.length) return Array(rows?.[0] ? rows[0].length - 2 : 6).fill(0);
  if (act.length === 1) return act[0].slice(2);
  const t = act.map((r) => r[0] + r[1] / 60);
  let i = -1;
  t.forEach((x, k) => { if (x <= hours) i = k; });
  const prev = i >= 0 ? i : act.length - 1;
  const next = (prev + 1) % act.length;
  const t0 = i >= 0 ? t[prev] : t[prev] - 24;
  const t1 = t[next] > t0 ? t[next] : t[next] + 24;
  const f = (hours - t0) / (t1 - t0);
  return act[prev].slice(2).map((v, c) => v + (act[next][c + 2] - v) * f);
}
// Sample points for the chart: midnight at both ends plus every row time of the given schedules.
function sampleTimes(lists) {
  const set = new Set([0, 24]);
  lists.forEach((rows) => activeRows(rows || []).forEach((r) => set.add(r[0] + r[1] / 60)));
  return [...set].sort((a, b) => a - b);
}
// Monotone cubic curve through the points (Fritsch-Carlson): smooth, but never above or below the real values.
function mono(pts) {
  const n = pts.length;
  if (n < 2) return "";
  const dx = [], m = [], t = [];
  for (let i = 0; i < n - 1; i++) { dx[i] = pts[i + 1][0] - pts[i][0]; m[i] = (pts[i + 1][1] - pts[i][1]) / dx[i]; }
  t[0] = m[0]; t[n - 1] = m[n - 2];
  for (let i = 1; i < n - 1; i++) t[i] = m[i - 1] * m[i] <= 0 ? 0 : (m[i - 1] + m[i]) / 2;
  for (let i = 0; i < n - 1; i++) {
    if (m[i] === 0) { t[i] = 0; t[i + 1] = 0; continue; }
    const a = t[i] / m[i], b = t[i + 1] / m[i], q = a * a + b * b;
    if (q > 9) { const k = 3 / Math.sqrt(q); t[i] = k * a * m[i]; t[i + 1] = k * b * m[i]; }
  }
  let d = "";
  for (let i = 0; i < n - 1; i++) {
    const h = dx[i] / 3;
    d += `C${(pts[i][0] + h).toFixed(1)},${(pts[i][1] + t[i] * h).toFixed(1)} ${(pts[i + 1][0] - h).toFixed(1)},${(pts[i + 1][1] - t[i + 1] * h).toFixed(1)} ${pts[i + 1][0].toFixed(1)},${pts[i + 1][1].toFixed(1)}`;
  }
  return d;
}
// Strip cell: hue of the mix, more opaque as the light gets stronger.
function cellColor(levels) {
  const c = lightColor(levels);
  if (!c) return "";
  const a = 0.22 + 0.78 * Math.min(1, Math.max(...levels) / 50);
  return c.replace("rgb(", "rgba(").replace(")", `,${a.toFixed(2)})`);
}
// Hue of the mixed light at full brightness, or null when everything is off.
function lightColor(levels) {
  const rgb = [0, 0, 0];
  levels.forEach((v, i) => hexToRgb(COLORS[i] || "#ffffff").forEach((c, k) => (rgb[k] += c * v)));
  const peak = Math.max(...rgb);
  return peak ? `rgb(${rgb.map((c) => Math.round((c / peak) * 255)).join(",")})` : null;
}

class K7ScheduleCard extends HTMLElement {
  setConfig(config) {
    this._config = config || {};
  }

  static getStubConfig() {
    return {};
  }

  getCardSize() {
    return 9;
  }

  getGridOptions() {
    return { columns: "full", min_columns: 6 };
  }

  set hass(hass) {
    this._hass = hass;
    if (!this._started) {
      this._started = true;
      this._last = Date.now();
      this._init();
    } else if (this._draft && !this._panel && Date.now() - this._last > 60000) {
      // Pick up lamp changes (mode, availability, schedule edited in the app).
      this._last = Date.now();
      const before = JSON.stringify(this._lamp);
      this._refresh().then(() => {
        if (JSON.stringify(this._lamp) !== before && !this._panel) {
          this._followBaseline(before);
          this._render();
        }
      }).catch(() => {});
    }
    // Follow a theme switch; otherwise move the "now" marker once a minute without rebuilding the card.
    if (this._draft && this._darkSeen !== undefined && this._dark() !== this._darkSeen) return this._render();
    const minute = Math.floor(Date.now() / 60000);
    if (this._draft && minute !== this._nowMinute) {
      this._nowMinute = minute;
      this._drawChart();
      const now = this.shadowRoot?.querySelector(".now");
      if (now) now.innerHTML = this._nowText();
    }
  }

  // An untouched draft follows a target/lamp schedule changed elsewhere; an edited draft is left alone.
  _followBaseline(beforeJson) {
    if (!this._draft || !beforeJson) return;
    const old = JSON.parse(beforeJson);
    const oldBase = old?.program && old.target ? old.target : { manual: old?.manual, schedule: old?.schedule };
    if (rowsKey(this._draft) === rowsKey(oldBase)) this._draft = clone(this._baseline());
  }

  _now() {
    return nowHours(this._hass?.config?.time_zone);
  }

  async _init() {
    this.attachShadow({ mode: "open" });
    this._channels = ["White", "Royal Blue", "Green", "UV", "Cyan", "Red"];
    this._visible = this._channels.map(() => true);
    this._linked = false;
    this._view = "draft"; // or "lamp": what the lamp runs (today's acclimation step, moonlight)
    this._slot = 12;
    this._cameraRequest = 0;
    this._panel = null; // "import" | "export" | "save" | "confirm"
    this._msg = null;
    this._render();
    try {
      await Promise.all([this._refresh(), this._loadPresets()]);
      this._draft = clone(this._baseline());
      this._slot = slotAt(this._draft.schedule, this._now());
      this._render();
    } catch (err) {
      this._error(err);
    }
  }

  async _ws(msg) {
    return this._hass.callWS(msg);
  }

  async _refresh() {
    const data = await this._ws({ type: "k7_lamp/get" });
    this._channels = data.channels;
    this._profiles = data.profiles;
    const want = this._config.entry_id;
    this._lamp = data.lamps.find((l) => !want || l.entry_id === want) || null;
    if (!this._lamp) throw new Error("No K7 lamp is loaded");
  }

  async _loadPresets() {
    try {
      const r = await fetch(`${BASE}/presets.json?v=${VERSION}`);
      this._presets = (await r.json()).presets || [];
    } catch {
      this._presets = [];
    }
  }

  _lampData() {
    return { manual: this._lamp.manual, schedule: this._lamp.schedule };
  }

  _acc() {
    return this._lamp?.acclimation || null;
  }

  // What the draft is compared with: HA's target when a program (acclimation/moonlight) runs, else the lamp.
  _baseline() {
    return this._lamp?.program && this._lamp.target ? this._lamp.target : this._lampData();
  }

  _moonOn() {
    return !!this._lamp?.moon?.config?.enabled;
  }

  // Shift a freshly loaded schedule to the stored day start (unless turned off).
  _aligned(schedule) {
    const want = this._lamp?.day_start;
    if (want === null || want === undefined || this._keepTimes) return { schedule, note: "" };
    const cur = dayStart(schedule);
    if (cur === null || cur === want) return { schedule, note: "" };
    const diff = Math.round((((want - cur + 36) % 24) - 12) * 100) / 100;
    return { schedule: alignDayStart(schedule, want),
             note: this._t("m_aligned", { d: `${diff > 0 ? "+" : ""}${diff}`, h: `${pad(want)}:00` }) };
  }

  _dirty() {
    return this._draft && this._lamp && rowsKey(this._draft) !== rowsKey(this._baseline());
  }

  _updateLamp(res) {
    this._lamp = res.lamps.find((l) => l.entry_id === this._lamp.entry_id) || this._lamp;
  }

  _error(err) {
    this._msg = { kind: "error", text: err?.message || String(err) };
    this._render();
  }

  _info(text) {
    this._msg = { kind: "info", text };
    this._render();
  }

  _setPanel(panel) {
    if (this._panel === "import" && panel !== "import") this._stopCamera();
    this._panel = panel;
  }

  // ---------- rendering ----------

  _lang() {
    return String(this._hass?.locale?.language || this._hass?.language || "en").startsWith("nl") ? "nl" : "en";
  }

  _locale() {
    return this._hass?.locale?.language || this._hass?.language || undefined;
  }

  _t(key, vars = {}) {
    const s = STRINGS[this._lang()][key] ?? STRINGS.en[key] ?? key;
    return s.replace(/\{(\w+)\}/g, (_, k) => (vars[k] ?? ""));
  }

  _chName(i) {
    const name = this._channels[i];
    return this._lang() === "nl" ? (CHANNEL_NL[name] || name) : name;
  }

  _dark() {
    return this._hass?.themes?.darkMode !== false;
  }

  _colors() {
    return CHANNEL_COLORS[this._dark() ? "dark" : "light"];
  }

  _stack() {
    return this._channels.length === 6 ? STACK : this._channels.map((_, i) => i);
  }

  // The chart can show the draft or what the lamp runs (today's acclimation step, moonlight).
  _segShown() {
    return !!this._lamp?.schedule && (!!this._lamp.program || this._dirty());
  }

  _viewRows() {
    return this._segShown() && this._view === "lamp" ? this._lamp.schedule : this._draft.schedule;
  }

  _render() {
    const root = this.shadowRoot;
    if (!root) return;
    const ready = !!this._draft;
    const lamp = this._lamp;
    this._darkSeen = this._dark();
    root.innerHTML = `
      <style>${STYLE}</style>
      <ha-card class="${this._dark() ? "dark" : "light"}">
        <div class="head">
          <div class="title">${esc(this._config.title || lamp?.title || this._t("title"))}</div>
          ${lamp ? `<span class="pill ${lamp.available ? "" : "bad"}"><i></i>${lamp.available ? this._t(lamp.auto ? "auto" : "manual") : this._t("offline")}</span>` : ""}
          ${ready ? `<span class="pill ${this._dirty() ? "warn" : "ok"}"><i></i>${this._dirty()
            ? this._t(this._acc() ? "differs_target" : "differs_lamp")
            : this._t(this._lamp?.program ? "matches_target" : "matches_lamp")}</span>` : ""}
        </div>
        ${this._msg ? `<div class="msg ${this._msg.kind}"><span>${esc(this._msg.text)}</span><button class="x" data-act="dismiss" aria-label="${this._t("close")}">×</button></div>` : ""}
        ${lamp?.program_error ? `<div class="msg error"><span>${esc(lamp.program_error)}</span></div>` : ""}
        ${lamp?.pending ? `<div class="msg"><span>${this._t("pending")}</span></div>` : ""}
        ${ready && this._acc() ? this._accBanner() : ""}
        ${ready ? this._body() : `<div class="loading">${this._t("loading")}</div>`}
      </ha-card>`;
    if (ready) {
      this._bind();
      this._drawChart();
      this._observe();
    } else {
      root.querySelector("[data-act=dismiss]")?.addEventListener("click", () => {
        this._msg = null;
        this._render();
      });
    }
  }

  _accBanner() {
    const a = this._acc();
    const pct = Math.max(0, Math.min(100, a.percent));
    const confirmed = a.applied_percent == null ? this._t("unknown") : `${a.applied_percent}%`;
    return `<div class="acc">
      <div class="t">${this._t("acc")} <span>· ${this._t("acc_day", { d: a.day, n: a.days })} ·</span> <em>${a.percent}%</em></div>
      <div class="progress"><b style="width:${pct}%"></b></div>
      <div class="s">${this._t("acc_range", { s: a.start_percent, e: esc(fmtDate(a.ends, this._locale())) })} · ${this._t("acc_confirmed", { p: confirmed })}
        ${this._lamp.rebuild_time ? this._t("acc_window", { t: this._lamp.rebuild_time }) : this._t("acc_nowindow")}</div>
      <button class="btn tint" data-act="acc-stop">${this._t("stop")}</button></div>`;
  }

  _settings() {
    const period = photoperiod(this._draft.schedule);
    const pref = this._lamp.day_start;
    const cur = period ? period[0] : null;
    const opts = [`<option value="" ${pref == null ? "selected" : ""}>${this._t("not_set")}</option>`]
      .concat(Array.from({ length: 24 }, (_, h) =>
        `<option value="${h}" ${pref === h ? "selected" : ""}>${pad(h)}:00</option>`)).join("");
    const len = period ? ((period[1] - period[0] + 24) % 24 || 24) : 0;
    const m = this._lamp.moon;
    let moon = "";
    if (m) {
      const cfg = m.config;
      const status = cfg.enabled
        ? (m.level_now > 0 ? this._t("moon_now", { p: m.level_now }) : this._t("moon_on", { p: cfg.max_level }))
        : this._t("moon_off");
      moon = `<div class="item"><span class="lbl">${this._t("moon")}</span><span class="val">${m.icon} ${esc(this._lang() === "nl" ? (MOON_NL[m.phase_name] || m.phase_name) : m.phase_name)} · ${m.illumination}% ·
        ${this._t("rises")} ${fmtTime(m.next_rise, this._locale())} · ${this._t("sets")} ${fmtTime(m.next_set, this._locale())} · ${status}</span></div>`;
    }
    return `<div class="group">
      <div class="item"><span class="lbl">${this._t("day_starts")}</span>
        ${pref != null && cur !== null && cur !== pref ? `<button class="btn small" data-act="align">${this._t("shift_to", { h: `${pad(pref)}:00` })}</button>` : ""}
        <select class="ios" data-act="daystart" ${cur === null ? "disabled" : ""}>${opts}</select></div>
      <div class="item"><span class="lbl">${this._t("photoperiod")}</span><span class="val">${period
        ? `${fmtHour(period[0])} – ${fmtHour(period[1])} · ${Math.round(len * 100) / 100} ${this._t("h")}` : this._t("no_dark")}</span></div>
      ${moon}
      <div class="item"><span class="lbl">${this._t("align")}</span>
        <label class="sw"><input type="checkbox" data-act="keeptimes" ${this._keepTimes ? "" : "checked"}><b></b></label></div>
    </div>`;
  }

  // "Now 14:10 · full light" for the series the chart shows.
  _nowText() {
    const rows = this._viewRows();
    const now = this._now();
    const sum = (lv) => lv.reduce((a, v, i) => a + (this._visible[i] ? v : 0), 0);
    const total = sum(levelsAt(rows, now));
    const head = `<b>${this._t("now")} ${fmtHour(now)}</b>`;
    if (total < 0.5) {
      const p = photoperiod(rows);
      return `${head} · ${this._t("dark")}${p ? ` · ${this._t("on_at", { t: fmtHour(p[0]) })}` : ""}`;
    }
    const peak = Math.max(...sampleTimes([rows]).map((x) => sum(levelsAt(rows, x))));
    const pct = peak ? total / peak : 1;
    if (pct >= 0.99) return `${head} · ${this._t("full")} · ${Math.round(total / (this._channels.length || 6))}%`;
    const later = sum(levelsAt(rows, now + 0.25));
    return `${head} · ${this._t(later >= total ? "rising" : "falling")} · ${Math.round(total / (this._channels.length || 6))}%`;
  }

  _body() {
    const d = this._draft;
    const cols = this._colors();
    const nowSlot = slotAt(d.schedule, this._now());
    const sel = this._slotIndex();
    const strip = d.schedule
      .map((r, i) => `<button class="cell ${i === sel ? "sel" : ""} ${i === nowSlot ? "now" : ""}" data-slot="${i}"
          style="${lit(r) ? `background:${cellColor(r.slice(2))}` : ""}" title="${pad(r[0])}:${pad(r[1])}"><span>${pad(r[0])}</span></button>`)
      .join("");
    const chips = this._channels
      .map((c, i) => `<button class="chan ${this._visible[i] ? "" : "off"}" data-ch="${i}" aria-pressed="${this._visible[i]}"
          style="--c:${cols[i]}"><i></i>${esc(this._chName(i))}</button>`)
      .join("");
    const row = d.schedule[sel];
    // Lamp output: the mean of the channels, so 100 % means every channel at full power.
    const total = row.slice(2).reduce((a, b) => a + b, 0);
    const output = Math.round(total / (row.length - 2));
    const acc = this._acc();
    const sliders = this._channels
      .map((c, i) => `<div class="sl"><span class="n ${this._visible[i] ? "" : "off"}" style="--c:${cols[i]}"><i></i>${esc(this._chName(i))}</span>
          <input type="range" min="0" max="100" value="${row[i + 2]}" data-lv="${i}" style="--c:${cols[i]};--p:${row[i + 2]}%">
          <input class="num" type="number" min="0" max="100" value="${row[i + 2]}" data-num="${i}"></div>`)
      .join("");
    const profileOpts = Object.keys(this._profiles || {})
      .map((n) => `<option value="p:${esc(n)}" ${this._source === `p:${n}` ? "selected" : ""}>${esc(n === "Original (from lamp)" ? this._t("legacy") : n)}</option>`)
      .join("");
    const presetOpts = (this._presets || [])
      .map((p, i) => `<option value="b:${i}">${esc(p.name)}${p.source === "community" ? ` ${this._t("community")}` : ""}</option>`)
      .join("");
    const seg = this._segShown()
      ? `<div class="seg" role="tablist">
          <button data-act="view-draft" class="${this._view !== "lamp" ? "on" : ""}">${this._t(this._lamp.program ? "seg_target" : "seg_draft")}</button>
          <button data-act="view-lamp" class="${this._view === "lamp" ? "on" : ""}">${this._t(acc ? "seg_today" : "seg_lamp")}${acc ? `<span>${acc.percent}%</span>` : ""}</button>
        </div>` : "";
    const canApply = (this._dirty() || this._lamp.pending) && this._lamp.available;
    return `
      <div class="charthead"><div class="now">${this._nowText()}</div>
        ${seg ? `<span class="legend"><i></i>${this._t(this._view === "lamp" ? (this._lamp.program ? "seg_target" : "seg_draft") : (acc ? "seg_today" : "seg_lamp"))}</span>` : ""}${seg}</div>
      <div class="chart"><svg aria-hidden="true"></svg><div class="tip"></div></div>
      <div class="strip" style="grid-template-columns:repeat(${d.schedule.length},1fr)">${strip}</div>
      ${this._settings()}
      <div class="sec"><b>${this._t("channels")}</b>
        <label class="link">${this._t("linked")}<span class="sw sm"><input type="checkbox" data-act="link" ${this._linked ? "checked" : ""}><b></b></span></label></div>
      <div class="chans">${chips}</div>
      <div class="slot">
        <div class="top"><h3>${pad(row[0])}:${pad(row[1])}</h3>
          <span class="s">${total ? `${this._t("of_max", { p: output })}${acc ? ` · ${this._t("slot_today", { p: Math.round(total * acc.percent / 100 / (row.length - 2)) })}` : ""}` : this._t("slot_dark")}</span>
          <div class="nav"><button class="btn sq" data-act="prev" aria-label="‹">‹</button><button class="btn sq" data-act="next" aria-label="›">›</button></div></div>
        ${sliders}
      </div>
      <div class="prof">
        <select class="ios" data-act="pick">
          <option value="">${this._t("load")}</option>
          <option value="lamp">${this._t("cur_lamp")}</option>
          ${this._lamp.original ? `<option value="original">${esc(this._lamp.original.name)}</option>` : ""}
          ${profileOpts ? `<optgroup label="${this._t("saved")}">${profileOpts}</optgroup>` : ""}
          ${presetOpts ? `<optgroup label="${this._t("presets")}">${presetOpts}</optgroup>` : ""}
        </select>
        <span class="grow"></span>
        <button class="btn" data-act="save">${this._t("save_as")}</button>
        <button class="btn ghost" data-act="delete" ${this._selectedProfile() ? "" : "disabled"}>${this._t("delete")}</button>
      </div>
      <div class="foot">
        <button class="btn" data-act="import">${this._t("import")}</button>
        <button class="btn" data-act="export">${this._t("export")}</button>
        <button class="btn" data-act="sync">${this._t("sync")}</button>
        <button class="btn" data-act="acc" ${acc ? "disabled" : ""}>${this._t("acclimate")}</button>
        <button class="btn" data-act="moon">${this._t("moonlight")}</button>
      </div>
      ${this._panelHtml()}
      <div class="applyrow">
        <span class="hint">${this._t(this._dirty() ? "unsaved" : this._lamp.pending ? "update_pending" : "no_changes")}</span>
        <button class="btn ghost" data-act="revert" ${this._dirty() ? "" : "disabled"}>${this._t("revert")}</button>
        <button class="btn primary" data-act="apply" ${canApply ? "" : "disabled"}>${this._lamp.program ? this._t("update_target") : this._t("apply_lamp")}</button>
      </div>`;
  }

  _panelHtml() {
    const cols = this._colors();
    switch (this._panel) {
      case "confirm":
        return `<div class="panel">
          <p>${this._acc() ? this._t("confirm_acc", { p: this._acc().percent }) : this._t("confirm_lamp")} ${this._t("confirm_pause")}</p>
          <div class="row"><span class="grow"></span><button class="btn" data-act="cancel">${this._t("cancel")}</button>
          <button class="btn primary" data-act="apply-yes">${this._t("write")}</button></div></div>`;
      case "acc":
        return `<div class="panel">
          <p>${this._t("acc_intro", { w: this._lamp.rebuild_time ? this._t("acc_intro_w", { t: this._lamp.rebuild_time }) : this._t("acc_intro_nw") })}</p>
          <div class="row">
            <label>${this._t("start_at")} <input class="field" type="number" min="1" max="99" value="50" data-act="acc-start"> %</label>
            <label>${this._t("over")} <input class="field" type="number" min="1" max="120" value="30" data-act="acc-days"> ${this._t("days")}</label>
            <span class="grow"></span>
            <button class="btn" data-act="cancel">${this._t("cancel")}</button><button class="btn primary" data-act="acc-go">${this._t("start_acc")}</button>
          </div></div>`;
      case "moon": {
        const cfg = this._lamp.moon?.config || {};
        const w = cfg.channels || {};
        const chans = this._channels.map((c, i) => `<label class="mch"><i style="--c:${cols[i]}"></i>${esc(this._chName(i))}
            <input class="field" type="number" min="0" max="100" value="${w[i] ?? w[String(i)] ?? 0}" data-moonch="${i}">%</label>`).join("");
        return `<div class="panel">
          <p>${this._t("moon_intro", { w: this._lamp.rebuild_time ? this._t("moon_intro_w", { t: this._lamp.rebuild_time }) : this._t("moon_intro_nw") })}</p>
          <div class="row">
            <label class="tog"><span class="sw sm"><input type="checkbox" data-moon="enabled" ${cfg.enabled ? "checked" : ""}><b></b></span>${this._t("moon_enabled")}</label>
            <label>${this._t("moon_level")} <input class="field" type="number" min="1" max="50" value="${cfg.max_level ?? 15}" data-moon="max_level"> %</label>
            <label class="tog"><span class="sw sm"><input type="checkbox" data-moon="follow_moon" ${cfg.follow_moon !== false ? "checked" : ""}><b></b></span>${this._t("moon_follow")}</label>
          </div>
          <div class="muted">${this._t("moon_share")}</div>
          <div class="row mchs">${chans}</div>
          <div class="row"><span class="grow"></span><button class="btn" data-act="cancel">${this._t("cancel")}</button>
          <button class="btn primary" data-act="moon-save">${this._t("moon_save")}</button></div></div>`;
      }
      case "acc-stop": {
        const kept = this._acc()?.applied_percent;
        return `<div class="panel">
          <p>${this._t("stop_q")}</p>
          <div class="row"><span class="grow"></span><button class="btn" data-act="cancel">${this._t("cancel")}</button>
          <button class="btn" data-act="acc-keep" ${kept == null ? "disabled" : ""}>${this._t("keep_conf", { p: kept == null ? this._t("unknown") : `${kept}%` })}</button>
          <button class="btn primary" data-act="acc-full">${this._t("go_full")}</button></div></div>`;
      }
      case "save":
        return `<div class="panel"><div class="row">
          <input class="field wide" type="text" data-act="name" placeholder="${this._t("profile_name")}" value="${esc(this._selectedProfile() || "")}">
          <button class="btn" data-act="cancel">${this._t("cancel")}</button><button class="btn primary" data-act="save-yes">${this._t("save")}</button></div></div>`;
      case "import":
        return `<div class="panel">
          <p>${this._t("import_intro")}</p>
          <textarea data-act="qrtext" rows="3" placeholder="323232323232#0000…"></textarea>
          <div class="row">
            <label class="btn">${this._t("image")}<input type="file" accept="image/*" data-act="qrfile" hidden></label>
            <button class="btn" data-act="camera">${this._t(this._stream ? "stop_camera" : "camera")}</button>
            <span class="grow"></span>
            <button class="btn" data-act="cancel">${this._t("close")}</button><button class="btn primary" data-act="qrload">${this._t("load_text")}</button>
          </div>
          <video playsinline muted ${this._stream ? "" : "hidden"}></video></div>`;
      case "export":
        return `<div class="panel">
          <div class="qr"></div>
          <textarea readonly rows="3">${esc(this._qrPayload || "")}</textarea>
          <div class="row"><span class="grow"></span><button class="btn" data-act="copy">${this._t("copy")}</button>
          <button class="btn" data-act="cancel">${this._t("close")}</button></div></div>`;
      default:
        return "";
    }
  }

  _slotIndex() {
    return Math.max(0, Math.min(this._slot ?? 0, this._draft.schedule.length - 1));
  }

  _selectedProfile() {
    return this._source?.startsWith("p:") ? this._source.slice(2) : null;
  }

  // [start, end) in hours for each row: until the next row in time, the last one until 24:00.
  _spans(schedule) {
    const t = schedule.map((r) => r[0] + r[1] / 60);
    return t.map((x) => [x, t.filter((y) => y > x).reduce((a, b) => Math.min(a, b), 24)]);
  }

  // Redraw the chart when the card changes width (the SVG is drawn at its real size, not scaled).
  _observe() {
    const wrap = this.shadowRoot.querySelector(".chart");
    if (!wrap || typeof ResizeObserver === "undefined") return;
    this._ro?.disconnect();
    this._ro = new ResizeObserver(() => {
      if (Math.round(wrap.clientWidth) !== this._geo?.W) this._drawChart();
    });
    this._ro.observe(wrap);
  }

  _switchView(view) {
    if (view === this._view) return;
    this._tween = { from: this._lastSamples, t0: performance.now() };
    this._view = view;
    this._render();
  }

  _drawChart() {
    const root = this.shadowRoot;
    const wrap = root?.querySelector(".chart");
    const svg = wrap?.querySelector("svg");
    if (!svg) return;
    const W = Math.max(280, Math.round(wrap.clientWidth || 640));
    const H = W < 500 ? 190 : 220;
    const L = 2, R = 2, TOP = 26, BOT = 22;
    const cols = this._colors();
    const dark = this._dark();
    const draft = this._draft.schedule;
    const lampRows = this._lamp?.schedule;
    const seg = this._segShown();
    const shown = this._viewRows();
    const other = seg ? (shown === draft ? lampRows : draft) : null;
    const xs = sampleTimes([draft, lampRows].filter(Boolean));
    let S = xs.map((x) => levelsAt(shown, x));
    const tw = this._tween;
    if (tw?.from?.length === S.length) {
      const k = Math.min(1, (performance.now() - tw.t0) / 420);
      const e = 1 - Math.pow(1 - k, 3);
      const target = S;
      S = target.map((lv, i) => lv.map((v, c) => tw.from[i][c] + (v - tw.from[i][c]) * e));
      if (k < 1) requestAnimationFrame(() => this._drawChart());
      else { this._tween = null; S = target; }
    } else this._tween = null;
    this._lastSamples = S;
    const vis = this._visible;
    const sum = (lv) => lv.reduce((a, v, i) => a + (vis[i] ? v : 0), 0);
    const peak = Math.max(...[draft, shown].map((rows) => Math.max(...xs.map((x) => sum(levelsAt(rows, x))))));
    // The stack adds up channel levels; the axis shows lamp output (mean of the channels, 100 % = all at full power).
    const n = this._channels.length || 6;
    const outMax = Math.min(100, Math.max(10, Math.ceil((peak / n) * 1.12 / 10) * 10));
    const yMax = outMax * n;
    const X = (h) => L + ((W - L - R) * h) / 24;
    const Y = (v) => H - BOT - ((H - BOT - TOP) * v) / yMax;
    const P = (x, y) => `${x.toFixed(1)},${y.toFixed(1)}`;
    const line = (pts) => `M${P(...pts[0])}${mono(pts)}`;
    this._geo = { W, H, L, R, TOP, BOT, yMax, n, shown };

    // Ambient light: the mixed light colour of each moment, very soft, fading out upwards.
    const amb = xs.map((x, i) => {
      const c = lightColor(S[i]);
      const a = c ? Math.min(dark ? 0.22 : 0.14, sum(S[i]) / 600) : 0;
      return `<stop offset="${(x / 24).toFixed(4)}" stop-color="${c || "#000"}" stop-opacity="${a.toFixed(3)}"/>`;
    }).join("");
    const grads = this._stack().map((c) => `<linearGradient id="k7g${c}" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0" stop-color="${cols[c]}" stop-opacity="${dark ? 0.95 : 0.9}"/>
        <stop offset="1" stop-color="${cols[c]}" stop-opacity="${dark ? 0.35 : 0.3}"/></linearGradient>`).join("");

    let base = S.map(() => 0);
    const areas = [];
    const edges = [];
    let topEdge = null;
    this._stack().forEach((c) => {
      if (!vis[c]) return;
      const up = S.map((lv, i) => base[i] + lv[c]);
      if (S.some((lv) => lv[c] > 0)) {
        const tp = xs.map((x, i) => [X(x), Y(up[i])]);
        const bp = xs.map((x, i) => [X(x), Y(base[i])]).reverse();
        areas.push(`<path d="${line(tp)}L${P(...bp[0])}${mono(bp)}Z" fill="url(#k7g${c})"/>`);
        edges.push(`<path d="${line(tp)}" class="seam"/><path d="${line(tp)}" fill="none" stroke="${cols[c]}" stroke-width="1.2" transform="translate(0,1.2)"/>`);
        topEdge = tp;
      }
      base = up;
    });

    const [a, b] = this._spans(draft)[this._slotIndex()];
    const now = this._now();
    const nx = X(now);
    const ny = Y(sum(levelsAt(shown, now)));
    let ghost = "";
    if (other) {
      const gp = xs.map((x) => [X(x), Y(sum(levelsAt(other, x)))]);
      ghost = `<path d="${line(gp)}" class="ghost"/>`;
    }
    const ticks = (W < 500 ? [0, 6, 12, 18, 24] : [0, 3, 6, 9, 12, 15, 18, 21, 24])
      .map((h) => `<text x="${X(h).toFixed(1)}" y="${H - 5}" class="tick" text-anchor="${h === 0 ? "start" : h === 24 ? "end" : "middle"}">${pad(h)}</text>`).join("");
    const nowShown = now >= 0 && now <= 24;
    svg.setAttribute("viewBox", `0 0 ${W} ${H}`);
    svg.innerHTML = `
      <defs>${grads}
        <linearGradient id="k7amb" x1="0" y1="0" x2="1" y2="0">${amb}</linearGradient>
        <linearGradient id="k7fade" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#fff" stop-opacity="0"/><stop offset=".6" stop-color="#fff" stop-opacity="1"/></linearGradient>
        <mask id="k7mask" maskContentUnits="userSpaceOnUse"><rect x="0" y="0" width="${W}" height="${H}" fill="url(#k7fade)"/></mask>
        <linearGradient id="k7now" x1="0" y1="0" x2="0" y2="1"><stop offset="0" class="accstop" stop-opacity=".9"/><stop offset="1" class="accstop" stop-opacity="0"/></linearGradient>
        <filter id="k7glow" x="-20%" y="-40%" width="140%" height="180%"><feGaussianBlur stdDeviation="12"/></filter>
      </defs>
      <rect x="${L}" y="0" width="${W - L - R}" height="${H - BOT}" fill="url(#k7amb)" mask="url(#k7mask)"/>
      <line x1="${L}" x2="${W - R}" y1="${Y(yMax / 2).toFixed(1)}" y2="${Y(yMax / 2).toFixed(1)}" class="grid"/>
      <line x1="${L}" x2="${W - R}" y1="${Y(yMax).toFixed(1)}" y2="${Y(yMax).toFixed(1)}" class="grid"/>
      <text x="${W - R}" y="${(Y(yMax / 2) - 5).toFixed(1)}" text-anchor="end" class="ylbl">${outMax / 2}%</text>
      <text x="${W - R}" y="${(Y(yMax) - 5).toFixed(1)}" text-anchor="end" class="ylbl">${outMax}%</text>
      <rect x="${X(a).toFixed(1)}" y="${TOP - 8}" width="${Math.max(2, X(b) - X(a)).toFixed(1)}" height="${H - BOT - TOP + 8}" rx="8" class="selband"/>
      ${topEdge && dark ? `<path d="${line(topEdge)}" fill="none" stroke="#7aa2ff" stroke-width="10" filter="url(#k7glow)" opacity=".45"/>` : ""}
      ${areas.join("")}${edges.join("")}
      <line x1="${L}" x2="${W - R}" y1="${Y(0)}" y2="${Y(0)}" class="base"/>
      ${ghost}${ticks}
      ${nowShown ? `<rect x="${(nx - 0.75).toFixed(1)}" y="${TOP - 14}" width="1.5" height="${H - BOT - TOP + 14}" fill="url(#k7now)"/>
        <circle cx="${nx.toFixed(1)}" cy="${ny.toFixed(1)}" r="9" class="nowhalo"/>
        <circle cx="${nx.toFixed(1)}" cy="${ny.toFixed(1)}" r="4.5" class="nowdot"/>
        <g transform="translate(${Math.max(L + 18, Math.min(W - R - 18, nx)).toFixed(1)},${TOP - 18})"><rect x="-18" y="-10" width="36" height="20" rx="10" class="nowpill"/>
        <text y="4.5" text-anchor="middle" class="nowtxt">${this._t("now")}</text></g>` : ""}
      <g class="scrub"></g>`;
  }

  // Hover/drag over the chart: a hairline, a dot per layer and the time + total in a pill.
  _scrub(h) {
    const g = this._geo;
    const root = this.shadowRoot;
    const layer = root.querySelector(".scrub");
    const tip = root.querySelector(".tip");
    if (!g || !layer || !tip) return;
    if (h == null) {
      layer.innerHTML = "";
      tip.style.opacity = 0;
      return;
    }
    const cols = this._colors();
    const X = (x) => g.L + ((g.W - g.L - g.R) * x) / 24;
    const Y = (v) => g.H - g.BOT - ((g.H - g.BOT - g.TOP) * v) / g.yMax;
    const lv = levelsAt(g.shown, h);
    let acc = 0;
    let dots = "";
    this._stack().forEach((c) => {
      if (!this._visible[c]) return;
      acc += lv[c];
      if (lv[c] > 0.3) dots += `<circle cx="${X(h).toFixed(1)}" cy="${Y(acc).toFixed(1)}" r="3.5" fill="${cols[c]}" class="sdot"/>`;
    });
    layer.innerHTML = `<line x1="${X(h).toFixed(1)}" x2="${X(h).toFixed(1)}" y1="${g.TOP - 6}" y2="${g.H - g.BOT}" class="shair"/>${dots}`;
    const output = Math.round(acc / g.n);
    tip.innerHTML = `${fmtHour(h)}<span>${acc >= 0.5 ? `${output}%` : this._t("dark")}</span>`;
    tip.style.left = `${(X(h) / g.W) * 100}%`;
    tip.style.opacity = 1;
  }

  _bind() {
    const root = this.shadowRoot;
    const on = (sel, ev, fn) => root.querySelectorAll(sel).forEach((el) => el.addEventListener(ev, fn));
    on("[data-slot]", "click", (e) => {
      this._slot = +e.currentTarget.dataset.slot;
      this._render();
    });
    on("[data-ch]", "click", (e) => {
      const ch = +e.currentTarget.dataset.ch;
      this._visible[ch] = !this._visible[ch];
      this._render();
    });
    // Sliders update the chart live; the card re-renders once the value is committed.
    on("[data-lv]", "input", (e) => {
      const ch = +e.target.dataset.lv;
      const v = clamp(e.target.value);
      const row = this._draft.schedule[this._slotIndex()];
      const delta = v - row[ch + 2];
      row[ch + 2] = v;
      if (this._linked) this._visible.forEach((vis, c) => { if (vis && c !== ch) row[c + 2] = clamp(row[c + 2] + delta); });
      root.querySelectorAll("[data-lv]").forEach((s) => {
        const c = +s.dataset.lv;
        s.value = row[c + 2];
        s.style.setProperty("--p", `${row[c + 2]}%`);
      });
      root.querySelectorAll("[data-num]").forEach((n) => (n.value = row[+n.dataset.num + 2]));
      this._drawChart();
    });
    on("[data-lv]", "change", () => this._render());
    on("[data-num]", "change", (e) => {
      const ch = +e.target.dataset.num;
      const row = this._draft.schedule[this._slotIndex()];
      const v = clamp(e.target.value);
      const delta = v - row[ch + 2];
      row[ch + 2] = v;
      if (this._linked) this._visible.forEach((vis, c) => { if (vis && c !== ch) row[c + 2] = clamp(row[c + 2] + delta); });
      this._render();
    });
    on("[data-act]", "click", (e) => this._action(e.currentTarget.dataset.act, e));
    on("[data-act=pick]", "change", (e) => this._pick(e.target.value));
    on("[data-act=link]", "change", (e) => (this._linked = e.target.checked));
    on("[data-act=keeptimes]", "change", (e) => { this._keepTimes = !e.target.checked; });
    on("[data-act=daystart]", "change", async (e) => {
      const hour = e.target.value === "" ? null : +e.target.value;
      try {
        const res = await this._ws({ type: "k7_lamp/set_day_start", entry_id: this._lamp.entry_id, hour });
        this._updateLamp(res);
        if (hour === null) return this._info(this._t("m_day_cleared"));
        const before = dayStart(this._draft.schedule);
        this._draft.schedule = alignDayStart(this._draft.schedule, hour);
        this._info(this._t(before === hour ? "m_day_is" : "m_day_shift", { h: `${pad(hour)}:00` }));
      } catch (err) { this._error(err); }
    });
    on("[data-act=qrfile]", "change", (e) => this._qrFromFile(e.target.files?.[0]));
    const chart = root.querySelector(".chart");
    if (chart) {
      const hourAt = (e) => {
        const r = chart.getBoundingClientRect();
        const g = this._geo || { W: r.width, L: 2, R: 2 };
        const px = ((e.clientX - r.left) / r.width) * g.W;
        return Math.max(0, Math.min(23.99, ((px - g.L) / (g.W - g.L - g.R)) * 24));
      };
      chart.addEventListener("pointermove", (e) => this._scrub(hourAt(e)));
      chart.addEventListener("pointerleave", () => this._scrub(null));
      chart.addEventListener("click", (e) => {
        this._slot = slotAt(this._draft.schedule, hourAt(e));
        this._render();
      });
    }
    if (this._panel === "export" && this._qrPayload) {
      loadScript("vendor/qrcode.min.js", "QRCode").then(() => {
        const box = root.querySelector(".qr");
        if (box) new window.QRCode(box, { text: this._qrPayload, width: 240, height: 240, correctLevel: window.QRCode.CorrectLevel.M });
      });
    }
    if (this._panel === "import" && this._stream) {
      const video = root.querySelector("video");
      video.srcObject = this._stream;
      video.play().catch(() => {});
      this._scanLoop(video);
    }
  }

  _pick(value) {
    try {
      if (!value) return;
      let src = null;
      if (value === "lamp") src = this._lampData();
      else if (value === "original") src = this._lamp.original;
      else if (value.startsWith("p:")) src = this._profiles[value.slice(2)];
      else if (value.startsWith("b:")) src = this._presets[+value.slice(2)];
      if (!src) return;
      const r = value === "lamp" || value === "original" ? { schedule: clone(src.schedule), note: "" } : this._aligned(clone(src.schedule));
      this._source = value;
      this._draft = { manual: clone(src.manual), schedule: r.schedule };
      this._info(value === "lamp" ? this._t("m_loaded_lamp") : this._t("m_loaded", { n: r.note }));
    } catch (err) { this._error(err); }
  }

  async _action(act, e) {
    try {
      switch (act) {
        case "dismiss": this._msg = null; return this._render();
        case "view-draft": return this._switchView("draft");
        case "view-lamp": return this._switchView("lamp");
        case "prev":
        case "next": {
          const n = this._draft.schedule.length;
          const i = (this._slotIndex() + (act === "next" ? 1 : n - 1)) % n;
          this._slot = i;
          return this._render();
        }
        case "cancel": this._stopCamera(); this._setPanel(null); return this._render();
        case "apply": this._setPanel("confirm"); return this._render();
        case "apply-yes": {
          const acc = !!this._acc();
          this._setPanel(null);
          this._info(this._t("m_writing"));
          const res = await this._ws({ type: "k7_lamp/apply", entry_id: this._lamp.entry_id, ...this._draft });
          this._updateLamp(res);
          if (acc) return this._info(this._t("m_acc_updated"));
          return this._info(this._t(res.written ? "m_written" : "m_same"));
        }
        case "revert":
          this._draft = clone(this._baseline());
          this._source = this._acc() ? null : "lamp";
          return this._info(this._t(this._acc() ? "m_reset_acc" : "m_reset_lamp"));
        case "acc": this._setPanel("acc"); return this._render();
        case "moon": this._setPanel("moon"); return this._render();
        case "moon-save": {
          const root = this.shadowRoot;
          const val = (k) => root.querySelector(`[data-moon=${k}]`);
          const channels = {};
          root.querySelectorAll("[data-moonch]").forEach((el) => (channels[el.dataset.moonch] = clamp(el.value)));
          const max = +val("max_level").value;
          const enabled = val("enabled").checked;
          const follow_moon = val("follow_moon").checked;
          if (!(max >= 1 && max <= 50)) return this._error(this._t("m_moon_range"));
          this._setPanel(null);
          this._info(this._t("m_moon_saving"));
          const res = await this._ws({ type: "k7_lamp/set_moonlight", entry_id: this._lamp.entry_id,
            enabled, max_level: max, follow_moon, channels });
          this._updateLamp(res);
          return this._info(this._t(this._moonOn() ? "m_moon_saved" : "m_moon_off"));
        }
        case "align": {
          const r = this._aligned(this._draft.schedule);
          this._draft.schedule = r.schedule;
          return this._info(this._t("m_shifted", { n: r.note }));
        }
        case "acc-go": {
          const start = +this.shadowRoot.querySelector("[data-act=acc-start]").value;
          const days = +this.shadowRoot.querySelector("[data-act=acc-days]").value;
          if (!(start >= 1 && start <= 99 && days >= 1 && days <= 120)) return this._error(this._t("m_acc_range"));
          this._setPanel(null);
          this._info(this._t("m_acc_starting"));
          const res = await this._ws({ type: "k7_lamp/start_acclimation", entry_id: this._lamp.entry_id,
            ...this._draft, start_percent: start, days });
          this._updateLamp(res);
          return this._info(this._t("m_acc_started", { s: start, d: days }));
        }
        case "acc-stop": this._setPanel("acc-stop"); return this._render();
        case "acc-keep":
        case "acc-full": {
          this._setPanel(null);
          const res = await this._ws({ type: "k7_lamp/stop_acclimation", entry_id: this._lamp.entry_id,
            keep_current: act === "acc-keep" });
          this._updateLamp(res);
          this._draft = clone(this._baseline());
          return this._info(this._t(act === "acc-keep" ? "m_acc_kept" : "m_acc_full"));
        }
        case "sync":
          await this._ws({ type: "k7_lamp/sync_clock", entry_id: this._lamp.entry_id });
          return this._info(this._t("m_synced"));
        case "save": this._setPanel("save"); return this._render();
        case "save-yes": {
          const name = this.shadowRoot.querySelector("[data-act=name]").value.trim();
          if (!name) return;
          const res = await this._ws({ type: "k7_lamp/save_profile", name, ...this._draft });
          this._profiles = res.profiles;
          this._source = `p:${name}`;
          this._setPanel(null);
          return this._info(this._t("m_saved", { n: name }));
        }
        case "delete": {
          const name = this._selectedProfile();
          if (!name) return;
          if (e.currentTarget.dataset.armed !== "1") {
            e.currentTarget.dataset.armed = "1";
            e.currentTarget.textContent = this._t("really_delete", { n: name });
            return;
          }
          const res = await this._ws({ type: "k7_lamp/delete_profile", name });
          this._profiles = res.profiles;
          this._source = null;
          return this._info(this._t("m_deleted", { n: name }));
        }
        case "import": this._setPanel("import"); this._msg = null; return this._render();
        case "qrload": return this._importPayload(this.shadowRoot.querySelector("[data-act=qrtext]").value);
        case "camera": return this._stream ? (this._stopCamera(), this._render()) : this._startCamera();
        case "export": {
          const res = await this._ws({ type: "k7_lamp/to_qr", ...this._draft });
          this._qrPayload = res.payload;
          this._setPanel("export");
          return this._render();
        }
        case "copy":
          await navigator.clipboard.writeText(this._qrPayload);
          return this._info(this._t("m_copied"));
      }
    } catch (err) {
      this._error(err);
    }
  }

  // ---------- QR import ----------

  async _importPayload(text) {
    try {
      const res = await this._ws({ type: "k7_lamp/parse_qr", payload: String(text || "") });
      this._stopCamera();
      const r = this._aligned(res.schedule);
      this._draft = { manual: res.manual, schedule: r.schedule };
      this._source = null;
      this._setPanel(null);
      this._info(this._t("m_qr_loaded", { n: r.note }));
    } catch (err) {
      this._error(err);
    }
  }

  async _decode(imageData) {
    await loadScript("vendor/jsQR.js", "jsQR");
    const code = window.jsQR(imageData.data, imageData.width, imageData.height, { inversionAttempts: "attemptBoth" });
    return code?.data || null;
  }

  async _qrFromFile(file) {
    if (!file) return;
    try {
      const bmp = await createImageBitmap(file);
      // Downscale big phone photos; jsQR is slow on 12 MP images.
      const scale = Math.min(1, 1600 / Math.max(bmp.width, bmp.height));
      const c = document.createElement("canvas");
      c.width = Math.round(bmp.width * scale);
      c.height = Math.round(bmp.height * scale);
      const ctx = c.getContext("2d");
      ctx.drawImage(bmp, 0, 0, c.width, c.height);
      const text = await this._decode(ctx.getImageData(0, 0, c.width, c.height));
      if (!text) return this._error(this._t("m_no_qr"));
      await this._importPayload(text);
    } catch (err) {
      this._error(err);
    }
  }

  async _startCamera() {
    this._lastBad = null;
    if (!navigator.mediaDevices?.getUserMedia) return this._error(this._t("m_no_camera"));
    if (this._panel !== "import" || this._cameraPending) return;
    const request = (this._cameraRequest || 0) + 1;
    this._cameraRequest = request;
    this._cameraPending = true;
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: "environment" } });
      if (request !== this._cameraRequest || this._panel !== "import" || !this.isConnected) {
        stream.getTracks().forEach((t) => t.stop());
        return;
      }
      this._stream = stream;
      this._render();
    } catch (err) {
      if (request === this._cameraRequest) this._error(err);
    } finally {
      if (request === this._cameraRequest) this._cameraPending = false;
    }
  }

  _stopCamera() {
    this._cameraRequest = (this._cameraRequest || 0) + 1;
    this._cameraPending = false;
    this._stream?.getTracks().forEach((t) => t.stop());
    this._stream = null;
  }

  async _scanLoop(video) {
    await loadScript("vendor/jsQR.js", "jsQR");
    const c = document.createElement("canvas");
    const ctx = c.getContext("2d", { willReadFrequently: true });
    const tick = async () => {
      if (!this._stream || !video.isConnected) return;
      if (video.readyState >= 2 && video.videoWidth) {
        c.width = video.videoWidth;
        c.height = video.videoHeight;
        ctx.drawImage(video, 0, 0);
        const text = await this._decode(ctx.getImageData(0, 0, c.width, c.height));
        if (text && text !== this._lastBad) {
          this._lastBad = text;
          return this._importPayload(text);
        }
      }
      setTimeout(tick, 250);
    };
    tick();
  }

  disconnectedCallback() {
    this._stopCamera();
  }
}

const STYLE = `
  :host { display: block; }
  ha-card {
    --k7-ink: #f5f5f7; --k7-ink2: rgba(235,235,245,.62); --k7-ink3: rgba(235,235,245,.34);
    --k7-fill: rgba(118,118,128,.24); --k7-fill2: rgba(118,118,128,.12); --k7-hair: rgba(255,255,255,.08);
    --k7-panel: rgba(255,255,255,.04); --k7-edge: rgba(255,255,255,.08); --k7-seam: #0b0e15;
    --k7-accent: #64d2ff; --k7-accent-ink: #002a3a; --k7-blue: #0a84ff; --k7-green: #30d158; --k7-orange: #ff9f0a; --k7-red: #ff453a;
    --k7-thumb: rgba(99,99,102,.75);
    position: relative; overflow: hidden; padding: 20px 20px 18px; border-radius: 26px; color: var(--k7-ink);
    font-family: -apple-system, BlinkMacSystemFont, "SF Pro Text", var(--ha-font-family-body, Roboto), "Helvetica Neue", sans-serif;
    font-size: 15px; line-height: 1.4; -webkit-font-smoothing: antialiased; font-variant-numeric: tabular-nums;
    background:
      radial-gradient(120% 60% at 50% 0%, rgba(64,110,255,.20), transparent 60%),
      radial-gradient(80% 50% at 100% 100%, rgba(40,190,255,.08), transparent 60%),
      linear-gradient(180deg, #0d1424 0%, #0a0d14 50%, #08090c 100%);
    border: none; box-shadow: 0 0 0 .5px rgba(255,255,255,.10) inset, 0 24px 60px -30px rgba(40,90,255,.35);
  }
  ha-card.light {
    --k7-ink: #1d1d1f; --k7-ink2: rgba(60,60,67,.62); --k7-ink3: rgba(60,60,67,.36);
    --k7-fill: rgba(118,118,128,.14); --k7-fill2: rgba(118,118,128,.08); --k7-hair: rgba(60,60,67,.12);
    --k7-panel: rgba(255,255,255,.72); --k7-edge: rgba(0,0,0,.06); --k7-seam: #ffffff;
    --k7-accent: #0a84ff; --k7-accent-ink: #ffffff; --k7-blue: #007aff; --k7-green: #248a3d; --k7-orange: #c93400; --k7-red: #d70015;
    --k7-thumb: #ffffff;
    background:
      radial-gradient(120% 60% at 50% 0%, rgba(90,130,255,.14), transparent 60%),
      linear-gradient(180deg, #f3f6ff 0%, #f7f8fb 50%, #ffffff 100%);
    box-shadow: 0 0 0 .5px rgba(0,0,0,.08) inset, 0 18px 40px -28px rgba(40,90,255,.35);
  }
  button { font: inherit; color: inherit; }
  .head { display: flex; align-items: center; gap: 8px; flex-wrap: wrap; margin-bottom: 14px; }
  .title { font-size: 22px; font-weight: 700; letter-spacing: -.02em; margin-right: auto; }
  .pill { font-size: 12px; font-weight: 600; padding: 4px 10px; border-radius: 999px; background: var(--k7-fill2);
    color: var(--k7-ink2); display: inline-flex; align-items: center; gap: 6px; }
  .pill i { width: 6px; height: 6px; border-radius: 50%; background: currentColor; }
  .pill.ok { color: var(--k7-green); background: color-mix(in srgb, var(--k7-green) 14%, transparent); }
  .pill.warn { color: var(--k7-orange); background: color-mix(in srgb, var(--k7-orange) 15%, transparent); }
  .pill.bad { color: var(--k7-red); background: color-mix(in srgb, var(--k7-red) 14%, transparent); }
  .msg { display: flex; align-items: center; gap: 8px; padding: 10px 14px; border-radius: 14px; margin: 0 0 10px; font-size: 14px;
    background: var(--k7-panel); box-shadow: 0 0 0 .5px var(--k7-edge) inset; }
  .msg.error { color: var(--k7-red); }
  .msg .x { margin-left: auto; border: none; background: none; font-size: 20px; line-height: 1; padding: 0 4px; cursor: pointer; color: var(--k7-ink2); }
  .loading { padding: 28px 4px; color: var(--k7-ink2); }
  .acc { display: grid; grid-template-columns: 1fr auto; gap: 8px 16px; align-items: center; padding: 14px 16px; border-radius: 18px;
    background: var(--k7-panel); box-shadow: 0 0 0 .5px var(--k7-edge) inset; margin-bottom: 4px; }
  .acc .t { font-size: 15px; font-weight: 600; }
  .acc .t span { color: var(--k7-ink2); font-weight: 500; }
  .acc .t em { font-style: normal; font-weight: 700; color: var(--k7-accent); }
  .progress { grid-column: 1; height: 6px; border-radius: 3px; background: var(--k7-fill); overflow: hidden; }
  .progress b { display: block; height: 100%; border-radius: 3px; background: linear-gradient(90deg, #5e7bff, #64d2ff);
    box-shadow: 0 0 12px rgba(100,210,255,.55); }
  .acc .s { grid-column: 1; font-size: 13px; color: var(--k7-ink3); }
  .acc .btn { grid-column: 2; grid-row: 1 / span 3; }
  .btn { display: inline-flex; align-items: center; justify-content: center; gap: 6px; border: none; cursor: pointer;
    font-size: 14px; font-weight: 600; padding: 8px 14px; border-radius: 12px; background: var(--k7-fill); color: var(--k7-ink);
    transition: transform .12s, background .2s, opacity .2s; }
  .btn:active { transform: scale(.97); }
  .btn.small { padding: 4px 10px; font-size: 13px; border-radius: 9px; }
  .btn.tint { background: color-mix(in srgb, var(--k7-blue) 18%, transparent); color: var(--k7-blue); }
  .dark .btn.tint { color: #4aa3ff; }
  .btn.primary { background: var(--k7-blue); color: #fff; box-shadow: 0 6px 20px -8px var(--k7-blue); }
  .btn.ghost { background: none; color: var(--k7-ink2); }
  .btn:disabled { opacity: .35; cursor: default; box-shadow: none; }
  .btn.sq { width: 32px; height: 32px; padding: 0; border-radius: 10px; font-size: 17px; }
  .btn:focus-visible, .chan:focus-visible, .cell:focus-visible, select:focus-visible, input:focus-visible {
    outline: 2px solid var(--k7-accent); outline-offset: 2px; }
  .seg { display: inline-flex; padding: 2px; border-radius: 10px; background: var(--k7-fill); margin-left: auto; flex-shrink: 0; }
  .seg button { border: none; background: none; cursor: pointer; padding: 5px 12px; font-size: 13px; font-weight: 600; border-radius: 8px;
    transition: background .25s, box-shadow .25s; }
  .seg button span { color: var(--k7-ink2); font-weight: 500; margin-left: 4px; }
  .seg button.on { background: var(--k7-thumb); box-shadow: 0 3px 8px rgba(0,0,0,.18), 0 0 0 .5px rgba(0,0,0,.04); }
  .charthead { display: flex; align-items: center; flex-wrap: wrap; gap: 6px 10px; margin: 12px 0 0; min-height: 30px; }
  .now { font-size: 13px; color: var(--k7-ink2); font-weight: 500; }
  .now b { color: var(--k7-ink); font-weight: 600; }
  .chart { position: relative; margin: 4px 0 0; touch-action: pan-y; cursor: pointer; }
  .chart svg { display: block; width: 100%; height: auto; overflow: visible; }
  .chart .tick { fill: var(--k7-ink3); font-size: 11.5px; font-weight: 500; }
  .chart .ylbl { fill: var(--k7-ink3); font-size: 11px; font-weight: 500; }
  .chart .grid { stroke: var(--k7-hair); stroke-dasharray: 2 5; }
  .chart .base { stroke: var(--k7-hair); }
  .chart .selband { fill: color-mix(in srgb, var(--k7-accent) 10%, transparent); }
  .chart .seam { fill: none; stroke: var(--k7-seam); stroke-width: 2; stroke-opacity: .9; }
  .chart .ghost { fill: none; stroke: var(--k7-ink2); stroke-width: 1.2; stroke-dasharray: 3 4; opacity: .7; }
  .legend { margin-left: auto; display: inline-flex; align-items: center; gap: 6px; font-size: 12px; color: var(--k7-ink2); }
  .legend i { width: 16px; border-top: 1.5px dashed var(--k7-ink2); }
  .legend + .seg { margin-left: 10px; }
  .chart .accstop { stop-color: var(--k7-accent); }
  .chart .nowhalo { fill: var(--k7-accent); fill-opacity: .22; }
  .chart .nowdot { fill: #fff; stroke: var(--k7-accent); stroke-width: 2; }
  .chart .nowpill { fill: var(--k7-accent); }
  .chart .nowtxt { fill: var(--k7-accent-ink); font-size: 12px; font-weight: 700; }
  .chart .shair { stroke: var(--k7-ink2); stroke-width: 1; }
  .chart .sdot { stroke: var(--k7-seam); stroke-width: 1.5; }
  .tip { position: absolute; top: 0; transform: translateX(-50%); pointer-events: none; padding: 4px 10px; border-radius: 999px;
    font-size: 12px; font-weight: 600; white-space: nowrap; opacity: 0; transition: opacity .15s;
    background: rgba(44,44,46,.86); color: #f5f5f7; backdrop-filter: blur(16px); -webkit-backdrop-filter: blur(16px);
    box-shadow: 0 0 0 .5px rgba(255,255,255,.12) inset, 0 6px 18px rgba(0,0,0,.3); }
  .tip span { color: rgba(235,235,245,.62); font-weight: 500; margin-left: 6px; }
  .strip { display: grid; gap: 3px; margin: 8px 0 4px; }
  .cell { position: relative; height: 30px; padding: 0; border: none; border-radius: 7px; cursor: pointer; background: var(--k7-fill2);
    box-shadow: 0 0 0 .5px var(--k7-edge) inset; transition: transform .15s; }
  .cell:hover { transform: translateY(-1px); }
  .cell span { position: absolute; left: 0; right: 0; bottom: 3px; text-align: center; font-size: 9.5px; font-weight: 600;
    color: rgba(255,255,255,.6); mix-blend-mode: difference; }
  .light .cell span { color: rgba(255,255,255,.75); }
  .cell.sel { box-shadow: 0 0 0 2px var(--k7-accent), 0 0 14px color-mix(in srgb, var(--k7-accent) 55%, transparent); }
  .cell.now:not(.sel) { box-shadow: 0 0 0 1.5px var(--k7-accent) inset; }
  .group { margin-top: 12px; border-radius: 18px; background: var(--k7-panel); box-shadow: 0 0 0 .5px var(--k7-edge) inset; }
  .item { display: flex; align-items: center; gap: 12px; padding: 10px 16px; min-height: 44px; }
  .item + .item { border-top: .5px solid var(--k7-hair); }
  .item .lbl { font-size: 15px; margin-right: auto; }
  .item .val { color: var(--k7-ink2); font-size: 14px; text-align: right; }
  select.ios { appearance: none; -webkit-appearance: none; font: inherit; font-size: 15px; color: var(--k7-accent); background: none; border: none;
    padding: 2px 18px 2px 0; cursor: pointer; max-width: 100%; text-overflow: ellipsis;
    background-image: linear-gradient(45deg, transparent 50%, var(--k7-accent) 50%), linear-gradient(135deg, var(--k7-accent) 50%, transparent 50%);
    background-position: right 6px top 55%, right 1px top 55%; background-size: 5px 5px; background-repeat: no-repeat; }
  select.ios option, select.ios optgroup { color: initial; }
  select.ios:disabled { opacity: .4; }
  .sw { position: relative; display: inline-block; width: 51px; height: 31px; flex-shrink: 0; }
  .sw input { position: absolute; opacity: 0; width: 100%; height: 100%; margin: 0; cursor: pointer; z-index: 1; }
  .sw b { position: absolute; inset: 0; border-radius: 999px; background: rgba(120,120,128,.32); transition: background .25s; }
  .sw b::after { content: ""; position: absolute; top: 2px; left: 2px; width: 27px; height: 27px; border-radius: 50%; background: #fff;
    box-shadow: 0 3px 8px rgba(0,0,0,.2); transition: transform .25s cubic-bezier(.3,.7,.2,1); }
  .sw input:checked + b { background: var(--k7-green); }
  .sw input:checked + b::after { transform: translateX(20px); }
  .sw input:focus-visible + b { outline: 2px solid var(--k7-accent); outline-offset: 2px; }
  .sw.sm { width: 42px; height: 26px; }
  .sw.sm b::after { width: 22px; height: 22px; }
  .sw.sm input:checked + b::after { transform: translateX(16px); }
  .sec { display: flex; align-items: center; justify-content: space-between; margin: 18px 4px 8px; }
  .sec b { font-size: 13px; font-weight: 600; color: var(--k7-ink2); text-transform: uppercase; letter-spacing: .03em; }
  .link { display: inline-flex; align-items: center; gap: 10px; font-size: 14px; color: var(--k7-ink2); cursor: pointer; }
  .chans { display: flex; flex-wrap: wrap; gap: 8px; }
  .chan { display: inline-flex; align-items: center; gap: 7px; padding: 7px 12px 7px 10px; border: none; border-radius: 999px; cursor: pointer;
    font-size: 14px; font-weight: 600; background: color-mix(in srgb, var(--c) 16%, transparent);
    box-shadow: 0 0 0 .5px color-mix(in srgb, var(--c) 40%, transparent) inset; transition: background .2s, color .2s; }
  .chan i { width: 9px; height: 9px; border-radius: 50%; background: var(--c); box-shadow: 0 0 8px var(--c); }
  .chan.off { background: var(--k7-fill2); color: var(--k7-ink3); box-shadow: none; }
  .chan.off i { background: transparent; box-shadow: 0 0 0 1.5px var(--k7-ink3) inset; }
  .slot { margin-top: 10px; padding: 14px 16px 8px; border-radius: 20px; background: var(--k7-panel); box-shadow: 0 0 0 .5px var(--k7-edge) inset; }
  .slot .top { display: flex; align-items: center; gap: 8px; margin-bottom: 4px; }
  .slot h3 { margin: 0; font-size: 20px; font-weight: 700; letter-spacing: -.02em; }
  .slot .s { font-size: 13px; color: var(--k7-ink3); margin-left: 4px; }
  .slot .nav { margin-left: auto; display: flex; gap: 6px; }
  .sl { display: grid; grid-template-columns: 112px 1fr 60px; align-items: center; gap: 12px; padding: 6px 0; }
  .sl .n { display: flex; align-items: center; gap: 8px; font-size: 14px; font-weight: 500; }
  .sl .n i, .mch i { width: 9px; height: 9px; border-radius: 50%; background: var(--c); box-shadow: 0 0 8px var(--c); flex-shrink: 0; }
  .sl .n.off { opacity: .4; }
  input[type=range] { -webkit-appearance: none; appearance: none; width: 100%; height: 28px; margin: 0; background: none; cursor: pointer; }
  input[type=range]::-webkit-slider-runnable-track { height: 6px; border-radius: 3px;
    background: linear-gradient(90deg, var(--c) var(--p), var(--k7-fill) var(--p)); }
  input[type=range]::-moz-range-track { height: 6px; border-radius: 3px; background: linear-gradient(90deg, var(--c) var(--p), var(--k7-fill) var(--p)); }
  input[type=range]::-webkit-slider-thumb { -webkit-appearance: none; width: 24px; height: 24px; margin-top: -9px; border-radius: 50%;
    background: #fff; box-shadow: 0 2px 8px rgba(0,0,0,.3), 0 0 0 .5px rgba(0,0,0,.08); }
  input[type=range]::-moz-range-thumb { width: 24px; height: 24px; border: none; border-radius: 50%; background: #fff; box-shadow: 0 2px 8px rgba(0,0,0,.3); }
  .num, .field { font: inherit; color: var(--k7-ink); background: var(--k7-fill2); border: none; border-radius: 10px; padding: 6px 8px; }
  .num { width: 60px; box-sizing: border-box; text-align: right; font-size: 16px; font-weight: 600; -moz-appearance: textfield; }
  .num::-webkit-inner-spin-button, .num::-webkit-outer-spin-button { -webkit-appearance: none; margin: 0; }
  .field { width: 64px; }
  .field.wide { flex: 1; min-width: 160px; width: auto; }
  .prof { display: flex; align-items: center; gap: 8px; margin-top: 12px; padding: 8px 10px 8px 16px; border-radius: 16px;
    background: var(--k7-panel); box-shadow: 0 0 0 .5px var(--k7-edge) inset; flex-wrap: wrap; }
  .prof select { min-width: 0; flex: 0 1 auto; }
  .grow { flex: 1; }
  .foot { display: flex; flex-wrap: wrap; gap: 8px; margin-top: 12px; }
  .applyrow { display: flex; align-items: center; gap: 8px; margin-top: 14px; padding-top: 14px; border-top: .5px solid var(--k7-hair); }
  .applyrow .hint { margin-right: auto; font-size: 13px; color: var(--k7-ink3); }
  .panel { margin-top: 12px; padding: 14px 16px; border-radius: 18px; background: var(--k7-panel); box-shadow: 0 0 0 .5px var(--k7-edge) inset; }
  .panel p { margin: 0 0 10px; font-size: 14px; color: var(--k7-ink2); }
  .panel p b { color: var(--k7-ink); }
  .row { display: flex; gap: 10px; flex-wrap: wrap; align-items: center; margin: 8px 0 0; }
  .row label { display: inline-flex; align-items: center; gap: 6px; font-size: 14px; }
  .tog { cursor: pointer; }
  .muted { color: var(--k7-ink2); font-size: 13px; margin-top: 8px; }
  .mchs { gap: 8px 16px; }
  .mch .field { width: 56px; }
  textarea { width: 100%; box-sizing: border-box; font-family: ui-monospace, Menlo, monospace; font-size: 12px; color: var(--k7-ink);
    background: var(--k7-fill2); border: none; border-radius: 12px; padding: 10px; }
  .qr { display: flex; justify-content: center; padding: 14px; background: #fff; border-radius: 14px; margin-bottom: 10px; }
  video { width: 100%; max-height: 320px; border-radius: 14px; margin-top: 10px; background: #000; }
  @media (max-width: 560px) {
    ha-card { padding: 16px 12px 14px; border-radius: 22px; }
    .strip { gap: 2px; } .cell { height: 24px; border-radius: 5px; } .cell span { display: none; }
    .sl { grid-template-columns: 92px 1fr 54px; gap: 8px; }
    .item .val { font-size: 13px; }
    .now { flex-basis: 100%; }
    .legend { margin-left: 0; }
    .acc { grid-template-columns: 1fr; }
    .acc .btn { grid-column: 1; grid-row: auto; justify-self: start; }
  }
  @media (prefers-reduced-motion: reduce) { * { transition: none !important; } }
`;


// Compact widget: the lamp's power draw and how strong each colour is right now.
class K7LightCard extends K7ScheduleCard {
  setConfig(config) {
    this._config = config || {};
  }

  static getStubConfig() {
    return {};
  }

  getCardSize() {
    return 3;
  }

  getGridOptions() {
    return { columns: 12, min_columns: 6 };
  }

  set hass(hass) {
    this._hass = hass;
    if (!this.shadowRoot) {
      this.attachShadow({ mode: "open" });
      this._channels = ["White", "Royal Blue", "Green", "UV", "Cyan", "Red"];
      this._load();
    } else if (!this._loading && Date.now() - (this._loadedAt || 0) > 60000) {
      this._load();
    }
    const key = [Math.floor(Date.now() / 60000), this._power(), this._dark()].join("|");
    if (key !== this._key) {
      this._key = key;
      this._render();
    }
  }

  async _load() {
    this._loading = true;
    try {
      const data = await this._hass.callWS({ type: "k7_lamp/get" });
      const want = this._config.entry_id;
      this._channels = data.channels;
      this._lamp = data.lamps.find((l) => !want || l.entry_id === want) || null;
      this._err = this._lamp ? null : "No K7 lamp is loaded";
    } catch (err) {
      this._err = String(err?.message || err);
    }
    this._loading = false;
    this._loadedAt = Date.now();
    this._render();
  }

  _power() {
    const st = this._config.power_entity && this._hass?.states[this._config.power_entity];
    const v = Number(st?.state);
    return st && Number.isFinite(v) ? v : null;
  }

  _status(levels) {
    const lamp = this._lamp;
    if (!lamp.available) return { cls: "bad", text: this._t("offline"), sub: "" };
    if (!lamp.auto) return { cls: "warn", text: this._t("manual"), sub: this._t("w_fixed") };
    const on = levels.some((v) => v >= 0.5);
    const p = photoperiod(lamp.schedule || []);
    const sub = p ? this._t(on ? "w_off_at" : "on_at", { t: fmtHour(on ? p[1] : p[0]) }) : "";
    return { cls: on ? "ok" : "", text: this._t(on ? "w_on" : "w_off"), sub };
  }

  _render() {
    const root = this.shadowRoot;
    if (!root) return;
    const lamp = this._lamp;
    const cols = this._colors();
    let body;
    if (!lamp) {
      body = `<div class="loading">${esc(this._err || this._t("loading"))}</div>`;
    } else {
      const levels = (lamp.auto ? levelsAt(lamp.schedule || [], this._now()) : lamp.manual).map((v) => Math.round(v));
      const st = this._status(levels);
      const watt = this._power();
      const mean = Math.round(levels.reduce((a, v) => a + v, 0) / (levels.length || 1));
      const rows = this._stack().map((c) => `
        <div class="ch${levels[c] ? "" : " zero"}">
          <span class="dot" style="background:${cols[c]}"></span>
          <span class="nm">${esc(this._chName(c))}</span>
          <span class="bar"><b style="width:${levels[c]}%;background:${cols[c]}"></b></span>
          <span class="pct">${levels[c]}%</span>
        </div>`).join("");
      const state = [st.text, st.sub].filter(Boolean).join(" · ");
      body = `
        ${this._config.title ? `<div class="w-title">${esc(this._config.title)}</div>` : ""}
        <div class="w-main">
          <div class="w-power">
            <div class="w-big">${watt === null ? mean : Math.round(watt)}<small>${watt === null ? "%" : " W"}</small></div>
            <div class="w-sub">${this._t("w_of_full", { p: mean })}</div>
            <div class="w-state ${st.cls}"><i></i>${esc(state)}</div>
          </div>
          <div class="w-chs">${rows}</div>
        </div>`;
    }
    // Plain Home Assistant card: theme background, border, radius and text colours, like the tiles around it.
    root.innerHTML = `<style>${WIDGET_STYLE}</style>
      <ha-card class="${this._config.navigation_path ? "nav" : ""}">${body}</ha-card>`;
    const path = this._config.navigation_path;
    if (path) {
      root.querySelector("ha-card").addEventListener("click", () => {
        history.pushState(null, "", path);
        window.dispatchEvent(new CustomEvent("location-changed", { detail: { replace: false } }));
      });
    }
  }

  disconnectedCallback() {}
}

const WIDGET_STYLE = `
  :host { display: block; }
  ha-card { padding: 16px; height: 100%; box-sizing: border-box; color: var(--primary-text-color); }
  ha-card.nav { cursor: pointer; }
  .loading { color: var(--secondary-text-color); }
  .w-title { font-size: 16px; font-weight: 500; margin-bottom: 12px; }
  .w-main { display: grid; grid-template-columns: minmax(96px, auto) 1fr; gap: 8px 24px; align-items: center; }
  .w-big { font-size: 36px; font-weight: 400; line-height: 1.1; font-variant-numeric: tabular-nums; }
  .w-big small { font-size: 18px; color: var(--secondary-text-color); margin-left: 2px; }
  .w-sub { font-size: 12px; color: var(--secondary-text-color); margin-top: 4px; }
  .w-state { display: flex; align-items: center; gap: 6px; font-size: 12px; color: var(--secondary-text-color); margin-top: 2px; }
  .w-state i { width: 8px; height: 8px; border-radius: 50%; background: var(--disabled-color, #bdbdbd); flex: none; }
  .w-state.ok i { background: var(--success-color, #4caf50); }
  .w-state.warn i { background: var(--warning-color, #ff9800); }
  .w-state.bad i { background: var(--error-color, #db4437); }
  .w-chs { display: grid; gap: 6px; min-width: 0; }
  .ch { display: grid; grid-template-columns: 8px minmax(64px, auto) 1fr 36px; align-items: center; gap: 8px; font-size: 12px; }
  .ch .dot { width: 8px; height: 8px; border-radius: 50%; }
  .ch .nm { color: var(--secondary-text-color); white-space: nowrap; }
  .ch .bar { height: 6px; border-radius: 3px; background: var(--secondary-background-color, rgba(127,127,127,.15)); overflow: hidden; }
  .ch .bar b { display: block; height: 100%; border-radius: 3px; transition: width .4s ease; }
  .ch .pct { text-align: right; font-weight: 500; font-variant-numeric: tabular-nums; }
  .ch.zero .nm, .ch.zero .pct { color: var(--disabled-text-color, var(--secondary-text-color)); }
  .ch.zero .dot { opacity: .35; }
  @media (max-width: 420px) { .w-main { grid-template-columns: 1fr; } }
`;

customElements.define("k7-light-card", K7LightCard);
customElements.define("k7-schedule-card", K7ScheduleCard);
window.customCards = window.customCards || [];
window.customCards.push({
  type: "k7-schedule-card",
  name: "K7 schedule editor",
  description: "Edit, import (QR) and apply the Noo-Psyche K7 lamp schedule.",
});
window.customCards.push({
  type: "k7-light-card",
  name: "K7 light",
  description: "Power draw of the Noo-Psyche K7 lamp and how strong each colour is right now.",
});
