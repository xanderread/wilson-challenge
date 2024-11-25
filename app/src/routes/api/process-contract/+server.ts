import { json } from '@sveltejs/kit';
import type { RequestHandler } from '@sveltejs/kit';
import type { PDF } from '$lib/services/file';
import { savePDF } from '$lib/services/file';
import path from 'path';
import { createDocuments, createNodes } from '$lib/services/llama-cloud';
import type { Metadata } from 'llamaindex';
import type { BaseNode } from 'llamaindex';
import type { ClauseResponseData } from '$lib/stores/clause-store';

export const POST: RequestHandler = async ({ request }: { request: Request }) => {
    try {
        // upload the contract file
        const formData = await request.formData();
        const file = formData.get('file');
        
        if (!file || !(file instanceof File)) {
            return new Response('No file uploaded', { status: 400 });
        }

        if (file.type !== 'application/pdf') {
            return new Response('Only PDF files are supported', { status: 400 });
        }
        
        const contractUid = crypto.randomUUID(); 
        const filePath = path.join(process.cwd(), 'src', 'lib', '@uploads', `${contractUid}.pdf`);
        await savePDF(file as PDF, filePath);
        console.log(`Saved contract to disk, uid: ${contractUid}`);

        const documents = await createDocuments(filePath);
        console.log(`Parsed contract to llama cloud documents, uid: ${contractUid}`);

        const nodes = await createNodes(documents);
        console.log(`Created llama cloud nodes from documents, uid: ${contractUid}`);

        // return uuid & clause data 
        return json({ 
            contractUid: contractUid, 
            clauses: nodes.map(llamaCloudNodeToClauseResponseData)
            .filter((clause): clause is ClauseResponseData => clause !== null)
        });
    } catch (error) {
        console.error('Upload error:', error);
        return new Response('Internal server error', { status: 500 });
    }
}; 

/**
 * Converts a LlamaCloud BaseNode to a ClauseResponseData object, 
 * used for mapping data into the correct response format
 */
function llamaCloudNodeToClauseResponseData(node: BaseNode<Metadata>): ClauseResponseData | null {
    if (!node.metadata.clauseExists || node.metadata.clauseType !== 'indemnification' && node.metadata.clauseType !== 'termination' && node.metadata.clauseType !== 'liability') {
        return null;
    }
    return {
        clauseType: node.metadata.clauseType,
        clauseSummary: node.metadata.clauseSummary,
        clauseNumbering: node.metadata.clauseNumbering,
        pageNumber: node.metadata.page,
    }
}   