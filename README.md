# 🎉 Scouts Bingo Night

A slick, dark, festive, real-time bingo web app for a scouts bingo night. An admin
draws physical numbers from a machine and clicks them on the **Admin** screen;
players watch the **Viewer** screen on their phones; a **Display** screen drives a
TV or projector. Everything stays in sync live through a single Firebase Firestore
document.

Built with **React + Vite + TypeScript + Tailwind + Firebase + Framer Motion**, and
deployable to **Vercel** in a few minutes.

## Screens / Routes

| Route       | Who it's for        | Notes                                            |
| ----------- | ------------------- | ------------------------------------------------ |
| `/` →       | —                   | redirects to `/viewer`                           |
| `/viewer`   | Players' phones     | Mobile-first. Put this behind your QR code.      |
| `/admin`    | The number caller   | Password-gated. Click numbers as you draw them.  |
| `/display`  | TV / projector      | Giant numbers, minimal text, big animations.     |

---

## 1. Create a Firebase project

1. Go to <https://console.firebase.google.com> and click **Add project**.
2. Name it (e.g. `scouts-bingo`), continue through the steps (Analytics optional).
3. Once created, click the **Web** icon (`</>`) to "Add an app to get started".
4. Register the app (any nickname). Firebase shows you a `firebaseConfig` object —
   keep this tab open, you'll copy these values into your env vars in step 3.

## 2. Create the Firestore database

1. In the Firebase console sidebar: **Build → Firestore Database → Create database**.
2. Choose a location close to you.
3. Start in **Test mode** (open rules). For a single private event this is fine.
   You do **not** need to create the `game/state` document by hand — the app
   creates it automatically the first time the Admin screen loads.

> **Rules (open, for the event).** Test mode gives you something like this, which
> lets anyone read/write. That's intentional for a one-night private game:
>
> ```
> rules_version = '2';
> service cloud.firestore {
>   match /databases/{database}/documents {
>     match /{document=**} {
>       allow read, write: if true;
>     }
>   }
> }
> ```
>
> ⚠️ **After the event, lock it down** (set `allow read, write: if false;` or
> delete the project) so the open database isn't left exposed.

## 3. Add your environment variables

Copy the example file and fill it in:

```bash
cp .env.example .env
```

Then edit `.env` with the values from your Firebase web app config (step 1) and a
password of your choice for the admin screen:

```
VITE_FIREBASE_API_KEY=...
VITE_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your-project-id
VITE_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=000000000000
VITE_FIREBASE_APP_ID=1:000000000000:web:abcdef123456
VITE_ADMIN_PASSWORD=choose-a-password
```

> Note: all `VITE_` vars are bundled into the browser build — they are not secret.
> The admin password is a soft gate to keep curious players out, not real security.

## 4. Run locally

```bash
npm install
npm run dev
```

Open:
- <http://localhost:5173/viewer>
- <http://localhost:5173/admin>  (enter your `VITE_ADMIN_PASSWORD`)
- <http://localhost:5173/display>

Open them in separate tabs/windows and click a number in Admin — the others update
instantly.

## 5. Deploy to Vercel

1. Push this project to a GitHub repo.
2. Go to <https://vercel.com>, **Add New… → Project**, and import the repo.
3. Framework preset: **Vite** (auto-detected). Build command `npm run build`,
   output directory `dist` — both auto-detected.
4. **Environment Variables:** add every variable from your `.env` (the six
   `VITE_FIREBASE_*` plus `VITE_ADMIN_PASSWORD`).
5. Click **Deploy**.

`vercel.json` already contains an SPA rewrite so deep links like `/admin` and
`/display` work on refresh.

## 6. Make a QR code to the Viewer

After deploying, your viewer URL is e.g. `https://your-app.vercel.app/viewer`.

- **Easiest:** paste that URL into any QR generator, e.g.
  <https://www.qr-code-generator.com> or <https://qrcode.tec-it.com>, then download
  the PNG and print it.
- **Command line:** `npx qrcode "https://your-app.vercel.app/viewer" -o viewer-qr.png`

Print it big, stick it on the tables, and players scan straight into the game.

---

## 🖼️ Stickers, emojis & number triggers (the fun part)

Everything about stickers is editable **live from the Admin screen** — open the
**Stickers & Numbers** panel. No code or redeploy needed. For each sticker you can:

- pick an **emoji** (the quick way) or an **image** path (overrides the emoji);
- set its **label** and a funny **message**;
- choose the **trigger numbers** that make it pop, e.g. `7, 22, 70`;
- set a **random chance** (0–1) for it to pop on any number;
- set it to **Auto** (pops by itself) or **Manual** (only via the **Show** button);
- **Add** new stickers and **delete** ones you don't want.

Hit **💾 Save** to push changes to everyone. The big **🤖 Automated: ON/OFF**
switch turns *all* self-popping stickers off in one click (manual still works).

The starting set lives in [`src/config/stickers.ts`](src/config/stickers.ts) (these
just seed the game the first time it runs). To use your own pictures, drop images
into [`public/stickers/`](public/stickers/) (`png`/`jpg`/`gif`/`svg`) and point a
sticker's **image path** at e.g. `/stickers/akela-dab.png`. If an image is missing,
the emoji shows instead.

## 🏕️ Logo & background

- **Logo:** replace [`public/logo.svg`](public/logo.svg) with your group's logo
  (any image; if you use a different filename, update the `src="/logo.svg"` in the
  page headers).
- **Background:** replace [`public/background.svg`](public/background.svg), or drop a
  photo into `public/` (e.g. `background.jpg`) and set `BACKGROUND_IMAGE` in
  [`src/components/Background.tsx`](src/components/Background.tsx). A dark veil keeps
  the foreground readable over any image.

## 🔧 Tweaking the game

- **Number range:** the default is a standard **75-ball B I N G O** board
  (B 1–15, I 16–30, N 31–45, G 46–60, O 61–75). To change it, edit `MIN_NUMBER` /
  `MAX_NUMBER` in [`src/config/gameConfig.ts`](src/config/gameConfig.ts) — the
  board, columns and letters all recompute automatically. (For classic UK 90-ball,
  set `MAX_NUMBER = 90`.)
- **Recent count:** `RECENT_COUNT` (default 5) in the same file.
- **Colours / theme:** [`tailwind.config.js`](tailwind.config.js) (`neon` palette).

## How it works (1-minute tour)

- **One Firestore doc** at `game/state` holds the whole game (see
  [`src/types/gameState.ts`](src/types/gameState.ts)).
- **All writes go through** [`FirebaseGameStateService`](src/services/FirebaseGameStateService.ts).
  Every mutation recomputes derived fields (`currentNumber`, `recentNumbers`) from
  the source arrays, so **undo/redo are always consistent** and `recentNumbers` is
  always "the last 5 called numbers, newest first".
- **Every screen subscribes** via [`useGameState`](src/hooks/useGameState.ts) and
  animates off `animationNonce`, so reveals/confetti/stickers fire in sync.

## Admin cheat-sheet (for the night)

- Click a number = call it. Click a **called** number = remove it (asks first).
- **Undo / Redo** for mistakes. Calling a new number clears the redo stack.
- **🎲 Random** picks an uncalled number if you want a digital draw.
- **Reset Board** clears numbers but keeps the prize & win text.
- **Reset Everything** wipes it all and starts a new round.
- Toggle **Pause** and **Winner check** to show banners on the player screens.
