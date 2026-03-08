import { Column } from "primereact/column";
import { DataTable } from "primereact/datatable";
import React, { useEffect, useRef, useState } from "react";
import { CSVLink } from "react-csv";
import { useHistory } from "react-router-dom";
import { CommonButton } from "../Buttons/Buttons";

export const Table2 = ({
    isSelectable = true,
    isFilter = false,
    rows = 25,
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
    actionButton,
    importExportBtn,
    dialog,
    multiItem = true,
    deleteBtn = false,
    showDeleteModal = false,
    setShowDeleteModal,
    newBtn = true,
    newBtnRoute,
    exportBtn,
    exportFunc,
    ref,
    searchShow = true,
    pageShow,
    sortable,
    isColor,
    actionButtonWidth = 8,
    body,
    autoLayout = true,
    exportFileName,
    showTableHeader = true,
    actionHeader,
    ...rest
}) => {
    /**@isSelectable => select box on the left=> ex: true / false */
    /**@rows => total rows you want=> ex: 10 */
    /**@emptyMessage => if no data found message */
    /**@tableHeaderName => Table Header Name/ table name */
    /**@isTopbarShow => topbar buttons => new /delete/ export/ import => true / false*/
    /**@tableColumns => tableColumns you want*/
    /**@data / @setData => state for table data*/
    /**@loading / @setLoading => loading state=> true / false*/
    /** @selectedData / @setSelectedData => state for selected data */
    /** @deleteSelected => delete method */
    /** @showModal / @setShowModal => state for modal */
    /** @deleteSelected => delete method */
    /** @dataKey => unique id of the field */
    /** @actionButton => Action button of the field */
    /** @dialog => method for dialog box*/
    /** @deleteBtn => delete button in topbar => true / false*/
    /** @showCreateModal / @setShowCreateModal => Modal open close state => true / false*/
    /** @newBtn => if you want newBtn => true / false => if @newBtn false send @tableHeaderName */
    /** @newBtnRoute => if you don't want newBtn with route pass your route*/
    /** @exportBtn => If you want export button show up*/
    /** @searchShow => If you want to show search button*/
    /** @sortable => If you want to show shorting*/
    /** @isFilter => If you want to show shorting*/

    const [search, setSearch] = useState("");
    const [tableData, setTableData] = useState([]);

    const dt = useRef(null);
    const history = useHistory();
    const date = new Date().toISOString();
    const route = window.location.href.split("/").pop();

    const tableHeader = (
        <div className={`${searchShow && "table-header"} font-bold `}>
            {tableHeaderName}
            {searchShow && (
                <span className="p-input-icon-right">
                    <i className="pi pi-search" />
                    <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search" className="px-4 py-2  shadow bg-white rounded-full text-lg" />
                </span>
            )}
        </div>
    );

    const leftToolbar = (
        <React.Fragment>
            <div className="table-header font-bold">
                <div className="flex gap-2">
                    {newBtn && (
                        <CommonButton
                            label="New"
                            icon="pi pi-plus"
                            className="p-button-success "
                            onClick={() => {
                                if (newBtnRoute) return history.push(newBtnRoute);
                                setShowCreateModal(true);
                            }}
                        />
                    )}

                    {deleteBtn && <CommonButton label="Delete" icon="pi pi-trash" className="p-button-danger" onClick={() => setShowCreateModal(true)} disabled={!selectedData || !selectedData.length} />}
                    {exportBtn && (
                        <CSVLink asyncOnClick={true} data={tableData} filename={`${exportFileName || route}-D${date.split("T")[0].replace(/-/g, "")}T${date.split("T")[1].replace(/:/g, "").split(".")[0]}`}>
                            <CommonButton label="Export" icon="pi pi-download" className="p-button-help !bg-orange-400" />
                        </CSVLink>
                    )}
                </div>

                <span className="p-input-icon-right ">
                    <i className="pi pi-search" />
                    <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search" className="px-4 py-2  shadow bg-white rounded-full text-lg" />
                </span>
            </div>
        </React.Fragment>
    );

    useEffect(() => {
        if (typeof data === "undefined" || data === null) {
            return setTableData([]);
        }
        setTableData(data);
    }, [data]);

    return (
        <div className="p-grid table table2">
            <div className="p-col-12">
                <div className="card">
                    <DataTable
                        className="p-datatable-gridlines p-datatable-striped p-datatable-sm p-datatable-customers "
                        ref={dt}
                        value={data}
                        paginator={pageShow || true}
                        rows={25}
                        dataKey={dataKey}
                        rowHover
                        selection={selectedData}
                        onSelectionChange={(e) => setSelectedData?.(e.value)}
                        globalFilter={search}
                        emptyMessage={emptyMessage}
                        loading={loading}
                        header={showTableHeader ? (newBtn || !tableHeaderName ? leftToolbar : tableHeader) : null}
                        rowsPerPageOptions={[25, 50, 75]}
                        paginatorTemplate={pageShow && "FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink CurrentPageReport RowsPerPageDropdown"}
                        currentPageReportTemplate="Showing {first} to {last} of {totalRecords} items"
                        resizableColumns
                        columnResizeMode="expand"
                        showGridlines
                        stripedRows
                        autoLayout={autoLayout}
                        responsive
                        selectionMode="checkbox"
                        onRowClick={(e) => //Console.log(e)}
                        {...rest}
                    >
                        {isSelectable && (
                            <Column
                                selectionMode="multiple"
                                headerStyle={{ width: "4em", alignItems: "center", justifyContent: "center", textAlign: "center", backgroundColor: "#0000FF !important" }}
                                bodyStyle={{ width: "4em", alignItems: "center", justifyContent: "center", t9extAlign: "center" }}
                            ></Column>
                        )}
                        {isFilter && <Column field="name" header="Name" filter filterPlaceholder="Search by name" style={{ minWidth: "12rem" }} />}
                        {tableColumns?.map((col, i) => (
                            <Column key={i} field={col.field} header={col.header} sortable={sortable} body={col.sortableBody} style={{ minWidth: col.minWidth }} onRowClick={null}></Column>
                        ))}
                        {actionButton && <Column body={actionButton} header={actionHeader || "Action"} headerStyle={{ textAlign: "center", width: `${actionButtonWidth}rem` }}></Column>}
                        {extraTableAction?.map((col, i) => (
                            <Column key={i} body={col.body} header={col.header} headerStyle={{ textAlign: "center" }}></Column>
                        ))}
                    </DataTable>
                </div>
            </div>
        </div>
    );
};
