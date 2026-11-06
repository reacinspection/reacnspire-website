# Owner review only — do not merge

Preserves Claude commits 764de0f and f058c4e. Added a sharper existing owner logo to navigation/footer: source `C:/Users/reaci/OneDrive/Kendrareac Consultant/Kendra New logo.png` (978 × 529), optimized to `kendra-logo@2x.png` (700 × 379, 49,942 bytes). Display sizes unchanged. Original logos retained.

## Unresolved launch details

- $49 per inspector license is owner-stated **as relayed in the supplied Claude handoff**. Billing period is not confirmed.
- Square license URL remains missing; both buttons retain the marked contact fallback. Do not merge until replaced and tested.
- Separate-product trial and production app URL unconfirmed; omitted.
- No voucher screenshot added: no verified released-app demo capture available, and preview/test branding must not be concealed to imply a production screen.
- No additional features claimed. Existing protocol implementation is not proof of a separate production release.

## Feature evidence

Source root: `C:/Users/reaci/OneDrive/Documents/Claude/Projects/Nspire inspection app/nspire-v-hud-form-20261029` (preview candidate, not established production release).

- Pass/fail and HCV/PBV: `www/voucher-protocol.js:37-65`.
- Finding photos: `www/app.js:2428-2450`; voucher rendering `www/voucher-ui.js:19`.
- Inspector signature: `www/voucher-ui.js:32`.
- Print/CSV/JSON: `www/voucher-ui.js:34-35`.
- EN/ES: `www/i18n.js:673-674`.

## Verification

`checks.json` records EN/ES at 1440×900, 1024×768, 390×844 and 375×667: no overflow, page errors or broken images; source contact form identical to origin/main; JSON-LD parses; Inspections card contains no NSPIRE-V; voucher card contains no scoring/puntaje text.

24 screenshots cover apps/header/footer. Section captures suppress fixed navigation and floating controls only during capture to avoid screenshot overlap artifacts. Header captures preserve navigation. Square new-tab behavior is NOT verified because the final link is missing. No form submissions or payments performed. Physical-device testing not performed in this pass.
