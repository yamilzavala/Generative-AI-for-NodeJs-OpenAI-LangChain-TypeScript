import OpenAI from "openai";

const openai = new OpenAI();

function getTimeOfDay() {
    const now = new Date();
    const date = now.toLocaleDateString(); // formato de fecha local (ej: 26/04/2025)
    const time = now.toLocaleTimeString(); // formato de hora local (ej: 10:34:56)
    return `The current date is ${date} and the time is ${time}.`;
}

function getOrderStatus(orderId: string) {
    console.log(`Getting status for the order: ${orderId}`)
    const orderAsNumber = parseInt(orderId);
    if(orderAsNumber % 2 === 0) {
        return 'IN_PROGRESS'
    }
    return 'COMPLETED'
}

async function callOpenAIWithTools() {
    //prompt config
    const context: OpenAI.Chat.ChatCompletionMessageParam[] = [
        {
            role: 'system',
            content: 'You are a helpful assistant that gives information about the time of day and order status'
        },
        {
            role: 'user',
            content: 'What is the status of the order 2?'
        }
    ]

    //configure the chat tools (first openAI call)
    const response = await openai.chat.completions.create({
        model: 'gpt-3.5-turbo',
        messages: context,
        tools: [
            {
                type: 'function',
                function: {
                    name: 'getTimeOfDay',
                    description: 'Get the time of day'
                }
            },
            {
                type: 'function',
                function: {
                    name: 'getOrderStatus',
                    description: 'Get the order status',
                    parameters: {
                        type: 'object',
                        properties: {
                            orderId: {
                                type: 'string',
                                description: 'The id of the order to get the status of'
                            }
                        },
                        required: ['orderId']
                    }
                }
            }
        ],
        tool_choice: 'auto' //the engine will decide which tool to use
    })

    //decide if tool call is required
    const willInvokeFunction: boolean = response.choices[0].finish_reason === 'tool_calls'
    const toolCall = response.choices[0].message.tool_calls![0];

    if(willInvokeFunction) {
        const toolName = toolCall.function.name;
        
        if(toolName === 'getTimeOfDay') {
            const toolResponse = getTimeOfDay();
            context.push(response.choices[0].message)
            context.push({
                role: 'tool',
                content: toolResponse,
                tool_call_id: toolCall.id
            })
        }

        if(toolName === 'getOrderStatus') {
            const rawArgument = toolCall.function.arguments;
            const parsedArgument = JSON.parse(rawArgument);
            const toolResponse = getOrderStatus(parsedArgument.orderId);
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

callOpenAIWithTools()