/* 🍎 Calorie counter: what you ate each day against your own daily target.
 *
 * Standalone, nothing to do with WorkHive. No accounts: everything is saved in
 * this phone's / browser's storage, with Back up / Restore to move it.
 *
 * FOODS: UK portions with typical calories per portion, from standard UK
 * labels and nutrition tables. Guides, not lab values. Anything not listed can
 * be added as a custom food.
 */
(function (root) {
  'use strict';

  // [name, category, portion, kcal per portion]
  const FOODS = [
    // Breakfast & bakery
    ['Porridge with semi-skimmed milk', 'Breakfast', '40g oats + 200ml milk', 250],
    ['Porridge with water', 'Breakfast', '40g oats', 150],
    ['Weetabix (2) with semi-skimmed milk', 'Breakfast', '2 biscuits + 150ml milk', 205],
    ['Cornflakes with semi-skimmed milk', 'Breakfast', '30g + 125ml milk', 175],
    ['Granola with semi-skimmed milk', 'Breakfast', '45g + 125ml milk', 265],
    ['Rice Krispies with semi-skimmed milk', 'Breakfast', '30g + 125ml milk', 175],
    ['Shreddies with semi-skimmed milk', 'Breakfast', '40g + 125ml milk', 205],
    ['Toast, white, buttered', 'Breakfast', '1 slice', 125],
    ['Toast, wholemeal, buttered', 'Breakfast', '1 slice', 115],
    ['Toast, white, dry', 'Breakfast', '1 slice', 80],
    ['Crumpet, buttered', 'Breakfast', '1 crumpet', 130],
    ['Bagel, plain', 'Breakfast', '1 bagel', 240],
    ['Croissant, butter', 'Breakfast', '1 croissant', 230],
    ['Pain au chocolat', 'Breakfast', '1 pastry', 280],
    ['Full English breakfast', 'Breakfast', '1 plate', 850],
    ['Bacon roll', 'Breakfast', '1 roll', 380],
    ['Sausage roll (breakfast bap)', 'Breakfast', '1 bap', 420],
    ['Egg, boiled or poached', 'Breakfast', '1 large egg', 80],
    ['Egg, fried', 'Breakfast', '1 large egg', 110],
    ['Scrambled eggs on toast', 'Breakfast', '2 eggs + 1 slice', 350],
    ['Beans on toast', 'Breakfast', '½ tin + 2 slices', 390],
    ['Pancake with syrup', 'Breakfast', '1 pancake', 180],
    ['Greek yoghurt, full fat', 'Breakfast', '150g pot', 195],
    ['Yoghurt, low fat fruit', 'Breakfast', '125g pot', 100],

    // Lunch & meal deal
    ['Meal deal sandwich, chicken & bacon', 'Lunch', '1 pack', 450],
    ['Meal deal sandwich, egg mayo', 'Lunch', '1 pack', 350],
    ['Meal deal sandwich, ham & cheese', 'Lunch', '1 pack', 400],
    ['Meal deal sandwich, BLT', 'Lunch', '1 pack', 420],
    ['Meal deal sandwich, tuna sweetcorn', 'Lunch', '1 pack', 360],
    ['Meal deal sandwich, prawn mayo', 'Lunch', '1 pack', 380],
    ['Chicken wrap', 'Lunch', '1 wrap', 420],
    ['Sausage roll, large', 'Lunch', '1 roll', 390],
    ['Steak bake (pastry)', 'Lunch', '1 bake', 410],
    ['Cornish pasty', 'Lunch', '1 pasty', 650],
    ['Pasta salad pot', 'Lunch', '1 pot', 380],
    ['Jacket potato with beans & cheese', 'Lunch', '1 potato', 500],
    ['Soup, tomato', 'Lunch', '400g carton', 220],
    ['Soup, chicken', 'Lunch', '400g carton', 260],
    ['Cheese toastie', 'Lunch', '1 toastie', 450],
    ['Caesar salad with chicken', 'Lunch', '1 bowl', 450],
    ['Sushi pack', 'Lunch', '1 pack', 350],
    ['Pot Noodle', 'Lunch', '1 pot', 385],

    // Dinner
    ['Spaghetti bolognese', 'Dinner', '1 plate', 650],
    ['Chicken curry with rice', 'Dinner', '1 plate', 750],
    ['Chicken tikka masala with rice', 'Dinner', '1 plate', 850],
    ['Chilli con carne with rice', 'Dinner', '1 plate', 650],
    ['Roast chicken dinner', 'Dinner', '1 plate', 700],
    ['Roast beef dinner', 'Dinner', '1 plate', 750],
    ['Shepherd\'s pie', 'Dinner', '1 portion', 450],
    ['Lasagne', 'Dinner', '1 portion (400g)', 600],
    ['Fish and chips', 'Dinner', '1 portion', 950],
    ['Fish fingers (4) with chips & peas', 'Dinner', '1 plate', 650],
    ['Sausage & mash', 'Dinner', '2 sausages + mash', 600],
    ['Steak, grilled', 'Dinner', '225g (8oz)', 450],
    ['Chicken breast, grilled', 'Dinner', '1 breast (150g)', 230],
    ['Salmon fillet, baked', 'Dinner', '1 fillet (120g)', 250],
    ['Stir fry with noodles', 'Dinner', '1 plate', 550],
    ['Burger in a bun', 'Dinner', '1 burger', 550],
    ['Cottage pie ready meal', 'Dinner', '1 pack (400g)', 420],
    ['Macaroni cheese', 'Dinner', '1 portion (400g)', 600],
    ['Omelette, cheese (3 eggs)', 'Dinner', '1 omelette', 400],

    // Takeaway
    ['Pizza, margherita', 'Takeaway', '1 slice (12")', 250],
    ['Pizza, pepperoni', 'Takeaway', '1 slice (12")', 300],
    ['Kebab, doner in pitta', 'Takeaway', '1 kebab', 950],
    ['Big Mac', 'Takeaway', '1 burger', 495],
    ['Cheeseburger', 'Takeaway', '1 burger', 300],
    ['McChicken sandwich', 'Takeaway', '1 sandwich', 390],
    ['Chicken nuggets', 'Takeaway', '6 pieces', 260],
    ['Fries, medium', 'Takeaway', '1 portion', 340],
    ['KFC fried chicken', 'Takeaway', '1 piece', 250],
    ['Subway 6" chicken teriyaki', 'Takeaway', '1 sub', 380],
    ['Chinese, egg fried rice', 'Takeaway', '1 portion', 600],
    ['Chinese, sweet & sour chicken', 'Takeaway', '1 portion', 750],
    ['Indian, pilau rice', 'Takeaway', '1 portion', 450],
    ['Indian, naan bread', 'Takeaway', '1 naan', 450],
    ['Indian, onion bhaji', 'Takeaway', '1 bhaji', 190],
    ['Greggs sausage roll', 'Takeaway', '1 roll', 330],
    ['Greggs vegan sausage roll', 'Takeaway', '1 roll', 310],

    // Sides & staples
    ['Rice, boiled', 'Sides', '1 cup cooked (180g)', 240],
    ['Pasta, boiled', 'Sides', '1 portion cooked (200g)', 300],
    ['Chips, oven', 'Sides', '1 portion (150g)', 250],
    ['Mashed potato', 'Sides', '1 portion (180g)', 200],
    ['Baked beans', 'Sides', '½ tin (200g)', 160],
    ['Bread, white', 'Sides', '1 slice', 80],
    ['Bread roll', 'Sides', '1 roll', 140],
    ['Garden peas', 'Sides', '80g', 55],
    ['Side salad', 'Sides', '1 bowl', 30],
    ['Butter', 'Sides', '1 tsp (10g)', 75],
    ['Cheddar cheese', 'Sides', '30g (matchbox)', 125],
    ['Mayonnaise', 'Sides', '1 tbsp', 100],
    ['Ketchup', 'Sides', '1 tbsp', 20],
    ['Peanut butter', 'Sides', '1 tbsp (15g)', 90],

    // Fruit & veg
    ['Apple', 'Fruit', '1 medium', 55],
    ['Banana', 'Fruit', '1 medium', 105],
    ['Orange', 'Fruit', '1 medium', 60],
    ['Grapes', 'Fruit', '80g handful', 55],
    ['Strawberries', 'Fruit', '80g', 25],
    ['Pear', 'Fruit', '1 medium', 60],
    ['Satsuma', 'Fruit', '1 fruit', 30],
    ['Avocado', 'Fruit', '½ avocado', 160],
    ['Carrot sticks', 'Fruit', '80g', 30],

    // Snacks & sweets
    ['Crisps, ready salted', 'Snacks', '25g bag', 130],
    ['Crisps, Walkers', 'Snacks', '32.5g bag', 170],
    ['Pringles', 'Snacks', '40g tube', 210],
    ['Mars bar', 'Snacks', '51g bar', 230],
    ['Snickers', 'Snacks', '48g bar', 245],
    ['Twix', 'Snacks', '50g (2 fingers)', 250],
    ['KitKat (4 finger)', 'Snacks', '41.5g bar', 210],
    ['Dairy Milk', 'Snacks', '45g bar', 240],
    ['Galaxy', 'Snacks', '42g bar', 230],
    ['Maltesers', 'Snacks', '37g bag', 185],
    ['Haribo', 'Snacks', '45g bag', 155],
    ['Digestive biscuit', 'Snacks', '1 biscuit', 70],
    ['Chocolate digestive', 'Snacks', '1 biscuit', 85],
    ['Rich tea biscuit', 'Snacks', '1 biscuit', 38],
    ['Custard cream', 'Snacks', '1 biscuit', 58],
    ['Doughnut, jam', 'Snacks', '1 doughnut', 250],
    ['Muffin, chocolate', 'Snacks', '1 muffin', 450],
    ['Flapjack', 'Snacks', '1 bar', 320],
    ['Cereal bar', 'Snacks', '1 bar', 120],
    ['Protein bar', 'Snacks', '1 bar (60g)', 210],
    ['Nuts, mixed', 'Snacks', '30g handful', 180],
    ['Popcorn, sweet', 'Snacks', '30g', 140],
    ['Ice cream', 'Snacks', '2 scoops', 270],
    ['Cake, Victoria sponge', 'Snacks', '1 slice', 300],

    // Drinks
    ['Costa latte, medium (semi-skimmed)', 'Drinks', '1 cup', 180],
    ['Costa cappuccino, medium', 'Drinks', '1 cup', 125],
    ['Costa flat white', 'Drinks', '1 cup', 110],
    ['Costa americano', 'Drinks', '1 cup', 10],
    ['Costa hot chocolate, medium', 'Drinks', '1 cup', 300],
    ['Tea with milk', 'Drinks', '1 mug', 20],
    ['Tea with milk & 1 sugar', 'Drinks', '1 mug', 40],
    ['Coffee, instant with milk', 'Drinks', '1 mug', 25],
    ['Coca-Cola', 'Drinks', '500ml bottle', 210],
    ['Coca-Cola', 'Drinks', '330ml can', 139],
    ['Diet Coke / Coke Zero', 'Drinks', '500ml bottle', 1],
    ['Red Bull', 'Drinks', '250ml can', 115],
    ['Monster Energy', 'Drinks', '500ml can', 235],
    ['Lucozade Energy', 'Drinks', '380ml bottle', 105],
    ['Orange juice', 'Drinks', '250ml glass', 110],
    ['Milk, semi-skimmed', 'Drinks', '250ml glass', 115],
    ['Smoothie', 'Drinks', '250ml bottle', 130],
    ['Protein shake (with water)', 'Drinks', '1 scoop', 120],
    ['Beer, lager', 'Drinks', '1 pint', 215],
    ['Cider', 'Drinks', '1 pint', 215],
    ['Wine, red or white', 'Drinks', '175ml glass', 160],
    ['Spirit with diet mixer', 'Drinks', '25ml single', 55],
    ['Water', 'Drinks', '1 glass', 0]
  ].map(([name, cat, portion, kcal], i) => ({ id: i + 1, name, cat, portion, kcal }));

  const MEALS = [['breakfast', 'Breakfast'], ['lunch', 'Lunch'], ['dinner', 'Dinner'], ['snack', 'Snacks']];
  const DEFAULT_TARGET = 2000;

  // ── what you need: Mifflin-St Jeor resting burn × activity, then the goal ──
  const ACTIVITY = [
    ['sedentary', 'Mostly sitting (desk job, little exercise)', 1.2],
    ['light', 'Lightly active (on feet some of the day, or exercise 1–3 days a week)', 1.375],
    ['moderate', 'Active (on feet most of the day, or exercise 3–5 days a week)', 1.55],
    ['very', 'Very active (physical job, or hard exercise 6–7 days a week)', 1.725],
    ['extra', 'Extremely active (heavy manual work plus training)', 1.9]
  ];
  // kcal a day vs maintenance. 7,700 kcal ≈ 1 kg of body fat, so 550/day ≈ 0.5 kg a week.
  const GOALS = [
    ['lose1', 'Lose about 1 kg (2 lb) a week', -1100],
    ['lose05', 'Lose about 0.5 kg (1 lb) a week', -550],
    ['lose025', 'Lose about 0.25 kg (½ lb) a week', -275],
    ['maintain', 'Stay the same weight', 0],
    ['gain025', 'Gain about 0.25 kg (½ lb) a week', 275],
    ['gain05', 'Gain about 0.5 kg (1 lb) a week', 550]
  ];
  const FLOOR = { male: 1500, female: 1200 };   // common safe minimum without medical supervision

  // {sex, age, heightCm, weightKg, activity, goal} → {bmr, maintenance, target, floored} or null.
  function needs(p) {
    if (!p) return null;
    const age = Number(p.age), h = Number(p.heightCm), w = Number(p.weightKg);
    if (!(age >= 14 && age <= 100 && h >= 120 && h <= 230 && w >= 30 && w <= 300)) return null;
    if (p.sex !== 'male' && p.sex !== 'female') return null;
    const act = ACTIVITY.find(a => a[0] === p.activity), goal = GOALS.find(g => g[0] === p.goal);
    if (!act || !goal) return null;
    const bmr = 10 * w + 6.25 * h - 5 * age + (p.sex === 'male' ? 5 : -161);
    const maintenance = bmr * act[2];
    const raw = maintenance + goal[2];
    const floor = FLOOR[p.sex];
    const r50 = (n) => Math.round(n / 50) * 50;
    return { bmr: Math.round(bmr), maintenance: r50(maintenance), target: r50(Math.max(raw, floor)), floored: raw < floor };
  }

  const DAY = 86400000;
  const iso = (d) => new Date(d).toISOString().slice(0, 10);
  const addDays = (isoDay, n) => iso(new Date(isoDay + 'T12:00:00Z').getTime() + n * DAY);
  const localToday = () => { const d = new Date(); return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`; };
  const esc = (s) => String(s == null ? '' : s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const fmt = (n) => Math.round(n).toLocaleString('en-GB');

  // Foods matching every word typed, names that START with the query first.
  function search(q, limit) {
    const words = String(q || '').toLowerCase().split(/\s+/).filter(Boolean);
    if (!words.length) return [];
    const hits = FOODS.filter(f => {
      const hay = (f.name + ' ' + f.cat + ' ' + f.portion).toLowerCase();
      return words.every(w => hay.includes(w));
    });
    const first = words[0];
    hits.sort((a, b) => {
      const as = a.name.toLowerCase().startsWith(first) ? 0 : 1, bs = b.name.toLowerCase().startsWith(first) ? 0 : 1;
      return as - bs || a.name.localeCompare(b.name);
    });
    return hits.slice(0, limit || 12);
  }

  const dayTotal = (entries) => (entries || []).reduce((n, e) => n + (Number(e.kcal) || 0), 0);

  // Where a day stands against the target.
  function status(eaten, target) {
    const t = Number(target) || 0;
    const remaining = t - eaten;
    const pct = t > 0 ? Math.round((eaten / t) * 100) : 0;
    return { eaten, target: t, remaining, pct, over: eaten > t };
  }

  // One row per day of the month: {day, eaten, target, diff, pct, logged}.
  function monthRows(month, entries, target) {
    const [y, m] = month.split('-').map(Number);
    const dim = new Date(Date.UTC(y, m, 0)).getUTCDate();
    const by = {};
    (entries || []).forEach(e => { by[e.day] = (by[e.day] || 0) + (Number(e.kcal) || 0); });
    const rows = [];
    for (let d = 1; d <= dim; d++) {
      const day = `${month}-${String(d).padStart(2, '0')}`;
      const logged = day in by;
      const eaten = by[day] || 0;
      rows.push({ day, eaten, target, diff: eaten - target, pct: target ? Math.round(eaten / target * 100) : 0, logged });
    }
    return rows;
  }

  // ── storage: this phone/browser only (no accounts) ──
  const LS_KEY = 'calorie_counter_v1';
  const lsRead = () => { try { const v = JSON.parse(localStorage.getItem(LS_KEY)); return v && Array.isArray(v.entries) ? v : { target: null, entries: [] }; } catch (_) { return { target: null, entries: [] }; } };
  const lsWrite = (v) => { try { localStorage.setItem(LS_KEY, JSON.stringify(v)); } catch (_) { throw new Error('this browser is not letting the page save (private mode?)'); } };

  function store() {
    return {
      local: true,
      async init() {},
      async target() { return lsRead().target || DEFAULT_TARGET; },
      async setTarget(kcal) { const v = lsRead(); v.target = kcal; lsWrite(v); },
      profile() { return lsRead().profile || null; },
      setProfile(p) { const v = lsRead(); v.profile = p; lsWrite(v); },
      async range(from, to) { return lsRead().entries.filter(e => e.day >= from && e.day <= to); },
      async add(e) { const v = lsRead(); const row = { ...e, id: 'l' + Date.now() + Math.random().toString(36).slice(2, 6), created_at: new Date().toISOString() }; v.entries.push(row); lsWrite(v); return row; },
      async remove(id) { const v = lsRead(); v.entries = v.entries.filter(e => e.id !== id); lsWrite(v); }
    };
  }

  // Back up to a file / restore from one, so a new phone or a cleared browser loses nothing.
  function backup() {
    const blob = new Blob([JSON.stringify(lsRead(), null, 1)], { type: 'application/json' });
    const a = document.createElement('a'); a.href = URL.createObjectURL(blob); a.download = `calorie-counter-backup-${localToday()}.json`;
    document.body.appendChild(a); a.click(); a.remove(); setTimeout(() => URL.revokeObjectURL(a.href), 1000);
  }
  function restore(file) {
    return file.text().then(t => {
      const v = JSON.parse(t);
      if (!v || !Array.isArray(v.entries)) throw new Error('not a calorie counter backup');
      const cur = lsRead(); const ids = new Set(cur.entries.map(e => e.id));
      v.entries.forEach(e => { if (e && e.day && e.food && !ids.has(e.id)) cur.entries.push(e); });
      if (v.target && !cur.target) cur.target = v.target;
      lsWrite(cur); return v.entries.length;
    });
  }

  // ── page ──
  const st = { day: null, month: null, target: DEFAULT_TARGET, entries: [], monthEntries: [], pick: null, store: null, host: null };

  const card = (label, value, sub, colour) => `<div style="background:var(--card);border:1px solid var(--border);border-radius:12px;padding:14px 16px;box-shadow:var(--shadow-sm)">
      <div style="font-size:11px;letter-spacing:.08em;text-transform:uppercase;color:var(--muted);font-weight:700">${label}</div>
      <div style="font-size:26px;font-weight:800;margin-top:4px;color:${colour || 'var(--text)'};font-variant-numeric:tabular-nums">${value}</div>
      ${sub ? `<div style="font-size:12px;color:var(--muted);margin-top:2px">${sub}</div>` : ''}</div>`;
  const inputCss = 'padding:8px 12px;background:var(--card);border:1px solid var(--border-strong);border-radius:8px;color:var(--text);font-size:14px;font-family:inherit;';
  const btnCss = 'padding:8px 14px;border:1px solid var(--border-strong);border-radius:8px;background:var(--card);color:var(--text);font-weight:600;font-size:13px;cursor:pointer;font-family:inherit;';
  const RED = '#dc2626', GREEN = '#16a34a';

  async function mount(host) {
    if (!host) return;
    st.host = host;
    if (!st.store) { st.store = store(); await st.store.init(); }
    if (!st.day) st.day = localToday();
    host.innerHTML = `
      <div class="top-bar" style="flex-wrap:wrap;gap:10px;align-items:center;">
        <div style="display:flex;align-items:center;gap:6px;flex-wrap:wrap;">
          <button data-cal="prev" style="${btnCss}" title="Previous day">◀</button>
          <input type="date" data-cal="date" style="${inputCss}font-weight:600">
          <button data-cal="next" style="${btnCss}" title="Next day">▶</button>
          <button data-cal="today" style="${btnCss}">Today</button>
          <span data-cal="status" style="font-size:13px;color:var(--muted);"></span>
        </div>
        <div style="margin-left:auto;display:flex;align-items:center;gap:8px;flex-wrap:wrap;">
          <label style="font-size:13px;color:var(--muted);font-weight:600">Daily target</label>
          <input type="number" min="500" max="10000" step="50" data-cal="target" style="${inputCss}width:110px;font-weight:700;text-align:right">
          <span style="font-size:13px;color:var(--muted)">kcal</span>
          <button data-cal="save-target" style="${btnCss}">Set target</button>
        </div>
      </div>

      <details data-cal="calc" style="margin-top:12px;background:var(--card);border:1px solid var(--border);border-radius:12px;box-shadow:var(--shadow-sm)">
        <summary style="padding:12px 16px;cursor:pointer;font-weight:800">🎯 Work out my calories <span data-cal="calc-sum" style="font-weight:400;font-size:13px;color:var(--muted)"></span></summary>
        <div style="padding:0 16px 16px">
          <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(140px,1fr));gap:8px">
            <label style="font-size:12px;color:var(--muted)">Sex<select data-cal="p-sex" style="${inputCss}width:100%;box-sizing:border-box;margin-top:3px"><option value="female">Female</option><option value="male">Male</option></select></label>
            <label style="font-size:12px;color:var(--muted)">Age<input type="number" min="14" max="100" data-cal="p-age" style="${inputCss}width:100%;box-sizing:border-box;margin-top:3px"></label>
            <label style="font-size:12px;color:var(--muted)">Units<select data-cal="p-units" style="${inputCss}width:100%;box-sizing:border-box;margin-top:3px"><option value="imperial">Stone &amp; feet</option><option value="metric">kg &amp; cm</option></select></label>
          </div>
          <div data-cal="p-imperial" style="display:grid;grid-template-columns:repeat(auto-fit,minmax(110px,1fr));gap:8px;margin-top:8px">
            <label style="font-size:12px;color:var(--muted)">Height ft<input type="number" min="4" max="7" data-cal="p-ft" style="${inputCss}width:100%;box-sizing:border-box;margin-top:3px"></label>
            <label style="font-size:12px;color:var(--muted)">in<input type="number" min="0" max="11.9" step="0.5" data-cal="p-in" style="${inputCss}width:100%;box-sizing:border-box;margin-top:3px"></label>
            <label style="font-size:12px;color:var(--muted)">Weight st<input type="number" min="4" max="45" data-cal="p-st" style="${inputCss}width:100%;box-sizing:border-box;margin-top:3px"></label>
            <label style="font-size:12px;color:var(--muted)">lb<input type="number" min="0" max="13.9" step="0.5" data-cal="p-lb" style="${inputCss}width:100%;box-sizing:border-box;margin-top:3px"></label>
          </div>
          <div data-cal="p-metric" style="display:none;grid-template-columns:repeat(auto-fit,minmax(140px,1fr));gap:8px;margin-top:8px">
            <label style="font-size:12px;color:var(--muted)">Height cm<input type="number" min="120" max="230" data-cal="p-cm" style="${inputCss}width:100%;box-sizing:border-box;margin-top:3px"></label>
            <label style="font-size:12px;color:var(--muted)">Weight kg<input type="number" min="30" max="300" step="0.1" data-cal="p-kg" style="${inputCss}width:100%;box-sizing:border-box;margin-top:3px"></label>
          </div>
          <label style="display:block;font-size:12px;color:var(--muted);margin-top:8px">How active are you?<select data-cal="p-activity" style="${inputCss}width:100%;box-sizing:border-box;margin-top:3px">${ACTIVITY.map(([k, l]) => `<option value="${k}">${esc(l)}</option>`).join('')}</select></label>
          <label style="display:block;font-size:12px;color:var(--muted);margin-top:8px">Your goal<select data-cal="p-goal" style="${inputCss}width:100%;box-sizing:border-box;margin-top:3px">${GOALS.map(([k, l]) => `<option value="${k}">${esc(l)}</option>`).join('')}</select></label>
          <div data-cal="p-result" style="margin-top:12px;padding:12px;border-radius:10px;background:var(--card-2);border:1px solid var(--border);font-size:14px;color:var(--muted)">Fill in the boxes above to see what you need.</div>
          <div style="display:flex;gap:10px;align-items:center;margin-top:10px;flex-wrap:wrap">
            <button data-cal="p-use" style="${btnCss}background:var(--accent);color:#fff;border-color:var(--accent)" disabled>Use as my daily target</button>
            <span style="font-size:12px;color:var(--muted)">An estimate from a standard formula (Mifflin-St Jeor), not medical advice. If you are pregnant, under 18 or have a health condition, ask your GP.</span>
          </div>
        </div>
      </details>
      <div data-cal="cards" style="display:grid;grid-template-columns:repeat(auto-fit,minmax(170px,1fr));gap:12px;margin:14px 0 8px;"></div>
      <div data-cal="bar" style="height:12px;border-radius:999px;background:var(--card-2);border:1px solid var(--border);overflow:hidden;margin-bottom:16px"><div style="height:100%;width:0;transition:width .3s"></div></div>

      <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(320px,1fr));gap:16px;align-items:start">
        <div style="background:var(--card);border:1px solid var(--border);border-radius:12px;padding:16px;box-shadow:var(--shadow-sm)">
          <div style="font-weight:800;margin-bottom:10px">➕ Add food</div>
          <div style="position:relative">
            <input type="search" data-cal="q" placeholder="🔍 Search foods… e.g. latte, banana, meal deal" autocomplete="off" style="${inputCss}width:100%;box-sizing:border-box">
            <div data-cal="results" style="display:none;position:absolute;z-index:20;left:0;right:0;top:calc(100% + 4px);max-height:300px;overflow:auto;background:var(--card);border:1px solid var(--border-strong);border-radius:10px;box-shadow:var(--shadow-sm)"></div>
          </div>
          <div style="margin-top:8px;display:flex;gap:6px;flex-wrap:wrap;align-items:center">
            <label style="font-size:12.5px;color:var(--muted)">or browse</label>
            <select data-cal="cat" style="${inputCss}padding:6px 10px;font-size:13px"><option value="">Category…</option>${[...new Set(FOODS.map(f => f.cat))].map(c => `<option>${esc(c)}</option>`).join('')}</select>
          </div>
          <div data-cal="picked" style="margin-top:12px;padding:10px 12px;border-radius:8px;background:var(--card-2);border:1px dashed var(--border-strong);font-size:13px;color:var(--muted)">Pick a food from the list, or type your own below.</div>
          <div style="display:grid;grid-template-columns:1fr 1fr;gap:8px;margin-top:10px">
            <label style="font-size:12px;color:var(--muted)">Food<input data-cal="name" style="${inputCss}width:100%;box-sizing:border-box;margin-top:3px" placeholder="Custom food name"></label>
            <label style="font-size:12px;color:var(--muted)">kcal per portion<input type="number" min="0" data-cal="kcal" style="${inputCss}width:100%;box-sizing:border-box;margin-top:3px"></label>
            <label style="font-size:12px;color:var(--muted)">Portions<input type="number" min="0.25" max="50" step="0.25" value="1" data-cal="qty" style="${inputCss}width:100%;box-sizing:border-box;margin-top:3px"></label>
            <label style="font-size:12px;color:var(--muted)">Meal<select data-cal="meal" style="${inputCss}width:100%;box-sizing:border-box;margin-top:3px">${MEALS.map(([k, l]) => `<option value="${k}">${l}</option>`).join('')}</select></label>
          </div>
          <div style="display:flex;align-items:center;gap:10px;margin-top:12px">
            <button data-cal="add" style="${btnCss}background:var(--accent);color:var(--bg);border-color:var(--accent)">Add to day</button>
            <span data-cal="line-total" style="font-size:13px;color:var(--muted)"></span>
          </div>
        </div>
        <div style="background:var(--card);border:1px solid var(--border);border-radius:12px;padding:16px;box-shadow:var(--shadow-sm)">
          <div style="font-weight:800;margin-bottom:6px" data-cal="day-title"></div>
          <div data-cal="list"></div>
        </div>
      </div>

      <div style="display:flex;align-items:center;gap:8px;margin:22px 0 8px">
        <div style="font-weight:800" data-cal="month-title"></div>
        <span style="font-size:12px;color:var(--muted)">Click a day to open it. Red is over target.</span>
      </div>
      <div style="overflow:auto;border:1px solid var(--border);border-radius:12px;background:var(--card);box-shadow:var(--shadow-sm)">
        <table class="table" data-cal="month" style="width:100%;font-variant-numeric:tabular-nums"></table>
      </div>
      <div style="display:flex;gap:8px;flex-wrap:wrap;align-items:center;margin:16px 0 4px">
        <button data-cal="backup" style="${btnCss}">⬇ Back up</button>
        <label style="${btnCss}">⬆ Restore<input type="file" accept="application/json,.json" data-cal="restore" style="display:none"></label>
        <span style="font-size:12px;color:var(--muted)">Your log is saved on this phone only. Back up before changing phone or clearing your browser.</span>
      </div>`;

    const $ = (k) => host.querySelector(`[data-cal="${k}"]`);
    st.target = await st.store.target().catch(() => DEFAULT_TARGET);
    $('target').value = st.target;

    const go = (day) => { st.day = day; loadDay(); };
    $('prev').onclick = () => go(addDays(st.day, -1));
    $('next').onclick = () => go(addDays(st.day, 1));
    $('today').onclick = () => go(localToday());
    $('date').onchange = (e) => { if (e.target.value) go(e.target.value); };
    // ── calculator ──
    const num = (k) => { const v = $(k).value; return v === '' ? NaN : Number(v); };
    const readProfile = () => {
      const metric = $('p-units').value === 'metric';
      const heightCm = metric ? num('p-cm') : ((num('p-ft') || 0) * 12 + (num('p-in') || 0)) * 2.54;
      const weightKg = metric ? num('p-kg') : ((num('p-st') || 0) * 14 + (num('p-lb') || 0)) * 0.45359237;
      return { sex: $('p-sex').value, age: num('p-age'), units: metric ? 'metric' : 'imperial', heightCm: Math.round(heightCm * 10) / 10, weightKg: Math.round(weightKg * 10) / 10, activity: $('p-activity').value, goal: $('p-goal').value };
    };
    const showUnits = () => { const m = $('p-units').value === 'metric'; $('p-metric').style.display = m ? 'grid' : 'none'; $('p-imperial').style.display = m ? 'none' : 'grid'; };
    const calc = () => {
      const p = readProfile(), n = needs(p);
      try { st.store.setProfile(p); } catch (_) {}
      $('p-use').disabled = !n;
      if (!n) { $('p-result').innerHTML = 'Fill in the boxes above to see what you need.'; $('calc-sum').textContent = ''; return; }
      const g = GOALS.find(x => x[0] === p.goal);
      $('p-result').innerHTML = `<div style="display:flex;gap:18px;flex-wrap:wrap;color:var(--text)">
          <div><div style="font-size:11px;letter-spacing:.08em;text-transform:uppercase;color:var(--muted);font-weight:700">Resting burn</div><div style="font-size:20px;font-weight:800">${fmt(n.bmr)}</div></div>
          <div><div style="font-size:11px;letter-spacing:.08em;text-transform:uppercase;color:var(--muted);font-weight:700">To stay the same</div><div style="font-size:20px;font-weight:800">${fmt(n.maintenance)}</div></div>
          <div><div style="font-size:11px;letter-spacing:.08em;text-transform:uppercase;color:var(--muted);font-weight:700">For your goal</div><div style="font-size:26px;font-weight:800;color:var(--accent)">${fmt(n.target)} kcal</div></div></div>
        <div style="margin-top:6px;font-size:12.5px">${esc(g[1])}.${n.floored ? ` Raised to ${fmt(n.target)}, the usual safe minimum: going lower should only be done with a doctor.` : ''}</div>`;
      $('calc-sum').textContent = `· you need about ${fmt(n.target)} kcal a day`;
    };
    const prof = st.store.profile();
    if (prof) {
      $('p-sex').value = prof.sex || 'female'; $('p-age').value = prof.age || ''; $('p-units').value = prof.units || 'imperial';
      $('p-activity').value = prof.activity || 'light'; $('p-goal').value = prof.goal || 'maintain';
      if (prof.heightCm) { $('p-cm').value = prof.heightCm; const ti = prof.heightCm / 2.54; $('p-ft').value = Math.floor(ti / 12); $('p-in').value = Math.round((ti % 12) * 2) / 2; }
      if (prof.weightKg) { $('p-kg').value = prof.weightKg; const tl = prof.weightKg / 0.45359237; $('p-st').value = Math.floor(tl / 14); $('p-lb').value = Math.round((tl % 14) * 2) / 2; }
    } else { $('p-activity').value = 'light'; $('p-goal').value = 'maintain'; $('calc').open = true; }
    showUnits(); calc();
    $('p-units').onchange = () => { showUnits(); calc(); };
    ['p-sex', 'p-age', 'p-ft', 'p-in', 'p-st', 'p-lb', 'p-cm', 'p-kg', 'p-activity', 'p-goal'].forEach(k => { $(k).oninput = calc; $(k).onchange = calc; });
    $('p-use').onclick = async () => {
      const n = needs(readProfile()); if (!n) return;
      try { await st.store.setTarget(n.target); st.target = n.target; $('target').value = n.target; say(`Target set to ${fmt(n.target)} kcal`); render(); renderMonth(); $('calc').open = false; }
      catch (e) { say('Could not save: ' + e.message, true); }
    };

    $('save-target').onclick = async () => {
      const v = Math.round(Number($('target').value));
      if (!(v >= 500 && v <= 10000)) return say('Target must be 500 to 10,000 kcal', true);
      try { await st.store.setTarget(v); st.target = v; say('Target saved'); render(); renderMonth(); } catch (e) { say('Could not save: ' + e.message, true); }
    };

    const showResults = (list) => {
      const box = $('results');
      if (!list.length) { box.style.display = 'none'; box.innerHTML = ''; return; }
      box.innerHTML = list.map(f => `<div data-food="${f.id}" style="padding:8px 12px;cursor:pointer;display:flex;gap:10px;align-items:baseline;border-bottom:1px solid var(--border)">
          <span style="flex:1"><b>${esc(f.name)}</b> <span style="color:var(--muted);font-size:12px">${esc(f.portion)}</span></span>
          <span style="font-weight:700;white-space:nowrap">${fmt(f.kcal)} kcal</span></div>`).join('');
      box.style.display = '';
      box.querySelectorAll('[data-food]').forEach(el => {
        el.onmouseenter = () => { el.style.background = 'var(--card-2)'; };
        el.onmouseleave = () => { el.style.background = ''; };
        el.onmousedown = (ev) => { ev.preventDefault(); pick(FOODS.find(f => f.id === Number(el.dataset.food))); };
      });
    };
    $('q').oninput = (e) => showResults(search(e.target.value, 15));
    $('q').onblur = () => setTimeout(() => { $('results').style.display = 'none'; }, 150);
    $('q').onkeydown = (e) => { if (e.key === 'Enter') { const r = search(e.target.value, 1); if (r[0]) pick(r[0]); } };
    $('cat').onchange = (e) => { const c = e.target.value; showResults(c ? FOODS.filter(f => f.cat === c) : []); $('q').focus(); };

    const lineTotal = () => {
      const k = Number($('kcal').value) || 0, q = Number($('qty').value) || 0;
      $('line-total').textContent = k && q ? `= ${fmt(k * q)} kcal` : '';
    };
    $('kcal').oninput = () => { st.pick = null; $('picked').innerHTML = 'Custom food'; lineTotal(); };
    $('name').oninput = () => { if (st.pick && $('name').value !== st.pick.name) { st.pick = null; $('picked').innerHTML = 'Custom food'; } };
    $('qty').oninput = lineTotal;

    function pick(f) {
      if (!f) return;
      st.pick = f;
      $('name').value = f.name; $('kcal').value = f.kcal; $('qty').value = 1;
      $('picked').innerHTML = `<b style="color:var(--text)">${esc(f.name)}</b> · ${esc(f.portion)} · <b style="color:var(--text)">${fmt(f.kcal)} kcal</b> <span style="font-size:11px">(${esc(f.cat)})</span>`;
      $('q').value = ''; showResults([]);
      if (f.cat === 'Breakfast') $('meal').value = 'breakfast';
      else if (f.cat === 'Lunch') $('meal').value = 'lunch';
      else if (f.cat === 'Dinner' || f.cat === 'Takeaway') $('meal').value = 'dinner';
      else if (f.cat === 'Snacks') $('meal').value = 'snack';
      lineTotal();
    }

    $('add').onclick = async () => {
      const name = $('name').value.trim(), per = Number($('kcal').value), qty = Number($('qty').value) || 1;
      if (!name) return say('Pick a food or type a name', true);
      if (!(per >= 0) || $('kcal').value === '') return say('Enter the calories', true);
      if (!(qty > 0 && qty <= 50)) return say('Portions must be between 0.25 and 50', true);
      const row = { day: st.day, meal: $('meal').value, food: name.slice(0, 120), portion: st.pick ? st.pick.portion : null, qty, kcal: Math.round(per * qty) };
      try {
        const saved = await st.store.add(row);
        st.entries.push(saved);
        if (st.day.slice(0, 7) === st.month) st.monthEntries.push(saved);
        st.pick = null; $('name').value = ''; $('kcal').value = ''; $('qty').value = 1;
        $('picked').innerHTML = 'Pick a food from the list, or type your own below.'; lineTotal();
        say(`Added ${fmt(row.kcal)} kcal`); render(); renderMonth();
      } catch (e) { say('Could not add: ' + e.message, true); }
    };

    $('backup').onclick = backup;
    $('restore').onchange = async (ev) => {
      const f = ev.target.files && ev.target.files[0]; if (!f) return;
      try { const n = await restore(f); st.target = await st.store.target(); $('target').value = st.target; st.month = null; await loadDay(); say(`Restored ${n} entries`); }
      catch (e) { say('Could not restore: ' + e.message, true); }
      ev.target.value = '';
    };
    st.month = null;
    await loadDay();
  }

  function say(msg, bad) {
    const el = st.host && st.host.querySelector('[data-cal="status"]'); if (!el) return;
    el.textContent = msg; el.style.color = bad ? RED : GREEN;
    clearTimeout(say.t); say.t = setTimeout(() => { el.textContent = ''; }, 3500);
  }

  async function loadDay() {
    const host = st.host; const $ = (k) => host.querySelector(`[data-cal="${k}"]`);
    $('date').value = st.day;
    const month = st.day.slice(0, 7);
    try {
      if (month !== st.month) {
        const [y, m] = month.split('-').map(Number);
        const last = `${month}-${String(new Date(Date.UTC(y, m, 0)).getUTCDate()).padStart(2, '0')}`;
        st.monthEntries = await st.store.range(`${month}-01`, last);
        st.month = month;
      }
      st.entries = st.monthEntries.filter(e => e.day === st.day);
    } catch (e) { say('Could not load: ' + e.message, true); st.entries = []; }
    render(); renderMonth();
  }

  function render() {
    const host = st.host; const $ = (k) => host.querySelector(`[data-cal="${k}"]`);
    const s = status(dayTotal(st.entries), st.target);
    const col = s.over ? RED : GREEN;
    $('cards').innerHTML =
      card('Target', fmt(s.target), 'kcal per day') +
      card('Eaten', fmt(s.eaten), `${s.pct}% of target`, s.eaten ? col : null) +
      card(s.over ? 'Over by' : 'Remaining', fmt(Math.abs(s.remaining)), 'kcal', col) +
      card('Items', String(st.entries.length), st.entries.length === 1 ? 'entry' : 'entries');
    const bar = $('bar').firstElementChild;
    bar.style.width = Math.min(100, s.pct) + '%'; bar.style.background = s.over ? RED : (s.pct >= 90 ? '#d97706' : GREEN);

    const today = localToday();
    const label = new Date(st.day + 'T12:00:00Z').toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'long', timeZone: 'UTC' });
    $('day-title').textContent = (st.day === today ? 'Today · ' : '') + label;
    if (!st.entries.length) { $('list').innerHTML = '<p style="color:var(--muted);font-size:13px;margin:8px 0">Nothing logged for this day yet.</p>'; return; }
    $('list').innerHTML = MEALS.map(([k, l]) => {
      const rows = st.entries.filter(e => e.meal === k);
      if (!rows.length) return '';
      return `<div style="margin-top:10px"><div style="display:flex;font-size:11px;letter-spacing:.08em;text-transform:uppercase;color:var(--muted);font-weight:700;border-bottom:1px solid var(--border);padding-bottom:4px">
          <span style="flex:1">${l}</span><span>${fmt(dayTotal(rows))} kcal</span></div>
        ${rows.map(e => `<div style="display:flex;align-items:center;gap:8px;padding:6px 0;border-bottom:1px solid var(--border);font-size:13.5px">
          <span style="flex:1">${esc(e.food)}<span style="color:var(--muted);font-size:12px">${e.portion ? ' · ' + esc(e.portion) : ''}${Number(e.qty) !== 1 ? ' × ' + Number(e.qty) : ''}</span></span>
          <b style="font-variant-numeric:tabular-nums">${fmt(e.kcal)}</b>
          <button data-del="${esc(e.id)}" title="Remove" style="border:none;background:none;color:var(--muted);cursor:pointer;font-size:15px;padding:2px 6px">✕</button></div>`).join('')}</div>`;
    }).join('');
    $('list').querySelectorAll('[data-del]').forEach(b => b.onclick = async () => {
      const id = b.dataset.del;
      try {
        await st.store.remove(id);
        st.entries = st.entries.filter(e => String(e.id) !== id);
        st.monthEntries = st.monthEntries.filter(e => String(e.id) !== id);
        render(); renderMonth();
      } catch (e) { say('Could not remove: ' + e.message, true); }
    });
  }

  function renderMonth() {
    const host = st.host; const $ = (k) => host.querySelector(`[data-cal="${k}"]`);
    if (!st.month) return;
    const [y, m] = st.month.split('-').map(Number);
    $('month-title').textContent = new Date(Date.UTC(y, m - 1, 1)).toLocaleDateString('en-GB', { month: 'long', year: 'numeric', timeZone: 'UTC' });
    const rows = monthRows(st.month, st.monthEntries, st.target);
    const logged = rows.filter(r => r.logged);
    const today = localToday();
    const WD = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    const th = (t, right) => `<th style="text-align:${right ? 'right' : 'left'};font-size:11px;letter-spacing:.08em;text-transform:uppercase;color:var(--muted);padding:10px 14px">${t}</th>`;
    $('month').innerHTML = `<thead><tr>${th('Day')}${th('Eaten', 1)}${th('Target', 1)}${th('Difference', 1)}${th('% of target', 1)}</tr></thead><tbody>` +
      rows.map(r => {
        const d = Number(r.day.slice(8)), wd = WD[new Date(r.day + 'T12:00:00Z').getUTCDay()];
        const sel = r.day === st.day, isToday = r.day === today, over = r.logged && r.diff > 0;
        const c = over ? RED : GREEN;
        return `<tr data-day="${r.day}" style="cursor:pointer;${sel ? 'background:rgba(245,158,11,.10);' : ''}">
          <td style="padding:8px 14px;font-weight:700;${isToday ? 'color:#d97706;' : ''}">${wd} <span style="color:var(--muted);font-weight:400;margin-left:8px">${d}</span></td>
          <td style="padding:8px 14px;text-align:right">${r.logged ? fmt(r.eaten) : ''}</td>
          <td style="padding:8px 14px;text-align:right;color:var(--muted)">${r.logged ? fmt(r.target) : ''}</td>
          <td style="padding:8px 14px;text-align:right;font-weight:700;color:${c};${over ? 'background:rgba(220,38,38,.10);' : ''}">${r.logged ? (r.diff > 0 ? '+' : '') + fmt(r.diff) : ''}</td>
          <td style="padding:8px 14px;text-align:right;font-weight:700;color:${c}">${r.logged ? r.pct + '%' : ''}</td></tr>`;
      }).join('') +
      (logged.length ? `<tr style="border-top:2px solid var(--border-strong)">
          <td style="padding:10px 14px;font-weight:800">Average <span style="color:var(--muted);font-weight:400;font-size:12px">(${logged.length} day${logged.length === 1 ? '' : 's'} logged)</span></td>
          <td style="padding:10px 14px;text-align:right;font-weight:800">${fmt(dayTotal(logged.map(r => ({ kcal: r.eaten }))) / logged.length)}</td>
          <td style="padding:10px 14px;text-align:right;color:var(--muted)">${fmt(st.target)}</td>
          <td colspan="2" style="padding:10px 14px;text-align:right;font-size:13px">${logged.filter(r => r.diff <= 0).length} on target · <span style="color:${RED}">${logged.filter(r => r.diff > 0).length} over</span></td></tr>` : '') +
      '</tbody>';
    $('month').querySelectorAll('tr[data-day]').forEach(tr => tr.onclick = () => { st.day = tr.dataset.day; loadDay(); host.scrollIntoView({ behavior: 'smooth', block: 'start' }); });
  }

  const api = { mount, backup, restore, needs, ACTIVITY, GOALS, search, dayTotal, status, monthRows, FOODS, MEALS, DEFAULT_TARGET };
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
  else root.Calories = api;
})(typeof window !== 'undefined' ? window : globalThis);
