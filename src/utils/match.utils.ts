import { JSDOM } from "jsdom";
import { Match, Team, Tournament } from "../interfaces/match.interfaces";
import { WATCHED_GAMES, BASE_URL } from "../config";

const ALREADY_FOUND_MATCHES: Match[] = [];

/**
 * Generates a unique identifier for a match.
 * @param {Match} match - The match object.
 * @returns {string} A unique identifier for the match.
 */
const generateMatchIdentifier = (match: Match): string => {
  return `${match.game}-${match.teamLeft.name}-${match.teamRight.name}-${match.dateTime}-${match.tournament.name}`;
};

export const clearAlreadyFoundMatches = () => {
  const today = new Date();
  const matchesToKeep: Match[] = [];

  for (const match of ALREADY_FOUND_MATCHES) {
    if (match.dateTime) {
      const matchDate = new Date(match.dateTime);
      if (
        matchDate.getDate() === today.getDate() &&
        matchDate.getMonth() === today.getMonth() &&
        matchDate.getFullYear() === today.getFullYear()
      ) {
        matchesToKeep.push(match);
      }
    }
  }

  // Replace the original array with the new array
  ALREADY_FOUND_MATCHES.length = 0; // Clear the original array
  ALREADY_FOUND_MATCHES.push(...matchesToKeep); // Add the matches to keep
};

/**
 * Fetches matches for a single watched game.
 * @param {WATCHED_GAME} watchedGame - The watched game configuration.
 * @returns {Promise<Match[]>} A promise that resolves to an array of matches.
 */
const fetchMatchesForGame = async (
  watchedGame: (typeof WATCHED_GAMES)[0]
): Promise<Match[]> => {
  try {
    const response = await fetch(watchedGame.apiUrl);
    if (!response.ok) {
      throw new Error(`Failed to fetch data: ${response.statusText}`);
    }

    const data = await response.json();
    validateApiResponse(data);

    const htmlContent = data.parse.text["*"];
    const extractedMatches = extractMatchesFromHtml(
      htmlContent,
      watchedGame.name,
      watchedGame.team
    );

    return extractedMatches;
  } catch (error) {
    console.error(
      `Error fetching matches for ${watchedGame.team} in ${watchedGame.name}:`,
      error
    );
    return []; // Return an empty array in case of error
  }
};

/**
 * Processes the extracted matches and adds them to the list of matches.
 * @param {Match[]} extractedMatches - The extracted matches.
 * @param {Match[]} matches - The list of matches to add to.
 */
const processExtractedMatches = (
  extractedMatches: Match[],
  matches: Match[]
) => {
  // Avoid duplicates
  const newMatches = extractedMatches.filter((match) => {
    const matchIdentifier = generateMatchIdentifier(match);
    const alreadyFound = ALREADY_FOUND_MATCHES.some(
      (foundMatch) => generateMatchIdentifier(foundMatch) === matchIdentifier
    );

    if (!alreadyFound) {
      ALREADY_FOUND_MATCHES.push(match);
      return true; // Keep the match
    }
    return false; // Skip the match
  });

  matches.push(...newMatches);
};

/**
 * Fetches all matches for the watched teams and games.
 * @returns {Promise<Match[]>} A promise that resolves to an array of matches.
 */
export const fetchAllMatches = async (): Promise<Match[]> => {
  const matches: Match[] = [];

  // clear already found matches from previous days
  clearAlreadyFoundMatches();

  for (const WATCHED_GAME of WATCHED_GAMES) {
    const extractedMatches = await fetchMatchesForGame(WATCHED_GAME);
    processExtractedMatches(extractedMatches, matches);
  }

  return sortMatchesByDate(matches);
};

/**
 * Validates the structure of the API response.
 * @param {any} data - The API response data.
 * @throws {Error} If the response structure is invalid.
 */
const validateApiResponse = (data: any): void => {
  if (!data.parse || !data.parse.text || !data.parse.text["*"]) {
    throw new Error("Invalid API response structure");
  }
};

