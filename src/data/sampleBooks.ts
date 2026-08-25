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
*Cataloged in Meow Library Companion MD as a Masterpiece Internet Collectible.*
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
        category: 'Internet Folklore & Meow Memes',
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
doge_lore: "Much Wow &bull; Very Meow &bull; Such Companion"
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
> **Catchphrase:** \`Much Wow. Very Meow. Such Sidecar.\`
> **Impact:** Inspired global memes, charity fundraisers, and decentralized Dogecoin.

---
*Cataloged in Meow Library Companion MD with infinite respect for Kabosu.*
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
  },
  {
    id: 'album-american-idiot',
    title: 'American Idiot (Punk Rock Opera Album)',
    author: 'Green Day (Billie Joe Armstrong, Mike Dirnt, Tré Cool)',
    coverColor: '#b91c1c',
    coverImageUrl: 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=600',
    originalImageUrl: 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=1200',
    externalReaderUri: 'file://./Music/Green_Day_American_Idiot_2004.dcmd',
    totalChapters: 5,
    currentChapterIndex: 0,
    currentParagraphIndex: 0,
    isWebPresenceOnly: false,
    tradeValueUsd: 18.99,
    isAvailableForTrade: true,
    resonanceStream: [
      {
        id: 'res-album-ai-1',
        timestamp: '2026-08-17T15:00:00Z',
        formattedDate: '2026-08-17',
        progressPercent: 100,
        category: 'Punk Rock Opera / Concept Album',
        presetTier: 'diaper-emergency',
        rawText: 'GREEN DAY CREATED THE GREATEST 2000s PUNK ROCK OPERA OF ALL TIME! EVERY TRACK FLOWS SEAMLESSLY INTO THE NEXT!',
        cfi: 'album://american-idiot/full',
        chapterTitle: 'Album Overview & Liner Notes',
        paragraphIndex: 0,
        paragraphSnippet: 'American Idiot is the seventh studio album by Green Day. Released in September 2004, it tells the sprawling narrative of the Jesus of Suburbia, St. Jimmy, and Whatsername across anthemic power chords.',
        intensityScore: 5,
        emojiReactions: ['🎸', '🔥', '👑', '⚡']
      }
    ],
    sidecarMarkdown: `---
title: "American Idiot (Punk Rock Opera Album)"
artist: "Green Day"
release_year: "2004"
format: "dcmd/music-album-master"
genre: "Punk Rock / Pop Punk / Rock Opera"
cover_image: "./media/cover_american_idiot_album.png"
original_uncropped_image: "./media/uncropped_american_idiot_album.jpg"
rel_link_root: "./Music"
external_reader_uri: "file://./Music/Green_Day_American_Idiot_2004.dcmd"
fair_trade_valuation_usd: "18.99"
available_for_trade: true
tracklist:
  - "[[track-american-idiot|01. American Idiot]]"
  - "[[track-jesus-of-suburbia|02. Jesus of Suburbia]]"
  - "[[track-holiday|03. Holiday]]"
  - "[[track-boulevard-of-broken-dreams|04. Boulevard of Broken Dreams]]"
  - "[[track-wake-me-up-when-september-ends|05. Wake Me Up When September Ends]]"
tags: [music, greenday, american-idiot, punk-rock, album-master, 2000s-rock, rock-opera]
---

# 🎸 Green Day — American Idiot (2004 Master Album)

