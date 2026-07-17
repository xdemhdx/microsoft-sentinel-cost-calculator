import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Input } from './ui/input';

interface VolumeInputProps {
  label: string;
  value: number;
  onChange: (value: number) => void;
  hint?: string;
}

export function VolumeInput({ label, value, onChange, hint }: VolumeInputProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>{label}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-2">
        <Input type="number" value={value} min={0} onChange={(e) => onChange(Number(e.target.value))} />
        {hint ? <p className="text-xs text-slate-400">{hint}</p> : null}
      </CardContent>
    </Card>
  );
}
