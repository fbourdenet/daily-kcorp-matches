import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { createMatchesEmbed, sendMatchesToDiscord } from "../src/discord";
import type { Match } from "../src/match";

const makeMatch = (overrides: Partial<Match> = {}): Match => ({
	teamLeft: { name: "Karmine Corp", icon: null },
	teamRight: { name: "G2 Esports", icon: null },
	tournament: {
		name: "LEC 2026 Summer Playoffs",
		link: "https://liquipedia.net/leagueoflegends/LEC",
	},
	dateTime: "2026-09-24T18:30:00Z",
	game: "leagueoflegends",
	...overrides,
});

describe("createMatchesEmbed", () => {
	it("affiche un message dédié quand aucun match", () => {
		const embed = createMatchesEmbed([]);

		assert.equal(embed.data.description, "Aucun match trouvé pour aujourd'hui.");
		assert.equal(embed.data.fields?.length, 0);
	});

	it("crée un champ par match avec heure, tournoi et lien", () => {
		const embed = createMatchesEmbed([makeMatch()]);
		const field = embed.data.fields?.[0];

		assert.equal(embed.data.fields?.length, 1);
		assert.match(field?.name ?? "", /20:30/); // 18:30 UTC → 20:30 heure de Paris
		assert.match(field?.value ?? "", /Karmine Corp vs G2 Esports/);
		assert.match(field?.value ?? "", /LEC 2026 Summer Playoffs/);
		assert.match(
			field?.value ?? "",
			/\[Bracket link\]\(https:\/\/liquipedia\.net\/leagueoflegends\/LEC\)/
		);
	});

	it("omet le tournoi et le lien quand ils sont absents", () => {
		const embed = createMatchesEmbed([
			makeMatch({ tournament: { name: null, link: null } }),
		]);
		const value = embed.data.fields?.[0]?.value ?? "";

		assert.doesNotMatch(value, /:trophy:/);
		assert.doesNotMatch(value, /Bracket link/);
	});

	it("affiche Heure inconnue quand dateTime est null", () => {
		const embed = createMatchesEmbed([makeMatch({ dateTime: null })]);

		assert.match(embed.data.fields?.[0]?.name ?? "", /Heure inconnue/);
	});

	it("garde l'ordre des matchs donné en entrée", () => {
		const embed = createMatchesEmbed([
			makeMatch({ dateTime: "2026-09-24T10:00:00Z" }),
			makeMatch({ dateTime: "2026-09-24T20:00:00Z" }),
		]);
		const times = embed.data.fields?.map((field) => field.name) ?? [];

		assert.match(times[0] ?? "", /12:00/);
		assert.match(times[1] ?? "", /22:00/);
	});
});

describe("sendMatchesToDiscord", () => {
	it("jette une erreur quand le token est absent", async () => {
		await assert.rejects(
			sendMatchesToDiscord([], undefined, "123"),
			/DISCORD_BOT_TOKEN is not defined/
		);
	});

	it("jette une erreur quand le channel ID est absent", async () => {
		await assert.rejects(
			sendMatchesToDiscord([], "token", undefined),
			/DISCORD_CHANNEL_ID is not defined/
		);
	});
});
