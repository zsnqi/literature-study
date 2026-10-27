/* Part 2 of the exam (one paragraph, 15 marks): the two poems, their devices and
   the three model paragraphs. Source: the lecturer's «How to Read a Poem (complete)»
   (pages P2-P5) and the Poetry II slides for the device definitions.
   One device is excluded from the course by the lecturer: it is not marked, taught or used here. */
(function () {
'use strict';

var PH = window.PH;

function en(t) { return '<bdi class="t-en" dir="ltr">' + t + '</bdi>'; }

/* ---------- the devices used in the two poems (definitions: Poetry II slides) ---------- */
PH.devices = {
  simile: {
    en: 'Simile', ar: 'التشبيه',
    def_en: 'A comparison between two unrelated things using the word \'like\' or \'as\'.',
    def_ar: 'مقارنة بين شيئين مختلفين باستخدام كلمة ' + en('like') + ' أو ' + en('as') + '.'
  },
  metaphor: {
    en: 'Metaphor', ar: 'الاستعارة',
    def_en: 'The comparison between two objects indirectly (without the use of \'as\' and \'like\').',
    def_ar: 'مقارنة غير مباشرة بين شيئين، من غير ' + en('like') + ' ولا ' + en('as') + '.'
  },
  personification: {
    en: 'Personification', ar: 'التشخيص',
    def_en: 'Giving human characteristics/qualities to objects, ideas, or animals.',
    def_ar: 'نعطي شيئًا أو فكرة أو حيوانًا صفات الإنسان.'
  },
  imagery: {
    en: 'Imagery', ar: 'الصور الحسية',
    def_en: 'Elements of a poem that invoke any of the five senses to create a set of mental images to represent ideas, objects, or actions.',
    def_ar: 'كلمات تخاطب الحواس الخمس، فترسم صورة في ذهن القارئ.'
  },
  alliteration: {
    en: 'Alliteration', ar: 'تكرار الصوت الأول',
    def_en: 'The repetition of the initial/first sound (consonants) in two or more words in a line.',
    def_ar: 'يتكرر الصوت الأول، وهو حرف ساكن، في كلمتين أو أكثر في السطر نفسه.'
  },
  consonance: {
    en: 'Consonance', ar: 'تكرار الصوت الأخير',
    def_en: 'Consonance refers to repeating the consonant sounds usually at the end of two words or more in a line.',
    def_ar: 'يتكرر الحرف الساكن، غالبًا في آخر كلمتين أو أكثر في السطر نفسه.'
  }
};

/* ---------- the two poems (exact lines: P2 and P4) ----------
   marks = only the devices the lecturer's document names for that line.
   `words` is an exact piece of the line; marks on the same line may overlap.
   ar = the line's plain meaning; words = hard words [{ w: exact piece of the line, ar }].
   Meanings follow the document's summary where it explains a line; the rest are
   plain dictionary meanings (listed in docs/reports/D3b-simplify.md). */
PH.poems = [
  {
    id: 'eagle',
    title: 'The Eagle',
    poet: 'Alfred, Lord Tennyson',
    about_ar: 'الشاعر ' + en('Alfred, Lord Tennyson') + ' من أشهر الشعراء الإنجليز في العصر الفيكتوري (1809–1892). ' +
      'القصيدة عن نسر واحد في الطبيعة: يقف عاليًا وحده، ثم ينقضّ نحو البحر.',
    form: {
      en: '"The Eagle" consists of two stanzas called tercets. A tercet is a three-line stanza. The poem follows a rhyme scheme of AAA BBB.',
      ar: 'القصيدة مقطعان، كل مقطع 3 أسطر، واسمه ' + en('tercet') + '. القافية ' + en('AAA BBB') + '.'
    },
    tone: {
      en: 'The voice of the speaker is contemplative/meditative. It reflects a sense of awe at the magnificent beauty of the creature.',
      ar: 'صوت المتحدث هادئ يتأمّل، ويعبّر عن الانبهار بجمال النسر العظيم.'
    },
    theme: {
      en: 'The Majesty and Power of Nature. The eagle embodies the untamed, supreme force of the natural world.',
      ar: 'عظمة الطبيعة وقوتها. النسر يمثّل قوة الطبيعة البرية التي لا يتحكم فيها أحد.'
    },
    lines: [
      { t: 'He clasps the crag with crooked hands;',
        ar: 'النسر يمسك الصخرة العالية بقوة، بيدين معقوفتين.',
        words: [
          { w: 'clasps', ar: 'يمسك بقوة' },
          { w: 'crag', ar: 'صخرة عالية في الجبل' },
          { w: 'crooked', ar: 'معقوفة، منحنية' }
        ],
        marks: [
        { dev: 'alliteration', words: 'clasps the crag with crooked',
          en: 'The words "clasps," "crag" and "crooked" each begin with a \'k\' sound.',
          ar: 'ثلاث كلمات تبدأ بالصوت نفسه، وهو صوت ' + en('k') + '.' },
        { dev: 'personification', words: 'hands',
          en: 'The eagle holds on with hands, like a human. This makes him seem much more important than a simple bird.',
          ar: 'للنسر «أيدٍ» مثل الإنسان، فيبدو أهم بكثير من مجرد طائر.' }
      ] },
      { t: 'Close to the sun in lonely lands,',
        ar: 'هو قريب من الشمس، وحده في مكان خالٍ.',
        words: [
          { w: 'lonely', ar: 'خالية، لا أحد فيها' }
        ],
        marks: [
        { dev: 'imagery', words: 'Close to the sun in lonely lands',
          en: 'A visual image: the eagle sits on top of a tall, rocky mountain, with the sun blazing behind him.',
          ar: 'صورة نراها: النسر فوق جبل صخري عالٍ، والشمس تلمع خلفه.' },
        { dev: 'alliteration', words: 'lonely lands',
          en: 'Another example of alliteration: "lonely" and "lands" begin with the same sound.',
          ar: 'مثال ثانٍ: الكلمتان تبدآن بالصوت نفسه.' }
      ] },
      { t: 'Ring\'d with the azure world, he stands.',
        ar: 'يقف، والسماء الزرقاء اللامعة حوله من كل جهة.',
        words: [
          { w: 'Ring\'d', ar: 'محاط من كل جهة، مثل الحلقة' },
          { w: 'azure', ar: 'أزرق لامع' }
        ],
        marks: [
        { dev: 'imagery', words: 'Ring\'d with the azure world',
          en: '"Azure" means bright blue. The blue sky is ringed around the eagle like a halo. This creates a very majestic image.',
          ar: en('azure') + ' معناها: أزرق لامع. السماء الزرقاء تحيط بالنسر مثل الهالة، فتظهر صورة مهيبة.' }
      ] },
      { t: 'The wrinkled sea beneath him crawls;',
        ar: 'البحر تحته يتحرك ببطء، وموجه مثل التجاعيد.',
        words: [
          { w: 'wrinkled', ar: 'فيه تجاعيد' },
          { w: 'beneath', ar: 'تحت' },
          { w: 'crawls', ar: 'يزحف، يتحرك ببطء' }
        ],
        marks: [] },
      { t: 'He watches from his mountain walls,',
        ar: 'يراقب من فوق صخور جبله العالي.',
        words: [
          { w: 'mountain walls', ar: 'صخور الجبل العالية، مثل الجدران' }
        ],
        marks: [] },
      { t: 'And like a thunderbolt he falls.',
        ar: 'ثم ينقضّ نحو البحر، سريعًا مثل الصاعقة.',
        words: [
          { w: 'thunderbolt', ar: 'صاعقة' }
        ],
        marks: [
        { dev: 'simile', words: 'like a thunderbolt',
          en: 'The eagle\'s dive is compared to a thunderbolt in its speed and energy.',
          ar: 'نزول النسر يشبه الصاعقة في سرعتها وقوتها.' }
      ] }
    ]
  },
  {
    id: 'dream',
    title: 'A Dream Deferred',
    poet: 'Langston Hughes',
    about_ar: 'الشاعر ' + en('Langston Hughes') + ' أمريكي من أصل أفريقي (1902–1967)، ومن أوائل من كتبوا ' + en('jazz poetry') + '. ' +
      'القصيدة تسأل: ماذا يحدث للحلم إذا تأخّر؟ والموضوع هنا مأخوذ من الملخص، لأن الدكتورة لم تكتب له قسمًا خاصًا.',
    form: {
      en: 'The poem is written in free verse and does not follow a regular rhyme scheme and meter pattern. The structure consists of 11 lines varying in number and length.',
      ar: 'القصيدة ' + en('free verse') + '، يعني بلا قافية منتظمة ولا وزن منتظم. فيها 11 سطرًا مختلفة في الطول.'
    },
    tone: {
      en: 'Questioning and warning',
      ar: 'نبرة تسأل وتحذّر.'
    },
    theme: {
      en: 'What happens when a person\'s dreams are delayed: a negative, destructive outcome for a dreamer left unable to dream.',
      ar: 'ماذا يحدث إذا تأخّرت أحلام الإنسان: النتيجة سيئة ومدمّرة للحالم. (من الملخص)'
    },
    lines: [
      { t: 'What happens to a dream deferred?',
        ar: 'ماذا يحدث للحلم إذا تأجّل؟',
        words: [
          { w: 'deferred', ar: 'مؤجَّل، متأخّر' }
        ],
        marks: [
        { dev: 'alliteration', words: 'dream deferred',
          en: 'The \'d\' sound is repeated at the start of "dream" and "deferred."',
          ar: 'صوت ' + en('d') + ' يتكرر في أول الكلمتين.' }
      ] },
      { t: 'Does it dry up',
        ar: 'هل يجفّ؟',
        words: [
          { w: 'dry up', ar: 'يجفّ' }
        ],
        marks: [] },
      { t: 'like a raisin in the sun?',
        ar: 'مثل زبيبة في الشمس؟',
        words: [
          { w: 'raisin', ar: 'زبيبة' }
        ],
        marks: [
        { dev: 'simile', words: 'like a raisin in the sun',
          en: 'A comparison using "like": the dream is compared to a raisin in the sun.',
          ar: 'تشبيه بكلمة ' + en('like') + ': الحلم مثل زبيبة جفّت في الشمس.' },
        { dev: 'imagery', words: 'raisin in the sun',
          en: 'A visual image of the raisin in the sun.',
          ar: 'صورة نراها: زبيبة في الشمس.' }
      ] },
      { t: 'Or fester like a sore—',
        ar: 'أم يتقيّح مثل جرح؟',
        words: [
          { w: 'fester', ar: 'يتقيّح (يمتلئ بالصديد)' },
          { w: 'sore', ar: 'جرح مؤلم، قرحة' }
        ],
        marks: [
        { dev: 'simile', words: 'like a sore',
          en: 'A comparison using "like": the dream is compared to a sore.',
          ar: 'تشبيه بكلمة ' + en('like') + ': الحلم مثل جرح يتقيّح.' },
        { dev: 'imagery', words: 'fester like a sore',
          en: 'A visual image of the festered sore.',
          ar: 'صورة نراها: جرح يتقيّح.' }
      ] },
      { t: 'And then run?',
        ar: 'ثم يسيل منه الصديد؟',
        words: [
          { w: 'run', ar: 'هنا معناها: يسيل' }
        ],
        marks: [] },
      { t: 'Does it stink like rotten meat?',
        ar: 'هل تصير رائحته كريهة مثل اللحم الفاسد؟',
        words: [
          { w: 'stink', ar: 'رائحته كريهة' },
          { w: 'rotten', ar: 'فاسد' }
        ],
        marks: [
        { dev: 'simile', words: 'like rotten meat',
          en: 'A comparison using "like": the dream is compared to rotten meat.',
          ar: 'تشبيه بكلمة ' + en('like') + ': الحلم مثل لحم فاسد.' },
        { dev: 'imagery', words: 'rotten meat',
          en: 'A visual image of the rotten meat.',
          ar: 'صورة نراها: لحم فاسد.' }
      ] },
      { t: 'Or crust and sugar over—',
        ar: 'أم تتكوّن عليه قشرة من السكر؟',
        words: [
          { w: 'crust', ar: 'تتكوّن عليه قشرة قاسية' },
          { w: 'sugar over', ar: 'يغطّيه السكر' }
        ],
        marks: [
        { dev: 'consonance', words: 'Or crust and sugar over',
          en: 'The \'r\' sound is repeated at the ends of words, as in "sugar" and "over."',
          ar: 'صوت ' + en('r') + ' يتكرر في آخر الكلمات.' }
      ] },
      { t: 'Like a syrupy sweet?',
        ar: 'مثل حلوى فيها شراب السكر؟',
        words: [
          { w: 'syrupy', ar: 'فيه شراب السكر (القَطْر)' },
          { w: 'sweet', ar: 'هنا معناها: حلوى' }
        ],
        marks: [
        { dev: 'simile', words: 'Like a syrupy sweet',
          en: 'A comparison using "like": the dream is compared to a syrupy sweet.',
          ar: 'تشبيه بكلمة ' + en('like') + ': الحلم مثل حلوى عليها قشرة من السكر.' },
        { dev: 'imagery', words: 'syrupy sweet',
          en: 'A visual image of the crusty syrupy sweet.',
          ar: 'صورة نراها: حلوى بقشرة من السكر.' },
        { dev: 'alliteration', words: 'syrupy sweet',
          en: 'The \'s\' sound is repeated at the start of "syrupy" and "sweet."',
          ar: 'صوت ' + en('s') + ' يتكرر في أول الكلمتين.' }
      ] },
      { t: 'Maybe it just sags',
        ar: 'ربما يهبط ويتدلّى فقط',
        words: [
          { w: 'sags', ar: 'يهبط ويتدلّى من الثقل' }
        ],
        marks: [] },
      { t: 'like a heavy load.',
        ar: 'مثل حِمل ثقيل.',
        words: [
          { w: 'load', ar: 'حِمل' }
        ],
        marks: [
        { dev: 'simile', words: 'like a heavy load',
          en: 'A comparison using "like": the dream is compared to a heavy load.',
          ar: 'تشبيه بكلمة ' + en('like') + ': الحلم مثل حِمل ثقيل.' },
        { dev: 'imagery', words: 'heavy load',
          en: 'A visual image of the heavy load.',
          ar: 'صورة نراها: حِمل ثقيل.' }
      ] },
      { t: 'Or does it explode?',
        ar: 'أم ينفجر؟',
        words: [
          { w: 'explode', ar: 'ينفجر' }
        ],
        marks: [
        { dev: 'metaphor', words: 'Or does it explode?',
          en: 'An indirect comparison without "as" or "like": the dream may explode.',
          ar: 'مقارنة غير مباشرة، من غير ' + en('like') + ' ولا ' + en('as') + ': الحلم قد ينفجر.' }
      ] }
    ]
  }
];

/* ---------- the three model paragraphs (exam Part 2) ----------
   D12: about 80-90 words, simple English. Ideas, device names and quotes come from
   the document; only the wording is simpler. `gap` is an exact piece of `en`.
   `ar` and `skeleton_ar` are plain Arabic (no English inside them). */
PH.paragraphs = [
  {
    id: 'eagle-style', poem: 'eagle',
    ar: 'أسلوب قصيدة النسر', en: 'The style of The Eagle',
    sentences: [
      { role: 'open',
        en: '"The Eagle" by Alfred, Lord Tennyson has two stanzas called tercets, and the rhyme scheme is AAA BBB.',
        ar: 'قصيدة النسر للشاعر تينيسون فيها مقطعان، كل مقطع 3 أسطر. أسطر المقطع الأول على قافية واحدة، وأسطر الثاني على قافية أخرى.',
        gap: 'tercets' },
      { role: 'point',
        en: 'First, the poet uses alliteration in "clasps," "crag," and "crooked." They all begin with a \'k\' sound.',
        ar: 'أولًا: الشاعر يكرر الصوت الأول في ثلاث كلمات. كلها تبدأ بصوت الكاف.',
        gap: 'alliteration' },
      { role: 'point',
        en: 'Second, there is personification in "crooked hands." The eagle has hands like a person.',
        ar: 'ثانيًا: فيها تشخيص. للنسر يدان مثل الإنسان.',
        gap: 'personification' },
      { role: 'point',
        en: 'Third, the imagery in "Ring\'d with the azure world" shows the bright blue sky around the eagle.',
        ar: 'ثالثًا: الصور الحسية في السطر الثالث تُرينا السماء الزرقاء اللامعة حول النسر.',
        gap: 'imagery' },
      { role: 'point',
        en: 'Finally, the simile "like a thunderbolt" shows how fast the eagle falls.',
        ar: 'أخيرًا: التشبيه بالصاعقة يُظهر سرعة نزول النسر.',
        gap: 'simile' },
      { role: 'close',
        en: 'The tone is contemplative: thoughtful and full of wonder at the eagle\'s beauty.',
        ar: 'النبرة تأمّلية: متفكّرة، وفيها انبهار بجمال النسر.',
        gap: 'contemplative' }
    ],
    skeleton_ar: [
      'الشكل: مقطعان، كل مقطع 3 أسطر، وقافية واحدة لأسطر كل مقطع: ثلاثة على قافية، وثلاثة على قافية أخرى.',
      'تكرار الصوت الأول: صوت الكاف في ثلاث كلمات من السطر الأول، وهي الكلمات المقتبسة.',
      'التشخيص: للنسر يدان.',
      'الصور الحسية: السماء الزرقاء حوله.',
      'التشبيه: نزوله سريع مثل الصاعقة.',
      'الخاتمة: النبرة تأمّلية: متفكّرة، وفيها انبهار بجمال النسر.'
    ]
  },
  {
    id: 'eagle-theme', poem: 'eagle',
    ar: 'موضوع قصيدة النسر', en: 'The theme of The Eagle',
    sentences: [
      { role: 'open',
        en: 'The theme of "The Eagle" by Alfred, Lord Tennyson is The Majesty and Power of Nature. The eagle shows the wild, strong power of nature.',
        ar: 'موضوع قصيدة النسر لتينيسون: عظمة الطبيعة وقوتها. النسر يُظهر قوة الطبيعة البرية.',
        gap: 'The Majesty and Power of Nature' },
      { role: 'point',
        en: 'First, the eagle stands high up near the sun and sky, "in lonely lands."',
        ar: 'أولًا: النسر يقف عاليًا قرب الشمس والسماء، وحده في مكان خالٍ.',
        gap: 'lonely lands' },
      { role: 'point',
        en: 'Second, the imagery in "Ring\'d with the azure world" shows the bright blue sky all around the eagle.',
        ar: 'ثانيًا: الصور الحسية في السطر الثالث تُرينا السماء الزرقاء اللامعة حول النسر من كل جهة.',
        gap: 'azure' },
      { role: 'point',
        en: 'Third, the eagle watches from his "mountain walls" as the sea moves below him. He is above all other life.',
        ar: 'ثالثًا: النسر يراقب من فوق صخور الجبل، والبحر يتحرك تحته. هو أعلى من كل الكائنات.',
        gap: 'mountain walls' },
      { role: 'close',
        en: 'So the eagle fills us with wonder, and no person can reach him.',
        ar: 'الخلاصة: النسر يبهرنا، ولا يقدر أي إنسان أن يصل إليه.',
        gap: 'reach him' }
    ],
    skeleton_ar: [
      'الموضوع: عظمة الطبيعة وقوتها.',
      'عالٍ قرب الشمس، ووحده.',
      'الصور الحسية: السماء الزرقاء حوله من كل جهة.',
      'يراقب من فوق الجبل، والبحر تحته.',
      'الخاتمة: يبهرنا، ولا يصل إليه إنسان.'
    ]
  },
  {
    id: 'dream-style', poem: 'dream',
    ar: 'أسلوب قصيدة الحلم المؤجَّل', en: 'The style of Dream Deferred',
    sentences: [
      { role: 'open',
        en: '"A Dream Deferred" by Langston Hughes is written in free verse. It has 11 lines and no regular rhyme scheme or meter.',
        ar: 'قصيدة الحلم المؤجَّل لهيوز مكتوبة بالشعر الحر. فيها 11 سطرًا، وليس لها قافية منتظمة ولا وزن منتظم.',
        gap: 'free verse' },
      { role: 'point',
        en: 'First, there are many similes, such as "like a raisin in the sun?"',
        ar: 'أولًا: فيها تشبيهات كثيرة، منها تشبيه الحلم بزبيبة في الشمس.',
        gap: 'similes' },
      { role: 'point',
        en: 'Second, there is a metaphor in the last line: "Or does it explode?"',
        ar: 'ثانيًا: في السطر الأخير استعارة: الحلم قد ينفجر.',
        gap: 'metaphor' },
      { role: 'point',
        en: 'Third, the imagery shows us rotten meat and a heavy load.',
        ar: 'ثالثًا: الصور الحسية تُرينا لحمًا فاسدًا وحِملًا ثقيلًا.',
        gap: 'imagery' },
      { role: 'point',
        en: 'Finally, the \'d\' sound in "dream deferred" is alliteration, and the \'r\' sound in "Or crust and sugar over" is consonance.',
        ar: 'أخيرًا: صوت الدال يتكرر في بداية كلمتين في السطر الأول، وهذا تكرار الصوت الأول. وصوت الراء يتكرر في آخر الكلمات في سطر القشرة والسكر، وهذا تكرار الصوت الأخير.',
        gap: 'consonance' },
      { role: 'close',
        en: 'The tone is questioning and warning: a delayed dream ends badly.',
        ar: 'الخلاصة: النبرة تسأل وتحذّر، والحلم الذي يتأجّل تكون نهايته سيئة.',
        gap: 'questioning and warning' }
    ],
    skeleton_ar: [
      'الشكل: شعر حر، فيه 11 سطرًا، بلا قافية ولا وزن منتظم.',
      'التشبيه: زبيبة في الشمس.',
      'الاستعارة: السطر الأخير، الحلم قد ينفجر.',
      'الصور الحسية: لحم فاسد، وحِمل ثقيل.',
      'تكرار الصوت الأول: الدال في السطر الأول. تكرار الصوت الأخير: الراء في سطر القشرة والسكر.',
      'الخاتمة: النبرة تسأل وتحذّر.'
    ]
  }
];

/* ---------- how to build a paragraph (OUR suggestion; the lecturer's planning page is missing) ---------- */
PH.paragraphGuide = {
  ar: 'كيف تكتبين الفقرة',
  steps: [
    { role: 'open', ar: 'جملة البداية: اسم القصيدة والشاعر، والشكل أو الموضوع.', en: 'Opening sentence' },
    { role: 'point', ar: 'من 2 إلى 4 نقاط. في كل نقطة: اسم الأداة أو الفكرة، ثم كلمات من القصيدة بين علامتي تنصيص، ثم ماذا تُظهر.', en: 'Point: device or idea + a line from the poem + what it shows' },
    { role: 'close', ar: 'جملة الختام: النبرة أو الفكرة العامة في جملة واحدة.', en: 'Closing sentence' }
  ],
  note_ar: 'هذا الترتيب اقتراح منّا، وليس من الدكتورة. ذكرت الدكتورة إرشادات للتخطيط في الصفحة 2 من الملف، لكنها غير موجودة في الملفات التي عندنا.'
};

})();
