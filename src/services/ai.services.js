const { GoogleGenAI, Type } = require("@google/genai")

const ai = new GoogleGenAI({
    apiKey: process.env.GOOGLE_GENAI_API_KEY,
});


async function invokgeGenAI(){
    const response = await ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: " Hello gemini, how are you doing today? ",
        
    })
    console.log(response.text);

}

const interviewReportResponseSchema = {
    type: Type.OBJECT,
    properties: {
        matchScore: {
            type: Type.NUMBER,
            description: "How well the candidate matches the job description, 0-100",
        },
        technicalQuestions: {
            type: Type.ARRAY,
            items: {
                type: Type.OBJECT,
                properties: {
                    question: { type: Type.STRING, description: "The technical question that can be asked in the interview" },
                    intention: { type: Type.STRING, description: "The intention of the interviewer behind asking this question" },
                    answer: { type: Type.STRING, description: "How to answer this question in plain text, what points to cover and how to structure the answer. Do NOT use HTML." },
                },
                required: ["question", "intention", "answer"],
            },
        },
        behaviouralQuestions: {
            type: Type.ARRAY,
            items: {
                type: Type.OBJECT,
                properties: {
                    question: { type: Type.STRING, description: "The behavioural question that can be asked in the interview" },
                    intention: { type: Type.STRING, description: "The intention of the interviewer behind asking this question" },
                    answer: { type: Type.STRING, description: "How to answer this question in plain text, what points to cover and how to structure the answer. Do NOT use HTML." },
                },
                required: ["question", "intention", "answer"],
            },
        },
        skillGaps: {
            type: Type.ARRAY,
            items: {
                type: Type.OBJECT,
                properties: {
                    skill: { type: Type.STRING, description: "The skill that the candidate is missing or weak in" },
                    severity: { type: Type.STRING, description: "How critical this skill gap is: Low, Medium, or High" },
                },
                required: ["skill", "severity"],
            },
        },
        preparationPlan: {
            type: Type.ARRAY,
            items: {
                type: Type.OBJECT,
                properties: {
                    day: { type: Type.NUMBER, description: "Day number of the preparation plan" },
                    focus: { type: Type.STRING, description: "The main focus area for this day" },
                    tasks: {
                        type: Type.ARRAY,
                        items: { type: Type.STRING },
                        description: "List of tasks to complete on this day",
                    },
                },
                required: ["day", "focus", "tasks"],
            },
        },
    },
    required: ["matchScore", "technicalQuestions", "behaviouralQuestions", "skillGaps", "preparationPlan"],
};

async function generateInterviewReport({ resume, jobDescription, selfDescription }) {

    const prompt = `You are an expert interview coach. Analyze the candidate's resume, self-description, and the job description below. Generate a detailed interview preparation report.

Resume:
${resume}

Self Description:
${selfDescription}

Job Description:
${jobDescription}

Generate:
1. A match score (0-100) based on how well the candidate fits the job
2. 5-7 technical questions likely to be asked, with intention and detailed answer guidance
3. 3-5 behavioural questions with intention and answer guidance
4. Skill gaps the candidate should address, with severity (Low/Medium/High)
5. A 5-day preparation plan with daily focus and tasks

IMPORTANT: All text must be plain text. Do NOT use HTML tags. Respond ONLY with valid JSON.`;

    const response = await ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents: prompt,
        config: {
            responseMimeType: "application/json",
            responseSchema: interviewReportResponseSchema,
        },
    });

    const report = JSON.parse(response.text);
    console.log(JSON.stringify(report, null, 2));
    return {
        ...report,
        jobDescription,
        resume,
        selfDescription,
    };
}

module.exports = { invokgeGenAI, generateInterviewReport }
