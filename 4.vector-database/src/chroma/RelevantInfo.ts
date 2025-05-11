/*
> Break the data into chunks
> Store them inside a vector database
> Ask a question - DB query
> Use similarity search to find the most relevant chunk
> Use OpenAi to properly answer the question
*/

import { ChromaClient, OpenAIEmbeddingFunction } from "chromadb";
import OpenAI from "openai";
const chroma = new ChromaClient({ path: "http://localhost:8000" });

const studentInfo = `Alexandra Thompson, a 19-year-old computer science sophomore with a 3.7 GPA,
is a member of the programming and chess clubs who enjoys pizza, swimming, and hiking
in her free time in hopes of working at a tech company after graduating from the University of Washington.`;

const clubInfo = `The university chess club provides an outlet for students to come together and enjoy playing
the classic strategy game of chess. Members of all skill levels are welcome, from beginners learning
the rules to experienced tournament players. The club typically meets a few times per week to play casual games,
participate in tournaments, analyze famous chess matches, and improve members' skills.`;

const universityInfo = `The University of Washington, founded in 1861 in Seattle, is a public research university
with over 45,000 students across three campuses in Seattle, Tacoma, and Bothell.
As the flagship institution of the six public universities in Washington state,
UW encompasses over 500 buildings and 20 million square feet of space,
including one of the largest library systems in the world.`;

//embeding instance to embedding data using OpenAi
const embeddingFunction: OpenAIEmbeddingFunction = new OpenAIEmbeddingFunction({
    openai_api_key: process.env.OPENAI_API_KEY!,
    openai_model: 'text-embedding-3-small'
});

//table name in vector data base
const collectionName = "personal-infos";

//function to create a table in a vector database
async function createCollection() {
   await chroma.createCollection({ name: collectionName });
}

//function to retur a vector database table using embedding
async function getCollection() {
    const collection = await chroma.getCollection({
        name: collectionName,
        embeddingFunction
    });
    return collection;
}

//function to insert data into vector database
async function populateCollection() {
    const collection = await getCollection();
    await collection.add({
        documents: [studentInfo, clubInfo, universityInfo],
        ids: ['id1', 'id2', 'id3'],
    })
}

//function to ask a embedding question to a vector database and give a context injection to OpenAi to response with that context as an asistent 
async function askQuestion() {
    const question = 'What does Alexandra Thompson like to do in her free time?';
    const collection = await getCollection();

    const result = await collection.query({
        queryTexts: question,
        nResults: 1
    })
    
    const relevantInfo = result.documents[0][0]
    if (relevantInfo) {
        const openai = new OpenAI();
        const response = await openai.chat.completions.create({
            model: 'gpt-3.5-turbo',
            temperature: 0,
            messages: [{
                role: 'assistant',
                content: `Answer the next question using this information: ${relevantInfo}` // context injection
            },
            {
                role:'user',
                content: question
            }]
        })
        const responseMessage = response.choices[0].message;
        console.log(responseMessage.content);
    }
}


//1. ==> await createCollection(); await populateCollection()
//2. ==> await askQuestion()