# Homepage redesign review

Branch: `codex/homepage-redesign` · baseline: `60498f0` · reviewed November 5, 2026.

Only `index.html` changes existing production code. `home.css` and `home.js` are new homepage-only assets. `light-theme.css`, event pages, checkout configuration, images and the workshop reel script remain unchanged.

| Before | After | Why |
| --- | --- | --- |
| Oversized low-resolution logo and long, layered hero | Small navigation logo, real training photo, 700px desktop hero | Clearer hierarchy and credible photography |
| Flyer and event content stacked in hero | Two dedicated upcoming-training rows | Keeps sessions findable without overwhelming the introduction |
| Teal gradients and repeated card layouts | Warm paper, navy, restrained red, Source Serif 4/Public Sans | Matches the requested editorial visual system |
| Stretched 206px reel images | 19-photo mosaic, tiles no larger than 150px | Respects source image quality; caption makes no unsupported event count |
| Repeated service cards and offers | Editorial services, program table, compact offer list | Preserves content and booking actions with less repetition |
| Two summary elements per FAQ | One bilingual summary and SVG chevron | Correct native keyboard interaction in both languages |

## Screenshots

| View | Before | After |
| --- | --- | --- |
| Desktop EN, 1440×900 | [Before](before-1440-en-hero.webp) | [After](after-1440-en-hero.webp) / [Full page](after-1440-en-full.png) |
| Desktop ES, 1440×900 | [Before](before-1440-es-hero.webp) | [After](after-1440-es-hero.webp) / [Full page](after-1440-es-full.png) |
| Mobile EN, 390×844 | [Before](before-390-en-hero.webp) | [After](after-390-en-hero.webp) / [Full page](after-390-en-full.png) |
| Mobile ES, 390×844 | [Before](before-390-es-hero.webp) | [After](after-390-es-hero.webp) / [Full page](after-390-es-full.png) |

## Validation

- Browser comparison: all head metadata, canonical/hreflang entries and all three JSON-LD blocks unchanged.
- Contact form names, IDs, field types, required flags, service option values and hidden values match baseline. Netlify form attributes and label associations preserved.
- No missing baseline link destinations; all nine required anchor IDs present; all 24 client names retained.
- Desktop and mobile EN/ES rendering: no horizontal overflow at 1440, 390 or 375px; all images decode successfully; no page JavaScript errors.
- English/Spanish toggle and placeholder updates, program booking prefill, promo reservation prefill, mobile menu and Escape dismissal, FAQ keyboard/native interaction pass.
- Promo opens after five seconds, closes with Escape, and remains reachable through its persistent link. Same localStorage key and $9,500 content retained. Focus trapping and focus restoration added.
- No source inline style attributes, inline hover handlers, emoji icons, or `transition: all`. Copyright symbol retained as ordinary text.
- Shared stylesheet unchanged. `git diff --check` passes.

## Limits

Browser checks use desktop Edge/Chromium with emulated viewports, not a physical phone or Safari. No contact form was submitted, no payment was made, and Square pricing was not changed. Third-party analytics and Netlify email delivery were not acceptance-tested. This PR is a visual/interaction redesign, not a new validation of existing regulatory, testimonial or product claims. Google font loading still depends on the existing permitted Google Fonts endpoints.

The homepage remains bilingual using the existing `body.es`, `toggleLang`, placeholder and image-alt behavior. Named clients and product names are retained rather than translated.

## Independent review fixes (Claude, November 5, 2026)

| Before | After | Why |
| --- | --- | --- |
| Apps section still said "Score HUD NSPIRE inspections", with no NSPIRE-V | NSPIRE + NSPIRE-V copy, "New · NSPIRE-V for HCV & PBV" tag, 63 standards / 206 deficiencies chips, compliance-date note linking to /hqs-a-nspire/, 6th FAQ plus FAQPage JSON-LD, two SEO terms | Requested NSPIRE-V update; facts checked against the NspirePro app code. HUD scoring is claimed for public/multifamily only |
| Section eyebrows ran 01, 02, 02, 03, 04, 05, 07, 07, 08, 09, 10 | 01 to 11 in sequence | Duplicate and missing numbers read as a mistake |
| `--warn` #A86A00 (4.08:1 on paper) | #8F5A00 (5.31:1) | "80–89" band label failed WCAG AA |
| Mobile $9,500 pill stacked 76px above the Call button | Same bottom row, width-limited, safe-area aware | Two stacked floating controls covered form content on 375px phones |
| Auto-opened promo left focus on its hidden close button after closing | Focus moves to the persistent $9,500 link | Keyboard and screen-reader users keep a visible focus point |
| "View Training Programs ↗" | "→" | ↗ signals an external link; this is an in-page anchor |
| Client-references note touched the last testimonial | 32px top margin | Spacing |
| Mosaic repeated the hero photo as tile 19 | 18 tiles | Duplicate photo; mobile grid now ends on a full row |

Retested after the fixes: form attributes and fields identical to main; no link destinations removed; all JSON-LD valid (only the intended FAQ and knowsAbout additions); EN/ES toggle shows no wrong-language text; all 10 booking prefills and the promo reserve prefill work; promo focus trap, Escape and backdrop close work; no page errors; no horizontal overflow at 1440, 390 or 375px.
