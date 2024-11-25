## Wilson AI Challenge. 

The challenge was to create an application, within 3 hours,  that extracts relevant legal clauses from a document.

- [Video demo ](https://www.youtube.com/watch?v=z9BvS_vwLMo&feature=youtu.be)

### Tech stack

This app was built in [sveltekit](https://svelte.dev/) and typescript. I used [Llamaindex](https://www.llamaindex.ai/) for parsing the document, and the Chat GPT API for extracting relevant clause data from each chunk. 


### Method

I created my own `ClauseExtractor` class that could be used in the llmaindex ingestion pipeline. The extractor called the ChatGPT API and prompted it to extract relevant data from each chunk.  The output of this was then validated and parsed back to a webpage. All the final data is displayed with navigation routes back to the contract. 

I definitely wish I had some more time on this challenge, having some ideas of different approaches I would be interested to try... see [Issues and Further Thoughts](./issues_faced.md)

### Run locally

To run the app locally go into the `/app` directory and follow the instructions in the `README.md`. Before running locally don't forget to create a `.env` file,  you will need a `LLAMA_CLOUD_API_KEY` and a `OPENAI_API_KEY`.

I bundled all the PDF.js library in with the repo, so there shouldn't be any extra steps to get that work. 

### Main Files To Look At 👀

- `lib/services/llama-cloud.ts` contains all relevant 'llama-index' & 'llama-cloud' code, including the ingestion pipeline for creating nodes using the documents.

- `lib/services/clause-metadata.ts` contains all the prompts used for extracting clause data. 


