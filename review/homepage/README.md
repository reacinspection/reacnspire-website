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
