export default class Card {
    constructor(
        id,
        name,
        mana_cost,
        type_line,
        oracle_text,
        power,
        toughness,
        colors,
        color_identity,
        keywords,
        legalities,
        set,
        rarity
    ) {
        this.id = id;
        this.name = name;
        this.mana_cost = mana_cost;
        this.type_line = type_line;
        this.oracle_text = oracle_text;
        this.power = power;
        this.toughness = toughness;
        this.colors = colors;
        this.color_identity = color_identity;
        this.keywords = keywords;
        this.legalities = legalities;
        this.set = set;
        this.rarity = rarity;
    }
}
