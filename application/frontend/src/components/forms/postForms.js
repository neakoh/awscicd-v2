import React, { useState, useEffect } from 'react';
import {InputGroup, Form, Button} from 'react-bootstrap';
import { useToast } from '../../utils/toast';

let url = '/api'
export const AddEmployee = ({handleClose, handleRefresh}) => {
  const [firstname, setFirstName] = useState('');
  const [lastname, setLastName] = useState('');
  const [jobtitle, setJobTitle] = useState('');
  const [email, setEmail] = useState('');
  const [departments, setDepartments] = useState([]);
  const [selectedDepartment, setSelectedDepartment] = useState('');
  const addToast = useToast(); 
  const token = localStorage.getItem('token')
  

  useEffect(() => {
    const fetchDepartments = async () => {
      try {
        const response = await fetch(`${url}/departments`);
        if (!response.ok) {
          throw new Error('Failed to fetch departments');
        }
        const data = await response.json();
        setDepartments(data); 
      } catch (err) {
        addToast(err.message, 'error');
      }
    };

    fetchDepartments();
  }, []); 

  const handleSubmit = async (event) => {
    event.preventDefault();

    const employeeData = {
      firstname,
      lastname,
      jobtitle,
      email,
      departmentid: selectedDepartment,
    };

    try {
      const response = await fetch(`${url}/personnel`, {
        method: 'POST',
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
    
      addToast(`${firstname} ${lastname} added to personnel successfully!`);
      handleClose();
      handleRefresh()
    } catch (err) {
      addToast(err.message, 'error');
    }
  };
  return (
    <Form onSubmit={handleSubmit}>
      <h2>Add Employee</h2>
      <hr></hr>
      <InputGroup className="mb-3">
        <InputGroup.Text className="w-25">First Name</InputGroup.Text>
        <Form.Control 
          aria-label="First Name"
          onChange={(e) => setFirstName(e.target.value)}
        />
      </InputGroup>
      <InputGroup className="mb-3">
        <InputGroup.Text className="w-25">Last Name</InputGroup.Text>
        <Form.Control 
          aria-label="Last Name"
          onChange={(e) => setLastName(e.target.value)}
        />
      </InputGroup>
      <InputGroup className="mb-3">
        <InputGroup.Text className="w-25">Job Title</InputGroup.Text>
        <Form.Control 
          aria-label="Job Title"
          onChange={(e) => setJobTitle(e.target.value)}
        />
      </InputGroup>
      <InputGroup className="mb-3">
        <InputGroup.Text className="w-25">Email</InputGroup.Text>
        <Form.Control 
          aria-label="Email"
          onChange={(e) => setEmail(e.target.value)}
        />
      </InputGroup>
      <Form.Select 
        aria-label="Select Location"
        value={selectedDepartment}
        onChange={(e) => setSelectedDepartment(e.target.value)}
        >
        {departments.map((department) => (
          <option key={department.id} value={department.id}>
            {department.name}
          </option>
        ))}
      </Form.Select>
      <hr></hr>
      <div className="d-flex justify-content-between">
        <Button variant="primary" type="submit">
          Submit
        </Button>
        <Button variant="dark" onClick={handleClose}>
          Close
        </Button>
      </div>
    </Form>
  );
};


export const AddDepartment = ({handleClose, handleRefresh}) => {
    const [department, setDepartment] = useState('');
    const [locationid, setLocationID] = useState('');
    const [locations, setLocations] = useState([]);
    const addToast = useToast();
    const token = localStorage.getItem('token')

    useEffect(() => {
      const fetchLocations = async () => {
        try {
          const response = await fetch(`${url}/locations`);
          if (!response.ok) {
            throw new Error('Failed to fetch locations');
          }
          const data = await response.json();
          setLocations(data); 
        } catch (err) {
          addToast(err.message, 'error');
        }
      };
  
      fetchLocations();
    }, []);

    const handleSubmit = async (event) => {
        event.preventDefault(); 
        const departmentData = {
            name: department,
            locationid: locationid
        };
        try {
        const response = await fetch(`${url}/departments`, {
            method: 'POST',
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
        addToast(`${department} added to departments successfully!`);
        handleClose();
        handleRefresh()

        } catch (err) {
        addToast(err.message, 'error');
        }
    };
    return (
        <Form onSubmit={handleSubmit}>
          <h2>Add Department</h2>
          <hr></hr>
          <InputGroup className="mb-3">
              <InputGroup.Text>Department Name</InputGroup.Text>
              <Form.Control 
              aria-label="Department Name"
              onChange={(e) => setDepartment(e.target.value)}
              />
          </InputGroup>
          <Form.Select 
              aria-label="Select Location"
              value={locationid}
              onChange={(e) => setLocationID(e.target.value)}
              >
              {locations.map((location) => (
              <option key={location.id} value={location.id}>
                  {location.name}
              </option>
              ))}
          </Form.Select>
          <hr></hr>
          <div className="d-flex justify-content-between">
            <Button variant="primary" type="submit">
              Submit
            </Button>
            <Button variant="dark" onClick={handleClose}>
              Close
            </Button>
          </div>
        </Form>
    )   
};

export const AddLocation = ({handleClose, handleRefresh}) => {
  const [location, setLocation] = useState('');
  const addToast = useToast(); 
  const token = localStorage.getItem('token')

  const handleSubmit = async (event) => {
      event.preventDefault(); 
      const locationData = {
          name: location,
      };
      try {
      const response = await fetch(`${url}/locations`, {
          method: 'POST',
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

      addToast(`${location} added to locations successfully!`); 
      handleClose();
      handleRefresh()

      setLocation('');
      } catch (err) {
      addToast(err.message, 'error');
      }
  };
  return(
      <Form onSubmit={handleSubmit}>
        <h2>Add Location</h2>
        <hr></hr>
        <InputGroup className="mb-3">
        <InputGroup.Text>Location Name</InputGroup.Text>
        <Form.Control 
            aria-label="Department Name"
            onChange={(e) => setLocation(e.target.value)}
        />
        </InputGroup>
        <hr></hr>
        <div className="d-flex justify-content-between">
          <Button variant="primary" type="submit">
            Submit
          </Button>
          <Button variant="dark" onClick={handleClose}>
            Close
          </Button>
        </div>
      </Form>
  )
};