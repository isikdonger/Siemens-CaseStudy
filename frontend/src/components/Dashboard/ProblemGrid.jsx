import React, { useMemo } from 'react';
import { AgGridReact } from 'ag-grid-react';
import { IxButton, IxContentHeader, showModal } from '@siemens/ix-react';

// AG Grid Core
import { themeQuartz } from 'ag-grid-community';
import ProblemFormModal from '../Common/ProblemFormModal';

export default function ProblemGrid({ rowData, onAnalyze, refreshList }) {

    // Siemens Industrial Experience Palette
    const siemensTheme = useMemo(() => {
        return themeQuartz.withParams({
            backgroundColor: "#000000",
            foregroundColor: "#ebebeb",
            headerBackgroundColor: "#1a1a1a",
            headerTextColor: "#00ccbb",
            accentColor: "#00ccbb",
            rowHoverColor: "rgba(0, 204, 187, 0.1)",
            selectedRowBackgroundColor: "rgba(0, 204, 187, 0.2)",
            borderRadius: "4px",
        });
    }, []);

    const columnDefs = useMemo(() => [
        {
            field: 'problem_id',
            headerName: 'ID',
            width: 80,
            sort: 'desc', // Consistency: Enforces descending order on load
            sortIndex: 0
        },
        { field: 'title', headerName: 'Problem Name', flex: 1, sortable: true },
        { field: 'team', headerName: 'Team', width: 150, sortable: true },
        {
            field: 'date',
            headerName: 'Reported Date',
            width: 150,
            valueFormatter: (params) => {
                if (!params.value) return '';
                const date = new Date(params.value);
                return date.toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'short',
                    day: 'numeric'
                });
            }
        },
        {
            field: 'state',
            headerName: 'Status',
            width: 110,
            cellRenderer: (p) => (
                <span style={{ color: p.value === 1 ? '#00ccbb' : '#ff4444', fontWeight: 'bold' }}>
                    {p.value === 1 ? '● Open' : '● Closed'}
                </span>
            )
        },
        {
            headerName: 'Actions',
            width: 120,
            sortable: false,
            filter: false,
            cellRenderer: (p) => (
                <IxButton ghost onClick={() => onAnalyze(p.data)}>
                    Analyze
                </IxButton>
            )
        }
    ], [onAnalyze]);

    return (
        <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
            <IxContentHeader title="Problem Dashboard">
                <IxButton onClick={() => showModal({ content: <ProblemFormModal onSaveSuccess={refreshList} /> })}>
                    Add Problem
                </IxButton>
            </IxContentHeader>
            <div style={{ flex: 1, padding: '20px' }}>
                <AgGridReact
                    theme={siemensTheme}
                    rowData={rowData || []}
                    columnDefs={columnDefs}

                    // Pagination Settings (Fixed to avoid console warnings)
                    pagination={true}
                    paginationPageSize={10}
                    paginationPageSizeSelector={[10, 20, 50, 100]}

                    // Layout settings
                    domLayout='autoHeight'
                    onGridReady={(params) => params.api.sizeColumnsToFit()}
                    overlayNoRowsTemplate="<span>No problems found.</span>"
                />
            </div>
        </div>
    );
}