-- CreateTable
CREATE TABLE "Card" (
    "id" SERIAL NOT NULL,
    "scryfall_id" TEXT,
    "name" TEXT,
    "mana_cost" TEXT,
    "type_line" TEXT,
    "oracle_text" TEXT,
    "power" INTEGER,
    "toughness" INTEGER,
    "colors" TEXT[],
    "color_identity" TEXT[],
    "keywords" TEXT[],
    "set" TEXT,
    "rarity" TEXT,

    CONSTRAINT "Card_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Card_scryfall_id_key" ON "Card"("scryfall_id");
