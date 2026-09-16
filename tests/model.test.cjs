const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');
const path = require('node:path');
const i18n = vm.createContext({});
vm.runInContext(fs.readFileSync(path.join(__dirname, '../I18n.js'), 'utf8'), i18n);
const model = vm.createContext({ I18n: i18n });
vm.runInContext(fs.readFileSync(path.join(__dirname, '../Model.js'), 'utf8').replace(/^\.import .*\n/gm, ''), model);
const plain = value => JSON.parse(JSON.stringify(value));
const appearance = vm.createContext({});
vm.runInContext(fs.readFileSync(path.join(__dirname, '../Appearance.js'), 'utf8'), appearance);
const colorDefaults = {colorMode:'adaptive',colorScope:'theme',themeColors:{},colorPresets:[]};
const legacyColor = {colorMode:'custom',colorScope:'all',themeColors:{},colorPresets:[]};
const monitor = (name, id, special = '') => ({ name, id, specialWorkspace: { name: special } });
const window = (address, extra = {}) => ({ address, class: 'test', title: 'Test window', mapped: true,
  workspace: { name: 'special:scratchpad' }, ...extra });
const screens = [monitor('DP-1', 0), monitor('DP-3', 1)];
const state = (clients, monitors = screens, screen = 'DP-1', active = '') =>
  plain(model.summarize(clients, monitors, 'scratchpad', screen, active));

test('empty and hidden are different states', () => {
  assert.equal(state([]).status, 'empty');
  assert.equal(state([window('0x1')]).status, 'hidden');
});

test('HEX input accepts shorthand and full RGB, rejects partial/unsafe input', () => {
  assert.equal(appearance.hex('#abc'), '#AABBCC');
  assert.equal(appearance.hex(' 34f0aB '), '#34F0AB');
  for (const invalid of ['', '#12', '#1234', '#12345678', 'red', 'url(file://x)', '<script>', '#ZZFFFF'])
    assert.equal(appearance.hex(invalid), '');
});

test('picker HSV matches RGB endpoints and round-trips representative colors', () => {
  assert.equal(appearance.fromHsv(0,1,1),'#FF0000');
  assert.equal(appearance.fromHsv(1/3,1,1),'#00FF00');
  assert.equal(appearance.fromHsv(2/3,1,1),'#0000FF');
  assert.equal(appearance.fromHsv(1,1,1),'#FF0000');
  assert.equal(appearance.fromHsv(0,0,1),'#FFFFFF');
  assert.equal(appearance.fromHsv(0.3,1,0),'#000000');
  for (const color of ['#000000','#FFFFFF','#808080','#7AA2F7','#01FE43','#FAB005','#C0FFEE']) {
    const hsv = appearance.toHsv(color);
    assert.equal(appearance.fromHsv(hsv.h,hsv.s,hsv.v),color);
  }
  assert.equal(appearance.toHsv('bad hex'),null);
  assert.equal(appearance.fromHsv(NaN,1,1),'');
});

test('appearance defaults follow theme and settings updates preserve language', () => {
  assert.deepEqual(plain(appearance.normalize({})),{...colorDefaults,accentColor:'',tooltipStyle:'panel',uiScale:1,barScale:1});
  assert.deepEqual(plain(appearance.normalize({accentColor:'#f80',tooltipStyle:'compact'})),{...legacyColor,accentColor:'#FF8800',tooltipStyle:'compact',uiScale:1,barScale:1});
  const existing={id:'sarr.scratchpeek',language:'pl',workspace:'music',compact:true};
  assert.deepEqual(plain(model.mergeSettings(existing,appearance.normalize({accentColor:'#f80'}),existing.id)),
    {...existing,...legacyColor,accentColor:'#FF8800',tooltipStyle:'panel',uiScale:1,barScale:1});
});

test('window membership, not client.visible, determines occupancy', () => {
  const s = state([window('0x1', { visible: false, hidden: true })]);
  assert.equal(s.count, 1);
  assert.equal(s.status, 'hidden');
});

