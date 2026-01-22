import React, { useMemo, useCallback, useRef } from 'react';
import { AgGridReact } from 'ag-grid-react';
import { IxButton, IxContentHeader, showModal } from '@siemens/ix-react';
import { themeQuartz } from 'ag-grid-community';
import ProblemFormModal from '../Common/ProblemFormModal';

export default function ProblemGrid({ rowData, onAnalyze, refreshList }) {
    const gridRef = useRef();

    const siemensTheme = useMemo(() => (
        themeQuartz.withParams({
            backgroundColor: "#000000",
            foregroundColor: "#ebebeb",
            headerBackgroundColor: "#1a1a1a",
            headerTextColor: "#00ccbb",
            accentColor: "#00ccbb",
            rowHoverColor: "rgba(0, 204, 187, 0.1)",
            selectedRowBackgroundColor: "rgba(0, 204, 187, 0.2)",
            borderRadius: "4px",
        })
    ), []);

    // Updated to save both Column State and Pagination
    const saveState = useCallback(() => {
        if (gridRef.current?.api) {
            const columnState = gridRef.current.api.getColumnState();
            const currentPage = gridRef.current.api.paginationGetCurrentPage();

            const fullState = {
                columns: columnState,
                page: currentPage
            };

            localStorage.setItem('problem_grid_full_state', JSON.stringify(fullState));
        }
    }, []);

    const restoreState = useCallback((params) => {
        const savedRaw = localStorage.getItem('problem_grid_full_state');
        if (savedRaw) {
            const savedState = JSON.parse(savedRaw);

            // Timeout ensures AG Grid has fully rendered the data before we move the page
            setTimeout(() => {
                // 1. Restore Columns/Sorting
                if (savedState.columns) {
                    params.api.applyColumnState({
                        state: savedState.columns,
                        applyOrder: true,
                    });
                }

                // 2. Restore Page Number
                if (typeof savedState.page === 'number') {
                    params.api.paginationGoToPage(savedState.page);
                }
            }, 100);
        }
    }, []);

    const columnDefs = useMemo(() => [
        { field: 'problem_id', headerName: 'ID', width: 90 },
        { field: 'title', headerName: 'Problem Name', flex: 1, sortable: true, filter: true },
        { field: 'team', headerName: 'Team', width: 150, sortable: true, filter: true },
        {
            field: 'date',
            headerName: 'Reported Date',
            width: 150,
            sortable: true,
            valueFormatter: (p) =>
                p.value
                    ? new Date(p.value).toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'short',
                        day: 'numeric'
                    })
                    : ''
        },
        {
            field: 'state',
            headerName: 'Status',
            width: 120,
            sortable: true,
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
                    OPEN CASE
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
                    ref={gridRef}
                    theme={siemensTheme}
                    rowData={rowData || []}
                    columnDefs={columnDefs}
                    pagination={true}
                    paginationPageSize={10}
                    paginationPageSizeSelector={[10, 20, 50, 100]}
                    domLayout='autoHeight'

                    onGridReady={restoreState}

                    // Triggers save on Sort, Move, Resize, AND Page Change
                    onSortChanged={saveState}
                    onColumnMoved={saveState}
                    onColumnResized={saveState}
                    onPaginationChanged={saveState}

                    overlayNoRowsTemplate="<span>No problems found.</span>"
                />
            </div>
        </div>
    );
}