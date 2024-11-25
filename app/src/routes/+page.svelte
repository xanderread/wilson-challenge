<script lang="ts">
    import { FileButton } from '@skeletonlabs/skeleton';
	import { concurrent } from 'svelte-typewriter'
    import { goto } from '$app/navigation';
    import { clauseStore } from '$lib/stores/clause-store';
    import LoadingComponent from '$lib/components/LoadingComponent.svelte';
    
    const TYPEWRITER_ANIMATION_SPEED = 75;

    let loading = false;

    async function handleContractUpload(event: Event) {

        const file = (event.target as HTMLInputElement).files![0];
        
        // Validate is a pdf files
        if (file.type !== 'application/pdf') {
            alert('Please upload a PDF file');
            return;
        }

        loading = true;
        
        try {
            const formData = new FormData();
            formData.append('file', file);
            
            const response = await fetch('/api/process-contract', {
                method: 'POST',
                body: formData
            });

            if (!response.ok) throw new Error('Upload failed');

            // Process uploaded contract 
            const { contractUid, clauses } = await response.json();
            
            // Store the clauses in the store
            clauseStore.set(clauses);

            // Navigate to a new page to show all the legal clauses for the uploaded contract
            await goto(`/legal-clauses/${contractUid}`);
        } catch (error) {
            console.error('Upload error:', error);
            alert('Failed to upload file');
        } finally {
            loading = false;
        }
    }
</script>

<div class="relative container h-screen mx-auto flex justify-center items-center">
	<div class="space-y-5 flex flex-col items-center">
		{#if loading}
			<LoadingComponent/>
		{:else}
			<h1 class="h1">WilsonAI Full-Stack Technical Task</h1>
			<div class="relative h-[24px] w-full flex justify-center">
				<p class="font-bold absolute" use:concurrent={{ interval: TYPEWRITER_ANIMATION_SPEED }}>
					Upload a PDF of a contract to get started.
				</p>
			</div>
			<div class="transition-transform duration-200 hover:scale-110">
				<FileButton 
					name="files" 
					button="btn variant-soft-primary text-xl px-8 py-4"
					accept=".pdf"
					on:change={handleContractUpload}
				>
					Upload
				</FileButton>
			</div>
		{/if}
	</div>
</div>
 