// Builds tools/index.html (EN) and ru/tools/index.html (RU) from one list,
// so both languages always show the same tools. Run: node scripts/build-tools.js
// Icons are the plugin's own toolbar glyphs, exported to assets/icons/*.svg.
const fs = require('fs');
const path = require('path');

const root = path.resolve(__dirname, '..');

const groups = [
  {
    id: 'selection',
    en: 'Selection and pose', ru: 'Выделение и поза',
    tools: [
      ['selection_sets', 'Selection Sets', 'Selection Sets',
        'Recall reusable, rig-aware control selections in one click.',
        'Сохранённые выделения контролов под конкретный риг, в один клик.'],
      ['opposite', 'Select Opposite', 'Select Opposite',
        'Jump to the mirrored partners of the current controls, or add them to the selection.',
        'Переход к зеркальным контролам или добавление их к выделению.'],
      ['hierarchy', 'Select Hierarchy', 'Select Hierarchy',
        'Expand the selection through transforms and joints, or pick only the curve controls below.',
        'Расширение выделения по иерархии или выбор только контролов-кривых внутри неё.'],
      ['reset', 'Reset Pose', 'Reset Pose',
        'Return active channels and keys to their defaults.',
        'Возврат активных каналов и ключей к значениям по умолчанию.'],
      ['align', 'Align', 'Align',
        'Snap selected objects to the last selected target in world space.',
        'Привязка выбранных объектов к последнему выбранному в мировом пространстве.'],
    ],
  },
  {
    id: 'keys',
    en: 'Keys and curves', ru: 'Ключи и кривые',
    tools: [
      ['smart_key', 'Smart Key', 'Smart Key',
        'Insert a key without bending the existing curve.',
        'Ключ, который не ломает форму существующей кривой.'],
      ['nudge_right', 'Nudge Keys', 'Nudge Keys',
        'Shift the active animation left or right by the current frame step.',
        'Сдвиг активной анимации влево или вправо на текущий шаг кадров.'],
      ['clipboard_copy', 'Animation Clipboard', 'Animation Clipboard',
        'Capture keys or a timeline range and place the motion at the current frame.',
        'Копирование ключей или диапазона и вставка движения на текущий кадр.'],
      ['tangent_auto', 'Tangents', 'Tangents',
        'Auto, linear or stepped interpolation in one click.',
        'Auto, linear или stepped интерполяция в один клик.'],
      ['euler_filter', 'Smart Euler Filter', 'Smart Euler Filter',
        'Clean rotation jumps only where you are working.',
        'Убирает скачки вращения только там, где ты работаешь.'],
      ['redundant_cleanup', 'Curve Cleanup', 'Curve Cleanup',
        'Simplify keys without visibly changing the curve.',
        'Упрощает ключи, не меняя заметно форму кривой.'],
      ['static_cleanup', 'Static Channels', 'Static Channels',
        'Delete channels whose animation never changes.',
        'Удаляет каналы, анимация которых не меняется.'],
      ['color_key', 'Color Key', 'Color Key',
        'Colored timeline markers for the frames that matter.',
        'Цветные маркеры на таймлайне для важных кадров.'],
      ['arc_tracker', 'Arc Tracker', 'Arc Tracker',
        'Reveal the motion path of selected controls.',
        'Показывает траекторию движения выбранных контролов.'],
    ],
  },
  {
    id: 'layers',
    en: 'Layers and dynamics', ru: 'Слои и динамика',
    tools: [
      ['quick_edit_layer', 'Quick Edit Layer', 'Quick Edit Layer',
        'Create an empty additive layer for the selected controls.',
        'Пустой аддитивный слой для выбранных контролов.'],
      ['smart_bake_layers', 'Smart Bake Layers', 'Smart Bake Layers',
        'Bake every animation layer down to Base Animation.',
        'Запекание всех анимационных слоёв в Base Animation.'],
      ['overlap_dynamics', 'Overlap Dynamics', 'Overlap Dynamics',
        'Bake springy secondary rotation on an ordered FK control chain.',
        'Запекает пружинящее вторичное вращение на цепочке FK-контролов.'],
      ['ragdoll_dynamics', 'Ragdoll Dynamics', 'Ragdoll Dynamics',
        'Turn animation into grounded, controllable physical motion.',
        'Превращает анимацию в физичное, управляемое движение.', 'dev'],
    ],
  },
  {
    id: 'character',
    en: 'Mirror and IK/FK', ru: 'Зеркало и IK/FK',
    tools: [
      ['mirror_pose', 'Mirror Pose', 'Mirror Pose',
        'Send the current pose across the rig\'s mirror plane.',
        'Отражает текущую позу через плоскость симметрии рига.'],
      ['mirror_animation', 'Mirror Animation', 'Mirror Animation',
        'Transfer an animation range to the opposite controls.',
        'Переносит диапазон анимации на противоположные контролы.'],
      ['flip_animation', 'Flip Animation', 'Flip Animation',
        'Exchange both sides of an animation in place.',
        'Меняет местами анимацию левой и правой стороны.'],
      ['ik_fk_matcher', 'IK/FK Matcher', 'IK/FK Matcher',
        'Switch a limb between IK and FK while keeping the pose, or bake the range.',
        'Переключение конечности между IK и FK с сохранением позы или запекание диапазона.', 'profile'],
    ],
  },
  {
    id: 'spaces',
    en: 'Spaces and helper nodes', ru: 'Пространства и вспомогательные ноды',
    tools: [
      ['world_node', 'World Node', 'World Node',
        'Move world animation onto an independent World Node.',
        'Переносит мировую анимацию на независимую World Node.'],
      ['rotation_node', 'Rotation Node', 'Rotation Node',
        'Separate world rotation onto a Rotation Node.',
        'Выносит мировое вращение на отдельную Rotation Node.'],
      ['temp_pivot', 'Temp Pivot', 'Temp Pivot',
        'Place a free temporary pivot, then run again to activate it.',
        'Свободная временная точка вращения: поставил, запустил ещё раз — работает.'],
      ['aim_offset', 'Aim Offset', 'Aim Offset',
        'Control rotation through Direction and Up controls.',
        'Управление вращением через контролы Direction и Up.'],
      ['bake_nodes', 'Bake Nodes', 'Bake Nodes',
        'Bake exactly the selected transforms over the active range.',
        'Запекает именно выбранные трансформы на активном диапазоне.'],
      ['space_switcher', 'Space Switcher', 'Space Switcher',
        'Change parent space while preserving the world pose.',
        'Смена родительского пространства без сдвига позы в мире.'],
      ['xform_relationship', 'Xform Relationship', 'Xform Relationship',
        'Capture objects relative to a driver, restore the offset or bake it across a range.',
        'Запоминает положение объектов относительно драйвера, восстанавливает или запекает его.'],
    ],
  },
  {
    id: 'viewport',
    en: 'Viewport and search', ru: 'Вьюпорт и поиск',
    tools: [
      ['viewport_controls', 'Animation Isolate', 'Animation Isolate',
        'Isolate the selected controls while keeping scene geometry visible.',
        'Изолирует выбранные контролы, оставляя геометрию сцены видимой.'],
      ['viewport_meshes', 'Viewport Filters', 'Viewport Filters',
        'Show or hide controls, locators, joints or meshes in the active viewport.',
        'Показ и скрытие контролов, локаторов, джоинтов или мешей в активном вьюпорте.'],
      ['command_search', 'Command Search', 'Command Search',
        'Find and run any Animbench command by name.',
        'Поиск и запуск любой команды Animbench по названию.'],
    ],
  },
];

