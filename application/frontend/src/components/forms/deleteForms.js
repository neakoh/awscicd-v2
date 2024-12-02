import React, { useState, useEffect } from 'react';
import { Button } from 'react-bootstrap';
import { useToast } from '../../utils/toast';

let url = '/api'
export const DeleteEmployee = ({ id, handleClose, handleRefresh}) => {
  const [employee, setEmployee] = useState(null);
  const addToast = useToast();
  const token = localStorage.getItem('token')

  useEffect(() => {
    const fetchEmployee = async () => {
      try {
        const response = await fetch(`${url}/personnel/id`, { 
          method: 'POST', 
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ id })
        });
        if (!response.ok) {
          const errorData = await response.text();
          throw new Error(errorData);
        }
        const data = await response.json();
        setEmployee(data);
      } catch (err) {
        addToast(err.message, 'error');
      }
    };

    if (id) {
      fetchEmployee();
    }
  }, [id]);

  const deleteEmployee = async () => {
    try {
      const response = await fetch(`${url}/personnel`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ id })
      });
      if (!response.ok) {
        const errorData = await response.text();
        throw new Error(errorData);
      }
      addToast(`${employee.firstname} ${employee.lastname} deleted successfully!`);
      handleClose();
      handleRefresh()

      } catch (err) {
      addToast(err.message, 'error');
      }
  };
  const message = employee ? `${employee.firstname} ${employee.lastname}` : "..."
  return (
    <div className="modal show" style={{ display: 'block', position: 'initial' }}>
      <h2>Delete Employee</h2>
      <hr></hr>
      <p className="p-2">Are you sure you want to delete <b>{message}</b> from Personnel?</p>
      <hr></hr>
      <div className="d-flex justify-content-between p-2">
        <Button variant="danger" onClick={deleteEmployee} disabled={!employee}>
          Delete
        </Button>
        <Button variant="dark" onClick={handleClose}>
          Close
        </Button>
      </div>
    </div>
  );
};

export const DeleteLocation = ({id, handleClose, handleRefresh}) => {
  const [location, setLocation] = useState(null); 
  const addToast = useToast();
  const token = localStorage.getItem('token')


  useEffect(() => {
    const fetchLocation = async () => {
      try {
        const response = await fetch(`${url}/locations/id`, { 
          method: 'POST', 
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ id })
        });
        if (!response.ok) {
          const errorData = await response.text();
          throw new Error(errorData);
        }
        const data = await response.json();
        setLocation(data);
      } catch (err) {
        addToast(err.message, 'error');
      }
    };

    if (id) {
      fetchLocation();
    }
  }, [id]); 

  const deleteLocation = async () => {
    try {
      
      const response = await fetch(`${url}/locations`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ id })
      });
      if (!response.ok) {
        const errorData = await response.text();
        throw new Error(errorData);
      }
      addToast(`${location.name} deleted from locations successfully!`);
      handleClose();
      handleRefresh()

      } catch (err) {
      addToast(err.message, 'error');
      }
  };
  
  const message = location ? location.name : "..."
  return (
    <div className="modal show" style={{ display: 'block', position: 'initial' }}>
      <h2>Delete Location</h2>
      <hr></hr>
      <p>Are you sure you want to delete <b>{message}</b> from Locations?</p>
      <hr></hr>
      <div className="d-flex justify-content-between p-3">
        <Button variant="danger" onClick={deleteLocation} disabled={!location}>
          Delete
        </Button>
        <Button variant="dark" onClick={handleClose}>
          Close
        </Button>
      </div>
    </div>
  );
};

export const DeleteDepartment = ({ id, handleClose, handleRefresh}) => {
  const [department, setDepartment] = useState(null); 
  const addToast = useToast();
  const token = localStorage.getItem('token')

  useEffect(() => {
    const fetchDepartment = async () => {
      try {
        const response = await fetch(`${url}/departments/id`, { 
          method: 'POST', 
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ id })
        });
        if (!response.ok) {
          const errorData = await response.text();
          throw new Error(errorData);
        }
        const data = await response.json();
        setDepartment(data);
      } catch (err) {
        addToast(err.message, 'error');
      }
    };

    if (id) { 
      fetchDepartment();
    }
  }, [id]); 

  const deleteDepartment = async () => {
    try {
      const response = await fetch(`${url}/departments`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ id })
      });

      if (!response.ok) {
        const errorData = await response.text();
        throw new Error(errorData);
      }
      addToast(`${department.name} deleted from departments successfully!`);
      handleClose();
      handleRefresh()

      } catch (err) {
      addToast(err.message, 'error');
      }
  };

  const message = department ? department.name : "..."
  return (
    <div className="modal show" style={{ display: 'block', position: 'initial' }}>
      <h2>Delete Department</h2>
      <hr></hr>
      <p>Are you sure you want to delete <b>{message}</b> from departments?</p>
      <hr></hr>
      <div className="d-flex justify-content-between p-3">
        <Button variant="danger" onClick={deleteDepartment} disabled={!department}>
          Delete
        </Button>
        <Button variant="dark" onClick={handleClose}>
          Close
        </Button>
      </div>
    </div>
  );
};