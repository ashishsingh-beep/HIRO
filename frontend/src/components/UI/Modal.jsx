import React from 'react';

const Modal = ({ isOpen, onClose, title, message, type = 'success' }) => {
  React.useEffect(() => {
    if (isOpen) {
      const timer = setTimeout(() => {
        onClose();
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const icons = {
    success: 'check_circle',
    error: 'error',
    warning: 'warning',
    info: 'info'
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content animate-pop" onClick={e => e.stopPropagation()}>
        <div className={`modal-icon-header ${type}`}>
          <span className="material-icons-round">{icons[type]}</span>
        </div>
        <div className="modal-body">
          <h3>{title}</h3>
          <p>{message}</p>
        </div>
        <div className="modal-footer">
          <button className={`btn btn-block ${type === 'error' ? 'btn-danger' : 'btn-primary'}`} onClick={onClose}>
            Continue
          </button>
        </div>
      </div>
    </div>
  );
};

export default Modal;
