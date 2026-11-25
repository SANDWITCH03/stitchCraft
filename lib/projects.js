// Starter projects. Each one drives the 3D lesson (fabric, colours, captions)
// and the project cards further down the page.
export const PROJECTS = {
  tote: {
    name: 'Canvas tote bag', seam: 'Side seam', pieces: 'front and back panels', fabric: 'canvas',
    color: '#c99a3e', thread: '#1e3a5f', level: 'Beginner', time: '1.5 h', count: 3,
    icon: '<path d="M14 24 H58 L54 62 H18 Z"/><path d="M25 24 C25 8 47 8 47 24"/>',
  },
  skirt: {
    name: 'Gathered gingham skirt', seam: 'Side seam', pieces: 'skirt front and back', fabric: 'gingham',
    color: '#d4475c', thread: '#f7efe9', level: 'Beginner', time: '2.5 h', count: 3,
    icon: '<path d="M24 14 H48 L60 60 H12 Z"/><path d="M22 20 H50"/>',
  },
  pillow: {
    name: 'Envelope cushion cover', seam: 'Top edge seam', pieces: 'cushion front and back', fabric: 'linen',
    color: '#7f9db8', thread: '#e9b872', level: 'Beginner', time: '1 h', count: 3,
    icon: '<rect x="12" y="14" width="48" height="44" rx="3"/><path d="M12 30 L36 44 L60 30"/>',
  },
  shorts: {
    name: 'Pull-on denim shorts', seam: 'Inside leg seam', pieces: 'left and right fronts', fabric: 'denim',
    color: '#34548a', thread: '#e0a23a', level: 'Improver', time: '3 h', count: 4,
    icon: '<path d="M14 16 H58 L62 54 H40 L36 32 L32 54 H10 Z"/><path d="M14 22 H58"/>',
  },
  apron: {
    name: 'Linen kitchen apron', seam: 'Pocket seam', pieces: 'apron body and pocket', fabric: 'linen',
    color: '#a8b28c', thread: '#2e3d2a', level: 'Beginner', time: '1.5 h', count: 2,
    icon: '<path d="M26 10 H46 V22 L58 28 V62 H14 V28 L26 22 Z"/><rect x="26" y="40" width="20" height="12"/>',
  },
  scrunchie: {
    name: 'Silk scrunchie', seam: 'Tube seam', pieces: 'two halves of the tube', fabric: 'gingham',
    color: '#8a6bb5', thread: '#f7efe9', level: 'Beginner', time: '30 min', count: 1,
    icon: '<circle cx="36" cy="36" r="20"/><circle cx="36" cy="36" r="9"/><path d="M36 16 V27 M56 36 H45 M36 56 V45 M16 36 H27"/>',
  },
};

// Stand-in for the AI: picks a starter project from a free-text description.
export function pickFromText(text) {
  const s = text.toLowerCase();
  if (/skirt|gingham/.test(s)) return 'skirt';
  if (/cushion|pillow/.test(s)) return 'pillow';
  if (/short|jean|denim|trouser|pant/.test(s)) return 'shorts';
  if (/apron/.test(s)) return 'apron';
  if (/scrunch|hair/.test(s)) return 'scrunchie';
  return 'tote';
}

// Any button anywhere on the page can ask the 3D studio to play a lesson.
export const LESSON_EVENT = 'stitchcraft:lesson';
export function requestLesson(key) {
  window.dispatchEvent(new CustomEvent(LESSON_EVENT, { detail: { key } }));
}
