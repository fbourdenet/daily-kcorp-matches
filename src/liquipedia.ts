import * as cheerio from "cheerio";
import type { Cheerio } from "cheerio";
import type { Element } from "domhandler";
import {
	FETCH_TIMEOUT_MS,
	LIQUIPEDIA_REQUEST_INTERVAL_MS,
	LIQUIPEDIA_USER_AGENT,
} from "./config";
import { parisDay } from "./match";
import type { Match, Team, Tournament } from "./match";

const BASE_URL = "https://liquipedia.net";

const sleep = (ms: number): Promise<void> =>
	new Promise((resolve) => setTimeout(resolve, ms));

/** Timestamp of the last action=parse request, shared by every call. */
let lastParseRequestAt = 0;

/** Waits so that action=parse requests stay under 1 per 30 seconds (ToS). */
async function waitForRateLimit(): Promise<void> {
	const elapsed = Date.now() - lastParseRequestAt;
	const remaining = LIQUIPEDIA_REQUEST_INTERVAL_MS - elapsed;
	if (lastParseRequestAt > 0 && remaining > 0) {
		await sleep(remaining);
	}
	lastParseRequestAt = Date.now();
}

/**
 * Extracts the rendered HTML from a MediaWiki action=parse JSON payload.
 * Returns null when the payload does not contain it, so callers can throw
 * a meaningful error. Narrowed without type assertions.
 */
function extractParsedHtml(payload: unknown): string | null {
	if (typeof payload !== "object" || payload === null) return null;
	if (!("parse" in payload)) return null;
	const parse: unknown = payload.parse;
	if (typeof parse !== "object" || parse === null) return null;
	if (!("text" in parse)) return null;
	const text: unknown = parse.text;
	if (typeof text !== "object" || text === null) return null;
	if (!("*" in text)) return null;
	const html: unknown = text["*"];
	return typeof html === "string" ? html : null;
}

function getLiquipediaUrl(team: string, game: string): string {
	// section=0 : seul le début de page est renvoyé, là où Liquipedia injecte
	// le widget "Upcoming Matches". ~20x moins de HTML à télécharger/parser.
	return `${BASE_URL}/${game}/api.php?action=parse&page=${team}&format=json&prop=text&section=0`;
}

export interface FetchOptions {
	/** Implémentation de fetch, remplaçable dans les tests. */
	fetchImpl?: typeof fetch;
	/** Hook exécuté avant la requête (utilisé pour le rate limit Liquipedia). */
	beforeAttempt?: () => Promise<void>;
}

/**
 * Exécute un fetch unique vers Liquipedia (aucun retry) et renvoie le JSON
 * de la réponse. Les erreurs réseau et les statuts non-2xx remontent.
 */
export async function fetchLiquipedia(
	url: string,
	options: FetchOptions = {}
): Promise<unknown> {
	const { fetchImpl = fetch, beforeAttempt } = options;

	await beforeAttempt?.();

	const response = await fetchImpl(url, {
		headers: { "User-Agent": LIQUIPEDIA_USER_AGENT },
		signal: AbortSignal.timeout(FETCH_TIMEOUT_MS),
	});

	if (!response.ok) {
		throw new Error(
			`Failed to fetch ${url}: ${response.status} ${response.statusText}`
		);
	}
	return response.json();
}

async function fetchTeamPageHtml(team: string, game: string): Promise<string> {
	const url = getLiquipediaUrl(team, game);

	const payload = await fetchLiquipedia(url, {
		beforeAttempt: waitForRateLimit,
	});

	const htmlContent = extractParsedHtml(payload);
	if (!htmlContent) {
		throw new Error(
			`No content found for page ${team} (${game}). The page may not exist.`
		);
	}
	return htmlContent;
}

/** Resolves a relative URL against Liquipedia; returns null when invalid. */
function toAbsoluteUrl(value: string | undefined): string | null {
	if (!value) return null;
	try {
		return new URL(value, BASE_URL).href;
	} catch {
		return null;
	}
}

function extractTeamsFromOpponentRows(
	matchInfo: Cheerio<Element>
): { teamLeft: Team; teamRight: Team } {
	const rows = matchInfo.find(".match-info-opponent-row");

	const extractTeamFromRow = (row: Cheerio<Element>): Team => {
		const nameElement = row.find(".block-team span.name");
		const linkElement = nameElement.find("a");
		const teamName = (
			linkElement.length > 0 ? linkElement : nameElement
		).text().trim();
		const iconSource = row.find(".team-template-image-icon img").attr("src");

		return {
			name: teamName || "Unknown Team",
			icon: toAbsoluteUrl(iconSource),
		};
	};

	const firstRow = rows.eq(0);
	const secondRow = rows.eq(1);
	const unknownTeam: Team = { name: "Unknown Team", icon: null };

	return {
		teamLeft: firstRow.length > 0 ? extractTeamFromRow(firstRow) : unknownTeam,
		teamRight:
			secondRow.length > 0 ? extractTeamFromRow(secondRow) : unknownTeam,
	};
}

function extractTournamentData(matchInfo: Cheerio<Element>): Tournament {
	const linkElement = matchInfo.find(".match-info-tournament-name a");
	return {
		name: linkElement.text().trim() || "Unknown Tournament",
		link: toAbsoluteUrl(linkElement.attr("href")),
	};
}

function extractDateTime(matchInfo: Cheerio<Element>): string | null {
	const timestamp = matchInfo.find(".timer-object").attr("data-timestamp");
	if (!timestamp || !/^\d+$/.test(timestamp)) return null;
	return new Date(Number(timestamp) * 1000).toISOString();
}

/** True when the date falls on the target Europe/Paris calendar day. */
function isTargetDay(dateTime: string, targetDate: Date): boolean {
	const matchDate = new Date(dateTime);
	if (Number.isNaN(matchDate.getTime())) return false;

	return parisDay(matchDate) === parisDay(targetDate);
}

/**
 * Extracts the matches scheduled on the target Europe/Paris day from the
 * rendered team page HTML. Matches without a usable timestamp are skipped.
 * Pure function: no network, no clock access.
 */
export function parseMatchesFromHtml(
	htmlContent: string,
	game: string,
	targetDate: Date
): Match[] {
	const $ = cheerio.load(htmlContent);
	const matches: Match[] = [];

	$(".carousel .carousel-content .carousel-item").each((_index, item) => {
		const matchInfo = $(item).find(".match-info.match-info--vertical");
		if (matchInfo.length === 0) return;

		const { teamLeft, teamRight } = extractTeamsFromOpponentRows(matchInfo);
		const tournament = extractTournamentData(matchInfo);
		const dateTime = extractDateTime(matchInfo);

		if (dateTime && isTargetDay(dateTime, targetDate)) {
			matches.push({
				teamLeft,
				teamRight,
				tournament,
				dateTime,
				game,
			});
		}
	});

	return matches;
}

/**
 * Fetches the team page and returns its matches for the target
 * Europe/Paris day. Errors propagate to the caller (network failures are
 * never reported as an empty day).
 */
export async function fetchTeamMatches(
	team: string,
	game: string,
	targetDate: Date
): Promise<Match[]> {
	const htmlContent = await fetchTeamPageHtml(team, game);
	return parseMatchesFromHtml(htmlContent, game, targetDate);
}
