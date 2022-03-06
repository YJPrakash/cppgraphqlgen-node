export function startService(): void; 

export function stopService(): void; 

/**
 * 
 * @param query 
 * @param variables 
 * @param operationName 
 */
export function fetchQuery(query, variables, operationName): string; 