import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { api } from '../api';
import type { Vehicle } from '../types';
import { FUEL_TYPE_LABELS, VEHICLE_AVATARS } from '../types';

export default function VehicleForm() {
  const navigate = useNavigate();
  const { id } = useParams();
  const isEdit = !!id;
  const [loading, setLoading] = useState(false);
  const [initializing, setInitializing] = useState(isEdit);

  const [form, setForm] = useState({
    name: '',
    brand: '',
    model: '',
    plate_number: '',
    fuel_type: 'gasoline92' as Vehicle['fuel_type'],
    tank_capacity: 50,
    avatar: '🚗',
  });

  useEffect(() => {
    if (id) {
      api.getVehicle(id)
        .then(v => setForm({
          name: v.name,
          brand: v.brand,
          model: v.model,
          plate_number: v.plate_number,
          fuel_type: v.fuel_type,
          tank_capacity: v.tank_capacity,
          avatar: v.avatar || '🚗',
        }))
        .finally(() => setInitializing(false));
    }
  }, [id]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name.trim()) { alert('请输入车辆名称'); return; }
    setLoading(true);
    try {
      if (isEdit && id) {
        await api.updateVehicle(id, form);
      } else {
        await api.createVehicle(form);
      }
      navigate('/vehicles');
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
        <h1 className="text-lg font-bold text-gray-800">{isEdit ? '编辑车辆' : '添加车辆'}</h1>
      </div>

      <form onSubmit={handleSubmit} className="bg-white rounded-xl p-5 shadow-sm border border-gray-100 space-y-4">
        <div>
          <label className={labelClass}>车辆图标</label>
          <div className="flex flex-wrap gap-2">
            {VEHICLE_AVATARS.map(emoji => (
              <button key={emoji} type="button" onClick={() => setForm(f => ({ ...f, avatar: emoji }))}
                className={`w-10 h-10 text-2xl rounded-lg border-2 flex items-center justify-center transition-colors ${
                  form.avatar === emoji ? 'border-blue-500 bg-blue-50' : 'border-gray-200 hover:border-gray-300'
                }`}>{emoji}</button>
            ))}
          </div>
        </div>

        <div>
          <label className={labelClass}>车辆名称 *</label>
          <input type="text" placeholder="例如：我的卡罗拉" value={form.name}
            onChange={e => setForm(f => ({ ...f, name: e.target.value }))} className={inputClass} />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className={labelClass}>品牌</label>
            <input type="text" placeholder="丰田" value={form.brand}
              onChange={e => setForm(f => ({ ...f, brand: e.target.value }))} className={inputClass} />
          </div>
          <div>
            <label className={labelClass}>型号</label>
            <input type="text" placeholder="卡罗拉 2023" value={form.model}
              onChange={e => setForm(f => ({ ...f, model: e.target.value }))} className={inputClass} />
          </div>
        </div>

        <div>
          <label className={labelClass}>车牌号</label>
          <input type="text" placeholder="京A12345" value={form.plate_number}
            onChange={e => setForm(f => ({ ...f, plate_number: e.target.value }))} className={inputClass} />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className={labelClass}>燃油类型</label>
            <select value={form.fuel_type} onChange={e => setForm(f => ({ ...f, fuel_type: e.target.value as Vehicle['fuel_type'] }))} className={inputClass}>
              {Object.entries(FUEL_TYPE_LABELS).map(([k, v]) => (
                <option key={k} value={k}>{v}</option>
              ))}
            </select>
          </div>
          <div>
            <label className={labelClass}>油箱容量 (L)</label>
            <input type="number" value={form.tank_capacity}
              onChange={e => setForm(f => ({ ...f, tank_capacity: Number(e.target.value) }))} className={inputClass} />
          </div>
        </div>

        <button type="submit" disabled={loading}
          className="w-full bg-blue-600 text-white py-2.5 rounded-lg font-medium hover:bg-blue-700 disabled:opacity-50 transition-colors">
          {loading ? '保存中...' : (isEdit ? '保存修改' : '添加车辆')}
        </button>
      </form>
    </div>
  );
}
