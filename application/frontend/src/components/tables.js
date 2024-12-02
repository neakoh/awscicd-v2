import {Table} from 'react-bootstrap';
import React from 'react'

export const PersonnelTable = ({personnel, handleUpdate}) => {
    return (
    <Table hover>
        <thead className="table-dark">
        <tr>
            <th>Name</th>
            <th>Email</th>
            <th>Department</th>
            <th></th>
        </tr>
        </thead>
        <tbody>
        {personnel.map((person) => (
            <tr 
                onClick={() => handleUpdate('employee', person.id)} key={person.id}
            >
            <td>{person.firstname + ' ' + person.lastname}</td>
            <td>{person.email}</td>
            <td>{person.department}</td>
            </tr>
        ))}
        </tbody>
    </Table>
    );
}
export const LocationTable = ({locations, handleUpdate}) => {
    return (
    <Table hover>
        <thead className="table-dark">
        <tr>
            <th>Location</th>
            <th></th>
        </tr>
        </thead>
        <tbody>
        {locations.map((location) => (
            <tr 
                onClick={() => handleUpdate('location', location.id)} key={location.id}
            >
            <td colSpan={10}>{location.name}</td>
            </tr>
        ))}
        </tbody>
    </Table>
    );
}
export const DepartmentTable = ({departments, handleUpdate}) => {
    return (
    <Table hover>
        <thead className="table-dark">
        <tr>
            <th>Department</th>
            <th>Location</th>
            <th></th>
        </tr>
        </thead>
        <tbody>
        {departments.map((department) => (
            <tr 
                onClick={() => handleUpdate('department', department.id)} key={department.id}
            >
            <td>{department.name}</td>
            <td>{department.location}</td>
            </tr>
        ))}
        </tbody>
    </Table>
    );
}
