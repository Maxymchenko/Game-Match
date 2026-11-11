# GameMatch asset sources

## Game artwork

The landing-page mosaic uses 20 distinct official Steam library poster artworks. The source images are 600×900 px (2:3), stored locally in `src/assets/games/`, and shown without cropping so their titles and artwork remain intact. The app does not request artwork from Steam at runtime.

Each image was downloaded from Steam's CDN using the corresponding `library_600x900_2x.jpg` path. The linked Steam product pages are the source pages for the artwork.

| Local file                                           | Game                          | Official source                                                                               |
| ---------------------------------------------------- | ----------------------------- | --------------------------------------------------------------------------------------------- |
| `src/assets/games/resident-evil-4.jpg`               | Resident Evil 4               | [Steam store page](https://store.steampowered.com/app/2050650/Resident_Evil_4/)               |
| `src/assets/games/elden-ring.jpg`                    | ELDEN RING                    | [Steam store page](https://store.steampowered.com/app/1245620/ELDEN_RING/)                    |
| `src/assets/games/baldurs-gate-3.jpg`                | Baldur's Gate 3               | [Steam store page](https://store.steampowered.com/app/1086940/Baldurs_Gate_3/)                |
| `src/assets/games/cyberpunk-2077.jpg`                | Cyberpunk 2077                | [Steam store page](https://store.steampowered.com/app/1091500/Cyberpunk_2077/)                |
| `src/assets/games/red-dead-redemption-2.jpg`         | Red Dead Redemption 2         | [Steam store page](https://store.steampowered.com/app/1174180/Red_Dead_Redemption_2/)         |
| `src/assets/games/the-witcher-3.jpg`                 | The Witcher 3: Wild Hunt      | [Steam store page](https://store.steampowered.com/app/292030/The_Witcher_3_Wild_Hunt/)        |
| `src/assets/games/hades.jpg`                         | Hades                         | [Steam store page](https://store.steampowered.com/app/1145360/Hades/)                         |
| `src/assets/games/hollow-knight.jpg`                 | Hollow Knight                 | [Steam store page](https://store.steampowered.com/app/367520/Hollow_Knight/)                  |
| `src/assets/games/stardew-valley.jpg`                | Stardew Valley                | [Steam store page](https://store.steampowered.com/app/413150/Stardew_Valley/)                 |
| `src/assets/games/celeste.jpg`                       | Celeste                       | [Steam store page](https://store.steampowered.com/app/504230/Celeste/)                        |
| `src/assets/games/slay-the-spire.jpg`                | Slay the Spire                | [Steam store page](https://store.steampowered.com/app/646570/Slay_the_Spire/)                 |
| `src/assets/games/disco-elysium.jpg`                 | Disco Elysium: The Final Cut  | [Steam store page](https://store.steampowered.com/app/632470/Disco_Elysium/)                  |
| `src/assets/games/portal-2.jpg`                      | Portal 2                      | [Steam store page](https://store.steampowered.com/app/620/Portal_2/)                          |
| `src/assets/games/counter-strike-2.jpg`              | Counter-Strike 2              | [Steam store page](https://store.steampowered.com/app/730/CounterStrike_2/)                   |
| `src/assets/games/doom-eternal.jpg`                  | DOOM Eternal                  | [Steam store page](https://store.steampowered.com/app/782330/DOOM_Eternal/)                   |
| `src/assets/games/total-war-warhammer-3.jpg`         | Total War: WARHAMMER III      | [Steam store page](https://store.steampowered.com/app/1142710/Total_War_WARHAMMER_III/)       |
| `src/assets/games/civilization-6.jpg`                | Sid Meier's Civilization VI   | [Steam store page](https://store.steampowered.com/app/289070/Sid_Meiers_Civilization_VI/)     |
| `src/assets/games/ori-and-the-will-of-the-wisps.jpg` | Ori and the Will of the Wisps | [Steam store page](https://store.steampowered.com/app/1057090/Ori_and_the_Will_of_the_Wisps/) |
| `src/assets/games/subnautica.jpg`                    | Subnautica                    | [Steam store page](https://store.steampowered.com/app/264710/Subnautica/)                     |
| `src/assets/games/no-mans-sky.jpg`                   | No Man's Sky                  | [Steam store page](https://store.steampowered.com/app/275850/No_Mans_Sky/)                    |
| `src/assets/games/control-ultimate-edition.jpg`      | Control Ultimate Edition      | [Steam store page](https://store.steampowered.com/app/870780/Control_Ultimate_Edition/)       |

Steam exposes these files as official storefront artwork. Game art remains copyrighted by the respective publishers; a public store image is not a blanket redistribution license. These assets are included for the requested non-commercial student project. Confirm the publishers' permissions before commercial use or redistribution outside the project.

## Genre illustrations

The six genre cards use original, project-local SVG illustrations drawn for this interface. They share a dark, flat-vector style and the GameMatch palette; they contain no game-specific artwork, text, or logos.

- `src/assets/genres/rpg.svg` — a fantasy traveler, castle, mountains, and a magical sky.
- `src/assets/genres/fps.svg` — a futuristic fighter, targeting reticle, and technology city.
- `src/assets/genres/roguelike.svg` — a dark dungeon, portal, and mysterious stairs.
- `src/assets/genres/indie.svg` — a whimsical world with floating islands and a small traveler.
- `src/assets/genres/strategy.svg` — an isometric hex map with territories and flags.
- `src/assets/genres/adventure.svg` — a traveler exploring mountains at sunset.

## Platform and budget icons

The following original, project-local SVG pictograms were drawn for this interface. They contain no downloaded third-party icon artwork:

- `src/assets/platforms/pc-monitor.svg` — desktop monitor.
- `src/assets/platforms/playstation.svg` — game controller with PlayStation button shapes.
- `src/assets/platforms/xbox.svg` — circular Xbox-style mark.
- `src/assets/platforms/nintendo-switch.svg` — two Joy-Con controllers.
- `src/assets/platforms/steam-deck.svg` — handheld PC controls and screen.
- `src/assets/icons/gift.svg` — free games.
- `src/assets/icons/subscription.svg` — subscription pass.
- `src/assets/icons/wallet.svg` — paid games.

These SVGs are interface pictograms, not official brand logo files. Product names and trademarks remain with their respective owners.
