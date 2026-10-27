/* Study content for the Introduction to Literature midterm (Wednesday 2026-10-28).
   Sources: the three decks (content/L1-general.md, L2-poetry1.md, L3-poetry2.md) and
   «How to Read a Poem» (content/poems.md). L1 and L2 are PowerPoint decks (slides);
   L3 and the poem document are PDFs (pages). The struck-out L3 device (S2, S12) is left out on purpose.
   data-questions.js and data-poems.js add more keys to window.PH after this file. */
(function () {
'use strict';

/* ---------- inline helpers for lesson HTML ---------- */
function en(t) { return '<bdi class="t-en" dir="ltr">' + t + '</bdi>'; }
/* source chip: L1/L2 are slides («شريحة»), L3 and the poem document are pages («ص») */
function pg(lec, p) {
  var unit = (lec === 'L1' || lec === 'L2') ? 'شريحة' : 'ص';
  return '<span class="t-pg"><bdi dir="ltr">' + lec + '</bdi> · <bdi dir="rtl">' + unit + ' <bdi dir="ltr">' + p + '</bdi></bdi></span>';
}
/* an English example on its own left-aligned row, with an optional "title · poet" line */
function exq(text, by) {
  return '<div class="t-en" dir="ltr" style="text-align:left">' + text + (by ? '<br><small class="dim">' + by + '</small>' : '') + '</div>';
}
/* example block: a one-column table whose header says it is an example.
   o = { by, why (Arabic line under the example), words (English words on their own row), src, head } */
function ex(text, o) {
  o = o || {};
  var rows = [[exq(text, o.by)]];
  if (o.why) rows.push(['<span class="dim">' + o.why + '</span>']);
  if (o.words) rows.push([exq(o.words)]);
  var b = { table: { head: [o.head || 'مثال من المحاضرة'], rows: rows } };
  if (o.src) b.src = o.src;
  return b;
}
/* row for a "more examples" table: one stacked cell, device name (Arabic + English) over the full-width example */
function exRow(ar, term, text, by) { return ['<b>' + ar + '</b> · ' + en(term) + '<div style="margin-top:4px">' + exq(text, by) + '</div>']; }

var D = window.PH || {};
D.examDate = '2026-10-28';

D.lectures = {
  L1: { ar: 'الأدب وأنواعه', en: 'Introduction to Literature (General)' },
  L2: { ar: 'أنواع الشعر', en: 'Poetry I' },
  L3: { ar: 'أدوات الشعر', en: 'Poetry II · Aesthetic Elements' },
  P:  { ar: 'الفقرة', en: 'The Eagle · A Dream Deferred' }
};

D.topics = {
  'gen-power':    { ar: 'الأدب وقوّته', en: 'Literature · The Power of Literature', lec: 'L1' },
  'gen-genres':   { ar: 'الأنواع الأدبية', en: 'Genres and subgenres', lec: 'L1' },
  'p1-lyric':     { ar: 'الشعر الغنائي', en: 'Lyric poetry', lec: 'L2' },
  'p1-narrative': { ar: 'الشعر القصصي', en: 'Narrative poetry', lec: 'L2' },
  'p1-forms':     { ar: 'المسرحي والمرسل والحر', en: 'Dramatic poetry · Blank verse · Free verse', lec: 'L2' },
  'p1-elements':  { ar: 'شكل القصيدة ووزنها', en: 'Stanza · Rhyme · Foot · Metre', lec: 'L2' },
  'p2-figures':   { ar: 'الصور البلاغية', en: 'Figures of speech', lec: 'L3' },
  'p2-sound':     { ar: 'الأدوات الصوتية', en: 'Sound devices', lec: 'L3' },
  /* the pairs come from all three decks; most of them are L3 */
  'confuse':      { ar: 'المصطلحات المتشابهة', en: 'Look-alike terms', lec: 'L3' }
};

D.lessons = [
/* ===== L1 · General ===== */
{ id: 'l1-power', lec: 'L1', topic: 'gen-power', ar: 'ما هو الأدب؟', en: 'What is literature?', min: 4, blocks: [
  { def: ['Literature', 'الأدب', 'Literature is a term used to describe written and sometimes spoken material produced for a specific purpose, such as information, education and entertainment.', 'الأدب كلام مكتوب، وأحيانًا منطوق. يُكتب لهدف معيّن، مثل نقل المعلومات أو التعليم أو التسلية.'], src: pg('L1', 2) },
  { def: ['Literature', 'المعنى الأشهر', 'Literature most commonly refers to works of the creative imagination, including poetry, drama, fiction and nonfiction.', 'في الغالب نقصد بالأدب الأعمال التي يصنعها خيال الكاتب. منها الشعر والدراما، والأدب الخيالي والواقعي.'], src: pg('L1', 2) },
  { h: 'قوة الأدب', en: 'The Power of Literature' },
  { p: 'في الشريحتين ثمانية أشياء يقدر الأدب أن يفعلها:' },
  { table: { head: ['المعنى', 'في الشريحة'], rows: [
    ['يعلّم ويقدّم درسًا', en('Can be didactic')],
    ['يمجّد الدول أو القادة', en('Can be used to glorify nations or leaders')],
    ['يؤثّر في الناس أو يتحكّم فيهم', en('Can be used for influence or control')],
    ['يسلّي الناس ويمتعهم', en('Can be entertaining and give pleasure to people')],
    ['يسجّل التاريخ ويغيّره', en('Can record and change history')],
    ['يبني مهارة التفكير النقدي', en('Can build critical thinking skills')],
    ['يحسّن مهارة الكتابة', en('Can improve writing skills')],
    ['يجعلكِ إنسانًا', en('Can make you a human!')]
  ] }, src: pg('L1', 3) + ' ' + pg('L1', 4) },
  { note: 'كلمة ' + en('didactic') + ' معناها: يعلّم أو يقدّم درسًا.' }
] },
{ id: 'l1-genres', lec: 'L1', topic: 'gen-genres', ar: 'الأنواع الأدبية الثلاثة', en: 'Poetry · Drama · Prose', min: 5, blocks: [
  { p: 'للأدب ثلاثة أنواع رئيسية ' + en('(Main Literary Genres)') + ': الشعر، والدراما، والنثر.' },
  { def: ['Poetry', 'الشعر', 'Poetry is language written in lines (verses) often organized into stanzas with rhythm, figurative language, imagery, sound devices and emotionally charged language.', 'الشعر كلام مكتوب في أسطر، واسم السطر ' + en('verse') + '. تتجمّع الأسطر غالبًا في مقاطع شعرية ' + en('(stanzas)') + '. وفيه إيقاع، وصور، وأدوات صوتية، ولغة مليئة بالمشاعر.'], src: pg('L1', 6) },
  { def: ['Drama', 'الدراما', 'Drama is a story written to be performed by actors.', 'الدراما قصة تُكتب ليمثّلها ممثلون. ويمكن أيضًا قراءة نسختها المكتوبة، واسمها ' + en('script') + '.'], src: pg('L1', 8) },
  { p: 'عناصرها الأساسية ثلاثة:' },
  { list: ['الحوار · ' + en('dialogue'), 'الحبكة، أي تسلسل الأحداث · ' + en('plot'), 'الشخصيات · ' + en('characters')], src: pg('L1', 8) },
  { def: ['Prose', 'النثر', 'Prose is the ordinary form of written language that imitates the spoken language.', 'النثر هو الكتابة العادية التي نستخدمها كل يوم. وهو يشبه طريقة كلامنا.'], src: pg('L1', 10) },
  { note: 'النثر عكس الشعر. الشعر له بنية إيقاعية لا تشبه الكلام العادي. ' + pg('L1', 10) }
] },
{ id: 'l1-subgenres', lec: 'L1', topic: 'gen-genres', ar: 'الأنواع الفرعية', en: 'Subgenres', min: 4, blocks: [
  { p: 'تحت كل نوع رئيسي أنواع فرعية ' + en('(subgenres)') + '. هذا مخطط الشريحة 12:' },
  { tree: { root: ['Literary Genres', 'الأنواع الأدبية'], kids: [
    ['Poetry (Verse)', 'الشعر', '5 أنواع', 'Lyric Poetry<br>Narrative Poetry<br>Dramatic Poetry<br>Free Verse<br>Blank Verse'],
    ['Drama', 'الدراما', '3 أنواع', 'Tragedy<br>Comedy<br>Satyr play'],
    ['Prose', 'النثر', 'نوعان', 'Fiction<br>Non-Fiction'] ] }, src: pg('L1', 12) },
  { h: 'نوعا النثر', en: 'Prose subgenres' },
  { compare: [
    { t: 'Fiction', ar: 'الأدب الخيالي', items: ['الروايات · ' + en('Novels'), 'الروايات القصيرة · ' + en('Novellas'), 'القصص القصيرة · ' + en('Short stories')] },
    { t: 'Non-fiction', ar: 'الأدب الواقعي', items: ['السِّيَر · ' + en('Biographies'), 'المذكرات · ' + en('Memoirs'), 'أدلة السفر · ' + en('Travel Guides')] }
  ], src: pg('L1', 11) },
  { note: 'النوع الثالث في الدراما له اسمان في الشرائح. في الشريحة 9: ' + en('Satyr drama') + '. وفي الشريحة 12: ' + en('Satyr play') + '. اعرفي الاسمين.' },
  { more: 'أسماء الأنواع بالعربية', blocks: [
    { table: { head: ['بالعربية', 'في الشرائح'], rows: [
      ['الشعر الغنائي', en('Lyric Poetry')], ['الشعر القصصي', en('Narrative Poetry')], ['الشعر المسرحي', en('Dramatic Poetry')],
      ['الشعر الحر', en('Free Verse')], ['الشعر المرسل', en('Blank Verse')],
      ['المأساة', en('Tragedy')], ['الملهاة', en('Comedy')], ['مسرحية الساتير', en('Satyr drama · Satyr play')],
      ['الأدب الخيالي', en('Fiction')], ['الأدب الواقعي', en('Non-fiction')]
    ] }, src: pg('L1', 7) + ' ' + pg('L1', 9) + ' ' + pg('L1', 11) },
    { p: 'الشرائح تذكر هذه الأنواع بأسمائها فقط. تعريف الشعر الحر والمرسل في المحاضرة الثانية.' }
  ] }
] },

/* ===== L2 · Poetry I ===== */
{ id: 'l2-lyric', lec: 'L2', topic: 'p1-lyric', ar: 'الشعر الغنائي', en: 'Lyric poetry', min: 6, blocks: [
  { def: ['Lyric poetry', 'الشعر الغنائي', 'A short, emotional, song-like poem that expresses the emotions and feelings of the speaker or the poet.', 'قصيدة قصيرة تشبه الأغنية. يعبّر فيها الشاعر، أو المتكلم في القصيدة، عن مشاعره.'], src: pg('L2', 2) },
  { tree: { root: ['Lyric poetry', 'أنواعه ثلاثة'], kids: [
    ['Sonnet', 'السونيت', '14 سطرًا', ''],
    ['Elegy', 'المرثية', 'حزن على فقد', ''],
    ['Ode', 'قصيدة المدح', 'مدح وتقدير', ''] ] }, src: pg('L2', 2) },
  { def: ['Sonnet', 'السونيت', 'A poem of fourteen lines written in iambic pentameter. The theme of the poem is summed up in the last two lines.', 'قصيدة من 14 سطرًا، ووزنها ' + en('iambic pentameter') + '. فكرتها الأساسية تُلخَّص في آخر سطرين.'], src: pg('L2', 3) },
  ex('Shall I compare thee to a summer’s day?', { by: 'William Shakespeare', why: 'أول سطر من السونيت في الشريحة 4.', src: pg('L2', 4) }),
  { more: 'السونيت كاملة (14 سطرًا)', blocks: [
    ex('Shall I compare thee to a summer’s day?<br>Thou art more lovely and more temperate:<br>Rough winds do shake the darling buds of May,<br>And summer’s lease hath all too short a date;<br>Sometime too hot the eye of heaven shines,<br>And often is his gold complexion dimm’d;<br>And every fair from fair sometime declines,<br>By chance or nature’s changing course untrimm’d;<br>But thy eternal summer shall not fade,<br>Nor lose possession of that fair thou ow’st;<br>Nor shall death brag thou wander’st in his shade,<br>When in eternal lines to time thou grow’st:<br>So long as men can breathe or eyes can see,<br>So long lives this, and this gives life to thee.',
      { by: 'William Shakespeare', head: 'من الشريحة 4', why: 'عدّي الأسطر: 14 سطرًا. وآخر سطرين فيهما خلاصة القصيدة.', src: pg('L2', 4) })
  ] },
  { h: 'ثلاثة أشكال للسونيت', en: 'Sonnet forms' },
  { table: { head: ['سبب الاسم', 'الشكل'], rows: [
    ['شكل إيطالي. سُمّي باسم الشاعر الإيطالي بترارك.', en('Petrarchan sonnet')],
    ['سُمّي باسم الشاعر الإنجليزي سبنسر. هو الذي عدّل سونيت بترارك.', en('Spenserian sonnet')],
    ['سُمّي باسم شكسبير، لأنه استخدم هذا الشكل كثيرًا.', en('English / Shakespearean sonnet')]
  ] }, src: pg('L2', 3) },
  { def: ['Elegy', 'المرثية', 'A poem lamenting the death of a person or reflecting on a serious situation. It is written to express grief or mourning for someone who died, or something lost.', 'قصيدة حزينة. يبكي فيها الشاعر شخصًا مات، أو شيئًا ضاع. وقد يتأمّل فيها موقفًا صعبًا وجادًّا.'], src: pg('L2', 3) },
  { def: ['Ode', 'قصيدة المدح', 'A lyric poem characterised by giving praise or showing appreciation for a person, place, thing, or idea.', 'قصيدة غنائية يمدح فيها الشاعر شيئًا ويقدّره. قد يكون شخصًا أو مكانًا أو شيئًا أو فكرة.'], src: pg('L2', 3) }
] },
{ id: 'l2-narrative', lec: 'L2', topic: 'p1-narrative', ar: 'الشعر القصصي', en: 'Narrative poetry', min: 4, blocks: [
  { def: ['Narrative poetry', 'الشعر القصصي', 'A poem which tells a story.', 'قصيدة تحكي قصة. ولها نوعان رئيسيان: الملحمة والبالاد.'], src: pg('L2', 6) },
  { def: ['Epic', 'الملحمة', 'An epic is a very long narrative poem written in a grand style that traces the adventures of a hero and his good deeds.', 'قصيدة قصصية طويلة جدًا، بأسلوب فخم. تتبع مغامرات بطل وأعماله الطيبة.'], src: pg('L2', 7) },
  ex('The Odyssey by Homer, written in 12 books, is a good example.', { why: 'ملحمة الأوديسة للشاعر هوميروس، وهي في 12 كتابًا.', src: pg('L2', 7) }),
  { def: ['Ballad', 'البالاد (أغنية شعبية)', 'A ballad is a folk song that transmits a story orally. This type of poetry originated among illiterate people.', 'أغنية شعبية تنقل قصة بالكلام، لا بالكتابة. بدأ هذا النوع بين ناس لا يعرفون القراءة والكتابة.'], src: pg('L2', 7) }
] },
{ id: 'l2-forms', lec: 'L2', topic: 'p1-forms', ar: 'المسرحي والمرسل والحر', en: 'Dramatic poetry · Blank verse · Free verse', min: 5, blocks: [
  { def: ['Dramatic poetry', 'الشعر المسرحي', 'Dramatic poetry is a type of poetry written in the form of a play or dialogue, where characters speak and interact, often exploring emotions, conflicts, or stories through their voices.', 'شعر مكتوب على شكل مسرحية أو حوار. تتكلم فيه الشخصيات ويتفاعل بعضها مع بعض. ومن كلامها نرى المشاعر والصراعات والقصص.'], src: pg('L2', 8) },
  { h: 'المرسل والحر', en: 'Blank verse · Free verse' },
  { def: ['Blank verse', 'الشعر المرسل', 'Poetry written with a regular rhythm (usually iambic pentameter) but without rhyme.', 'له إيقاع منتظم، ووزنه غالبًا ' + en('iambic pentameter') + '. لكن ليس فيه قافية.'], src: pg('L2', 9) },
  { def: ['Free verse', 'الشعر الحر', 'Poetry that has no regular rhyme scheme, meter, or fixed pattern.', 'ليس له نظام قافية منتظم، ولا وزن منتظم، ولا شكل ثابت.'], src: pg('L2', 9) },
  { note: 'الفرق: ' + en('blank verse') + ' يترك القافية فقط، ويبقى إيقاعه منتظمًا. أما ' + en('free verse') + ' فيترك القافية والوزن معًا.' }
] },
{ id: 'l2-stanza', lec: 'L2', topic: 'p1-elements', ar: 'المقطع الشعري والسطر والقافية', en: 'Stanza · Verse · Rhyme', min: 5, blocks: [
  { def: ['Stanza', 'المقطع الشعري', 'a group of lines arranged together in a recurring pattern of metrical lengths and a sequence of rhymes.', 'مجموعة أسطر متجاورة، يتكرر فيها نمط الطول والقافية. وليس للمقطع الشعري طول ثابت.'], src: pg('L2', 10) },
  { table: { head: ['عدد الأسطر', 'اسم المقطع الشعري'], rows: [
    ['سطران', en('Couplet')], ['3 أسطر', en('Tercet')], ['4 أسطر', en('Quatrain')]
  ] }, src: pg('L2', 10) },
  { def: ['Verse', 'السطر الشعري', 'refers to a single line of a poem.', 'سطر واحد من القصيدة.'], src: pg('L2', 10) },
  { def: ['Rhyme', 'القافية', 'The repetition of similar sounds at the end of words, mostly in the final syllables of lines in poems.', 'أصوات متشابهة تتكرر في آخر الكلمات. وغالبًا تأتي في آخر الأسطر.'], src: pg('L2', 10) },
  ex('hat, cat, brat, mat, sat.', { why: 'كل الكلمات تنتهي بالصوت نفسه.', src: pg('L2', 10) }),
  { def: ['Rhyme scheme', 'نظام القافية', 'the pattern of rhyme that comes at the end of each verse/line in poetry.', 'ترتيب القوافي في آخر الأسطر. نكتبه بحروف: الأسطر التي لها القافية نفسها تأخذ الحرف نفسه.'], src: pg('L2', 10) },
  ex('ab ab ab cc', { why: 'الحرفان المتشابهان يعنيان قافية واحدة.', src: pg('L2', 10) })
] },
{ id: 'l2-feet', lec: 'L2', topic: 'p1-elements', ar: 'التفعيلة وأنواعها', en: 'Foot · Common poetic feet', min: 5, blocks: [
  { def: ['Foot', 'التفعيلة', 'Each set of syllables is one foot. So, the foot consists of one, two or more syllables.', 'نقسم السطر إلى مجموعات صغيرة من المقاطع الصوتية ' + en('(syllables)') + '. كل مجموعة اسمها ' + en('foot') + '. وفيها مقطع واحد أو اثنان أو أكثر.'], src: pg('L2', 11) },
  { p: 'نصف التفعيلة بمقاطعها الصوتية: مقطع صوتي عليه ضغط ' + en('(stressed)') + '، ومقطع صوتي بلا ضغط ' + en('(unstressed)') + '.' },
  { table: { head: ['المعنى', 'في الشريحة'], rows: [
    ['مقطع صوتي واحد فقط', en('Monosyllabic: has only one syllable.')],
    ['بلا ضغط، ثم عليه ضغط', en('Iambic: unstressed syllable followed by a stressed syllable.')],
    ['عليه ضغط، ثم بلا ضغط', en('Trochaic: stressed syllable followed by an unstressed syllable.')],
    ['3 مقاطع، والأخير عليه ضغط', en('Anapestic: three syllables; the last one is stressed.')]
  ] }, src: pg('L2', 11) },
  { h: 'مخطط التفعيلات', en: 'Common poetic feet' },
  { note: 'الرمز ' + en('∪') + ' مقطع بلا ضغط. والرمز ' + en('—') + ' مقطع عليه ضغط.' },
  { table: { head: ['التفعيلة', 'الرمز', 'مثال'], rows: [
    [en('Iamb'), en('∪ —'), en('be-lieve')],
    [en('Trochee'), en('— ∪'), en('gar-den')],
    [en('Anapest'), en('∪ ∪ —'), en('in-to-night')],
    [en('Dactyl'), en('— ∪ ∪'), en('beau-ti-ful')],
    [en('Spondee'), en('— —'), en('heart-break')]
  ] }, src: pg('L2', 11) },
  { note: 'انتبهي: كل زوج من هذين الزوجين هو عكس الآخر في ترتيب الضغط.' },
  { table: { head: ['الأزواج المتعاكسة'], rows: [[en('Iamb ↔ Trochee')], [en('Anapest ↔ Dactyl')]] }, src: pg('L2', 11) }
] },
{ id: 'l2-metre', lec: 'L2', topic: 'p1-elements', ar: 'الوزن', en: 'Metre', min: 5, blocks: [
  { def: ['Meter (Metre)', 'الوزن', 'Meter is the regular pattern of stressed and unstressed syllables, organised into feet, in a line of poetry.', 'الوزن هو النمط المنتظم في السطر: مقاطع عليها ضغط، ومقاطع بلا ضغط. وهذه المقاطع مقسّمة إلى تفعيلات.'], src: pg('L2', 12) },
  ex('Syllables → Feet → Meter', { head: 'في الشريحة', why: 'المقاطع تكوّن التفعيلات، والتفعيلات تكوّن الوزن.', src: pg('L2', 12) }),
  { h: 'كم تفعيلة في السطر؟', en: 'Feet per line' },
  { table: { head: ['عدد التفعيلات في السطر', 'الاسم'], rows: [
    ['تفعيلة واحدة', en('Monometer')], ['تفعيلتان', en('Dimeter')], ['3', en('Trimeter')], ['4', en('Tetrameter')],
    ['5', en('Pentameter')], ['6', en('Hexameter')], ['7', en('Heptameter')], ['8', en('Octameter')]
  ] }, src: pg('L2', 12) },
  { note: 'لتتذكري العدد، انظري إلى أول اسم التفعيلات.' },
  ex('Mono 1 · Di 2 · Tri 3 · Tetra 4 · Penta 5 · Hexa 6 · Hepta 7 · Octa 8', { head: 'ابدئي من أول الاسم' }),
  { h: 'مثال من الشريحة 5', en: 'Iambic pentameter' },
  { p: 'وزن السونيت ' + en('iambic pentameter') + '. يعني: 5 تفعيلات في السطر، وكل تفعيلة ' + en('iamb') + '، أي مقطع بلا ضغط ثم مقطع عليه ضغط.' },
  ex('Shall <b>I</b> | com<b>pare</b> | thee <b>to</b> | a <b>sum</b> | mer’s <b>day</b>?<br><small class="dim">Short Long · Short Long · Short Long · Short Long · Short Long</small>', { why: 'المقاطع الغامقة عليها ضغط.', src: pg('L2', 5) })
] },

/* ===== L3 · Poetry II ===== */
{ id: 'l3-figures-1', lec: 'L3', topic: 'p2-figures', ar: 'التشبيه والاستعارة والرمز', en: 'Simile · Metaphor · Symbol · Personification', min: 6, blocks: [
  { p: 'تقسم المحاضرة أدوات الشعر قسمين: الصور البلاغية ' + en('(figures of speech)') + '، والأدوات الصوتية ' + en('(sound devices)') + '. نبدأ بالصور البلاغية.', src: pg('L3', 2) },
  { def: ['Simile', 'التشبيه', 'A comparison between two unrelated things using the word ‘like’ or ‘as’.', 'نقارن بين شيئين مختلفين، ونستخدم كلمة ' + en('like') + ' أو ' + en('as') + '. هذه الكلمة هي علامته.'], src: pg('L3', 3) },
  ex('His skin was as cold as ice.', { why: 'المقارنة بكلمة ' + en('as') + ': الجلد بارد مثل الثلج.', src: pg('L3', 3) }),
  { def: ['Metaphor', 'الاستعارة', 'The comparison between two objects indirectly (without the use of ‘as’ and ‘like’).', 'مقارنة بين شيئين، لكنها غير مباشرة. ليس فيها ' + en('like') + '، وليس فيها ' + en('as') + '.'], src: pg('L3', 5) },
  ex('She is the moon.', { why: 'لم تقل الجملة: مثل القمر. قالت: هي القمر.', src: pg('L3', 5) }),
  { def: ['Symbol', 'الرمز', 'A figure of speech where an object, person, or situation has another meaning other than its literal meaning. These symbols are usually well recognized and known by everyone.', 'شيء أو شخص أو موقف له معنى آخر غير معناه الحرفي. وغالبًا يعرف كل الناس هذا المعنى.'], src: pg('L3', 6) },
  ex('The dove is a symbol of peace.', { why: 'الحمامة طائر، لكن الكل يعرف أنها تعني السلام.', src: pg('L3', 6) }),
  { def: ['Personification', 'التشخيص', 'Giving human characteristics/qualities to objects, ideas, or animals.', 'نعطي صفات الإنسان لشيء ليس إنسانًا: جماد، أو فكرة، أو حيوان.'], src: pg('L3', 8) },
  ex('She did not realize that opportunity was knocking at her door.', { why: 'الفرصة فكرة، وأعطتها الجملة فعل إنسان: تطرق الباب.', src: pg('L3', 8) }),
  { more: 'أمثلة أخرى من المحاضرة', blocks: [
    { table: { head: ['الأداة والمثال'], rows: [
      exRow('التشبيه', 'Simile', 'They fight like cats and dogs.'),
      exRow('التشبيه', 'Simile', 'O my Luve is like a red, red rose<br>That’s newly sprung in June;', 'A Red, Red Rose · Robert Burns'),
      exRow('التشبيه', 'Simile', 'Like a bruised, little bird<br>Too confused to fly,<br>I\'m trapped, in a word,<br>So confined am I.', 'Greater Than That · Joyce Garacci'),
      exRow('الاستعارة', 'Metaphor', 'All the world’s a stage,<br>And all the men and women merely players;', 'As You Like It · William Shakespeare'),
      exRow('الاستعارة', 'Metaphor', 'An aged man is but a paltry thing,<br>A tattered coat upon a stick,', 'Sailing to Byzantium · W.B. Yeats'),
      exRow('الرمز', 'Symbol', 'Heart is the symbol of love.'),
      exRow('الرمز', 'Symbol', 'Black is a symbol of evil or death.'),
      exRow('الرمز', 'Symbol', 'And all our yesterdays have lighted fools<br>The way to dusty death. Out, out, brief candle.<br>Life’s but a walking shadow, a poor player<br>That struts and frets his hour upon the stage,', 'Macbeth · William Shakespeare'),
      exRow('الرمز', 'Symbol', 'Out of the ash<br>I rise with my red hair<br>And I eat men like air.', 'Lady Lazarus · Sylvia Plath'),
      exRow('التشخيص', 'Personification', 'I spent my evening watching the dancing flames.'),
      exRow('التشخيص', 'Personification', 'Death, be not proud, though some have called thee<br>Mighty and dreadful, for thou art not so', 'Death, be not proud · John Donne'),
      exRow('التشخيص', 'Personification', 'Life’s but a walking shadow, a poor player<br>That struts and frets his hour upon the stage,', 'Macbeth · William Shakespeare')
    ] }, src: pg('L3', 3) + ' ' + pg('L3', 4) + ' ' + pg('L3', 5) + ' ' + pg('L3', 6) + ' ' + pg('L3', 7) + ' ' + pg('L3', 8) }
  ] }
] },
{ id: 'l3-irony', lec: 'L3', topic: 'p2-figures', ar: 'المفارقة وأنواعها', en: 'Irony: verbal · situational · dramatic', min: 5, blocks: [
  { p: 'للمفارقة ' + en('(irony)') + ' ثلاثة أنواع في المحاضرة:' },
  { def: ['Verbal irony', 'المفارقة اللفظية', 'A statement or action that is used to express the opposite meaning.', 'نقول كلامًا ونقصد عكسه.'], src: pg('L3', 9) },
  ex('She is as friendly as a rattlesnake.', { why: 'فيها كلمة ' + en('as') + '، لكن المقصود عكس الكلام: هي ليست لطيفة أبدًا. لذلك هي ' + en('verbal irony') + '.', src: pg('L3', 9) }),
  { def: ['Situational irony', 'المفارقة الموقفية', 'occurs when the expected outcome does not happen, or the opposite happens instead.', 'نتوقع نتيجة، فلا تحدث، أو يحدث عكسها.'], src: pg('L3', 10) },
  ex('the fire-station burnt down.', { why: 'محطة الإطفاء تطفئ الحريق، لكنها هي التي احترقت.', src: pg('L3', 10) }),
  { def: ['Dramatic irony', 'المفارقة الدرامية', 'when the audience knows more about what’s going on than the characters.', 'الجمهور يعرف ما يحدث أكثر من الشخصيات.'], src: pg('L3', 11) },
  ex('The audience knows that Juliet is only asleep, not dead, but Romeo does not know, so he kills himself.', { by: 'Romeo and Juliet · William Shakespeare', why: 'نحن نعرف أن جولييت نائمة، وروميو لا يعرف.', src: pg('L3', 11) }),
  { more: 'أمثلة أخرى من المحاضرة', blocks: [
    { table: { head: ['النوع والمثال'], rows: [
      exRow('اللفظية', 'Verbal irony', 'For Brutus is an honourable man;<br>So are they all, all honourable men–', 'Julius Caesar · William Shakespeare'),
      exRow('الموقفية', 'Situational irony', 'Water, water, every where,<br>Nor any drop to drink.', 'The Rime of the Ancient Mariner · Samuel Coleridge')
    ] }, src: pg('L3', 9) + ' ' + pg('L3', 10) }
  ] }
] },
{ id: 'l3-figures-2', lec: 'L3', topic: 'p2-figures', ar: 'الصور والتضاد والتناقض', en: 'Imagery · Oxymoron · Paradox', min: 5, blocks: [
  { def: ['Imagery', 'الصور الحسية', 'Elements of a poem that invoke any of the five senses to create a set of mental images to represent ideas, objects, or actions.', 'كلمات تخاطب حواسّكِ الخمس، فترسم صورة في ذهنكِ. كأنكِ ترين المشهد أو تسمعينه.'], src: pg('L3', 13) },
  ex('Tyger Tyger burning bright,<br>In the forests of the night', { by: 'The Tyger · William Blake', why: 'صورة بصرية ' + en('(visual imagery)') + ': نرى النمر يلمع في ظلام الغابة.', src: pg('L3', 13) }),
  { def: ['Oxymoron', 'جمع الضدين', 'When two opposite ideas are joined to create an effect. The common oxymoron phrase is a combination of an adjective preceded by a noun with contrasting meanings.', 'نجمع كلمتين معناهما متضاد في عبارة قصيرة واحدة.'], src: pg('L3', 14) },
  ex('Living dead.', { why: 'حيّ وميّت معًا: كلمتان متضادتان.', src: pg('L3', 14) }),
  { def: ['Paradox', 'التناقض الظاهري', 'A paradox is a statement that contradicts itself and still seems true somehow.', 'جملة تبدو متناقضة مع نفسها، لكنها صحيحة بطريقة ما.'], src: pg('L3', 15) },
  ex('This is the beginning of the end.', { why: 'البداية والنهاية معًا تبدو غير منطقية، لكن المعنى صحيح.', src: pg('L3', 15) }),
  { more: 'أمثلة أخرى من المحاضرة', blocks: [
    { table: { head: ['الأداة والمثال'], rows: [
      exRow('صورة سمعية', 'Auditory imagery', 'While I nodded, nearly napping, suddenly there came a tapping,<br>As of someone gently rapping, rapping at my chamber door.', 'The Raven · Edgar Allan Poe'),
      exRow('جمع الضدين', 'Oxymoron', 'Bittersweet.'),
      exRow('جمع الضدين', 'Oxymoron', 'Old news.'),
      exRow('جمع الضدين', 'Oxymoron', 'who see with blinding sight', 'Do not go gentle · Dylan Thomas'),
      exRow('جمع الضدين', 'Oxymoron', 'Call me rather, silent voices', 'The Silent Voices · Alfred Lord Tennyson'),
      exRow('التناقض الظاهري', 'Paradox', 'Earn money by spending it.'),
      exRow('التناقض الظاهري', 'Paradox', 'Men work together,’ I told him from the heart,<br>Whether they work together or apart.', 'Tuft of Flowers · Robert Frost'),
      exRow('التناقض الظاهري', 'Paradox', 'Cowards die many times before their deaths;<br>The valiant never taste of death but once.', 'Julius Caesar · William Shakespeare')
    ] }, src: pg('L3', 13) + ' ' + pg('L3', 14) + ' ' + pg('L3', 15) }
  ] }
] },
{ id: 'l3-sound-1', lec: 'L3', topic: 'p2-sound', ar: 'تكرار الأصوات', en: 'Alliteration · Consonance · Assonance', min: 5, blocks: [
  { p: 'القسم الثاني: الأدوات الصوتية ' + en('(sound devices)') + '. أول ثلاث منها تكرار لصوت في السطر.', src: pg('L3', 2) },
  { def: ['Alliteration', 'تكرار الصوت الأول', 'The repetition of the initial/first sound (consonants) in two or more words in a line.', 'يتكرر أول صوت في كلمتين أو أكثر في السطر نفسه. وهذا الصوت حرف ساكن ' + en('(consonant)') + '.'], src: pg('L3', 16) },
  ex('And each slow dusk a drawing-down of blinds', { by: 'Anthem for Doomed Youth · Wilfred Owen', why: 'ثلاث كلمات تبدأ بصوت ' + en('d') + '.', src: pg('L3', 16) }),
  { def: ['Consonance', 'تكرار الصوت الأخير', 'Consonance refers to repeating the consonant sounds usually at the end of two words or more in a line.', 'يتكرر صوت حرف ساكن، وغالبًا في آخر كلمتين أو أكثر في السطر.'], src: pg('L3', 17) },
  ex('All’s well that ends well', { by: 'All’s well that ends well · William Shakespeare', why: 'يتكرر صوت ' + en('l') + ' في آخر الكلمات.', src: pg('L3', 17) }),
  { def: ['Assonance', 'تكرار الحرف الصوتي', 'Assonance is the repetition of the same vowel sounds within words or phrases. It can start with different consonant sounds.', 'يتكرر صوت حرف صوتي ' + en('(vowel)') + ' داخل الكلمات. وقد تبدأ الكلمات بحروف ساكنة مختلفة.'], src: pg('L3', 18) },
  ex('Fleet feet sweep by sleeping geese', { why: 'الكلمات التي فيها الصوت نفسه:', words: 'fleet, feet, sweep, sleeping, geese', src: pg('L3', 18) }),
  { more: 'أمثلة أخرى من المحاضرة', blocks: [
    { table: { head: ['الأداة والمثال'], rows: [
      exRow('تكرار الصوت الأول', 'Alliteration', 'Narrow nightwatch nigh the ship’s head<br>While she tossed close to cliffs.', 'The Seafarer · Ezra Pound'),
      exRow('تكرار الصوت الأخير', 'Consonance', 'The darkness drops again; but now I know<br>That twenty centuries of stony sleep<br>Were vexed to nightmare by a rocking cradle', 'The Second Coming · W.B. Yeats'),
      exRow('تكرار الحرف الصوتي', 'Assonance', 'Tyger Tyger, burning bright,<br>In the forests of the night', 'The Tyger · William Blake'),
      exRow('تكرار الحرف الصوتي', 'Assonance', 'Tomorrow, and tomorrow, and tomorrow<br>Creeps in this petty pace from day to day', 'Macbeth · William Shakespeare')
    ] }, src: pg('L3', 16) + ' ' + pg('L3', 17) + ' ' + pg('L3', 18) },
    { note: 'سطر ' + en('The Tyger') + ' جاء مثالًا على الصور الحسية في الصفحة 13، ومثالًا على ' + en('assonance') + ' في الصفحة 18. السطر الواحد قد يحمل أداتين.' }
  ] }
] },
{ id: 'l3-sound-2', lec: 'L3', topic: 'p2-sound', ar: 'أدوات صوتية أخرى', en: 'Refrain · Enjambment · Onomatopoeia', min: 5, blocks: [
  { def: ['Refrain', 'اللازمة', 'The repetition of one or more phrases or lines. It can also be an entire stanza that is repeated periodically.', 'عبارة أو سطر يتكرر في القصيدة. وقد يتكرر مقطع شعري كامل كل فترة.'], src: pg('L3', 19) },
  ex('The art of losing isn’t hard to master.', { by: 'One Art · Elizabeth Bishop', why: 'يتكرر هذا السطر في آخر المقطع الشعري الأول والمقطع الشعري الثالث.', src: pg('L3', 19) }),
  { def: ['Enjambment', 'التضمين', 'Enjambment refers to lines that end without punctuation and without completing a sentence or clause.', 'ينتهي السطر بلا علامة ترقيم، والجملة لم تكتمل. وتكمل الجملة في السطر التالي.'], src: pg('L3', 20) },
  ex('And there is a charge, a very large charge<br>For a word or a touch<br>Or a bit of blood', { by: 'Lady Lazarus · Sylvia Plath', why: 'السطر الأول بلا علامة في آخره، والجملة تكمل في السطر الثاني.', src: pg('L3', 20) }),
  { def: ['Onomatopoeia', 'محاكاة الصوت', 'Words that spell out sounds; words that sound like what they mean.', 'كلمات تقلّد الصوت الذي تدل عليه. تسمعين الكلمة فتسمعين الصوت نفسه.'], src: pg('L3', 21) },
  ex('How they clang, and clash, and roar!', { by: 'The Bells · Edgar Allan Poe', why: 'الكلمات التي تقلّد الصوت:', words: 'clang, clash, roar', src: pg('L3', 21) }),
  { note: 'في الصفحة 2 كُتبت ' + en('Enjambement') + '، وفي الصفحة 20 كُتبت ' + en('Enjambment') + '. الكلمتان للأداة نفسها.' },
  { more: 'أمثلة أخرى من المحاضرة', blocks: [
    { table: { head: ['الأداة والمثال'], rows: [
      exRow('اللازمة', 'Refrain', 'Lose something every day. Accept the fluster<br>of lost door keys, the hour badly spent.<br><b>The art of losing isn’t hard to master.</b><br><br>Then practice losing farther, losing faster:<br>places, and names, and where it was you meant<br>to travel. None of these will bring disaster.<br><br>I lost my mother’s watch. And look! my last, or<br>next-to-last, of three loved houses went.<br><b>The art of losing isn’t hard to master.</b>', 'One Art · Elizabeth Bishop'),
      exRow('التضمين', 'Enjambment', 'It seemed that out of battle I escaped<br>Down some profound dull tunnel, long since scooped<br>Through granites which titanic wars had groined.', 'Strange Meeting · Wilfred Owen'),
      exRow('محاكاة الصوت', 'Onomatopoeia', 'Then nightly sings the staring owl,<br>Tu-whit;<br>Tu-who, a merry note,', 'Love’s Labor’s Lost · William Shakespeare')
    ] }, src: pg('L3', 19) + ' ' + pg('L3', 20) + ' ' + pg('L3', 21) }
  ] }
] },
/* Confusable pairs. Shape (read by the exam-night summary in app-more.js): each pair is ONE `h`
   block followed by ONE `compare` block; the first item on each side is a one-line difference. */
{ id: 'l3-confuse', lec: 'L3', topic: 'confuse', ar: 'المصطلحات المتشابهة', en: 'Look-alike terms', min: 10, blocks: [
  { p: 'أزواج يسهل الخلط بينها، من المحاضرات الثلاث. في كل زوج ركّزي على الفرق فقط.' },

  { h: 'التشبيه أم الاستعارة؟', en: 'Simile · Metaphor' },
  { compare: [
    { t: 'Simile', ar: 'التشبيه', items: ['مقارنة فيها ' + en('like') + ' أو ' + en('as'), en('His skin was as cold as ice.')] },
    { t: 'Metaphor', ar: 'الاستعارة', items: ['مقارنة بلا ' + en('like') + ' وبلا ' + en('as'), en('She is the moon.')] }
  ], src: pg('L3', 3) + ' ' + pg('L3', 5) },

  { h: 'الاستعارة أم الرمز؟', en: 'Metaphor · Symbol' },
  { compare: [
    { t: 'Metaphor', ar: 'الاستعارة', items: ['مقارنة غير مباشرة بين شيئين', en('She is the moon.')] },
    { t: 'Symbol', ar: 'الرمز', items: ['شيء له معنى آخر يعرفه الناس', en('The dove is a symbol of peace.')] }
  ], src: pg('L3', 5) + ' ' + pg('L3', 6) },

  { h: 'أي نوع من المفارقة؟', en: 'Verbal · Situational · Dramatic irony' },
  { compare: [
    { t: 'Verbal irony', ar: 'اللفظية', items: ['نقول عكس ما نقصد', en('She is as friendly as a rattlesnake.')] },
    { t: 'Situational irony', ar: 'الموقفية', items: ['يحدث عكس المتوقع', en('the fire-station burnt down.')] },
    { t: 'Dramatic irony', ar: 'الدرامية', items: ['الجمهور يعرف أكثر من الشخصيات', en('Romeo and Juliet')] }
  ], src: pg('L3', 9) + ' ' + pg('L3', 10) + ' ' + pg('L3', 11) },

  { h: 'جمع الضدين أم التناقض الظاهري؟', en: 'Oxymoron · Paradox' },
  { compare: [
    { t: 'Oxymoron', ar: 'جمع الضدين', items: ['كلمتان متضادتان في عبارة قصيرة', en('Living dead.')] },
    { t: 'Paradox', ar: 'التناقض الظاهري', items: ['جملة تناقض نفسها، لكنها صحيحة', en('This is the beginning of the end.')] }
  ], src: pg('L3', 14) + ' ' + pg('L3', 15) },

  { h: 'أول الكلمة أم آخرها؟', en: 'Alliteration · Consonance' },
  { compare: [
    { t: 'Alliteration', ar: 'تكرار الصوت الأول', items: ['الصوت يتكرر في أول الكلمات', en('And each slow dusk a drawing-down of blinds')] },
    { t: 'Consonance', ar: 'تكرار الصوت الأخير', items: ['الصوت يتكرر غالبًا في آخر الكلمات', en('All’s well that ends well')] }
  ], src: pg('L3', 16) + ' ' + pg('L3', 17) },

  { h: 'حرف ساكن أم حرف صوتي؟', en: 'Consonance · Assonance' },
  { compare: [
    { t: 'Consonance', ar: 'تكرار الصوت الأخير', items: ['يتكرر صوت حرف ساكن ' + en('(consonant)'), en('All’s well that ends well')] },
    { t: 'Assonance', ar: 'تكرار الحرف الصوتي', items: ['يتكرر صوت حرف صوتي ' + en('(vowel)'), en('Fleet feet sweep by sleeping geese')] }
  ], src: pg('L3', 17) + ' ' + pg('L3', 18) },

  { h: 'المرسل أم الحر؟', en: 'Blank verse · Free verse' },
  { compare: [
    { t: 'Blank verse', ar: 'الشعر المرسل', items: ['إيقاع منتظم، لكن بلا قافية', 'وزنه غالبًا ' + en('iambic pentameter')] },
    { t: 'Free verse', ar: 'الشعر الحر', items: ['بلا قافية منتظمة وبلا وزن منتظم', 'وليس له شكل ثابت'] }
  ], src: pg('L2', 9) },

  { h: 'مجموعة أسطر أم سطر واحد؟', en: 'Stanza · Verse' },
  { compare: [
    { t: 'Stanza', ar: 'المقطع الشعري', items: ['مجموعة أسطر', 'أنواعه حسب عدد الأسطر: ' + en('couplet, tercet, quatrain')] },
    { t: 'Verse', ar: 'السطر الشعري', items: ['سطر واحد من القصيدة'] }
  ], src: pg('L2', 10) },

  { h: 'القافية أم نظامها؟', en: 'Rhyme · Rhyme scheme' },
  { compare: [
    { t: 'Rhyme', ar: 'القافية', items: ['أصوات متشابهة في آخر الكلمات', en('hat, cat, brat, mat, sat.')] },
    { t: 'Rhyme scheme', ar: 'نظام القافية', items: ['ترتيب القوافي في آخر الأسطر', en('ab ab ab cc')] }
  ], src: pg('L2', 10) },

  { h: 'التفعيلة أم الوزن؟', en: 'Foot · Meter' },
  { compare: [
    { t: 'Foot', ar: 'التفعيلة', items: ['مجموعة صغيرة من المقاطع', 'فيها مقطع واحد أو أكثر'] },
    { t: 'Meter', ar: 'الوزن', items: ['نمط الضغط المنتظم في السطر كله', 'يتكوّن من تفعيلات'] }
  ], src: pg('L2', 11) + ' ' + pg('L2', 12) },

  { h: 'أي تفعيلة؟', en: 'Iamb · Trochee · Anapest · Dactyl' },
  { compare: [
    { t: 'Iamb', ar: 'مقطعان', items: ['بلا ضغط، ثم عليه ضغط', en('∪ —  be-lieve')] },
    { t: 'Trochee', ar: 'مقطعان', items: ['عليه ضغط، ثم بلا ضغط', en('— ∪  gar-den')] },
    { t: 'Anapest', ar: '3 مقاطع', items: ['مقطعان بلا ضغط، ثم عليه ضغط', en('∪ ∪ —  in-to-night')] },
    { t: 'Dactyl', ar: '3 مقاطع', items: ['عليه ضغط، ثم مقطعان بلا ضغط', en('— ∪ ∪  beau-ti-ful')] }
  ], src: pg('L2', 11) },

  { h: 'الشعر أم النثر؟', en: 'Poetry · Prose' },
  { compare: [
    { t: 'Poetry', ar: 'الشعر', items: ['أسطر لها إيقاع لا يشبه الكلام العادي', 'تتجمّع في مقاطع شعرية'] },
    { t: 'Prose', ar: 'النثر', items: ['الكتابة العادية التي تشبه كلامنا', 'هو عكس الشعر'] }
  ], src: pg('L1', 6) + ' ' + pg('L1', 10) },

  { more: 'أزواج أخرى', blocks: [
    { h: 'الملحمة أم البالاد؟', en: 'Epic · Ballad' },
    { compare: [
      { t: 'Epic', ar: 'الملحمة', items: ['قصيدة طويلة جدًا عن بطل', 'أسلوبها فخم'] },
      { t: 'Ballad', ar: 'البالاد', items: ['أغنية شعبية تُروى بالكلام', 'بدأت بين ناس لا يقرؤون'] }
    ], src: pg('L2', 7) },
    { h: 'الصور الحسية أم الرمز؟', en: 'Imagery · Symbol' },
    { compare: [
      { t: 'Imagery', ar: 'الصور الحسية', items: ['كلمات تخاطب الحواس الخمس'] },
      { t: 'Symbol', ar: 'الرمز', items: ['شيء له معنى آخر غير الحرفي'] }
    ], src: pg('L3', 6) + ' ' + pg('L3', 13) },
    { h: 'التشخيص أم الرمز؟', en: 'Personification · Symbol' },
    { compare: [
      { t: 'Personification', ar: 'التشخيص', items: ['صفات الإنسان لشيء ليس إنسانًا'] },
      { t: 'Symbol', ar: 'الرمز', items: ['شيء له معنى آخر يعرفه الناس'] }
    ], src: pg('L3', 6) + ' ' + pg('L3', 8) },
    { h: 'اللازمة أم التضمين؟', en: 'Refrain · Enjambment' },
    { compare: [
      { t: 'Refrain', ar: 'اللازمة', items: ['سطر أو عبارة تتكرر'] },
      { t: 'Enjambment', ar: 'التضمين', items: ['السطر ينتهي والجملة لم تكتمل'] }
    ], src: pg('L3', 19) + ' ' + pg('L3', 20) },
    { h: 'الدراما أم نصها؟', en: 'Drama · Script' },
    { compare: [
      { t: 'Drama', ar: 'الدراما', items: ['قصة يمثّلها ممثلون'] },
      { t: 'Script', ar: 'النص المكتوب', items: ['النسخة المكتوبة من الدراما'] }
    ], src: pg('L1', 8) }
  ] }
] }
];

/* ---------- cards: one per term (front = English term, back = slide wording, ar = Arabic name) ---------- */
function card(id, lec, topic, f, b, ar) { return { id: id, lec: lec, topic: topic, kind: 'term', f: f, b: b, ar: ar }; }
D.cards = [
  /* L1 · General (12) */
  card('c1-1', 'L1', 'gen-power', 'Literature', 'written and sometimes spoken material produced for a specific purpose, such as information, education and entertainment', 'الأدب'),
  card('c1-2', 'L1', 'gen-power', 'The Power of Literature', 'didactic · glorify nations or leaders · influence or control · entertainment · record and change history · critical thinking skills · writing skills · make you a human', 'قوة الأدب'),
  card('c1-3', 'L1', 'gen-genres', 'Main Literary Genres', 'Poetry · Drama · Prose', 'الأنواع الأدبية الرئيسية'),
  card('c1-4', 'L1', 'gen-genres', 'Poetry', 'language written in lines (verses), often organized into stanzas, with rhythm, figurative language, imagery, sound devices and emotionally charged language', 'الشعر'),
  card('c1-5', 'L1', 'gen-genres', 'Drama', 'a story written to be performed by actors', 'الدراما'),
  card('c1-6', 'L1', 'gen-genres', 'Script', 'the written version of a drama', 'النص المكتوب للدراما'),
  card('c1-7', 'L1', 'gen-genres', 'Elements of drama', 'dialogue · plot · characters', 'عناصر الدراما'),
  card('c1-8', 'L1', 'gen-genres', 'Prose', 'the ordinary form of written language that imitates the spoken language; the opposite of verse/poetry', 'النثر'),
  card('c1-9', 'L1', 'gen-genres', 'Poetry subgenres', 'Lyric · Narrative · Dramatic · Free verse · Blank verse', 'أنواع الشعر'),
  card('c1-10', 'L1', 'gen-genres', 'Drama subgenres', 'Tragedy · Comedy · Satyr drama (Satyr play)', 'أنواع الدراما'),
  card('c1-11', 'L1', 'gen-genres', 'Fiction', 'Novels · Novellas · Short stories', 'الأدب الخيالي'),
  card('c1-12', 'L1', 'gen-genres', 'Non-fiction', 'Biographies · Memoirs · Travel Guides', 'الأدب الواقعي'),

  /* L2 · Poetry I (35) */
  card('c2-1', 'L2', 'p1-lyric', 'Lyric poetry', 'a short, emotional, song-like poem that expresses the emotions and feelings of the speaker or the poet', 'الشعر الغنائي'),
  card('c2-2', 'L2', 'p1-lyric', 'Sonnet', 'a poem of fourteen lines written in iambic pentameter; the theme is summed up in the last two lines', 'السونيت'),
  card('c2-3', 'L2', 'p1-lyric', 'Petrarchan sonnet', 'an Italian form, named after the Italian poet Petrarch', 'سونيت بترارك'),
  card('c2-4', 'L2', 'p1-lyric', 'Spenserian sonnet', 'named after the English poet Spenser, who adjusted the Petrarchan Sonnet', 'سونيت سبنسر'),
  card('c2-5', 'L2', 'p1-lyric', 'English / Shakespearean sonnet', 'named after Shakespeare because of his constant use of this form', 'سونيت شكسبير'),
  card('c2-6', 'L2', 'p1-lyric', 'Elegy', 'a poem lamenting the death of a person or reflecting on a serious situation', 'المرثية'),
  card('c2-7', 'L2', 'p1-lyric', 'Ode', 'a lyric poem giving praise or showing appreciation for a person, place, thing, or idea', 'قصيدة المدح'),
  card('c2-8', 'L2', 'p1-narrative', 'Narrative poetry', 'a poem which tells a story; two main types: Epic and Ballad', 'الشعر القصصي'),
  card('c2-9', 'L2', 'p1-narrative', 'Epic', 'a very long narrative poem written in a grand style that traces the adventures of a hero and his good deeds (The Odyssey by Homer)', 'الملحمة'),
  card('c2-10', 'L2', 'p1-narrative', 'Ballad', 'a folk song that transmits a story orally; it originated among illiterate people', 'البالاد (أغنية شعبية)'),
  card('c2-11', 'L2', 'p1-forms', 'Dramatic poetry', 'poetry written in the form of a play or dialogue, where characters speak and interact', 'الشعر المسرحي'),
  card('c2-12', 'L2', 'p1-forms', 'Blank verse', 'poetry written with a regular rhythm (usually iambic pentameter) but without rhyme', 'الشعر المرسل'),
  card('c2-13', 'L2', 'p1-forms', 'Free verse', 'poetry that has no regular rhyme scheme, meter, or fixed pattern', 'الشعر الحر'),
  card('c2-14', 'L2', 'p1-elements', 'Stanza', 'a group of lines arranged together in a recurring pattern of metrical lengths and a sequence of rhymes', 'المقطع الشعري'),
  card('c2-15', 'L2', 'p1-elements', 'Couplet', 'a two-line stanza', 'مقطع شعري من سطرين'),
  card('c2-16', 'L2', 'p1-elements', 'Tercet', 'a three-line stanza', 'مقطع شعري من 3 أسطر'),
  card('c2-17', 'L2', 'p1-elements', 'Quatrain', 'a four-line stanza', 'مقطع شعري من 4 أسطر'),
  card('c2-18', 'L2', 'p1-elements', 'Verse', 'a single line of a poem', 'السطر الشعري'),
  card('c2-19', 'L2', 'p1-elements', 'Rhyme', 'the repetition of similar sounds at the end of words, mostly in the final syllables of lines (hat, cat, brat, mat, sat)', 'القافية'),
  card('c2-20', 'L2', 'p1-elements', 'Rhyme scheme', 'the pattern of rhyme that comes at the end of each verse/line (ab ab ab cc)', 'نظام القافية'),
  card('c2-21', 'L2', 'p1-elements', 'Foot', 'each set of syllables; one, two or more syllables', 'التفعيلة'),
  card('c2-22', 'L2', 'p1-elements', 'Monosyllabic', 'has only one syllable', 'مقطع صوتي واحد'),
  card('c2-23', 'L2', 'p1-elements', 'Iamb (iambic)', 'unstressed syllable followed by a stressed syllable: ∪ — (be-lieve)', 'بلا ضغط ثم عليه ضغط'),
  card('c2-24', 'L2', 'p1-elements', 'Trochee (trochaic)', 'stressed syllable followed by an unstressed syllable: — ∪ (gar-den)', 'عليه ضغط ثم بلا ضغط'),
  card('c2-25', 'L2', 'p1-elements', 'Anapest (anapestic)', 'three syllables; the last one is stressed: ∪ ∪ — (in-to-night)', '3 مقاطع، الأخير عليه ضغط'),
  card('c2-26', 'L2', 'p1-elements', 'Dactyl', '— ∪ ∪ (beau-ti-ful)', 'عليه ضغط ثم مقطعان بلا ضغط'),
  card('c2-27', 'L2', 'p1-elements', 'Spondee', '— — (heart-break)', 'مقطعان عليهما ضغط'),
  card('c2-28', 'L2', 'p1-elements', 'Meter (Metre)', 'the regular pattern of stressed and unstressed syllables, organised into feet, in a line of poetry (Syllables → Feet → Meter)', 'الوزن'),
  card('c2-29', 'L2', 'p1-elements', 'Monometer', '1 foot per line', 'تفعيلة واحدة في السطر'),
  card('c2-30', 'L2', 'p1-elements', 'Dimeter', '2 feet per line', 'تفعيلتان في السطر'),
  card('c2-31', 'L2', 'p1-elements', 'Trimeter', '3 feet per line', '3 تفعيلات في السطر'),
  card('c2-32', 'L2', 'p1-elements', 'Tetrameter', '4 feet per line', '4 تفعيلات في السطر'),
  card('c2-33', 'L2', 'p1-elements', 'Pentameter', '5 feet per line', '5 تفعيلات في السطر'),
  card('c2-34', 'L2', 'p1-elements', 'Hexameter · Heptameter · Octameter', '6 · 7 · 8 feet per line', '6 أو 7 أو 8 تفعيلات'),
  card('c2-35', 'L2', 'p1-elements', 'Iambic pentameter', 'five iambs in a line: Short Long × 5 (Shall I compare thee to a summer’s day?)', 'وزن السونيت'),

  /* L3 · Poetry II (18) */
  card('c3-1', 'L3', 'p2-figures', 'Figures of speech', 'Simile · Metaphor · Symbol · Personification · Irony · Imagery · Oxymoron · Paradox', 'الصور البلاغية'),
  card('c3-2', 'L3', 'p2-figures', 'Simile', 'a comparison between two unrelated things using the word “like” or “as”', 'التشبيه'),
  card('c3-3', 'L3', 'p2-figures', 'Metaphor', 'the comparison between two objects indirectly (without the use of “as” and “like”)', 'الاستعارة'),
  card('c3-4', 'L3', 'p2-figures', 'Symbol', 'an object, person, or situation that has another meaning other than its literal meaning', 'الرمز'),
  card('c3-5', 'L3', 'p2-figures', 'Personification', 'giving human characteristics/qualities to objects, ideas, or animals', 'التشخيص'),
  card('c3-6', 'L3', 'p2-figures', 'Verbal irony', 'a statement or action that is used to express the opposite meaning', 'المفارقة اللفظية'),
  card('c3-7', 'L3', 'p2-figures', 'Situational irony', 'the expected outcome does not happen, or the opposite happens instead', 'المفارقة الموقفية'),
  card('c3-8', 'L3', 'p2-figures', 'Dramatic irony', 'the audience knows more about what’s going on than the characters', 'المفارقة الدرامية'),
  card('c3-9', 'L3', 'p2-figures', 'Imagery', 'elements of a poem that invoke any of the five senses to create mental images (visual · auditory)', 'الصور الحسية'),
  card('c3-10', 'L3', 'p2-figures', 'Oxymoron', 'two opposite ideas joined to create an effect (living dead)', 'جمع الضدين'),
  card('c3-11', 'L3', 'p2-figures', 'Paradox', 'a statement that contradicts itself and still seems true somehow', 'التناقض الظاهري'),
  card('c3-12', 'L3', 'p2-sound', 'Sound devices', 'Alliteration · Consonance · Assonance · Refrain · Enjambment · Onomatopoeia', 'الأدوات الصوتية'),
  card('c3-13', 'L3', 'p2-sound', 'Alliteration', 'the repetition of the initial/first sound (consonants) in two or more words in a line', 'تكرار الصوت الأول'),
  card('c3-14', 'L3', 'p2-sound', 'Consonance', 'repeating the consonant sounds usually at the end of two words or more in a line', 'تكرار الصوت الأخير'),
  card('c3-15', 'L3', 'p2-sound', 'Assonance', 'the repetition of the same vowel sounds within words or phrases', 'تكرار الحرف الصوتي'),
  card('c3-16', 'L3', 'p2-sound', 'Refrain', 'the repetition of one or more phrases or lines; it can be an entire stanza repeated periodically', 'اللازمة'),
  card('c3-17', 'L3', 'p2-sound', 'Enjambment', 'lines that end without punctuation and without completing a sentence or clause', 'التضمين'),
  card('c3-18', 'L3', 'p2-sound', 'Onomatopoeia', 'words that spell out sounds; words that sound like what they mean', 'محاكاة الصوت')
];

/* ---------- «طريق الدرجات»: units ordered by exam marks (DECISIONS D5) ----------
   Part 2 (the paragraph, 15 marks) first, then Part 1 (15 MCQ, 15 marks).
   Each lecture is two units: «افهمي وتأكدي» (its short lessons, each ending with 3 questions)
   then «تدرّبي» (one practice round on the whole lecture). */
/* a `lessons` unit: min = the lessons' minutes + 2 per lesson (the 3 questions);
   `skip` = lessons that are their own plan unit (not repeated on the lecture page) */
function lessonsUnit(id, lec, why, skip) {
  var ls = D.lessons.filter(function (L) { return L.lec === lec && (skip || []).indexOf(L.id) < 0; });
  var min = ls.reduce(function (t, L) { return t + (L.min || 0) + 2; }, 0);
  return { id: id, part: 'p1', lec: lec, ar: 'افهمي وتأكدي: ' + D.lectures[lec].ar, en: D.lectures[lec].en + ' · lessons', min: min,
    why: why + ' ' + ls.length + ' دروس، وبعد كل درس 3 أسئلة.', open: { type: 'lessons', lec: lec } };
}
D.plan = [
  { id: 'u-eagle-style', part: 'p2', lec: 'P', ar: 'أسلوب قصيدة The Eagle', en: 'The Eagle · style', min: 15,
    why: 'سؤال الفقرة 15 درجة، أي نصف الاختبار. وله 3 مواضيع فقط، وهذا أولها.', open: { type: 'paragraph', id: 'eagle-style' } },
  { id: 'u-eagle-theme', part: 'p2', lec: 'P', ar: 'موضوع قصيدة The Eagle', en: 'The Eagle · theme', min: 15,
    why: 'القصيدة نفسها بموضوع آخر. إذا أتقنتِ موضوعين من الثلاثة، فسيكون أحدهما بين الخيارين حتمًا.', open: { type: 'paragraph', id: 'eagle-theme' } },
  { id: 'u-dream-style', part: 'p2', lec: 'P', ar: 'أسلوب قصيدة Dream Deferred', en: 'A Dream Deferred · style', min: 15,
    why: 'الموضوع الثالث. بعده تكونين مستعدة لأي خيارين في الاختبار.', open: { type: 'paragraph', id: 'dream-style' } },
  { id: 'u-confuse-lesson', part: 'p1', lec: 'L3', ar: 'المصطلحات المتشابهة', en: 'Look-alike terms', min: 10,
    why: 'الجزء الأول 15 سؤالًا من المحاضرات الثلاث. هذا الدرس يجمع المصطلحات المتشابهة منها في مكان واحد.', open: { type: 'lesson', id: 'l3-confuse' } },
  { id: 'u-confuse-practice', part: 'p1', lec: 'L3', ar: 'تدرّبي على المتشابهة', en: 'Practice · look-alike terms', min: 10,
    why: 'تدرّبي على التفريق بينها مباشرة بعد الدرس.', open: { type: 'practice', topics: ['confuse'] } },
  lessonsUnit('u-l3-lessons', 'L3', 'أطول محاضرة، وأدواتها تستخدمينها في الفقرة أيضًا.', ['l3-confuse']),
  { id: 'u-l3-practice', part: 'p1', lec: 'L3', ar: 'تدرّبي: ' + D.lectures.L3.ar, en: 'Poetry II · practice', min: 10,
    why: 'جولة على المحاضرة كلها: من المثال إلى اسم الأداة، ومن التعريف إلى المصطلح.', open: { type: 'practice', topics: ['p2-figures', 'p2-sound'] } },
  lessonsUnit('u-l2-lessons', 'L2', 'أكثر محاضرة فيها مصطلحات، وبعضها تحتاجينه في الفقرة.'),
  { id: 'u-l2-practice', part: 'p1', lec: 'L2', ar: 'تدرّبي: ' + D.lectures.L2.ar, en: 'Poetry I · practice', min: 10,
    why: 'جولة على المحاضرة كلها: أنواع الشعر وشكله ووزنه.', open: { type: 'practice', topics: ['p1-lyric', 'p1-narrative', 'p1-forms', 'p1-elements'] } },
  lessonsUnit('u-l1-lessons', 'L1', 'أقل محاضرة في المصطلحات، فتنتهين منها بسرعة.'),
  { id: 'u-l1-practice', part: 'p1', lec: 'L1', ar: 'تدرّبي: ' + D.lectures.L1.ar, en: 'General · practice', min: 10,
    why: 'جولة على المحاضرة كلها: الأدب وأنواعه الرئيسية والفرعية.', open: { type: 'practice', topics: ['gen-power', 'gen-genres'] } },
  { id: 'u-mock', part: 'p1', ar: 'اختبار تجريبي', en: 'Mock exam · Part 1', min: 15,
    why: 'على نمط الجزء الأول: 15 سؤالًا من المحاضرات الثلاث.', open: { type: 'mock' } },
  { id: 'u-summary', part: 'p1', ar: 'ملخص ليلة الاختبار', en: 'Exam-night summary', min: 10,
    why: 'مراجعة قصيرة وهادئة لليلة الاختبار.', open: { type: 'summary' } }
];

D.helpers = { en: en, pg: pg };
window.PH = D;
})();
