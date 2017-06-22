/**
 * Created by Johann on 08/06/2017.
 */

const mysql = require('promise-mysql');
const _ = require('lodash');

const WhereConnector = {
    "AND" : 1,
    "OR": 2
};

class WhereGenerator {
    constructor(dbPool, whereConnector) {
        this.dbPool = dbPool;
        this.firstItem = true;
        this.whereString = "";
        this.whereConnector = whereConnector;
    }

    insertClause(insertKey, insertValue){

        if(!insertValue) {
            return;
        }

        if(!this.firstItem) {
            this.whereString += " " + _.findKey(WhereConnector, (value) => value === this.whereConnector) + " ";
        } else {
            this.firstItem = false;
            this.whereString += " WHERE ";
        }

        this.whereString += this.dbPool.escapeId(insertKey) + " = " + this.dbPool.escape(insertValue);
    }

    toString() {
        return this.whereString;
    }
}


class DatabaseAdapter {



    constructor() {



        this.pool = mysql.createPool(Secrets.PoolConfiguration);
    }

    getUser(id, userName) {

        let queryPromise;
        if (id) {
            let sql = "SELECT * FROM users WHERE `id`=?";
            queryPromise = this.pool.query(sql, [id]);
        } else if (userName) {
            let sql = "SELECT * FROM users WHERE `name`=?";
            queryPromise = this.pool.query(sql, [userName]);
        } else {
            throw new Error('Invalid Arguments used.')
        }

        return queryPromise.then((result) => {
            return result;
        }).error((error) => {
            console.error(error);
            return null;
        })
    }

    createUser(userValues, teamValues) {

        return this.pool.query('INSERT INTO teams (displayName) VALUES (?)', [teamValues.displayName]).then((result) => {
            return this.pool.query('INSERT INTO users (name, mailAddress, passwordHash, passwordSalt, teamId) VALUES (?,?,?,?,?);', [userValues.name, userValues.mailAddress, userValues.passwordHash, userValues.passwordSalt, result.insertId]);
        });
    }

    getProjectData(teamId, projectId) {
        if (projectId) {
            return this.pool.query('SELECT p.id AS projectId, p.*, c.* FROM projects p LEFT JOIN customers c ON p.customerId = c.id WHERE p.teamId = ? AND p.id = ?', [teamId, projectId]);
        } else {
            return this.pool.query('SELECT p.id AS projectId, p.*, c.* FROM projects p LEFT JOIN customers c ON p.customerId = c.id WHERE p.teamId = ?', [teamId]);
        }
    }

    getCustomerData(teamId) {
        return this.pool.query('SELECT * FROM customers WHERE teamId =?', [teamId]);
    }

    createProject(projectData) {
        return this.pool.query('INSERT INTO projects (displayName, fixedPrice, teamId, customerId) VALUES (?,?,?,?)', [projectData.displayName, projectData.fixedPrice, projectData.teamId, projectData.customerId]);
    }

    addTaskToProject(projectData) {
        return this.pool.query('INSERT INTO projectSteps (projectId, annotationId, text, workHours, userId) VALUES (?,?,?,TIME(?),?)', [projectData.projectId, projectData.annotationId, projectData.text, projectData.workHours, projectData.userId])
    }

    getProjectDetailData(teamId, projectId, invoiceId) {

        let whereGenerator = new WhereGenerator(this.pool, WhereConnector.AND);
        whereGenerator.insertClause('invoiceId', invoiceId);
        whereGenerator.insertClause('projectId', projectId);

        console.log("detailData: " + whereGenerator.toString());

        return this.pool.query('SELECT p.id as projectStepId, p.*, u.* FROM projectSteps p LEFT JOIN users u ON p.userId = u.id ' + whereGenerator.toString());
    }

    createCustomer(customerData) {
        return this.pool.query('INSERT INTO customers (fiprstName, lastName, address, teamId) VALUES (?,?,?,?);', [customerData.firstName, customerData.lastName, customerData.address, customerData.teamId])
    }

    setInvoiceIdForProjectStep(projectStepId, invoiceId) {
        return this.pool.query('UPDATE projectSteps SET invoiceId = ? WHERE id = ?', [invoiceId, projectStepId]);
    }

    createInvoice(projectId) {
        return this.pool.query('INSERT INTO invoices (projectId, iban, bic, taxNumber, hourLoan) VALUES (?, "", "", "", "")', [projectId]);
    }

    getInvoiceData(teamId, invoiceId) {

        let whereGenerator = new WhereGenerator(this.pool, WhereConnector["AND"]);

        whereGenerator.insertClause("teamId", teamId);
        whereGenerator.insertClause("i.id", invoiceId);

        console.log(whereGenerator.toString());

        return this.pool.query('SELECT i.id AS invoiceId, p.id AS projectId, i.*, p.* FROM invoices i LEFT JOIN projects p ON i.projectId = p.id' + whereGenerator.toString());
    }

    getTeamData(teamId) {
        return this.pool.query('SELECT * FROM teams WHERE id = ?', [teamId]);
    }

    updateTeamData(teamId, updateData) {
        return this.pool.query('UPDATE teams SET iban=?, bic=?, addressBlock=?, hourLoan=?, taxNumber=? WHERE id = ?', [updateData.iban, updateData.bic, updateData.addressBlock, updateData.hourLoan, updateData.taxNumber, teamId]);
    }
}

module.exports = DatabaseAdapter;

