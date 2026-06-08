// ---------------------------------------------------------------------------
// Full-screen festive background image, sitting behind everything.
// Swap it by replacing /public/background.svg (or set BACKGROUND_IMAGE below
// to a photo you drop in /public, e.g. '/background.jpg'). A dark veil keeps
// the foreground readable on top of any image.
// ---------------------------------------------------------------------------

const BACKGROUND_IMAGE = '/background.svg'

export default function Background() {
  return (
    <div aria-hidden className="pointer-events-none fixed inset-0 -z-10">
      <div
        className="absolute inset-0 bg-cover bg-center bg-no-repeat"
        style={{ backgroundImage: `url('${BACKGROUND_IMAGE}')` }}
      />
      {/* Dark veil + aurora tint so foreground stays readable */}
      <div className="absolute inset-0 bg-ink/70" />
      <div
        className="absolute inset-0"
        style={{
          backgroundImage:
            'radial-gradient(60% 50% at 20% 10%, rgba(168,85,247,0.18), transparent 60%),' +
            'radial-gradient(50% 50% at 85% 15%, rgba(56,189,248,0.16), transparent 60%),' +
            'radial-gradient(55% 45% at 50% 100%, rgba(255,61,181,0.16), transparent 60%)',
        }}
      />
    </div>
  )
}
