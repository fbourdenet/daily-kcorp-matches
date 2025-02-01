import { Client, IntentsBitField, EmbedBuilder, TextChannel } from "discord.js";
import { Match } from "../interfaces/match.interfaces";
import { DISCORD_BOT_TOKEN, DISCORD_CHANNEL_ID } from "../config";

const client = new Client({
  intents: [IntentsBitField.Flags.Guilds, IntentsBitField.Flags.GuildMessages],
});

const startBotAndSendMatches = async (matches: Match[]) => {
  client.once("ready", async () => {
    const embed = createMatchesEmbed(matches);
    const channel = client.channels.cache.get(
      DISCORD_CHANNEL_ID as string
    ) as TextChannel;

    if (channel && channel.isTextBased()) {
      await channel.send({ embeds: [embed] });
    }

    client.destroy();
  });

  await client.login(DISCORD_BOT_TOKEN);
};

const createMatchesEmbed = (matches: Match[]): EmbedBuilder => {
  const embed = new EmbedBuilder()
    .setTitle("Récap des matchs du jour de la KC")
    .setThumbnail(
      "https://static.wikia.nocookie.net/lolesports_gamepedia_en/images/2/2d/Karmine_Corplogo_square.png/revision/latest?cb=20240319113928"
    )
    .setColor("#0099ff");

  if (matches.length === 0) {
    embed.setDescription("Aucun match trouvé pour aujourd'hui.");
    return embed;
  }

  for (const match of matches) {
    const teamLeft = match.teamLeft.name || "UNK";
    const teamRight = match.teamRight.name || "UNK";
    const tournament = match.tournament.name || null;
    const dateTime = match.dateTime
      ? new Date(match.dateTime).toLocaleTimeString("fr-FR", {
          hour: "2-digit",
          minute: "2-digit",
          hour12: false,
        })
      : "Heure inconnue";
    const tournamentLink = match.tournament.link || null;
    const format = match.format || null;
    const game = match.game;

    embed.addFields({
      name: `:clock10: ${dateTime}`,
      value: `${":video_game: " + game}\n${
        tournament ? ":trophy: " + tournament + "\n" : ""
      }${":crossed_swords: " + teamLeft + " vs " + teamRight}${
        format ? " (" + format + ")" : ""
      }\n${tournamentLink ? ":link: [Bracket link](" + tournamentLink + ")" : ""}`,
    });
  }

  return embed;
};

export const discord = {
  startBotAndSendMatches,
  createMatchesEmbed,
};
