const { GoogleGenAI } = require("@google/genai")

const ai = new GoogleGenAI({
    apiKey: process.env.GOOGLE_GENAI_API_KEY,
});


async function invokgeGenAI(){
    const response = await ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents: " Hello gemini, how are you doing today? ",
        
    })
    console.log(response.text);

}
module.exports = { invokgeGenAI
}