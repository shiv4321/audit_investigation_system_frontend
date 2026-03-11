/**
 * Soft yellow ambient glow background — fixed behind all content.
 */
export default function BackgroundGlow() {
  return (
    <div
      aria-hidden="true"
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 0,
        pointerEvents: 'none',
        overflow: 'hidden',
        background: '#fafaf7',
      }}
    >
      {/* Primary warm glow — top center */}
      <div
        style={{
          position: 'absolute',
          top: '-20%',
          left: '50%',
          transform: 'translateX(-50%)',
          width: '80vw',
          height: '70vh',
          borderRadius: '50%',
          background: 'radial-gradient(ellipse at center, rgba(253,224,71,0.28) 0%, rgba(253,224,71,0.08) 45%, transparent 70%)',
          filter: 'blur(48px)',
        }}
      />
      {/* Secondary accent — bottom right */}
      <div
        style={{
          position: 'absolute',
          bottom: '-10%',
          right: '-10%',
          width: '55vw',
          height: '55vh',
          borderRadius: '50%',
          background: 'radial-gradient(ellipse at center, rgba(251,191,36,0.18) 0%, rgba(251,191,36,0.05) 50%, transparent 70%)',
          filter: 'blur(64px)',
        }}
      />
      {/* Tertiary — mid left */}
      <div
        style={{
          position: 'absolute',
          top: '40%',
          left: '-15%',
          width: '45vw',
          height: '45vh',
          borderRadius: '50%',
          background: 'radial-gradient(ellipse at center, rgba(253,224,71,0.12) 0%, transparent 65%)',
          filter: 'blur(56px)',
        }}
      />
    </div>
  );
}