> [!abstract] Master Rock Opera Album [ZK: \`20040921-GREENDAY-AI\`]
> **Artist:** Green Day &bull; **Producer:** Rob Cavallo
> **Tracks:** 5 Master Tracks &bull; Multi-Platinum Grammy Award Winner
> **Album Concept:** The Odyssey of the Jesus of Suburbia

---

## 🎶 Master Album Track Links
- 🎵 **Track 01:** [[track-american-idiot|American Idiot]] — High-octane political punk anthem.
- 🎵 **Track 02:** [[track-jesus-of-suburbia|Jesus of Suburbia]] — 9-minute 5-part suburban rock symphony.
- 🎵 **Track 03:** [[track-holiday|Holiday]] — Driving bassline & anti-war march.
- 🎵 **Track 04:** [[track-boulevard-of-broken-dreams|Boulevard of Broken Dreams]] — Iconic acoustic ballad & "Ah-loooone" chorus.
- 🎵 **Track 05:** [[track-wake-me-up-when-september-ends|Wake Me Up When September Ends]] — Emotional acoustic tribute.

---
*Cataloged in Meow Library Companion MD as a Masterpiece Concept Album.*
`,
    chapters: [
      {
        title: 'Track 1: American Idiot',
        cfiBase: 'album://ai/track1',
        paragraphs: [
          '"Don\'t wanna be an American idiot! One nation controlled by the media!"',
          'Fast distorted guitar chords in A flat major drive the adrenaline-pumping opening anthem of the album.'
        ]
      },
      {
        title: 'Track 2: Jesus of Suburbia',
        cfiBase: 'album://ai/track2',
        paragraphs: [
          '"I\'m the son of rage and love, the Jesus of Suburbia!"',
          'A multi-movement mini-opera chronicling a teenager\'s disillusionment with suburban strip malls and desolate parking lots.'
        ]
      },
      {
        title: 'Track 3: Holiday',
        cfiBase: 'album://ai/track3',
        paragraphs: [
          '"Hear the sound of the falling rain, coming down like an Armageddon flame!"',
          'Mike Dirnt\'s pulsing bassline leads into an explosive stomping anthem with spoken-word bridge.'
        ]
      },
      {
        title: 'Track 4: Boulevard of Broken Dreams',
        cfiBase: 'album://ai/track4',
        paragraphs: [
          '"I walk a lonely road, the only one that I have ever known. Don\'t know where it goes, but it\'s home to me and I walk alone."',
          'Acoustic tremolo guitar arpeggios build into the legendary stadium chorus: "Ah-loooone! Ah-loooone! I walk alone, I walk a--"'
        ]
      },
      {
        title: 'Track 5: Wake Me Up When September Ends',
        cfiBase: 'album://ai/track5',
        paragraphs: [
          '"Summer has come and passed, the innocent can never last. Wake me up when September ends."',
          'A deeply personal acoustic ballad dedicated to Billie Joe Armstrong\'s father.'
        ]
      }
    ]
  },
  {
    id: 'track-boulevard-of-broken-dreams',
    title: 'Boulevard of Broken Dreams (American Idiot Track 04)',
    author: 'Green Day',
    coverColor: '#1e293b',
    coverImageUrl: 'https://images.unsplash.com/photo-1508700115892-45ecd05ae2ad?w=600',
    originalImageUrl: 'https://images.unsplash.com/photo-1508700115892-45ecd05ae2ad?w=1200',
    externalReaderUri: 'file://./Music/04_Boulevard_of_Broken_Dreams.mp3',
    totalChapters: 2,
    currentChapterIndex: 0,
    currentParagraphIndex: 0,
    isWebPresenceOnly: false,
    tradeValueUsd: 1.29,
    isAvailableForTrade: true,
    resonanceStream: [
      {
        id: 'res-boulevard-kid-1',
        timestamp: '2026-08-17T15:15:00Z',
        formattedDate: '2026-08-17',
        progressPercent: 65.0,
        category: 'Punk Rock Immersion / Live Tweet',
        presetTier: 'diaper-emergency',
        rawText: 'I WALK A LONELY ROAD, THE ONLY ONE THAT I HAVE EVER KNOWN! 🎸 AH-LOOOOOONE! AH-LOOOOOONE! I WALK ALONE, I WALK A--🎸🔥 LIVE TWEETING THE GUITAR SOLO!',
        cfi: 'track://boulevard/chorus',
        chapterTitle: 'Track 04: Boulevard of Broken Dreams (Verse & Chorus)',
        paragraphIndex: 1,
        paragraphSnippet: 'Acoustic tremolo guitar arpeggios build into the legendary stadium chorus: "Ah-loooone! Ah-loooone! I walk alone, I walk a--"',
        intensityScore: 5,
        emojiReactions: ['🎸', '🔥', '⚡', '🖤']
      },
      {
        id: 'res-boulevard-parent-pacman',
        timestamp: '2026-08-17T15:20:00Z',
        formattedDate: '2026-08-17',
        progressPercent: 100.0,
        category: 'Wholesome Retro / Arcade Chomp',
        presetTier: 'diaper-emergency',
        rawText: 'WAKA WAKA WAKA WAKA! 🟡🍒 Ghost chasing fruit eating retro arcade energy! Don\'t walk alone, eat some power pellets and chase the blue ghosts!',
        cfi: 'track://boulevard/solo',
        chapterTitle: 'Track 04: Boulevard of Broken Dreams (Outro Solo)',
        paragraphIndex: 1,
        paragraphSnippet: 'The thunderous guitar distortion crashes in while Billie Joe holds the high vocal harmony.',
        reactionImageUrl: 'https://images.unsplash.com/photo-[REDACTED_PHONE]-9bc0b252726f?w=400',
        reactionGifCaption: 'WAKA WAKA WAKA 🟡🍒 Pac-Man Chasing Ghosts & Eating Fruit!',
        intensityScore: 5,
        emojiReactions: ['🕹️', '🟡', '👻', '🍒', '🤣', '🎸']
      }
    ],
    sidecarMarkdown: `---
title: "Boulevard of Broken Dreams (American Idiot Track 04)"
artist: "Green Day"
parent_album: "[[album-american-idiot|American Idiot (Album)]]"
track_number: 4
duration: "4:20"
bpm: 84
format: "dcmd/song-track-sidecar"
cover_image: "./media/cover_boulevard_of_broken_dreams.png"
original_uncropped_image: "./media/uncropped_boulevard_of_broken_dreams.jpg"
rel_link_root: "./Music"
external_reader_uri: "file://./Music/04_Boulevard_of_Broken_Dreams.mp3"
fair_trade_valuation_usd: "1.29"
available_for_trade: true
tags: [song, greenday, boulevard-of-broken-dreams, american-idiot, punk-rock, 2000s, alone, waka-waka, pacman]
---

# 🚶‍♂️ Green Day — Boulevard of Broken Dreams

> [!abstract] Individual Song Track Sidecar [Parent: [[album-american-idiot|American Idiot Album]]]
> **Track:** 04 &bull; **Single Release:** November 29, 2004
> **Grammy:** Record of the Year (2006)
> **Key Lyric:** *"I walk a lonely road, the only one that I have ever known..."*

---

## 🔗 Parent Album Link
- Back to Full Rock Opera: [[album-american-idiot|American Idiot (Master Album)]]

---

## 💬 Live Chat & Resonance Stream
- **[Kid's Live Tweet]:** *AH-LOOOOOONE! AH-LOOOOOONE! I WALK ALONE, I WALK A--🎸🔥*
- **[Parent's Arcade Tweet]:** *WAKA WAKA WAKA! 🟡🍒 Ghost chasing fruit eating retro arcade energy!*

---
*Cataloged in Meow Library Companion MD.*
`,
    chapters: [
      {
        title: 'Track 04: Boulevard of Broken Dreams (Verse & Chorus)',
        cfiBase: 'track://boulevard/ch1',
        paragraphs: [
          'I walk a lonely road, the only one that I have ever known. Don\'t know where it goes, but it\'s home to me and I walk alone.',
          'I walk this empty street, on the Boulevard of Broken Dreams. Where the city sleeps, and I\'m the only one, and I walk alone. Ah-loooone! Ah-loooone!'
        ]
      },
      {
        title: 'Track 04: Boulevard of Broken Dreams (Bridge & Outro)',
        cfiBase: 'track://boulevard/ch2',
        paragraphs: [
          'My shadow\'s the only one that walks beside me. My shallow heart\'s the only thing that\'s beating.',
          'Sometimes I wish someone out there would find me. \'Til then I walk alone!'
        ]
      }
    ]
  },
  {
    id: 'track-american-idiot',
    title: 'American Idiot (American Idiot Track 01)',
    author: 'Green Day',
    coverColor: '#dc2626',
    coverImageUrl: 'https://images.unsplash.com/photo-1465847899084-d164df4dedc6?w=600',
    originalImageUrl: 'https://images.unsplash.com/photo-1465847899084-d164df4dedc6?w=1200',
    externalReaderUri: 'file://./Music/01_American_Idiot.mp3',
    totalChapters: 1,
    currentChapterIndex: 0,
    currentParagraphIndex: 0,
    isWebPresenceOnly: false,
    tradeValueUsd: 1.29,
    isAvailableForTrade: true,
    resonanceStream: [
      {
        id: 'res-ai-title-1',
        timestamp: '2026-08-17T15:05:00Z',
        formattedDate: '2026-08-17',
        progressPercent: 100,
        category: 'Fast Punk / Title Track',
        presetTier: 'snot-cascade',
        rawText: 'DON\'T WANNA BE AN AMERICAN IDIOT! 🎸⚡ FAST PACED POWER CHORDS ALL DAY!',
        cfi: 'track://ai/intro',
        chapterTitle: 'Track 01: American Idiot (Full Song)',
        paragraphIndex: 0,
        paragraphSnippet: 'Don\'t wanna be an American idiot! One nation controlled by the media! Information age of hysteria!',
        intensityScore: 5,
        emojiReactions: ['⚡', '🎸', '🔥']
      }
    ],
    sidecarMarkdown: `---
title: "American Idiot (American Idiot Track 01)"
artist: "Green Day"
parent_album: "[[album-american-idiot|American Idiot (Album)]]"
track_number: 1
duration: "2:54"
bpm: 186
format: "dcmd/song-track-sidecar"
cover_image: "./media/cover_american_idiot_song.png"
original_uncropped_image: "./media/uncropped_american_idiot_song.jpg"
rel_link_root: "./Music"
external_reader_uri: "file://./Music/01_American_Idiot.mp3"
fair_trade_valuation_usd: "1.29"
available_for_trade: true
tags: [song, greenday, american-idiot, punk-rock, title-track]
---

# ⚡ Green Day — American Idiot (Track 01)

> [!abstract] Individual Track Sidecar [Parent: [[album-american-idiot|American Idiot Album]]]
> **Track:** 01 &bull; **BPM:** 186 &bull; **Key:** A-flat major
> **Parent Album Link:** [[album-american-idiot|American Idiot (Master Album)]]

---
*Cataloged in Meow Library Companion MD.*
`,
    chapters: [
      {
        title: 'Track 01: American Idiot (Full Song)',
        cfiBase: 'track://ai/full',
        paragraphs: [
          'Don\'t wanna be an American idiot! One nation controlled by the media! Information age of hysteria, it\'s calling out to idiot America!',
          'Welcome to a new kind of tension, all across the alien nation, where everything isn\'t meant to be okay!'
        ]
      }
    ]
  },
  {
    id: 'feline-keyboard-stepper',
    title: 'The Meow Keyboard Stepper (Feline Task-Switching & Petting Protocol)',
    author: 'Chief Feline Operator & Meow Meow',
    coverColor: '#059669',
    coverImageUrl: 'https://images.unsplash.com/photo-[REDACTED_PHONE]-1cf6624b9987?w=600',
    originalImageUrl: 'https://images.unsplash.com/photo-[REDACTED_PHONE]-1cf6624b9987?w=1200',
    externalReaderUri: 'file://./Pets/Feline_Task_Switching_Protocol.dcmd',
    totalChapters: 2,
    currentChapterIndex: 0,
    currentParagraphIndex: 0,
    isWebPresenceOnly: false,
    tradeValueUsd: 50.00,
    isAvailableForTrade: false,
    resonanceStream: [
      {
        id: 'res-cat-enter-early',
        timestamp: '2026-08-17T15:30:00Z',
        formattedDate: '2026-08-17',
        progressPercent: 50.0,
        category: 'Pet Task-Switching Protocol',
        presetTier: 'diaper-emergency',
        rawText: 'HELPFULLY SENT EARLY: 🐾 CAT STEPPED ON THE ENTER KEY BEFORE THE SENTENCE WAS FINISHED, THEN LOOKED DEEPLY OFFENDED WHEN YELLED AT INSTEAD OF GETTING IMMEDIATE MANDATORY PETTING!',
        cfi: 'pet://cat/ch1',
        chapterTitle: 'Chapter 1: The Paws on the Enter Key',
        paragraphIndex: 0,
        paragraphSnippet: 'When human fingers are rapidly typing, the cat recognizes the glowing keyboard as a heated bed engineered solely for feline chin elevation.',
        reactionImageUrl: 'https://images.unsplash.com/photo-[REDACTED_PHONE]-1cf6624b9987?w=400',
        reactionGifCaption: 'Cat Stepped on Keyboard & Demanding Priority Petting',
        intensityScore: 5,
        emojiReactions: ['🐾', '🐱', '😼', '⌨️', '💆']
      },
      {
        id: 'res-simlish-plumbob-sulsul',
        timestamp: '2026-08-17T15:35:00Z',
        formattedDate: '2026-08-17',
        progressPercent: 100.0,
        category: 'Simlish / Simalese Reaction',
        presetTier: 'diaper-emergency',
        rawText: 'SUL SUL! 🟩 DAG DAG CODE! RETICULATING SPLINES AND COMMENCING CHIN SCRITCHES! §50,000 SIMOLEONS PETTING BONUS APPLIED!',
        cfi: 'pet://cat/ch2',
        chapterTitle: 'Chapter 2: Simlish Translation & Plumbob Comfort',
        paragraphIndex: 1,
        paragraphSnippet: 'Plumbob status turns neon green (🟩) upon achieving 100% purring compliance and chin scratch satisfaction.',
        reactionImageUrl: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=400',
        reactionGifCaption: 'Sims Sul Sul & Plumbob Reticulating Splines',
        intensityScore: 5,
        emojiReactions: ['🟩', '💰', '🐟', '👑', '💖']
      }
    ],
    sidecarMarkdown: `---
title: "The Meow Keyboard Stepper (Feline Task-Switching & Petting Protocol)"
author: "Chief Feline Operator"
format: "dcmd/feline-pet-companion"
simoleon_value: "§500 Simoleons"
trade_value_usd: 50.00
available_for_trade: false
cover_image: "./media/cover_cat_keyboard_stepper.png"
original_uncropped_image: "./media/uncropped_cat_keyboard_stepper.jpg"
rel_link_root: "./Pets"
external_reader_uri: "file://./Pets/Feline_Task_Switching_Protocol.dcmd"
tags: [cat, pet, feline, simlish, simoleons, sulsul, keyboard, taskswitch, scritches, purr]
---

# 🐾 Feline Task-Switching & Mandatory Petting Protocol

> [!abstract] Meow Feline Companion Manifesto [ZK: \`20260817-CAT-KEYBOARD\`]
> **Subject:** The Enter-Key Feline Operator
> **Official Law:** Any message sent prematurely by feline paws is officially canonical.
> **Mandatory Response:** Immediate human task-switching from keyboard typing to chin scritches.

---

## 🟩 Simlish / Simalese Phrases
- **Sul Sul! 👋** — Hello human, look at me not the monitor.
- **Dag Dag! 👋😭** — Goodbye unwritten code.
- **Ooh Be Gah! 😡** — Why are you yelling when you should be petting?
- **Motherlode! 💰** — §50,000 Simoleons worth of unconditional purrs.

---
*Cataloged in Meow Library Companion MD.*
`,
    chapters: [
      {
        title: 'Chapter 1: The Paws on the Enter Key',
        cfiBase: 'pet://cat/ch1',
        paragraphs: [
          'When human fingers are rapidly typing, the cat recognizes the glowing keyboard as a heated bed engineered solely for feline chin elevation.',
          'A single paw on the Enter key sends the message into the digital ether. The human gasps in horror; the cat looks mildly offended that petting has not commenced.'
        ]
      },
      {
        title: 'Chapter 2: Simlish Translation & Plumbob Comfort',
        cfiBase: 'pet://cat/ch2',
        paragraphs: [
          '"Sul Sul!" cries the simulation. "Ooh Be Gah!" scoffs the feline.',
          'Plumbob status turns neon green (🟩) upon achieving 100% purring compliance and chin scratch satisfaction.'
        ]
      }
    ]
  }
];
