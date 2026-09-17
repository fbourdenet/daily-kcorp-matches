import dotenv from "dotenv";

dotenv.config();

// DISCORD (bot gateway : token du bot + salon cible)
export const DISCORD_BOT_TOKEN = process.env.DISCORD_BOT_TOKEN;
export const DISCORD_CHANNEL_ID = process.env.DISCORD_CHANNEL_ID;

// LIQUIPEDIA
// Terms of use: https://liquipedia.net/api-terms-of-use
// - action=parse requests: max 1 per 30 seconds (enforced in liquipedia.ts).
// - The User-Agent must identify the project and include contact information.
export const LIQUIPEDIA_REQUEST_INTERVAL_MS = 30_000;
export const LIQUIPEDIA_USER_AGENT =
	process.env.LIQUIPEDIA_USER_AGENT ??
	"DailyKcMatches/1.0";
export const FETCH_TIMEOUT_MS = 15_000;

/** Wikis Liquipedia disponibles pour les pages d'équipe (segment de l'URL). */
export type LiquipediaGameId =
	| "leagueoflegends"
	| "rocketleague"
	| "valorant"
	| "tft";

export type LiquipediaTeamId =
	| "Karmine_Corp"
	| "Karmine_Corp_Blue"
	| "Karmine_Corp_Blue_Stars"
	| "Karmine_Corp_GC";

export interface LiquipediaTeam {
	teamId: LiquipediaTeamId;
	gameId: LiquipediaGameId;
}

export const TEAMS: LiquipediaTeam[] = [
	{ teamId: "Karmine_Corp", gameId: "leagueoflegends" },
	{ teamId: "Karmine_Corp_Blue", gameId: "leagueoflegends" },
	{ teamId: "Karmine_Corp_Blue_Stars", gameId: "leagueoflegends" },
	{ teamId: "Karmine_Corp", gameId: "rocketleague" },
	{ teamId: "Karmine_Corp", gameId: "valorant" },
	{ teamId: "Karmine_Corp_Blue_Stars", gameId: "valorant" },
	{ teamId: "Karmine_Corp_GC", gameId: "valorant" },
	{ teamId: "Karmine_Corp", gameId: "tft" },
];

// Date to replay a specific day instead of today (format YYYY-MM-DD).
// Interpreted as a Europe/Paris calendar day.
export const REPLAY_DATE: string | null = process.env.REPLAY_DATE || null;
