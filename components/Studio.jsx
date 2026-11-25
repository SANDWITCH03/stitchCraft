'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { PROJECTS, pickFromText, LESSON_EVENT } from '@/lib/projects';
import { TITLES, START, TOTAL, LEVELS, fmt, captionFor } from '@/lib/lesson';
import { createLessonEngine } from '@/lib/lessonEngine';

const CHIPS = [
  ['Gingham skirt', 'A gathered gingham skirt with an elastic waist'],
  ['Envelope cushion', 'An envelope cushion cover, 45 × 45 cm'],
  ['Denim shorts', 'Pull-on denim shorts'],
  ['Linen apron', 'A linen kitchen apron with a pocket'],
];
const GEN_STAGES = ['Reading the garment', 'Drafting pattern pieces to your size', 'Planning the sewing order', 'Building the 3D scene'];
const levelLabel = (v) => LEVELS.find((l) => l.value === v).label;

export default function Studio() {
  // generator form
  const [tab, setTab] = useState('describe');
  const [text, setText] = useState('A canvas tote bag with long handles');
  const [photo, setPhoto] = useState(null);
  const [pick, setPick] = useState('tote');
  const [levelChoice, setLevelChoice] = useState('some');

  // current lesson
  const [lesson, setLesson] = useState({ project: 'tote', level: 'some', why: '' });
  const [units, setUnits] = useState('cm');
  const [step, setStep] = useState(0);
  const [playing, setPlaying] = useState(true);
  const [speed, setSpeed] = useState('1');
  const [view, setView] = useState('auto');
  const [genStage, setGenStage] = useState(-1); // -1 = overlay hidden
  const [webgl, setWebgl] = useState(true);

  const stageRef = useRef(null), canvasRef = useRef(null), labelRef = useRef(null), scrubRef = useRef(null), timeRef = useRef(null);
  const engine = useRef(null);
  const unitsRef = useRef(units);
  const timers = useRef([]);
  unitsRef.current = units;

  useEffect(() => {
    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const e = createLessonEngine({
      stage: stageRef.current, canvas: canvasRef.current, label: labelRef.current,
      scrub: scrubRef.current, timeEl: timeRef.current,
      getUnits: () => unitsRef.current, onStep: setStep, onPlaying: setPlaying, onView: setView, reduceMotion,
    });
    engine.current = e;
    setWebgl(e.webgl);
    return () => { e.destroy(); engine.current = null; timers.current.forEach(clearTimeout); };
  }, []);

  // Simulated AI generation. The real version will call an API that returns a lesson plan.
  const loadLesson = useCallback((key, why = '') => {
    const e = engine.current; if (!e) return;
    timers.current.forEach(clearTimeout); timers.current = [];
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const stepMs = reduce ? 250 : 750;
    e.setGenerating(true);
    setGenStage(0);
    GEN_STAGES.forEach((_, i) => { if (i > 0) timers.current.push(setTimeout(() => setGenStage(i), i * stepMs)); });
    timers.current.push(setTimeout(() => {
      setGenStage(GEN_STAGES.length);
      setLesson({ project: key, level: levelChoice, why });
      e.loadProject(key);
      timers.current.push(setTimeout(() => { setGenStage(-1); e.setGenerating(false); }, 250));
    }, GEN_STAGES.length * stepMs));
  }, [levelChoice]);

  // Buttons elsewhere on the page ("Watch in 3D") ask for a lesson through a window event.
  const loadRef = useRef(loadLesson);
  loadRef.current = loadLesson;
  useEffect(() => {
    const onReq = (ev) => {
      const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
      document.getElementById('studio')?.scrollIntoView({ behavior: reduce ? 'auto' : 'smooth' });
      loadRef.current(ev.detail.key);
    };
    window.addEventListener(LESSON_EVENT, onReq);
    return () => window.removeEventListener(LESSON_EVENT, onReq);
  }, []);

  useEffect(() => () => { if (photo) URL.revokeObjectURL(photo); }, [photo]);

  const generate = () => {
    if (tab === 'describe') loadLesson(pickFromText(text));
    else if (tab === 'photo') loadLesson('skirt', photo ? 'from your photo' : 'sample photo');
    else loadLesson(pick);
  };

  const p = PROJECTS[lesson.project];
  const tabBtn = (id, label) => (
    <button role="tab" id={`tab-${id}`} aria-selected={tab === id} aria-controls={`panel-${id}`} onClick={() => setTab(id)}>{label}</button>
  );

  return (
    <header className="hero" id="studio">
      <div className="wrap hero-grid">
        <div>
          <span className="eyebrow">3D sewing lessons, generated for you</span>
          <h1>See every stitch <em>before</em> you sew it.</h1>
          <p className="lede">Describe a garment or upload a photo. StitchCraft plans the pattern and the sewing order, then plays the whole thing as a 3D lesson you can pause, rewind and turn around.</p>

          <div className="gen">
            <div className="tabs" role="tablist" aria-label="How to start">
              {tabBtn('describe', 'Describe it')}
              {tabBtn('photo', 'Upload a photo')}
              {tabBtn('project', 'Pick a project')}
            </div>
            <div role="tabpanel" id="panel-describe" aria-labelledby="tab-describe" hidden={tab !== 'describe'}>
              <label className="small" htmlFor="gen-text">What do you want to sew?</label>
              <textarea id="gen-text" value={text} onChange={(e) => setText(e.target.value)} />
              <div className="chips">
                {CHIPS.map(([label, fill]) => (
                  <button key={label} className="chip" onClick={() => setText(fill)}>{label}</button>
                ))}
              </div>
            </div>
            <div role="tabpanel" id="panel-photo" aria-labelledby="tab-photo" hidden={tab !== 'photo'}>
              <label className="small" htmlFor="gen-photo">Photo, screenshot or Pinterest save</label>
              <label className="drop" htmlFor="gen-photo">
                {photo ? <img src={photo} alt="Your photo" /> : <span className="ph" aria-hidden="true" />}
                <span><strong>Choose an image</strong><small>JPG, PNG or WebP up to 15 MB. Front view works best.</small></span>
              </label>
              <input type="file" id="gen-photo" accept="image/*" hidden onChange={(e) => {
                const f = e.target.files?.[0]; if (f) setPhoto(URL.createObjectURL(f));
              }} />
            </div>
            <div role="tabpanel" id="panel-project" aria-labelledby="tab-project" hidden={tab !== 'project'}>
              <label className="small" htmlFor="gen-project">Starter project</label>
              <select id="gen-project" value={pick} onChange={(e) => setPick(e.target.value)}>
                {Object.entries(PROJECTS).map(([k, pr]) => <option key={k} value={k}>{pr.name}</option>)}
              </select>
            </div>
            <div className="gen-row">
              <div>
                <label className="small" htmlFor="gen-level">Your experience</label>
                <select id="gen-level" value={levelChoice} onChange={(e) => setLevelChoice(e.target.value)}>
                  {LEVELS.map((l) => <option key={l.value} value={l.value}>{l.label}</option>)}
                </select>
              </div>
              <button className="btn btn-spool" onClick={generate}>Generate 3D lesson</button>
            </div>
          </div>
          <div className="ruler" aria-hidden="true">
            {['0', '1', '2', '3', '4', '5', '6', '7', '8 cm'].map((n) => <span key={n}>{n}</span>)}
          </div>
        </div>

        <div className="player" aria-label="3D lesson player">
          <div className="player-head">
            <div className="t">
              <span>{p.seam} · {p.name}</span>
              <small>Lesson 1 of 6 · {fmt(TOTAL)} · drafted for: {levelLabel(lesson.level)}{lesson.why ? ' · ' + lesson.why : ''}</small>
            </div>
            <span className="badge">Live 3D · AI-planned</span>
          </div>
          <div className="stage" ref={stageRef}>
            <canvas ref={canvasRef} aria-label="3D view of the seam being sewn. Drag to turn the view." />
            <div className="label3d" ref={labelRef} />
            <div className="hint">Drag to turn</div>
            <div className="caption">
              <b>Step {step + 1} · {TITLES[step]}</b>
              {captionFor(step, { project: lesson.project, level: lesson.level, units })}
            </div>
            {!webgl && (
              <div className="nogl">3D needs WebGL, which this browser has turned off. The lesson steps are listed below the player.</div>
            )}
            <div className="gen-overlay" hidden={genStage < 0}>
              <ol>
                {GEN_STAGES.map((s, i) => (
                  <li key={s} className={i < genStage ? 'done' : i === genStage ? 'on' : ''}><i />{s}</li>
                ))}
              </ol>
            </div>
          </div>
          <div className="bar">
            <button className="play" aria-label={playing ? 'Pause' : 'Play'} onClick={() => engine.current?.togglePlay()}>
              <svg width="14" height="14" viewBox="0 0 14 14">
                {playing
                  ? <><rect x="2" y="1" width="3.5" height="12" fill="currentColor" /><rect x="8.5" y="1" width="3.5" height="12" fill="currentColor" /></>
                  : <path d="M3 1 L13 7 L3 13 Z" fill="currentColor" />}
              </svg>
            </button>
            <input type="range" ref={scrubRef} min="0" max="1000" defaultValue="0" aria-label="Lesson position"
              onInput={(e) => engine.current?.seekFraction(+e.currentTarget.value / 1000)} />
            <span className="time" ref={timeRef}>0:00 / {fmt(TOTAL)}</span>
            <select aria-label="Speed" value={speed} onChange={(e) => { setSpeed(e.target.value); engine.current?.setSpeed(+e.target.value); }}>
              <option value="0.5">0.5×</option><option value="1">1×</option><option value="1.5">1.5×</option>
            </select>
            <select aria-label="Camera" value={view} onChange={(e) => { setView(e.target.value); engine.current?.setView(e.target.value); }}>
              <option value="auto">Camera: guided</option>
              <option value="top">Camera: overhead</option>
              <option value="side">Camera: side</option>
              <option value="close">Camera: needle</option>
              <option value="free">Camera: free</option>
            </select>
            <button className="unit" aria-label="Switch units" onClick={() => setUnits(units === 'cm' ? 'in' : 'cm')}>{units}</button>
          </div>
          <ol className="chapters">
            {TITLES.map((title, i) => (
              <li key={title}>
                <button className={i === step ? 'active' : i < step ? 'past' : ''} onClick={() => engine.current?.seekStep(i)}>
                  <span>{fmt(START[i])}</span>{title}
                </button>
              </li>
            ))}
          </ol>
        </div>
      </div>
    </header>
  );
}
