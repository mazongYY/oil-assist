import type { FuelRecord, StatsSummary } from './types';

export function calcStats(records: FuelRecord[]): StatsSummary {
  if (records.length === 0) {
    return { totalCost: 0, totalLiters: 0, totalDistance: 0, avgConsumption: 0, avgCostPerKm: 0, recordCount: 0 };
  }

  const sorted = [...records].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

  let totalCost = 0;
  let totalLiters = 0;
  let totalDistance = 0;

  for (const r of sorted) {
    totalCost += r.total_cost;
    totalLiters += r.liters;
  }

  const fullRecords = sorted.filter(r => r.is_full);
  if (fullRecords.length >= 2) {
    totalDistance = fullRecords[fullRecords.length - 1].odometer - fullRecords[0].odometer;
  } else if (sorted.length >= 2) {
    totalDistance = sorted[sorted.length - 1].odometer - sorted[0].odometer;
  }

  const avgConsumption = totalDistance > 0 ? (totalLiters / totalDistance) * 100 : 0;
  const avgCostPerKm = totalDistance > 0 ? totalCost / totalDistance : 0;

  return {
    totalCost: Math.round(totalCost * 100) / 100,
    totalLiters: Math.round(totalLiters * 100) / 100,
    totalDistance: Math.round(totalDistance),
    avgConsumption: Math.round(avgConsumption * 100) / 100,
    avgCostPerKm: Math.round(avgCostPerKm * 100) / 100,
    recordCount: records.length,
  };
}

export function calcSegments(records: FuelRecord[]): Array<{
  date: string;
  consumption: number;
  costPerKm: number;
  distance: number;
  liters: number;
  cost: number;
}> {
  const sorted = [...records]
    .filter(r => r.is_full)
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

  const segments = [];
  for (let i = 1; i < sorted.length; i++) {
    const prev = sorted[i - 1];
    const curr = sorted[i];
    const distance = curr.odometer - prev.odometer;
    const betweenRecords = records
      .filter(r => {
        const d = new Date(r.date).getTime();
        return d > new Date(prev.date).getTime() && d <= new Date(curr.date).getTime();
      })
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

    const liters = betweenRecords.reduce((sum, r) => sum + r.liters, 0);
    const cost = betweenRecords.reduce((sum, r) => sum + r.total_cost, 0);

    if (distance > 0) {
      segments.push({
        date: curr.date,
        consumption: Math.round((liters / distance) * 10000) / 100,
        costPerKm: Math.round((cost / distance) * 100) / 100,
        distance,
        liters: Math.round(liters * 100) / 100,
        cost: Math.round(cost * 100) / 100,
      });
    }
  }
  return segments;
}

export function formatCurrency(value: number): string {
  return `¥${value.toFixed(2)}`;
}

export function formatDate(iso: string): string {
  const d = new Date(iso);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}
