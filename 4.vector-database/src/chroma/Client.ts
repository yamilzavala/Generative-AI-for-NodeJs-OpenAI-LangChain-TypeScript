import { ChromaClient } from "chromadb";

const client = new ChromaClient({
    path: 'http://localhost:8000'
});

async function main(){
    try {
        const response = await client.createCollection({
            name: 'data-test'
        });
        console.log(response);
    } catch (error) {
        console.error("Failed to create collection:", error);
    }
}

async function addData(){
    const collection = await client.getCollection({
        name: 'data-test'
    })

    const result = await collection.add({
        ids: ['id0'],
        documents: ['Here is my entry'],
        embeddings:[[0.1, 0.2]]
    })

    console.log(result)
}

//main()
//addData()