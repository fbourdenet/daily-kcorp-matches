import dotenv from "dotenv";

dotenv.config();

// DISCORD
export const DISCORD_BOT_TOKEN = process.env.DISCORD_BOT_TOKEN;
export const DISCORD_CHANNEL_ID = process.env.DISCORD_CHANNEL_ID;

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

// Test date for development - set to a specific date to test with future matches
// Format: YYYY-MM-DD (e.g., "2026-01-24")
export const TEST_DATE: string | null = process.env.TEST_DATE || null;
