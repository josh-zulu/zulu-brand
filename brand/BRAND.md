# Zulu Alpha Kilo: brand system (working notes)

Distilled from the ZAK master deck (fonts and colours embedded in the PowerPoint theme). Tokens: `brand/tokens.css`.

## The mark
Z · A · K built only from **pills and dots**: Z = top bar + diagonal + two dots; A = a dot over a dash; K = a dot and two diagonals. In the hero version the shapes are **debossed** (carved slots) and the dots are windows that city icons burst out of: the CN Tower (Toronto), the Statue of Liberty (New York), an orca (Vancouver). Geometry: `projects/ai-trends/src/components/ZakMark.tsx` (`ZAK_PARTS`). Files: `brand/logos/`.

Use the pill-and-dot geometry as a graphic language (slots, chips, progress pills, fragments), and the debossed slot (`--zak-deboss-dark`) for wells and frames. Don't stretch, outline, or recolour the mark beyond paper on ink / graphite on paper.

## Colour
| Token | Hex | Use |
|---|---|---|
| `--zak-ink` | #161515 | Primary ground |
| `--zak-ink-2/3/4` | #1d1c1c / #2a2828 / #3a3837 | Surfaces, wells, hairlines |
| `--zak-paper` | #f8f7f4 | Text on ink; the light ground for human moments |
| `--zak-paper-2` | #cfcec9 | Secondary text on ink |
| `--zak-stone` / `-2` | #9e9d99 / #737068 | Captions, labels, footers |
| `--zak-graphite` | #191919 | Text on paper |
| `--zak-signal` | #00e482 | The machine: cursors, live, agent activity. Small doses. |
| `--zak-signal-2` | #4dd0e1 | Secondary signal (in-progress states) |

The brand is essentially monochrome. Colour comes from photography and generated imagery, not from UI.

## Type
- **Oswald Light (300), uppercase**: display. Titles, dividers, big numbers. Slight positive tracking.
- **Schibsted Grotesk**: text. Statements at weight 500, tight tracking (-0.025em), sentence case. Body at 400.
- **JetBrains Mono**: machine voice. Labels in caps with wide tracking, prompts, logs, status lines.
(All three are Google Fonts / OFL, installed via @fontsource.)

## Voice
Plain, confident, specific. Short sentences. No hype words, no exclamation marks. Say what it does and why it matters to the people in the room. "It opens our files, uses our tools and finishes the job."

## Imagery for generation
Photographic, tactile, editorial: natural light, real materials, film grain, generous negative space. Avoid the generic AI look (glossy plastic skin, purple-blue gradients, floating holograms, robots, brains, circuit boards). No text or logos in generated images unless the brief needs it.
