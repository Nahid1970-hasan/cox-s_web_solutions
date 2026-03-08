import { exportToExcel } from "components/Export/exportToExcel";
import React, { useEffect, useRef, useState } from "react";
import { SplitButton } from "primereact/splitbutton";
import { CommonButton } from "../Buttons/Buttons";
import { DataTable } from "primereact/datatable";
import { useHistory } from "react-router-dom";
import { Column } from "primereact/column";
import { CSVLink } from "react-csv";
import { MultiSelect } from "primereact/multiselect";
import { InputText } from "primereact/inputtext";
import { InputNumber } from "primereact/inputnumber";
import { Dropdown } from "primereact/dropdown";
import { TriStateCheckbox } from "primereact/tristatecheckbox";
import { FilterMatchMode, FilterService } from "primereact/api";
import { classNames } from "primereact/utils";

/**
 * Full reusable Table component with Column Toggle and Filter support.
 *
 * New props:
 * - enableColumnToggle (bool) -> show multi-select to toggle columns (default false)
 * - enableFilters (bool) -> enable column filters (default false)
 * - filters (object) -> initial filter configuration
 * - filterDisplay (string) -> filter display mode ('row', 'menu', etc.)
 */

export const Table = ({
    isSelectable = true,
    allChakboox = false,
    setCustomSearch,
    setSecondCustomSearch,
    rows = 25,
    showRow = 10,
    emptyMessage = "",
    tableHeaderName = "",
    isTopbarShow = true,
    tableColumns,
    extraTableAction,
    data,
    setData,
    selectedData,
    setSelectedData,
    loading = true,
    deleteSelected,
    showCreateModal = false,
    setShowCreateModal,
    dataKey,
    plainData,
    actionButton,
    importExportBtn,
    dialog,
    multiItem = true,
    deleteBtn = false,
    showDeleteModal = false,
    setShowDeleteModal,
    newBtn = true,
    newBtnRoute,
    newMlcRoute,
    newScRoute,
    newSMScRoute,
    exportBtn,
    exportBtnForIADashboard,
    exportFunc,
    ref,
    searchShow = true,
    secondSearchShow = false,
    descriptionSearchShow = false,
    pageShow,
    sortable,
    isColor,
    actionButtonWidth = 8,
    body,
    autoLayout = true,
    exportFileName,
    showTableHeader = true,
    actionHeader,
    lcBtn,
    newActionButton,
    importBtn,
    pdfBtn,
    isRowSelectable,
    sticky,
    backBtn,
    permission,
    onSelectionChange,
    inputFiled,
    extraFieldType,
    customSearch,
    splitBtn,
    splitBtnLabel,
    splitBtnOnClick,
    splitBtnItems,
    splitBtnIcon,
    exportData,
    exportType = "csv",
    rowClassName,
    customBtn,
    editMode,
    rowsPerPageOptions,
    topSelection = true,
    firstButtonLabel,
    firstButtonRoute,
    secondButtonLabel,
    secondButtonRoute,
    thirdButtonLabel,
    thirdButtonRoute,
    newBtnFunc,
    items,
    actionButtonPosition = "right",
    tableHeaderComponent,
    checkboxCellColor,
    enableColumnToggle = false,
    enableFilters = false, // NEW: Enable filters (default false)
    filters: initialFilters = {}, // NEW: Initial filter configuration
    filterDisplay = "row", // NEW: Filter display mode
    globalFilterFields = [], // NEW: Fields for global filtering
    ...rest
}) => {
    // Search states
    const [search, setSearch] = useState("");
    const [secondSearch, setSecondSearch] = useState("");
    const [descriptionSearch, setDescriptionSearch] = useState("");

    // Filter states
    const [filters, setFilters] = useState(initialFilters);
    const [globalFilterValue, setGlobalFilterValue] = useState("");

    // Filtered table data (used when plainData is falsy)
    const [tableData, setTableData] = useState([]);

    // CSV export data (prepared according to visible columns)
    const [csvExportData, setCSVExportData] = useState([]);

    // Column toggle state (when enabled)
    const [visibleColumns, setVisibleColumns] = useState(Array.isArray(tableColumns) ? tableColumns.filter(Boolean) : []);

    // Track if user has manually selected columns to preserve their choice
    const [userHasSelectedColumns, setUserHasSelectedColumns] = useState(false);

    const dt = useRef(null);
    const history = useHistory();
    const date = new Date(new Date().setHours(new Date().getHours() + 6)).toISOString();
    const route = window.location.href.split("/").pop();

    // Initialize default filters if enableFilters is true but no initial filters provided
    useEffect(() => {
        if (enableFilters && Object.keys(initialFilters).length === 0 && Array.isArray(tableColumns)) {
            const defaultFilters = {
                global: { value: null, matchMode: FilterMatchMode.CONTAINS },
            };

            tableColumns.forEach((column) => {
                if (column.field) {
                    defaultFilters[column.field] = {
                        value: null,
                        matchMode: column.filterMatchMode || FilterMatchMode.CONTAINS,
                    };
                }
            });

            setFilters(defaultFilters);
        }
    }, [enableFilters, initialFilters, tableColumns]);

    // Only update visibleColumns when tableColumns changes AND user hasn't made manual selections
    useEffect(() => {
        if (!userHasSelectedColumns) {
            setVisibleColumns(Array.isArray(tableColumns) ? tableColumns.filter(Boolean) : []);
        } else {
            // If user has selected columns, preserve their selection by matching with new tableColumns objects
            const currentTableColumns = Array.isArray(tableColumns) ? tableColumns.filter(Boolean) : [];
            setVisibleColumns((prevVisible) => {
                // Map previous selections to new column objects from tableColumns
                const updatedVisible = prevVisible.map((visibleCol) => currentTableColumns.find((tableCol) => tableCol.field === visibleCol.field)).filter(Boolean); // Remove any undefined values (columns that no longer exist)

                return updatedVisible;
            });
        }
    }, [tableColumns, userHasSelectedColumns]);

    // compute which columns to render
    const columnsToRender = enableColumnToggle ? visibleColumns : Array.isArray(tableColumns) ? tableColumns.filter(Boolean) : [];

    // Global filter change handler
    const onGlobalFilterChange = (e) => {
        const value = e.target.value;
        let _filters = { ...filters };
        _filters["global"].value = value;
        setFilters(_filters);
        setGlobalFilterValue(value);
    };

    // Render filter header when filters are enabled
    const renderFilterHeader = () => {
        if (!enableFilters) return null;

        return (
            <div className="flex justify-content-end">
                <span className="p-input-icon-left">
                    <i className="pi pi-search" />
                    <InputText value={globalFilterValue} onChange={onGlobalFilterChange} placeholder="Keyword Search" className="p-inputtext-sm" />
                </span>
            </div>
        );
    };

    // Default filter elements for different data types
    const getDefaultFilterElement = (options, column) => {
        const field = column.field;
        const filterConfig = column.filterConfig || {};

        switch (filterConfig.type) {
            case "numeric":
                return <InputNumber value={options.value} onChange={(e) => options.filterApplyCallback(e.value)} placeholder={filterConfig.placeholder || `Search ${column.header}`} className="p-column-filter w-full" mode="decimal" />;

            case "dropdown":
                return <Dropdown value={options.value} options={filterConfig.options || []} onChange={(e) => options.filterApplyCallback(e.value)} placeholder={filterConfig.placeholder || `Select ${column.header}`} className="p-column-filter w-full" showClear />;

            case "multiselect":
                return <MultiSelect value={options.value} options={filterConfig.options || []} onChange={(e) => options.filterApplyCallback(e.value)} placeholder={filterConfig.placeholder || `Select ${column.header}`} className="p-column-filter w-full" maxSelectedLabels={3} />;

            case "boolean":
                return <TriStateCheckbox value={options.value} onChange={(e) => options.filterApplyCallback(e.value)} />;

            default:
                return <InputText value={options.value} onChange={(e) => options.filterApplyCallback(e.target.value)} placeholder={filterConfig.placeholder || `Search ${column.header}`} className="p-column-filter w-full" />;
        }
    };

    // Checkbox column template (supports custom checkboxCellColor and compares by dataKey if provided)
    const checkboxBodyTemplate = (rowData, options) => {
        const backgroundColor = checkboxCellColor ? (typeof checkboxCellColor === "function" ? checkboxCellColor(rowData) : checkboxCellColor[rowData?.id] || checkboxCellColor.default) : "transparent";

        const isChecked = Array.isArray(selectedData) ? (dataKey ? selectedData.some((item) => item?.[dataKey] === rowData?.[dataKey]) : selectedData.includes(rowData)) : false;

        return (
            <div style={{ backgroundColor, padding: "0.5rem", height: "100%", display: "flex", alignItems: "center", justifyContent: "center" }}>
                <input
                    type="checkbox"
                    checked={isChecked}
                    onChange={(e) => {
                        const checked = e.target.checked;
                        if (checked) {
                            setSelectedData?.((prev) => {
                                const prevArr = Array.isArray(prev) ? prev : [];
                                const exists = dataKey ? prevArr.some((it) => it?.[dataKey] === rowData?.[dataKey]) : prevArr.includes(rowData);
                                if (exists) return prevArr;
                                return [...prevArr, rowData];
                            });
                        } else {
                            setSelectedData?.((prev) => {
                                const prevArr = Array.isArray(prev) ? prev : [];
                                if (dataKey) return prevArr.filter((it) => it?.[dataKey] !== rowData?.[dataKey]);
                                return prevArr.filter((it) => it !== rowData);
                            });
                        }
                    }}
                    style={{ margin: 0 }}
                />
            </div>
        );
    };

    const getCheckboxHeaderStyle = () => {
        return isSelectable && allChakboox
            ? {
                  minWidth: "2rem",
                  fontWeight: "bold",
                  pointerEvents: "none",
              }
            : { minWidth: "6rem" };
    };

    // Column toggle handler
    const onColumnToggle = (event) => {
        const selectedColumns = event.value || [];
        // preserve original ordering by filtering tableColumns in original order
        const orderedSelectedColumns = (Array.isArray(tableColumns) ? tableColumns : []).filter(Boolean).filter((col) => selectedColumns.some((sCol) => sCol.field === col.field));
        setVisibleColumns(orderedSelectedColumns);
        setUserHasSelectedColumns(true); // Mark that user has made a manual selection
    };

    // Search handlers
    const handleSearchChange = (e) => {
        const value = e.target.value;
        setSearch(value);
        if (setCustomSearch) setCustomSearch(value);
    };

    const handleSecondSearchChange = (e) => {
        const value = e.target.value;
        setSecondSearch(value);
        if (setSecondCustomSearch) setSecondCustomSearch(value);
    };

    const handleDescriptionSearchChange = (e) => {
        const value = e.target.value;
        setDescriptionSearch(value);
    };

    // Prepare filtered table data when searches or original data change (only used when plainData is falsy)
    useEffect(() => {
        if (!Array.isArray(data) || data.length === 0) {
            setTableData([]);
            return;
        }

        let filtered = [...data];

        // Global search across all fields
        if (search) {
            const q = search.toString().toLowerCase();
            filtered = filtered.filter((item) =>
                Object.values(item).some((val) =>
                    String(val ?? "")
                        .toLowerCase()
                        .includes(q)
                )
            );
        }

        // second search for "size" specifically
        if (secondSearch) {
            const q = secondSearch.toString().toLowerCase();
            filtered = filtered.filter((item) =>
                String(item?.size ?? "")
                    .toLowerCase()
                    .includes(q)
            );
        }

        // description search for materialDescription
        if (descriptionSearch) {
            const q = descriptionSearch.toString().toLowerCase();
            filtered = filtered.filter((item) =>
                String(item?.materialDescription ?? "")
                    .toLowerCase()
                    .includes(q)
            );
        }

        setTableData(filtered);
    }, [search, secondSearch, descriptionSearch, data]);

    // Prepare CSV export data according to columnsToRender and current rows (plainData vs filtered)
    useEffect(() => {
        const rowsSource = Array.isArray(exportData) && exportData.length ? exportData : plainData && Array.isArray(data) ? data : tableData;

        const cols = enableColumnToggle ? visibleColumns : Array.isArray(tableColumns) ? tableColumns.filter(Boolean) : [];

        const prepared = Array.isArray(rowsSource)
            ? rowsSource.map((row) => {
                  const item = {};
                  cols.forEach((col) => {
                      item[col.field] = row?.[col.field];
                  });
                  return item;
              })
            : [];

        setCSVExportData(prepared);
    }, [tableData, data, exportData, plainData, visibleColumns, enableColumnToggle, tableColumns]);

    // Table header (when newBtn is false and tableHeaderName exists)
    const tableHeader = (
        <div className={`${searchShow && "table-header"} ${descriptionSearchShow && "table-header"} ${secondSearchShow && "table-header"} font-bold grid grid-cols-1 md:grid-cols-2 items-center`}>
            <p className={`lg:justify-self-start md:justify-self-start justify-self-center ${!tableHeaderComponent && "text-2xl"}`}>{tableHeaderName}</p>
            {(secondSearchShow || descriptionSearchShow || searchShow || enableColumnToggle || enableFilters) && (
                <div className="flex justify-self-center md:justify-self-end gap-2 items-center">
                    {searchShow && (
                        <span className="p-input-icon-right bg-white">
                            <i className="pi pi-search bg-white" />
                            <input value={search} onChange={handleSearchChange} placeholder="Search" className="px-4 py-2 shadow bg-white rounded-full text-lg" />
                        </span>
                    )}
                    {secondSearchShow && (
                        <span className="p-input-icon-right bg-white">
                            <i className="pi pi-search bg-white" />
                            <input value={secondSearch} onChange={handleSecondSearchChange} placeholder="Size Search" className="px-4 py-2 shadow bg-white rounded-full text-lg" />
                        </span>
                    )}
                    {descriptionSearchShow && (
                        <span className="p-input-icon-right bg-white">
                            <i className="pi pi-search bg-white" />
                            <input value={descriptionSearch} onChange={handleDescriptionSearchChange} placeholder="Description Search" className="px-4 py-2 shadow bg-white rounded-full text-lg" />
                        </span>
                    )}

                    {enableColumnToggle && Array.isArray(tableColumns) && tableColumns.length > 0 && <MultiSelect value={visibleColumns} options={tableColumns} optionLabel="header" onChange={onColumnToggle} display="chip" className="w-full sm:w-64" />}

                    {enableFilters && (
                        <span className="p-input-icon-left bg-white">
                            <i className="pi pi-search bg-white" />
                            <InputText value={globalFilterValue} onChange={onGlobalFilterChange} placeholder="Global Search" className="px-4 py-2 shadow bg-white rounded-full text-lg" />
                        </span>
                    )}
                </div>
            )}
        </div>
    );

    // Left toolbar (default topbar with buttons etc.)
    const leftToolbar = (
        <React.Fragment>
            <div className="table-header font-bold grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-2  gap-2 items-center ">
                <div className="flex gap-x-3 items-center justify-self-center md:justify-self-start">
                    {newBtn && permission?.canAdd ? (
                        <div>
                            <CommonButton
                                label="New"
                                icon="pi pi-plus"
                                className="p-button-success "
                                type="button"
                                onClick={() => {
                                    if (newBtnRoute) return history.push(newBtnRoute);
                                    if (newBtnFunc) return newBtnFunc();
                                    setShowCreateModal && setShowCreateModal(true);
                                }}
                            />
                        </div>
                    ) : (
                        <></>
                    )}

                    {deleteBtn && permission?.canDelete && (
                        <div>
                            <CommonButton label="Delete" icon="pi pi-trash" className="p-button-danger !p-button-sm" onClick={() => setShowCreateModal(true)} disabled={!selectedData || !selectedData.length} />
                        </div>
                    )}

                    {newActionButton && permission?.canAdd && (
                        <div className="flex gap-2">
                            <SplitButton
                                className="p-button-success p-button-sm"
                                label="New"
                                icon=""
                                onClick={() => {
                                    if (newMlcRoute) history.push(newMlcRoute);
                                }}
                                model={items}
                            ></SplitButton>
                        </div>
                    )}
                    {splitBtn && permission?.canAdd && (
                        <div className="flex gap-2 items-center justify-center">
                            <SplitButton className={` p-button-rounded !p-button-sm p-button-success no-wrap `} label={splitBtnLabel} icon={splitBtnIcon} onClick={splitBtnOnClick} model={splitBtnItems}></SplitButton>
                        </div>
                    )}
                    {importBtn && (
                        <div className="flex gap-2">
                            <CommonButton
                                label="Import"
                                icon="pi pi-download"
                                className="p-button-seccess p-button-sm"
                                onClick={() => {
                                    setShowCreateModal(true);
                                }}
                            />
                        </div>
                    )}

                    {exportBtn && (
                        <>
                            {exportType.toLowerCase() === "csv" && (
                                <CSVLink
                                    asyncOnClick={true}
                                    data={csvExportData?.length ? csvExportData : plainData ? data : tableData}
                                    headers={columnsToRender.map((c) => ({ label: c.header, key: c.field }))}
                                    filename={`${exportFileName || route}-D${date.split("T")[0].replace(/-/g, "")}T${date.split("T")[1].replace(/:/g, "").split(".")[0]}`}
                                >
                                    <CommonButton label="Export" icon="pi pi-upload" type="button" className={`p-button-help !bg-orange-400  ${!splitBtn && "p-button-sm"}`} bigButton={splitBtn} />
                                </CSVLink>
                            )}

                            {exportType.toLowerCase() === "excel" && (
                                <CommonButton
                                    label="Export"
                                    icon="pi pi-upload"
                                    type="button"
                                    className={`p-button-help !bg-orange-400  ${!splitBtn && "p-button-sm"}`}
                                    bigButton={splitBtn}
                                    onClick={(e) => {
                                        const rowsSource = Array.isArray(exportData) && exportData.length ? exportData : plainData && Array.isArray(data) ? data : tableData;
                                        const apiData = (rowsSource || []).map((row) => {
                                            const obj = {};
                                            columnsToRender.forEach((col) => {
                                                obj[col.field] = row?.[col.field];
                                            });
                                            return obj;
                                        });
                                        const fileType = "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;charset=UTF-8";
                                        const fileExtension = ".xlsx";
                                        const filename = `${exportFileName || route}-D${new Date().toISOString().split("T")[0].replace(/-/g, "")}T${new Date().toISOString().split("T")[1].replace(/:/g, "").split(".")[0]}`;
                                        exportToExcel(filename, apiData, fileType, fileExtension);
                                    }}
                                />
                            )}
                        </>
                    )}

                    {exportBtnForIADashboard && (
                        <>
                            {exportType.toLowerCase() === "csv" && (
                                <CSVLink
                                    asyncOnClick={true}
                                    data={csvExportData?.length ? csvExportData : plainData ? data : tableData}
                                    headers={columnsToRender.map((c) => ({ label: c.header, key: c.field }))}
                                    filename={`${exportFileName || route}-D${date.split("T")[0].replace(/-/g, "")}T${date.split("T")[1].replace(/:/g, "").split(".")[0]}`}
                                >
                                    <CommonButton label="Export to Excel" icon="pi pi-upload" type="button" className={`p-button-help !bg-orange-400  ${!splitBtn && "p-button-sm"}`} bigButton={splitBtn} />
                                </CSVLink>
                            )}

                            {exportType.toLowerCase() === "excel" && (
                                <CommonButton
                                    label="Export to Excel"
                                    icon="pi pi-upload"
                                    type="button"
                                    className={`p-button-help !bg-orange-400  ${!splitBtn && "p-button-sm"}`}
                                    bigButton={splitBtn}
                                    onClick={(e) => {
                                        const rowsSource = Array.isArray(exportData) && exportData.length ? exportData : plainData && Array.isArray(data) ? data : tableData;
                                        const apiData = (rowsSource || []).map((row) => {
                                            const obj = {};
                                            columnsToRender.forEach((col) => {
                                                obj[col.field] = row?.[col.field];
                                            });
                                            return obj;
                                        });
                                        const fileType = "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;charset=UTF-8";
                                        const fileExtension = ".xlsx";
                                        const filename = `${exportFileName || route}-D${new Date().toISOString().split("T")[0].replace(/-/g, "")}T${new Date().toISOString().split("T")[1].replace(/:/g, "").split(".")[0]}`;
                                        exportToExcel(filename, apiData, fileType, fileExtension);
                                    }}
                                />
                            )}
                        </>
                    )}

                    {pdfBtn && (
                        <>
                            <CommonButton
                                type="button"
                                icon="pi pi-file-pdf"
                                severity="warning"
                                rounded
                                onClick={() => {
                                    // export PDF using visible columns and current rows
                                    import("jspdf").then((jsPDF) => {
                                        import("jspdf-autotable").then(() => {
                                            const doc = new jsPDF.default(0, 0);
                                            const exportCols = columnsToRender.map((c) => ({ title: c.header, dataKey: c.field }));
                                            const rowsSource = plainData && Array.isArray(data) ? data : tableData;
                                            doc.autoTable({
                                                columns: exportCols,
                                                body: rowsSource,
                                            });
                                            doc.save(`${exportFileName || route}.pdf`);
                                        });
                                    });
                                }}
                                data-pr-tooltip="PDF"
                            />
                        </>
                    )}
                    {customBtn &&
                        customBtn?.map(({ label, icon, className, onClick, loading, disabled }, idx) => {
                            return <CommonButton key={idx} label={label} icon={icon} className={className} onClick={onClick} loading={loading} disabled={loading || disabled} />;
                        })}

                    {backBtn && (
                        <div className="flex p-justify-end">
                            <CommonButton
                                onClick={() => {
                                    history.goBack();
                                }}
                                className="p-mr-2 p-button-raised bg-gray-200 shadow-none text-gray-600 p-button-sm"
                                title="Back"
                                type="reset"
                                disabled={false}
                                label="Back"
                                icon="pi pi-arrow-left"
                                color="p-button-raised p-button-success"
                            ></CommonButton>
                        </div>
                    )}
                </div>

                {(secondSearchShow || descriptionSearchShow || searchShow || enableColumnToggle || enableFilters) && (
                    <div className="flex justify-self-center md:justify-self-end gap-2 items-center">
                        {searchShow && (
                            <span className="p-input-icon-right bg-white">
                                <i className="pi pi-search bg-white" />
                                <input value={search} onChange={handleSearchChange} placeholder="Search" className="px-4 py-2 shadow bg-white rounded-full text-lg" />
                            </span>
                        )}
                        {secondSearchShow && (
                            <span className="p-input-icon-right bg-white">
                                <i className="pi pi-search bg-white" />
                                <input value={secondSearch} onChange={handleSecondSearchChange} placeholder="Size Search" className="px-4 py-2 shadow bg-white rounded-full text-lg" />
                            </span>
                        )}
                        {descriptionSearchShow && (
                            <span className="p-input-icon-right bg-white">
                                <i className="pi pi-search bg-white" />
                                <input value={descriptionSearch} onChange={handleDescriptionSearchChange} placeholder="Description Search" className="px-4 py-2 shadow bg-white rounded-full text-lg" />
                            </span>
                        )}

                        {enableColumnToggle && Array.isArray(tableColumns) && tableColumns.length > 0 && <MultiSelect value={visibleColumns} options={tableColumns} optionLabel="header" onChange={onColumnToggle} display="chip" className="w-full sm:w-64" />}

                        {enableFilters && (
                            <span className="p-input-icon-left bg-white">
                                <i className="pi pi-search bg-white" />
                                <InputText value={globalFilterValue} onChange={onGlobalFilterChange} placeholder="Global Search" className="px-4 py-2 shadow bg-white rounded-full text-lg" />
                            </span>
                        )}
                    </div>
                )}
            </div>
        </React.Fragment>
    );

    return (
        <div className={`overflow-x-auto ${sticky && "sticky"} ${!topSelection && "hideCheckBox"}`}>
            <div className="card">
                <DataTable
                    className="p-datatable-gridlines p-datatable-striped p-datatable-sm p-datatable-customers"
                    value={plainData && Array.isArray(data) ? data : Array.isArray(data) ? tableData : []}
                    paginator={pageShow === false ? false : true}
                    rows={showRow || 10}
                    dataKey={dataKey}
                    rowHover
                    selection={selectedData}
                    onSelectionChange={(e, a) => {
                        if (onSelectionChange) return onSelectionChange(e, a);
                        if (e.type === "all") {
                            if (e.value.length === 0) {
                                return setSelectedData([]);
                            }
                            return setSelectedData?.(data);
                        }
                        setSelectedData?.(e.value);
                    }}
                    emptyMessage={emptyMessage}
                    loading={loading}
                    header={showTableHeader ? (newBtn || !tableHeaderName ? leftToolbar : tableHeader) : null}
                    rowsPerPageOptions={rowsPerPageOptions ? rowsPerPageOptions : [15, 25, 50, 75]}
                    paginatorTemplate={pageShow && "CurrentPageReport FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink RowsPerPageDropdown"}
                    currentPageReportTemplate="Showing {first} to {last} of {totalRecords} items"
                    resizableColumns
                    columnResizeMode="expand"
                    showGridlines
                    stripedRows
                    autoLayout={autoLayout}
                    responsiveLayout="scroll"
                    selectionMode="checkbox"
                    isDataSelectable={isRowSelectable}
                    rowClassName={rowClassName}
                    selectionAutoFocus={false}
                    editMode={editMode || "cell"}
                    // NEW: Filter-related props
                    filters={enableFilters ? filters : undefined}
                    filterDisplay={enableFilters ? filterDisplay : undefined}
                    globalFilterFields={enableFilters ? globalFilterFields : undefined}
                    {...rest}
                >
                    {isSelectable && <Column selectionMode={checkboxCellColor ? null : "multiple"} body={checkboxCellColor ? checkboxBodyTemplate : null} selectionAutoFocus={false} headerStyle={getCheckboxHeaderStyle()} ref={dt}></Column>}

                    {/* Action button on left */}
                    {actionButton && actionButtonPosition === "left" && <Column body={actionButton} header={actionHeader || "Action"} headerStyle={{ textAlign: "center", width: `${actionButtonWidth}rem` }}></Column>}

                    {/* Render dynamic columns (only those in columnsToRender) */}
                    {Array.isArray(columnsToRender) &&
                        columnsToRender?.filter(Boolean)?.map((col, i) => (
                            <Column
                                key={col?.field || i}
                                field={col?.field}
                                header={col?.header}
                                sortable={sortable}
                                body={col?.sortableBody}
                                footer={col?.footer}
                                footerClassName={col?.footerClassName}
                                style={col?.style}
                                editor={col?.editor}
                                onCellEditComplete={col?.onCellEditComplete}
                                // NEW: Filter-related column props
                                filter={enableFilters && col.filter !== false}
                                filterField={col.filterField || col.field}
                                filterPlaceholder={col.filterPlaceholder || `Search ${col.header}`}
                                filterMatchMode={col.filterMatchMode}
                                showFilterMenu={col.showFilterMenu}
                                filterElement={col.filterElement || (enableFilters ? (options) => getDefaultFilterElement(options, col) : undefined)}
                                dataType={col.dataType}
                            />
                        ))}

                    {/* Action button on right (default) */}
                    {actionButton && actionButtonPosition === "right" && <Column body={actionButton} header={actionHeader || "Action"} headerStyle={{ textAlign: "center", width: `${actionButtonWidth}rem` }}></Column>}

                    {extraTableAction?.map((col, i) => (
                        <Column key={i} body={col.body} header={col.header} headerStyle={{ textAlign: "center" }}></Column>
                    ))}

                    {editMode === "row" && <Column rowEditor bodyStyle={{ textAlign: "center" }}></Column>}
                </DataTable>
            </div>
        </div>
    );
};

export default Table;
