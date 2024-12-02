const { initializeDatabase } = require('../config/db');

class departmentService {
    async getAll() {
        const db = await initializeDatabase()
        console.log("DB Instance:", db); // Debugging lin
        const result = await db.query('SELECT * FROM department');
        return result.rows;
    }

    async getById(id) {
        const db = await initializeDatabase()
        const result = await db.query(
            'SELECT * FROM department WHERE id = \$1',
            [id]
        );
        return result.rows[0];
    }

    async create(name, locationid) {
        const db = await initializeDatabase()
        const result = await db.query(
            'INSERT INTO department (name, locationid) VALUES (\$1, \$2) RETURNING *',
            [name, locationid]
        );
        return result.rows[0];
    }

    async update(name, id, locationid) {
        const db = await initializeDatabase()
        const result = await db.query(
            'UPDATE department SET name = \$1, locationid = \$2 WHERE id = \$3 RETURNING *',
            [name, locationid, id]
        );
        return result.rows[0];
    }

    async delete(id) {
        const db = await initializeDatabase()
        const result = await db.query(
            'DELETE FROM department WHERE id = \$1 RETURNING *',
            [id]
        );
        return result.rows[0];
    }
}

module.exports = new departmentService();