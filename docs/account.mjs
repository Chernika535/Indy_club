import {configured, connect, safeUrl} from './backend.mjs';
import {vibes} from './catalog.mjs';

export function createAccount({root, escape, section, heading, link, saveButton, getPage, render, announce}) {
  let backend;
  let user;
  let profile;
  let ownEntries = [];
  let saved = [];
  let members = [];
  let published = [];
  let publicDetails = new Map();
  let savedLookup;
  let privateError = false;
  let publicError = false;
  let busy = configured;
  let recovering = false;
  let notice = '';
  let revision = 0;
  const pendingSaves = new Set();

  const accountPages = new Set(['account','studio','member','entry','saved','explore','vibe']);
  const refreshView = () => {
    if (accountPages.has(getPage().page) && !root.querySelector('form :focus')) render();
  };

  async function loadPrivate(id) {
    const expected = ++revision;
    profile = null;
    ownEntries = [];
    saved = [];
    privateError = false;
    busy = Boolean(id);
    if (id) {
      try {
        const data = await backend.loadPrivate(id);
        if (expected !== revision) return;
        ({profile, ownEntries, saved} = data);
      } catch {
        if (expected !== revision) return;
        privateError = true;
      }
    }
    if (expected !== revision) return;
    busy = false;
    refreshView();
  }

  async function loadPublic() {
    try {
      ({members, published} = await backend.publicEntries());
      publicError = false;
    } catch {
      publicError = true;
    }
    publicDetails = new Map();
    savedLookup = null;
    refreshView();
  }

  async function init() {
    if (!configured) return;
    try {
      backend = await connect();
      backend.watch((event, nextUser) => {
        const changed = user?.id !== nextUser?.id;
        user = nextUser;
        if (event === 'PASSWORD_RECOVERY') {
          recovering = true;
          location.hash = '#account';
        }
        if (changed || event === 'INITIAL_SESSION') {
          void loadPrivate(user?.id);
          void loadPublic();
        } else if (event === 'PASSWORD_RECOVERY') {
          refreshView();
        }
      });
    } catch {
      busy = false;
      privateError = true;
      publicError = true;
      refreshView();
    }
  }

  const field = (label,name,value,max,required=false) => `<label>${label}<input name="${name}" maxlength="${max}" value="${escape(value ?? '')}" ${required ? 'required' : ''}></label>`;
  const textarea = (label,name,value,max,required=false) => `<label>${label}<textarea name="${name}" maxlength="${max}" rows="5" ${required ? 'required' : ''}>${escape(value ?? '')}</textarea></label>`;
  const message = () => `<p class="account-message" data-account-message role="status">${escape(notice)}</p>`;
  const pane = (title,content) => section(title,`<div class="panel account-panel">${content}</div>`);
  const entryKind = item => item.kind === 'work' ? 'Работа' : 'Публикация';
  const worldLink = id => {
    const world = vibes.find(item => item.id === id);
    return world ? `<a class="tag" href="${link('vibe',{id})}">${world.name}</a>` : '';
  };
  const readyNote = () => configured ? (busy ? 'Загружаем кабинет…' : 'Кабинет временно недоступен. Попробуй обновить страницу.') :
    'Регистрация и облачные кабинеты откроются после подключения базы. Галерея, поиск и локальные сохранения доступны сейчас.';

  function authPage(params, preview = false) {
    const mode = recovering ? 'password' : ['signup','recover'].includes(params.get('mode')) ? params.get('mode') : 'signin';
    const title = {signin:'Вход в клуб',signup:'Регистрация',recover:'Восстановление доступа',password:'Новый пароль'}[mode];
    const email = mode !== 'password' ? '<label>Электронная почта<input name="email" type="email" autocomplete="email" maxlength="254" required></label>' : '';
    const password = mode !== 'recover' ? `<label>Пароль<input name="password" type="password" minlength="${mode === 'signin' ? 1 : 10}" maxlength="128" autocomplete="${mode === 'signin' ? 'current-password' : 'new-password'}" required></label>` : '';
    const label = {signin:'Войти',signup:'Создать аккаунт',recover:'Отправить ссылку',password:'Сохранить пароль'}[mode];
    return heading('Инди Клуб',title,'Один аккаунт для находок, публичного профиля и авторской мастерской.') +
      pane(title,`${preview ? `<p class="hint">${readyNote()}</p>` : ''}<form data-account-form="${mode}"><fieldset class="account-fields" ${preview ? 'disabled' : ''}>${email}${password}<div><button class="primary" type="submit">${label}</button></div></fieldset>${message()}</form>
      ${mode !== 'password' ? '<nav class="tabs" aria-label="Доступ к аккаунту"><a class="button" href="#account">Вход</a><a class="button" href="#account?mode=signup">Регистрация</a><a class="button" href="#account?mode=recover">Забыли пароль?</a></nav>' : ''}`);
  }

  function accountPage(params) {
    if (!configured) return authPage(params,true);
    if (busy || privateError || !backend) return heading('Инди Клуб','Личный кабинет',readyNote());
    if (!user || recovering) return authPage(params);
    return heading('Личное пространство', 'Личный кабинет', 'Здесь можно изменить профиль, открыть сохранённое и перейти в мастерскую.') +
      pane('Профиль',`<div class="actions"><a class="primary" href="#studio">Моя мастерская</a><a class="button" href="#saved">Сохранённое</a>
      ${profile?.is_public ? `<a class="button" href="${link('member',{id:user.id})}">Публичная страница</a>` : ''}
      <form data-account-form="signout"><button class="button" type="submit">Выйти</button></form></div>
      <p class="hint">Почта для входа: ${escape(user.email ?? '')}</p>
      <form data-account-form="profile">
      ${field('Имя или псевдоним','display_name',profile?.display_name,80,true)}
      ${textarea('О себе','bio',profile?.bio,1200)}
      ${field('Делаю','practices',profile?.practices,250)}
      ${field('Исследую и люблю','interests',profile?.interests,250)}
      ${field('Открытость к сотрудничеству','open_to',profile?.open_to,250)}
      <label class="inline-check"><input name="is_public" type="checkbox" ${profile?.is_public ? 'checked' : ''}> Публичный профиль</label>
      <p class="hint">Имя и поля профиля видны посетителям, если профиль открыт. Если закрыть его, опубликованные работы тоже исчезнут из каталога.</p>
      <div><button class="primary" type="submit">Сохранить профиль</button></div>${message()}</form>`);
  }

  function studioPage(params) {
    if (!backend || busy || privateError) return heading('Создать','Моя мастерская',readyNote());
    if (!user || recovering) return heading('Создать','Моя мастерская','Для доступа нужен аккаунт.') + pane('Доступ','<a class="primary" href="#account">Войти в клуб</a>');
    if (!profile) return heading('Создать','Моя мастерская','Сначала укажи имя или псевдоним в профиле.') + pane('Твой профиль','<a class="primary" href="#account">Открыть кабинет</a>');
    const id = params.get('edit');
    const item = ownEntries.find(entry => entry.id === id);
    const isPublication = item?.kind === 'publication' || (!item && params.get('kind') === 'publication');
    const kind = isPublication ? 'publication' : 'work';
    return heading('Рабочее пространство','Моя мастерская','Работы ведут на внешние площадки. Публикации можно читать внутри клуба.') +
      pane('Твои материалы',`<div class="actions"><a class="button" href="#studio?kind=work">Новая работа</a><a class="button" href="#studio?kind=publication">Новая публикация</a></div>
      ${ownEntries.length ? `<div class="studio-list">${ownEntries.map(entry=>`<article><span class="meta">${entryKind(entry)} · ${entry.status === 'published' ? 'Опубликовано' : 'Черновик'}</span><h3>${escape(entry.title)}</h3><a class="textlink" href="${link('studio',{edit:entry.id})}">Редактировать</a></article>`).join('')}</div>` : '<p class="hint">Здесь появятся твои работы и публикации.</p>'}`) +
      pane(item ? 'Редактирование' : isPublication ? 'Новая публикация' : 'Новая работа',`<form data-account-form="entry">
      <input type="hidden" name="entry_id" value="${escape(item?.id ?? '')}"><input type="hidden" name="kind" value="${kind}">
      ${field('Название','title',item?.title,140,true)}
      ${textarea(isPublication ? 'Текст' : 'Описание','body',item?.body,12000,true)}
      <label>Мир<select name="world">${vibes.map(world=>`<option value="${world.id}" ${world.id === item?.world ? 'selected' : ''}>${world.name}</option>`).join('')}</select></label>
      ${field('Темы через запятую','topics',item?.topics,250)}
      <label>${isPublication ? 'Внешняя ссылка (по желанию)' : 'Ссылка на работу'}<input name="url" type="url" maxlength="1024" placeholder="https://" value="${escape(item?.url ?? '')}" ${isPublication ? '' : 'required'}></label>
      ${!profile.is_public ? '<p class="hint">Для публикации открой профиль в личном кабинете.</p>' : ''}
      <div class="actions"><button class="button" type="submit" name="status" value="draft">Сохранить черновик</button>
      <button class="primary" type="submit" name="status" value="published" ${profile.is_public ? '' : 'disabled'}>Опубликовать</button></div>${message()}</form>`);
  }

  function contentCards(items) {
    return `<div class="card-grid">${items.map(item => `<article class="card"><div class="card-body">
      <span class="meta">${entryKind(item)}</span><h3><a href="${link('entry',{id:item.id})}">${escape(item.title)}</a></h3>
      ${item.club_profiles?.display_name ? `<p><a class="textlink" href="${link('member',{id:item.author_id})}">${escape(item.club_profiles.display_name)}</a></p>` : ''}
      <p>${escape(item.body.slice(0,150))}${item.body.length > 150 ? '…' : ''}</p>
      ${worldLink(item.world)}<div class="actions">${saveButton('entry',item)}</div>
    </div></article>`).join('')}</div>`;
  }

  function memberCards(items) {
    return `<div class="card-grid">${items.map(item => `<article class="card"><div class="card-body">
      <span class="meta">Участник клуба</span><h3><a href="${link('member',{id:item.id})}">${escape(item.display_name)}</a></h3>
      <p>${escape(item.practices || item.interests)}</p><div class="actions">${saveButton('member',{id:item.id,name:item.display_name})}</div>
    </div></article>`).join('')}</div>`;
  }

  function details(kind,id) {
    const key = kind + ':' + id;
    if (!configured || !/^[a-f0-9-]{36}$/i.test(id || '')) return false;
    if (!backend || publicDetails.has(key)) return publicDetails.get(key);
    const cache = publicDetails;
    cache.set(key,undefined);
    const request = kind === 'entry' ? backend.getEntry(id) : backend.getMember(id);
    request.then(value => cache.set(key,value || false),() => cache.set(key,null)).finally(() => {
      const page = getPage();
      if (page.page === kind && page.params.get('id') === id) render();
    });
    return undefined;
  }

  function entryPage(id) {
    const item = details('entry',id);
    if (!item) return detailStatus(item);
    const url = safeUrl(item.url);
    return heading(entryKind(item),item.title) + pane('О материале',`<p class="published-body">${escape(item.body)}</p>
      <div class="actions">${url ? `<a class="primary" href="${escape(url)}" rel="noopener noreferrer ugc" target="_blank">Открыть внешнюю ссылку</a>` : ''}
      ${saveButton('entry',item)}${worldLink(item.world)}<a class="button" href="${link('member',{id:item.author_id})}">${escape(item.club_profiles.display_name)}</a></div>`);
  }

  function memberPage(id) {
    const result = details('member',id);
    if (!result?.profile) return detailStatus(result ? false : result);
    const item = result.profile;
    return heading('Участник клуба',item.display_name,item.bio) + pane('Профиль',`<div class="flow">
      ${[['Делаю',item.practices],['Исследую и люблю',item.interests],['Открытость к сотрудничеству',item.open_to]]
        .filter(([,value])=>value).map(([label,value])=>`<p><strong>${label}</strong> · ${escape(value)}</p>`).join('')}
      <div>${saveButton('member',{id:item.id,name:item.display_name})}</div></div>`) +
      (result.entries.length ? section('Работы и публикации',contentCards(result.entries)) : '');
  }

  function detailStatus(value) {
    const error = value === null || publicError;
    const title = error ? 'Не удалось загрузить' : value === false ? 'Страница недоступна' : 'Загружаем…';
    return heading('Инди Клуб',title);
  }

  function report(text) {
    notice = text;
    const element = root.querySelector('[data-account-message]');
    if (element) element.textContent = text;
    announce(text);
  }

  async function submit(event) {
    const form = event.target;
    const action = form.dataset.accountForm;
    if (!action) return;
    event.preventDefault();
    if (!backend || form.dataset.pending) return;
    const values = new FormData(form,event.submitter || undefined);
    const get = key => String(values.get(key) || '').trim();
    const buttons = [...form.querySelectorAll('button[type="submit"]:not(:disabled)')];
    form.dataset.pending = 'true';
    for (const button of buttons) button.disabled = true;
    report('');
    try {
      if (action === 'signin') {
        await backend.signIn(get('email'),String(values.get('password')));
      } else if (action === 'signup') {
        const result = await backend.signUp(get('email'),String(values.get('password')));
        if (!result.session) report('Проверь почту. Для подтверждения открой письмо в этом же браузере.');
      } else if (action === 'recover') {
        await backend.recover(get('email'));
        report('Если адрес зарегистрирован, на него придёт ссылка. Открой её в этом же браузере.');
      } else if (action === 'password') {
        await backend.setPassword(String(values.get('password')));
        recovering = false;
        render();
        report('Пароль обновлён.');
      } else if (action === 'signout') {
        await backend.signOut();
      } else if (user && action === 'profile') {
        const id = user.id;
        if (!get('display_name')) return report('Укажи имя или псевдоним.');
        const fields = Object.fromEntries(['display_name','bio','practices','interests','open_to'].map(key=>[key,get(key)]));
        const result = await backend.saveProfile(id,{...fields,is_public:values.has('is_public')});
        if (user?.id !== id) return;
        profile = result;
        notice = 'Профиль сохранён.';
        if (getPage().page === 'account') render();
        void loadPublic();
      } else if (user && action === 'entry') {
        const id = user.id;
        const url = get('url') ? safeUrl(get('url')) : null;
        if (get('url') && !url) return report('Введи действующую ссылку, начинающуюся с https://.');
        if (!get('title') || !get('body')) return report('Заполни название и текст.');
        const result = await backend.saveEntry(get('entry_id'),id,{
          kind:get('kind'),title:get('title'),body:get('body'),world:get('world'),
          topics:get('topics'),url,status:get('status') || 'draft',
        });
        if (user?.id !== id) return;
        ownEntries = [result,...ownEntries.filter(item=>item.id !== result.id)];
        notice = result.status === 'published' ? 'Материал опубликован.' : 'Черновик сохранён.';
        if (getPage().page === 'studio') {
          const destination = link('studio',{edit:result.id});
          if (location.hash !== destination) location.hash = destination;
          else render();
        }
        void loadPublic();
      }
    } catch (error) {
      const errors = {
        invalid_credentials:'Проверь почту и пароль.',
        email_not_confirmed:'Сначала подтверди адрес по ссылке из письма.',
        over_email_send_rate_limit:'Письмо уже запрашивали недавно. Попробуй чуть позже.',
        same_password:'Выбери пароль, который отличается от предыдущего.',
        weak_password:'Выбери более сложный пароль.',
      };
      report(Object.hasOwn(errors,error?.code) ? errors[error.code] : 'Не удалось выполнить действие. Попробуй ещё раз.');
    } finally {
      delete form.dataset.pending;
      for (const button of buttons) button.disabled = false;
    }
  }

  async function toggleSaved(key) {
    if (!user || busy || privateError || pendingSaves.has(key)) return false;
    const id = user.id;
    const save = !saved.includes(key);
    pendingSaves.add(key);
    try {
      await backend.setSaved(id,key,save);
      if (user?.id !== id) return false;
      saved = save ? [...saved,key] : saved.filter(value=>value !== key);
      announce(save ? 'Добавлено в сохранённые аккаунта.' : 'Удалено из сохранённых аккаунта.');
      return true;
    } catch {
      announce('Не удалось изменить сохранённое. Попробуй ещё раз.');
      return false;
    } finally {
      pendingSaves.delete(key);
    }
  }

  function entriesSection(items) {
    return items.length ? section('Работы и публикации участников',contentCards(items)) : '';
  }

  return {
    init, submit, accountPage, studioPage, entryPage, memberPage, toggleSaved,
    hasUser:() => Boolean(user),
    saved:() => saved,
    savedContent(keys) {
      const clubKeys = keys.filter(key=>key.startsWith('entry:') || key.startsWith('member:'));
      if (!clubKeys.length || !backend) return '';
      const cacheKey = clubKeys.slice().sort().join(',');
      if (savedLookup?.key !== cacheKey) {
        const lookup = {key:cacheKey};
        savedLookup = lookup;
        backend.getSavedContent(clubKeys).then(data => {lookup.data = data;}, () => {lookup.failed = true;}).finally(refreshView);
      }
      if (savedLookup.failed) return pane('Сохранения клуба','<p>Не удалось загрузить материалы. Попробуй обновить страницу.</p>');
      if (!savedLookup.data) return pane('Сохранения клуба','<p>Загружаем…</p>');
      const {entries, members} = savedLookup.data;
      return entriesSection(entries) + (members.length ? section('Участники клуба',memberCards(members)) : '');
    },
    inWorld(id,allowed) {
      return entriesSection(published.filter(item=>item.world === id && allowed(item)));
    },
    inExplore({tab,allowed,matchesText}) {
      const entries = published.filter(item=>allowed(item) && matchesText([item.title,item.topics,item.body,item.club_profiles?.display_name].join(' ')));
      const people = members.filter(item=>matchesText([item.display_name,item.practices,item.interests,item.open_to,item.bio].join(' ')));
      return (['all','works','publications'].includes(tab) ? entriesSection(entries.filter(item=>tab === 'all' || item.kind === (tab === 'works' ? 'work' : 'publication'))) : '') +
        (['all','people'].includes(tab) && people.length ? section('Участники клуба',memberCards(people)) : '') +
        (tab === 'publications' && !entries.some(item=>item.kind === 'publication') ? pane('Публикации','<p>По этому запросу пока нет публикаций.</p>') : '');
    },
  };
}
