import OpenAI from "openai";
import { writeFileSync, createReadStream } from "fs";

const openai = new OpenAI()

//image with response url to open in browser
async function generateImage() {
    const response = await openai.images.generate({
        model: 'dall-e-2',
        prompt: 'A photo of a cat on a mat',
        n: 1,
        size: "256x256"
    })
    
    console.log(response)
}

//image to save localy
async function generateLocalImage() {
    const response = await openai.images.generate({
        model: 'dall-e-2',
        prompt: 'A photo of a cat on a mat',
        n: 1,
        size: "256x256",
        response_format: 'b64_json'
    })
    
    const rawImage = response.data[0].b64_json;
    if(rawImage){
        writeFileSync('catMat.png', Buffer.from(rawImage, 'base64'))
    }
}

//image to save localy but with more quality
async function generateAdvancedImage() {
    const response = await openai.images.generate({
        model: 'dall-e-3',
        prompt: 'A photo of a city with skyscrapers with background trasparency',
        n: 1,
        size: "1024x1024",
        quality: 'hd',
        response_format: 'b64_json'
    })
    //save localy
    const rawImage = response.data[0].b64_json;
    if(rawImage){
        writeFileSync('cityHd.png', Buffer.from(rawImage, 'base64'))
    }
}

//image with variations
async function generateAdvancedImageVariation() {
    const response = await openai.images.createVariation({
        image: createReadStream('cityHd.png'),
        model: 'dall-e-2',
        response_format: 'b64_json',
        n: 1
    })
    
    const rawImage = response.data[0].b64_json;
    if(rawImage){
        writeFileSync('cityVariation.png', Buffer.from(rawImage, 'base64'))
    }
}

async function editImage() {
    const response = await openai.images.edit({
        image: createReadStream('cityHd.png'),
        mask: createReadStream('cityMask.png'),
        prompt: 'add a thunderstorm to the city'
    })
    
    const rawImage = response.data[0].b64_json;
    if(rawImage){
        writeFileSync('editedImage.png', Buffer.from(rawImage, 'base64'))
    }
}

//generateImage();
generateLocalImage();
//generateAdvancedImage()
//generateAdvancedImageVariation();
//editImage()