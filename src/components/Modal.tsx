import { useEffect, useState, type ButtonHTMLAttributes, type ReactNode } from "react";
import { createPortal } from "react-dom";

import Icon from "./Icon";
import Divider from "./Divider";
import TextButton from "./TextButton";

import type { ButtonVariant } from "../types";

interface ModalAction extends ButtonHTMLAttributes<HTMLButtonElement> {
    variant?: ButtonVariant;
    text?: string;
}

export interface ModalProps {
    modalOpen?: boolean;
    trigger?: ReactNode;
    modalPosition?: string;
    title?: string;
    children?: ReactNode;
    confirmAction?: ModalAction;
    cancelAction?: ModalAction;
    onConfirm?: () => void | Promise<void>;
    onCancel?: () => void | Promise<void>;
    onClose?: () => void;
}

const Modal = ({
    modalOpen,
    trigger,
    modalPosition = "fixed inset-0",
    title = "Modal Title",
    confirmAction = {
        text: "Confirm",
    },
    cancelAction = {
        variant: "neutral-ghost",
        text: "Cancel",
    },
    onConfirm,
    onCancel,
    onClose,
    children,
}: ModalProps) => {
    const [isOpen, setIsOpen] = useState(modalOpen !== undefined ? modalOpen : false);
    const [shouldRender, setShouldRender] = useState(modalOpen !== undefined ? modalOpen : false);
    const [isModalLoading, setIsModalLoading] = useState(false);

    useEffect(() => {
        if (modalOpen !== undefined) {
            setIsOpen(modalOpen);
        }
    }, [modalOpen]);

    useEffect(() => {
        if (isOpen) {
            setShouldRender(true);
        } else {
            const timer = setTimeout(() => {
                setShouldRender(false);
                if (onClose !== undefined) onClose();
            }, 300);
            return () => {
                clearTimeout(timer);
            };
        }
    }, [isOpen]);

    const handleCancel = async () => {
        if (isModalLoading) return;

        if (onCancel !== undefined) {
            try {
                setIsModalLoading(true);
                await onCancel();
                setIsModalLoading(false);
                if (trigger !== undefined) handleClose();
            } catch (error) {
                console.error("Modal cancel action failed: ", error);
                setIsModalLoading(false);
            }
        } else {
            handleClose();
        }
    };

    const handleConfirm = async () => {
        if (isModalLoading) return;

        if (onConfirm !== undefined) {
            try {
                setIsModalLoading(true);
                await onConfirm();
                setIsModalLoading(false);
                handleClose();
            } catch (error) {
                if (error) {
                    console.error("Modal confirm action failed: ", error);
                }
                setIsModalLoading(false);
            }
        } else {
            handleClose();
        }
    };

    const handleClose = () => {
        if (isModalLoading) return;

        if (modalOpen === undefined) {
            setIsOpen(false);
        } else if (modalOpen !== undefined && onClose !== undefined) {
            onClose();
        }
    };

    if (trigger === undefined && modalOpen === undefined) return <></>;

    return (
        <>
            {trigger && <div onClick={isModalLoading ? undefined : () => setIsOpen(true)}>{trigger}</div>}
            {shouldRender &&
                createPortal(
                    <div
                        className={
                            `${modalPosition} w-full flex justify-center items-center z-20 p-4 ` +
                            ` transition-opacity duration-300 ease-in-out ${isOpen ? "opacity-100" : "opacity-0"}`
                        }
                    >
                        {/* BACKDROP */}
                        <div
                            className="absolute inset-0 bg-background-0/30 backdrop-blur-xs"
                            onClick={handleClose}
                        ></div>

                        {/* MODAL */}
                        <div className="relative bg-background-2 p-4 m-8 rounded-md border border-white/10 shadow-md w-full max-w-100 ">
                            <div className="modal-header flex items-start justify-between gap-4">
                                <p className="modal-title font-semibold">{title}</p>
                                <div onClick={handleClose}>
                                    <Icon name="x" size={20} className="cursor-pointer" />
                                </div>
                            </div>
                            <Divider className="-mx-4" />
                            <div className="modal-content py-2 px-4 -mx-4 text-sm overflow-y-auto max-h-[60vh]">
                                {children}
                            </div>
                            <Divider className="-mx-4" />
                            <div className="modal-footer flex items-center justify-end gap-4 pt-2">
                                <div onClick={handleCancel}>
                                    <TextButton {...cancelAction} disabled={cancelAction.disabled || isModalLoading}>
                                        {cancelAction.text}
                                    </TextButton>
                                </div>
                                <div onClick={handleConfirm}>
                                    <TextButton {...confirmAction} disabled={confirmAction.disabled || isModalLoading}>
                                        {confirmAction.text}
                                    </TextButton>
                                </div>
                            </div>
                        </div>
                    </div>,
                    document.getElementById("dashboard-content") ??
                        document.querySelector("main") ??
                        document.getElementById("root") ??
                        document.body,
                )}
        </>
    );
};

export default Modal;

/*
 * Usage:
 *
 * ================================
 * WITH TRIGGER
 * ================================
 *
 * <Modal
 *  trigger={<TriggerComponent />}
 *
 *  modalPosition="..."
 *  title="..."
 *  confirmAction={...}
 *  cancelAction={...}
 *  onConfirm={() => {}}
 *  onCancel={() => {}}
 * >
 *   <ModalContent />
 * </Modal>
 *
 * ================================
 * WITHOUT TRIGGER (opening/closing is handled outside)
 * ================================
 *
 * <Modal
 *  modalOpen={openFlag}
 *  onClose={() => setOpenFlag(false)}
 *
 *  modalPosition="..."
 *  title="..."
 *  confirmAction={...}
 *  cancelAction={...}
 *  onConfirm={() => {}}
 *  onCancel={() => {}}
 * >
 *  <ModalContent />
 * </Modal>
 *
 */
