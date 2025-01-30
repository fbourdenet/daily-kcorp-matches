import { discord } from "./utils/discord.utils";
import { match } from "./utils/match.utils";

const main = async () => {
  try {
    const matches = await match.fetchAllMatches();
    await discord.startBotAndSendMatches(matches);
  } catch (error) {
    console.error("Error in main function:", error);
  }
};

main();