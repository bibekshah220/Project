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
        summary: {
            type: Type.STRING,
            description: "A short overall summary of how well the candidate fits the role, 2-3 sentences in plain text",
        },
        strengths: {
            type: Type.ARRAY,
            items: { type: Type.STRING },
            description: "List of candidate strengths relevant to the job",
        },
        weaknesses: {
            type: Type.ARRAY,
            items: { type: Type.STRING },
            description: "List of candidate weaknesses or areas of concern for the job",
        },
        focusAreas: {
            type: Type.ARRAY,
            items: { type: Type.STRING },
            description: "Key areas the candidate should focus on before the interview",
        },
        technicalQuestions: {
            type: Type.ARRAY,
            items: {
                type: Type.OBJECT,
                properties: {
                    question: { type: Type.STRING, description: "The technical question that can be asked in the interview" },
                    intention: { type: Type.STRING, description: "The intention of the interviewer behind asking this question" },
                    shortAnswer: { type: Type.STRING, description: "A concise 1-2 sentence answer summary" },
                    detailedAnswer: { type: Type.STRING, description: "A thorough explanation covering key points, structure, and examples. Plain text only, no HTML." },
                },
                required: ["question", "intention", "shortAnswer", "detailedAnswer"],
            },
        },
        behaviouralQuestions: {
            type: Type.ARRAY,
            items: {
                type: Type.OBJECT,
                properties: {
                    question: { type: Type.STRING, description: "The behavioural question that can be asked in the interview" },
                    intention: { type: Type.STRING, description: "The intention of the interviewer behind asking this question" },
                    shortAnswer: { type: Type.STRING, description: "A concise 1-2 sentence answer summary" },
                    detailedAnswer: { type: Type.STRING, description: "A thorough explanation with STAR method guidance, key points, and examples. Plain text only, no HTML." },
                },
                required: ["question", "intention", "shortAnswer", "detailedAnswer"],
            },
        },
        skillGaps: {
            type: Type.ARRAY,
            items: {
                type: Type.OBJECT,
                properties: {
                    skill: { type: Type.STRING, description: "The skill that the candidate is missing or weak in" },
                    severity: { type: Type.STRING, description: "How critical this skill gap is: Low, Medium, or High" },
                    reason: { type: Type.STRING, description: "Why this is a gap and how it relates to the job requirements" },
                },
                required: ["skill", "severity", "reason"],
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
    required: ["matchScore", "summary", "strengths", "weaknesses", "focusAreas", "technicalQuestions", "behaviouralQuestions", "skillGaps", "preparationPlan"],
};

async function generateInterviewReport({ resume, jobDescription, selfDescription }) {

    const prompt = `You are an expert interview coach. Analyze the candidate's resume, self-description, and the job description below. Generate a detailed interview preparation report as strictly valid JSON.

Resume:
${resume}

Self Description:
${selfDescription}

Job Description:
${jobDescription}

Generate the following:
1. matchScore: A number 0-100 based on how well the candidate fits the job
2. summary: A short 2-3 sentence overall assessment of the candidate's fit
3. strengths: An array of the candidate's key strengths relevant to this role
4. weaknesses: An array of the candidate's weaknesses or concerns for this role
5. focusAreas: An array of key areas to focus on before the interview
6. technicalQuestions: 5-7 technical questions, each with question, intention, shortAnswer (1-2 sentences), and detailedAnswer (thorough explanation with key points and examples)
7. behaviouralQuestions: 3-5 behavioural questions, each with question, intention, shortAnswer (1-2 sentences), and detailedAnswer (STAR method guidance with examples)
8. skillGaps: Skills the candidate is missing, each with skill name, severity (Low/Medium/High), and reason
9. preparationPlan: A 5-day plan, each day with day number, focus area, and list of tasks

IMPORTANT: All text must be plain text. Do NOT use HTML tags. Do NOT include any text outside the JSON object.`;

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
