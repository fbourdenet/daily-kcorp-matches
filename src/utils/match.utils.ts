import { JSDOM } from "jsdom";
import { Match, Team, Tournament } from "../interfaces/match.interfaces";
import { WATCHED_GAMES, BASE_URL } from "../config";

/**
 * Fetches all matches for the watched teams and games.
 * @returns {Promise<Match[]>} A promise that resolves to an array of matches.
 */
export const fetchAllMatches = async (): Promise<Match[]> => {
  const matches: Match[] = [];

  for (const WATCHED_GAME of WATCHED_GAMES) {
    try {
      const response = await fetch(WATCHED_GAME.apiUrl);
      if (!response.ok) {
        throw new Error(`Failed to fetch data: ${response.statusText}`);
      }

      const data = await response.json();
      
      validateApiResponse(data);

      const htmlContent = data.parse.text["*"];
      const extractedMatches = extractMatchesFromHtml(
        htmlContent,
        WATCHED_GAME.name,
        WATCHED_GAME.team
      );
      matches.push(...extractedMatches);
    } catch (error) {
      console.error(
        `Error fetching matches for ${WATCHED_GAME.team} in ${WATCHED_GAME.name}:`,
        error
      );
    }
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

    if (
      isTeamInMatch(teamLeft.name, teamRight.name, watchedTeam) &&
      isMatchToday(dateTime)
    ) {
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
 * Checks if a match is scheduled for today.
 * @param {string | null} dateTime - The ISO string of the match date and time.
 * @returns {boolean} True if the match is today, otherwise false.
 */
const isMatchToday = (dateTime: string | null): boolean => {
  if (!dateTime) return false;

  const matchDate = new Date(dateTime);
  const today = new Date();

  return (
    matchDate.getDate() === today.getDate() &&
    matchDate.getMonth() === today.getMonth() &&
    matchDate.getFullYear() === today.getFullYear()
  );
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
  isMatchToday,
  isTeamInMatch,
  extractMatchFormat,
  extractDateTime,
  extractTournamentData,
  extractTeamData,
  extractMatchesFromHtml,
  validateApiResponse,
  sortMatchesByDate,
};
