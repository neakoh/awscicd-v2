import React, { useState, useEffect } from 'react';
import FormModal from './utils/formModal.js';
import {AddEmployee, AddLocation, AddDepartment} from './components/forms/postForms.js'
import {DeleteEmployee, DeleteLocation, DeleteDepartment} from './components/forms/deleteForms.js';
import {UpdateEmployee, UpdateDepartment, UpdateLocation} from './components/forms/updateForms.js';
import {PersonnelTable, DepartmentTable, LocationTable} from './components/tables.js';
import {Form, InputGroup, Container, Row, Col, Button} from 'react-bootstrap';
import './styles/App.css'

let url = '/api'
const Table = ({onLogout}) => {
  const [activeTab, setActiveTab] = useState('personnel');
  const [personnel, setPersonnel] = useState([]);
  const [locations, setLocations] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [error, setError] = useState('');
  const user = localStorage.getItem('username')

  useEffect(() => {
    if (activeTab === 'personnel') {
      fetchPersonnel();
    } else if (activeTab === 'locations') {
      fetchLocations();
    } else if (activeTab === 'departments') {
      fetchDepartments();
    }
  }, [activeTab]);

  const fetchPersonnel = async () => {
    try {
      const response = await fetch(`${url}/personnel/all`);
      if (!response.ok) {
        throw new Error('Failed to fetch personnel');
      }
      const data = await response.json();
      setPersonnel(data);
      setError('');
    } catch (err) {
      setError(err.message);
      setPersonnel([]);
    }
  };

  const fetchLocations = async () => {
    try {
      const response = await fetch(`${url}/locations`);
      if (!response.ok) {
        throw new Error('Failed to fetch locations');
      }
      const data = await response.json();
      setLocations(data);
      setError('');
    } catch (err) {
      setError(err.message);
      setLocations([]);
    }
  };

  const fetchDepartments = async () => {
    try {
      const response = await fetch(`${url}/departments`);
      if (!response.ok) {
        throw new Error('Failed to fetch departments');
      }
      const data = await response.json();
      setDepartments(data);
      setError('');
    } catch (err) {
      setError(err.message);
      setDepartments([]);
    }
  };


  const handleDelete = async (subject, id) => {  
    switch (subject) {
      case 'employee':
        setActiveForm(() => (props) => <DeleteEmployee subject="Employee" id={id} handleClose={handleClose} handleRefresh={handleRefresh} {...props} />);
        break;
      case 'location':
        setActiveForm(() => (props) => <DeleteLocation subject="Location" id={id} handleClose={handleClose} handleRefresh={handleRefresh} {...props} />);
        break;
      case 'department':
        setActiveForm(() => (props) => <DeleteDepartment subject="Department" id={id} handleClose={handleClose} handleRefresh={handleRefresh} {...props} />);
        break;
      default:
        setActiveForm(null);
    }
    handleShow();
  };

  const handleUpdate = async (subject, id) => {  
    switch (subject) {
      case 'employee':
        setActiveForm(() => (props) => <UpdateEmployee subject="Employee" id={id} handleClose={handleClose} handleRefresh={handleRefresh} handleDelete={handleDelete} {...props} />);
        break;
      case 'location':
        setActiveForm(() => (props) => <UpdateLocation subject="Location" id={id} handleClose={handleClose} handleRefresh={handleRefresh} handleDelete={handleDelete} {...props} />);
        break;
      case 'department':
        setActiveForm(() => (props) => <UpdateDepartment subject="Department" id={id} handleClose={handleClose} handleRefresh={handleRefresh} handleDelete={handleDelete} {...props} />);
        break;
      default:
        setActiveForm(null);
    }
    handleShow();
  };

  // Search tables
  const searchTable = (searchTerm) => {
    let dataToSearch;
    switch (activeTab) {
      case 'personnel':
        dataToSearch = personnel;
        break;
      case 'locations':
        dataToSearch = locations;
        break;
      case 'departments':
        dataToSearch = departments;
        break;
      default:
        dataToSearch = [];
    }
  
    if (!searchTerm) {
      return dataToSearch; // Return all data if search term is empty
    }
  
    return dataToSearch.filter(item => 
      Object.values(item).some(value => 
        String(value).toLowerCase().includes(searchTerm.toLowerCase())
      )
    );
  };
  const [filteredData, setFilteredData] = useState([]);
  const handleSearchChange = (event) => {
    const searchTerm = event.target.value;
    const filtered = searchTable(searchTerm);
    setFilteredData(filtered);
  };

  useEffect(() => {
    setFilteredData([]);
  }, [activeTab]);

  const renderTable = () => {
    const dataToRender = filteredData.length > 0 ? filteredData : 
    (activeTab === 'personnel' ? personnel : 
     activeTab === 'locations' ? locations : departments);
    if (activeTab === 'personnel') {
      return (
        <PersonnelTable personnel={dataToRender} handleUpdate={handleUpdate} handleDelete={handleDelete}/>
      );
    } else if (activeTab === 'locations') {
      return (
        <LocationTable locations={dataToRender} handleUpdate={handleUpdate} handleDelete={handleDelete}/>
      );
    } else if (activeTab === 'departments') {
      return (
        <DepartmentTable departments={dataToRender} handleUpdate={handleUpdate} handleDelete={handleDelete}/>
      );
    }
  };

  const [show, setShow] = useState(false);
  const [activeForm, setActiveForm] = useState(null);
  const handleClose = () => setShow(false);
  const handleShow = () => setShow(true);
  const handleRefresh = () => {
    setPersonnel([]);
    setDepartments([]);
    setLocations([]);
    fetchPersonnel();
    fetchLocations();
    fetchDepartments();
    setFilteredData([]);
  }
  

  const handleSelect = async (formType) => {  
    switch (formType) {
      case 'employee':
        // Fetch locations when the employee form is selected
        await fetchDepartments(); // Fetch locations
        setActiveForm(() => (props) => <AddEmployee handleClose={handleClose} handleRefresh={handleRefresh} {...props} />);
        break;
      case 'location':
        setActiveForm(() => (props) => <AddLocation handleClose={handleClose} handleRefresh={handleRefresh} {...props} />);
        break;
      case 'department':
        fetchLocations();
        setActiveForm(() => (props) => <AddDepartment handleClose={handleClose} handleRefresh={handleRefresh} {...props} />);
        break;
      default:
        setActiveForm(null);
    }
    handleShow();
  };

  return (
      <Container>
        <Row>
          <Col>
            <div className="d-flex space-x-4 mb-4 rounded bg-dark shadow-lg p-2">
              <button 
                onClick={() => setActiveTab('personnel')}
                className={`btn ${activeTab === 'personnel' ? 'btn-light' : 'btn-dark'} mx-1`}
              >
                Personnel
              </button>
              <button 
                onClick={() => setActiveTab('locations')}
                className={`btn ${activeTab === 'locations' ? 'btn-light' : 'btn-dark'} mx-1`}
              >
                Locations
              </button>
              <button 
                onClick={() => setActiveTab('departments')}   
                className={`btn ${activeTab === 'departments' ? 'btn-light' : 'btn-dark'} mx-1`}
              >
                Departments
              </button>
              <InputGroup variant="outline-primary">
                <Form.Control
                  placeholder="Search..."
                  onChange={handleSearchChange}
                />
              </InputGroup>
              <div className="dropdown">
                <button className="btn btn-dark dropdown-toggle mx-1" type="button" data-bs-toggle="dropdown" aria-expanded="false">
                  Add Entry
                </button>
                <ul className="dropdown-menu bg-primary">
                  <li><a onClick={() => handleSelect('department')} className="dropdown-item text-light" href="#">Department</a></li>
                  <li><a onClick={() => handleSelect('location')} className="dropdown-item text-light" href="#">Location</a></li>
                  <li><a onClick={() => handleSelect('employee')} className="dropdown-item text-light" href="#">Employee</a></li>
                </ul>
              </div>
            </div>
            <FormModal show={show} handleClose={handleClose} activeForm={activeForm} />

            <div className="table-container flex-grow-1 overflow-auto" style={{height:'80vh', overflowY: 'auto'}}>
              {renderTable()}
            </div>
          </Col>
          <Col lg={2} className="rounded d-flex flex-column justify-content-between bg-dark text-light py-3">
            <Row>
              <Container className="rounded space-x-4 shadow-lg" style={{height:"50vh"}}>
                <h6>Welcome, {user}.</h6>
                <hr></hr>
                <Container className = "d-flex flex-column h-100">
                  <Button variant = "dark" className = "my-2">
                    Userbase
                  </Button>
                  <Button variant = "dark" className = "my-2">
                    Posts
                  </Button>
                  <Button variant = "dark" className = "my-2">
                    Button
                  </Button>
                  <Button variant = "dark" className = "my-2">
                    Button
                  </Button>
                </Container> 
              </Container>
            </Row>
            <button onClick={onLogout} className="btn btn-danger mx-1" type="button" aria-expanded="false">
                Logout
            </button>
          </Col>
        </Row>
      </Container>
  );
};

export default Table;