test('counts every tab once and ignores duplicate IPC entries', () => {
  const group = ['0x1', '0x2', '0x3'];
  const clients = group.map(address => window(address, { grouped: group }));
  const s = state(clients.concat(clients[0]));
  assert.equal(s.count, 3);
  assert.ok(s.windows.every(w => w.grouped));
});

test('excludes ordinary workspaces, other special workspaces, and unmapped windows', () => {
  assert.equal(state([
    window('0x1', { workspace: { name: '1' } }),
    window('0x2', { workspace: { name: 'special:music' } }),
    window('0x3', { mapped: false }), window('0x4')
  ]).count, 1);
});

test('reports openness separately on each monitor', () => {
  const monitors = [monitor('DP-1', 0), monitor('DP-3', 1, 'special:scratchpad')];
  assert.equal(state([window('0x1')], monitors).status, 'elsewhere');
  const here = state([window('0x1')], monitors, 'DP-3');
  assert.equal(here.status, 'here');
  assert.equal(here.monitorId, 1);
  assert.equal(here.focused, false);
});

test('open here does not mean the user is working in the scratchpad', () => {
  const monitors = [monitor('DP-1', 0, 'special:scratchpad')];
  assert.equal(state([window('0x1')], monitors, 'DP-1', '0x1').focused, true);
  assert.equal(state([window('0x1')], monitors, 'DP-1', '0x2').focused, false);
  assert.equal(state([window('0x1')], monitors, 'DP-3', '0x1').focused, false);
});

test('empty but open special workspace remains marked as open', () => {
  assert.equal(state([], [monitor('DP-1', 0, 'special:scratchpad')]).status, 'here');
});

test('an unrelated open special workspace does not light this one up', () => {
  assert.equal(state([window('0x1')], [monitor('DP-1', 0, 'special:music')]).status, 'hidden');
});

test('missing compositor data is unknown, never empty', () => {
  assert.equal(state([], []).status, 'unknown');
  assert.equal(state(null).status, 'unknown');
});

test('disabled monitors cannot keep a scratchpad falsely marked open', () => {
  const monitors = [monitor('DP-1', 0), { ...monitor('DP-3', 1, 'special:scratchpad'), disabled: true }];
  assert.equal(state([window('0x1')], monitors).status, 'hidden');
});

test('custom workspace names work and unsafe names cannot generate dispatches', () => {
  assert.equal(model.summarize([window('0x1', { workspace: { name: 'special:music' } })], screens, 'music', 'DP-1', '').count, 1);
  for (const name of ['', 'a"; os.execute("bad")', '../x', 'special:scratchpad', 'x\ny']) {
    assert.equal(model.validWorkspace(name), false);
    assert.deepEqual(plain(model.toggleCommands(name, 0, true)), []);
  }
});

test('supports both Lua and legacy dispatch syntax without shell interpolation', () => {
  assert.deepEqual(plain(model.toggleCommands('scratchpad', 1, true)), [
    'hl.dsp.focus({ monitor = "1" })', 'hl.dsp.workspace.toggle_special("scratchpad")'
  ]);
  assert.deepEqual(plain(model.toggleCommands('scratchpad', 1, false)), [
    'focusmonitor 1', 'togglespecialworkspace scratchpad'
  ]);
  assert.deepEqual(plain(model.toggleCommands('scratchpad', -1, true)), []);
  assert.equal(model.focusCommand('0xabc', false), 'focuswindow address:0xabc');
  assert.equal(model.focusCommand('0xabc;bad', true), '');
});

test('localization and compact labels preserve state and count', () => {
  assert.equal(model.language('auto', 'pl_PL'), 'pl');
  assert.equal(model.language('en', 'pl_PL'), 'en');
  assert.equal(model.language('auto', 'de_DE'), 'de');
  const s = state([window('0x1')]);
  assert.match(model.label(s, 'pl', false, false), /◌ 1.*ukryty/);
  assert.equal(model.label(s, 'en', true, false), '◌ 1');
  assert.equal(model.label(s, 'en', false, true), '◌\n1');
});

