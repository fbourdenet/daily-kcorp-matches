import dotenv from "dotenv";

dotenv.config();

// DISCORD
export const DISCORD_BOT_TOKEN = process.env.DISCORD_BOT_TOKEN;
export const DISCORD_CHANNEL_ID = process.env.DISCORD_CHANNEL_ID;

/**
 * Configuration for fetching upcoming matches from Liquipedia's API.
 * Each entry corresponds to a specific team and game, with the API URL
 * to fetch upcoming matches for that team and game.
 */
export const WATCHED_TEAMS_GAMES = [
  {
    team: "Karmine_Corp",
    game: "leagueoflegends",
  },
  {
    team: "Karmine_Corp_Blue",
    game: "leagueoflegends",
  },
  {
    team: "Karmine_Corp_Blue_Stars",
    game: "leagueoflegends",
  },
  {
    team: "Karmine_Corp",
    game: "rocketleague",
  },
  {
    team: "Karmine_Corp",
    game: "valorant",
  },
  {
    team: "Karmine_Corp_Blue_Stars",
    game: "valorant",
  },
  {
    team: "Karmine_Corp_GC",
    game: "valorant",
  },
  {
    team: "Karmine_Corp",
    game: "tft",
  },
];
