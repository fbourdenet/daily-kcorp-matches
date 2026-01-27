import { JSDOM } from "jsdom";
import { Match, Team, Tournament } from "../interfaces/match.interfaces";

export class LiquipediaScraper {
  private baseUrl: string = "https://liquipedia.net";
  private team: string;
  private game: string;
  private testDate?: Date;

  constructor(team: string, game: string, testDate?: Date) {
    this.team = team;
    this.game = game;
    this.testDate = testDate;
  }

  private getLiquipediaUrl(): string {
    return `${this.baseUrl}/${this.game}/${this.team}`;
  }

  async fetchHtmlContent(): Promise<string> {
    const URL = this.getLiquipediaUrl()

    try {
      const response = await fetch(URL);
      if (!response.ok) {
        throw new Error(`Failed to fetch ${URL}: ${response.statusText}`);
      }
      return response.text();
    } catch (error) {
      console.error(`Error fetching HTML content from ${URL}:`, error);
      throw error;
    }
  }

  extractMatchesFromHtml(
    htmlContent: string
  ): Match[] {
    const dom = new JSDOM(htmlContent);
    const document = dom.window.document;
    const matches: Match[] = [];

    // New carousel-based structure
    const carouselItems = document.querySelectorAll(
      ".carousel .carousel-content .carousel-item"
    );

    carouselItems.forEach((item) => {
      const matchInfo = item.querySelector(".match-info.match-info--vertical");
      if (!matchInfo) return;

      const teams = this.extractTeamsFromOpponentRows(matchInfo);
      const tournament = this.extractTournamentData(matchInfo);
      const dateTime = this.extractDateTime(matchInfo);
      const format = this.extractMatchFormat(matchInfo);

      if (dateTime && this.isMatchToday(dateTime)) {
        matches.push({
          teamLeft: teams.teamLeft,
          teamRight: teams.teamRight,
          tournament,
          dateTime,
          format,
          game: this.game,
        });
      }
    });

    return matches;
  }

  private extractTeamsFromOpponentRows(
    matchInfo: Element
  ): { teamLeft: Team; teamRight: Team } {
    const opponentRows = matchInfo.querySelectorAll(".match-info-opponent-row");

    const extractTeamFromRow = (row: Element): Team => {
      const nameElement = row.querySelector(".block-team span.name");
      const iconElement = row.querySelector(".team-template-image-icon img");

      // Get team name - might be in an <a> tag or just text
      let teamName = "Unknown Team";
      if (nameElement) {
        const linkElement = nameElement.querySelector("a");
        teamName = linkElement
          ? linkElement.textContent?.trim() || "Unknown Team"
          : nameElement.textContent?.trim() || "Unknown Team";
      }

      return {
        name: teamName,
        icon: iconElement ? this.baseUrl + iconElement.getAttribute("src") : null,
      };
    };

    const teamLeft = opponentRows[0] ? extractTeamFromRow(opponentRows[0]) : { name: "Unknown Team", icon: null };
    const teamRight = opponentRows[1] ? extractTeamFromRow(opponentRows[1]) : { name: "Unknown Team", icon: null };

    return { teamLeft, teamRight };
  }

  private extractTournamentData(
    matchInfo: Element
  ): Tournament {
    const tournamentElement = matchInfo.querySelector(
      ".match-info-tournament-name a"
    );

    return {
      name: tournamentElement?.textContent?.trim() || "Unknown Tournament",
      link: tournamentElement
        ? this.baseUrl + tournamentElement.getAttribute("href")
        : null,
    };
  }

  private extractDateTime(matchTable: Element): string | null {
    const timerElement = matchTable.querySelector(".timer-object");
    const timestamp = timerElement?.getAttribute("data-timestamp");

    return timestamp ? new Date(Number(timestamp) * 1000).toISOString() : null;
  }

  private extractMatchFormat(matchInfo: Element): string | null {
    // Format info is not available in the new carousel structure
    return null;
  }

  private isMatchToday(dateTime: string | null): boolean {
    if (!dateTime) return false;

    const matchDate = new Date(dateTime);
    const today = this.testDate || new Date();

    return (
      matchDate.getDate() === today.getDate() &&
      matchDate.getMonth() === today.getMonth() &&
      matchDate.getFullYear() === today.getFullYear()
    );
  }

  async getUpcomingMatches(): Promise<Match[]> {
    try {
      const htmlContent = await this.fetchHtmlContent();
      const matches = this.extractMatchesFromHtml(htmlContent);
      return matches;
    } catch (error) {
      console.error(`Error getting upcoming matches:`, error);
      return [];
    }
  }
}
