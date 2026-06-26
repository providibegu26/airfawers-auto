const ToastNotification = ({ show, message, type }) => {
  if (!show) return null;

  const bgColor = {
    success: 'bg-green-500',
    error: 'bg-red-500',
    info: 'bg-blue-500'
  }[type] || 'bg-green-500';

  return (
    <div className={`fixed bottom-4 right-4 z-50 ${bgColor} text-white px-4 py-3 rounded-lg shadow-lg flex items-center space-x-2`}>
      <i className={`fas fa-${
        type === 'success' ? 'check-circle' : 
        type === 'error' ? 'exclamation-circle' : 'info-circle'
      }`}></i>
      <span>{message}</span>
    </div>
  );
};

export default ToastNotification;