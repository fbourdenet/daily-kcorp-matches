import { EmbedBuilder } from "discord.js";
import { Match } from "../interfaces/interfaces";

export const createMatchesEmbed = (matches: Match[]): EmbedBuilder => {
  const embed = new EmbedBuilder()
    .setTitle("Récap des matchs du jour de la KC")
    .setThumbnail(
      "https://static.wikia.nocookie.net/lolesports_gamepedia_en/images/2/2d/Karmine_Corplogo_square.png/revision/latest?cb=20240319113928"
    )
    .setColor("#0099ff");

  if (matches.length === 0) {
    embed.setDescription("No matches found for today.");
    return embed;
  }

  for (const match of matches) {
    const teamLeft = match.teamLeft.name || "Unknown Team";
    const teamRight = match.teamRight.name || "Unknown Team";
    const tournament = match.tournament.name || "Unknown Tournament";
    const dateTime = match.dateTime
      ? new Date(match.dateTime).toLocaleTimeString("fr-FR", {
          hour: "2-digit",
          minute: "2-digit",
          hour12: false,
        })
      : "Unknown Time";
    const tournamentLink = match.tournament.link || "#";
    const format = match.format || null;
    const game = match.game || "Unknown Game";

    embed.addFields({
      name: `:clock10: ${dateTime}`,
      value: `:video_game: ${game}\n:trophy: ${tournament}\n:crossed_swords: ${teamLeft} vs ${teamRight} ${
        format ? `(${format})` : ""
      }\n:link: [Bracket link](${tournamentLink})`,
    });
  }

  return embed;
};