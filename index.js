import { PrismaClient } from '@prisma/client';
// import fetch from 'node-fetch'
import express from 'express';

const prisma = new PrismaClient();

async function run() {
    const app = express();
    const port = 3000;
    app.get('/card', async (req, res) => {
        try {
            const data = await prisma.card.findMany({
                where: { name: req.query.name },
            });
            return res.json(data);
        } catch (error) {
            res.status(500).json({
                error: 'An error occurred while fetching data',
            });
        }
    });

    app.get('/search', async (req, res) => {
        const termDict = {
            term: null,
            power: null,
            toughness: null,
        };
        let searchTerm = '';
        let searchModifiers = [];
        req.query.term.split(' ').map((element) => {
            const finalElement = element.split(':');
            if (finalElement.length > 1) {
                searchModifiers.push(finalElement);
            } else {
                searchTerm = element;
            }
        });
        searchModifiers.map((mod) => {
            searchModifiers[mod[0]] = mod[1];
        });

        const searchObj = { where: { AND: [] } };

        ['term', 'power', 'toughness'].map((key) => {
            if (termDict[key] !== null) {
                if (key !== 'term') {
                    searchObj.where.AND.push({
                        [key]: {
                            equals: parseInt(termDict[key]),
                        },
                    });
                } else {
                    searchObj.where.AND.push({
                        OR: [
                            {
                                oracle_text: {
                                    contains: termDict[key],
                                    mode: 'insensitive',
                                },
                            },
                            {
                                name: {
                                    contains: termDict[key],
                                    mode: 'insensitive',
                                },
                            },
                            {
                                supertypes: {
                                    has:
                                        termDict[key].charAt(0).toUpperCase() +
                                        termDict[key].slice(1),
                                },
                            },
                            {
                                subtypes: {
                                    has:
                                        termDict[key].charAt(0).toUpperCase() +
                                        termDict[key].slice(1),
                                },
                            },
                        ],
                    });
                }
            }
        });

        const data = await prisma.card.findMany(searchObj);
        return res.json(data);
    });

    app.listen(port, () => {
        console.log(`Server is running on http://localhost:${port}`);
    });
}

run();
