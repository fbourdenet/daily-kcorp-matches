import dotenv from "dotenv";

dotenv.config();

// DISCORD
export const DISCORD_BOT_TOKEN = process.env.DISCORD_BOT_TOKEN;
export const DISCORD_CHANNEL_ID = process.env.DISCORD_CHANNEL_ID;

// LIQUIPEDIA
export const BASE_URL = "https://liquipedia.net";

/**
 * Configuration for fetching upcoming matches from Liquipedia's API.
 * Each entry corresponds to a specific team and game, with the API URL
 * to fetch upcoming matches for that team and game.
 */
export const WATCHED_GAMES = [
  {
    team: "KCBS",
    name: "League of Legends",
    apiUrl:
      "https://liquipedia.net/leagueoflegends/api.php?action=parse&format=json&contentmodel=wikitext&maxage=600&smaxage=600&disablelimitreport=true&uselang=content&prop=text&text={{MainPageMatches/Upcoming|filterbuttons-liquipediatier=4|filterbuttons-region=Europe}}",
  },
  {
    team: "KCB",
    name: "League of Legends",
    apiUrl:
      "https://liquipedia.net/leagueoflegends/api.php?action=parse&format=json&contentmodel=wikitext&disablelimitreport=true&uselang=content&prop=text&text={{MainPageMatches/Upcoming|filterbuttons-liquipediatier=3|filterbuttons-region=Europe}}",
  },
  {
    team: "KC",
    name: "League of Legends",
    apiUrl:
      "https://liquipedia.net/leagueoflegends/api.php?action=parse&format=json&contentmodel=wikitext&disablelimitreport=true&uselang=content&prop=text&text={{MainPageMatches/Upcoming|filterbuttons-liquipediatier=1|filterbuttons-region=Europe}}",
  },
  {
    team: "KC",
    name: "Valorant",
    apiUrl:
      "https://liquipedia.net/valorant/api.php?action=parse&format=json&contentmodel=wikitext&&disablelimitreport=true&uselang=content&prop=text&text={{MainPageMatches/Upcoming|filterbuttons-liquipediatier=1,2|filterbuttons-region=Europe}}",
  },
  {
    team: "KCBS",
    name: "Valorant",
    apiUrl:
      "https://liquipedia.net/valorant/api.php?action=parse&format=json&contentmodel=wikitext&disablelimitreport=true&uselang=content&prop=text&text={{MainPageMatches/Upcoming|filterbuttons-liquipediatier=3|filterbuttons-region=Europe}}",
  },
  {
    team: "KC",
    name: "Rocket League",
    apiUrl:
      "https://liquipedia.net/rocketleague/api.php?action=parse&format=json&contentmodel=wikitext&disablelimitreport=true&uselang=content&prop=text&text={{MainPageMatches/Upcoming|filterbuttons-liquipediatier=1,2|filterbuttons-region=Europe}}",
  },
];
