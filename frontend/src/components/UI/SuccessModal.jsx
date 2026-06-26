import Modal from "./Modal";
import Button from "./Button";
import { FaCheckCircle } from "react-icons/fa";

export const SuccessModal = ({ isOpen, onClose, title, message, details }) => (
  <Modal
    isOpen={isOpen}
    onClose={onClose}
    title={title}
    icon={FaCheckCircle}
    size="sm"
    footer={
      <Button variant="primary" size="sm" onClick={onClose}>
        OK
      </Button>
    }
  >
    <p className="text-sm text-slate-600">{message}</p>
    {details && (
      <div className="mt-3 rounded-lg border border-slate-200 bg-slate-50 p-3">
        <p className="text-xs font-medium text-slate-700">Détails</p>
        {typeof details === "object" ? (
          <dl className="mt-1 space-y-1 text-sm text-slate-600">
            {Object.entries(details).map(([key, value]) => (
              <div key={key} className="flex justify-between gap-4">
                <dt className="font-medium">{key}</dt>
                <dd>{value}</dd>
              </div>
            ))}
          </dl>
        ) : (
          <p className="mt-1 text-sm text-slate-600">{details}</p>
        )}
      </div>
    )}
  </Modal>
);
