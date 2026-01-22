import React from 'react';
import { IxApplicationHeader, IxIcon } from '@siemens/ix-react';

export default function Header({ appName = "Siemens RCA Tool" }) {
    return (
        <IxApplicationHeader name={appName}>
            <div slot="logo" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
        <span style={{ fontWeight: 'bold', fontSize: '1.2rem', color: 'var(--theme-color-primary)' }}>
          RCA
        </span>
            </div>
        </IxApplicationHeader>
    );
}