const t = {
  en: {
    lang: 'en', title: 'Tools — Animbench', desc: 'Every tool in the Animbench toolbar for Autodesk Maya.',
    skip: 'Skip to content', navMain: 'Main', features: 'Features', inside: 'Inside', tools: 'Tools', get: 'Get Animbench',
    eyebrow: 'Inside the toolbar', h1: 'Every tool, one panel.',
    lead: 'The full set of Animbench tools, with the same icons you see in the Maya toolbar. Every tool also has a guide card inside Maya.',
    dev: 'In development', profile: 'Some rigs need a one-time profile setup',
    jump: 'Jump to group', footer: '© 2026 Andrey Dolzhenko. All rights reserved.', other: 'Русский', contact: '[CONTACT]',
  },
  ru: {
    lang: 'ru', title: 'Инструменты — Animbench', desc: 'Все инструменты панели Animbench для Autodesk Maya.',
    skip: 'К содержимому', navMain: 'Основное меню', features: 'Возможности', inside: 'Состав', tools: 'Инструменты', get: 'Получить',
    eyebrow: 'Внутри панели', h1: 'Все инструменты на одной панели.',
    lead: 'Полный набор инструментов Animbench с теми же иконками, что на панели в Maya. У каждого инструмента есть карточка-подсказка прямо в Maya.',
    dev: 'В разработке', profile: 'Для некоторых ригов нужна разовая настройка профиля',
    jump: 'Перейти к группе', footer: '© 2026 Андрей Долженко. Все права защищены.', other: 'English', contact: '[КОНТАКТ]',
  },
};

const esc = (s) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

