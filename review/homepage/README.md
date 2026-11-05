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

- Current review: canonical/hreflang and WebSite JSON-LD unchanged. Intentionally added NSPIRE-V meta keywords, a ProfessionalService.knowsAbout entry and the sixth FAQPage question in a489c5a.
- Contact form names, IDs, field types, required flags, service option values and hidden values match baseline. Netlify form attributes and label associations preserved.
- No missing baseline link destinations; all nine required anchor IDs present; all 24 client names retained.
- Desktop and mobile EN/ES rendering: no horizontal overflow at 1440, 390 or 375px; all images decode successfully; no page JavaScript errors.
- English/Spanish toggle and placeholder updates, program booking prefill, promo reservation prefill, mobile menu and Escape dismissal, FAQ keyboard/native interaction pass.
- Promo opens after five seconds, closes with Escape, and remains reachable through its persistent link. Same localStorage key and $9,500 content retained. Focus trapping and focus restoration added.
- No source inline style attributes, inline hover handlers, emoji icons, or `transition: all`. Copyright symbol retained as ordinary text.
- Shared stylesheet unchanged. `git diff --check` passes.

## Limits

Browser checks now cover desktop Edge/Chromium and Playwright WebKit 26.5 with emulated viewports; not physical iOS Safari. No contact form was submitted, no payment was made, and Square pricing was not changed. Third-party analytics and Netlify email delivery were not acceptance-tested. This PR is a visual/interaction redesign, not a new validation of existing regulatory, testimonial or product claims. Google font loading still depends on the existing permitted Google Fonts endpoints.

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


## Codex verification of a489c5a

Deployed preview tested in Chromium and Playwright WebKit 26.5, EN/ES at 1440×900, 390×844 and 375×667. Both engines pass: no page JavaScript errors or horizontal overflow, NSPIRE-V tag and sixth FAQ present, 18 mosaic tiles, contact action `/thank-you/` preserved. Voucher copy remains separate from public/multifamily HUD scoring.

At 375×667 in Spanish, the bottom controls end at y=651 (16px above the viewport bottom). The $9,500 link is 219px wide and the Call button starts at x=246.92, leaving an approximately 12px gap. The promo card is 600.30px tall and scrolls internally; both Reserve and the contact line are reachable at scrollTop=321 in both engines. WebKit supports the `dvh` rule and applies 80px mobile / 100px desktop scroll padding.

Netlify's preview-only collaboration drawer intercepted pointer events during the first attempt. The drawer was hidden only in the test browser for subsequent screenshots and interactions; production source and Netlify settings were not changed. This preview-toolbar behavior is separate from the site's own controls.

### New screenshots

| Check | Chromium | WebKit |
| --- | --- | --- |
| Apps EN | [Screenshot](review-chromium-app-en.png) | [Screenshot](review-webkit-app-en.png) |
| Apps ES | [Screenshot](review-chromium-app-es.png) | [Screenshot](review-webkit-app-es.png) |
| NSPIRE-V FAQ EN | [Screenshot](review-chromium-faq-en.png) | [Screenshot](review-webkit-faq-en.png) |
| NSPIRE-V FAQ ES | [Screenshot](review-chromium-faq-es.png) | [Screenshot](review-webkit-faq-es.png) |
| 375×667 Spanish bottom row | [Screenshot](review-chromium-375-es-bottom-row.png) | [Screenshot](review-webkit-375-es-bottom-row.png) |
| Spanish promo top | [Screenshot](review-chromium-375-es-promo-top.png) | [Screenshot](review-webkit-375-es-promo-top.png) |
| Spanish promo scrolled to Reserve/contact | [Screenshot](review-chromium-375-es-promo-bottom.png) | [Screenshot](review-webkit-375-es-promo-bottom.png) |

[Measured browser results](review-a489c5a-results.json). Desktop WebKit does not reproduce a physical iPhone notch, home indicator, Safari toolbar collapse, or nonzero hardware safe-area insets; those remain device checks. No real form submission or payment was made.

### Owner decisions — no changes made

1. Confirm the Spanish hero ending “en inglés o español”; the original said “en español.”
2. Approve an event lifecycle: on November 7 at 00:00 AST, feature the $325 regular rate and retire the early-price promotion; keep Square's manual price change as a separate owner action. Remove the Nov 17 card after its 17:00 AST finish. After the Nov 25 workshop ends at 16:00 ET, replace its card only with a confirmed next session; otherwise hide it. Hide the upcoming-events section when no approved future sessions remain. Coordinate this with the existing monthly workshop rollover so two updates do not conflict. These are proposals only: this follow-up does not alter dates, prices, event visibility, or schedules.

Ready for owner review, not authorization to merge. Claude's code changes in a489c5a remain intact; this follow-up adds review documentation and screenshots only.

Supplemental checks in both engines passed: automatic five-second promo opening and focus return to the persistent link after Escape; Enter-key activation of the new FAQ; FAQ anchor remains below the 72px sticky mobile nav. [Interaction results](review-a489c5a-interactions.json).
