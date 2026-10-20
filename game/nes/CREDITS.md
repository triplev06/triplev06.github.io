# The Legend of Zelda: opening route and Level 1

Original game artwork: Nintendo. This portfolio minigame uses the sprite collection supplied by the website owner. This is a JavaScript recreation with original sprite artwork, not a claim of cycle-accurate NES emulation.

## Sprite and map sources

Source collection: https://www.spriters-resource.com/nes/legendofzelda/

The Link, enemy, NPC, boss, and map sheets credit **Mister Mike** in their embedded credit panels. The font sheet credits **Jackster**. Original complete sheets, including their credit panels, are preserved in this folder. Item-sheet source is credited below separately.

- Link: https://www.spriters-resource.com/nes/legendofzelda/asset/8366/
- Overworld enemies: https://www.spriters-resource.com/nes/legendofzelda/asset/31805/
- Dungeon enemies: https://www.spriters-resource.com/nes/legendofzelda/asset/31806/
- Bosses: https://www.spriters-resource.com/nes/legendofzelda/asset/36632/
- First Quest overworld: https://www.spriters-resource.com/nes/legendofzelda/asset/119176/
- Level 1 (Eagle): https://www.spriters-resource.com/nes/legendofzelda/asset/8381/
- Items and weapons: https://www.spriters-resource.com/nes/legendofzelda/asset/54720/
- NPCs: https://www.spriters-resource.com/nes/legendofzelda/asset/21189/
- Font: https://www.spriters-resource.com/nes/legendofzelda/asset/37005/

## Layout and progression reference

https://www.zeldadungeon.net/the-legend-of-zelda-walkthrough/level-1-the-eagle/

The route is H8, I8, I7, I6, I5, I4, H4. The Eagle uses the original room-map sheet and includes its bow cellar, boomerang, keys, map, compass, Aquamentus, heart container, and Triforce fragment. The overworld guide is visible immediately. The dungeon guide starts covered and can be revealed manually; the in-game layout and current-room marker require the map and compass respectively. Keyboard/touch input, local checkpoint saves, retry behavior, and optional synthesized sound effects are browser adaptations. Enemy timing is recreated, not emulated. The two bomb shortcut pairs within the included Level 1 rooms are supported; off-route shops remain outside this excerpt. The bow is collectible; arrows are not supplied because its shop is outside the selected route. The sword and boomerang complete the dungeon.


## Audio
The site owner supplied the original Overworld of Hyrule, Dungeon Theme, Small Item Get, Link Dies, and Triforce Shard Collected MP3s. Original game music and sounds belong to their respective rights holders. Additional combat feedback is synthesized. Sound starts on Begin / Continue, remembers the mute setting, and pauses with gameplay.

## HUD, inventory, and concealed terrain

- HUD & Pause Screen, supplied by the site owner, ripped by MisterMike: https://www.spriters-resource.com/nes/legendofzelda/asset/119278/
- Dungeon Tileset and First Quest overworld PNGs were also supplied by the site owner; the original sheets remain in this folder with their embedded credits.
- `hud-clean.png` removes the HUD sheet's documented item/map placeholder colors. `item-sprites.png` isolates sprite rectangles with transparent backgrounds; its coordinates are recorded in `item-sprites.json`.
- `overworld-clean.png` replaces the three marked burnable trees on the playable route with ordinary trees. Dungeon walls, doors, movable blocks, and concealed stairs are drawn from the dungeon tileset rather than the map's pre-revealed annotations. Bomb shortcuts stay concealed until bombed; off-route candle caves remain outside the selected route. Sheet annotations are not rendered as exposed entrances.

The Start inventory uses original pixel artwork. Enter / I opens it, arrows select an owned B item, and Enter returns. A keeps the sword. Bow ownership and arrow ownership are separate; this route still does not contain the arrow shop. Enemy drop chances are tuned for occasional pickups rather than a cycle-accurate reproduction of the original drop tables.

## Item animation update
The site owner supplied the Items & Weapons sheet again for frame reference. Fairy wings alternate between the two adjacent poses; map, Triforce, and heart sprites alternate their two source frames. Rupees use the supplied blue frame and a red palette variant as requested. Every frame occupies its own transparent 16-by-16 atlas cell.

Weapon animation poses, bomb timing, and normal enemy drop groups were cross-checked against the Zelda 1 disassembly: https://github.com/aldonunez/zelda1-disassembly. This browser adaptation does not emulate every timing or drop-counter rule.
