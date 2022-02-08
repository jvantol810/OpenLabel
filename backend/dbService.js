const mysql = require('mysql');
const dotenv = require('dotenv');
let instance = null;
dotenv.config();

const connection = mysql.createConnection({
    host: process.env.HOST,
    user: process.env.USER,
    password: process.env.PASSWORD,
    database: process.env.DATABASE,
    port: process.env.DB_PORT
})

connection.connect((err) => {
    if(err){
        console.log(err.message);
    }
    console.log('Connected!');
})

class DbService {
     /**
     * @name getDbServiceInstance
     * @description Returns an instance of DbService, which can be used to access the database via specific methods.
     * @returns {object} Returns an instance of DbService.
     */
    static getDbServiceInstance() {
        return instance ? instance : new DbService();
    }

    /**
     * @name getAllData
     * @description Returns all data that can be found inside the database.
     * @returns {array<object>} Returns an array of rows which contain the label info.
     */
    async getAllData() {
        try {
            const response = await new Promise((resolve, reject) => {
                let sqlStatement = "SELECT * FROM ??";
                let sqlInserts = ['testDB'];
                const query = sql.format(sqlStatement, sqlInserts);
                //const query = "SELECT * FROM testdb;";
                connection.query(query, (err, results) => {
                    if(err) reject(new Error(err.message));
                    resolve(results);
                })
            });
            
            return response;
        } catch(error) {
            console.log(error);
        }
    }

    
    /**
     * @name isLabelInDb
     * @description Returns true/false depending on if label can be found in db based on its url.
     * @param {string} url The url to the article.
     * @returns {boolean} Returns a boolean telling if the label exists in the db.
     */
    async isLabelInDb(url) {
        let sqlStatement = "SELECT COUNT(url) AS NumberFound, url FROM ?? WHERE url = ?";
        let sqlInserts = ['testDB', url];
        const query = sql.format(sqlStatement, sqlInserts);
        //`SELECT COUNT(url) AS NumberFound, url FROM testDB WHERE url = '${url}'`
        await connection.query(query, (err, rows, fields) => {
            if(!!err){
                console.log('Error in query attempt');
                console.log(err);
            } else {
                console.log("Found " + rows[0].NumberFound + " rows in database matching url.");
                if(rows[0].NumberFound < 1)
                {
                    return false;
                }
                else
                {
                    return true;
                }
            }
        })
    }

    /**
     * @name getLabel
     * @description Checks to see if information is stored in the database, and returns a JSON object containing the raw data if it finds it.
     * @param {string} url The url to the article.
     * 
     * @returns {object} Returns a response object containing success and labelJSON.
     */
    async getLabel(url) {
        //In case the url is undefined, return.
        if(url == undefined){
            return;
        }
        return new Promise((resolve, reject) => {
            let sqlStatement = "SELECT * FROM ?? WHERE url = ?";
            let sqlInserts = ['testDB', url];
            const query = sql.format(sqlStatement, sqlInserts);
            //Select all rows from the database where the url matches.
            //let query = `SELECT * FROM testdb WHERE url = "${url}"`;
            connection.query(query, (error, rows, fields) => {
                //If there was an error while querying, reject the promise and log the info.
                if(!!error){ 
                    console.log("Error while querying.");
                    return reject(error);
                }
                else {
                    //If at least one row was found, log the info and then return a response obj containing success state of true and labelJSON.
                    if(rows.length > 0){
                        console.log("Found " + rows.length + " rows in database matching url.");
                        console.log("Found url: " + rows[0].url)
                        const labelJSON = {
                            url: rows[0].url,
                            sentiment_score: rows[0].sentiment_score
                        }
                        const response = {
                            success: true,
                            labelJSON: labelJSON
                        }
                        return resolve(response);
                    }
                    //If no rows were found, return a response object containing a success state of false.
                    else{
                        const response = {
                            success: false,
                        }
                        return resolve(response)
                    }   
                }
            })
        })
    }

    /**
     * @name postData
     * @description Post a label to the database.
     * @param {string} url The url to the article.
     * @param {object} label The JSON object storing the label data.
     * @returns {object} Returns a response object describing the query's success.
     */
    async postData(url, label) {
        console.log("This is the url: ");
        try {
            const response = await new Promise((resolve, reject) => {
                let sqlStatement = "INSERT INTO ??(url, sentiment_score) VALUES (?, ?)";
                let sqlInserts = ['testDB', url, label.sentiment_score];
                const query = mysql.format(sqlStatement, sqlInserts);
                //const query = `INSERT INTO testDB(url, sentiment_score) VALUES ('${url}','${label.sentiment_score}')`;
                connection.query(query, (err, results) => {
                    if(err) reject(new Error(err.message));
                    resolve(results);
                })
            });
            return response;
        } catch(error) {
            console.log(error);
        }
    }
}

module.exports = DbService;