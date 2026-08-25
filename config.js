// Верный ход — единый конфиг сайта.
// Меняете значения здесь — подтянутся во всём index.html.

window.CFG = {
  brand:        'Верный ход',
  master:       'Игорь Плетнёв',
  phone:        '+7 (843) 512-34-56',
  phoneRaw:     '+78435123456',
  // Telegram пуст по умолчанию — блок с ним скрывается сам (data-cfg-optional),
  // пока вы не впишете реальный @handle и ссылку.
  telegram:     '',
  telegramUrl:  '',
  email:        'igor@verniy-khod.ru',
  address:      'Чистополь, Татарстан (приём по договорённости, часы принимаю и по почте со всей страны)',
  siteUrl:      'https://verniy-khod.ru',

  // Отправка формы — тот же принцип, что в «Кромке»:
  //   1) LEAD_URL — POST FormData туда (Formspree и подобные, понимают multipart «из коробки»)
  //   2) TG_TOKEN + TG_CHAT — прямо в Telegram-бота
  //   3) DEMO=true — имитация без реальной отправки
  LEAD_URL:     '',
  TG_TOKEN:     '',
  TG_CHAT:      '',
  DEMO:         true
};