test('all 30 catalogs have every key and preserve named placeholders', () => {
  assert.equal(i18n.languages.length, 30);
  assert.equal(new Set(i18n.languages.map(item => item.code)).size, 30);
  const keys = Object.keys(i18n.catalogs.en).sort();
  const tokens = value => (value.match(/\{[a-zA-Z]+\}/g) || []).sort();
  for (const lang of i18n.languages) {
    const catalog = i18n.catalogs[lang.code];
    assert.deepEqual(Object.keys(catalog).sort(), keys, lang.code);
    for (const key of keys) {
      assert.equal(typeof catalog[key], 'string', `${lang.code}.${key}`);
      assert.ok(catalog[key].trim(), `${lang.code}.${key}`);
      assert.deepEqual(tokens(catalog[key]), tokens(i18n.catalogs.en[key]), `${lang.code}.${key}`);
    }
    assert.equal(i18n.language('auto', [lang.code]), lang.code);
    assert.equal(i18n.language(lang.code, ['en-US']), lang.code);
  }
});

test('first-start auto follows UI preference order, not formatting locale', () => {
  assert.equal(i18n.language(undefined, ['xx-ZZ', 'de-DE', 'pl-PL'], 'en_US'), 'de');
  assert.equal(i18n.language('auto', ['pl-PL', 'en-US'], 'en_US'), 'pl');
  assert.equal(i18n.language('fr', ['pl-PL'], 'en_US'), 'fr');
  assert.equal(i18n.language('auto', [], 'uk_UA.UTF-8'), 'uk');
  assert.equal(i18n.language('auto', ['xx-ZZ'], 'xx_ZZ'), 'en');
  assert.equal(i18n.language('auto', ['C'], 'pl_PL'), 'en');
  assert.equal(i18n.language('auto', 'de_DE:en_US'), 'de');
  assert.equal(i18n.language('invalid', ['pl']), 'pl');
});

test('locale scripts and regions choose the correct translation', () => {
  const cases = {
    'pt_BR.UTF-8': 'pt-BR', 'pt-PT': 'pt-PT', 'pt-AO': 'pt-PT',
    'zh-TW': 'zh-TW', 'zh-HK': 'zh-TW', 'zh-MO': 'zh-TW', 'zh-SG': 'zh-CN',
    'zh-Hans-HK': 'zh-CN', 'zh-Hant-CN': 'zh-TW',
    'es_MX.UTF-8': 'es', 'no_NO': 'nb', 'nb-NO': 'nb', 'in_ID': 'id',
    'EN_us.utf8': 'en', 'pl_PL@modifier': 'pl'
  };
  for (const [input, expected] of Object.entries(cases)) assert.equal(i18n.matchLocale(input), expected, input);
  for (const invalid of ['polish', '__proto__', 'constructor', '../pl', 'pl\nfoo', '']) assert.equal(i18n.matchLocale(invalid), '');
});

test('language menu uses native names, includes auto, and changes its labels', () => {
  const options = plain(i18n.options('pl', 'de'));
  assert.equal(options.length, 31);
  assert.equal(options[0].value, 'auto');
  assert.match(options[0].label, /Automatycznie.*Deutsch/);
  assert.equal(options.find(o => o.value === 'ja').label, '日本語');
  assert.equal(i18n.words('xx').hidden, i18n.words('en').hidden);
  assert.equal(i18n.isRtl('ar'), true);
  assert.equal(i18n.isRtl('pl'), false);
});

test('localized monitor sentences support reordered placeholders and RTL isolation', () => {
  const s = { status: 'elsewhere', monitor: 'DP-3' };
  assert.equal(model.statusText(s, 'ja'), 'DP-3 に表示中');
  assert.equal(model.statusText(s, 'pl'), 'otwarty na DP-3');
  assert.match(model.statusText(s, 'ar'), /\u2066DP-3\u2069/);
  assert.equal(i18n.format('{language}', {language: '$&'}), '$&');
});

