
import React from 'react';
import { AirQualityResponse,AirQualityItem } from '@/types/airquality';
interface Props {
    data: AirQualityResponse | null;
}

const AirQualityCard: React.FC<Props> = ({ data }) => {
    if (!data || !data.list || data.list.length === 0) return null;

    const { main, components } = data.list[0];
    const { aqi } = main;
    const { pm2_5, pm10, o3, no2 } = components;

    const getStatus = (aqiValue: number) => {
        switch (aqiValue) {
            case 1: return { color: '#00e400', text: 'Good', bg: 'rgba(0, 228, 0, 0.2)' };
            case 2: return { color: '#ffff00', text: 'Fair', bg: 'rgba(255, 255, 0, 0.2)' };
            case 3: return { color: '#ff7e00', text: 'Moderate', bg: 'rgba(255, 126, 0, 0.2)' };
            case 4: return { color: '#ff0000', text: 'Poor', bg: 'rgba(255, 0, 0, 0.2)' };
            case 5: return { color: '#8f3f97', text: 'Very Poor', bg: 'rgba(143, 63, 151, 0.2)' };
            default: return { color: '#ccc', text: 'Unknown', bg: '#eee' };
        }
    };

    const status = getStatus(aqi);

    return (
        <div style={{
            position: 'absolute',
            top: '20px',
            right: '20px',
            background: 'white',
            padding: '16px',
            borderRadius: '12px',
            boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
            width: '280px',
            zIndex: 10,
            fontFamily: 'system-ui, sans-serif'
        }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                <h3 style={{ margin: 0, fontSize: '16px', color: '#333' }}>Air Quality</h3>
                <span style={{
                    backgroundColor: status.bg,
                    color: aqi === 2 ? '#333' : status.color,
                    padding: '4px 8px',
                    borderRadius: '12px',
                    fontSize: '12px',
                    fontWeight: 'bold',
                    border: `1px solid ${status.color}`
                }}>
                    AQI {aqi}/5 • {status.text}
                </span>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
                <PollutantItem label="PM2.5" value={pm2_5} unit="µg/m³" isHigh={pm2_5 > 15} />
                <PollutantItem label="PM10" value={pm10} unit="µg/m³" isHigh={pm10 > 45} />
                <PollutantItem label="Ozone" value={o3} unit="µg/m³" isHigh={o3 > 100} />
                <PollutantItem label="NO2" value={no2} unit="µg/m³" isHigh={no2 > 25} />
            </div>

            <p style={{ fontSize: '11px', color: '#666', marginTop: '12px', marginBottom: 0 }}>
                Location: Chinhat / Gomti Nagar Ext.
            </p>
        </div>
    );
};

const PollutantItem = ({ label, value, unit, isHigh }: { label: string, value: number, unit: string, isHigh: boolean }) => (
    <div style={{
        background: '#f8f9fa',
        padding: '8px',
        borderRadius: '8px',
        borderLeft: isHigh ? '3px solid #ff4d4f' : '3px solid #52c41a'
    }}>
        <div style={{ fontSize: '11px', color: '#888' }}>{label}</div>
        <div style={{ fontSize: '14px', fontWeight: '600', color: '#333' }}>
            {value} <span style={{ fontSize: '10px', fontWeight: 'normal' }}>{unit}</span>
        </div>
    </div>
);

export default AirQualityCard; 