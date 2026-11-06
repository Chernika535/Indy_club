export const vibes = [
  {id: 'dark', name: 'Dark', title: 'Ночной архив', description: 'Странные истории, сумеречные города и тишина, в которой слышно больше.', color: '#9e83c2'},
  {id: 'slavic', name: 'Slavic', title: 'Живая нить', description: 'Сказки, обряды и народные образы в руках современных авторов.', color: '#d48d78'},
  {id: 'magic', name: 'Magic', title: 'Между мирами', description: 'Невидимые правила, маленькие чудеса и карты воображаемых мест.', color: '#d7b16e'},
  {id: 'romantic', name: 'Romantic', title: 'Личное письмо', description: 'Близость, память и то, что трудно сказать вслух.', color: '#da9aaf'},
  {id: 'sciences', name: 'Sciences', title: 'Полевые записи', description: 'Наблюдения за живыми системами и эксперименты, которые начинаются с вопроса.', color: '#8ebed5'},
  {id: 'selfmade', name: 'Selfmade', title: 'Своя практика', description: 'Дневники, рисунки и способы учиться в собственном темпе.', color: '#a6bd8d'},
];

export const people = [
  {id:'morra', name:'Morra M', practice:'Интерактивная проза', topics:['фольклор','миф','сказка'], url:'https://morramor.itch.io/'},
  {id:'morteshka', name:'Morteshka', practice:'Независимые игры', topics:['фольклор','ведьмы','миф'], url:'https://hypetrain.itch.io/black-book-prologue'},
  {id:'taran', name:'Taran Draws', practice:'Иллюстрации и зины', topics:['фольклор','сказка','рисунок'], url:'https://taran-draws.itch.io/'},
  {id:'rolling', name:'Rolling Glory Jam', practice:'Повествовательные игры', topics:['память','смерть','близость'], url:'https://rollinggloryjam.itch.io/'},
  {id:'owen', name:'OwenTheBell', practice:'Экспериментальные игры', topics:['растения','эксперимент','исследование'], url:'https://owenthebell.itch.io/'},
  {id:'sticky', name:'Sticky Doodler', practice:'Рисование и настольные игры', topics:['растения','рисунок','дневник'], url:'https://stickydoodler.itch.io/'},
  {id:'digital', name:'Digital Terrarium', practice:'Зины и иллюстрированные истории', topics:['растения','город','рисунок','странное'], url:'https://digitalterrarium.itch.io/'},
  {id:'magikya', name:'Magikya Studios', practice:'Дневниковые игры', topics:['растения','дневник','маленькая магия'], url:'https://magikya.itch.io/'},
  {id:'monroeroe', name:'Monroeroe', practice:'Одиночные настольные игры', topics:['растения','дневник','ритуал'], url:'https://monroeroe.itch.io/'},
  {id:'floracrew', name:'Affinity Games Collective', practice:'Настольные игры и сторителлинг', topics:['растения','память','дневник','рисунок'], url:'https://affinity-games.itch.io/'},
  {id:'lostreach', name:'LostReach', practice:'Комиксы и зины', topics:['город','растения','рисунок'], url:'https://lostreach.itch.io/'},
  {id:'bully', name:'Bully Pulpit Games', practice:'Повествовательные настольные игры', topics:['фольклор','миф','сказка'], url:'https://bullypulpitgames.itch.io/'},
];

