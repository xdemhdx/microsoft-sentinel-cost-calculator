import type { ReactNode } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';

interface CostSummaryCardProps {
  title: string;
  value: string;
  hint?: string;
  icon?: ReactNode;
}

export function CostSummaryCard({ title, value, hint, icon }: CostSummaryCardProps) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="text-xs text-slate-400">{title}</CardTitle>
        {icon}
      </CardHeader>
      <CardContent>
        <p className="text-2xl font-semibold text-slate-100">{value}</p>
        {hint ? <p className="mt-1 text-xs text-slate-400">{hint}</p> : null}
      </CardContent>
    </Card>
  );
}
