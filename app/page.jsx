import Studio from '@/components/Studio';
import PhotoToGuide from '@/components/PhotoToGuide';
import WatchButton from '@/components/WatchButton';
import { PROJECTS } from '@/lib/projects';

function Logo() {
  return (
    <svg width="28" height="28" viewBox="0 0 28 28" aria-hidden="true">
      <circle cx="14" cy="14" r="13" fill="#e9b872" />
      <path d="M7 21 L20 6" stroke="#4a0f18" strokeWidth="2.2" strokeLinecap="round" />
      <ellipse cx="19" cy="7.2" rx="1.2" ry="2" transform="rotate(41 19 7.2)" fill="#e9b872" stroke="#4a0f18" strokeWidth="1.2" />
      <path d="M7 21 C 4 15, 12 13, 9 9 S 16 3 21 9" stroke="#4a0f18" strokeWidth="1.3" fill="none" strokeDasharray="2 2" />
    </svg>
  );
}

const PATH = [
  { title: 'Know your machine', text: 'Threading, winding a bobbin, stitch length and tension.', meta: ['5 lessons', '40 min'], done: true },
  { title: 'Hand stitches', text: 'Running stitch, slip stitch, sewing on a button.', meta: ['4 lessons', '30 min'], done: true },
  { title: 'Straight seams', text: 'Pinning, backstitching and pressing. You make a tote bag.', meta: ['6 lessons', '1.5 h'], watch: 'tote' },
  { title: 'Curves and corners', text: 'Clipping, notching and turning sharp corners. You make a cushion cover.', meta: ['6 lessons', '2 h'] },
  { title: 'Hems, elastic and finishes', text: 'Double-fold hems, casings and zigzag edges. You make a gathered skirt.', meta: ['7 lessons', '2.5 h'] },
  { title: 'Your first garment', text: 'Reading a pattern, fitting and sewing pull-on shorts from start to finish.', meta: ['9 lessons', '4 h'] },
];

const FAQ = [
  ['Is the 3D lesson a pre-recorded video?', 'No. The AI plans the steps for your project, and each step plays as a live 3D scene in your browser. That is why you can turn it around, slow it down, or switch between centimetres and inches at any moment.'],
  ['Do I need a sewing machine to start?', 'No. Module 2 covers hand stitches, and the first projects can all be sewn by hand. When you buy a machine, Module 1 walks you through setting it up.'],
  ["How accurate is a pattern made from a photo?", "The pattern is drafted from your measurements, not from the photo's proportions. The photo tells us the style: the silhouette, seams, closures and length. You can adjust any detail before you print."],
  ['What seam allowance do the patterns use?', '1.5 cm (⅝ in) for woven fabrics and 1 cm for knits, shown as a dashed line on every piece. You can change it per pattern.'],
  ['Can I print at home?', 'Yes. Patterns tile onto A4 or US Letter pages with alignment marks and a 5 cm test square, or export as one A0 sheet for a copy shop.'],
];

