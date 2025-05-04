import OpenAI from "openai";
import { writeFileSync, createReadStream } from "fs";

const openai = new OpenAI()

//transcribe from audio to text
async function createTranscription() {
    const response = await openai.audio.transcriptions.create({
        model: 'whisper-1',
        file: createReadStream('AudioSample.m4a'),
        language: 'en'
    })

    console.log(response.text)
}

//translate from audio to English
async function translate() {
    const response = await openai.audio.translations.create({
        model: 'whisper-1',
        file: createReadStream('FrenchSample.m4a'),
    })

    console.log(response.text)
}

//model to create an audio from a text
async function textToSpeech() {
    const sampleText = "I am Yamil and I am testing text to speech model from text to audio"
    const response = await openai.audio.speech.create({
        model: 'tts-1',
        input: sampleText,
        voice: 'alloy',
        response_format: 'mp3'
    })

    const buffer = Buffer.from(await response.arrayBuffer())
    writeFileSync('TestTextToSpeech.mp3', buffer)
}


//createTranscription()
//translate();
textToSpeech()