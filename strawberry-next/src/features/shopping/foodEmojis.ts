const foodEmojiMap: Record<string, string> = {
  apple: "🍎", apples: "🍎", banana: "🍌", bananas: "🍌", orange: "🍊", oranges: "🍊",
  lemon: "🍋", lemons: "🍋", lime: "🍋‍🟩", limes: "🍋‍🟩", grape: "🍇", grapes: "🍇",
  strawberry: "🍓", strawberries: "🍓", blueberry: "🫐", blueberries: "🫐",
  watermelon: "🍉", peach: "🍑", peaches: "🍑", pear: "🍐", pears: "🍐",
  cherry: "🍒", cherries: "🍒", pineapple: "🍍", mango: "🥭", mangoes: "🥭",
  coconut: "🥥", avocado: "🥑", avocados: "🥑", tomato: "🍅", tomatoes: "🍅",
  potato: "🥔", potatoes: "🥔", "sweet potato": "🍠", "sweet potatoes": "🍠",
  carrot: "🥕", carrots: "🥕", corn: "🌽", broccoli: "🥦", cucumber: "🥒",
  cucumbers: "🥒", lettuce: "🥬", spinach: "🥬", kale: "🥬",
  pepper: "🫑", peppers: "🫑", "bell pepper": "🫑", "bell peppers": "🫑",
  "hot pepper": "🌶️", chili: "🌶️", jalapeño: "🌶️", jalapeno: "🌶️",
  onion: "🧅", onions: "🧅", garlic: "🧄", mushroom: "🍄", mushrooms: "🍄",
  eggplant: "🍆", beans: "🫘", bean: "🫘", peanut: "🥜", peanuts: "🥜",
  ginger: "🫚", pea: "🫛", peas: "🫛",
  milk: "🥛", cheese: "🧀", butter: "🧈", egg: "🥚", eggs: "🥚",
  yogurt: "🫙", cream: "🥛", "cream cheese": "🧀", "ice cream": "🍦",
  chicken: "🍗", turkey: "🦃", beef: "🥩", steak: "🥩", pork: "🥓",
  bacon: "🥓", ham: "🍖", sausage: "🌭",
  fish: "🐟", salmon: "🐟", tuna: "🐟", shrimp: "🦐", lobster: "🦞",
  crab: "🦀", squid: "🦑", oyster: "🦪",
  bread: "🍞", bagel: "🥯", croissant: "🥐", baguette: "🥖", pretzel: "🥨",
  pancake: "🥞", pancakes: "🥞", waffle: "🧇", waffles: "🧇",
  rice: "🍚", pasta: "🍝", noodles: "🍜", flour: "🌾", oats: "🌾", cereal: "🥣",
  tortilla: "🫓", flatbread: "🫓",
  salt: "🧂", honey: "🍯", "olive oil": "🫒", oil: "🫒", olives: "🫒",
  chocolate: "🍫", cookie: "🍪", cookies: "🍪",
  cake: "🍰", pie: "🥧", sugar: "🍬", vinegar: "🫗",
  sauce: "🫙", ketchup: "🫙", mustard: "🫙", mayo: "🫙",
  "soy sauce": "🫙", jam: "🫙",
  water: "💧", coffee: "☕", tea: "🍵", juice: "🧃", wine: "🍷",
  beer: "🍺", soda: "🥤",
  nuts: "🥜", almond: "🥜", almonds: "🥜", walnut: "🥜", walnuts: "🥜",
};

export function getFoodEmoji(name: string): string | null {
  const lower = name.toLowerCase().trim();
  if (foodEmojiMap[lower]) return foodEmojiMap[lower];
  for (const [food, emoji] of Object.entries(foodEmojiMap)) {
    if (lower.includes(food)) return emoji;
  }
  return null;
}
