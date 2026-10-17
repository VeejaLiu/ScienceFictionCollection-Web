export const locales = ['zh-CN', 'zh-TW', 'en', 'fr', 'de', 'ru', 'ja', 'ko'] as const
export type Locale = typeof locales[number]
export const defaultLocale: Locale = 'zh-CN'
export const localeCookie = 'reader-locale'
export const localeNames: Record<Locale, string> = {
  'zh-CN': '简体中文', 'zh-TW': '繁體中文', en: 'English', fr: 'Français',
  de: 'Deutsch', ru: 'Русский', ja: '日本語', ko: '한국어',
}

const zhCN = {
  siteTitle: '科幻小说作品集',
  description: '按作者与系列浏览科幻小说，在线阅读并保存阅读进度。',
  language: '语言', theme: '切换主题', sourceCode: '网站源码', contentRepository: '小说仓库',
  licenses: '第三方许可',
  chooseAuthor: '选择作家', noAuthors: '暂无作家', works: '作品列表',
  authorWorks: '{author} 的 {count} 部作品', chooseAuthorHint: '请选择一位作家',
  noWorks: '该作家暂无作品', otherWorks: '其他作品', loading: '正在加载…',
  author: '作者：{author}', unknownAuthor: '作者未知',
  loadError: '无法加载书目，请稍后重试。', readError: '无法加载正文，请稍后重试。',
  minutes: '约 {minutes} 分钟', hours: '约 {hours} 小时', hoursMinutes: '约 {hours} 小时 {minutes} 分钟',
}
export type MessageKey = keyof typeof zhCN
type Messages = Record<MessageKey, string>

