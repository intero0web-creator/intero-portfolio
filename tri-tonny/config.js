// Три тонны — единый конфиг сайта.
// Меняете значения здесь — подтянутся во всём index.html.

window.CFG = {
  brand:        'Три тонны',
  master:       'Максим Дегтярёв',
  phone:        '+7 (4822) 71-22-33',
  phoneRaw:     '+74822712233',
  // Telegram пуст по умолчанию — блок с ним скрывается сам (data-cfg-optional),
  // пока вы не впишете реальный @handle и ссылку.
  telegram:     '',
  telegramUrl:  '',
  email:        'zayavka@3tonny.ru',
  address:      'Тверь — база на Тверецкой набережной, работаем по городу и области, радиус до 80 км',
  siteUrl:      'https://3tonny.ru',

  // Отправка формы — тот же принцип, что в «Кромке» и «Верном ходе»:
  //   1) LEAD_URL — POST FormData туда (Formspree и подобные)
  //   2) TG_TOKEN + TG_CHAT — прямо в Telegram-бота
  //   3) DEMO=true — имитация без реальной отправки
  LEAD_URL:     '',
  TG_TOKEN:     '',
  TG_CHAT:      '',
  DEMO:         true
};
