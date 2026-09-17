import { DISCORD_BOT_TOKEN, DISCORD_CHANNEL_ID, TEAMS } from "./config";
import { fetchTeamMatches } from "./liquipedia";
import { sendMatchesToDiscord } from "./discord";
import { sortMatchesByDateTime } from "./match";
import type { Match } from "./match";

/**
 * Sends the daily recap: fetches the matches scheduled on `targetDate`
 * (Europe/Paris) for every watched team, then posts the sorted recap
 * to Discord via the gateway bot.
 * All-or-nothing: throws on the first failing team, nothing is sent.
 * The caller owns the exit code and the clock.
 */
export async function sendDailyMatches(targetDate: Date): Promise<void> {
	const dailyMatches: Match[] = [];
	const teams = TEAMS;

	for (const team of teams) {
		const teamMatches = await fetchTeamMatches(team.teamId, team.gameId, targetDate);
		dailyMatches.push(...teamMatches);
	}

	const sortedMatches = sortMatchesByDateTime(dailyMatches);
	await sendMatchesToDiscord(
		sortedMatches,
		DISCORD_BOT_TOKEN,
		DISCORD_CHANNEL_ID
	);
}
