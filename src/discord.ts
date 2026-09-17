import {
	Client,
	EmbedBuilder,
	GatewayIntentBits,
} from "discord.js";
import type { Match } from "./match";
import { parisTime } from "./match";

const KC_THUMBNAIL_URL =
	"https://static.wikia.nocookie.net/lolesports_gamepedia_en/images/2/2d/Karmine_Corplogo_square.png/revision/latest?cb=20240319113928";

/** Builds the embed payload for the daily recap. Works with the bot gateway. */
export const createMatchesEmbed = (matches: Match[]): EmbedBuilder => {
	const embed = new EmbedBuilder()
		.setTitle("Récap des matchs du jour de la KC")
		.setColor(0x0099ff)
		.setThumbnail(KC_THUMBNAIL_URL)
		.setFields([]);

	if (matches.length === 0) {
		embed.setDescription("Aucun match trouvé pour aujourd'hui.");
		return embed;
	}

	for (const match of matches) {
		const teamLeft = match.teamLeft.name || "UNK";
		const teamRight = match.teamRight.name || "UNK";
		const tournament = match.tournament.name;
		const time = match.dateTime
			? parisTime(new Date(match.dateTime))
			: "Heure inconnue";

		embed.addFields({
			name: `:clock10: ${time}`,
			value:
				(tournament ? ":trophy: " + tournament + "\n" : "") +
				":crossed_swords: " +
				teamLeft +
				" vs " +
				teamRight +
				(match.tournament.link
					? "\n:link: [Bracket link](" + match.tournament.link + ")"
					: ""),
		});
	}

	return embed;
};

/**
 * Sends the daily matches embed through a Discord gateway bot.
 * Logs in, posts to the channel, then destroys the client.
 *
 * @throws when the token or channel ID is missing, when the channel cannot
 *   be found or is not text-based, or when Discord rejects the send.
 */
export async function sendMatchesToDiscord(
	matches: Match[],
	botToken: string | undefined,
	channelId: string | undefined
): Promise<void> {
	if (!botToken) {
		throw new Error("DISCORD_BOT_TOKEN is not defined.");
	}
	if (!channelId) {
		throw new Error("DISCORD_CHANNEL_ID is not defined.");
	}

	const client = new Client({
		intents: [GatewayIntentBits.Guilds],
	});

	try {
		await client.login(botToken);

		const channel = client.channels.cache.get(channelId);
		if (!channel || !channel.isTextBased()) {
			throw new Error(
				`Invalid channel or channel is not a text channel: ${channelId}`
			);
		}

		await channel.send({ embeds: [createMatchesEmbed(matches)] });
	} finally {
		client.destroy();
	}
}
