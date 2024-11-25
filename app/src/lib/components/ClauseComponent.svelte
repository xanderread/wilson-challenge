<script lang="ts">
  import { Accordion, AccordionItem } from '@skeletonlabs/skeleton';
  import { concurrent } from 'svelte-typewriter';
  import type { ClauseResponseData } from '$lib/stores/clause-store';
  
  export let clauses: Array<ClauseResponseData> = [];
  export let onClauseClick: (pageNumber: number) => void;
  
  const TYPEWRITER_ANIMATION_SPEED = 18;
  
</script>

<!-- Container with dropdown accordians  -->
<div class="h-full overflow-y-auto overscroll-contain">
  <Accordion class="clause-list space-y-2" autocollapse>
    {#each clauses as clause, index}
      <!-- auto-open first item -->
      <AccordionItem 
        open={index === 0} 
        class="!bg-surface-200-700-token"
      >
        <svelte:fragment slot="lead">
          <span class="text-2xl">📄</span>
        </svelte:fragment>

        <svelte:fragment slot="summary">
          <div class="flex items-center gap-2 py-2">
            <span class="text-lg font-bold">{clause.clauseType}</span>
            <!-- Optional clause numbering display -->
            {#if clause.clauseNumbering}
              <span class="text-base font-light italic">
                Page {clause.pageNumber} 
                (<span class="font-bold">{clause.clauseNumbering}</span>)
              </span>
            {/if}
          </div>
        </svelte:fragment>

        <!-- Expandable content -->
        <svelte:fragment slot="content">
          <div class="py-3 px-4">
            <!-- Clause summary with typewriter effect -->
            <p class="text-base font-medium" 
               use:concurrent={{ interval: TYPEWRITER_ANIMATION_SPEED }}>
              {clause.clauseSummary}
            </p>
            
            <button 
              class="btn variant-filled mt-4 w-full"
              on:click={() => onClauseClick(clause.pageNumber)}
            >
              Scroll to page {clause.pageNumber}
            </button>
          </div>
        </svelte:fragment>
      </AccordionItem>
    {/each}
  </Accordion>
</div>


