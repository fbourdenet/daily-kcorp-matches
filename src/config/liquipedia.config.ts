export const BASE_URL = "https://liquipedia.net";
// export const WATCHED_TEAMS = ["KC", "KCB", "KCBS"];
export const WATCHED_TEAMS = ["M8"];
export const GAMES = [
  {
    game: "League of Legends",
    url: "https://liquipedia.net/leagueoflegends/api.php?action=parse&format=json&contentmodel=wikitext&maxage=600&smaxage=600&disablelimitreport=true&uselang=content&prop=text&text={{MainPageMatches/Upcoming|filterbuttons-liquipediatier=3|filterbuttons-region=Europe}}",
  },
  {
    game: "League of Legends",
    url: "https://liquipedia.net/leagueoflegends/api.php?action=parse&format=json&contentmodel=wikitext&maxage=600&smaxage=600&disablelimitreport=true&uselang=content&prop=text&text={{MainPageMatches/Upcoming|filterbuttons-liquipediatier=1|filterbuttons-region=Europe}}",
  },
  {
    game: "Valorant",
    url: "https://liquipedia.net/valorant/api.php?action=parse&format=json&contentmodel=wikitext&maxage=600&smaxage=600&disablelimitreport=true&uselang=content&prop=text&text=%7B%7BMainPageMatches%2FUpcoming%7Cfilterbuttons-liquipediatier%3D1%2C2%7Cfilterbuttons-region%3DEurope%7D%7D",
  },
  {
    game: "Rocket League",
    url: "https://liquipedia.net/rocketleague/api.php?action=parse&format=json&contentmodel=wikitext&maxage=600&smaxage=600&disablelimitreport=true&uselang=content&prop=text&text=%7B%7BMainPageMatches%2FUpcoming%7Cfilterbuttons-liquipediatier%3D1%2C2%7Cfilterbuttons-region%3DEurope%7D%7D",
  },
];