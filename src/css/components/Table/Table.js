import { exportToExcel } from "components/Export/exportToExcel";
import React, { useEffect, useRef, useState } from "react";
import { SplitButton } from "primereact/splitbutton";
import { CommonButton } from "../Buttons/Buttons";
import { DataTable } from "primereact/datatable";
import { useHistory } from "react-router-dom";
import { Column } from "primereact/column";
import { CSVLink } from "react-csv";
import "jspdf-autotable";
import * as XLSX from "xlsx";

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
    headerGroup,
    footerGroup,
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
    exportType = "excel",
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
    width,
    ...rest
}) => {
    const [search, setSearch] = useState("");
    const [secondSearch, setSecondSearch] = useState("");
    const [descriptionSearch, setDescriptionSearch] = useState("");
    const [tableData, setTableData] = useState([]);
    const [csvExportData, setCSVExportData] = useState([]);

    const dt = useRef(null);
    const history = useHistory();
    const date = new Date(new Date().setHours(new Date().getHours() + 6)).toISOString();
    const route = window.location.href.split("/").pop();

    // Custom checkbox body template with conditional background color
    const checkboxBodyTemplate = (rowData, options) => {
        const backgroundColor = checkboxCellColor ? (typeof checkboxCellColor === "function" ? checkboxCellColor(rowData) : checkboxCellColor[rowData.id] || checkboxCellColor.default) : "transparent";

        return (
            <div style={{ backgroundColor, padding: "0.5rem", height: "100%", display: "flex", alignItems: "center", justifyContent: "center" }}>
                <input
                    type="checkbox"
                    checked={selectedData?.includes(rowData)}
                    onChange={(e) => {
                        const isChecked = e.target.checked;
                        if (isChecked) {
                            if (!selectedData?.includes(rowData)) {
                                setSelectedData?.((prev) => [...(prev || []), rowData]);
                            }
                        } else {
                            setSelectedData?.((prev) => prev?.filter((item) => item !== rowData) || []);
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
            : { minWidth: "20rem !important" };
    };

    const handleSearchChange = (e) => {
        const value = e.target.value;
        setSearch(value);
        if (setCustomSearch) {
            setCustomSearch(value);
        }
    };

    const handleSecondSearchChange = (e) => {
        const value = e.target.value;
        setSecondSearch(value);
        if (setSecondCustomSearch) {
            setSecondCustomSearch(value);
        }
    };

    const handleDescriptionSearchChange = (e) => {
        const value = e.target.value;
        setDescriptionSearch(value);
    };

    const tableHeader = (
        <div className={`${searchShow && "table-header"} ${descriptionSearchShow && "table-header"} ${secondSearchShow && "table-header"} font-bold grid grid-cols-1 md:grid-cols-2 items-center`}>
            <p className={`lg:justify-self-start md:justify-self-start justify-self-center ${!tableHeaderComponent && "text-2xl"}`}>{tableHeaderName}</p>
            {(secondSearchShow || descriptionSearchShow || searchShow) && (
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
                </div>
            )}
        </div>
    );

    /**
     * Renders Excel export button with branded template
     */

    const exportToExcelFixed = () => {
        try {
            const now = new Date();

            // Format Date – DD-MM-YYYY
            const day = String(now.getDate()).padStart(2, "0");
            const month = String(now.getMonth() + 1).padStart(2, "0");
            const year = now.getFullYear();
            const formattedDate = `${day}-${month}-${year}`;

            // Format Time – hh:mm AM/PM
            let hours = now.getHours();
            const minutes = String(now.getMinutes()).padStart(2, "0");
            const ampm = hours >= 12 ? "PM" : "AM";
            hours = hours % 12 || 12;
            const formattedTime = `${hours}:${minutes}${ampm}`; // ✅ FIXED HERE

            // Format title (optional)
            const title = (exportFileName || route).replace(/-/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());

            // Final filename
            const filename = `${title} - (Date: ${formattedDate}) (Time: ${formattedTime})`;

            // Filter out action columns
            const exportColumns = tableColumns.filter((col) => col.field && col.field !== "slNo" && col.field !== "action");

            // Extract column headers
            const columnHeaders = exportColumns.map((col) => {
                if (typeof col.header === "string") {
                    return col.header;
                }
                if (col.header?.props?.children) {
                    if (typeof col.header.props.children === "string") {
                        return col.header.props.children;
                    }
                }
                return col.field;
            });

            // Helper function to extract text from React elements - keeps comma format
            const extractTextFromReactElement = (element) => {
                if (!element) return "";

                if (typeof element === "string" || typeof element === "number") {
                    return String(element);
                }

                if (element?.props?.children) {
                    const children = element.props.children;

                    if (Array.isArray(children)) {
                        // Join with comma and space (same as original data format)
                        return children
                            .map((child) => extractTextFromReactElement(child))
                            .filter((text) => text.trim() !== "")
                            .join(", "); // Comma দিয়ে join
                    }

                    return extractTextFromReactElement(children);
                }

                if (element?.text) {
                    return String(element.text);
                }

                return "";
            };

            // Prepare data rows with formatted values
            const dataRows = tableData.map((row) => {
                return exportColumns.map((col) => {
                    let value;

                    // If column has sortableBody (custom rendering), use it
                    if (col.sortableBody && typeof col.sortableBody === "function") {
                        try {
                            const renderedElement = col.sortableBody(row);
                            value = extractTextFromReactElement(renderedElement);
                        } catch (error) {
                            console.warn(`Error rendering sortableBody for field ${col.field}:`, error);
                            value = row[col.field];
                        }
                    } else {
                        // Get raw value from data
                        value = row[col.field];
                    }

                    // Handle null/undefined
                    if (value === null || value === undefined || value === "") {
                        return "";
                    }

                    // Handle date strings - keep as text
                    if (typeof value === "string" && value.includes("T") && value.length > 10) {
                        const datePart = value.split("T")[0];
                        if (datePart.match(/^\d{4}-\d{2}-\d{2}$/)) {
                            return datePart;
                        }
                    }

                    // Handle boolean
                    if (typeof value === "boolean") {
                        return value ? "Yes" : "No";
                    }

                    // If it's a number type in the original data, keep it as number
                    if (typeof value === "number") {
                        return value;
                    }

                    // If it's a string, keep it as string
                    return String(value).trim();
                });
            });

            // Validate data
            if (dataRows.length === 0) {
                alert("No data available to export.");
                return;
            }

            // Create workbook
            const wb = XLSX.utils.book_new();

            // Create worksheet from array of arrays
            const ws = XLSX.utils.aoa_to_sheet([columnHeaders, ...dataRows]);

            // Auto-size columns
            const colWidths = columnHeaders.map((header, colIndex) => {
                const headerLen = String(header).length;
                const maxContentLen = Math.max(...dataRows.map((row) => String(row[colIndex] || "").length));
                return { wch: Math.min(Math.max(headerLen + 2, maxContentLen + 2, 12), 50) };
            });
            ws["!cols"] = colWidths;

            // Style cells
            const range = XLSX.utils.decode_range(ws["!ref"]);

            for (let R = range.s.r; R <= range.e.r; ++R) {
                for (let C = range.s.c; C <= range.e.c; ++C) {
                    const cellRef = XLSX.utils.encode_cell({ r: R, c: C });

                    if (!ws[cellRef]) continue;

                    // Header row styling
                    if (R === 0) {
                        ws[cellRef].s = {
                            font: { bold: true, color: { rgb: "FFFFFF" }, sz: 11 },
                            fill: { fgColor: { rgb: "4472C4" } },
                            alignment: { horizontal: "center", vertical: "center" },
                            border: {
                                top: { style: "thin", color: { rgb: "FFFFFF" } },
                                bottom: { style: "thin", color: { rgb: "FFFFFF" } },
                                left: { style: "thin", color: { rgb: "FFFFFF" } },
                                right: { style: "thin", color: { rgb: "FFFFFF" } },
                            },
                        };
                    }
                    // Data rows styling
                    else {
                        const cellValue = ws[cellRef].v;
                        const cellType = ws[cellRef].t;
                        const isNumber = typeof cellValue === "number";

                        // Base styling for all cells
                        ws[cellRef].s = {
                            alignment: {
                                horizontal: isNumber ? "right" : "left",
                                vertical: "center",
                            },
                            border: {
                                top: { style: "thin", color: { rgb: "D0D0D0" } },
                                bottom: { style: "thin", color: { rgb: "D0D0D0" } },
                                left: { style: "thin", color: { rgb: "D0D0D0" } },
                                right: { style: "thin", color: { rgb: "D0D0D0" } },
                            },
                        };

                        // Format numbers WITHOUT comma separator
                        if (isNumber && cellType === "n") {
                            const hasDecimals = cellValue % 1 !== 0;

                            if (hasDecimals) {
                                ws[cellRef].z = "0.00";
                            } else {
                                ws[cellRef].z = "0";
                            }
                        }
                        // Ensure text cells stay as text
                        else if (cellType === "s") {
                            ws[cellRef].t = "s";
                        }
                    }
                }
            }

            // Add worksheet to workbook
            XLSX.utils.book_append_sheet(wb, ws, "Data");

            // Write file
            XLSX.writeFile(wb, `${filename}.xlsx`);

            console.log(`✅ Successfully exported ${dataRows.length} rows to ${filename}.xlsx`);
        } catch (error) {
            console.error("❌ Excel export error:", error);
            alert(`Error exporting to Excel: ${error.message}\n\nCheck browser console for details.`);
        }
    };

    const save = () => {
        // history.push(newMlcRoute);
    };

    const exportColumns = tableColumns?.map((col) => ({ title: col.header, dataKey: col.field }));

    const exportPdf = () => {
        import("jspdf").then((jsPDF) => {
            import("jspdf-autotable").then(() => {
                const doc = new jsPDF.default(0, 0);
                doc.autoTable(exportColumns, tableData);
                doc.save("products.pdf");
            });
        });
    };

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
                            <SplitButton className="p-button-success p-button-sm" label="New" icon="" onClick={save} model={items}></SplitButton>
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
                    {exportBtn && <CommonButton label="Export" icon="pi pi-upload" type="button" className="p-button-help !bg-orange-400 p-button-sm" onClick={exportToExcelFixed} />}
                    {exportBtnForIADashboard && (
                        <>
                            {exportType.toLowerCase() === "csv" && (
                                <CSVLink asyncOnClick={true} data={csvExportData?.length ? csvExportData : tableData} filename={`${exportFileName || route}-D${date.split("T")[0].replace(/-/g, "")}T${date.split("T")[1].replace(/:/g, "").split(".")[0]}`}>
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
                                        const apiData = exportData?.length ? exportData : tableData;
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
                            <CommonButton type="button" icon="pi pi-file-pdf" severity="warning" rounded onClick={exportPdf} data-pr-tooltip="PDF" />
                        </>
                    )}
                    {customBtn &&
                        customBtn?.map(({ label, icon, className, onClick, loading, disabled }) => {
                            return <CommonButton label={label} icon={icon} className={className} onClick={onClick} loading={loading} disabled={loading || disabled} />;
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

                {(secondSearchShow || descriptionSearchShow || searchShow) && (
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
                    </div>
                )}
            </div>
        </React.Fragment>
    );

    // Filter data based on search criteria
    useEffect(() => {
        if (!data || !data.length) {
            return setTableData([]);
        }

        let filteredData = [...data];

        if (search) {
            filteredData = filteredData.filter((item) => {
                return Object.values(item).some((value) => String(value).toLowerCase().includes(search.toLowerCase()));
            });
        }

        if (secondSearch) {
            filteredData = filteredData.filter((item) => {
                const sizeVal = item.size?.toString().toLowerCase();
                return sizeVal?.includes(secondSearch.toLowerCase());
            });
        }

        if (descriptionSearch) {
            filteredData = filteredData.filter((item) => {
                const descriptionVal = item.materialDescription?.toString().toLowerCase();
                return descriptionVal?.includes(descriptionSearch.toLowerCase());
            });
        }

        setTableData(filteredData);
    }, [search, secondSearch, descriptionSearch, data]);

    useEffect(() => {
        const updatedArray = tableData?.length
            ? tableData?.map((obj) => {
                  const { createdBy, createdDate, ...rest } = obj;
                  for (const key in rest) {
                      if (key.includes("ID")) {
                          delete rest[key];
                      }
                  }
                  return rest;
              })
            : [];
        setCSVExportData(updatedArray);
    }, [tableData]);

    // KEY FIX: Custom selection change handler that only works with filtered data
    const handleSelectionChange = (e) => {
        if (onSelectionChange) {
            return onSelectionChange(e);
        }

        // When "select all" is triggered
        if (e.type === "all") {
            if (e.value.length === 0) {
                // Deselect all
                return setSelectedData([]);
            }
            // Select only the currently filtered/visible data (tableData)
            return setSelectedData?.(tableData);
        }

        // For individual row selection
        setSelectedData?.(e.value);
    };

    return (
        <div className={`overflow-x-auto ${sticky && "sticky"} ${!topSelection && "hideCheckBox"}`}>
            <style>{`
                .p-datatable-customers .p-datatable-thead th {
                    background-color: #043975 !important;
                    color: white !important;
                }
            `}</style>
            <div className="card">
                <DataTable
                    className="p-datatable-gridlines p-datatable-striped p-datatable-sm p-datatable-customers"
                    value={tableData}
                    headerColumnGroup={headerGroup}
                    footerColumnGroup={footerGroup}
                    paginator={pageShow === false ? false : true}
                    rows={showRow || 10}
                    dataKey={dataKey}
                    rowHover
                    selection={selectedData}
                    onSelectionChange={handleSelectionChange} // Use custom handler
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
                    {...rest}
                >
                    {isSelectable && <Column selectionMode={checkboxCellColor ? null : "multiple"} body={checkboxCellColor ? checkboxBodyTemplate : null} selectionAutoFocus={false} headerStyle={getCheckboxHeaderStyle()} ref={dt}></Column>}

                    {actionButton && actionButtonPosition === "left" && <Column body={actionButton} header={actionHeader || "Action"} headerStyle={{ textAlign: "center", width: `${actionButtonWidth}rem` }}></Column>}

                    {/* {Array.isArray(tableColumns) &&
                        tableColumns
                            ?.filter(Boolean)
                            ?.map((col, i) => (
                                <Column key={i} field={col?.field} header={col?.header} sortable={sortable} body={col?.sortableBody} footer={col?.footer} footerClassName={col?.footerClassName} style={col?.style} editor={col?.editor} onCellEditComplete={col?.onCellEditComplete} frozen={col?.frozen} alignFrozen={col?.alignFrozen || "left"}></Column>
                            ))} */}
                    {Array.isArray(tableColumns) &&
                        tableColumns?.filter(Boolean)?.map((col, i) => {
                            // Apply column width: support col.width (e.g. "10px", "5rem") on style, bodyStyle, headerStyle
                            const widthStyle = col?.width != null && col?.width !== "" ? { width: col.width, minWidth: col.width, maxWidth: col.width } : {};
                            const colStyle = { ...widthStyle, ...col?.style };
                            const colBodyStyle = { ...widthStyle, ...col?.bodyStyle };
                            const colHeaderStyle = { ...widthStyle, ...col?.headerStyle };

                            // Calculate the left position for frozen columns
                            let frozenWidth = 0;
                            if (col?.frozen) {
                                for (let j = 0; j < i; j++) {
                                    const prevCol = tableColumns[j];
                                    if (prevCol?.frozen) {
                                        const width = prevCol?.width || prevCol?.style?.width || prevCol?.style?.minWidth || "0px";
                                        frozenWidth += parseInt(width) || 0;
                                    }
                                }
                            }

                            return (
                                <Column
                                    key={i}
                                    field={col?.field}
                                    header={col?.header}
                                    sortable={sortable}
                                    body={col?.sortableBody}
                                    footer={col?.footer}
                                    footerClassName={col?.footerClassName}
                                    style={col?.frozen ? { ...colStyle, left: `${frozenWidth}px` } : colStyle}
                                    bodyStyle={col?.frozen ? { ...colBodyStyle, left: `${frozenWidth}px` } : colBodyStyle}
                                    headerStyle={col?.frozen ? { ...colHeaderStyle, left: `${frozenWidth}px` } : colHeaderStyle}
                                    editor={col?.editor}
                                    onCellEditComplete={col?.onCellEditComplete}
                                    frozen={col?.frozen}
                                    alignFrozen={col?.alignFrozen || "left"}
                                ></Column>
                            );
                        })}

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