export const messages: Record<Locale, Messages> = {
  'zh-CN': zhCN,
  'zh-TW': {
    siteTitle: '科幻小說作品集', description: '依作者與系列瀏覽科幻小說，線上閱讀並儲存閱讀進度。',
    language: '語言', theme: '切換主題', sourceCode: '網站原始碼', contentRepository: '小說儲存庫',
    licenses: '第三方授權',
    chooseAuthor: '選擇作家', noAuthors: '暫無作家', works: '作品清單',
    authorWorks: '{author} 的 {count} 部作品', chooseAuthorHint: '請選擇一位作家',
    noWorks: '此作家暫無作品', otherWorks: '其他作品', loading: '載入中…',
    author: '作者：{author}', unknownAuthor: '作者不詳',
    loadError: '無法載入書目，請稍後再試。', readError: '無法載入正文，請稍後再試。',
    minutes: '約 {minutes} 分鐘', hours: '約 {hours} 小時', hoursMinutes: '約 {hours} 小時 {minutes} 分鐘',
  },
  en: {
    siteTitle: 'Science Fiction Collection', description: 'Browse science fiction by author and series, read online, and save your reading progress.',
    language: 'Language', theme: 'Toggle theme', sourceCode: 'Website source', contentRepository: 'Book repository',
    licenses: 'Third-party licenses',
    chooseAuthor: 'Choose an author', noAuthors: 'No authors yet', works: 'Works',
    authorWorks: '{author} · {count} works', chooseAuthorHint: 'Choose an author to browse their works',
    noWorks: 'No works available for this author', otherWorks: 'Other works', loading: 'Loading…',
    author: 'Author: {author}', unknownAuthor: 'Unknown author',
    loadError: 'Unable to load the catalog. Please try again.', readError: 'Unable to load this book. Please try again.',
    minutes: 'About {minutes} min', hours: 'About {hours} hr', hoursMinutes: 'About {hours} hr {minutes} min',
  },
  fr: {
    siteTitle: 'Collection de science-fiction', description: 'Parcourez les œuvres par auteur et par série, lisez en ligne et enregistrez votre progression.',
    language: 'Langue', theme: 'Changer de thème', sourceCode: 'Code source du site', contentRepository: 'Dépôt des livres',
    licenses: 'Licences tierces',
    chooseAuthor: 'Choisir un auteur', noAuthors: 'Aucun auteur disponible', works: 'Œuvres',
    authorWorks: '{author} · {count} œuvres', chooseAuthorHint: 'Choisissez un auteur pour voir ses œuvres',
    noWorks: 'Aucune œuvre disponible pour cet auteur', otherWorks: 'Autres œuvres', loading: 'Chargement…',
    author: 'Auteur : {author}', unknownAuthor: 'Auteur inconnu',
    loadError: 'Impossible de charger le catalogue. Réessayez.', readError: 'Impossible de charger ce livre. Réessayez.',
    minutes: 'Environ {minutes} min', hours: 'Environ {hours} h', hoursMinutes: 'Environ {hours} h {minutes} min',
  },
  de: {
    siteTitle: 'Science-Fiction-Sammlung', description: 'Science-Fiction nach Autor und Reihe entdecken, online lesen und den Lesefortschritt speichern.',
    language: 'Sprache', theme: 'Design wechseln', sourceCode: 'Quellcode der Website', contentRepository: 'Buch-Repository',
    licenses: 'Drittanbieter-Lizenzen',
    chooseAuthor: 'Autor auswählen', noAuthors: 'Keine Autoren vorhanden', works: 'Werke',
    authorWorks: '{author} · {count} Werke', chooseAuthorHint: 'Wählen Sie einen Autor aus',
    noWorks: 'Keine Werke für diesen Autor vorhanden', otherWorks: 'Weitere Werke', loading: 'Wird geladen…',
    author: 'Autor: {author}', unknownAuthor: 'Unbekannter Autor',
    loadError: 'Der Katalog konnte nicht geladen werden. Bitte erneut versuchen.', readError: 'Das Buch konnte nicht geladen werden. Bitte erneut versuchen.',
    minutes: 'Etwa {minutes} Min.', hours: 'Etwa {hours} Std.', hoursMinutes: 'Etwa {hours} Std. {minutes} Min.',
  },
  ru: {
    siteTitle: 'Сборник научной фантастики', description: 'Ищите фантастику по авторам и сериям, читайте онлайн и сохраняйте прогресс чтения.',
    language: 'Язык', theme: 'Сменить тему', sourceCode: 'Исходный код сайта', contentRepository: 'Репозиторий книг',
    licenses: 'Сторонние лицензии',
    chooseAuthor: 'Выбрать автора', noAuthors: 'Авторов пока нет', works: 'Произведения',
    authorWorks: '{author} · Произведений: {count}', chooseAuthorHint: 'Выберите автора для просмотра произведений',
    noWorks: 'У этого автора пока нет произведений', otherWorks: 'Другие произведения', loading: 'Загрузка…',
    author: 'Автор: {author}', unknownAuthor: 'Автор неизвестен',
    loadError: 'Не удалось загрузить каталог. Повторите попытку.', readError: 'Не удалось загрузить книгу. Повторите попытку.',
    minutes: 'Около {minutes} мин.', hours: 'Около {hours} ч', hoursMinutes: 'Около {hours} ч {minutes} мин.',
  },
  ja: {
    siteTitle: 'SF小説作品集', description: '作家やシリーズ別にSF小説を探してオンラインで読み、読書の進捗を保存できます。',
    language: '言語', theme: 'テーマを切り替え', sourceCode: 'サイトのソースコード', contentRepository: '小説リポジトリ',
    licenses: 'サードパーティーライセンス',
    chooseAuthor: '作家を選ぶ', noAuthors: '作家が見つかりません', works: '作品一覧',
    authorWorks: '{author} · {count}作品', chooseAuthorHint: '作家を選択してください',
    noWorks: 'この作家の作品はまだありません', otherWorks: 'その他の作品', loading: '読み込み中…',
    author: '著者：{author}', unknownAuthor: '著者不明',
    loadError: '作品一覧を読み込めませんでした。もう一度お試しください。', readError: '本文を読み込めませんでした。もう一度お試しください。',
    minutes: '約{minutes}分', hours: '約{hours}時間', hoursMinutes: '約{hours}時間{minutes}分',
  },
  ko: {
    siteTitle: 'SF 소설 모음', description: '작가와 시리즈별로 SF 소설을 찾아 온라인으로 읽고 독서 진행 상황을 저장하세요.',
    language: '언어', theme: '테마 전환', sourceCode: '사이트 소스 코드', contentRepository: '소설 저장소',
    licenses: '타사 라이선스',
    chooseAuthor: '작가 선택', noAuthors: '등록된 작가가 없습니다', works: '작품 목록',
    authorWorks: '{author} · 작품 {count}개', chooseAuthorHint: '작가를 선택해 주세요',
    noWorks: '이 작가의 작품이 아직 없습니다', otherWorks: '기타 작품', loading: '불러오는 중…',
    author: '작가: {author}', unknownAuthor: '작가 미상',
    loadError: '작품 목록을 불러올 수 없습니다. 다시 시도해 주세요.', readError: '본문을 불러올 수 없습니다. 다시 시도해 주세요.',
    minutes: '약 {minutes}분', hours: '약 {hours}시간', hoursMinutes: '약 {hours}시간 {minutes}분',
  },
}

export function resolveLocale(value?: string): Locale {
  return locales.find((locale) => locale === value) || defaultLocale
}

export function translate(locale: Locale, key: MessageKey, values: Record<string, string | number> = {}) {
  return messages[locale][key].replace(/\{(\w+)\}/g, (match, name: string) =>
    values[name] === undefined ? match : String(values[name]))
}
