const { GoogleGenAI } = require("@google/genai")
const { z } = require("zod");
const { zodToJsonSchema } = require("zod-to-json-schema");

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

const interviewReportSchema = z.object({
    matchScore: z.number().min(0).max(100).describe("How well the candidate matches the job description, 0-100"),
    technicalQuestions: z.array(z.object({
        question: z.string().describe("The technical question that can be asked in the interview"),
        intention: z.string().describe("The intention of the interviewer behind asking this question"),
        answer: z.string().describe("How to answer this question, what points to cover and how to structure the answer"),
    })),
    behaviouralQuestions: z.array(z.object({
        question: z.string().describe("The behavioural question that can be asked in the interview"),
        intention: z.string().describe("The intention of the interviewer behind asking this question"),
        answer: z.string().describe("How to answer this question, what points to cover and how to structure the answer"),
    })),
    skillGaps: z.array(z.object({
        skill: z.string().describe("The skill that the candidate is missing or weak in"),
        severity: z.enum(["Low", "Medium", "High"]).describe("How critical this skill gap is"),
    })),
    preparationPlan: z.array(z.object({
        day: z.number().describe("Day number of the preparation plan"),
        focus: z.string().describe("The main focus area for this day"),
        tasks: z.array(z.string()).describe("List of tasks to complete on this day"),
    })),
});

async function generateInterviewReport({ resume, jobDescription, selfDescription }) {
    const jsonSchema = zodToJsonSchema(interviewReportSchema);

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

Respond ONLY with valid JSON matching the provided schema.`;

    const response = await ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents: prompt,
        config: {
            responseMimeType: "application/json",
            responseSchema: jsonSchema,
        },
    });

    const report = JSON.parse(response.text);
    console.log(report);
    return {
        ...report,
        jobDescription,
        resume,
        selfDescription,
    };
}

module.exports = { invokgeGenAI, generateInterviewReport }
