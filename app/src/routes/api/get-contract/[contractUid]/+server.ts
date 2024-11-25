import { error } from '@sveltejs/kit';
import fs from 'fs/promises';
import path from 'path';

export async function GET({ params }) {
    try {
        const { contractUid } = params;
        
        // Use the contractUid in the path
        const pdfPath = path.join(process.cwd(), 'src', 'lib', '@uploads', `${contractUid}.pdf`);
        
        // Read the PDF file and return it
        const pdfBuffer = await fs.readFile(pdfPath);
        
        const response = new Response(pdfBuffer, {
            headers: {
                'Content-Type': 'application/pdf',
                'Content-Disposition': 'inline; filename="contract.pdf"'
            }
        });

        return response;
    } catch (err) {
        console.error('Error fetching PDF:', err);
        throw error(404, 'PDF not found');
    }
}
