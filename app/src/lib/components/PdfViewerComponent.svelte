<!--
  @component
  PDF Viewer Component
  
  A component that renders and manages PDF documents.
  This took me a while to get working and is a bit of a mess.
  It uses the PDF.js library to render the PDF documents. 
-->

<script lang="ts" context="module">
  declare global {
    interface Window {
      pdfjsLib: any;
    }
  }
</script>

<script lang="ts">
  import type { PDFDocumentProxy } from 'pdfjs-dist';
  import { onMount, createEventDispatcher } from 'svelte';

  // Props
  export let url: string;

  // State
  let pdfDoc: PDFDocumentProxy | null = null;
  let canvasElements: HTMLCanvasElement[] = [];
  let pageCount = 0;
  let pageNum = 1;
  let scale = 1.2;
  let loading = true;
  let error: string | null = null;
  let searchText = '';
  let currentPageTextItems: any[] = [];

  // Rendering state
  let pageRendering = false;
  let pageNumPending: number | null = null;
  let ctx: CanvasRenderingContext2D | null = null;
  let scrollTimeout: NodeJS.Timeout | null = null;

  // on mount, load the PDF document / render the pages
  onMount(async () => {
    try {
      
      const pdfjsLib = window.pdfjsLib;
      pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js';
      
      console.log('Loading PDF document...');
      pdfDoc = await pdfjsLib.getDocument(url).promise;
      if (!pdfDoc) throw new Error('Failed to load PDF');
      pageCount = pdfDoc.numPages;
      console.log(`PDF loaded. Total pages: ${pageCount}`);

      canvasElements = Array(pageCount).fill(null);
      
      for (let i = 1; i <= pageCount; i++) {
        await renderPage(i);
      }
      loading = false;
    } catch (err: any) {
      console.error('Error in onMount:', err);
      error = err.message;
      loading = false;
    }
  });

  // renders a single page of the PDF document
  async function renderPage(num: number) {
    try {
      if (!pdfDoc) throw new Error('PDF document not loaded');
      pageRendering = true;
      const page = await pdfDoc.getPage(num);
      const viewport = page.getViewport({ scale });
      
      // Setup or get existing canvas
      let canvas = canvasElements[num - 1];
      if (!canvas) {
        canvas = document.createElement('canvas');
        canvas.id = `pdf-canvas-${num}`;
        canvas.className = 'pdf-canvas';
        document.getElementById('canvas-container')?.appendChild(canvas);
        canvasElements[num - 1] = canvas;
      }
      
      ctx = canvas.getContext('2d');
      if (!ctx) throw new Error('Failed to get canvas context');
      
      canvas.height = viewport.height;
      canvas.width = viewport.width;
      
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      await page.render({
        canvasContext: ctx,
        viewport: viewport
      }).promise;

      pageRendering = false;
      if (pageNumPending !== null) {
        renderPage(pageNumPending);
        pageNumPending = null;
      }
    } catch (err: any) {
      console.error('Error rendering page:', err);
      error = err.message;
      pageRendering = false;
    }
  }

  // queues a page to be rendered
  function queueRenderPage(num: number) {
    if (pageRendering) {
      pageNumPending = num;
    } else {
      renderPage(num);
    }
  }

  // handles the scroll event to update the current page
  function handleScroll(event: Event) {
    if (scrollTimeout) {
      clearTimeout(scrollTimeout);
    }

    scrollTimeout = setTimeout(() => {
      const container = event.target as HTMLDivElement;
      const currentPosition = container.scrollTop;
      const containerHeight = container.clientHeight;
      const scrollHeight = container.scrollHeight;
      
      const pageHeight = scrollHeight / pageCount;
      const newPage = Math.floor(currentPosition / pageHeight) + 1;
      
      // Only update if we've actually changed pages
      if (newPage !== pageNum && newPage >= 1 && newPage <= pageCount) {
        pageNum = newPage;
        queueRenderPage(pageNum);
      }
    }, 100); // Debounce scroll events
  }

  // scrolls to a specific page
  export async function scrollToPage(pageNumber: number) {
    if (pageNumber < 1 || pageNumber > pageCount) {
      throw new Error(`Invalid page number. Must be between 1 and ${pageCount}`);
    }

    const container = document.getElementById('canvas-container');
    if (container) {
      const pageHeight = container.scrollHeight / pageCount;
      const scrollPosition = (pageNumber - 1) * pageHeight;
      container.scrollTo({
        top: scrollPosition,
        behavior: 'smooth'
      });
      
      // Update current page and render it
      pageNum = pageNumber;
      await renderPage(pageNumber);
    }
  }
</script>

<!-- the main component -->
<div class="pdf-viewer" on:scroll={handleScroll}>
  {#if loading}
    <div class="loading-placeholder">
      {#each Array(3) as _}
        <div class="ghost-page">
          {#each Array(5) as _, i}
            <div class="ghost-line" style="width: {85 + (i * 2)}%" />
          {/each}
        </div>
      {/each}
    </div>
  {/if}

  <div id="canvas-container" class="canvas-container" />
</div>

<style>
  /* llm generated styles */
  .pdf-viewer {
    position: relative;
    width: fit-content;
    margin: 0;
    color: #333;
  }

  .canvas-container {
    height: calc(100vh - 40px);
    overflow-y: auto;
    overflow-x: hidden;
    padding: 20px 0;
  }

  .pdf-canvas {
    display: block;
    height: auto !important;
    margin: 0 auto 20px auto;
  }

  .canvas-container::-webkit-scrollbar {
    width: 8px;
  }

  .canvas-container::-webkit-scrollbar-track {
    background: #f1f1f1;
  }

  .canvas-container::-webkit-scrollbar-thumb {
    background: #888;
    border-radius: 4px;
  }

  .loading-placeholder {
    padding: 20px;
  }

  .ghost-page {
    background: #f8f9fa;
    border-radius: 4px;
    padding: 20px;
    margin: 0 auto 20px;
    width: 595px; /* Standard A4 width at 72 DPI */
    min-height: 842px; /* Standard A4 height at 72 DPI */
    box-shadow: 0 2px 4px rgba(0,0,0,0.1);
  }

  .ghost-line {
    height: 12px;
    background: #eee;
    border-radius: 2px;
    margin: 20px 0;
    animation: pulse 1.5s infinite ease-in-out;
  }

  @keyframes pulse {
    0% { opacity: 0.6; }
    50% { opacity: 1; }
    100% { opacity: 0.6; }
  }
</style>