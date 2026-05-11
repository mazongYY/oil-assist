import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Car, Trash2 } from 'lucide-react';
import { api } from '../api';
import { calcStats } from '../utils';
import type { Vehicle, FuelRecord } from '../types';
import { FUEL_TYPE_LABELS } from '../types';

export default function Vehicles() {
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [records, setRecords] = useState<FuelRecord[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([api.getVehicles(), api.getRecords()])
      .then(([v, r]) => { setVehicles(v); setRecords(r); })
      .finally(() => setLoading(false));
  }, []);

  const handleDelete = async (id: string, name: string) => {
    if (window.confirm(`确定删除车辆「${name}」及其所有加油记录？`)) {
      await api.deleteVehicle(id);
      setVehicles(v => v.filter(x => x.id !== id));
      setRecords(r => r.filter(x => x.vehicle_id !== id));
    }
  };

  if (loading) return <div className="text-center py-12 text-gray-400">加载中...</div>;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-lg font-bold text-gray-800">我的车辆</h1>
        <Link to="/vehicles/new" className="bg-blue-600 text-white px-3 py-1.5 rounded-lg text-sm font-medium hover:bg-blue-700">
          + 添加车辆
        </Link>
      </div>

      {vehicles.length === 0 ? (
        <div className="bg-white rounded-xl p-10 text-center border border-dashed border-gray-300">
          <Car className="w-14 h-14 text-gray-300 mx-auto mb-3" />
          <p className="text-gray-500 mb-4">还没有添加车辆</p>
          <Link to="/vehicles/new" className="inline-block bg-blue-600 text-white px-5 py-2.5 rounded-lg text-sm font-medium hover:bg-blue-700">
            添加第一辆车
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
          {vehicles.map(v => {
            const vRecords = records.filter(r => r.vehicle_id === v.id);
            const stats = calcStats(vRecords);
            return (
              <div key={v.id} className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
                <div className="flex items-start gap-3">
                  <div className="text-4xl">{v.avatar || '🚗'}</div>
                  <div className="flex-1 min-w-0">
                    <div className="font-semibold text-gray-800 text-lg">{v.name}</div>
                    <div className="text-sm text-gray-500 mt-0.5">{v.brand} {v.model}</div>
                    <div className="text-xs text-gray-400 mt-1">
                      {v.plate_number} · {FUEL_TYPE_LABELS[v.fuel_type]} · 油箱 {v.tank_capacity}L
                    </div>
                    <div className="flex gap-4 mt-2 text-xs text-gray-500">
                      <span>{stats.recordCount} 条记录</span>
                      <span>{stats.totalDistance} km</span>
                      <span>油耗 {stats.avgConsumption} L/100km</span>
                    </div>
                  </div>
                  <button onClick={() => handleDelete(v.id, v.name)} className="p-2 text-gray-400 hover:text-red-500 transition-colors" title="删除车辆">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
                <div className="flex gap-2 mt-3">
                  <Link to={`/vehicles/${v.id}`} className="flex-1 text-center py-2 text-sm text-blue-600 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors">
                    查看详情
                  </Link>
                  <Link to={`/records/new?vehicleId=${v.id}`} className="flex-1 text-center py-2 text-sm text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors">
                    记一笔
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
