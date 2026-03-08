import { Dialog } from "primereact/dialog";
import { CommonButton } from "../Buttons/Buttons";

const ConfirmModal = ({ visibleModal, multiItem, item, confirmDelete, onHide, name, loading, message, icon, style, classNames }) => {
    /**@visibleModal => modal pop up state => true / false */
    /**@multiItem => If you want to delete multiItem set => true otherwise false => default true */
    /**@multiItem => If you want to delete multiItem set => true otherwise false => default false */
    /**@item => item you want to delete otherwise model text will not show up*/
    /**@confirmDelete => delete confirmation function*/
    /**@onHide => function to hide the component*/
    /**@name =>  if multi item doesnt want to delete please pass a name of the item*/
    /**@message =>  Custom message*/
    /**@icon =>  Custom Icon*/
    /**@style =>  Custom style*/
    const modalFooter = (
        <>
            <CommonButton label="No" icon="pi pi-times " className="p-button-raised p-button-success" onClick={onHide} disabled={loading} />
            <CommonButton className={`p-mr-2 p-button-raised ${!loading && "p-button-danger"}`} title={!loading ? "Yes" : "Loading"} disabled={loading} label={!loading ? "Yes" : "Loading"} icon={loading ? "pi pi-spin" : "pi pi-check"} loading={loading} onClick={confirmDelete} />
        </>
    );
    return (
        <Dialog visible={visibleModal} style={{ width: "450px" }} header="Confirm" modal footer={modalFooter} onHide={onHide} closeOnEscape blockScroll icons focusOnShow>
            <div className="confirmation-content flex items-center">
                <i className={`${`pi p-mr-3 ${icon ? icon : "pi-check"}`}`} style={style ? style : { fontSize: "1rem", color: "green" }} />
                {item && <span>{message ? `${message}` : "Are you sure you want to do it?"}</span>}
            </div>
        </Dialog>
    );
};

export default ConfirmModal;