export const works = [
  {id:'kupala', title:'Купальская ночь', creator:'morra', type:'game', worlds:['slavic','magic'], tags:['фольклор','сказка','фэнтези','миф'], warnings:[], language:'RU', description:'Короткий текстовый квест по мотивам славянского фольклора, где сюжет складывается из твоих решений.', url:'https://morramor.itch.io/fernflower-ru'},
  {id:'black-book', title:'Black Book: Prologue', creator:'morteshka', type:'game', worlds:['dark','slavic','magic'], tags:['фольклор','ведьмы','миф','фэнтези','демоны'], warnings:['демоны'], language:'RU / EN', description:'Начало истории Василисы, молодой колдуньи. Северный фольклор встречается здесь с карточными боями.', url:'https://hypetrain.itch.io/black-book-prologue'},
  {id:'folklore', title:'Folklore Fairytale', creator:'taran', type:'zine', worlds:['slavic','magic'], tags:['фольклор','рисунок','сказка','миф'], warnings:[], language:'EN', description:'Иллюстрированный зин с образами из фольклора и сказок.', url:'https://taran-draws.itch.io/folklore-fairytale'},
  {id:'after', title:'What Comes After', creator:'rolling', type:'game', worlds:['dark','romantic'], tags:['близость','память','смерть','стекло','странное'], warnings:['смерть','стекло'], language:'EN', description:'Поездка в ночном поезде и разговоры с пассажирами, которым предстоит проститься с жизнью.', url:'https://rollinggloryjam.itch.io/what-comes-after'},
  {id:'mendel', title:'Mendel', creator:'owen', type:'game', worlds:['sciences','selfmade'], tags:['растения','исследование','эксперимент','уют','созерцание'], warnings:[], language:'EN', description:'Научная песочница, где можно скрещивать воображаемые растения и наблюдать, как меняются их формы.', url:'https://owenthebell.itch.io/mendel'},
  {id:'bonsai', title:'The Bonsai Diary', creator:'sticky', type:'tabletop', worlds:['selfmade','sciences'], tags:['дневник','рисунок','растения','уют','созерцание'], warnings:[], language:'EN', description:'Игра с рисунками и записями, в которой ты выращиваешь воображаемый бонсай и ведёшь его историю.', url:'https://stickydoodler.itch.io/the-bonsai-diary'},
  {id:'green-dreams', title:'Green Dreams', creator:'digital', type:'zine', worlds:['magic','sciences'], tags:['растения','рисунок','странное','маленькая магия'], warnings:[], language:'EN', description:'Зин Digital Terrarium для тех, кому интересна встреча рисованной фантазии и мира растений.', url:'https://digitalterrarium.itch.io/green-dreams'},
  {id:'botano', title:'Botanokinesis', creator:'magikya', type:'tabletop', worlds:['magic','selfmade'], tags:['дневник','растения','фэнтези','уют','маленькая магия'], warnings:[], language:'EN', description:'Крошечная поэтическая игра для дневника. В её правилах всего 36 слов.', url:'https://magikya.itch.io/botanokinesis'},
  {id:'green-thumb', title:'Green Thumb', creator:'monroeroe', type:'tabletop', worlds:['selfmade','magic'], tags:['дневник','растения','ритуал','созерцание','уют'], warnings:[], language:'EN', description:'Одиночная дневниковая игра, в которой карты таро подсказывают, как ухаживать за вымышленным растением.', url:'https://monroeroe.itch.io/green-thumb'},
  {id:'flora', title:'The Flora', creator:'floracrew', type:'tabletop', worlds:['romantic','sciences','selfmade'], tags:['память','растения','дневник','рисунок','уют'], warnings:[], language:'EN', description:'История с точки зрения растения, которое остаётся на одном месте, пока вокруг сменяются люди и пейзажи.', url:'https://affinity-games.itch.io/the-flora'},
  {id:'dryads', title:'Dryads in Transit', creator:'lostreach', type:'zine', worlds:['sciences','magic'], tags:['исследование','растения','рисунок','маленькая магия'], warnings:[], language:'EN', description:'Иллюстрированный мини-зин о семенах и о том, как они находят новое место для жизни.', url:'https://lostreach.itch.io/dryads-in-transit'},
  {id:'zhenya', title:'Zhenya’s Wonder Tales', creator:'bully', type:'tabletop', worlds:['slavic','dark','magic'], tags:['фольклор','сказка','миф','фэнтези','странное'], warnings:[], language:'EN', description:'Настольная игра, в которой участники сочиняют тревожные сказки из вымышленной Восточной Европы.', url:'https://bullypulpitgames.itch.io/zhenyas-wonder-tales'},
];

export const references = [
  {id:'hike', title:'A Short Hike', aspects:['уют','созерцание','исследование']},
  {id:'spirited', title:'Унесённые призраками', aspects:['маленькая магия','миф','странное']},
  {id:'witcher', title:'Ведьмак', aspects:['фольклор','ведьмы','сказка']},
  {id:'garden', title:'Таинственный сад', aspects:['растения','память','созерцание']},
];

export const routes = [
  {id:'plants', title:'Сад в кармане', intro:'Три способа наблюдать, как растёт воображаемое растение.', works:['mendel','bonsai','flora']},
  {id:'folk', title:'Сказки меняют форму', intro:'От текстового квеста к рисунку и дальше, к историям за общим столом.', works:['kupala','folklore','zhenya']},
];

export const types = {game:'Видеоигра', zine:'Зин / комикс', tabletop:'Настольная игра'};
