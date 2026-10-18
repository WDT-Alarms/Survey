# WDT Site Survey app

Offline site survey app for WDT Alarms Ltd: fire, intruder, CCTV and access control checklists, room-by-room device counts, photos, variations and a "Share to Claude" export.

All survey data is stored on the phone only. Nothing is uploaded anywhere.

## Put it online with GitHub Pages (one-off, about 10 minutes)

1. Go to github.com and sign up for a free account (or sign in).
2. Click **+** (top right) → **New repository**. Name it `survey`, set it to **Public**, tick **Add a README file**, click **Create repository**.
3. In the new repository click **Add file → Upload files**. Drag in all the files from this folder: `index.html`, `app.js`, `sw.js`, `manifest.webmanifest`, `icon-192.png`, `icon-512.png`. Click **Commit changes**.
4. Go to **Settings → Pages**. Under "Branch" choose **main** and **/(root)**, click **Save**.
5. Wait a minute or two, then refresh that page. It will show your address, e.g. `https://yourname.github.io/survey/`.

The repository only holds the app itself. No client details are ever stored there.

## Install on your Android phone

1. Open the address in **Chrome** on the phone.
2. Tap the **⋮** menu → **Add to Home screen** (or **Install app**) → **Install**.
3. Open it once from the home screen while you have signal. After that it works with no signal at all.

Voice notes: in Gboard go to **Settings → Voice typing → Offline speech recognition** and download English (UK). The keyboard microphone then works with no signal.

## Updating the app later

Upload the changed files to the same repository (they replace the old ones), and change the `VERSION` line at the top of `sw.js` (e.g. `wdt-survey-v2`). Open the app with signal and it picks up the update. Your surveys are not affected.

## Back up

Surveys live only on the phone. Use **Backup** on the home screen now and then, and save the file to Google Drive or email it to yourself. Use **Restore** on a new phone.
