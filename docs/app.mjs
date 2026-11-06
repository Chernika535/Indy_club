import {createAccount} from './account.mjs';
import {exhibits, scene} from './exhibits.mjs';
import {people, references, routes, types, vibes, works} from './catalog.mjs';
import {exclusionOptions, matchPeople, normalize, person, rankWorks, readState, vibe, work, writeState} from './discovery.mjs';

const main = document.querySelector('main');
const status = document.querySelector('#status');
const state = readState();

const symbols = {
  dark: '<path d="M64 19a43 43 0 1 0 34 66A40 40 0 0 1 64 19Z"/><path d="M89 30v17m-8-8h17m9 11v11m-5-5h11"/><circle cx="26" cy="29" r="1"/><circle cx="102" cy="77" r="1"/>',
  slavic: '<path d="M64 14l50 50-50 50-50-50Z M64 25l39 39-39 39-39-39Z M64 40l24 24-24 24-24-24Z M64 52l12 12-12 12-12-12Z M14 64h25m50 0h25M64 14v25m0 50v25"/><path d="m29 28 7 7-7 7-7-7z m70 0 7 7-7 7-7-7z M29 86l7 7-7 7-7-7z m70 0 7 7-7 7-7-7z"/>',
  magic: '<circle cx="64" cy="64" r="40"/><circle cx="64" cy="64" r="49" stroke-dasharray="2 7"/><path d="M64 24c2 28 11 37 40 40-29 3-38 12-40 40-3-28-12-37-40-40 28-3 37-12 40-40Z M64 48v32m-16-16h32"/>',
  romantic: '<path d="M20 42h88v52H20z m0 0 44 33 44-33M20 94l29-30m59 30L79 64M64 43c-18-18 2-25 3-12 8-15 24-3 7 12"/><path d="M16 28h14m-7-7v14m81 64v14m-7-7h14"/>',
  sciences: '<circle cx="64" cy="64" r="49" stroke-dasharray="1 4"/><ellipse cx="64" cy="64" rx="48" ry="18" transform="rotate(35 64 64)"/><ellipse cx="64" cy="64" rx="48" ry="18" transform="rotate(-35 64 64)"/><ellipse cx="64" cy="64" rx="48" ry="18" transform="rotate(90 64 64)"/><circle cx="64" cy="64" r="6"/><circle cx="30" cy="29" r="3"/><circle cx="102" cy="62" r="3"/>',
  selfmade: '<path d="M63 106c0-19 3-38 16-58m-17 43C45 79 44 68 46 58c13 3 20 11 20 24m4-17C68 46 75 34 93 29c0 18-7 30-23 36m-9 26C45 90 33 85 27 73c18-2 29 4 34 18M38 107h54"/><circle cx="64" cy="64" r="46" stroke-dasharray="1 6"/>',
};

