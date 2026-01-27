import {
  DISCORD_BOT_TOKEN,
  DISCORD_CHANNEL_ID,
  WATCHED_TEAMS_GAMES,
  TEST_DATE,
} from "./config";
import { DiscordBot } from "./utils/discord.class";
import { LiquipediaScraper } from "./utils/scraper.class";
import { sortMatchesByDateTime } from "./utils/match.utils";

const main = async () => {

  try {
    const bot = new DiscordBot(DISCORD_BOT_TOKEN, DISCORD_CHANNEL_ID);
    const allMatches = [];

    // Parse test date if provided
    const testDate = TEST_DATE ? new Date(TEST_DATE) : undefined;
    
    if (testDate) {
      console.log(`Running in test mode with date: ${testDate.toDateString()}`);
    }

    for (const { team, game } of WATCHED_TEAMS_GAMES) {
      const scraper = new LiquipediaScraper(team, game, testDate);
      const matches = await scraper.getUpcomingMatches();

      allMatches.push(...matches);
    }

    // Sort matches chronologically (earliest to latest)
    const sortedMatches = sortMatchesByDateTime(allMatches);

    await bot.startAndSendMatches(sortedMatches);
  } catch (error) {
    console.error("Error in main function:", error);
  }
};

main();
