import {people, vibes, works} from './catalog.mjs';

export const normalize = value => value.toLowerCase().replaceAll('ё', 'е').trim();
const byId = (records, id) => records.find(record => record.id === id);
export const person = id => byId(people, id);
export const vibe = id => byId(vibes, id);
export const work = id => byId(works, id);

const descriptors = {
  'фольклор': /фольклор|folklore/,
  'фэнтези': /ф[эе]нтези|fantasy/,
  'уют': /уют|cozy/,
  'сказка': /сказк|fairy tale/,
  'ведьмы': /ведьм|witch/,
  'растения': /растени|ботан|сад|plants?/,
  'город': /город|urban/,
  'смерть': /смерт|death/,
  'стекло': /стекл|angst/,
  'демоны': /демон|demon/,
  'рисунок': /рисун|рисова|иллюстрац|illustrat/,
  'дневник': /дневник|journal/,
  'странное': /странн|жутк|weird/,
  'память': /памят|memory/,
  'близость': /близост|intimacy/,
  'созерцание': /созерцан/,
  'миф': /миф|myth/,
  'исследование': /исследован|исследуют|исследует|research/,
  'ритуал': /ритуал|ritual/,
  'маленькая магия': /магия|магии|волшебств/,
  'эксперимент': /эксперимент|experiment/,
};
export const exclusionOptions = ['демоны','смерть','стекло','странное','ведьмы'];
const detect = text => Object.keys(descriptors).filter(key => descriptors[key].test(text));
const tokens = text => text.match(/[\p{L}\p{N}]{2,}/gu) || [];
const noise = new Set(['хочу','найти','найди','что','для','про','люди','людей','человека','кого','кто','вещь','работы','игру','игры','игра','не','но','без','из','пожалуйста','мне','и','с']);
export function parseQuery(query) {
  const [positive, ...negative] = normalize(query).split(/(?<![\p{L}])(?:без|кроме)\s+/u);
  const negativeText = negative.join(' ');
  const excluded = detect(negativeText);
  const unrecognized = tokens(negativeText.replace(new RegExp(Object.values(descriptors).map(regex => `(?:${regex.source})[\\p{L}]*`).join('|'), 'gu'), '')).filter(token => !noise.has(token));
  return {
    query: positive.trim(),
    wanted: detect(positive),
    excluded,
    unrecognized,
    terms: tokens(positive).filter(token => !noise.has(token)),
    type: /настольн/.test(positive) ? 'tabletop' : /(?:^|[^\p{L}])(?:видео)?игр[ауые]?(?![\p{L}])/u.test(positive) ? 'games' : null,
  };
}

export function rankWorks({query = '', world = '', aspects = [], exclusions = {}} = {}) {
  const parsed = parseQuery(query);
  const hidden = new Set([...parsed.excluded, ...Object.keys(exclusions).filter(key => exclusions[key] === 'hard')]);
  const soft = Object.keys(exclusions).filter(key => exclusions[key] === 'soft');
  const rows = [];
  let hiddenCount = 0;
  for (const item of works) {
    if (world && !item.worlds.includes(world)) continue;
    if (parsed.type === 'tabletop' && item.type !== 'tabletop') continue;
    if (parsed.type === 'games' && item.type === 'zine') continue;
    const exact = parsed.query && normalize(item.title).includes(parsed.query);
    const matches = [...new Set([...parsed.wanted, ...aspects])].filter(tag => item.tags.includes(tag));
    const source = normalize([item.title, person(item.creator).name, item.description, ...item.worlds].join(' '));
    const lexical = parsed.terms.length > 0 && parsed.terms.every(token => source.includes(token));
    if ((parsed.terms.length || aspects.length) && !exact && !matches.length && !lexical) continue;
    const tags = new Set([...item.tags, ...item.warnings]);
    if ([...hidden].some(tag => tags.has(tag))) {
      hiddenCount++;
      continue;
    }
    const cautions = soft.filter(tag => tags.has(tag));
    const reason = exact ? 'Совпадение по названию' : matches.length ? 'Совпало по темам: ' + matches.join(', ') : lexical ? 'Совпадение по тексту' : world ? 'Из мира ' + vibe(world).name : '';
    rows.push({item, reason, cautions, score: (exact ? 15 : 0) + matches.length * 5 + (lexical ? 3 : 0) - cautions.length * 12});
  }
  rows.sort((a, b) => b.score - a.score);
  return {rows, hiddenCount, parsed};
}

export function matchPeople(query, visibleWorks, exclusions = {}) {
  const parsed = parseQuery(query);
  const hidden = [...parsed.excluded, ...Object.keys(exclusions).filter(key => exclusions[key] === 'hard')];
  return people.map(item => {
    const related = visibleWorks.filter(row => row.item.creator === item.id && row.reason);
    const tags = parsed.wanted.filter(tag => item.topics.includes(tag));
    const source = normalize([item.name, item.practice, ...item.topics].join(' '));
    const lexical = parsed.terms.length && parsed.terms.every(token => source.includes(token));
    const reason = tags.length ? 'Совпало по темам: ' + tags.join(', ') : lexical ? 'Совпадение в профиле' : related[0]?.reason;
    return {item, reason};
  }).filter(({item, reason}) => (!parsed.terms.length || reason) && !hidden.some(tag => item.topics.includes(tag)));
}

const storageKey = 'indie-club-v1';
export function readState() {
  try {
    const value = JSON.parse(localStorage.getItem(storageKey));
    return {
      saved: Array.isArray(value?.saved) ? value.saved.filter(id => typeof id === 'string') : [],
      exclusions: Object.fromEntries(exclusionOptions.filter(key => ['hard','soft'].includes(value?.exclusions?.[key])).map(key => [key, value.exclusions[key]])),
    };
  } catch {
    return {saved: [], exclusions: {}};
  }
}
export function writeState(state) {
  try {
    localStorage.setItem(storageKey, JSON.stringify(state));
    return true;
  } catch {
    return false;
  }
}
