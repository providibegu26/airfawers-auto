import React from "react";
import Modal from "./Modal";
import Button from "./Button";

const ConfirmationModal = ({
  isOpen,
  show,
  onClose,
  onConfirm,
  title,
  message,
  confirmText = "Confirmer",
  cancelText = "Annuler",
  variant = "primary",
}) => (
  <Modal
    isOpen={isOpen ?? show}
    onClose={onClose}
    title={title}
    size="sm"
    footer={
      <>
        <Button variant="secondary" size="sm" onClick={onClose}>
          {cancelText}
        </Button>
        <Button
          variant={variant}
          size="sm"
          onClick={onConfirm}
        >
          {confirmText}
        </Button>
      </>
    }
  >
    <p className="text-sm text-slate-600">{message}</p>
  </Modal>
);

export default ConfirmationModal;