function escape(value) {
  return String(value).replace(/[&<>"']/g, character => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'})[character]);
}

function link(page, options = {}) {
  const params = new URLSearchParams(options);
  return '#' + page + (params.size ? '?' + escape(params.toString()) : '');
}

const external = (url, label) => `<a class="primary" href="${escape(url)}" target="_blank" rel="noopener noreferrer">${label}</a>`;
const art = world => `<svg viewBox="0 0 128 128" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="1.55" stroke-linecap="round" stroke-linejoin="round">${symbols[world.id]}</svg>`;
const portal = world => {
  const exhibit = exhibits[world.id];
  return `<a class="gallery-tile" href="${link('vibe', {id:world.id})}" aria-label="${world.name}">
    <div class="gallery-art">${scene(world.id)}<span class="tile-disc" aria-hidden="true">${exhibit.no}</span></div>
    <span class="tile-caption"><strong>${world.name}</strong><small>${exhibit.label}</small></span>
  </a>`;
};
const tags = values => `<div class="tags">${values.map(value => `<a class="tag" href="${link('explore', {q:value})}">${escape(value)}</a>`).join('')}</div>`;
const worldTags = values => `<div class="tags">${values.map(id => `<a class="tag" href="${link('vibe', {id})}">${vibe(id).name}</a>`).join('')}</div>`;

function saveButton(kind, item) {
  const key = kind + ':' + item.id;
  const saved = activeSaves().includes(key);
  return `<button class="button" type="button" data-save="${key}" aria-pressed="${saved}" aria-label="Сохранить «${escape(item.title || item.name)}»">${saved ? 'В сохранённых' : 'Сохранить'}</button>`;
}

function workCard({item, reason, cautions = []}) {
  const world = vibe(item.worlds[0]);
  return `<article class="card ${item.type}">
    <a href="${link('work', {id:item.id})}" class="art" style="--tone:${world.color}" aria-hidden="true" tabindex="-1">${art(world)}</a>
    <div class="card-body">
      <span class="meta">${types[item.type]} · ${item.language}</span>
      <h3><a href="${link('work', {id:item.id})}">${escape(item.title)}</a></h3>
      <p><a class="textlink" href="${link('person', {id:item.creator})}">${escape(person(item.creator).name)}</a></p>
      <p>${escape(item.description)}</p>
      ${reason ? `<p class="reason">${escape(reason)}</p>` : ''}
      ${cautions.length ? `<p class="warning">Ты просила показывать реже: ${escape(cautions.join(', '))}</p>` : ''}
      ${worldTags(item.worlds)}
      <div class="actions">${saveButton('work', item)}</div>
    </div>
  </article>`;
}

function personCard({item, reason}) {
  return `<article class="card"><div class="card-body"><span class="meta">${escape(item.practice)}</span>
    <h3><a href="${link('person', {id:item.id})}">${escape(item.name)}</a></h3>
    ${tags(item.topics)}${reason ? `<p class="reason">${escape(reason)}</p>` : ''}
    <div class="actions">${saveButton('person', item)}</div>
  </div></article>`;
}

function routeCard(item) {
  return `<a class="panel route-card" href="${link('route', {id:item.id})}"><span class="meta">Подборка клуба</span><h3>${escape(item.title)}</h3><p>${escape(item.intro)}</p></a>`;
}

const cards = (rows, render, empty = 'По этому запросу пока нет находок.') => rows.length
  ? `<div class="card-grid">${rows.map(render).join('')}</div>` : `<p class="empty">${empty}</p>`;
const section = (title, content, aside = '') => `<section class="wrap section"><div class="section-head"><h2>${title}</h2>${aside}</div>${content}</section>`;
const heading = (kicker, title, description = '') => `<div class="wrap page-intro"><span class="eyebrow">${kicker}</span><h1>${escape(title)}</h1>${description ? `<p class="lead">${escape(description)}</p>` : ''}</div>`;
const hiddenNote = count => count ? `<p class="hint" role="status">Скрыто по исключениям: ${count}. <a class="textlink" href="#taste">Настроить вкус</a></p>` : '';

function searchForm(query = '', tab = 'all') {
  return `<form class="search" data-form="search" role="search">
    <label for="query" class="sr-only">Что хочешь найти?</label>
    <input name="q" id="query" type="search" maxlength="140" placeholder="Хочу найти…" value="${escape(query)}">
    <input name="tab" type="hidden" value="${tab}">
    <button class="primary" type="submit">Найти</button>
  </form>`;
}

function home() {
  const picks = rankWorks({exclusions:state.exclusions}).rows.filter(row => ['kupala','mendel','green-dreams'].includes(row.item.id));
  return `<div class="wrap hero gallery-hero"><div><span class="eyebrow">ИНДИ КЛУБ / ГАЛЕРЕЯ МИРОВ</span><h1>Куда тебе <em>сегодня?</em></h1>
    <p class="lead">Найди независимую игру, зин или автора, с которого начнётся новое увлечение.</p>
    ${searchForm()}
    <p class="hint">Попробуй <a class="textlink" href="${link('explore',{q:'игра про фольклор без демонов'})}">«игра про фольклор без демонов»</a> или <a class="textlink" href="#taste">начни со знакомой истории</a></p></div>
    <div class="gallery-sigil" aria-hidden="true"><span>ВХОД 06/06</span></div>
  </div>
  ${section('Выбери мир', `<div class="gallery">${vibes.map(portal).join('')}</div>`, '<p class="hint">Шесть входов в каталог</p>')}
  ${section('С чего начать', cards(picks, workCard), '<a class="textlink hint" href="#explore">Весь каталог</a>')}
  ${section('Маршруты клуба', `<div class="route-grid">${routes.map(routeCard).join('')}</div>`)}`;
}

const tabs = {all:'Всё', works:'Работы', publications:'Мысли', people:'Люди', vibes:'Миры', routes:'Подборки'};

function explore(params) {
  const query = (params.get('q') || '').slice(0, 140);
  const selected = params.get('tab');
  const tab = Object.hasOwn(tabs, selected) ? selected : 'all';
  const {rows, hiddenCount, parsed} = rankWorks({query, exclusions:state.exclusions});
  const peopleRows = matchPeople(query, rows, state.exclusions);
  const shown = key => tab === 'all' || tab === key;
  const allowed = item => allowedEntry(item, parsed.excluded);
  const visibleIds = new Set(rows.map(row => row.item.id));
  const matchesText = text => !parsed.terms.length || parsed.terms.every(term => normalize(text).includes(term));
  const visibleWorlds = vibes.filter(item => matchesText([item.name, item.title, item.description].join(' ')) || rows.some(row => row.item.worlds.includes(item.id)));
  const visibleRoutes = routes.filter(item => matchesText(item.title + ' ' + item.intro) || item.works.some(id => visibleIds.has(id)));
  return `<div class="wrap page-intro"><span class="eyebrow">Каталог клуба</span><h1>Исследовать</h1>${searchForm(query, tab)}
    <p class="hint">Поиск по названиям, именам и темам. Чтобы убрать тему из выдачи, напиши «без демонов» или «без стекла».</p>
    <nav class="tabs" aria-label="Разделы каталога">${Object.entries(tabs).map(([key,label]) => `<a class="button" href="${link('explore', {tab:key, q:query})}" ${key === tab ? 'aria-current="page"' : ''}>${label}</a>`).join('')}</nav>
    ${parsed.excluded.length ? `<p class="hint">Исключены темы: ${escape(parsed.excluded.join(', '))}.</p>` : ''}
    ${parsed.unrecognized.length ? `<p class="warning hint">Фильтр не распознал: ${escape(parsed.unrecognized.join(', '))}. Эти слова не применены.</p>` : ''}
    ${shown('works') ? hiddenNote(hiddenCount) : ''}
  </div>
  ${shown('works') ? section('Работы', cards(rows, workCard)) : ''}
  ${shown('people') ? section('Люди', cards(peopleRows, personCard)) : ''}
  ${account.inExplore({tab,allowed,matchesText})}
  ${shown('vibes') && (tab === 'vibes' || visibleWorlds.length) ? section('Миры', visibleWorlds.length ? `<div class="gallery">${visibleWorlds.map(portal).join('')}</div>` : '<p class="empty">Миры по запросу не найдены.</p>') : ''}
  ${shown('routes') && (tab === 'routes' || visibleRoutes.length) ? section('Подборки', visibleRoutes.length ? `<div class="route-grid">${visibleRoutes.map(routeCard).join('')}</div>` : '<p class="empty">Подборки по запросу не найдены.</p>') : ''}`;
}

function worldPage(id) {
  const world = vibe(id);
  if (!world) return missing();
  const {rows, hiddenCount} = rankWorks({world:id, exclusions:state.exclusions});
  const exhibit = exhibits[id];
  const authors = [...new Set(rows.map(row => row.item.creator))].map(creator => ({item:person(creator)}));
  return `<div class="world-stage ${exhibit.layout}">
    <div class="wrap stage-top"><a href="#home">К галерее</a><span>${exhibit.index}</span></div>
    <div class="wrap stage-scene">
      <div class="stage-image">${scene(id)}</div>
      <div class="stage-copy"><span class="eyebrow">${world.name} / ${exhibit.label}</span><h1>${exhibit.title}</h1>
      <p class="lead">${exhibit.line}</p>
      <button class="primary" type="button" data-enter-world>${exhibit.action}</button></div>
    </div>
    <div class="stage-shelf" id="exhibit" tabindex="-1">${section(exhibit.shelf, hiddenNote(hiddenCount) + cards(rows, workCard), '<span class="gallery-note">' + exhibit.index + '</span>')}</div>
    ${account.inWorld(id, allowedEntry)}
    ${authors.length ? section(exhibit.people, cards(authors, personCard)) : ''}
    <nav class="wrap world-index" aria-label="Переход между мирами">
    ${vibes.map(item => `<a href="${link('vibe',{id:item.id})}" ${item.id === id ? 'aria-current="page"' : ''}>${item.name}</a>`).join('')}
    </nav>
  </div>`;
}

function workPage(id) {
  const item = work(id);
  if (!item) return missing();
  const creator = person(item.creator);
  const rows = rankWorks({world:item.worlds[0], exclusions:state.exclusions}).rows.filter(row => row.item.id !== id).slice(0, 3);
  return `<div class="wrap page-intro">
    <span class="eyebrow">${types[item.type]} · ${item.language}</span><h1>${escape(item.title)}</h1>
    <p class="lead">${escape(item.description)}</p>
    <div class="actions">${external(item.url,'Открыть работу на itch.io')}${saveButton('work', item)}</div>
    ${item.warnings.length ? `<p class="warning hint">Отметки каталога: ${escape(item.warnings.join(', '))}.</p>` : ''}
  </div>
  ${section('Автор', cards([{item:creator}], personCard))}
  ${section('Миры и темы', `<div class="flow">${worldTags(item.worlds)}${tags(item.tags)}</div>`)}
  ${rows.length ? section('Ещё в этом мире', cards(rows, workCard)) : ''}`;
}

function personPage(id) {
  const item = person(id);
  if (!item) return missing();
  const rows = rankWorks({exclusions:state.exclusions}).rows.filter(row => row.item.creator === id);
  return `<div class="wrap page-intro"><span class="eyebrow">Автор в каталоге</span><h1>${escape(item.name)}</h1>
    <p class="lead">${escape(item.practice)}</p><div class="actions">${external(item.url,'Открыть на itch.io')}${saveButton('person', item)}</div>
  </div>${section('Темы', tags(item.topics))}${section('Работы в клубе', cards(rows, workCard, 'С учётом исключений здесь пока нет работ.'))}`;
}

function routePage(id) {
  const item = routes.find(route => route.id === id);
  if (!item) return missing();
  const {rows} = rankWorks({exclusions:state.exclusions});
  const selected = item.works.map(key => rows.find(row => row.item.id === key)).filter(Boolean);
  return heading('Подборка клуба', item.title, item.intro) + section('Остановки маршрута', cards(selected, workCard, 'Все работы в подборке скрыты твоими исключениями.'));
}

function taste(params) {
  const reference = references.find(item => item.id === params.get('ref')) || references[0];
  const aspects = params.getAll('aspect').filter(aspect => reference.aspects.includes(aspect));
  const world = vibe(params.get('world'))?.id || '';
  const result = rankWorks({aspects, world, exclusions:state.exclusions});
  return `${heading('Рекомендации', 'Мой вкус', 'Выбери знакомую историю и отметь, что именно тебе в ней нравится. Клуб подберёт работы по этим темам.')}
  ${section('От знакомого к новому', `<div class="panel flow"><form data-form="taste">
    <label>Знакомая история <select name="ref">${references.map(item => `<option value="${item.id}" ${item === reference ? 'selected' : ''}>${item.title}</option>`).join('')}</select></label>
    <fieldset><legend>Что тебе в ней нравится?</legend><div class="checks">${reference.aspects.map(aspect => `<label><input type="checkbox" name="aspect" value="${aspect}" ${aspects.includes(aspect) ? 'checked' : ''}> ${aspect}</label>`).join('')}</div></fieldset>
    <label>Мир <select name="world"><option value="">Любой</option>${vibes.map(item => `<option value="${item.id}" ${item.id === world ? 'selected' : ''}>${item.name}</option>`).join('')}</select></label>
    <div><button class="primary" type="submit">Подобрать работы</button></div>
  </form></div>`)}
  ${aspects.length || world ? section('Твои находки', hiddenNote(result.hiddenCount) + cards(result.rows.slice(0, 12), workCard, 'Попробуй выбрать другой аспект или мир.')) : ''}
  ${section('Что пропустить', `<div class="panel flow"><p>Эти правила действуют в каталоге на этом устройстве. «Показывать реже» опускает работу ниже при сортировке. Темы отмечены вручную, поэтому пометки могут быть неполными.</p><form data-form="exclusions">
    ${exclusionOptions.map(topic => `<label class="settings-row"><span>${topic}</span><select name="${topic}">
    ${[['','Показывать'],['soft','Показывать реже'],['hard','Не показывать']].map(([value,label]) => `<option value="${value}" ${(state.exclusions[topic] || '') === value ? 'selected' : ''}>${label}</option>`).join('')}
    </select></label>`).join('')}
    <div><button class="primary" type="submit">Сохранить правила</button></div></form></div>`)}`;
}

function savedPage() {
  const keys = activeSaves();
  const savedWorks = works.filter(item => keys.includes('work:' + item.id)).map(item => ({item}));
  const savedPeople = people.filter(item => keys.includes('person:' + item.id)).map(item => ({item}));
  const description = account.hasUser() ? 'Сохранения этого аккаунта.' : 'Сохранённые работы и авторы доступны в этом браузере.';
  return heading('Личный архив', 'Моё', description) +
    section('Работы', cards(savedWorks, workCard, 'Здесь появятся работы, которые ты сохранишь.')) +
    section('Люди', cards(savedPeople, personCard, 'Здесь появятся авторы, которых ты сохранишь.')) +
    account.savedContent(keys);
}

function missing() {
  return heading('Карта клуба', 'Такой страницы нет') + '<div class="wrap section"><a class="primary" href="#home">Вернуться домой</a></div>';
}

function current() {
  const [page = '', query = ''] = location.hash.slice(1).split('?');
  return {page: page || 'home', params: new URLSearchParams(query)};
}

function render({focus = false} = {}) {
  const {page, params} = current();
  const id = params.get('id');
  const pages = {
    home, explore:() => explore(params), vibe:() => worldPage(id), work:() => workPage(id),
    person:() => personPage(id), route:() => routePage(id), taste:() => taste(params), saved:savedPage,
    account:() => account.accountPage(params), studio:() => account.studioPage(params),
    member:() => account.memberPage(id), entry:() => account.entryPage(id),
  };
  main.innerHTML = Object.hasOwn(pages, page) ? pages[page]() : missing();
  const title = main.querySelector('h1')?.textContent;
  document.title = page === 'home' ? 'Инди Клуб' : `${title} · Инди Клуб`;
  document.querySelectorAll('[data-nav]').forEach(anchor => {
    const active = anchor.dataset.nav === page || (anchor.dataset.nav === 'explore' && ['work','vibe','person','route'].includes(page));
    if (active) anchor.setAttribute('aria-current','page');
    else anchor.removeAttribute('aria-current');
  });
  if (focus) {
    main.focus({preventScroll:true});
    window.scrollTo(0, 0);
  }
}

function navigate(page, params) {
  const next = '#' + page + (params.size ? '?' + params.toString() : '');
  if (location.hash === next) render({focus:true});
  else location.hash = next;
}

window.addEventListener('hashchange', () => {
  if (location.hash !== '#content') render({focus:true});
});
document.querySelector('.skip').addEventListener('click', event => {
  event.preventDefault();
  main.focus();
});

main.addEventListener('click', async event => {
  if (event.target.closest('[data-enter-world]')) {
    const exhibit = main.querySelector('#exhibit');
    exhibit.focus({preventScroll:true});
    exhibit.scrollIntoView({behavior:matchMedia('(prefers-reduced-motion: reduce)').matches ? 'instant' : 'smooth'});
    return;
  }
  const button = event.target.closest('[data-save]');
  if (!button) return;
  const key = button.dataset.save;
  const saved = activeSaves().includes(key);
  if (account.hasUser()) {
    button.disabled = true;
    const changed = await account.toggleSaved(key);
    button.disabled = false;
    if (!changed) return;
  } else {
    state.saved = saved ? state.saved.filter(id => id !== key) : [...state.saved, key];
    const persisted = writeState(state);
    status.textContent = persisted ? (saved ? 'Удалено из сохранённых.' : 'Добавлено в сохранённые.') : 'Браузер не сохранил изменение. Оно действует до перезагрузки.';
  }
  if (current().page === 'saved') {
    render();
    main.focus({preventScroll:true});
  } else {
    main.querySelectorAll('[data-save]').forEach(candidate => {
      if (candidate.dataset.save !== key) return;
      candidate.textContent = saved ? 'Сохранить' : 'В сохранённых';
      candidate.setAttribute('aria-pressed', String(!saved));
    });
  }
});

main.addEventListener('change', event => {
  if (!event.target.matches('[data-form="taste"] select[name="ref"]')) return;
  const reference = references.find(item => item.id === event.target.value);
  const checks = event.target.form.querySelector('.checks');
  checks.innerHTML = reference.aspects.map(aspect => `<label><input type="checkbox" name="aspect" value="${aspect}"> ${aspect}</label>`).join('');
});

main.addEventListener('submit', event => {
  const form = event.target;
  if (form.dataset.accountForm) return account.submit(event);
  if (!form.dataset.form) return;
  event.preventDefault();
  const values = new FormData(form);
  if (form.dataset.form === 'search') {
    navigate('explore', new URLSearchParams({q:values.get('q').trim(), tab:values.get('tab')}));
  } else if (form.dataset.form === 'taste') {
    navigate('taste', new URLSearchParams(values));
  } else {
    state.exclusions = Object.fromEntries([...values].filter(([, value]) => value));
    const persisted = writeState(state);
    render();
    main.querySelector('[data-form="exclusions"] button').focus({preventScroll:true});
    status.textContent = persisted ? 'Правила сохранены.' : 'Браузер не сохранил правила. Они действуют до перезагрузки.';
  }
});

function allowedEntry(item, excluded = []) {
  const hidden = new Set([...excluded, ...Object.keys(state.exclusions).filter(tag => state.exclusions[tag] === 'hard')].map(normalize));
  return !item.topics.split(',').map(normalize).some(tag => hidden.has(tag));
}

const account = createAccount({
  root:main, escape, section, heading, link, saveButton, getPage:current, render,
  announce:text => {status.textContent = text;},
});
const activeSaves = () => account.hasUser() ? account.saved() : state.saved;
render();
void account.init();
