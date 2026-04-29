import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-6"
         style={{ background: '#f7f7f7' }}>
      <div className="text-center max-w-sm">
        <p className="text-5xl font-bold mb-4" style={{ color: '#dddddd' }}>404</p>
        <h1 className="text-xl font-semibold mb-2" style={{ color: '#222222' }}>
          Persona not yet built
        </h1>
        <p className="text-sm mb-6" style={{ color: '#6a6a6a' }}>
          This persona's interface is coming in the next phase.
        </p>
        <Link
          href="/web"
          className="inline-block text-sm font-semibold underline"
          style={{ color: '#ff385c' }}
        >
          ← Return to persona picker
        </Link>
      </div>
    </div>
  );
}
