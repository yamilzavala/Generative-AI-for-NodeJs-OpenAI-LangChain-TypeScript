/*
> create a new table (index)
> add data to the db (upsert) 
*/

import { Pinecone } from '@pinecone-database/pinecone';

const pc = new Pinecone({
  apiKey: process.env.PINECONE_API_KEY!
});

type CoolType = {
    coolness: number;
    reference: string;
}

async function createNamespace() {
     const index = getIndex()
     const namespace = index.namespace('cool-namespace')
}

function getIndex() {
     const index = pc.index<CoolType>('cool-index')
     return index
}

async function listIndex() {
     const result = await pc.listIndexes()
     console.log(result)
}

async function createIndex() {
     await pc.createIndex({
		name: 'cool-index',
		dimension: 1536,
		metric: 'cosine',
		spec: {
			serverless: {
				cloud: 'aws',
				region: 'us-east-1'
			}
		}
	})
}

function generateNumberArray(length: number) {
    return Array.from({length}, () => Math.random())
}

async function upsertVectors() {
    const embedding = generateNumberArray(1536);
    const index = getIndex()

    const upsertResult = await index.upsert([
        {
            id: 'id-1',
            values: embedding,
            metadata: {
                coolness: 3,
                reference: 'abdc'
            }
        }
    ])
}

async function queryVectors() {
    const index = getIndex()
    const result = await index.query(
        {
            id: 'id-1',
            topK: 1
        }
    )
    console.log(result)
}



async function main(){
    await createIndex()
    //await listIndex()
    //await upsertVectors();
    //await queryVectors()
}

main();