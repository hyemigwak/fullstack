require('dotenv').config();
const { Pool } = require("pg");
const express = require('express');
const cors = require('cors');
const app = express();
const bodyParser = require('body-parser')

const server = require('http').createServer(app);

const pool = new Pool({
    user: process.env.user,
    host: process.env.host,
    database: process.env.database,
    password: process.env.password,
    port: process.env.port,
});

app.use(bodyParser.urlencoded({ extended: false }));
app.use(cors());
app.use(bodyParser.json());

app.get('/', (req,res) => {
    const sql = "SELECT * FROM memos";
    pool.query(sql, [], (err, result) => {
        if(err){
            return console.error(err.message);
        }
        console.log(result.rows);
        res.status(200).send(result.rows);
    })
});

app.get("/detail/:memoId", (req, res) => {
    const memoId = req.params.memoId;
    const sql = "SELECT * FROM memos WHERE memo_id = $1";
    pool.query(sql, [memoId], (err, result) => {
        if(err) {
            return console.error(err.message);
        }
        res.send({ memoData: result.rows[0]});
    })
});

app.post("/edit", (req, res) => {
    const memoDetail = [req.body.name, req.body.memo, req.body.memo_id];
    const sql = "UPDATE memos SET name = $1, memo = $2, updated_at = CURRENT_TIMESTAMP WHERE (memo_id = $3)";
    pool.query(sql, memoDetail, (err, result) => {
        if(err) {
            return console.error(err.message);
        }
        res.status(200).send("success");
    })

})

app.post("/upload", (req, res) => {
    const sql = "INSERT INTO memos (name, memo, created_at) VALUES ($1, $2, LOCALTIMESTAMP)";
    const oneMemo = [req.body.name, req.body.memo];
    pool.query(sql, oneMemo, (err, result) => {
        if(err) {
            return console.error(err.message);
        }
        res.status(200).send("success");
    })
});

app.delete("/delete", (req, res) => {
    const memo_id = req.body.memo_id;
    const sql = "DELETE FROM memos WHERE memo_id = $1";
    pool.query(sql, [memo_id], (err, result) => {
        if(err){
            console.error(err.message);
            res.status(400).send("fail");

        }
        res.status(200).send("success");
    })
})

const sql_create = `CREATE TABLE IF NOT EXISTS memos (
    Memo_ID SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    memo Text,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);`;


pool.query(sql_create, [], (err, result) => {
    if(err) {
        return console.log(err.message);
    }
    console.log("successful connection");
    server.listen(5000, ()=>{
        console.log('server is running on 5000')
    })
});





