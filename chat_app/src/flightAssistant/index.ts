import OpenAI from "openai";

const openai = new OpenAI();

function findFlights(origin: string, target: string): string[] {
    console.log('Getting available flights')
    if(origin === 'SFO' && target === 'LAX') {
        return['UA 123', 'AA 456']
    }
    if(origin === 'DWF' && target === 'LAX') {
        return['AA 789']
    }
    return ['66 FSFG']
}

function reserveFlight(flightID: string): string | 'FULLY_BOOKED' {
    if(flightID?.length === 6) {
        console.log(`Reserving flight ${flightID}`)
        return '123456'
    }
    return 'FULLY_BOOKED'
}

//prompt config
const context: OpenAI.Chat.ChatCompletionMessageParam[] = [
    {
        role: 'system',
        content: `You are a helpful assistant that gives information about flights and makes reservations.
                  When find flights, you must always use parameters 'origin' and 'target'.
                  When booking a flight, you must always use the 'flightID' as a parameter with the flight selected.`
    },
]

//configure the chat tools (first openAI call)
async function callOpenAIWithTools() {
    const response = await openai.chat.completions.create({
            model: 'gpt-3.5-turbo',
            messages: context,
            temperature: 0.5,
            tools: [
                {
                    type: 'function',
                    function: {
                        name: 'findFlights',
                        description: 'Return the available flights for the given origin and target destinations',
                        parameters: {
                            type: 'object',
                            properties: {
                                origin: {
                                    type: 'string',
                                    description: 'origin flight code'
                                },
                                target: {
                                    type: 'string',
                                    description: 'target flight code'
                                }
                            },
                            required: ['origin', 'target']
                        }
                    }
                },
                {
                    type: 'function',
                    function: {
                        name: 'reserveFlight',
                        description: 'makes a reservation for the given flight number',
                        parameters: {
                            type: 'object',
                            properties: {
                                origin: {
                                    type: 'string',
                                    description: 'the flight ID to reserve'
                                },
                            },
                            required: ['flightID']
                        }
                    }
                },
            ],
            tool_choice: 'auto'  //the engine will decide which tool to use
        }
    )
      
    //decide if tool call is required
    const willInvokeFunction: boolean = response.choices[0].finish_reason === 'tool_calls'
    
    if(willInvokeFunction) {
        const toolCall = response.choices[0].message.tool_calls![0];
        const toolName = toolCall.function.name;

        if(toolName === 'findFlights') {
            const rawArgument = toolCall.function.arguments;
            const parsedArgument = JSON.parse(rawArgument);
            const toolResponse = findFlights(parsedArgument.origin, parsedArgument.target);
            context.push(response.choices[0].message)
            context.push({
                role: 'tool',
                content: toolResponse.toString(),
                tool_call_id: toolCall.id
            })
        }

        if(toolName === 'reserveFlight') {
            const rawArgument = toolCall.function.arguments;
            const parsedArgument = JSON.parse(rawArgument);
            const toolResponse = reserveFlight(parsedArgument.flightID);
            context.push(response.choices[0].message)
            context.push({
                role: 'tool',
                content: toolResponse,
                tool_call_id: toolCall.id
            })
        }
    }

    //call OpenAI second time
    const secondResponse = await openai.chat.completions.create({
        model: 'gpt-3.5-turbo',
        messages: context,
    })
    console.log(secondResponse.choices[0].message.content)
}

console.log('Hello from flight assistant chatbot')
//listener to terminal inputs
process.stdin.addListener('data', async function (input) {
    let userInput = input.toString().trim()
    context.push({
        role: 'user',
        content: userInput
    })
    await callOpenAIWithTools();
})


