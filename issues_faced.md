## Issues
- LLM not extracting text correctly, from lots of testing its better to just prompt for a as-close-as-possible summarisation output. 
- LLM not responding with correctly formatted JSON, so needed to do some post processing to clean this up - I am sure there are missing checks. 
- Large documents take ages to parse, either need to spin up some threads or dynamically choose a model depending on the size of the document. 
- Clauses that link over multiple pages are difficult to parse, leading to duplicate clause data that really should be together. Increasing the overlap of the RAG chunks didn't help as much as I hoped. Maybe would look at [this](https://docs.llamaindex.ai/en/v0.10.19/api/llama_index.core.schema.NodeRelationship.html).
- Is it possible for clauses to fall under more than one category 🤔

## Further Thoughts
- It looks like most contracts have a preamble - it would be interesting to parse the preamble first - then inject knowledge of the preamble into the LLM when it was extracting the clauses / relevant data. This way it may know what to expect when looking at a Page with 'header 1.2' etc.
- Given some more time I would of couse write lots of tests :) 
