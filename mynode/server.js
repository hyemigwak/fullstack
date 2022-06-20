require('dotenv').config();
const { Pool } = require("pg");
const express = require('express');
const cors = require('cors');
const app = express();
const bodyParser = require('body-parser');
const multer  = require('multer');
const bcrypt = require('bcrypt');

const server = require('http').createServer(app);

const pool = new Pool({
    user: process.env.user,
    host: process.env.host,
    database: process.env.database,
    password: process.env.password,
    port: process.env.port,
});

const upload = multer({
    dest: __dirname + '/uploads',
});

app.use('/uploads', express.static("uploads"));
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cors());
app.use(bodyParser.json());

app.post("/login", (req, res) => {
    const sql = "SELECT * FROM users WHERE email = $1";
    pool.query(sql, [req.body.email], async (err, result) => {
        if(err) {
            return console.error(err.message);
        }
        if(result.rows.length === 0) {
            res.json({ success: false, errorMessages: "id와 password가 일치하지 않습니다" });
        } else {
            const checkPassword = await bcrypt.compare(req.body.password, result.rows[0].password);
            if(checkPassword) {
                res.json({ success: true, email: req.body.email });
            } else {
                res.json({ success: false, errorMessages: "password가 일치하지 않습니다" })
            }

        }
    })
})

app.post("/signup", (req, res) => {
    const idCheckSql = "SELECT * FROM users WHERE email = $1"

    pool.query(idCheckSql, [req.body.email], async (err,result) => {
        if(err) {
            return console.error(err.message);
        }
        if(result.rows.length !== 0) {
            res.json({success: false, errorMessages: "이미 존재하는 email 입니다."});
        } else {
            //password를 해싱하고 저장한다.
            const hashed = await bcrypt.hash(req.body.password, 10);
            const hashedUserInfo = [req.body.email, hashed];
            const sql = "INSERT INTO users (email, password) VALUES ($1, $2)"
            pool.query(sql, hashedUserInfo, (err, result) => {
                if(err) {
                    return console.error(err.message);
                }
                res.json({success: true});
            })
        }
    });

});

app.post("/image", upload.single("file"), (req, res) => {
    let imageUrl = `http://localhost:5000/uploads/${req.file.filename}`;
    res.json({success: true, data: imageUrl});
})

app.get('/', (req,res) => {
    const sql = "SELECT * FROM memos";
    pool.query(sql, [], (err, result) => {
        if(err){
            return console.error(err.message);
        }
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

const sql_create_user = `CREATE TABLE IF NOT EXISTS users (
    user_ID SERIAL PRIMARY KEY,
    email VARCHAR(100) NOT NULL,
    password VARCHAR(60) NOT NULL
);`;


pool.query(sql_create, [], (err, result) => {
    if(err) {
        return console.log(err.message);
    }
    pool.query(sql_create_user, [], (err,result) => {
        if(err) {
            return console.log(err.message);
        }
    })
    console.log("successful connection");
    server.listen(5000, ()=>{
        console.log('server is running on 5000')
    })
});





