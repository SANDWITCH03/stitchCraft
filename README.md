# StitchCraft

Learn to sew from scratch with interactive 3D lessons, and turn a photo of a garment into a step-by-step stitching guide (paper pattern or 3D video guide).

This is the first version of the website. The 3D lesson player is real (it runs in the browser with three.js). The "AI" parts are simulated for now: typing a description or uploading a photo picks one of six starter lessons.

## Tech stack (all free)

- **Next.js** (React) for the website
- **three.js** for the 3D lesson player
- **Vercel Hobby plan** for free hosting

## Deploy it for free on Vercel

1. Go to [vercel.com/signup](https://vercel.com/signup) and choose **Continue with GitHub**. Pick the free **Hobby** plan.
2. On your Vercel dashboard, click **Add New… → Project**.
3. Find the **stitchCraft** repository in the list and click **Import**. If it isn't listed, click **Adjust GitHub App Permissions** and give Vercel access to it.
4. Leave every setting as it is (Vercel detects Next.js by itself) and click **Deploy**.
5. After about a minute you get a free link like `stitchcraft-xxxx.vercel.app`. That's your live site.

From then on, every change merged into the `main` branch on GitHub updates the live site automatically.

## Run it on your own computer (optional)

You need [Node.js](https://nodejs.org) 20 or newer.

```bash
npm install
npm run dev
```

Then open http://localhost:3000.

## Where things are

| Path | What it is |
| --- | --- |
| `app/page.jsx` | The page content: every section and its text |
| `app/globals.css` | Colours (maroon theme), fonts (Arial Narrow) and layout |
| `components/Studio.jsx` | The top section: lesson generator and 3D player controls |
| `components/PhotoToGuide.jsx` | Photo-to-pattern section |
| `lib/lessonEngine.js` | The three.js 3D scene and animation |
| `lib/lesson.js` | Lesson steps, timings and captions |
| `lib/projects.js` | Starter projects (fabric, colours, names) |

To change the colours, edit the variables at the top of `app/globals.css`.

## Next steps

- Connect a real AI model that turns a description or photo into a lesson plan (pieces, steps, seam allowances), which the 3D engine then plays.
- Draft real paper patterns from measurements (for example with the open-source FreeSewing library).
- Accounts and saved progress.
