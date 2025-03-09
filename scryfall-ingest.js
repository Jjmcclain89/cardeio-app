import fetch from 'node-fetch';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Function to get all of the set codes from Scryfall API
async function getSets() {
    const response = await fetch('https://api.scryfall.com/sets');
    const body = await response.text();
    const json = JSON.parse(body);
    const set_codes = json.data.map((set) => set.code);
    return set_codes;
}

async function run() {
    let setsIngested = 0;
    const sets = await getSets();

    // The scryfall API has a rate limit of 10 requests per second, so use setInterval to make 10 requests per second
    const intervalId = setInterval(function () {
        console.log(`Total sets ingested: ${setsIngested}`);
        const setsToRequest = sets.splice(0, 10);
        setsToRequest.forEach(async (set) => {
            const response = await fetch(
                `https://api.scryfall.com/cards/search?q=set%3A${set}`
            );
            const body = await response.text();
            const json = JSON.parse(body);
            console.log(`Ingesting ${set}`);
            // Create a new record for each card in the set if it doesn't alkready exist, otherwise update the existing record
            json.data?.forEach((card) => {
                prisma.card.upsert({
                    where: { scryfall_id: card.id },
                    update: {
                        name: card.name,
                        mana_cost: card.mana_cost,
                        type_line: card.type_line,
                        oracle_text: card.oracle_text,
                        power: parseInt(card.power),
                        toughness: parseInt(card.toughness),
                        colors: card.colors,
                        color_identity: card.color_identity,
                        keywords: card.keywords,
                        set: card.set,
                        rarity: card.rarity,
                    },
                    create: {
                        scryfall_id: card.id,
                        name: card.name,
                        mana_cost: card.mana_cost,
                        type_line: card.type_line,
                        oracle_text: card.oracle_text,
                        power: parseInt(card.power),
                        toughness: parseInt(card.toughness),
                        colors: card.colors,
                        color_identity: card.color_identity,
                        keywords: card.keywords,
                        set: card.set,
                        rarity: card.rarity,
                    },
                });
            });
            setsIngested++;
        });
        // If there are no more sets to request, clear the interval
        if (setsToRequest.length === 0) {
            clearInterval(intervalId);
            console.log('All cards have been Ingested');
        }
    }, 1000);
}

run();