test('changing language preserves workspace, compact mode, and future preferences', () => {
  const old = { id: 'sarr.scratchpeek', workspace: 'music', compact: true, language: 'pl', future: 'keep' };
  const changed = plain(model.mergeSettings(old, {language: 'ja'}, old.id));
  assert.deepEqual(changed, {...old, language: 'ja'});
  assert.equal(old.language, 'pl');
  assert.equal(model.language(changed.language, ['pl']), 'ja');
  const auto = model.mergeSettings(changed, {language: 'auto'}, old.id);
  assert.equal(model.language(auto.language, ['pl']), 'pl');
});

test('group members stay adjacent and share a label even with different address order', () => {
  const s = state([
    window('0x1', {class:'Z', grouped:['0x1','0x3']}),
    window('0x2', {class:'M'}),
    window('0x3', {class:'A', grouped:['0x3','0x1']})
  ]);
  const grouped = s.windows.filter(w => w.grouped);
  assert.equal(grouped[0].groupNumber, grouped[1].groupNumber);
  assert.equal(grouped[0].groupKey, grouped[1].groupKey);
  assert.equal(s.windows[0].groupNumber, 1);
  assert.equal(s.windows[1].groupNumber, 1);
  assert.equal(s.windows[2].groupNumber, 0);
});

test('monitor diagram handles negative positions, scale, rotation and disabled outputs', () => {
  const layout = plain(model.monitorLayout([
    {name:'left', x:-1920, y:0, width:1920, height:1080, scale:1, transform:0},
    {name:'right', x:0, y:0, width:2160, height:3840, scale:2, transform:1},
    {name:'off', x:10000, y:0, width:1920, height:1080, disabled:true}
  ]));
  assert.equal(layout.width, 3840);
  assert.equal(layout.height, 1080);
  assert.equal(layout.items.length, 2);
  assert.equal(layout.items[0].x, 0);
  assert.equal(layout.items[1].x, 1920);
  assert.equal(layout.items[1].width, 1920);
  assert.deepEqual(plain(model.monitorLayout(null)), {items:[], width:1, height:1});
});

test('tooltip limits long lists; model preserves untrusted titles as plain data', () => {
  const clients = Array.from({ length: 20 }, (_, i) => window('0x' + (i + 1).toString(16)));
  clients[0].title = '<img src="file:///private"> $(touch nope)';
  const s = state(clients);
  assert.equal(s.count, 20);
  assert.match(model.tooltip(s, 'en', 'scratchpad'), /\+8/);
  assert.ok(s.windows.some(w => w.title === clients[0].title));
});

test('code reload recovers only this widget\'s current settings from the detached layout', () => {
  const saved = { id: 'sarr.scratchpeek', workspace: 'scratchpad', language: 'pl' };
  const layout = { left: [{ id: 'another.plugin' }, saved] };
  const recovered = model.initialSettings(layout, 'sarr.scratchpeek', { workspace: 'old-test' });
  assert.deepEqual(plain(recovered), saved);
  recovered.workspace = 'changed';
  assert.equal(saved.workspace, 'scratchpad');
  assert.equal(model.initialSettings({}, 'sarr.scratchpeek', 'fallback'), 'fallback');
});

