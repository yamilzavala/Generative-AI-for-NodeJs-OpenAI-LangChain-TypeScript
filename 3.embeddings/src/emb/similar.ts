import { DataWithEmbeddings, generateEmbeddingsFc, loadJSONData } from "./main";

//producto punto a punto
function dotProduct(a: number[], b: number[]){
    return a.map((el, idx) => el*b[idx]) //multiplica elemento por elemento
            .reduce((a,b) => a+b, 0)     //suma todos los productos
}

function cosineSimilarity(a:number[], b: number[]) {
    const product = dotProduct(a, b); //producto punto a punto
    const aMagnitude = Math.sqrt(a.map(val => val * val).reduce((a,b) => a+b, 0)) // ||a||
    const bMagnitude = Math.sqrt(b.map(val => val * val).reduce((a,b) => a+b, 0)) // ||b||
    return product / (aMagnitude * bMagnitude) // fórmula del coseno
}

async function main() {
    // const dataEmbeddings = loadJSONData<DataWithEmbeddings[]>('dataWithEmbeddings.json');
    const dataEmbeddings = loadJSONData<DataWithEmbeddings[]>('jhonDataWithEmbeddings.json');

    // const input = 'animal';
    const input = 'How old is John?';
    const embedding = await generateEmbeddingsFc(input);

    const similarities : {input: string, similarity: number}[] = [];

    for(const entry of dataEmbeddings) {
        const similarity = cosineSimilarity(
            entry.embeddings,
            embedding.data[0].embedding
        )
        similarities.push({
            input: entry.input,
            similarity
        })
    }

    console.log(`Similarity of ${input} with:`)
    const sortedSimilarities = similarities.sort((a,b) => b.similarity - a.similarity)
    sortedSimilarities.forEach(similarity => {
        console.log(`${similarity.input}: ${similarity.similarity}`);
    })
}

main()