import { useEffect } from "react";
import {
  FaCheckCircle,
  FaTimesCircle,
  FaInfoCircle,
  FaExclamationTriangle,
} from "react-icons/fa";
import Modal from "./Modal";
import Button from "./Button";

const ToastNotification = ({ message, type, onClose, duration = 4000 }) => {
  useEffect(() => {
    const timer = setTimeout(() => {
      onClose();
    }, duration);

    return () => clearTimeout(timer);
  }, [duration, onClose]);

  const getIcon = () => {
    switch (type) {
      case "success":
        return FaCheckCircle;
      case "error":
        return FaTimesCircle;
      case "warning":
        return FaExclamationTriangle;
      default:
        return FaInfoCircle;
    }
  };

  const getTitle = () => {
    switch (type) {
      case "success":
        return "Succès";
      case "error":
        return "Erreur";
      case "warning":
        return "Attention";
      default:
        return "Information";
    }
  };

  const getButtonVariant = () => {
    switch (type) {
      case "error":
        return "danger";
      case "warning":
        return "primary";
      default:
        return "primary";
    }
  };

  return (
    <Modal
      show
      onClose={onClose}
      title={getTitle()}
      icon={getIcon()}
      size="sm"
      closeOnOverlay={false}
      footer={
        <Button variant={getButtonVariant()} size="sm" onClick={onClose}>
          OK
        </Button>
      }
    >
      <p className="text-sm text-slate-600">{message}</p>
    </Modal>
  );
};

export default ToastNotification;