test('label presets preserve all six meanings including visible versus focused', () => {
  const states = [
    [{status:'empty',count:0}, 'empty', 'Scratchpad EMPTY'],
    [{status:'hidden',count:4}, 'hidden', 'Scratchpad OFF'],
    [{status:'here',count:4,focused:false}, 'open here', 'Scratchpad ON'],
    [{status:'here',count:4,focused:true}, 'active here', 'Scratchpad ACTIVE'],
    [{status:'elsewhere',count:4,monitor:'DP-3'}, 'open on DP-3', 'Scratchpad ON · DP-3'],
    [{status:'unknown',count:0}, 'status unknown', 'Scratchpad ?']
  ];
  for (const [s,short,toggle] of states) {
    assert.equal(model.statusText(s,'en'),short);
    assert.equal(model.statusText(s,'en',{labelStyle:'explicit'}),'Scratchpad: '+short);
    assert.equal(model.statusText(s,'en',{labelStyle:'switch'}),toggle);
  }
  assert.equal(model.statusText({status:'empty'},'pl',{labelStyle:'explicit'}),'Scratchpad: pusty');
  assert.equal(model.statusText({status:'here',focused:false,count:0},'en',{labelStyle:'switch'}),'Scratchpad ON');
  assert.equal(model.statusText({status:'invalid'},'en',{labelStyle:'explicit'}),'Scratchpad: status unknown');
});

test('custom descriptions are shared by full label and accessibility tooltip', () => {
  const s = {status:'elsewhere',count:4,monitor:'DP-3',windows:[]};
  const prefs = {labelStyle:'custom',customLabels:{elsewhere:'Shelf {workspace}: {count} @ {monitor}'}};
  const expected = 'Shelf music: 4 @ DP-3';
  assert.equal(model.statusText(s,'en',prefs,'music'),expected);
  assert.ok(model.label(s,'en',false,false,prefs,'music').endsWith(expected));
  assert.ok(model.tooltip(s,'en','music',prefs).includes(expected));
  assert.equal(model.label(s,'en',true,false,prefs,'music'),'↗ 4');
  assert.equal(model.label(s,'en',false,true,prefs,'music'),'↗\n4');
  assert.equal(model.statusText(s,'ar',prefs,'music'),'Shelf \u2066music\u2069: 4 @ \u2066DP-3\u2069');
});

test('blank custom fields fall back, unrecognized variables and markup stay literal', () => {
  const s={status:'here',focused:true,count:4};
  assert.equal(model.statusText(s,'en',{labelStyle:'custom',customLabels:{active:'  '}}),'Scratchpad: active here');
  const literal='<b>$& {unsupported}</b> {count}';
  assert.equal(model.statusText(s,'en',{labelStyle:'custom',customLabels:{active:literal}}),'<b>$& {unsupported}</b> 4');
  assert.equal(model.statusText(s,'en',{labelStyle:'custom',customLabels:{active:'{workspace}'}},'{count}'),'{count}');
  assert.equal(model.statusText({status:'unknown'},'en',{labelStyle:'custom',customLabels:{unknown:'Count: {count}'}}),'Count: ?');
});

test('labels normalize bad settings and keep drafts separate from saved input', () => {
  const raw={labelStyle:'custom',customLabels:{active:' One\n\tTwo ',hidden:'x'.repeat(150),here:42,other:'ignored'}};
  const prefs=plain(model.normalizeLabels(raw));
  assert.equal(prefs.customLabels.active,'One Two');
  assert.equal(prefs.customLabels.hidden.length,100);
  assert.equal(prefs.customLabels.here,'');
  assert.equal(prefs.customLabels.other,undefined);
  assert.equal(model.normalizeLabels({labelStyle:'bad'}).labelStyle,'short');
  assert.equal(model.normalizeLabels(null).labelStyle,'short');
  assert.equal(raw.customLabels.active,' One\n\tTwo ');
});

