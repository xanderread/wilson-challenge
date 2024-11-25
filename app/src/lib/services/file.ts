import { writeFile } from "fs/promises";

export type PDF = File & {
    type: 'application/pdf';
};

// saves a PDF file to the given file path
export async function savePDF(file:PDF, filePath: string) {
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    await writeFile(filePath, buffer);
    return filePath;
}


