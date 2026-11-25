'use client';

import { useEffect, useRef, useState } from 'react';
import WatchButton from './WatchButton';

const VIDEO_STEPS = [
  ['Cut and mark the pieces', '1:10'],
  ['Sew the back seam and insert the zip', '2:40'],
  ['Sew the side seams', '1:25'],
  ['Attach the waistband', '2:05'],
  ['Buttonhole and button', '1:30'],
  ['Hem the skirt', '1:15'],
];
const GRID_X = Array.from({ length: 26 }, (_, i) => 10 + i * 20);
const GRID_Y = Array.from({ length: 16 }, (_, i) => 10 + i * 20);

export default function PhotoToGuide() {
  const [photo, setPhoto] = useState(null);
  const [status, setStatus] = useState('Detected: A-line skirt, knee length, waistband with button.');
  const [tab, setTab] = useState('paper');
  const timers = useRef([]);

  useEffect(() => () => timers.current.forEach(clearTimeout), []);
  useEffect(() => () => { if (photo) URL.revokeObjectURL(photo); }, [photo]);

  // Simulated analysis. The real version will send the photo to a vision model.
  const makeGuide = () => {
    timers.current.forEach(clearTimeout);
    const msgs = ['Finding the garment outline…', 'Matching seams and closures…', 'Drafting 3 pieces for EU 38…', 'Done. Pattern and 3D guide ready (sample result).'];
    timers.current = msgs.map((m, i) => setTimeout(() => setStatus(m), i * 700));
  };

  const tabBtn = (id, label) => (
    <button role="tab" id={`rt-${id}`} aria-selected={tab === id} aria-controls={`rp-${id}`} onClick={() => setTab(id)}>{label}</button>
  );

  return (
    <div className="p2g">
      <div className="card">
        <div className="photo">
          {photo ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={photo} alt="Your uploaded garment photo" />
          ) : (
            <svg viewBox="0 0 200 250" width="100%" height="100%" aria-label="Sample photo: a red gingham A-line skirt">
              <defs>
                <pattern id="ging" width="16" height="16" patternUnits="userSpaceOnUse">
                  <rect width="16" height="16" fill="#f7efe9" />
                  <rect width="8" height="16" fill="#d4475c" opacity=".45" />
                  <rect width="16" height="8" fill="#d4475c" opacity=".45" />
                </pattern>
              </defs>
              <rect width="200" height="250" fill="#e6ece7" />
              <path d="M72 40 L128 40 L162 210 Q100 222 38 210 Z" fill="url(#ging)" stroke="#9b3242" strokeWidth="1.5" />
              <rect x="70" y="32" width="60" height="12" rx="2" fill="#d4475c" />
              <circle cx="122" cy="38" r="3" fill="#f7efe9" />
            </svg>
          )}
          <span className="tagx">{photo ? 'Your photo' : 'Sample photo'}</span>
        </div>
        <div className="actions">
          <label className="btn btn-ghost" htmlFor="p2g-file" style={{ color: 'var(--mat-text)' }}>Upload your photo</label>
          <input type="file" id="p2g-file" accept="image/*" hidden onChange={(e) => {
            const f = e.target.files?.[0]; if (!f) return;
            setPhoto(URL.createObjectURL(f)); setStatus('Ready. Press "Make my guide".');
          }} />
          <button className="btn btn-mat" onClick={makeGuide}>Make my guide</button>
        </div>
        <p className="status" aria-live="polite">{status}</p>
      </div>

      <div className="card">
        <div className="result-head">
          <div className="tabs" role="tablist" aria-label="Guide type">
            {tabBtn('paper', 'Paper pattern')}
            {tabBtn('video', '3D video guide')}
          </div>
          <span className="eyebrow">Size EU 38 · 3 pieces</span>
        </div>
        <div role="tabpanel" id="rp-paper" aria-labelledby="rt-paper" hidden={tab !== 'paper'}>
          <svg className="pattern-svg" viewBox="0 0 520 330" role="img" aria-label="Pattern pieces: front skirt cut one on fold, back skirt cut two, waistband cut one on fold">
            <g className="grid">
              {GRID_X.map((x) => <line key={'x' + x} x1={x} y1="0" x2={x} y2="330" />)}
              {GRID_Y.map((y) => <line key={'y' + y} x1="0" y1={y} x2="520" y2={y} />)}
            </g>
            <path className="cut" d="M30 40 Q95 32 160 44 L212 300 L30 300 Z" />
            <path className="sew" d="M30 54 Q95 46 150 57 L198 288 L30 288" />
            <line className="fold" x1="30" y1="40" x2="30" y2="300" />
            <text x="22" y="230" transform="rotate(-90 22 230)">PLACE ON FOLD</text>
            <path className="grain" d="M150 95 V245 M144 103 L150 95 L156 103 M144 237 L150 245 L156 237" />
            <path className="cut" d="M182 168 l9 -5 l2 10 z" style={{ fill: 'var(--ink)' }} />
            <text className="big" x="70" y="150">A</text>
            <text x="70" y="168">Front skirt</text>
            <text x="70" y="182">Cut 1 on fold</text>

            <path className="cut" d="M262 44 Q330 34 396 40 L412 300 L236 300 Z" />
            <path className="sew" d="M273 57 Q330 48 386 53 L400 288 L250 288 Z" />
            <path className="grain" d="M325 95 V245 M319 103 L325 95 L331 103 M319 237 L325 245 L331 237" />
            <text className="big" x="340" y="150">B</text>
            <text x="340" y="168">Back skirt</text>
            <text x="340" y="182">Cut 2</text>
            <text x="252" y="80" transform="rotate(-84 252 80)">ZIP 18 cm</text>

            <rect className="cut" x="446" y="40" width="46" height="260" />
            <rect className="sew" x="453" y="47" width="32" height="246" />
            <line className="fold" x1="446" y1="40" x2="446" y2="300" />
            <text className="big" x="463" y="120">C</text>
            <text x="474" y="150" transform="rotate(90 474 150)">Waistband · cut 1 on fold</text>
            <text x="30" y="322">— cutting line   - - stitching line (1.5 cm)   ▲ notch   ↕ grainline</text>
          </svg>
          <dl className="specs">
            <div><dt>Waist</dt><dd>72 cm</dd></div>
            <div><dt>Hip</dt><dd>98 cm</dd></div>
            <div><dt>Fabric</dt><dd>1.4 m × 140 cm</dd></div>
            <div><dt>Notions</dt><dd>18 cm zip, 1 button</dd></div>
          </dl>
        </div>
        <div role="tabpanel" id="rp-video" aria-labelledby="rt-video" hidden={tab !== 'video'}>
          <ol className="vsteps">
            {VIDEO_STEPS.map(([s, d]) => <li key={s}><div>{s}</div><small>{d}</small></li>)}
          </ol>
          <WatchButton project="skirt" className="btn btn-mat" style={{ marginTop: 16 }}>Watch &quot;Sew the side seams&quot; in 3D</WatchButton>
        </div>
        <p className="proto">Prototype: the guide on the right is a sample result. In the real product it is drafted from your photo and saved measurements.</p>
      </div>
    </div>
  );
}