test('saving label style preserves colors, language, and custom text between presets', () => {
  const existing={id:'sarr.scratchpeek',accentColor:'#EF98F5',tooltipStyle:'compact',language:'auto',workspace:'music'};
  const first=plain(model.mergeSettings(existing,model.normalizeLabels({labelStyle:'custom',customLabels:{active:'My shelf'}}),existing.id));
  const next=plain(model.mergeSettings(first,model.normalizeLabels({...first,labelStyle:'switch'}),first.id));
  assert.equal(next.customLabels.active,'My shelf');
  for (const [key,value] of Object.entries(existing)) assert.equal(next[key],value);
  for (const {code} of i18n.languages) {
    assert.equal(i18n.labelCatalogs[code].length,i18n.labelKeys.length);
    for (const key of model.labelStates) {
      const state={status:key==='active'?'here':key,focused:key==='active',count:4,monitor:'DP-3'};
      const text=model.statusText(state,code,{labelStyle:'explicit'});
      assert.ok(text.startsWith('Scratchpad: '));
      assert.ok(!text.includes('undefined'));
    }
  }
});

test('scale defaults, valid fractional values and bounds are safe for layout', () => {
  for (const value of [undefined,null,'1.5',NaN,Infinity,-Infinity,{},true]) assert.equal(appearance.scale(value),1);
  assert.equal(appearance.scale(1.25),1.25);
  assert.equal(appearance.scale(1.234),1.23);
  assert.equal(appearance.scale(0.8),0.8);
  assert.equal(appearance.scale(2),2);
  assert.equal(appearance.scale(0),0.8);
  assert.equal(appearance.scale(999),2);
  const result=plain(appearance.normalize({accentColor:'#f80',uiScale:1.5,barScale:1.25}));
  assert.deepEqual(result,{...legacyColor,accentColor:'#FF8800',tooltipStyle:'panel',uiScale:1.5,barScale:1.25});
});

test('color-only and scale-only changes preserve each other and leave saved input alone', () => {
  const saved={...legacyColor,accentColor:'#EF98F5',tooltipStyle:'compact',uiScale:1.5,barScale:1.25};
  assert.deepEqual(plain(appearance.merge(saved,{accentColor:'#2299dd'})),{...saved,accentColor:'#2299DD'});
  assert.deepEqual(plain(appearance.merge(saved,{accentColor:''})),{...saved,accentColor:'',colorMode:'theme'});
  assert.deepEqual(plain(appearance.merge(saved,{uiScale:2,barScale:0.8})),{...saved,uiScale:2,barScale:0.8});
  assert.equal(saved.accentColor,'#EF98F5');
  assert.equal(saved.uiScale,1.5);
  const prior={id:'sarr.scratchpeek',language:'pl',labelStyle:'custom',customLabels:{active:'My shelf'},...saved};
  const merged=plain(model.mergeSettings(prior,appearance.merge(saved,{uiScale:1.25}),prior.id));
  assert.deepEqual(merged,{...prior,uiScale:1.25});
});

const placement = vm.createContext({});
vm.runInContext(fs.readFileSync(path.join(__dirname, '../PopupPlacement.js'), 'utf8'), placement);
test('dropdown placement keeps scaled menus inside window at all edges', () => {
  for (const scale of [0.8,1,1.25,1.5,2]) {
    for (const [x,y,width,height] of [[20,20,390*scale,30*scale],[35,638,776,60],[1750,960,390,50],[0,500,2200,60]]) {
      const p=placement.fit(x,y,width,height,1920,1080,scale,360,2,8);
      const left=x+p.x*scale, top=y+p.y*scale;
      assert.ok(left>=0 && top>=0);
      assert.ok(left+p.width*scale<=1920+1e-8);
      assert.ok(top+p.height*scale<=1080+1e-8);
      assert.ok(p.height>0 && p.width>0);
    }
  }
});

test('a menu near the bottom opens above and caps its scrollable height', () => {
  const p=placement.fit(35,638,776,60,1920,1080,2,360,2,8);
  assert.ok(p.y<0);
  assert.ok(p.height<360);
  assert.equal(p.width,388);
  assert.equal(p.x,0);
  const top=placement.fit(35,30,388,30,1920,1080,1,360,2,8);
  assert.ok(top.y>0);
  const fallback=placement.fit(0,0,388,30,0,0,1,360,2,8);
  assert.equal(fallback.width,388);
  assert.equal(fallback.height,360);
});

