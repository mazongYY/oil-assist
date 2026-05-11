import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Fuel, Trash2 } from 'lucide-react';
import { api } from '../api';
import { formatCurrency, formatDate } from '../utils';
import type { FuelRecord, Vehicle } from '../types';

export default function Records() {
  const [records, setRecords] = useState<FuelRecord[]>([]);
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([api.getRecords(), api.getVehicles()])
      .then(([r, v]) => { setRecords(r); setVehicles(v); })
      .finally(() => setLoading(false));
  }, []);

  const handleDelete = async (id: string) => {
    if (window.confirm('确定删除这条记录？')) {
      await api.deleteRecord(id);
      setRecords(r => r.filter(x => x.id !== id));
    }
  };

  if (loading) return <div className="text-center py-12 text-gray-400">加载中...</div>;

  const sorted = [...records].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-lg font-bold text-gray-800">加油记录</h1>
        <Link to="/records/new" className="bg-blue-600 text-white px-3 py-1.5 rounded-lg text-sm font-medium hover:bg-blue-700">
          + 记一笔
        </Link>
      </div>

      {sorted.length === 0 ? (
        <div className="bg-white rounded-xl p-10 text-center border border-dashed border-gray-300">
          <Fuel className="w-14 h-14 text-gray-300 mx-auto mb-3" />
          <p className="text-gray-500 mb-4">还没有加油记录</p>
          <Link to="/records/new" className="inline-block bg-blue-600 text-white px-5 py-2.5 rounded-lg text-sm font-medium hover:bg-blue-700">
            添加第一条记录
          </Link>
        </div>
      ) : (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 divide-y divide-gray-50 lg:grid lg:grid-cols-2 lg:divide-y-0 lg:divide-x lg:divide-gray-100">
          {sorted.map(r => {
            const vehicle = vehicles.find(v => v.id === r.vehicle_id);
            return (
              <div key={r.id} className="px-4 py-3 lg:border-b lg:border-gray-50">
                <div className="flex items-center gap-3">
                  <div className="text-2xl">{vehicle?.avatar || '🚗'}</div>
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-medium text-gray-800">{vehicle?.name || '未知车辆'}</div>
                    <div className="text-xs text-gray-400 mt-0.5">
                      {formatDate(r.date)} · {r.station || '未知加油站'}
                    </div>
                    <div className="text-xs text-gray-400">
                      {r.liters}L × ¥{r.price_per_liter}/L · {r.odometer}km
                      {r.is_full && <span className="ml-1 text-green-500">[加满]</span>}
                      {r.low_fuel_light && <span className="ml-1 text-orange-500">[灯亮]</span>}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-bold text-gray-800">{formatCurrency(r.total_cost)}</span>
                    <button onClick={() => handleDelete(r.id)} className="p-1 text-gray-300 hover:text-red-500">
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
