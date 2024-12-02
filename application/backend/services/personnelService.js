const { initializeDatabase } = require('../config/db');

class PersonnelService {
    async getAll() {
        const db = await initializeDatabase()
        const result = await db.query('SELECT * FROM personnel');
        return result.rows;
    }

    async getAllWithDetails() {
        const db = await initializeDatabase()
        const result = await db.query(
            'SELECT p.id, p.lastName, p.firstName, p.jobTitle, p.email, d.name as department, l.name as location ' +
            'FROM personnel p ' +
            'LEFT JOIN department d ON (d.id = p.departmentID) ' +
            'LEFT JOIN location l ON (l.id = d.locationID) ' +
            'ORDER BY p.lastName, p.firstName, d.name, l.name'
        );
        return result.rows;
    }

    async getById(id) {
        const db = await initializeDatabase()
        const result = await db.query(
            'SELECT * FROM personnel WHERE id = \$1',
            [id]
        );
        return result.rows[0];
    }

    async create(firstname, lastname, jobtitle, email, departmentid) {
        const db = await initializeDatabase()
        const result = await db.query(
            'INSERT INTO personnel (firstName, lastName, jobTitle, email, departmentID) VALUES(\$1, \$2, \$3, \$4, \$5) RETURNING *',
            [firstname, lastname, jobtitle, email, departmentid]
        );
        return result.rows[0];
    }

    async update(id, firstname, lastname, jobtitle, email, departmentid) {
        const db = await initializeDatabase()
        const currentResult = await db.query(
            'SELECT firstname, lastname, jobtitle, email, departmentid FROM personnel WHERE id = \$1',
            [id]
        );

        if (currentResult.rows.length === 0) {
            throw new Error('Personnel not found');
        }

        const currentData = currentResult.rows[0];
        
        const newfirstname = firstname !== undefined ? firstname : currentData.firstname;
        const newlastname = lastname !== undefined ? lastname : currentData.lastname;
        const newjobtitle = jobtitle !== undefined ? jobtitle : currentData.jobtitle;
        const newemail = email !== undefined ? email : currentData.email;
        const newdepartmentid = departmentid !== undefined ? departmentid : currentData.departmentid;

        const result = await db.query(
            'UPDATE personnel SET firstname = \$1, lastname = \$2, jobtitle = \$3, email = \$4, departmentid = \$5 WHERE id = \$6 RETURNING *',
            [newfirstname, newlastname, newjobtitle, newemail, newdepartmentid, id]
        );
        return result.rows[0];
    }

    async delete(id) {
        const db = await initializeDatabase()
        const result = await db.query(
            'DELETE FROM personnel WHERE id = \$1 RETURNING *',
            [id]
        );
        return result.rows[0];
    }
}

module.exports = new PersonnelService();