test('adapted defaults follow theme identity, including returning from a green theme', () => {
  const prefs = appearance.normalize({});
  for (const [theme, accent, expected] of [
    ['tokyo-night','#7AA2F7','#EF98F5'], ['hackerman','#82FB9C','#82FB9C'],
    ['tokyo-night','#7AA2F7','#EF98F5'], ['other-blue-theme','#7AA2F7','#7AA2F7'],
    ['tokyo-night-custom','#00FF00','#00FF00'], ['', '#123456','#123456']
  ]) assert.equal(appearance.resolve(prefs,theme,accent),expected);
  assert.equal(appearance.themeId('tokyo-night\n'),'tokyo-night');
  for (const bad of ['../tokyo-night','__proto__','constructor','a/b','']) assert.equal(appearance.themeId(bad),'');
});

test('upgrades preserve both legacy custom HEX and explicit exact-theme choices', () => {
  const custom={accentColor:'#eF98f5',tooltipStyle:'compact',uiScale:1.2};
  const theme={accentColor:''};
  for (const [id,accent] of [['tokyo-night','#7AA2F7'],['hackerman','#82FB9C']]) {
    assert.equal(appearance.resolve(custom,id,accent),'#EF98F5');
    assert.equal(appearance.resolve(theme,id,accent),accent);
  }
  assert.equal(appearance.normalize(custom).colorScope,'all');
  assert.equal(appearance.normalize(theme).colorMode,'theme');
  assert.equal(appearance.normalize(custom).uiScale,1.2);
  const oldIpc = appearance.merge(appearance.normalize(custom),{accentColor:''});
  assert.equal(appearance.resolve(oldIpc,'tokyo-night','#7AA2F7'),'#7AA2F7');
});

test('theme-scoped rules return after switching themes and preview never mutates saved data', () => {
  const saved=appearance.normalize({});
  const before=JSON.stringify(saved);
  let draft=appearance.setRule(saved,'tokyo-night','theme','custom','#f80');
  draft=appearance.setRule(draft,'hackerman','theme','custom','#4f4');
  assert.equal(appearance.resolve(draft,'tokyo-night','#7AA2F7'),'#FF8800');
  assert.equal(appearance.resolve(draft,'hackerman','#82FB9C'),'#44FF44');
  assert.equal(appearance.resolve(draft,'new-theme','#ABCDEF'),'#ABCDEF');
  assert.equal(JSON.stringify(saved),before);
  assert.equal(appearance.resolve(saved,'tokyo-night','#7AA2F7'),'#EF98F5');
  draft=appearance.setRule(draft,'tokyo-night','theme','adaptive','');
  assert.equal(appearance.resolve(draft,'tokyo-night','#7AA2F7'),'#EF98F5');
  draft=appearance.setRule(draft,'tokyo-night','theme','theme','');
  assert.equal(appearance.resolve(draft,'tokyo-night','#7AA2F7'),'#7AA2F7');
});

test('all-theme selection wins everywhere while preserving dormant individual choices', () => {
  let prefs=appearance.setRule({},'tokyo-night','theme','custom','#ff8800');
  prefs=appearance.setRule(prefs,'hackerman','theme','custom','#44ff44');
  prefs=appearance.setRule(prefs,'tokyo-night','all','custom','#112233');
  for (const theme of ['tokyo-night','hackerman','new-theme']) assert.equal(appearance.resolve(prefs,theme,'#778899'),'#112233');
  prefs=appearance.setRule(prefs,'tokyo-night','theme','adaptive','');
  assert.equal(appearance.resolve(prefs,'hackerman','#82FB9C'),'#44FF44');
  assert.equal(appearance.resolve(prefs,'new-theme','#778899'),'#778899');
  assert.equal(appearance.resolve(prefs,'tokyo-night','#7AA2F7'),'#EF98F5');
});

