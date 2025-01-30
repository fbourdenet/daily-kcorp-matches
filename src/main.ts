import { startDiscordBotAndSendMatches } from "./services/discord.service";
import { fetchAllMatches } from "./services/liquipedia.service";


const main = async () => {
  try {
    const matches = await fetchAllMatches();
    await startDiscordBotAndSendMatches(matches);
  } catch (error) {
    console.error("Error in main function:", error);
  }
};

main();