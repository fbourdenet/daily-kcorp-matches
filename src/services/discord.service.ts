import { Client, IntentsBitField, EmbedBuilder, TextChannel } from "discord.js";
import { Match } from "../interfaces/interfaces";
import { DISCORD_BOT_TOKEN, DISCORD_CHANNEL_ID } from "../config/discord.config";
import { createMatchesEmbed } from "../utils/utils";

const client = new Client({
  intents: [IntentsBitField.Flags.Guilds, IntentsBitField.Flags.GuildMessages],
});

export const startDiscordBotAndSendMatches = async (matches: Match[]) => {
  client.once("ready", async () => {
    const embed = createMatchesEmbed(matches);
    const channel = client.channels.cache.get(DISCORD_CHANNEL_ID as string) as TextChannel;

    if (channel && channel.isTextBased()) {
      await channel.send({ embeds: [embed] });
    }

    client.destroy();
  });

  await client.login(DISCORD_BOT_TOKEN);
};