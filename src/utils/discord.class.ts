import {
  Client,
  IntentsBitField,
  EmbedBuilder,
  TextChannel,
} from "discord.js";
import { Match } from "../interfaces/match.interfaces";

export class DiscordBot {
  private client: Client;
  private botToken: string | undefined;
  private channelId: string | undefined;

  constructor(botToken: string | undefined, channelId: string | undefined) {
    this.botToken = botToken;
    this.channelId = channelId;
    this.client = new Client({
      intents: [
        IntentsBitField.Flags.Guilds,
        IntentsBitField.Flags.GuildMessages,
      ],
    });
  }

  private createMatchesEmbed(matches: Match[]): EmbedBuilder {
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
      //const game = match.game; // Remove game

      embed.addFields({
        name: `:clock10: ${dateTime}`,
        value: `${tournament ? ":trophy: " + tournament + "\n" : ""
          }${":crossed_swords: " + teamLeft + " vs " + teamRight}${format ? " (" + format + ")" : ""
          }\n${tournamentLink
            ? ":link: [Bracket link](" + tournamentLink + ")"
            : ""
          }`,
      });
    }

    return embed;
  }

  async startAndSendMatches(matches: Match[]): Promise<void> {
    if (!this.botToken) {
      throw new Error("Discord bot token is not defined.");
    }
    if (!this.channelId) {
      throw new Error("Discord channel ID is not defined.");
    }

    this.client.once("ready", async () => {
      const embed = this.createMatchesEmbed(matches);
      const channel = this.client.channels.cache.get(
        this.channelId as string
      ) as TextChannel;

      if (channel && channel.isTextBased()) {
        await channel.send({ embeds: [embed] });
      } else {
        console.error(
          "Invalid channel or channel is not a text channel:",
          this.channelId
        );
      }

      this.client.destroy();
    });

    try {
      await this.client.login(this.botToken);
    } catch (error) {
      console.error("Failed to login to Discord:", error);
      throw error;
    }
  }
}
