import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { sortMatchesByDateTime } from "../src/match";
import type { Match } from "../src/match";

const makeMatch = (dateTime: string | null, label: string): Match => ({
	teamLeft: { name: label, icon: null },
	teamRight: { name: "Adversaire", icon: null },
	tournament: { name: null, link: null },
	dateTime,
	game: "leagueoflegends",
});

describe("sortMatchesByDateTime", () => {
	it("trie du plus tôt au plus tard", () => {
		const matches = [
			makeMatch("2026-09-24T18:00:00Z", "soir"),
			makeMatch("2026-09-24T10:00:00Z", "midi"),
			makeMatch("2026-09-24T14:00:00Z", "après-midi"),
		];

		const sorted = sortMatchesByDateTime(matches);
		assert.deepEqual(
			sorted.map((match) => match.teamLeft.name),
			["midi", "après-midi", "soir"]
		);
	});

	it("ne modifie pas le tableau d'origine", () => {
		const matches = [
			makeMatch("2026-09-24T18:00:00Z", "soir"),
			makeMatch("2026-09-24T10:00:00Z", "midi"),
		];

		sortMatchesByDateTime(matches);
		assert.equal(matches[0].teamLeft.name, "soir");
	});

	it("gère les dateTime null sans planter", () => {
		const matches = [
			makeMatch(null, "heure inconnue"),
			makeMatch("2026-09-24T10:00:00Z", "midi"),
		];

		const sorted = sortMatchesByDateTime(matches);
		assert.equal(sorted.length, 2);
	});
});
