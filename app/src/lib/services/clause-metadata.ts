import { OpenAI } from "llamaindex";
import 'dotenv/config';

// the types of clause that are supported
export type ClauseType = 'indemnification' | 'termination' | 'liability' | 'other';
const SUPPORTED_CLAUSE_TYPES: ClauseType[] = ['indemnification', 'termination', 'liability'];

const CLAUSE_PROMPT_PREFIX = "If the text contains a clause, ";

const METADATA_PROMPTS = {
    clauseExists: `Classify if the text contains a legal clause description - not just a clause reference or mention but a description of the clause - return a boolean (true/false).`,
    clauseType: `${CLAUSE_PROMPT_PREFIX}classify it as one of the following types: ${SUPPORTED_CLAUSE_TYPES.join(', ')}. If it's not one of these types or doesn't contain a clause, classify as 'other'.`,
    clauseNumbering: `${CLAUSE_PROMPT_PREFIX}extract the clause numbering from the text if it exists for example '1.1' or '1' or '1.1.1' or '1.1.1.1' etc. This should only contain numbers and periods and not any text.`,
    clauseSummary: `${CLAUSE_PROMPT_PREFIX}summarize the clause. This summarisation should take the form: This clause outlines.... insert exactly what the clause describes and the main terms of the clause. Be concise but detailed with the main terms. Do not hallucinate.`,
}

const SYSTEM_PROMPT = `You are an expert in-house paralegal. You are given some text from a legal contract. Your job is to classify the text to containing a clause or not, the type of clause if it is a clause and summaries the clause

. \n Generate a valid JSON in the following format: ${JSON.stringify(METADATA_PROMPTS)}`;

const llm = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
    model: "gpt-4o-mini",
    additionalChatOptions: {
        response_format: { type: "json_object" }
    }
});

export interface ClauseMetadata {
    clauseExists: boolean;
    clauseType: ClauseType;
    clauseNumbering: string | null;
    clauseSummary: string;
}

// extracts clause metadata from a string of text using a LLM
// returns a ClauseMetadata object
export async function genClauseMetadata(text: string): Promise<ClauseMetadata> {
    const response = await llm.chat({
        messages: [
            {
                role: "system",
                content: SYSTEM_PROMPT,
            },
            {
                role: "user",
                content: `Here is the text: \n------\n${text}\n------`,
            },
        ],
    });
    const content = response.message.content;
    const parsedData = JSON.parse(typeof content === 'string' ? content : content.toString());
    const clauseData = formatClauseData(parsedData);
    if (!isValidClauseMetadata(clauseData)) {
        console.error('Invalid clause metadata format:', clauseData);
        return {
            clauseExists: false,
            clauseType: 'other',
            clauseNumbering: null,
            clauseSummary: '',
        };
    }
    return clauseData;
}

// formats the clause metadata to ensure consistency in the data format
function formatClauseData(data: ClauseMetadata): ClauseMetadata {
    const formattedData = fieldsToLowerCase(data);
    return {
        ...formattedData,
        clauseNumbering: removeTextFromString(formattedData.clauseNumbering),
    };
}

// converts all the fields of a obj to lowercase
function fieldsToLowerCase(data: any): any {
    return Object.fromEntries(Object.entries(data).map(([key, value]) => [key, typeof value === 'string' ? value.toLowerCase() : value]));
}

// removes any text from a string, only returns numbers and periods
function removeTextFromString(text: string | null): string | null {
    if (!text) return null;
    const cleaned = text.replace(/[^0-9.]/g, '');
    return cleaned.length > 0 ? cleaned : null;
}

/* checks if the clause metadata is valid, ie has a clauseExists field that is a boolean, 
a clauseType field that is a string and is one of the supported clause types or 'other' */
function isValidClauseMetadata(data: any): data is ClauseMetadata {
    return (
        typeof data === 'object' &&
        data !== null &&
        typeof data.clauseExists === 'boolean' &&
        typeof data.clauseType === 'string' &&
        (SUPPORTED_CLAUSE_TYPES.includes(data.clauseType) || data.clauseType === 'other')
    );
}
