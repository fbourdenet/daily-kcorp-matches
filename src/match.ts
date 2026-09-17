export interface Team {
	name: string | null;
	icon: string | null;
}

export interface Tournament {
	name: string | null;
	link: string | null;
}

export interface Match {
	teamLeft: Team;
	teamRight: Team;
	tournament: Tournament;
	dateTime: string | null;
	game: string;
}

const PARIS_TIME_ZONE = "Europe/Paris";

const parisDayFormatter = new Intl.DateTimeFormat("en-CA", {
	timeZone: PARIS_TIME_ZONE,
	year: "numeric",
	month: "2-digit",
	day: "2-digit",
});

const parisTimeFormatter = new Intl.DateTimeFormat("fr-FR", {
	timeZone: PARIS_TIME_ZONE,
	hour: "2-digit",
	minute: "2-digit",
	hour12: false,
});

/** Calendar day of a date in Europe/Paris, formatted as "YYYY-MM-DD". */
export function parisDay(date: Date): string {
	return parisDayFormatter.format(date);
}

/** Time of day of a date in Europe/Paris, formatted as "HH:mm". */
export function parisTime(date: Date): string {
	return parisTimeFormatter.format(date);
}

/**
 * Sorts matches chronologically by their dateTime field, earliest first.
 * Matches with null dateTime keep their original relative position.
 * Returns a new array; the input is not modified.
 */
export function sortMatchesByDateTime(matches: Match[]): Match[] {
	return [...matches].sort((a, b) => {
		if (!a.dateTime || !b.dateTime) return 0;
		return Date.parse(a.dateTime) - Date.parse(b.dateTime);
	});
}
