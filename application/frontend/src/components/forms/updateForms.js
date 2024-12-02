import React, { useState, useEffect } from 'react';
import { InputGroup, Form, Button } from 'react-bootstrap';
import { useToast } from '../../utils/toast';

let url = '/api'

export const UpdateEmployee = ({ id, handleClose, handleRefresh, handleDelete }) => {
  const [firstname, setFirstName] = useState('');
  const [lastname, setLastName] = useState('');
  const [jobtitle, setJobTitle] = useState('');
  const [email, setEmail] = useState('');
  const [selectedDepartment, setSelectedDepartment] = useState('');
  const [departments, setDepartments] = useState([]); 
  const addToast = useToast();
  const token = localStorage.getItem('token')

  useEffect(() => {
    const fetchDepartments = async () => {
      try {
        const response = await fetch(`${url}/departments`);
        if (!response.ok) {
          const errorData = await response.text();
          throw new Error(errorData);
        }
        const data = await response.json();
        setDepartments(data);
      } catch (err) {
        addToast(err.message, 'error');
      }
    };

    fetchDepartments();
  }, []); 

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
        setFirstName(data.firstname);
        setLastName(data.lastname);
        setJobTitle(data.jobtitle);
        setEmail(data.email);
        setSelectedDepartment(data.departmentid);
      } catch (err) {
        addToast(err.message, 'error');
      }
    };

    if (id) { 
      fetchEmployee();
    }
  }, [id]); 

  const handleUpdate = async (event) => {
    event.preventDefault(); 

    const employeeData = {
      id,
      firstname,
      lastname,
      jobtitle,
      email,
      departmentid: selectedDepartment,
    };

    try {
      const response = await fetch(`${url}/personnel`, { 
        method: 'PUT', 
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(employeeData),
      });

      if (!response.ok) {
        const errorData = await response.text();
        throw new Error(errorData);
      }
      addToast(`${firstname} ${lastname} updated successfully!`);
      handleClose();
      handleRefresh()

    } catch (err) {
      addToast(err.message, 'error');
    }
  };

  return (
    <Form onSubmit={handleUpdate}>
      <h2>Update {firstname} {lastname}?</h2>
      <hr></hr>
      <InputGroup className="mb-3">
        <InputGroup.Text className="w-25">First Name</InputGroup.Text>
        <Form.Control 
          value={firstname}
          onChange={(e) => setFirstName(e.target.value)}
          aria-label="First Name"
          required
        />
      </InputGroup>
      <InputGroup className="mb-3">
        <InputGroup.Text className="w-25">Last Name</InputGroup.Text>
        <Form.Control 
          value={lastname}
          onChange={(e) => setLastName(e.target.value)}
          aria-label="Last Name"
          required
        />
      </InputGroup>
      <InputGroup className="mb-3">
        <InputGroup.Text className="w-25">Job Title</InputGroup.Text>
        <Form.Control 
          value={jobtitle}
          onChange={(e) => setJobTitle(e.target.value)}
          aria-label="Job Title"
        />
      </InputGroup>
      <InputGroup className="mb-3">
        <InputGroup.Text className="w-25">Email</InputGroup.Text>
        <Form.Control 
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          aria-label="Email"
          required
        />
      </InputGroup>
      <Form.Select 
        aria-label="Select Department"
        value={selectedDepartment}
        onChange={(e) => setSelectedDepartment(e.target.value)}
        required
      >
        <option value="">Select Department</option>
        {departments.map((department) => (
          <option key={department.id} value={department.id}>
            {department.name}
          </option>
        ))}
      </Form.Select>
      <hr></hr>
      <div className="d-flex justify-content-between">
        <div>
          <Button variant="primary" type="submit">
            Update
          </Button>
          <Button className="mx-2" variant="danger" onClick={(e) => {e.stopPropagation(); handleDelete('employee', id)}}>
            Delete
          </Button>
        </div>
        <Button variant="dark" onClick={handleClose}>
          Close
        </Button>
      </div>
    </Form>
  );
};

