interface Props {
  params: Promise<{ hotelCode: string }>;
}

/**
 * Front-desk "More" — placeholder for profile / help / settings / logout.
 * Real auth + profile editing arrive later; for now this is a friendly stub
 * so the bottom-of-nav link doesn't 404.
 */
export default async function DeskMorePage({ params }: Props) {
  const { hotelCode } = await params;

  const sections: { title: string; subtitle: string }[] = [
    { title: 'Profile',  subtitle: 'Coming soon — staff profile + role.' },
    { title: 'Help',     subtitle: 'Quick guide for the front-desk module.' },
    { title: 'Settings', subtitle: 'Hotel preferences for this kiosk PC.' },
    { title: 'Logout',   subtitle: 'Sign out of the desk session.' },
  ];

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-xl font-bold" style={{ color: '#222' }}>More</h1>
        <p className="text-sm mt-0.5" style={{ color: '#929292' }}>
          {hotelCode} · settings + help
        </p>
      </div>

      <div className="grid grid-cols-2 gap-4">
        {sections.map((s) => (
          <div
            key={s.title}
            className="rounded-2xl p-5"
            style={{ background: '#ffffff', border: '1px solid #dddddd' }}
          >
            <p className="text-sm font-semibold" style={{ color: '#222' }}>{s.title}</p>
            <p className="text-xs mt-1" style={{ color: '#929292' }}>{s.subtitle}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
