import { REPLAY_DATE } from "./config";
import { sendDailyMatches } from "./run";

/**
 * Parses REPLAY_DATE (format YYYY-MM-DD) into a Date.
 * Throws on a malformed value instead of silently comparing an invalid day.
 */
function getMatchDate(): Date {
	if (REPLAY_DATE) {
		const date = new Date(REPLAY_DATE);
		if (Number.isNaN(date.getTime())) {
			throw new Error(
				`REPLAY_DATE invalide: "${REPLAY_DATE}" (format attendu YYYY-MM-DD).`
			);
		}
		console.log(`Replay de la journée du ${REPLAY_DATE}`);
		return date;
	}
	return new Date();
}

async function main(): Promise<void> {
	try {
		const date = getMatchDate();
		await sendDailyMatches(date);
	} catch (error) {
		console.error("Erreur dans main:", error);
		process.exitCode = 1;
	}
}

void main();