export default function Home() {
  return (
    <>
      <nav className="nav" aria-label="Main" id="top">
        <div className="wrap">
          <a className="logo" href="#top"><Logo />StitchCraft</a>
          <div className="nav-links">
            <a href="#studio">3D Studio</a>
            <a href="#learn">Learn</a>
            <a href="#photo">Photo to pattern</a>
            <a href="#projects">Projects</a>
            <a href="#pricing">Pricing</a>
          </div>
          <div className="nav-cta">
            <a className="login" href="#pricing">Log in</a>
            <a className="btn btn-spool" href="#pricing">Start free</a>
          </div>
        </div>
      </nav>

      <Studio />

      <div className="facts">
        <div className="wrap">
          <div className="fact"><b>1.5 cm</b><span>default seam allowance, or ⅝ in</span></div>
          <div className="fact"><b>360°</b><span>turn any step to see it from your side</span></div>
          <div className="fact"><b>6</b><span>modules from threading to a first garment</span></div>
          <div className="fact"><b>A4 · Letter · A0</b><span>true-scale pattern printing</span></div>
        </div>
      </div>

      <section id="how">
        <div className="wrap">
          <span className="eyebrow">How it works</span>
          <h2 style={{ marginTop: 12 }}>From an idea to a finished seam in four steps</h2>
          <div className="steps">
            <div className="step"><h3>Tell us what to make</h3><p>Type a sentence, upload a photo of a garment you love, or choose a starter project.</p></div>
            <div className="step"><h3>AI drafts the plan</h3><p>It works out the pattern pieces for your measurements and the order to sew them in.</p></div>
            <div className="step"><h3>Watch it sewn in 3D</h3><p>Every step plays as an animated scene. Slow it down, rewind, or turn the fabric to see the back.</p></div>
            <div className="step"><h3>Print and sew along</h3><p>Print the pattern at true scale and keep the lesson open next to your machine.</p></div>
          </div>
        </div>
      </section>

      <section className="learn" id="learn">
        <div className="wrap learn-grid">
          <aside>
            <span className="eyebrow">Learn from scratch</span>
            <h2 style={{ marginTop: 12 }}>Never touched a sewing machine? Start here.</h2>
            <p className="lede">A guided path of short 3D lessons. Each one teaches one skill and ends with something small you actually make.</p>
            <ul>
              <li>Lessons adapt to your experience level and machine</li>
              <li>Mistake replays show what a wrong stitch looks like and how to fix it</li>
              <li>Ask questions mid-lesson and get an answer for that exact step</li>
            </ul>
          </aside>
          <ol className="path">
            {PATH.map((m, i) => (
              <li key={m.title} className={m.done ? 'done' : undefined}>
                <span className="n">{i + 1}</span>
                <div>
                  <h3>{m.title}</h3>
                  <p>{m.text}</p>
                  {m.watch && <WatchButton project={m.watch} className="watch">Watch lesson 1 in 3D</WatchButton>}
                </div>
                <span className="meta">{m.meta[0]}<br />{m.meta[1]}</span>
              </li>
            ))}
          </ol>
        </div>
      </section>

      <section id="photo">
        <div className="wrap">
          <span className="eyebrow">Photo to pattern</span>
          <h2 style={{ marginTop: 12 }}>Saw something you want to sew? Show us.</h2>
          <p className="lede" style={{ marginTop: 14 }}>Upload a photo of any garment. You get a printable paper pattern drafted to your measurements, a 3D video guide for every step, or both.</p>
          <PhotoToGuide />
        </div>
      </section>

      <section id="projects" style={{ paddingTop: 0 }}>
        <div className="wrap">
          <span className="eyebrow">Starter projects</span>
          <h2 style={{ marginTop: 12 }}>Small makes for your first month</h2>
          <div className="projects">
            {Object.entries(PROJECTS).map(([k, p]) => (
              <article className="proj" key={k}>
                <svg viewBox="0 0 72 72" aria-hidden="true" dangerouslySetInnerHTML={{ __html: p.icon }} />
                <div>
                  <h3>{p.name}</h3>
                  <div className="m">{p.level} · {p.time} · {p.count} piece{p.count > 1 ? 's' : ''}</div>
                </div>
                <WatchButton project={k}>Watch the first seam in 3D →</WatchButton>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="pricing" id="pricing">
        <div className="wrap">
          <span className="eyebrow">Pricing</span>
          <h2 style={{ marginTop: 12 }}>Learn for free. Upgrade when you start making your own designs.</h2>
          <div className="tiers">
            <div className="tier">
              <h3>Free</h3>
              <div className="price">$0</div>
              <ul><li>Modules 1 and 2 of the learning path</li><li>3 starter projects with 3D lessons</li><li>Print patterns in A4 and US Letter</li></ul>
              <a className="btn btn-ghost" href="#studio" style={{ color: 'var(--mat-text)' }}>Start free</a>
            </div>
            <div className="tier pop">
              <span className="tag">Most popular</span>
              <h3>Learner</h3>
              <div className="price">$7 <small>/ month</small></div>
              <ul><li>The full learning path, all 6 modules</li><li>All starter projects</li><li>Ask questions inside any lesson</li><li>20 generated lessons a month</li></ul>
              <a className="btn btn-spool" href="#studio">Try 14 days free</a>
            </div>
            <div className="tier">
              <h3>Maker</h3>
              <div className="price">$15 <small>/ month</small></div>
              <ul><li>Everything in Learner</li><li>Photo to pattern, drafted to your measurements</li><li>Unlimited 3D lessons for your own designs</li><li>Copy-shop and A0 printing</li></ul>
              <a className="btn btn-ghost" href="#studio" style={{ color: 'var(--mat-text)' }}>Choose Maker</a>
            </div>
          </div>
          <p className="note">Prices are placeholders for the prototype.</p>
        </div>
      </section>

      <section id="faq">
        <div className="wrap">
          <span className="eyebrow">Questions</span>
          <h2 style={{ marginTop: 12 }}>Before you thread the needle</h2>
          <div className="faq">
            {FAQ.map(([q, a], i) => (
              <details key={q} open={i === 0}><summary>{q}</summary><p>{a}</p></details>
            ))}
          </div>
        </div>
      </section>

      <section className="closing">
        <div className="wrap">
          <div>
            <h2>What will you sew first?</h2>
            <p>Pick a project and watch the first seam in 3D. No account needed.</p>
          </div>
          <a className="btn btn-spool" href="#studio">Open the 3D studio</a>
        </div>
      </section>

      <footer>
        <div className="wrap">
          <div>
            <a className="logo" href="#top" style={{ color: 'var(--on-mat)' }}>StitchCraft</a>
            <p style={{ marginTop: 10, maxWidth: '32ch' }}>Learn to sew by watching every step in 3D, then make it yourself.</p>
          </div>
          <div><h4>Product</h4><ul><li><a href="#studio">3D Studio</a></li><li><a href="#photo">Photo to pattern</a></li><li><a href="#pricing">Pricing</a></li></ul></div>
          <div><h4>Learn</h4><ul><li><a href="#learn">Learning path</a></li><li><a href="#projects">Starter projects</a></li><li><a href="#faq">FAQ</a></li></ul></div>
          <div><h4>Company</h4><ul><li><a href="#top">About</a></li><li><a href="#top">Contact</a></li><li>© 2026 StitchCraft</li></ul></div>
        </div>
      </footer>
    </>
  );
}
