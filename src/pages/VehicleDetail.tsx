import { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { ArrowLeft, Edit, Trash2 } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { api } from '../api';
import { calcStats, calcSegments, formatCurrency, formatDate } from '../utils';
import type { Vehicle, FuelRecord } from '../types';
import { FUEL_TYPE_LABELS } from '../types';

export default function VehicleDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [vehicle, setVehicle] = useState<Vehicle | null>(null);
  const [records, setRecords] = useState<FuelRecord[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) return;
    Promise.all([api.getVehicle(id), api.getRecords(id)])
      .then(([v, r]) => { setVehicle(v); setRecords(r); })
      .catch(() => navigate('/vehicles'))
      .finally(() => setLoading(false));
  }, [id, navigate]);

  if (loading) return <div className="text-center py-12 text-gray-400">加载中...</div>;
  if (!vehicle) return null;

  const stats = calcStats(records);
  const segments = calcSegments(records);

  const handleDeleteRecord = async (recordId: string) => {
    if (window.confirm('确定删除这条记录？')) {
      await api.deleteRecord(recordId);
      setRecords(r => r.filter(x => x.id !== recordId));
    }
  };

  return (
    <div className="space-y-4 pb-4">
      <div className="flex items-center gap-3">
        <button onClick={() => navigate(-1)} className="p-1 text-gray-500 hover:text-gray-700">
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div className="flex-1">
          <h1 className="text-lg font-bold text-gray-800 flex items-center gap-2">
            <span>{vehicle.avatar || '🚗'}</span>{vehicle.name}
          </h1>
          <p className="text-xs text-gray-400">
            {vehicle.brand} {vehicle.model} · {vehicle.plate_number} · {FUEL_TYPE_LABELS[vehicle.fuel_type]}
          </p>
        </div>
        <Link to={`/vehicles/${id}/edit`} className="p-2 text-gray-400 hover:text-blue-600">
          <Edit className="w-4 h-4" />
        </Link>
      </div>

      <div className="grid grid-cols-3 lg:grid-cols-5 gap-2">
        <div className="bg-white rounded-xl p-3 text-center border border-gray-100">
          <div className="text-xs text-gray-400 mb-1">总花费</div>
          <div className="text-sm font-bold text-red-500">{formatCurrency(stats.totalCost)}</div>
        </div>
        <div className="bg-white rounded-xl p-3 text-center border border-gray-100">
          <div className="text-xs text-gray-400 mb-1">总里程</div>
          <div className="text-sm font-bold text-blue-500">{stats.totalDistance} km</div>
        </div>
        <div className="bg-white rounded-xl p-3 text-center border border-gray-100">
          <div className="text-xs text-gray-400 mb-1">平均油耗</div>
          <div className="text-sm font-bold text-green-500">{stats.avgConsumption}</div>
        </div>
        <div className="hidden lg:block bg-white rounded-xl p-3 text-center border border-gray-100">
          <div className="text-xs text-gray-400 mb-1">总加油</div>
          <div className="text-sm font-bold text-orange-500">{stats.totalLiters} L</div>
        </div>
        <div className="hidden lg:block bg-white rounded-xl p-3 text-center border border-gray-100">
          <div className="text-xs text-gray-400 mb-1">每公里成本</div>
          <div className="text-sm font-bold text-purple-500">
            {stats.totalDistance > 0 ? `¥${(stats.totalCost / stats.totalDistance).toFixed(2)}` : '-'}
          </div>
        </div>
      </div>

      {segments.length >= 2 && (
        <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
          <h3 className="text-sm font-semibold text-gray-700 mb-3">油耗趋势 (L/100km)</h3>
          <div className="h-48 lg:h-64">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={segments}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="date" tickFormatter={formatDate} tick={{ fontSize: 11 }} />
                <YAxis tick={{ fontSize: 11 }} />
                <Tooltip labelFormatter={(v: unknown) => formatDate(String(v))} formatter={(v: unknown) => [`${v} L/100km`, '油耗']} />
                <Line type="monotone" dataKey="consumption" stroke="#3b82f6" strokeWidth={2} dot={{ r: 4 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold text-gray-700">加油记录</h3>
        <Link to={`/records/new?vehicleId=${id}`} className="text-sm text-blue-600 hover:underline">+ 记一笔</Link>
      </div>

      {records.length === 0 ? (
        <div className="bg-white rounded-xl p-8 text-center border border-dashed border-gray-300">
          <p className="text-gray-500 mb-3">还没有加油记录</p>
          <Link to={`/records/new?vehicleId=${id}`} className="inline-block bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700">
            添加第一条记录
          </Link>
        </div>
      ) : (
        <div className="space-y-2">
          {records.map(r => (
            <div key={r.id} className="bg-white rounded-xl p-3 shadow-sm border border-gray-100 flex items-center gap-3">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium text-gray-800">{formatDate(r.date)}</span>
                  {r.is_full && <span className="text-green-500 text-xs">[加满]</span>}
                  {r.low_fuel_light && <span className="text-orange-500 text-xs">[灯亮]</span>}
                </div>
                <div className="text-xs text-gray-400 mt-0.5">
                  {r.liters}L × ¥{r.price_per_liter}/L = {formatCurrency(r.total_cost)} · {r.odometer}km
                  {r.station && ` · ${r.station}`}
                </div>
              </div>
              <div className="flex gap-1">
                <Link to={`/records/${r.id}/edit`} className="p-1.5 text-gray-400 hover:text-blue-600">
                  <Edit className="w-3.5 h-3.5" />
                </Link>
                <button onClick={() => handleDeleteRecord(r.id)} className="p-1.5 text-gray-400 hover:text-red-500">
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
