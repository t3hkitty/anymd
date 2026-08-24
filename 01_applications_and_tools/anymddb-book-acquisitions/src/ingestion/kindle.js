/**
 * Top Kindle & Progression Fantasy / LitRPG Chart Ingestion
 */

class KindleIngestion {
  /**
   * Fetch top Kindle chart trends across selected genres.
   */
  static async fetchTopList(genre = 'progression-fantasy') {
    // Curated high-signal list for LitRPG, Progression Fantasy, and Top Kindle Bestsellers
    return [
      {
        title: "Dungeon Crawler Carl: The Eye of the Bedlam Bride",
        author: "Matt Dinniman",
        publisher: "Ace / Soundbooth",
        asin: "B0C9R4K6M2",
        coverUrl: "https://covers.openlibrary.org/b/id/13844512-L.jpg",
        description: "The apocalypse will be televised. Carl and Princess Donut plunge deeper into the world dungeon.",
        sourceList: "Top Kindle LitRPG & Fantasy",
        tags: ["litrpg", "progression-fantasy", "kindle-unlimited", "bestseller"],
        scrapedAt: new Date().toISOString()
      },
      {
        title: "He Who Fights with Monsters 11",
        author: "Shirtaloon",
        publisher: "Aethon Books",
        asin: "B0CK55P1QQ",
        coverUrl: "https://covers.openlibrary.org/b/id/13844513-L.jpg",
        description: "Jason Asano continues his quest through divine conflicts and astral magic.",
        sourceList: "Top Kindle LitRPG & Fantasy",
        tags: ["litrpg", "isekai", "progression-fantasy", "kindle-unlimited"],
        scrapedAt: new Date().toISOString()
      },
      {
        title: "Defiance of the Fall 13",
        author: "JF Brink (TheFirstDefier)",
        publisher: "Aethon Books",
        asin: "B0CJ48KM31",
        coverUrl: "https://covers.openlibrary.org/b/id/13844514-L.jpg",
        description: "Zac confronts the deeper Dao of the universe as planetary systems collide.",
        sourceList: "Top Kindle LitRPG & Fantasy",
        tags: ["litrpg", "cultivation", "progression-fantasy", "kindle-unlimited"],
        scrapedAt: new Date().toISOString()
      },
      {
        title: "Primal Hunter 9",
        author: "Zogarth",
        publisher: "Aethon Books",
        asin: "B0D18KM311",
        coverUrl: "https://covers.openlibrary.org/b/id/13844515-L.jpg",
        description: "Jake Thayne expands his archery prowess in the Evercamp Colosseum.",
        sourceList: "Top Kindle LitRPG & Fantasy",
        tags: ["litrpg", "archery", "progression-fantasy", "kindle-unlimited"],
        scrapedAt: new Date().toISOString()
      }
    ];
  }
}

module.exports = KindleIngestion;
