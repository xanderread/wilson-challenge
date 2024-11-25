<script lang="ts">
import { page } from '$app/stores';
import { clauseStore } from '$lib/stores/clause-store';
import PdfViewer from '$lib/components/PdfViewerComponent.svelte';
import ClauseComponent from '$lib/components/ClauseComponent.svelte';

const contractUid = $page.params.contractUid;
const contractUrl = `/api/get-contract/${contractUid}`;

let pdfViewer: PdfViewer;

async function scrollToPage(pageNumber: number) {
    if (pdfViewer) {
        await pdfViewer.scrollToPage(pageNumber);
    }
}
</script>

<div class="h-screen relative w-full flex justify-start pl-4 gap-4">
    <PdfViewer
        url={contractUrl}
        bind:this={pdfViewer}
        />

        <div class="h-screen flex-1 bg-surface-100-800-token p-6 rounded-lg flex flex-col">
            <h2 class="mb-4 text-2xl font-bold">Contract Clauses</h2>

            <div class="flex-1 overflow-hidden">
                <ClauseComponent
                    clauses={$clauseStore}
                    onClauseClick={scrollToPage}
            />
        </div>
    </div>
</div>