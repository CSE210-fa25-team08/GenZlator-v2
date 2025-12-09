
const API_BASE = 'https://genzlator-api.saichaparala.com';
const MOCK = false;

const sleep = (ms:number) => {
  return new Promise(resolve => setTimeout(resolve, ms));
};

export async function backend_translate (toEmoji:boolean, inputText:string, chatHistory: string[], signal: AbortSignal) {
    if (MOCK) {

        await sleep(2000); //testing purposes

        signal.throwIfAborted();
        
        console.log(`Translation of ${inputText} ${toEmoji ? 'to emojis': 'to plain text'} triggered with history: ${chatHistory}`);
        return `${inputText} but like as ${toEmoji ? 'emojis':'plain text'}`;
    }

    const response = await fetch(`${API_BASE}/api/v1/translate`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            originalMessage: inputText,
            isToEmoji: toEmoji,
            chatHistory: chatHistory
        }),
        signal: signal
    });

    if (!response.ok) {
        throw new Error('Translation failed');
    }

    const data = await response.json();
    return data.translatedMessage;

}

export async function backend_feedback (inputText:string, rating:number, suggestion:string) {
    if (MOCK) {
        console.log(rating);
        console.log(`${rating ? "Postive" : "Negative"} feedback for ${inputText} sent with suggestion: ${suggestion}`)
        return;
    }

    const response = await fetch(`${API_BASE}/api/v1/feedback`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            originalInput: inputText,
            correctionText: suggestion,
            anonymousId: "user-0000", //TODO
            rating: rating
        }),
    });

    if (!response.ok) {
        throw new Error('Feedback failed');
    }

    await response.json();
    return;

}