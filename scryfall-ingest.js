import fetch from 'node-fetch';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Function to get all of the set codes from Scryfall API
async function getSets() {
    const response = await fetch('https://api.scryfall.com/sets');
    const body = await response.text();
    return JSON.parse(body).data.map((set) => set.code);
}

function parseTypes(typeLine) {
    if (typeLine === undefined) {
        return { supertypes: [], subtypes: [] };
    }
    const supertypes = typeLine.split('—')[0].trim().split(' ');
    const subtypes = typeLine.split('—')[1]?.trim().split(' ') || [];
    return { supertypes, subtypes };
}

async function run() {
    const sets = await getSets();
    let setsIngested = 0;
    let totalSets = sets.length;

    // The scryfall API has a rate limit of 10 requests per second, so use setInterval to make 10 requests per second
    const intervalId = setInterval(function () {
        console.log(
            `Total sets ingested: ${setsIngested}. ${
                totalSets - setsIngested
            } remaining.`
        );
        const setsToRequest = sets.splice(0, 10);
        setsToRequest.forEach(async (set) => {
            const response = await fetch(
                `https://api.scryfall.com/cards/search?q=set%3A${set}`
            );
            const body = await response.text();
            const json = JSON.parse(body);
            console.log(`Ingesting ${set}`);
            // Create a new record for each card in the set if it doesn't already exist, otherwise update the existing record
            json.data?.forEach(async (card) => {
                const { supertypes, subtypes } = parseTypes(card.type_line);
                const newCard = await prisma.card.upsert({
                    where: { scryfall_id: card.id },
                    update: {
                        name: card.name,
                        mana_cost: card.mana_cost,
                        supertypes,
                        subtypes,
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
                        supertypes,
                        subtypes,
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
