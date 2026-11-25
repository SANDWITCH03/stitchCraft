'use client';

import { requestLesson } from '@/lib/projects';

// Scrolls up to the 3D studio and plays the lesson for a starter project.
export default function WatchButton({ project, className, style, children }) {
  return (
    <button className={className} style={style} onClick={() => requestLesson(project)}>
      {children}
    </button>
  );
}