test('saving, renaming, recoloring and deleting a preset preserve theme choices', () => {
  const saved=appearance.setRule({},'tokyo-night','theme','custom','#123456');
  const before=JSON.stringify(saved);
  let draft=appearance.upsertPreset(saved,'',' My pink ','#ef98f5');
  assert.equal(draft.colorPresets[0].name,'My pink');
  assert.equal(draft.colorPresets[0].color,'#EF98F5');
  const id=draft.colorPresets[0].id;
  draft=appearance.upsertPreset(draft,id,'Warm orange','#f80');
  assert.equal(draft.colorPresets.length,1);
  assert.equal(draft.colorPresets[0].name,'Warm orange');
  assert.equal(draft.colorPresets[0].color,'#FF8800');
  draft=appearance.setRule(draft,'tokyo-night','theme','custom',draft.colorPresets[0].color);
  draft=appearance.removePreset(draft,id);
  assert.equal(draft.colorPresets.length,0);
  assert.equal(appearance.resolve(draft,'tokyo-night','#7AA2F7'),'#FF8800');
  assert.equal(JSON.stringify(saved),before);
});

test('presets reject invalid, duplicate and excess entries without overwriting other colors', () => {
  let prefs=appearance.upsertPreset({},'','Blue','#123456');
  for (const [id,name,color] of [['','blue','#abcdef'],['','','#123456'],['','Bad','red'],['missing','New','#123456']])
    assert.equal(appearance.upsertPreset(prefs,id,name,color),null);
  for (let i=1;i<24;i++) prefs=appearance.upsertPreset(prefs,'','Color '+i,'#abcdef');
  assert.equal(prefs.colorPresets.length,24);
  assert.equal(appearance.upsertPreset(prefs,'','Extra','#111111'),null);
  assert.ok(appearance.upsertPreset(prefs,prefs.colorPresets[0].id,'Renamed','#222222'));
  const malicious=JSON.parse('{"themeColors":{"__proto__":{"mode":"custom","color":"#ffffff"},"tokyo-night":{"mode":"custom","color":"nope"}},"colorPresets":[{"id":"preset-1","name":"<b>literal</b>","color":"#f80"}]}');
  const clean=appearance.normalize(malicious);
  assert.equal(Object.keys(clean.themeColors).length,0);
  assert.equal(clean.colorPresets[0].name,'<b>literal</b>');
  assert.equal(appearance.presetName('a\nb\t c'),'a b c');
  assert.equal(appearance.presetName('x'.repeat(100)).length,40);
  assert.deepEqual(plain(appearance.setRule({},'','theme','custom','#123456')),plain(appearance.normalize({})));
});

test('scale-only edits preserve saved palettes, modes, theme overrides and unrelated settings', () => {
  let appearancePrefs=appearance.setRule({},'tokyo-night','theme','custom','#fedcba');
  appearancePrefs=appearance.upsertPreset(appearancePrefs,'','Pink','#ef98f5');
  const saved={id:'sarr.scratchpeek',language:'pl',labelStyle:'custom',customLabels:{active:'My shelf'},...plain(appearancePrefs)};
  const next=plain(model.mergeSettings(saved,appearance.merge(saved,{uiScale:1.5,barScale:1.25}),saved.id));
  assert.deepEqual(next,{...saved,uiScale:1.5,barScale:1.25});
  assert.deepEqual(plain(appearance.normalize(next)),plain(appearance.normalize(JSON.parse(JSON.stringify(next)))));
});

test('all 30 languages include color modes, scope and preset actions', () => {
  const placeholders=text=>[...text.matchAll(/\{[a-zA-Z]+\}/g)].map(m=>m[0]).sort();
  for (const {code} of i18n.languages) {
    assert.equal(i18n.colorCatalogs[code].length,i18n.colorKeys.length,code);
    for (const key of i18n.colorKeys) {
      assert.ok(i18n.catalogs[code][key],code+':'+key);
      assert.deepEqual(placeholders(i18n.catalogs[code][key]),placeholders(i18n.catalogs.en[key]));
    }
  }
});
