import { readFile, readFileSync, writeFileSync } from "fs";
import OpenAI from "openai";
import { join } from "path";

const openai = new OpenAI();

export type DataWithEmbeddings = {
    input: string,
    embeddings: number[]
}

export async function generateEmbeddingsFc(input: string | string[]) {
    const response = await openai.embeddings.create({
        model: 'text-embedding-3-small',
        input: input,
        encoding_format: 'float'
    })
    //console.log(response.data[0].embedding)
    return response;
}

export function loadJSONData<T>(filename: string):T{
    const path = join(__dirname, filename);
    const rawData = readFileSync(path);
    return JSON.parse(rawData.toString())
}

function saveDataToJsonFile(data: any, fileName: string){
    const dataString = JSON.stringify(data);
    const dataBuffer = Buffer.from(dataString)
    const path = join(__dirname, fileName);
    writeFileSync(path, dataBuffer);
    console.log(`saved data to ${fileName}`)
}

async function main() {
    // const data = loadJSONData<string[]>('data.json');
    const data = loadJSONData<string[]>('johnData.json');
    const embedding = await generateEmbeddingsFc(data); 
    const dataWithEmbeddings: DataWithEmbeddings[] = [];
    for(let i = 0; i < data.length ;i++) {
        const dataAndEmbedding: DataWithEmbeddings = {
            input: data[i],
            embeddings: embedding.data[i].embedding
        }
        dataWithEmbeddings.push(dataAndEmbedding)
    }
    saveDataToJsonFile(dataWithEmbeddings, 'jhonDataWithEmbeddings.json')
}

main();
// generateEmbeddingsFc(['Cat is on the roof', 'Dog is in the car'])
