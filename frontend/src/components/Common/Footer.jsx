import React from 'react';
import { IxTypography } from '@siemens/ix-react';

export default function Footer() {
    const currentYear = new Date().getFullYear();

    return (
        <footer style={{
            padding: '12px 24px',
            background: '#111',
            borderTop: '1px solid #333',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center'
        }}>
            <IxTypography variant="label-small" style={{ color: '#666' }}>
                © {currentYear} Siemens Internship Case Study - Root Cause Analysis Tool
            </IxTypography>

            <div style={{ display: 'flex', gap: '20px' }}>
                <IxTypography variant="label-small" style={{ color: '#00ccbb', cursor: 'pointer' }}>
                    Documentation
                </IxTypography>
                <IxTypography variant="label-small" style={{ color: '#888' }}>
                    v1.0.4
                </IxTypography>
            </div>
        </footer>
    );
}