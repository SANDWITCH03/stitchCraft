import './globals.css';

export const metadata = {
  title: 'StitchCraft · Learn to sew in 3D',
  description: 'Learn to sew from scratch with interactive 3D lessons, and turn a photo of a garment into a step-by-step stitching guide.',
};

export const viewport = {
  viewportFit: 'cover',
  themeColor: '#4a0f18',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <head>
        {/* Arial Narrow is used where installed; Archivo Narrow is the free web fallback. */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
        <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Archivo+Narrow:wght@400;500;600;700&display=swap" />
      </head>
      <body>{children}</body>
    </html>
  );
}
