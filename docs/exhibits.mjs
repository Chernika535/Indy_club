export const exhibits = {
  dark: {no:'01', label:'НОЧНОЙ АРХИВ', title:'После закрытия', line:'Плёнка заканчивается. История продолжается.', action:'Открыть архив', shelf:'Дела из архива', people:'Свидетели ночи', index:'Запись 01 / 03', layout:'archive'},
  slavic: {no:'02', label:'ЖИВАЯ НИТЬ', title:'Лес помнит', line:'Пройди по красной нити от папоротника к сказкам, которые ещё меняют форму.', action:'Взять красную нить', shelf:'Нити маршрута', people:'Кто переплетает истории', index:'Узел 02 / 06', layout:'thread'},
  magic: {no:'03', label:'МЕЖДУ МИРАМИ', title:'Сдвиг реальности', line:'Один неверный поворот, и знакомый мир становится другим.', action:'Найти проход', shelf:'Карта проходов', people:'Хранители проходов', index:'Координаты 03 · 13', layout:'map'},
  romantic: {no:'04', label:'ЛИЧНОЕ ПИСЬМО', title:'Между строк', line:'Истории о близости, памяти и словах, которые так и остались в черновиках.', action:'Вскрыть конверт', shelf:'Внутри конверта', people:'Отправители', index:'Письмо № 04', layout:'letters'},
  sciences: {no:'05', label:'ПОЛЕВЫЕ ЗАПИСИ', title:'Живой образец', line:'Приблизь, рассмотри и проверь, что происходит на другом масштабе.', action:'Начать наблюдение', shelf:'Стол наблюдений', people:'Авторы наблюдений', index:'Образец S–05', layout:'lab'},
  selfmade: {no:'06', label:'СВОЯ ПРАКТИКА', title:'В процессе', line:'Страницы про внимание, пробу и повторение. Можно начать с любой.', action:'Открыть рабочую тетрадь', shelf:'Страницы тетради', people:'Авторы практик', index:'Разворот 06', layout:'notebook'},
};

const circle = (cx,cy,r,props='') => `<circle cx="${cx}" cy="${cy}" r="${r}" ${props}/>`;
const many = (n, fn) => Array.from({length:n}, (_,i) => fn(i)).join('');
const terrain = `<path d="M0 408 46 382l74 18 43-39 52 18 75-79 51 17 72-60 45 48 62-27 39 31 68-44 93 100v135H0Z" fill="#141418"/><path d="M0 460l76-42 51 13 86-35 106 32 108-29 96 36 110-30 87 37v58H0Z" fill="#09090b"/>`;
const rays = (n,cx,cy,r1,r2,attrs) => many(n,i => {
  const a = 2 * Math.PI * i / n;
  return `<line x1="${cx + r1*Math.cos(a)}" y1="${cy + r1*Math.sin(a)}" x2="${cx + r2*Math.cos(a)}" y2="${cy + r2*Math.sin(a)}" ${attrs}/>`;
});
const diamond = (x,y,r,props='') => `<path d="M${x} ${y-r}l${r} ${r}-${r} ${r}-${r} -${r}Z" ${props}/>`;
const dotField = (n,color) => many(n,i => circle((i*113)%719,(i*71)%499,i%6===0?1.8:.65,`fill="${color}" opacity="${(i%7+2)/12}"`));

