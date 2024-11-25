import { BaseExtractor, IngestionPipeline, LlamaParseReader, OpenAIEmbedding, SentenceSplitter, SummaryExtractor, VectorStoreIndex, Document } from "llamaindex";
import type { BaseNode, Metadata, TextNode } from "llamaindex";
import { genClauseMetadata, type ClauseMetadata } from "./clause-metadata";
import 'dotenv/config';

const reader = new LlamaParseReader({ 
    resultType: "json",
    verbose: false,
    splitByPage: true,
    fastMode: true,
    parsingInstruction: "The provided file is a legal contract. Please extract and structure all legal clauses, including but not limited to: definitions, obligations, warranties, termination conditions, liability limitations, governing law, and any specific terms and conditions. Pay special attention to key dates, monetary values, party names, and any conditional statements. Maintain the hierarchical relationship between clauses and sub-clauses."
});

// loads a PDF file and returns a list of llama cloud objects (json format), each representing a page of the PDF
export async function createDocuments(filePath: string): Promise<Document<Metadata>[]> {
    const jsonObjs = await reader.loadJson(filePath);
    const jsonList = jsonObjs[0]["pages"];
    return jsonList.map(
        (page: { text: string; page: number }) => new Document({ text: page.text, metadata: { page: page.page } })
    );
}

// extracts clause metadata from a list of llama cloud text nodes
class ClauseExtractor extends BaseExtractor {
    async extract(nodes: TextNode[]): Promise<ClauseMetadata[]> {
    const results = await Promise.all(
        nodes.map(async (node) => await genClauseMetadata(node.text))
    );
    return results;
    }
}

const pipeline = new IngestionPipeline({
    transformations: [
      new SentenceSplitter({ chunkSize: 1024, chunkOverlap: 200 }),
      new ClauseExtractor(),
      new SummaryExtractor(),
      new OpenAIEmbedding(),
    ],
  });


// creates a list of llama cloud nodes from a list of documents using the pipeline
export async function createNodes(documents: Document<Metadata>[]): Promise<BaseNode<Metadata>[]> {
    const nodes = await pipeline.run({ documents: documents });
    return nodes;
}

// creates a vector store index from a list of nodes 
export async function createIndex(nodes: BaseNode<Metadata>[]): Promise<VectorStoreIndex> {
    const index = await VectorStoreIndex.init({ nodes });
    await index.buildIndexFromNodes(nodes);
    return index;
}