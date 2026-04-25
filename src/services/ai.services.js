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
                    question: { type: Type.STRING, description: "The interview question" },
                    shortAnswer: { type: Type.STRING, description: "A concise 1-2 sentence answer summary" },
                    detailedAnswer: { type: Type.STRING, description: "A thorough explanation with examples. Plain text only." },
                },
                required: ["question", "shortAnswer", "detailedAnswer"],
            },
        },
        behaviouralQuestions: {
            type: Type.ARRAY,
            items: {
                type: Type.OBJECT,
                properties: {
                    question: { type: Type.STRING, description: "The interview question" },
                    shortAnswer: { type: Type.STRING, description: "A concise 1-2 sentence answer summary" },
                    detailedAnswer: { type: Type.STRING, description: "A thorough STAR-method answer with examples. Plain text only." },
                },
                required: ["question", "shortAnswer", "detailedAnswer"],
            },
        },
        skillGaps: {
            type: Type.ARRAY,
            items: {
                type: Type.OBJECT,
                properties: {
                    skill: { type: Type.STRING, description: "The missing or weak skill" },
                    severity: { type: Type.STRING, description: "Low, Medium, or High" },
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
                        description: "Specific tasks to complete on this day",
                    },
                },
                required: ["day", "focus", "tasks"],
            },
        },
    },
    required: ["matchScore", "summary", "strengths", "weaknesses", "focusAreas", "technicalQuestions", "behaviouralQuestions", "skillGaps", "preparationPlan"],
};

async function generateInterviewReport({ resume, jobDescription, selfDescription }) {

    const prompt = `You are an expert interview coach.

Analyze the candidate's resume, self-description, and the job description.

Return ONLY a valid JSON object.

STRICT RULES:
- Output must be valid JSON only (no markdown, no explanations, no extra text)
- Use double quotes for all keys and strings
- Do not include trailing commas
- Do not include comments
- Do not include undefined or placeholder values
- Keep answers concise and structured

Resume:
${resume}

Self Description:
${selfDescription}

Job Description:
${jobDescription}

REQUIRED JSON STRUCTURE:

{
  "matchScore": number (0-100),
  "summary": string (2-3 sentence assessment),
  "strengths": string[],
  "weaknesses": string[],
  "focusAreas": string[],
  "technicalQuestions": [
    {
      "question": string,
      "shortAnswer": string (1-2 sentences),
      "detailedAnswer": string (thorough with examples)
    }
  ],
  "behaviouralQuestions": [
    {
      "question": string,
      "shortAnswer": string (1-2 sentences),
      "detailedAnswer": string (STAR method with examples)
    }
  ],
  "skillGaps": [
    {
      "skill": string,
      "severity": "Low" | "Medium" | "High"
    }
  ],
  "preparationPlan": [
    {
      "day": number,
      "focus": string,
      "tasks": string[]
    }
  ]
}

Now analyze the input and return ONLY the JSON.`;

    try {
        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: prompt,
            config: {
                responseMimeType: "application/json",
                responseSchema: interviewReportResponseSchema,
            },
        });

        const report = response.output ?? JSON.parse(response.text);
        console.log(JSON.stringify(report, null, 2));
        return {
            ...report,
            jobDescription,
            resume,
            selfDescription,
        };
    } catch (error) {
        if (error.status === 429) {
            throw new Error("Gemini API rate limit exceeded. Please wait and try again.");
        }
        throw error;
    }
}

module.exports = { invokgeGenAI, generateInterviewReport }
