// Список стран с телефонными кодами для форм регистрации/профиля.
// Вверху — основные страны аудитории, далее по алфавиту.
export const countries = [
  { name: "Беларусь", dialCode: "+375" },
  { name: "Россия", dialCode: "+7" },
  { name: "Казахстан", dialCode: "+7" },
  { name: "Украина", dialCode: "+380" },
  { name: "Азербайджан", dialCode: "+994" },
  { name: "Армения", dialCode: "+374" },
  { name: "Грузия", dialCode: "+995" },
  { name: "Израиль", dialCode: "+972" },
  { name: "Кыргызстан", dialCode: "+996" },
  { name: "Латвия", dialCode: "+371" },
  { name: "Литва", dialCode: "+370" },
  { name: "Молдова", dialCode: "+373" },
  { name: "Польша", dialCode: "+48" },
  { name: "США", dialCode: "+1" },
  { name: "Таджикистан", dialCode: "+992" },
  { name: "Туркменистан", dialCode: "+993" },
  { name: "Турция", dialCode: "+90" },
  { name: "Узбекистан", dialCode: "+998" },
  { name: "Эстония", dialCode: "+372" },
  { name: "Германия", dialCode: "+49" },
];

// Уникальные телефонные коды (для выпадающего списка кода телефона).
// Если у нескольких стран один код (напр. +7), показываем его один раз.
export const dialCodes = (() => {
  const seen = new Set();
  const list = [];
  for (const c of countries) {
    if (!seen.has(c.dialCode)) {
      seen.add(c.dialCode);
      list.push(c.dialCode);
    }
  }
  return list.sort((a, b) => Number(a.replace("+", "")) - Number(b.replace("+", "")));
})();