export const UpdateDepartment = ({id, handleClose, handleRefresh, handleDelete }) => {
  const [departmentName, setDepartmentName] = useState('');
  const [locationId, setLocationID] = useState('');
  const [locations, setLocations] = useState([]);
  const addToast = useToast();
  const token = localStorage.getItem('token')

  useEffect(() => {
    const fetchLocations = async () => {
      try {
        const response = await fetch(`${url}/locations`);
        if (!response.ok) {
          const errorData = await response.text();
          throw new Error(errorData);
        }
        const data = await response.json();
        setLocations(data); 
      } catch (err) {
        addToast(err.message, 'error');
      }
    };

    fetchLocations();
  }, []); 

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
        setDepartmentName(data.name);
        setLocationID(data.locationid);
      } catch (err) {
        addToast(err.message, 'error');
      }
    };

    if (id) { 
      fetchDepartment();
    }
  }, [id]);

  const handleUpdate = async (event) => {
    event.preventDefault();

    const departmentData = {
      id: id,
      name: departmentName,
      locationid: locationId, 
    };

    try {
      const response = await fetch(`${url}/departments`, {
        method: 'PUT', 
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(departmentData),
      });

      if (!response.ok) {
        const errorData = await response.text();
        throw new Error(errorData);
      }
      addToast(`${departmentName} updated successfully!`);
      handleClose();
      handleRefresh()

      } catch (err) {
      addToast(err.message, 'error');
      }
  };

  return (
    <Form onSubmit={handleUpdate}>
      <h2>Update {departmentName}?</h2>
      <hr></hr>
      <InputGroup className="mb-3">
        <InputGroup.Text >Department Name</InputGroup.Text>
        <Form.Control 
          value={departmentName}
          onChange={(e) => setDepartmentName(e.target.value)}
          aria-label="Department Name"
          required
        />
      </InputGroup>
      <Form.Select 
        aria-label="Select Location"
        value={locationId}
        onChange={(e) => setLocationID(e.target.value)}
        required
      >
        {locations.map((location) => (
          <option key={location.id} value={location.id}>
            {location.name}
          </option>
        ))}
      </Form.Select>
      <hr></hr>
      <div className="d-flex justify-content-between">
        <div>
          <Button variant="primary" type="submit">
            Update
          </Button>
          <Button className="mx-2" variant="danger" onClick={(e) => {e.stopPropagation(); handleDelete('department', id)}}>
            Delete
          </Button>
        </div>
        <Button variant="dark" onClick={handleClose}>
          Close
        </Button>
      </div>
    </Form>
  );
};

export const UpdateLocation = ({ id, handleClose, handleRefresh, handleDelete }) => {
  const [locationName, setLocationName] = useState('');
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
        setLocationName(data.name); 
      } catch (err) {
        addToast(err.message, 'error');
      }
    };

    fetchLocation();
  }, []);

  const handleUpdate = async (event) => {
    event.preventDefault();

    const locationData = {
      name: locationName, 
      id: id
    };

    try {
      const response = await fetch(`${url}/locations`, { 
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(locationData),
      });

      if (!response.ok) {
        const errorData = await response.text();
        throw new Error(errorData);
      }
      addToast(`${locationName} updated successfully!`);
      handleClose();
      handleRefresh()

      } catch (err) {
      addToast(err.message, 'error');
      }
  };

  return (
    <Form onSubmit={handleUpdate}>
      <h2>Update {locationName}?</h2>
      <hr></hr>
      <InputGroup className="mb-3">
        <InputGroup.Text>Location Name</InputGroup.Text>
        <Form.Control 
          value={locationName}
          onChange={(e) => setLocationName(e.target.value)}
          aria-label="Location Name"
          required
        />
      </InputGroup>
      <hr></hr>
      <div className="d-flex justify-content-between">
        <div>
          <Button  variant="primary" type="submit">
            Update
          </Button>
          <Button className="mx-2" variant="danger" onClick={(e) => {e.stopPropagation(); handleDelete('location', id)}}>
            Delete
          </Button>
        </div>
        <Button variant="dark" onClick={handleClose}>
          Close
        </Button>
      </div>
    </Form>
  );
};