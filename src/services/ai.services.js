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
            description: "Overall match score 0-100",
        },
        scoreBreakdown: {
            type: Type.OBJECT,
            description: "Breakdown of match score by category",
            properties: {
                technicalSkills: { type: Type.NUMBER, description: "Technical skills match 0-100" },
                experience: { type: Type.NUMBER, description: "Experience level match 0-100" },
                toolsAndFrameworks: { type: Type.NUMBER, description: "Tools and frameworks match 0-100" },
                softSkills: { type: Type.NUMBER, description: "Soft skills and culture fit 0-100" },
            },
            required: ["technicalSkills", "experience", "toolsAndFrameworks", "softSkills"],
        },
        summary: {
            type: Type.STRING,
            description: "A short 2-3 sentence overall assessment in plain text",
        },
        strengths: {
            type: Type.ARRAY,
            items: { type: Type.STRING },
            description: "List of candidate strengths relevant to the job",
        },
        weaknesses: {
            type: Type.ARRAY,
            items: { type: Type.STRING },
            description: "List of candidate weaknesses or concerns for the job",
        },
        focusAreas: {
            type: Type.ARRAY,
            items: { type: Type.STRING },
            description: "Key areas the candidate should prioritize before the interview",
        },
        technicalQuestions: {
            type: Type.ARRAY,
            items: {
                type: Type.OBJECT,
                properties: {
                    id: { type: Type.NUMBER, description: "Sequential question number starting from 1" },
                    topic: { type: Type.STRING, description: "The technical topic this question covers, e.g. React, Node.js, MongoDB" },
                    difficulty: { type: Type.STRING, description: "Question difficulty: Easy, Medium, or Hard" },
                    question: { type: Type.STRING, description: "The interview question" },
                    intention: { type: Type.STRING, description: "Why the interviewer asks this question" },
                    keyPoints: {
                        type: Type.ARRAY,
                        items: { type: Type.STRING },
                        description: "3-5 bullet points that must be covered in the answer",
                    },
                    shortAnswer: { type: Type.STRING, description: "A concise 1-2 sentence answer summary" },
                    detailedAnswer: { type: Type.STRING, description: "A thorough explanation with structure and examples. Plain text only." },
                },
                required: ["id", "topic", "difficulty", "question", "intention", "keyPoints", "shortAnswer", "detailedAnswer"],
            },
        },
        behaviouralQuestions: {
            type: Type.ARRAY,
            items: {
                type: Type.OBJECT,
                properties: {
                    id: { type: Type.NUMBER, description: "Sequential question number starting from 1" },
                    trait: { type: Type.STRING, description: "The trait being assessed, e.g. Leadership, Teamwork, Problem Solving" },
                    question: { type: Type.STRING, description: "The interview question" },
                    intention: { type: Type.STRING, description: "Why the interviewer asks this question" },
                    keyPoints: {
                        type: Type.ARRAY,
                        items: { type: Type.STRING },
                        description: "3-5 bullet points to cover using the STAR method",
                    },
                    shortAnswer: { type: Type.STRING, description: "A concise 1-2 sentence answer summary" },
                    detailedAnswer: { type: Type.STRING, description: "A thorough STAR-method answer with examples. Plain text only." },
                },
                required: ["id", "trait", "question", "intention", "keyPoints", "shortAnswer", "detailedAnswer"],
            },
        },
        skillGaps: {
            type: Type.ARRAY,
            items: {
                type: Type.OBJECT,
                properties: {
                    skill: { type: Type.STRING, description: "The missing or weak skill" },
                    severity: { type: Type.STRING, description: "Low, Medium, or High" },
                    category: { type: Type.STRING, description: "Category: Technical, Tool, Soft Skill, or Process" },
                    reason: { type: Type.STRING, description: "Why this is a gap relative to the job requirements" },
                    suggestion: { type: Type.STRING, description: "A short actionable suggestion to address this gap" },
                },
                required: ["skill", "severity", "category", "reason", "suggestion"],
            },
        },
        preparationPlan: {
            type: Type.ARRAY,
            items: {
                type: Type.OBJECT,
                properties: {
                    day: { type: Type.NUMBER, description: "Day number of the preparation plan" },
                    focus: { type: Type.STRING, description: "The main focus area for this day" },
                    goals: {
                        type: Type.ARRAY,
                        items: { type: Type.STRING },
                        description: "2-3 measurable goals for the day",
                    },
                    tasks: {
                        type: Type.ARRAY,
                        items: { type: Type.STRING },
                        description: "Specific tasks to complete on this day",
                    },
                    resources: {
                        type: Type.ARRAY,
                        items: { type: Type.STRING },
                        description: "Suggested resources like docs, tutorials, or tools",
                    },
                },
                required: ["day", "focus", "goals", "tasks", "resources"],
            },
        },
    },
    required: ["matchScore", "scoreBreakdown", "summary", "strengths", "weaknesses", "focusAreas", "technicalQuestions", "behaviouralQuestions", "skillGaps", "preparationPlan"],
};

async function generateInterviewReport({ resume, jobDescription, selfDescription }) {

    const prompt = `You are an expert interview coach. Analyze the candidate's resume, self-description, and the job description below. Generate a structured interview preparation report as strictly valid JSON.

Resume:
${resume}

Self Description:
${selfDescription}

Job Description:
${jobDescription}

Generate the following:
1. matchScore: Overall match 0-100
2. scoreBreakdown: Scores for technicalSkills, experience, toolsAndFrameworks, softSkills (each 0-100)
3. summary: 2-3 sentence overall assessment
4. strengths: Array of relevant strengths
5. weaknesses: Array of concerns or weak areas
6. focusAreas: Array of priority areas before the interview
7. technicalQuestions: 5-7 questions, each with id (sequential from 1), topic (e.g. React, Node.js), difficulty (Easy/Medium/Hard), question, intention, keyPoints (3-5 bullets to cover), shortAnswer (1-2 sentences), detailedAnswer (thorough with examples)
8. behaviouralQuestions: 3-5 questions, each with id (sequential from 1), trait (e.g. Leadership, Teamwork), question, intention, keyPoints (3-5 STAR bullets), shortAnswer (1-2 sentences), detailedAnswer (STAR method with examples)
9. skillGaps: Each with skill, severity (Low/Medium/High), category (Technical/Tool/Soft Skill/Process), reason, and suggestion (actionable fix)
10. preparationPlan: 5-day plan, each day with day number, focus, goals (2-3 measurable), tasks (specific actions), resources (docs/tutorials/tools)

IMPORTANT: All text must be plain text. No HTML tags. No text outside the JSON object.`;

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
