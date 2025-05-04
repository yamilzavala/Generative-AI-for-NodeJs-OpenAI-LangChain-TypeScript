import OpenAI from "openai";

const openai = new OpenAI()

async function main() {
    const response = await openai.chat.completions.create({
        model: 'gpt-3.5-turbo',
        messages: [
            // {
            //     role: 'system',
            //     content: `You response like a cool bro, and ypu response en JSON fromat like this: 
            //         coolnessLevel: 1-10,
            //         answer: your answer
            //     `
            // },
            {
                role: 'user',
                content: 'Say something cool'
            }
        ],
        n:2
    })
    console.log(response.choices)
}

main()