import { JSDOM } from "jsdom";
import { Match, Team, Tournament } from "../interfaces/match.interfaces";
import { WATCHED_GAMES, WATCHED_TEAMS, BASE_URL } from "../config";

export const fetchAllMatches = async (): Promise<Match[]> => {
  const matches: Match[] = [];

  for (const { game, url } of WATCHED_GAMES) {
    try {
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error(`Failed to fetch data: ${response.statusText}`);
      }

      const data = await response.json();
      validateApiResponse(data);

      const htmlContent = data.parse.text["*"];
      const extractedMatches = extractMatches(htmlContent, game);
      matches.push(...extractedMatches);
    } catch (error) {
      console.error(`Error fetching matches from ${url}:`, error);
    }
  }

  matches.sort((a, b) => {
    const dateA = new Date(a.dateTime || 0).getTime();
    const dateB = new Date(b.dateTime || 0).getTime();
    return dateA - dateB;
  });

  return matches;
};

const validateApiResponse = (data: any): void => {
  if (!data.parse || !data.parse.text || !data.parse.text["*"]) {
    throw new Error("Invalid response structure");
  }
};

const extractMatches = (html: string, gameName: string): Match[] => {
  const dom = new JSDOM(html);
  const document = dom.window.document;
  const matches: Match[] = [];

  const matchElements = document.querySelectorAll(".match");
  matchElements.forEach((match) => {
    const teamLeft = extractTeamData(match, ".team-left");
    const teamRight = extractTeamData(match, ".team-right");
    const tournament = extractTournamentData(match);
    const dateTime = extractDateTime(match);
    const format = extractMatchFormat(match);

    if (
      isTeamInMatch(teamLeft.name, teamRight.name) &&
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

const extractTeamData = (match: Element, selector: string): Team => {
  const teamElement = match.querySelector(`${selector} .team-template-text a`);
  const iconElement = match.querySelector(
    `${selector} .team-template-image-icon img`
  );

  return {
    name: teamElement
      ? teamElement.textContent || "Unknown Team"
      : "Unknown Team",
    icon: iconElement ? BASE_URL + iconElement.getAttribute("src") : null,
  };
};

const extractTournamentData = (match: Element): Tournament => {
  const tournamentElement = match.querySelector(".tournament-text a");

  return {
    name: tournamentElement
      ? tournamentElement.textContent || "Unknown Tournament"
      : "Unknown Tournament",
    link: tournamentElement
      ? BASE_URL + tournamentElement.getAttribute("href")
      : null,
  };
};

const extractDateTime = (match: Element): string | null => {
  const timerElement = match.querySelector(".timer-object");
  const timestamp = timerElement
    ? timerElement.getAttribute("data-timestamp")
    : null;

  return timestamp ? new Date(Number(timestamp) * 1000).toISOString() : null;
};

const extractMatchFormat = (match: Element): string | null => {
  const formatElement = match.querySelector(".versus-lower abbr");
  return formatElement
    ? formatElement.textContent?.trim().toUpperCase() || null
    : null;
};

const isTeamInMatch = (
  teamLeftName: string | null,
  teamRightName: string | null
): boolean => {
  return WATCHED_TEAMS.some(
    (name) => teamLeftName === name || teamRightName === name
  );
};

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

export const match = {
  fetchAllMatches,
  isMatchToday,
  isTeamInMatch,
  extractMatchFormat,
  extractDateTime,
  extractTournamentData,
  extractTeamData,
  extractMatches,
  validateApiResponse,
};
