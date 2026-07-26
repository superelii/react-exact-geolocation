import { useState } from 'react';
import { createRoot } from 'react-dom/client';
import {
  useGetGeolocation,
  getCoordinateTransformForService,
  type MapService,
} from '../src/index.ts';

const SERVICES: { value: MapService; label: string }[] = [
  { value: 'amap', label: '高德 Amap (GCJ-02)' },
  { value: 'baidu', label: '百度 Baidu (BD-09)' },
  { value: 'tencent', label: '腾讯 Tencent (GCJ-02)' },
  { value: 'google', label: 'Google (WGS-84, 无需转换)' },
];

const fmt = (n: number | undefined, d = 6) => (n === undefined ? '—' : n.toFixed(d));

const App = () => {
  const [key1, setKey1] = useState('');
  const [key2, setKey2] = useState('');
  const [activeKey, setActiveKey] = useState<'1' | '2'>('1');
  const [service, setService] = useState<MapService>('amap');
  const [securitySecret, setSecuritySecret] = useState('');
  const [highAccuracy, setHighAccuracy] = useState(true);

  const activeKeyValue = (activeKey === '1' ? key1 : key2).trim();
  const geo = useGetGeolocation(activeKeyValue || undefined, {
    mapService: service,
    enableHighAccuracy: highAccuracy,
    amapSecuritySecret: service === 'amap' ? securitySecret.trim() || undefined : undefined,
  });

  const { position, country, province, city, district, township, error, loading, permissionState, requestPermission } = geo;

  const permissionLabel: Record<string, string> = {
    granted: '已授权',
    denied: '已拒绝',
    prompt: '未授权（待授权）',
    unsupported: '不可用（非安全上下文）',
  };

  // 转换前(WGS-84) vs 转换后(地图坐标系) 对比
  const transform = getCoordinateTransformForService(service);
  const transformed = position ? transform(position.latitude, position.longitude) : null;

  const hasKey = activeKeyValue.length > 0;
  const displayError =
    !hasKey && error
      ? '未填 API Key，仅展示坐标。填入 Key 并重新获取即可解析地址。'
      : error;

  return (
    <div className="wrap">
      <h1>react-geolocation 实时演示</h1>
      <div className="sub">
        真实调用 <code>navigator.geolocation</code> + 地图逆地理编码，可在浏览器中直接实测。
      </div>

      <div className="card">
        <label>使用哪个密钥</label>
        <div className="row" style={{ marginBottom: 14 }}>
          <label className="toggle" style={{ flex: 1, marginBottom: 0 }}>
            <input
              type="radio"
              name="akey"
              checked={activeKey === '1'}
              onChange={() => setActiveKey('1')}
            />
            密钥 1
          </label>
          <label className="toggle" style={{ flex: 1, marginBottom: 0 }}>
            <input
              type="radio"
              name="akey"
              checked={activeKey === '2'}
              onChange={() => setActiveKey('2')}
            />
            密钥 2
          </label>
        </div>

        <label htmlFor="k1">密钥 1（地图 API Key，解析地址需要；仅看坐标可留空）</label>
        <input
          id="k1"
          placeholder="例如高德 / 百度 / 腾讯 key"
          value={key1}
          onChange={(e) => setKey1(e.target.value)}
        />

        <label htmlFor="k2">密钥 2（独立备用 Key）</label>
        <input
          id="k2"
          placeholder="例如另一个服务的 key"
          value={key2}
          onChange={(e) => setKey2(e.target.value)}
        />

        {service === 'amap' && (
          <>
            <label htmlFor="sec">高德安全密钥（数字签名私钥，开启签名校验时使用）</label>
            <input
              id="sec"
              placeholder="在高德控制台「应用管理」开启签名校验后获取"
              value={securitySecret}
              onChange={(e) => setSecuritySecret(e.target.value)}
            />
          </>
        )}

        <label htmlFor="svc">地图服务</label>
        <select
          id="svc"
          value={service}
          onChange={(e) => setService(e.target.value as MapService)}
        >
          {SERVICES.map((s) => (
            <option key={s.value} value={s.value}>
              {s.label}
            </option>
          ))}
        </select>

        <label className="toggle">
          <input
            type="checkbox"
            checked={highAccuracy}
            onChange={(e) => setHighAccuracy(e.target.checked)}
          />
          启用高精度 (enableHighAccuracy)
        </label>

        <div className="row" style={{ gap: 10, marginTop: 4 }}>
          <button onClick={geo.startGeolocation} disabled={loading}>
            {loading ? '定位中…' : '获取定位'}
          </button>
          <button
            type="button"
            className="ghost"
            onClick={() => requestPermission()}
            title="主动触发浏览器位置授权弹窗"
          >
            授权位置权限
          </button>
        </div>
        {permissionState && (
          <div className="kv" style={{ marginTop: 10 }}>
            <span className="k">位置权限</span>
            <span className="v">
              <span className={`badge perm-${permissionState}`}>
                {permissionLabel[permissionState] ?? permissionState}
              </span>
            </span>
          </div>
        )}
        {permissionState === 'unsupported' && (
          <div className="hint" style={{ marginTop: 10 }}>
            当前是 <b>http 局域网地址</b>，浏览器判定为<b>非安全上下文</b>，已禁用定位，
            所以点击「授权位置权限」不会弹窗、也授权不了。任选一种解决：
            <br />① 手机 Chrome 打开{' '}
            <code>chrome://flags/#unsafely-treat-insecure-origin-as-secure</code>，
            把本地址加入白名单并重启浏览器；
            <br />② 用 <code>adb reverse tcp:5173 tcp:5173</code>，手机改访问{' '}
            <code>http://localhost:5173</code>（来源变成 localhost，天然安全）；
            <br />③ 给 dev 服务启用 HTTPS（最省事，iOS Safari 也支持）。
          </div>
        )}
      </div>

      <div className="card">
        <div className="kv">
          <span className="k">状态</span>
          <span className="v">
            {loading && <span className="badge">定位中</span>}
            {displayError && <span className="status-err">⚠ {displayError}</span>}
            {!loading && !displayError && position && (
              <span className="status-ok">✓ 已定位</span>
            )}
          </span>
        </div>

        <div className="kv">
          <span className="k">原始坐标 (WGS-84, 设备实测)</span>
          <span className="v">
            {position ? `${fmt(position.latitude)}, ${fmt(position.longitude)}` : '—'}
          </span>
        </div>
        <div className="kv">
          <span className="k">转换后坐标 ({service} 系)</span>
          <span className="v">
            {transformed ? `${fmt(transformed.lat)}, ${fmt(transformed.lng)}` : '—'}
          </span>
        </div>
        <div className="kv">
          <span className="k">精度半径 (accuracy)</span>
          <span className="v">{position ? `${Math.round(position.accuracy)} m` : '—'}</span>
        </div>
      </div>

      <div className="card">
        <div className="kv"><span className="k">国家</span><span className="v">{country ?? '—'}</span></div>
        <div className="kv"><span className="k">省</span><span className="v">{province ?? '—'}</span></div>
        <div className="kv"><span className="k">市</span><span className="v">{city ?? '—'}</span></div>
        <div className="kv"><span className="k">区/县</span><span className="v">{district ?? '—'}</span></div>
        <div className="kv"><span className="k">街道/乡镇</span><span className="v">{township ?? '—'}</span></div>
        {!hasKey && (
          <div className="hint">
            提示：地图服务需要有效的 API Key 才能解析地址。坐标转换与原始定位无需 Key 即可验证。
          </div>
        )}
      </div>
    </div>
  );
};

createRoot(document.getElementById('root')!).render(<App />);
