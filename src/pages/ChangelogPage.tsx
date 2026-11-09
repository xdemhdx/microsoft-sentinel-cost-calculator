import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';

const items = [
  { date: '2026-03-07', title: 'Initial release', text: 'Delivered setup, sources, architecture, and cost dashboards with scenario comparison.' },
  { date: '2026-03-07', title: 'Cost intelligence', text: 'Added commitment tier optimization logic, AI advisor, and executive PDF report export.' },
  { date: '2026-03-07', title: 'Source catalog', text: 'Added 173 searchable connectors with virtualization support for performance.' },
];

export function ChangelogPage() {
  return (
    <Card>
      <CardHeader><CardTitle>Changelog</CardTitle></CardHeader>
      <CardContent className="space-y-3">
        {items.map((item) => (
          <div key={item.title} className="rounded-lg border border-white/[0.08] bg-nox-panel p-3.5">
            <p className="font-mono text-[11px] text-nox-accent">{item.date}</p>
            <p className="text-sm font-medium text-slate-100">{item.title}</p>
            <p className="text-sm text-slate-300">{item.text}</p>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}