const scenes = {
  dark: () => `<rect width="720" height="500" fill="#101014"/>${dotField(128,'#d4c7bf')}
    ${circle(490,220,142,'fill="#cf303e"')}${circle(519,203,140,'fill="#141218" opacity=".32"')}
    <g stroke="#101014" opacity=".32">${many(78,i=>`<path d="M348 ${81+i*3.6}h288"/>`)}</g>${terrain}
    <g fill="none" stroke="#c6b5b1" opacity=".68"><path d="M28 108V30h115m440 0h109v78M28 390v80h115m440 0h109v-80"/><path d="M320 250h80m-40-40v80" opacity=".5"/></g>
    <text x="45" y="64" fill="#fae9dc" font-family="monospace" font-size="13">REC / DARK ARCHIVE</text>
    <text x="45" y="447" fill="#fae9dc" font-family="monospace" font-size="13">TAPE 01 — SIDE B</text>`,
  slavic: () => `<rect width="720" height="500" fill="#e84d38"/>
    <g stroke="#f6c595" opacity=".32">${many(52,i=>`<path d="M${i*15} 0v500"/>`)}${many(36,i=>`<path d="M0 ${i*15}h720"/>`)}</g>
    <g stroke="#361a16" fill="none" stroke-width="4">
    ${[74,114,158,206].map(r=>diamond(360,251,r)).join('')}
    ${many(4,i=>`<g transform="rotate(${i*90} 360 251)"><path d="M360 56v121m-63-57 63 57 63-57m-94 28 31 28 31-28"/>${diamond(360,80,14,'fill="#f3deac"')}${diamond(360,151,15,'fill="#f3deac"')}</g>`)}
    ${many(7,i=>diamond(44+i*106,33,15,'fill="#f3deac"'))}
    ${many(7,i=>diamond(44+i*106,468,15,'fill="#f3deac"'))}</g>
    ${diamond(360,251,52,'fill="#f3deac" stroke="#361a16" stroke-width="4"')}
    <path d="M360 290c-12-32 26-44 0-79 3 28-38 40 0 79Z" fill="#b92c27"/>
    <path d="M0 351c144-64 203 107 359 5s179-14 361-125" fill="none" stroke="#f8e2aa" stroke-width="4" stroke-dasharray="9 7"/>`,
  magic: () => `<rect width="720" height="500" fill="#24163f"/>${dotField(240,'#e1c3ff')}
    <g transform="rotate(-18 414 245)" fill="none" stroke="#c395ff">
    ${many(11,i=>`<ellipse cx="414" cy="245" rx="${34+i*15}" ry="${20+i*13}" opacity="${.86-i*.05}"/>`)}
    <ellipse cx="414" cy="245" rx="246" ry="114" stroke-dasharray="5 13"/>${rays(24,414,245,171,203,'opacity=".44"')}</g>
    <path d="M414 116Q426 231 531 245Q426 258 414 374Q401 258 298 245Q401 231 414 116Z" fill="#efc2ff"/>
    <path d="M414 173Q420 240 480 245Q420 252 414 319Q407 252 349 245Q407 240 414 173Z" fill="#4d297b"/>
    <path d="M101 345 215 315l81 66 113-74 109 49 104-62" fill="none" stroke="#f0cc83" stroke-dasharray="4 8" stroke-width="2"/>
    ${[[101,345],[215,315],[296,381],[409,307],[518,356],[622,294]].map(([x,y])=>diamond(x,y,6,'fill="#f0cc83"')).join('')}`,
  romantic: () => `<rect width="720" height="500" fill="#e788a1"/>
    <g transform="rotate(-12 363 250)"><rect x="143" y="87" width="427" height="309" fill="#a83c60" opacity=".45" transform="translate(11 18)"/>
    <rect x="143" y="87" width="427" height="309" fill="#f9dbcf"/>
    <path d="M143 396l199-181 228 181M143 87l213 188L570 87" fill="none" stroke="#b85473" stroke-width="2"/>
    <path d="M143 87h427L356 275Z" fill="#f7bcca" stroke="#b85473" stroke-width="2"/>
    ${circle(356,265,32,'fill="#a82b57"')}${circle(356,265,24,'fill="none" stroke="#ed87ac"')}
    <path d="M356 277s-22-13-10-22c5-4 10 1 10 3 1-2 6-7 11-3 12 9-11 22-11 22Z" fill="#f9b6ca"/></g>
    <g transform="rotate(12 610 123)" fill="none" stroke="#651f3e" stroke-width="2">
    <rect x="548" y="58" width="112" height="130" stroke-dasharray="4 5"/><rect x="558" y="68" width="92" height="110"/>
    ${circle(604,123,26)}${circle(604,123,20)}<path d="M565 125h80m-40-39v76"/></g>
    <path d="M42 450q119-86 205-19t161-13 232-9" fill="none" stroke="#7c2d4b" stroke-width="2"/>`,
  sciences: () => `<rect width="720" height="500" fill="#cbf2eb"/>
    <g stroke="#73ada6" opacity=".67">${many(33,i=>`<path d="M${i*24} 0v500"/>`)}${many(23,i=>`<path d="M0 ${i*24}h720"/>`)}</g>
    <g fill="none" stroke="#155953">${[65,102,144,178].map(r=>circle(413,250,r)).join('')}
    ${rays(72,413,250,178,187,'opacity=".7"')}<path d="M413 30v440M208 250h439" stroke-dasharray="3 7"/></g>
    <g fill="#157a6e" opacity=".85">${many(74,i=>{
      const a=i*2.399963;const r=Math.sqrt(i/74)*145;
      return circle(413+Math.cos(a)*r,250+Math.sin(a)*r,3+i%6);
    })}</g>
    <path d="M40 375h105m-105-7v14m105-14v14M508 133l68-82h103M525 330l66 79h88" fill="none" stroke="#174c46" stroke-width="2"/>
    <text x="40" y="359" fill="#174c46" font-family="monospace" font-size="14">10 mm</text>
    <text x="580" y="43" fill="#174c46" font-family="monospace" font-size="14">FIG. 05A</text>
    <text x="603" y="434" fill="#174c46" font-family="monospace" font-size="14">x 04.02</text>`,
  selfmade: () => `<rect width="720" height="500" fill="#b9b9fc"/>
    <g transform="rotate(-7 373 250)"><rect x="146" y="42" width="445" height="416" rx="6" fill="#3d367d" transform="translate(12 16)"/>
    <rect x="146" y="42" width="445" height="416" rx="6" fill="#f4eada"/>
    <g stroke="#b7a9cb">${many(19,i=>`<path d="M147 ${80+i*19}h443"/>`)}</g>
    <path d="M196 42v416" stroke="#e06d78"/><path d="M148 47v406" stroke="#332753" stroke-width="8" stroke-dasharray="3 12"/>
    <g fill="none" stroke="#5140a4" stroke-width="4"><path d="M345 331c8-75 14-117 46-169m-25 88q-76-20-71-77 48 5 71 77m14-39q-5-60 58-71-5 43-58 71m-23 73q-69 4-89-33 55-13 89 33m6 9q43-56 81-44-13 40-81 44"/>
    <path d="M318 336q38 10 83-1l-13 45h-52zM283 113q32-15 66-6m-66 15q37-11 71-7"/></g>
    <path d="M488 37l69 13-9 34-69-11Z" fill="#ffcf68" opacity=".87"/>
    <text x="220" y="413" fill="#5140a4" font-size="17" font-family="monospace">DAY 06 / TRY AGAIN</text></g>`,
};

export const scene = id => `<svg viewBox="0 0 720 500" preserveAspectRatio="xMidYMid slice" aria-hidden="true" focusable="false">${scenes[id]()}</svg>`;
