import type { Book } from '../types/resonance';

export const SAMPLE_BOOKS: Book[] = [
  {
    id: 'book-crafting-of-chess',
    title: 'The Crafting of Chess',
    author: 'Kit Falbo',
    coverColor: '#0284c7',
    coverImageUrl: 'https://images.unsplash.com/photo-1529699211952-734e80c4d42b?w=600',
    originalImageUrl: 'https://images.unsplash.com/photo-1529699211952-734e80c4d42b?w=1200',
    externalReaderUri: 'file://./Library/The_Crafting_of_Chess.epub',
    totalChapters: 3,
    currentChapterIndex: 0,
    currentParagraphIndex: 1,
    resonanceStream: [
      {
        id: 'res-chess-1',
        timestamp: '2026-08-17T11:00:00Z',
        formattedDate: '2026-08-17',
        progressPercent: 24.5,
        category: 'Mind-Blown / Genius Play',
        presetTier: 'diaper-emergency',
        rawText: 'NATE APPLIED GRANDMASTER CHESS OPENING TACTICS TO LITRPG CARPENTRY CRAFTING! LEVELED UP SKILL BY +15 IN ONE AFTERNOON!',
        cfi: 'epubcfi(/6/4[chap01]!/4/2/4/1:22)',
        chapterTitle: 'Chapter 1: The Pawn’s Opening Move',
        paragraphIndex: 1,
        paragraphSnippet: 'Nate studied the virtual woodworking workbench in Fair Quest. Instead of blindly chopping lumber, he visualized the wood grain as a chessboard grid, calculating 4 moves ahead to minimize waste and maximize item durability.',
        intensityScore: 5,
        emojiReactions: ['🔥', '🤯']
      },
      {
        id: 'res-chess-2',
        timestamp: '2026-08-17T11:35:00Z',
        formattedDate: '2026-08-17',
        progressPercent: 62.1,
        category: 'LitRPG Immersion',
        presetTier: 'snot-cascade',
        rawText: 'THE FAIR QUEST VR UI CRAFTING SYSTEM IS INSANELY CREATIVE. BEST GAMELIT BALANCE EVER.',
        cfi: 'epubcfi(/6/8[chap02]!/4/2/8/1:50)',
        chapterTitle: 'Chapter 2: Crafting in Fair Quest',
        paragraphIndex: 2,
        paragraphSnippet: 'The system message popped up in radiant blue text: [Crafting Mastery Unlocked: Wooden Knight Statuette +25 Defense]. Nate grinned as the local guild master stared in absolute disbelief.',
        intensityScore: 5,
        emojiReactions: ['👑', '💯']
      }
    ],
    sidecarMarkdown: `---
title: "The Crafting of Chess"
author: "Kit Falbo"
asin: "B07P1YRHTX"
amazon_url: "https://www.amazon.com/dp/B07P1YRHTX"
genre: "LitRPG / GameLit"
cover_image: "./media/cover_the_crafting_of_chess.png"
original_uncropped_image: "./media/uncropped_the_crafting_of_chess.jpg"
rel_link_root: "./Library"
webdav_path: "https://uploads.filejump.com/dav/Books/The_Crafting_of_Chess.epub"
external_reader_uri: "file://./Library/The_Crafting_of_Chess.epub"
lc_md_version: "3.8"
tags: [litrpg, crafting, chess, fairquest, kitfalbo, litrpg-gospel]
---

# Companion Sidecar: The Crafting of Chess
- **Author:** Kit Falbo
- **ASIN:** B07P1YRHTX
- **Amazon Store:** [View on Amazon](https://www.amazon.com/dp/B07P1YRHTX)

## Reader Resonance Stream
- **[2026-08-17 | 24.5%] [Category: Mind-Blown / Genius Play]** *NATE APPLIED GRANDMASTER CHESS OPENING TACTICS TO LITRPG CARPENTRY CRAFTING! LEVELED UP SKILL BY +15 IN ONE AFTERNOON!*
- **[2026-08-17 | 62.1%] [Category: LitRPG Immersion]** *THE FAIR QUEST VR UI CRAFTING SYSTEM IS INSANELY CREATIVE. BEST GAMELIT BALANCE EVER.*
`,
    chapters: [
      {
        title: 'Chapter 1: The Pawn’s Opening Move',
        cfiBase: 'epubcfi(/6/4[chap01]!',
        paragraphs: [
          'In the real world, Nate was just another high school teenager struggling to make ends meet and help pay for his family’s rent.',
          'Nate studied the virtual woodworking workbench in Fair Quest. Instead of blindly chopping lumber, he visualized the wood grain as a chessboard grid, calculating 4 moves ahead to minimize waste and maximize item durability.',
          'His grandfather had taught him chess on an old carved mahogany board back home: "Every pawn has the potential to become a queen if you control the diagonal lines."',
          'Nate held the chisel steady as the VR haptic feedback vibrated softly against his fingertips. The wood began to take shape under his deliberate, strategic strokes.'
        ]
      },
      {
        title: 'Chapter 2: Crafting in Fair Quest',
        cfiBase: 'epubcfi(/6/8[chap02]!',
        paragraphs: [
          'The workshop bell chimed as Master Thaddeus walked over, inspecting Nate’s progress.',
          'Instead of standard rough-hewn pine dowels, Nate had carved interlocking dovetail joints with millimeter precision using basic apprentice tools.',
          'The system message popped up in radiant blue text: [Crafting Mastery Unlocked: Wooden Knight Statuette +25 Defense]. Nate grinned as the local guild master stared in absolute disbelief.',
          '"Lad," Thaddeus whispered, adjusting his monocle. "Who taught you how to read wood tension like a battlefield?"'
        ]
      },
      {
        title: 'Chapter 3: The Grandmaster Tournament',
        cfiBase: 'epubcfi(/6/12[chap03]!',
        paragraphs: [
          'News of Nate’s legendary chess-crafted statuettes reached the high council of the Ironfang Citadel.',
          'A formal invitation bearing the wax seal of the Guildmaster was delivered to his workbench.',
          'Nate looked at his current bank balance in the real world—enough for three months of rent. It was time to enter the regional crafting championship.'
        ]
      }
    ]
  },
  {
    id: 'book-scum-villain',
    title: "The Scum Villain's Self-Saving System",
    author: 'Mo Xiang Tong Xiu (MXTX)',
    coverColor: '#9333ea',
    coverImageUrl: 'https://images.unsplash.com/photo-1579783902614-a3fb3927b675?w=600',
    originalImageUrl: 'https://images.unsplash.com/photo-1579783902614-a3fb3927b675?w=1200',
    externalReaderUri: 'file://./Library/Scum_Villains_Self_Saving_System.epub',
    totalChapters: 2,
    currentChapterIndex: 0,
    currentParagraphIndex: 1,
    resonanceStream: [
      {
        id: 'res-sv-1',
        timestamp: '2026-08-17T13:00:00Z',
        formattedDate: '2026-08-17',
        progressPercent: 12.0,
        category: 'BL / Danmei Masterpiece',
        presetTier: 'diaper-emergency',
        rawText: 'SHEN QINGQIU TRYING TO AVOID HIS DOOMED FATE WHILE THE SYSTEM GIVES OOC PENALTIES IS PEAK COMEDY! MXTX\'S TRANSMIGRATION MASTERPIECE!',
        cfi: 'epubcfi(/6/4[chap01]!/4/2/2/1:15)',
        chapterTitle: 'Chapter 1: Transmigrating into a Web Novel Scum Villain',
        paragraphIndex: 1,
        paragraphSnippet: 'Shen Yuan choked on his pork steam bun after finishing the abysmal final chapter of Proud Demon Way. When he opened his eyes, a mechanical electronic voice chimed in his mind: [Welcome to the System. You have successfully activated the character account: Shen Qingqiu].',
        intensityScore: 5,
        emojiReactions: ['🤣', '🌸', '⚔️']
      }
    ],
    sidecarMarkdown: `---
title: "The Scum Villain's Self-Saving System"
author: "Mo Xiang Tong Xiu (MXTX)"
genre: "Danmei / BL (Boys' Love) / Xianxia Transmigration"
cover_image: "./media/cover_scum_villain.png"
original_uncropped_image: "./media/uncropped_scum_villain.jpg"
rel_link_root: "./Library"
webdav_path: "https://uploads.filejump.com/dav/Books/Scum_Villains_Self_Saving_System.epub"
external_reader_uri: "file://./Library/Scum_Villains_Self_Saving_System.epub"
tags: [bl, danmei, scum-villain, mxtx, system-transmigration, xianxia, qingqiu]
---

# Companion Sidecar: The Scum Villain's Self-Saving System
- **Author:** Mo Xiang Tong Xiu (MXTX)
- **Genre:** Danmei / BL (Boys' Love) / Transmigration

## Reader Resonance Stream
- **[2026-08-17 | 12.0%] [Category: BL / Danmei Masterpiece]** *SHEN QINGQIU TRYING TO AVOID HIS DOOMED FATE WHILE THE SYSTEM GIVES OOC PENALTIES IS PEAK COMEDY! MXTX'S TRANSMIGRATION MASTERPIECE!*
`,
    chapters: [
      {
        title: 'Chapter 1: Transmigrating into a Web Novel Scum Villain',
        cfiBase: 'epubcfi(/6/4[chap01]!',
        paragraphs: [
          'Shen Yuan choked on his pork steam bun after finishing the abysmal final chapter of Proud Demon Way. When he opened his eyes, a mechanical electronic voice chimed in his mind: [Welcome to the System. You have successfully activated the character account: Shen Qingqiu].',
          'He realized with a cold wave of dread that he had transmigrated into the villainous peak lord who was destined to be torn apart by his disciple, Luo Binghe.',
          'System prompt: [Default B-Points: 100. Warning: Violating Out of Character (OOC) constraints will result in immediate penalty points!]'
        ]
      },
      {
        title: 'Chapter 2: System Points & OOC Warnings',
        cfiBase: 'epubcfi(/6/8[chap02]!',
        paragraphs: [
          'Shen Qingqiu adjusted his elegant bamboo paper fan, desperately trying to maintain the cold, aloof demeanor of a Cang Qiong Mountain Peak Lord.',
          'System: [OOC warning avoided! +50 B-Points awarded for maintaining protagonist affinity pathways].'
        ]
      }
    ]
  },
  {
    id: 'book-dungeon-crawler-carl',
    title: 'Dungeon Crawler Carl',
    author: 'Matt Dinniman',
    coverColor: '#e11d48',
    coverImageUrl: 'https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?w=600',
    originalImageUrl: 'https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?w=1200',
    externalReaderUri: 'file://./Library/Dungeon_Crawler_Carl.epub',
    totalChapters: 2,
    currentChapterIndex: 0,
    currentParagraphIndex: 1,
    resonanceStream: [
      {
        id: 'res-dcc-1',
        timestamp: '2026-08-17T12:15:00Z',
        formattedDate: '2026-08-17',
        progressPercent: 15.0,
        category: 'LitRPG Gospel / TV Adaptation Hype',
        presetTier: 'diaper-emergency',
        rawText: 'GOD DAMMIT CARL! PRINCESS DONUT DEMANDS HER OWN SPOTLIGHT! THE UPCOMING TV SHOW ADAPTATION IS GOING TO BREAK THE INTERNET!!',
        cfi: 'epubcfi(/6/4[chap01]!/4/2/2/1:10)',
        chapterTitle: 'Chapter 1: The Collapse & The Pink Crocs',
        paragraphIndex: 1,
        paragraphSnippet: 'The entire planet’s infrastructure flattened in an instant. Carl stepped out into the freezing snow in his boxers, leather jacket, and pink crocs, holding his ex-girlfriend’s prize-winning Persian cat, Princess Donut.',
        intensityScore: 5,
        emojiReactions: ['🔥', '🐱', '👑']
      }
    ],
    sidecarMarkdown: `---
title: "Dungeon Crawler Carl"
author: "Matt Dinniman"
litrpg_gospel: true
tv_series_status: "In Development / Upcoming Adaptation"
cover_image: "./media/cover_dungeon_crawler_carl.png"
original_uncropped_image: "./media/uncropped_dungeon_crawler_carl.jpg"
rel_link_root: "./Library"
webdav_path: "https://uploads.filejump.com/dav/Books/Dungeon_Crawler_Carl.epub"
external_reader_uri: "file://./Library/Dungeon_Crawler_Carl.epub"
tags: [litrpg, mattdinniman, princessdonut, dungeon-crawler-carl, litrpg-gospel]
---

# Companion Sidecar: Dungeon Crawler Carl
- **Author:** Matt Dinniman
- **LitRPG Gospel:** Certified Legend
- **TV Series Adaptation:** Upcoming Show Announcement!

## Reader Resonance Stream
- **[2026-08-17 | 15.0%] [Category: LitRPG Gospel / TV Adaptation Hype]** *GOD DAMMIT CARL! PRINCESS DONUT DEMANDS HER OWN SPOTLIGHT! THE UPCOMING TV SHOW ADAPTATION IS GOING TO BREAK THE INTERNET!!*
`,
    chapters: [
      {
        title: 'Chapter 1: The Collapse & The Pink Crocs',
        cfiBase: 'epubcfi(/6/4[chap01]!',
        paragraphs: [
          'It was a cold Tuesday evening in Seattle when the sky cracked open and every roof on Earth collapsed into dust.',
          'Carl stepped out into the freezing snow in his boxers, leather jacket, and pink crocs, holding his ex-girlfriend’s prize-winning Persian cat, Princess Donut.',
          'A booming synthesized voice echoed from the clouds: [Welcome Crawlers to the World Dungeon. Floor 1 is now open for slaughter].',
          'Princess Donut meowed indignantly into Carl’s ear: "Carl! What did you do to the apartment? This carpet is unacceptably damp!"'
        ]
      },
      {
        title: 'Chapter 2: Level 1 of the World Dungeon',
        cfiBase: 'epubcfi(/6/8[chap02]!',
        paragraphs: [
          'Carl stared down the stairs leading into the subterranean dungeon entrance, holding a makeshift spiked club.',
          'The AI system announcer chimed: [New Quest: Survive Floor 1 without losing your footwear].',
          'Carl sighed deeply. "God dammit, Carl," he muttered to himself, stepping into the dark descent.'
        ]
      }
    ]
  },
  {
    id: 'book-station-core',
    title: 'The Station Core',
    author: 'Jonathan Brooks',
    coverColor: '#8b5cf6',
    coverImageUrl: 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=600',
    originalImageUrl: 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=1200',
    externalReaderUri: 'file://./Library/The_Station_Core.epub',
    totalChapters: 2,
    currentChapterIndex: 0,
    currentParagraphIndex: 0,
    resonanceStream: [
      {
        id: 'res-sc-1',
        timestamp: '2026-08-17T12:45:00Z',
        formattedDate: '2026-08-17',
        progressPercent: 20.0,
        category: 'LitRPG Gospel / Dungeon Core',
        presetTier: 'snot-cascade',
        rawText: 'JONATHAN BROOKS’ DUNGEON CORE MECHANICS AND RESOURCE ALLOCATION SYSTEM ARE PURE ENGINEERING GENIUS!',
        cfi: 'epubcfi(/6/4[chap01]!/4/2/2/1:0)',
        chapterTitle: 'Chapter 1: Core Awakening',
        paragraphIndex: 0,
        paragraphSnippet: 'The core orb pulsed with deep violet plasma. Milton awakened to a wave of system notifications detailing energy reserves, mana flow pathways, and spawner room schematics.',
        intensityScore: 5,
        emojiReactions: ['🤯', '⚡', '🚀']
      }
    ],
    sidecarMarkdown: `---
title: "The Station Core"
author: "Jonathan Brooks"
litrpg_gospel: true
genre: "Dungeon Core / LitRPG"
cover_image: "./media/cover_the_station_core.png"
original_uncropped_image: "./media/uncropped_the_station_core.jpg"
rel_link_root: "./Library"
webdav_path: "https://uploads.filejump.com/dav/Books/The_Station_Core.epub"
external_reader_uri: "file://./Library/The_Station_Core.epub"
tags: [litrpg, jonathanbrooks, dungeoncore, stationcore, litrpg-gospel]
---

# Companion Sidecar: The Station Core
- **Author:** Jonathan Brooks
- **LitRPG Gospel:** Certified Legend

## Reader Resonance Stream
- **[2026-08-17 | 20.0%] [Category: LitRPG Gospel / Dungeon Core]** *JONATHAN BROOKS’ DUNGEON CORE MECHANICS AND RESOURCE ALLOCATION SYSTEM ARE PURE ENGINEERING GENIUS!*
`,
    chapters: [
      {
        title: 'Chapter 1: Core Awakening',
        cfiBase: 'epubcfi(/6/4[chap01]!',
        paragraphs: [
          'The core orb pulsed with deep violet plasma. Milton awakened to a wave of system notifications detailing energy reserves, mana flow pathways, and spawner room schematics.',
          'As a newly formed Station Core, his survival depended on building intricate defense rooms, deploying combat units, and managing dungeon flux.'
        ]
      },
      {
        title: 'Chapter 2: Building the First Defensive Trap',
        cfiBase: 'epubcfi(/6/8[chap02]!',
        paragraphs: [
          'Milton selected the spawner node, allocating 50 Mana units to spawn his first defender droid unit.',
          'The system confirmed: [Defensive Room Grid 1 Activated].'
        ]
      }
    ]
  },
  {
    id: 'meme-the-dress-2015',
    title: 'The Dress (#TheDress: Black & Blue vs. White & Gold)',
    author: 'Tumblr Viral Archive / Cecilia Bleasdale (2015)',
    coverColor: '#1e3a8a',
    coverImageUrl: 'https://images.unsplash.com/photo-1539109136881-3be0616acf4b?w=600',
    originalImageUrl: 'https://images.unsplash.com/photo-1539109136881-3be0616acf4b?w=1200',
    externalReaderUri: 'file://./Collectibles/The_Dress_2015.dcmd',
    totalChapters: 3,
    currentChapterIndex: 0,
    currentParagraphIndex: 0,
    isWebPresenceOnly: false,
    tradeValueUsd: 0.01,
    isAvailableForTrade: true,
    resonanceStream: [
      {
        id: 'res-dress-1',
        timestamp: '2026-08-17T13:00:00Z',
        formattedDate: '2026-08-17',
        progressPercent: 33.3,
        category: 'Viral Internet History / Optical Illusion',
        presetTier: 'snot-cascade',
        rawText: 'THE DRESS IS 100% BLACK AND BLUE! WHY IS EVERYONE IN MY OFFICE SWEARING IT IS WHITE AND GOLD?! WE ARE NEARLY AT BLOWS OVER THIS.',
        cfi: 'meme://the-dress/chapter1',
        chapterTitle: 'Chapter 1: The Great Internet Division of February 26, 2015',
        paragraphIndex: 1,
        paragraphSnippet: 'On February 26, 2015, a washed-out photograph of a Roman Originals lace bodycon dress was posted to Tumblr. Within hours, over 10 million tweets ignited what scientists dubbed the greatest chromatic perception dispute in modern cognitive history.',
        intensityScore: 5,
        emojiReactions: ['👗', '💀', '😱']
      },
      {
        id: 'res-dress-2',
        timestamp: '2026-08-17T13:30:00Z',
        formattedDate: '2026-08-17',
        progressPercent: 100.0,
        category: 'Chromatic Adaptation & Neuroscience',
        presetTier: 'diaper-emergency',
        rawText: 'NEUROSCIENTISTS CONFIRMED: ILLUMINATION DISCOUNTING IN THE HUMAN VISUAL CORTEX CAUSES WHITE/GOLD PERCEPTION IN MORNING LIGHT AND BLACK/BLUE IN ARTIFICIAL LIGHT!',
        cfi: 'meme://the-dress/chapter2',
        chapterTitle: 'Chapter 2: The Science of Chromatic Discounting',
        paragraphIndex: 2,
        paragraphSnippet: 'Neuroscientists at NYU and MIT discovered that brains assuming warm indoor incandescent lighting saw black and blue, while brains assuming cool daylight shadows discounted the blue and saw white and gold.',
        intensityScore: 5,
        emojiReactions: ['🤯', '✨']
      }
    ],
    sidecarMarkdown: `---
title: "The Dress (#TheDress: Black & Blue vs. White & Gold)"
originator: "Cecilia Bleasdale & Caitlin McNeill"
year: "2015"
format: "dcmd/meme-collectible"
optical_type: "Chromatic Adaptation Illusion"
canonical_color: "Royal Blue & Black (Roman Originals)"
perceived_color_a: "White & Gold (Daylight Assumption)"
perceived_color_b: "Black & Blue (Artificial Light Assumption)"
cover_image: "./media/cover_the_dress.png"
original_uncropped_image: "./media/uncropped_the_dress.jpg"
rel_link_root: "./Collectibles"
external_reader_uri: "file://./Collectibles/The_Dress_2015.dcmd"
fair_trade_valuation_usd: "0.01"
available_for_trade: true
tags: [meme, viral-history, the-dress, optical-illusion, internet-folklore, pop-culture, black-and-blue, white-and-gold]
---

# 👗 Companion Sidecar: The Dress (#TheDress)

> [!abstract] Viral Meme Artifact &bull; 2015 Internet Phenomenon [ZK: \`20150226-THEDRESS\`]
> **Canonical Reality:** Royal Blue with Black Lace (Roman Originals #7097)
> **The Great Debate:** \`Black & Blue\` vs \`White & Gold\`
> **Cultural Impact:** Over 10M tweets in 24 hours &bull; Scientific papers in *Current Biology*

---

## 🎨 Optical & Neuroscientific Breakdown
- **Chromatic Adaptation:** The brain attempts to discount the ambient illuminant to determine true surface reflectance.
- **The "Overexposed" Backlight:** The overexposed washed-out background led early morning risers to infer cool daylight (perceiving White/Gold), while night owls inferred indoor incandescent lighting (perceiving Black/Blue).

---

## 🗣️ The Great Social Feud
- **Team White & Gold:** *"It's literally shimmering white satin with metallic gold fringe!"*
- **Team Black & Blue:** *"Are you all blind?! It is deep royal blue with pitch black lace!"*

---
*Cataloged in Sovereign Library Companion MD as a Masterpiece Internet Collectible.*
`,
    chapters: [
      {
        title: 'Chapter 1: The Great Internet Division of February 26, 2015',
        cfiBase: 'meme://the-dress/ch1',
        paragraphs: [
          'On February 26, 2015, a washed-out photograph of a Roman Originals lace bodycon dress was posted to Tumblr by musician Caitlin McNeill after her friends could not agree on its true color for an upcoming Scottish wedding.',
          'Within hours, the post escaped Tumblr and detonated across Twitter, Reddit, BuzzFeed, and global evening news broadcasts, generating over 10 million tweets and causing server load spikes across the internet.',
          'Celebrities took sides: Taylor Swift tweeted "I think somehow you\'re tricking me and I\'m confused and scared. PS it\'s OBVIOUSLY BLUE AND BLACK," while Kim Kardashian debated Kanye West over white and gold.'
        ]
      },
      {
        title: 'Chapter 2: The Science of Chromatic Discounting',
        cfiBase: 'meme://the-dress/ch2',
        paragraphs: [
          'Neuroscientists at NYU, MIT, and Oxford conducted controlled laboratory experiments on thousands of human subjects.',
          'The phenomenon was caused by chromatic adaptation and color constancy: the human visual system continually adjusts its perception based on inferred lighting conditions.',
          'When the visual cortex assumes the photo was taken under cool blue daylight shadows, it subtracts blue light from the image, leaving the viewer perceiving white and gold.',
          'When the brain assumes warm indoor tungsten or yellow incandescent lighting, it subtracts the yellow-red spectrum, perceiving the garment as blue and black.'
        ]
      },
      {
        title: 'Chapter 3: Canonical Truth & Cultural Legacy',
        cfiBase: 'meme://the-dress/ch3',
        paragraphs: [
          'Roman Originals, the British clothing retailer that manufactured the garment, officially confirmed the dress was indeed Royal Blue with Black Lace (Product Code: 7097).',
          'Sales of the dress surged by 3,000% within 30 minutes, selling out its worldwide inventory.',
          'Today, #TheDress stands as the defining monument of viral perceptual illusions and a foundational artifact of internet folklore.'
        ]
      }
    ]
  },
  {
    id: 'meme-doge-kabosu',
    title: 'Doge (Kabosu the Shiba Inu — Much Wow)',
    author: 'Atsuko Sato / Internet Folklore (2010)',
    coverColor: '#eab308',
    coverImageUrl: 'https://images.unsplash.com/photo-1583511655857-d19b40a7a54e?w=600',
    originalImageUrl: 'https://images.unsplash.com/photo-1583511655857-d19b40a7a54e?w=1200',
    externalReaderUri: 'file://./Collectibles/Doge_Kabosu.dcmd',
    totalChapters: 2,
    currentChapterIndex: 0,
    currentParagraphIndex: 0,
    isWebPresenceOnly: false,
    tradeValueUsd: 0.01,
    isAvailableForTrade: true,
    resonanceStream: [
      {
        id: 'res-doge-1',
        timestamp: '2026-08-17T14:00:00Z',
        formattedDate: '2026-08-17',
        progressPercent: 50.0,
        category: 'Internet Folklore & Sovereign Memes',
        presetTier: 'snot-cascade',
        rawText: 'SUCH MEME. VERY SOVEREIGN. MUCH WOW. 100% WHOLESOME ENERGY.',
        cfi: 'meme://doge/chapter1',
        chapterTitle: 'Chapter 1: The Paws of Destiny',
        paragraphIndex: 0,
        paragraphSnippet: 'In 2010, kindergarten teacher Atsuko Sato posted a photo of her rescue Shiba Inu, Kabosu, sitting on a couch with paws crossed and side-eye eyebrows raised.',
        intensityScore: 5,
        emojiReactions: ['🐕', '💖', '👑']
      }
    ],
    sidecarMarkdown: `---
title: "Doge (Kabosu the Shiba Inu — Much Wow)"
originator: "Atsuko Sato"
year: "2010"
format: "dcmd/meme-collectible"
doge_lore: "Much Wow &bull; Very Sovereign &bull; Such Companion"
cover_image: "./media/cover_doge_kabosu.png"
original_uncropped_image: "./media/uncropped_doge_kabosu.jpg"
rel_link_root: "./Collectibles"
external_reader_uri: "file://./Collectibles/Doge_Kabosu.dcmd"
fair_trade_valuation_usd: "0.01"
available_for_trade: true
tags: [meme, doge, kabosu, shiba-inu, much-wow, internet-folklore, crypto-lore]
---

# 🐕 Companion Sidecar: Doge (Kabosu)

> [!abstract] The Patron Saint of Wholesome Memes [ZK: \`20100223-KABOSU\`]
> **Subject:** Kabosu the Japanese Shiba Inu
> **Catchphrase:** \`Much Wow. Very Sovereign. Such Sidecar.\`
> **Impact:** Inspired global memes, charity fundraisers, and decentralized Dogecoin.

---
*Cataloged in Sovereign Library Companion MD with infinite respect for Kabosu.*
`,
    chapters: [
      {
        title: 'Chapter 1: The Paws of Destiny',
        cfiBase: 'meme://doge/ch1',
        paragraphs: [
          'In 2010, Japanese kindergarten teacher Atsuko Sato posted photos of her rescued Shiba Inu, Kabosu, relaxing on her living room couch with crossed paws and an iconic side-eye expression.',
          'Internet users paired the photograph with internal monologue captions written in Comic Sans font: "such cool", "amaze", "much wow", "very reading".',
          'The meme became the bedrock of 2010s wholesome internet culture, celebrating kindness and joy across the globe.'
        ]
      }
    ]
  }
];
