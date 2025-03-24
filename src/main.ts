import {
  DISCORD_BOT_TOKEN,
  DISCORD_CHANNEL_ID,
  WATCHED_TEAMS_GAMES,
} from "./config";
import { DiscordBot } from "./utils/discord.class";
import { LiquipediaScraper } from "./utils/scraper.class";

const main = async () => {

  try {
    const bot = new DiscordBot(DISCORD_BOT_TOKEN, DISCORD_CHANNEL_ID);
    const allMatches = [];

    for (const { team, game } of WATCHED_TEAMS_GAMES) {
      const scraper = new LiquipediaScraper(team, game);
      const matches = await scraper.getUpcomingMatches();

      allMatches.push(...matches);
    }

    await bot.startAndSendMatches(allMatches);
  } catch (error) {
    console.error("Error in main function:", error);
  }
};

main();
