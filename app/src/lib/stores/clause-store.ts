import { writable } from 'svelte/store';
import type { ClauseType } from '$lib/services/clause-metadata';

// Clause data returned from the server to the client
export type ClauseResponseData = {
    clauseType: ClauseType;
    clauseSummary: string;
    clauseNumbering: string;
    pageNumber: number;
}

export const clauseStore = writable<ClauseResponseData[]>([]); 