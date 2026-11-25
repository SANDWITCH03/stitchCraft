import { PROJECTS } from './projects';

// Timeline of the seam lesson, in seconds per step.
export const DUR = [5, 4, 3.5, 7, 5.5];
export const START = [];
let acc = 0;
DUR.forEach((d) => { START.push(acc); acc += d; });
export const TOTAL = acc;

export const TITLES = ['Right sides together', 'Pin the edge', 'Lock the start', 'Sew the seam', 'Press it open'];

export const LEVELS = [
  { value: 'new', label: "I've never used a machine" },
  { value: 'some', label: "I've sewn a few things" },
  { value: 'pro', label: "I'm comfortable sewing" },
];

export const seamAllowance = (units) => (units === 'cm' ? '1.5 cm' : '⅝ in');

export function fmt(sec) {
  const s = Math.floor(sec);
  return Math.floor(s / 60) + ':' + String(s % 60).padStart(2, '0');
}

export function stepAt(t) {
  let idx = 0;
  for (let i = 0; i < START.length; i++) if (t >= START[i]) idx = i;
  return idx;
}

export function captionFor(i, { project, level, units }) {
  const p = PROJECTS[project];
  const tips = level === 'new';
  const SA = seamAllowance(units);
  return [
    `Lay the ${p.pieces} flat. Flip the top piece over so the printed sides face each other.` + (tips ? ' The printed side is called the right side.' : ''),
    `Pin across the seam line every ${units === 'cm' ? '6 to 7 cm' : '2½ in'}, heads toward you so you can pull them out as you sew.`,
    `Lower the foot ${SA} from the edge. Sew 3 stitches forward, 3 back, then forward again so the seam can't unravel.` + (tips ? ' Hold both thread tails for the first stitches.' : ''),
    `Keep the raw edge on the ${SA} line of the throat plate and let the machine feed the fabric. Pull each pin before the needle reaches it.`,
    'Open the pieces along the seam and press the allowance flat. A seam pressed open lies flat on the outside.',
  ][i];
}
