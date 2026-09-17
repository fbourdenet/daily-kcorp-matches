import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { parseMatchesFromHtml } from "../src/liquipedia";

// Tests against a frozen snapshot of the Liquipedia team page structure
// (carousel > carousel-item > match-info--vertical). If Liquipedia changes
// its markup, these tests are the ones that fail first.
const REPLAY_DAY = "2026-09-24";
const targetDate = new Date(REPLAY_DAY);
const GAME = "leagueoflegends";

const toUnixSeconds = (isoUtc: string): number =>
	Math.floor(Date.parse(isoUtc) / 1000);

interface CarouselItemOptions {
	timestamp?: number;
	leftName?: string;
	rightName?: string;
	withTimer?: boolean;
}

const carouselItem = (options: CarouselItemOptions = {}): string => {
	const {
		timestamp = toUnixSeconds("2026-09-24T10:00:00Z"),
		leftName = "Karmine Corp",
		rightName = "G2 Esports",
		withTimer = true,
	} = options;

	return `
		<div class="carousel-item">
			<div class="match-info match-info--vertical">
				<div class="match-info-opponent-row">
					<span class="team-template-image-icon">
						<img src="/commons/images/thumb/kc/53px-Karmine_Corp_lightmode.png">
					</span>
					<span class="block-team">
						<span class="name"><a href="/leagueoflegends/Karmine_Corp" title="Karmine Corp">${leftName}</a></span>
					</span>
				</div>
				<div class="match-info-opponent-row">
					<span class="team-template-image-icon">
						<img src="/commons/images/thumb/g2/53px-G2_Esportslogo.png">
					</span>
					<span class="block-team">
						<span class="name"><a href="/leagueoflegends/G2_Esports" title="G2 Esports">${rightName}</a></span>
					</span>
				</div>
				<div class="match-info-tournament-name">
					<a href="/leagueoflegends/LEC/2026/Summer/Playoffs#Playoffs">LEC 2026 Summer Playoffs</a>
				</div>
				${
					withTimer
						? `<span class="timer-object" data-timestamp="${timestamp}">countdown</span>`
						: ""
				}
			</div>
		</div>`;
};

const teamPageHtml = (carouselItems: string): string =>
	`<html><body><div class="carousel"><div class="carousel-content">${carouselItems}</div></div></body></html>`;

const parse = (html: string): ReturnType<typeof parseMatchesFromHtml> =>
	parseMatchesFromHtml(html, GAME, targetDate);

describe("parseMatchesFromHtml", () => {
	it("extrait le match du jour avec ses données complètes", () => {
		const html = teamPageHtml(carouselItem());
		const matches = parse(html);

		assert.equal(matches.length, 1);
		const match = matches[0];
		assert.equal(match.teamLeft.name, "Karmine Corp");
		assert.equal(match.teamRight.name, "G2 Esports");
		assert.equal(match.tournament.name, "LEC 2026 Summer Playoffs");
		assert.equal(match.dateTime, "2026-09-24T10:00:00.000Z");
		assert.equal(match.game, "leagueoflegends");
		assert.equal(
			match.teamLeft.icon,
			"https://liquipedia.net/commons/images/thumb/kc/53px-Karmine_Corp_lightmode.png"
		);
		assert.equal(
			match.tournament.link,
			"https://liquipedia.net/leagueoflegends/LEC/2026/Summer/Playoffs#Playoffs"
		);
	});

	it("compte un match de 00h30 heure de Paris comme jour J (23:30 UTC la veille)", () => {
		const html = teamPageHtml(
			carouselItem({ timestamp: toUnixSeconds("2026-09-23T23:30:00Z") })
		);
		assert.equal(parse(html).length, 1);
	});

	it("exclut un match de 01h00 heure de Paris le lendemain (23:00 UTC le jour J)", () => {
		const html = teamPageHtml(
			carouselItem({ timestamp: toUnixSeconds("2026-09-24T23:00:00Z") })
		);
		assert.equal(parse(html).length, 0);
	});

	it("exclut les matchs des autres jours", () => {
		const html = teamPageHtml(
			carouselItem({ timestamp: toUnixSeconds("2026-09-22T21:00:00Z") }) +
				carouselItem({ timestamp: toUnixSeconds("2026-09-26T15:00:00Z") })
		);
		assert.equal(parse(html).length, 0);
	});

	it("ignore un match sans timer-object", () => {
		const html = teamPageHtml(carouselItem({ withTimer: false }));
		assert.equal(parse(html).length, 0);
	});

	it("lit le nom d'équipe en texte brut quand il n'est pas dans un lien", () => {
		const html = teamPageHtml(
			carouselItem().replace(
				'<a href="/leagueoflegends/G2_Esports" title="G2 Esports">G2 Esports</a>',
				"G2 Esports"
			)
		);
		const matches = parse(html);
		assert.equal(matches.length, 1);
		assert.equal(matches[0].teamRight.name, "G2 Esports");
	});

	it("conserve une URL d'icône déjà absolue", () => {
		const html = teamPageHtml(
			carouselItem().replace(
				"/commons/images/thumb/kc/53px-Karmine_Corp_lightmode.png",
				"https://static.example.com/kc.png"
			)
		);
		const matches = parse(html);
		assert.equal(matches[0].teamLeft.icon, "https://static.example.com/kc.png");
	});

	it("renvoie un tableau vide quand la structure carrousel est absente (autres wikis)", () => {
		const html =
			"<html><body><div class='recent-matches'>aucun carrousel ici</div></body></html>";
		assert.deepEqual(parse(html), []);
	});
});
