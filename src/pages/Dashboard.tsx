import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Car, Fuel, TrendingDown, DollarSign, MapPin } from 'lucide-react';
import { LineChart, Line, ResponsiveContainer, Tooltip } from 'recharts';
import { api } from '../api';
import { calcStats, calcSegments, formatCurrency } from '../utils';
import type { Vehicle, FuelRecord } from '../types';
import { FUEL_TYPE_LABELS } from '../types';

export default function Dashboard() {
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [records, setRecords] = useState<FuelRecord[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([api.getVehicles(), api.getRecords()])
      .then(([v, r]) => { setVehicles(v); setRecords(r); })
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="text-center py-12 text-gray-400">加载中...</div>;

  const stats = calcStats(records);

  const statCards = [
    { icon: DollarSign, label: '总花费', value: formatCurrency(stats.totalCost), color: 'text-red-500' },
    { icon: Fuel, label: '总加油', value: `${stats.totalLiters} L`, color: 'text-orange-500' },
    { icon: MapPin, label: '总里程', value: `${stats.totalDistance} km`, color: 'text-blue-500' },
    { icon: TrendingDown, label: '平均油耗', value: `${stats.avgConsumption} L/100km`, color: 'text-green-500' },
  ];

  return (
    <div className="space-y-6 pb-4">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {statCards.map(card => {
          const Icon = card.icon;
          return (
            <div key={card.label} className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
              <div className="flex items-center gap-2 mb-2">
                <Icon className={`w-4 h-4 ${card.color}`} />
                <span className="text-xs text-gray-500">{card.label}</span>
              </div>
              <div className="text-lg font-bold text-gray-800">{card.value}</div>
            </div>
          );
        })}
      </div>

      <section>
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-base font-semibold text-gray-800">我的车辆</h2>
          <Link to="/vehicles/new" className="text-sm text-blue-600 hover:underline">+ 添加车辆</Link>
        </div>

        {vehicles.length === 0 ? (
          <div className="bg-white rounded-xl p-8 text-center border border-dashed border-gray-300">
            <Car className="w-12 h-12 text-gray-300 mx-auto mb-3" />
            <p className="text-gray-500 mb-3">还没有添加车辆</p>
            <Link to="/vehicles/new" className="inline-block bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700">
              添加第一辆车
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
            {vehicles.map(v => {
              const vRecords = records.filter(r => r.vehicle_id === v.id);
              const vStats = calcStats(vRecords);
              const segments = calcSegments(vRecords);
              return (
                <Link key={v.id} to={`/vehicles/${v.id}`}
                  className="bg-white rounded-xl p-4 shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="text-2xl">{v.avatar || '🚗'}</div>
                    <div className="flex-1 min-w-0">
                      <div className="font-semibold text-gray-800 truncate">{v.name}</div>
                      <div className="text-xs text-gray-400">{v.brand} {v.model} · {FUEL_TYPE_LABELS[v.fuel_type]}</div>
                    </div>
                    <div className="text-right">
                      <div className="text-sm font-medium text-gray-700">{vStats.avgConsumption ? `${vStats.avgConsumption} L/100km` : '暂无数据'}</div>
                      <div className="text-xs text-gray-400">{vStats.recordCount} 条记录</div>
                    </div>
                  </div>
                  {segments.length >= 2 ? (
                    <div className="h-24">
                      <ResponsiveContainer width="100%" height="100%">
                        <LineChart data={segments}>
                          <Tooltip
                            labelFormatter={() => ''}
                            formatter={(v: unknown) => [`${v} L/100km`, '油耗']}
                            contentStyle={{ fontSize: 12, padding: '4px 8px' }}
                          />
                          <Line type="monotone" dataKey="consumption" stroke="#3b82f6" strokeWidth={2} dot={false} />
                        </LineChart>
                      </ResponsiveContainer>
                    </div>
                  ) : (
                    <div className="h-24 flex items-center justify-center text-xs text-gray-300">
                      需要至少2条加满记录才能绘制趋势
                    </div>
                  )}
                </Link>
              );
            })}
          </div>
        )}
      </section>
    </div>
  );
}