function page(lang) {
  const L = t[lang];
  const up = lang === 'en' ? '../' : '../../';          // to site root
  const home = lang === 'en' ? '../' : '../';           // this language's home page
  const otherHref = lang === 'en' ? '../ru/tools/' : '../../tools/';
  const total = groups.reduce((n, g) => n + g.tools.length, 0);

  const chips = groups.map((g) => `<li><a href="#${g.id}">${esc(g[lang])}</a></li>`).join('');

  const sections = groups.map((g) => {
    const cards = g.tools.map(([icon, en, ru, dEn, dRu, flag]) => {
      const name = lang === 'en' ? en : ru;
      const desc = lang === 'en' ? dEn : dRu;
      const badge = flag === 'dev' ? `\n              <span class="tool-badge">${L.dev}</span>` : '';
      const note = flag === 'profile' ? `\n              <p class="tool-note">${L.profile}</p>` : '';
      return `
          <li class="tool">
            <div class="tool-icon"><img src="${up}assets/icons/${icon}.svg" alt="" width="40" height="40" loading="lazy"></div>
            <div class="tool-body">
              <h3>${esc(name)}</h3>${badge}
              <p>${esc(desc)}</p>${note}
            </div>
          </li>`;
    }).join('');
    return `
      <section id="${g.id}" class="tool-group reveal">
        <h2>${esc(g[lang])} <span>${g.tools.length}</span></h2>
        <ul class="tool-grid">${cards}
        </ul>
      </section>`;
  }).join('\n');

  return `<!doctype html>
<html lang="${L.lang}">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>${L.title}</title>
  <meta name="description" content="${L.desc}">
  <link rel="alternate" hreflang="en" href="${lang === 'en' ? './' : '../../tools/'}">
  <link rel="alternate" hreflang="ru" href="${lang === 'en' ? '../ru/tools/' : './'}">
  <link rel="icon" type="image/png" href="${up}assets/img/favicon-32.png">
  <script>document.documentElement.classList.add("js")</script>
  <link rel="preload" href="${up}assets/fonts/unbounded-latin.woff2" as="font" type="font/woff2" crossorigin>
  <link rel="stylesheet" href="${up}assets/css/fonts.css">
  <link rel="stylesheet" href="${up}assets/css/style.css">
</head>
<body class="page-tools">
  <!-- Generated by scripts/build-tools.js — edit the list there, not this file. -->
  <a class="skip" href="#main">${L.skip}</a>

  <header class="site-header is-solid">
    <div class="wrap">
      <a class="brand" href="${home}">
        <img src="${up}assets/img/logo-64.png" alt="" width="36" height="36">
        <span>Animbench</span>
      </a>
      <nav class="nav" aria-label="${L.navMain}">
        <a class="nav-link" href="${home}#demos">${L.features}</a>
        <a class="nav-link" href="${home}#inside">${L.inside}</a>
        <a class="nav-link" href="./" aria-current="page">${L.tools}</a>
        <div class="lang" aria-label="${lang === 'en' ? 'Language' : 'Язык'}">
          ${lang === 'en' ? `<span aria-current="true">EN</span>\n          <a href="${otherHref}" hreflang="ru" lang="ru">RU</a>` : `<a href="${otherHref}" hreflang="en" lang="en">EN</a>\n          <span aria-current="true">RU</span>`}
        </div>
        <a class="btn btn-primary" href="${home}#get">${L.get}</a>
      </nav>
    </div>
  </header>

  <main id="main">
    <div class="ambient" aria-hidden="true"></div>

    <section class="wrap tools-hero">
      <p class="eyebrow">${L.eyebrow} · ${total}</p>
      <h1 data-split>${esc(L.h1)}</h1>
      <p class="lead">${esc(L.lead)}</p>
      <nav aria-label="${L.jump}">
        <ul class="tool-chips">${chips}</ul>
      </nav>
    </section>

    <div class="wrap tools-list">
${sections}
    </div>
  </main>

  <footer class="site-footer">
    <div class="wrap">
      <span>${L.footer}</span>
      <nav aria-label="Footer">
        <a href="${otherHref}" hreflang="${lang === 'en' ? 'ru' : 'en'}" lang="${lang === 'en' ? 'ru' : 'en'}">${L.other}</a>
        <span>${L.contact}</span>
      </nav>
    </div>
  </footer>

  <script src="${up}assets/js/main.js"></script>
</body>
</html>
`;
}

for (const [lang, rel] of [['en', 'tools/index.html'], ['ru', 'ru/tools/index.html']]) {
  const file = path.join(root, rel);
  fs.mkdirSync(path.dirname(file), { recursive: true });
  fs.writeFileSync(file, page(lang));
  console.log('wrote', rel);
}
