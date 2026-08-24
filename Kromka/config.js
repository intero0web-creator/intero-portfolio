// Кромка — единый конфиг сайта.
// Меняете значения здесь — подтянутся во всём index.html.

window.CFG = {
  brand:        'Кромка',
  master:       'Артём Севрюков',
  phone:        '+7 (911) 234-56-78',
  phoneRaw:     '+79112345678',
  // Telegram пуст по умолчанию — все блоки с TG автоматически скрываются
  // (data-cfg-optional). Впишите @handle и https-ссылку, чтобы включить.
  telegram:     '',
  telegramUrl:  '',
  email:        'hi@kromka-spb.ru',
  address:      'Санкт-Петербург, метро Купчино (точный адрес — после согласования)',
  siteUrl:      'https://kromka-spb.ru',

  // Отправка формы (тот же принцип, что для Тихой пасеки):
  //   1) LEAD_URL — POST JSON туда
  //   2) TG_TOKEN + TG_CHAT — прямо в Telegram-бота
  //   3) DEMO=true — имитация без реальной отправки
  LEAD_URL:     '',
  TG_TOKEN:     '',
  TG_CHAT:      '',
  DEMO:         true
};
