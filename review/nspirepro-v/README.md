# NspirePro-V card — owner review (PR #5)

Do not merge or publish without the owner's explicit approval.

Preserves the approved logo work (`kendra-logo@2x.png`, larger nav/footer logo, eager header load). The contact form is byte-identical to `origin/main`.

## Launch facts used on the card (from the app-release handoff)

- App release: `reacinspection/NspirePro` commit `98129d55f493013d9feeb3df151fcd07f7de7faf` on `main`; Netlify production deploy `6af0b9ea930da9a98223b3c1`.
- Price: $49/month or $399/year per inspector; 7-day trial for eligible accounts; payment card required.
- Purchase/signup: `https://app.reacnspire.com/nv-buy` (EN) and `https://app.reacnspire.com/nv-buy?lang=es` (ES). In the released source, `www/nv-buy.js:111` selects Spanish when `lang=es`, and `www/nv-buy.html` states the same prices, trial and card requirement.
- Open the App: `https://app.reacnspire.com/`.
- Seller and subscription Terms (EN/ES, effective November 8, 2026) are published in the app.

The card does not use Square, the HQS training link, or the Inspections `/buy` URL, and it makes no scoring claim for NSPIRE-V.

## Verification (this branch)

`checks.json` covers EN/ES at 1440×900, 1024×768, 390×844 and 375×667:

- no horizontal overflow and no broken images;
- JSON-LD parses, and the contact form is identical to `origin/main`;
- the voucher card has no scoring text and no Square, `/buy` or `#contact` links;
- visible card links go to `/nv-buy` (EN), `/nv-buy?lang=es` (ES) and the app root, opening in a new tab with `rel="noopener"`.

The only console error at every size is the third-party Metricool tracker (`tracker.metricool.com`). The review sandbox's network proxy blocks it, so it says nothing about the page.

`*-nspirepro-v-card.png` captures the updated card at each size and language. The floating "Call" button can appear over the card in mobile captures; it is fixed-position site-wide and unchanged.

## Not verified here

- The live `app.reacnspire.com` pages (the review sandbox cannot reach them); they were confirmed in the app-release handoff, including the owner's iPhone check.
- A completed live payment (none was made).
- Physical-device testing of this website branch.