/**
 * Extracts matches from the HTML content.
 * @param {string} html - The HTML content.
 * @param {string} gameName - The name of the game.
 * @param {string} watchedTeam - The team to filter matches for.
 * @returns {Match[]} An array of matches.
 */
const extractMatchesFromHtml = (
  html: string,
  gameName: string,
  watchedTeam: string
): Match[] => {
  const dom = new JSDOM(html);
  const document = dom.window.document;
  const matches: Match[] = [];

  const matchElements = document.querySelectorAll(".match");
  matchElements.forEach((matchElement) => {
    const teamLeft = extractTeamData(matchElement, ".team-left");
    const teamRight = extractTeamData(matchElement, ".team-right");
    const tournament = extractTournamentData(matchElement);
    const dateTime = extractDateTime(matchElement);
    const format = extractMatchFormat(matchElement);

    if (isTeamInMatch(teamLeft.name, teamRight.name, watchedTeam)) {
      matches.push({
        teamLeft,
        teamRight,
        tournament,
        dateTime,
        format,
        game: gameName,
      });
    }
  });

  return matches;
};

/**
 * Extracts team data from a match element.
 * @param {Element} matchElement - The match element.
 * @param {string} selector - The CSS selector for the team.
 * @returns {Team} The team data.
 */
const extractTeamData = (matchElement: Element, selector: string): Team => {
  const teamElement = matchElement.querySelector(
    `${selector} .team-template-text a`
  );
  const iconElement = matchElement.querySelector(
    `${selector} .team-template-image-icon img`
  );

  return {
    name: teamElement?.textContent?.trim() || "Unknown Team",
    icon: iconElement ? BASE_URL + iconElement.getAttribute("src") : null,
  };
};

/**
 * Extracts tournament data from a match element.
 * @param {Element} matchElement - The match element.
 * @returns {Tournament} The tournament data.
 */
const extractTournamentData = (matchElement: Element): Tournament => {
  const tournamentElement = matchElement.querySelector(".tournament-text a");

  return {
    name: tournamentElement?.textContent?.trim() || "Unknown Tournament",
    link: tournamentElement
      ? BASE_URL + tournamentElement.getAttribute("href")
      : null,
  };
};

/**
 * Extracts the date and time from a match element.
 * @param {Element} matchElement - The match element.
 * @returns {string | null} The ISO string of the date and time, or null if not found.
 */
const extractDateTime = (matchElement: Element): string | null => {
  const timerElement = matchElement.querySelector(".timer-object");
  const timestamp = timerElement?.getAttribute("data-timestamp");

  return timestamp ? new Date(Number(timestamp) * 1000).toISOString() : null;
};

/**
 * Extracts the match format from a match element.
 * @param {Element} matchElement - The match element.
 * @returns {string | null} The match format, or null if not found.
 */
const extractMatchFormat = (matchElement: Element): string | null => {
  const formatElement = matchElement.querySelector(".versus-lower abbr");
  return formatElement?.textContent?.trim().toUpperCase() || null;
};

/**
 * Checks if a team is in the match.
 * @param {string | null} teamLeftName - The name of the left team.
 * @param {string | null} teamRightName - The name of the right team.
 * @param {string} watchedTeam - The team to check for.
 * @returns {boolean} True if the watched team is in the match, otherwise false.
 */
const isTeamInMatch = (
  teamLeftName: string | null,
  teamRightName: string | null,
  watchedTeam: string
): boolean => {
  return teamLeftName === watchedTeam || teamRightName === watchedTeam;
};

/**
 * Sorts matches by date and time.
 * @param {Match[]} matches - The array of matches.
 * @returns {Match[]} The sorted array of matches.
 */
const sortMatchesByDate = (matches: Match[]): Match[] => {
  return matches.sort((a, b) => {
    const dateA = new Date(a.dateTime || 0).getTime();
    const dateB = new Date(b.dateTime || 0).getTime();
    return dateA - dateB;
  });
};

export const match = {
  fetchAllMatches,
  isTeamInMatch,
  extractMatchFormat,
  extractDateTime,
  extractTournamentData,
  extractTeamData,
  extractMatchesFromHtml,
  validateApiResponse,
  sortMatchesByDate,
};
