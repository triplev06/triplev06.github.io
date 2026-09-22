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

The game has diagonal movement with first-pressed facing and sideways priority for simultaneous inputs. Player and enemy projectiles pass through terrain; character movement respects obstacles. Sound starts on Begin/Continue and remembers the mute preference.

## Content and artwork

Portfolio content is in `index.html` and `script.js`; keep the reference `projects.json` synchronized when editing project descriptions. Styling is split across the root CSS files. The secret game starts at `game.html`.

Artwork credits: `assets/ARTWORK.md` and `game/nes/CREDITS.md`. Game art and five audio tracks are bundled locally. Rayquaza artwork loads from Pokémon Database; Google Fonts also requires a network connection, with system-font fallbacks. `CONTENT-AUDIT.md` records the content review.
