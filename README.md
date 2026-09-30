# PHOS — Beautifully Fragile

A responsive Phosphophyllite fan tribute with an animated picture edit, a nine-image archive, filterable character analysis, reader annotations, and three original in-character prose pieces.

## Run

Requires Node.js 18 or newer. No package installation is needed.

```sh
npm run dev
```

Open http://127.0.0.1:5176. Set `$env:PORT=5188` before `npm run dev` if you want another port. `npm run build` creates a static `dist/` folder suitable for static hosting. The GitHub Pages workflow deploys that folder when Pages is configured to use GitHub Actions.

## Controls

Play the edit opens an automatically advancing picture sequence. Pause, previous/next, arrow keys, and Escape work in the viewer. Motion can be disabled, and the OS reduced-motion preference is respected. Writing tabs support arrow keys, Home, and End. Major manga spoilers are hidden until enabled. Reader analyses are saved to local browser storage; a shared multi-user archive would need a database and authentication layer.

## Credits

Unofficial fan project for Haruko Ichikawa’s *Land of the Lustrous*. The two supplied PNG illustrations were provided by the repository owner; their original artists are not identified. The third image is an anime still sourced from https://animeuknews.net/2019/05/land-of-the-lustrous-review/ . Images remain the property of their respective rights holders; no redistribution license is asserted. Replace or credit supplied illustrations as their original artists become known.

Basic character facts were checked against https://www.land-of-the-lustrous.com/chara/phosphophyllite.html . Analysis is interpretive commentary. All in-character prose is original fan writing, not quoted canon. Fonts load from Google Fonts with local system fallbacks. No analytics or tracking are included.

## Shared annotations (optional Supabase setup)

The current static site stores readings in the visitor’s browser so the archive works without credentials. The hosted community contract is defined in [`supabase/schema.sql`](supabase/schema.sql). Run that file in a Supabase project’s SQL editor, then add an authenticated client adapter that maps the local fields to `annotations` and `annotation_reactions`:

`source_type` is `study`, `panel`, or `edit`; `source_id` identifies the entry or scene; `status` starts as `pending` and becomes `approved` after moderation. Public reads should query approved rows, while authenticated visitors can create and manage their own pending rows. The schema includes row-level security, lens and source indexes, spoiler levels, and one reaction per visitor per annotation.

The REST helper in [`supabase/adapter.js`](supabase/adapter.js) implements the corresponding read, submit, react, and remove-reaction calls. Copy [`supabase/config.example.js`](supabase/config.example.js) to `supabase/config.js`, load it before `app.js`, and pass `window.PHOS_SUPABASE_CONFIG` to `createPhosSupabaseAdapter` once authentication is available. The example config contains only public client values; service-role keys must stay server-side.

