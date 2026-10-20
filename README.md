# Vikranth Vegesina — personal website

Static portfolio and hidden Zelda minigame. No build step, package installation, API keys, or backend required.

## Local preview

From this folder, run `python -m http.server 8765`, then open http://localhost:8765/.

## GitHub Pages

1. Clone `https://github.com/triplev06/triplev06.github.io.git` into a separate folder if you do not already have a checkout.
2. Copy this folder’s contents into that checkout’s root, including `.nojekyll`. Keep the checkout’s `.git` directory and any existing `CNAME` file.
3. Review `git status` and `git diff`, then commit and push to the repository’s publishing branch.
4. In the repository’s Settings → Pages, publish from that branch’s root folder. If the repository already uses a deployment workflow, retain that workflow instead.

The intended public address is https://triplev06.github.io/. This folder has not been pushed or published. The existing repository’s branch and Pages settings must be checked in GitHub; they were not accessible from the preparation environment.

## Checks

With Node.js installed:

```sh
node game/check.cjs
node game/fixes-check.cjs
node game/route-check.cjs
```

All site paths are relative. Keep `assets/`, `game/`, the audio files, and `resume.pdf` alongside the HTML files. `.nojekyll` serves these as static files.

## Features

Four visual themes, light/dark modes, seven interactive discoveries, a detective achievement, and a keyboard/touch Zelda adventure through the first dungeon. Preferences and game progress are stored in the visitor’s browser. No analytics are included.

The game uses four-direction movement. The first held direction wins; simultaneous inputs prioritize horizontal movement. Link retains his travel direction through doors and portals. Player and enemy projectiles pass through terrain; character movement respects obstacles. Sound starts on Begin/Continue and remembers the mute preference.

## Content and artwork

Portfolio content is in `index.html` and `script.js`; keep the reference `projects.json` synchronized when editing project descriptions. Styling is split across the root CSS files. The secret game starts at `game.html`.

Artwork credits: `assets/ARTWORK.md` and `game/nes/CREDITS.md`. Game art and five audio tracks are bundled locally. Rayquaza artwork loads from Pokémon Database; Google Fonts also requires a network connection, with system-font fallbacks. `CONTENT-AUDIT.md` records the content review.

## Dungeon controls and inventory update

Enter / I (START) opens the scrolling NES inventory and pauses the world. Arrows select an owned B item; Enter closes it. Space / J / Z uses the sword; K / X uses the equipped B item; E interacts. The mobile START button and item buttons provide the same controls.

Dungeon puzzle blocks slide one tile in the direction pushed, after checking alignment, terrain, and occupied destinations. Keep holding a direction briefly against the block. Pushed positions and equipped items survive reloads; existing version-2 saves migrate automatically. Stairs appear only after the block slide finishes.

Kills no longer add currency directly. Most enemies leave nothing; occasional rupee, five-rupee, heart, or fairy pickups expire after eight seconds. Dungeon keys and other puzzle rewards never expire. This is a browser adaptation rather than a ROM emulator.

Run `node game/inventory-check.cjs` as well as the existing game checks to verify directional block collisions, save migration, inventory freezing/equipment, and the drop distribution.

Aquamentus now uses the full visible 24-by-32 body for sword and projectile damage. Item animations use isolated two-frame sprites: fairy wing poses, blue/red rupees, map and Triforce palette cycling, and flashing hearts. Run `node game/boss-check.cjs` and `node game/item-animation-check.cjs` for the new regressions.

## Weapons, room transitions, and navigation

Boomerangs cycle through the supplied rotation sprites. Bombs use the four supplied fuse/explosion frames and can open the two hidden shortcut pairs within Level 1. Once collected, bombs stay in the inventory at zero ammunition; using an empty supply does not place a bomb or change the selected B item. Ownership and ammunition survive reloads separately. Sword beams split into four mirrored pieces using the fragment beside the wooden swords in the supplied Link sheet. Important pickups use Link's lifting poses; the Triforce hold completes before the victory screen.

Room changes scroll the playfield while freezing gameplay. The dungeon HUD and inventory reveal the layout only after collecting the map. The compass independently highlights Link's current room. The sidebar dungeon guide starts covered; its reveal button offers optional help without granting either in-game item. The overworld route remains visible.

Additional regression checks: `node game/weapon-check.cjs`, `node game/bomb-inventory-check.cjs`, and `node game/room-map-check.cjs`.
