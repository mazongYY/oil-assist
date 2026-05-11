import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams, useParams } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { api } from '../api';
import type { Vehicle } from '../types';

export default function RecordForm() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { id } = useParams();
  const preselectedVehicleId = searchParams.get('vehicleId');
  const isEdit = !!id;
  const [loading, setLoading] = useState(false);
  const [initializing, setInitializing] = useState(isEdit);

  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [form, setForm] = useState({
    vehicle_id: preselectedVehicleId || '',
    date: new Date().toISOString().slice(0, 10),
    odometer: 0,
    liters: 0,
    price_per_liter: 0,
    station: '',
    is_full: true,
    low_fuel_light: false,
    note: '',
  });

  useEffect(() => {
    api.getVehicles().then(setVehicles);
  }, []);

  useEffect(() => {
    if (id) {
      api.getRecord(id).then(r => {
        setForm({
          vehicle_id: r.vehicle_id,
          date: r.date.slice(0, 10),
          odometer: r.odometer,
          liters: r.liters,
          price_per_liter: r.price_per_liter,
          station: r.station,
          is_full: r.is_full,
          low_fuel_light: r.low_fuel_light,
          note: r.note,
        });
        setInitializing(false);
      });
    }
  }, [id]);

  // Auto-fill last odometer
  useEffect(() => {
    if (form.vehicle_id && !isEdit) {
      api.getRecords(form.vehicle_id).then(records => {
        if (records.length > 0 && form.odometer === 0) {
          setForm(f => ({ ...f, odometer: records[0].odometer }));
        }
      });
    }
  }, [form.vehicle_id]);

  const totalCost = Math.round(form.liters * form.price_per_liter * 100) / 100;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.vehicle_id) { alert('请选择车辆'); return; }
    if (form.liters <= 0) { alert('请输入加油量'); return; }
    if (form.odometer <= 0) { alert('请输入里程表读数'); return; }

    setLoading(true);
    try {
      const recordData = {
        vehicle_id: form.vehicle_id,
        date: new Date(form.date).toISOString(),
        odometer: form.odometer,
        liters: form.liters,
        price_per_liter: form.price_per_liter,
        total_cost: totalCost,
        station: form.station,
        is_full: form.is_full,
        low_fuel_light: form.low_fuel_light,
        note: form.note,
      };
      if (isEdit && id) {
        await api.updateRecord(id, recordData);
      } else {
        await api.createRecord(recordData);
      }
      navigate(-1);
    } catch (err: any) {
      alert(err.message || '保存失败');
    } finally {
      setLoading(false);
    }
  };

  const inputClass = "w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent";
  const labelClass = "block text-sm font-medium text-gray-700 mb-1";

  if (initializing) return <div className="text-center py-12 text-gray-400">加载中...</div>;

  return (
    <div className="space-y-4 max-w-2xl mx-auto">
      <div className="flex items-center gap-3">
        <button onClick={() => navigate(-1)} className="p-1 text-gray-500 hover:text-gray-700">
          <ArrowLeft className="w-5 h-5" />
        </button>
        <h1 className="text-lg font-bold text-gray-800">{isEdit ? '编辑记录' : '添加加油记录'}</h1>
      </div>

      <form onSubmit={handleSubmit} className="bg-white rounded-xl p-5 shadow-sm border border-gray-100 space-y-4">
        <div>
          <label className={labelClass}>选择车辆 *</label>
          <select value={form.vehicle_id} onChange={e => setForm(f => ({ ...f, vehicle_id: e.target.value }))} className={inputClass}>
            <option value="">请选择车辆</option>
            {vehicles.map(v => (
              <option key={v.id} value={v.id}>{v.avatar || '🚗'} {v.name}</option>
            ))}
          </select>
        </div>

        <div>
          <label className={labelClass}>日期 *</label>
          <input type="date" value={form.date} onChange={e => setForm(f => ({ ...f, date: e.target.value }))} className={inputClass} />
        </div>

        <div>
          <label className={labelClass}>里程表读数 (km) *</label>
          <input type="number" value={form.odometer || ''} onChange={e => setForm(f => ({ ...f, odometer: Number(e.target.value) }))} className={inputClass} placeholder="例如：50000" />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className={labelClass}>加油量 (L) *</label>
            <input type="number" step="0.01" value={form.liters || ''} onChange={e => setForm(f => ({ ...f, liters: Number(e.target.value) }))} className={inputClass} placeholder="例如：40.5" />
          </div>
          <div>
            <label className={labelClass}>单价 (元/L) *</label>
            <input type="number" step="0.01" value={form.price_per_liter || ''} onChange={e => setForm(f => ({ ...f, price_per_liter: Number(e.target.value) }))} className={inputClass} placeholder="例如：7.85" />
          </div>
        </div>

        <div className="bg-gray-50 rounded-lg p-3 flex items-center justify-between">
          <span className="text-sm text-gray-500">总价</span>
          <span className="text-lg font-bold text-gray-800">¥{totalCost.toFixed(2)}</span>
        </div>

        <div>
          <label className={labelClass}>加油站</label>
          <input type="text" value={form.station} onChange={e => setForm(f => ({ ...f, station: e.target.value }))} className={inputClass} placeholder="例如：中石化" />
        </div>

        <div className="space-y-2">
          <label className={labelClass}>加油方式</label>
          <div className="grid grid-cols-2 gap-3">
            <button type="button" onClick={() => setForm(f => ({ ...f, is_full: !f.is_full }))}
              className={`flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg border-2 text-sm font-medium transition-all ${
                form.is_full ? 'border-blue-500 bg-blue-50 text-blue-700' : 'border-gray-200 bg-white text-gray-500 hover:border-gray-300'
              }`}>
              <span className="text-base">⛽</span>加满跳枪
            </button>
            <button type="button" onClick={() => setForm(f => ({ ...f, low_fuel_light: !f.low_fuel_light }))}
              className={`flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg border-2 text-sm font-medium transition-all ${
                form.low_fuel_light ? 'border-orange-500 bg-orange-50 text-orange-700' : 'border-gray-200 bg-white text-gray-500 hover:border-gray-300'
              }`}>
              <span className="text-base">💡</span>油表灯亮
            </button>
          </div>
        </div>

        <div>
          <label className={labelClass}>备注</label>
          <input type="text" value={form.note} onChange={e => setForm(f => ({ ...f, note: e.target.value }))} className={inputClass} placeholder="可选" />
        </div>

        <button type="submit" disabled={loading}
          className="w-full bg-blue-600 text-white py-2.5 rounded-lg font-medium hover:bg-blue-700 disabled:opacity-50 transition-colors">
          {loading ? '保存中...' : (isEdit ? '保存修改' : '添加记录')}
        </button>
      </form>
    </div>
  );
}
