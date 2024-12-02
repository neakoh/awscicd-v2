// components/FormModal.js
import React from 'react';
import { Modal, Button } from 'react-bootstrap';

const FormModal = ({ show, handleClose, activeForm }) => {
  const renderForm = () => {
    if (!activeForm) return null;
    const FormComponent = activeForm;
    return <FormComponent />;
  };

  return (
    <Modal show={show} onHide={handleClose}>
      <Modal.Body>{renderForm()}</Modal.Body>
    </Modal>
  );
};

export default FormModal;