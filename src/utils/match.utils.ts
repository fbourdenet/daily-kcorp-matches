import { Match } from "../interfaces/match.interfaces";

/**
 * Sorts an array of matches chronologically by their dateTime field.
 * Earlier matches appear first, later matches appear last.
 * Matches with null/undefined dateTime remain in their original position.
 * 
 * Note: This function returns a new sorted array without modifying the original (immutable).
 * 
 * @param matches - Array of matches to sort
 * @returns A new sorted array of matches
 */
export function sortMatchesByDateTime(matches: Match[]): Match[] {
  return [...matches].sort((a, b) => {
    // Handle null/undefined dateTime
    if (!a.dateTime || !b.dateTime) return 0;
    
    const timeA = new Date(a.dateTime).getTime();
    const timeB = new Date(b.dateTime).getTime();
    
    return timeA - timeB; // Ascending order (earliest first)
  });
}
