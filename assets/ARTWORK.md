# Artwork and encounters

The Ray Gun (`ray-gun.png`) and open mystery box (`mystery-box.png`) were generated using the built-in image-generation tool. Original transparent PNGs are preserved. The crate appears, followed by the rising weapon and energy beam. Closed-box variants were discarded because their backgrounds were not transparent.

## Generation prompts

### 1
+
+Use case: stylized-concept. Create a single isolated Call of Duty Zombies Ray Gun as a premium 2D game inventory sprite. Recognizable retro sci-fi ray pistol: rounded red enamel body, brass and aged metal fittings, luminous green energy coils and muzzle rings, curved dark pistol grip, small mechanical details. Side profile pointing right, slight three-quarter depth. Carefully inked clean illustration with bold contours, restrained cel shading, worn edges, deliberate readable shapes, not glossy AI fantasy art, not photorealistic. Genuine transparent background. Centered with generous clear padding. No hands, no character, no box, no scenery, no text, no logo, no shadow outside the object. Landscape 3:2 composition. Used as a floating weapon reveal on a portfolio site.
+
### 2
+
+Use case: stylized-concept. Single isolated OPEN Call of Duty Zombies-inspired mystery box, front three-quarter view, lid hinged open behind it, dark empty interior clearly visible for a separate weapon sprite to emerge from. A battered rectangular wooden crate, dark metal reinforcing straps and brass hardware, subtle glowing green light INSIDE only, hand-painted question mark on front. Premium 2D game inventory sprite, inked bold contours, restrained cel shading, detailed weathered wood but clean deliberate silhouettes, not glossy AI fantasy art, not photorealistic. Genuine transparent background. Entire lid and box inside frame with generous padding. No weapon, no people, no scenery, no external ground shadow, no words or logos. Landscape 3:2 composition. Must pair with a red brass green retro ray pistol.
+

## Pokémon sprites

Rayquaza and Mega Rayquaza use existing Pokémon HOME sprites hosted by [Pokémon Database](https://pokemondb.net/sprites/rayquaza). The website credits the source in its footer. Pokémon artwork belongs to Nintendo / Game Freak / The Pokémon Company. These are remote images and need an internet connection; the encounter reports an error if loading fails.

- https://img.pokemondb.net/sprites/home/normal/1x/rayquaza.png
- https://img.pokemondb.net/sprites/home/normal/1x/rayquaza-mega.png

The attempted generated Rayquaza artwork was rejected by the image tool and is not used.

## Interaction

About contains the BG3 d20 and Pokémon summon buttons. Rayquaza pauses on hover/focus; clicking or pressing Enter triggers Mega Evolution and departure. Original colors are preserved across themes. Pause motion, reduced motion, and Escape are supported. The encounter times out after 40 seconds if not activated. BG3 uses an unbiased random d20 roll and labels natural 1 / natural 20 results. No modal is opened.

## Current Rayquaza and d20 revision

The Canvas dragon and small HOME sprites have been replaced by Global Link character artwork from https://pokemondb.net/artwork/rayquaza. Current sources: https://img.pokemondb.net/artwork/vector/large/rayquaza.png (800px) and https://img.pokemondb.net/artwork/vector/rayquaza-mega.png. These are existing Pokemon illustrations, not custom-generated images. Flight is custom animation constrained to the working-prototypes section, automatically triggered when that section enters view.

The d20 is a Canvas projection of an icosahedron with twenty numbered triangular faces, depth shading, random rolls and a different material/design for each theme. It sits in the Selected Work heading. Captions are visually hidden while remaining available to screen readers; the face displays the rolled number.
