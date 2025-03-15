const express = require('express')

const app = express()

app.use(express.json())

app.get("/",(req,res)=>{
    res.send("Hello from web server");
})

const port = 3000;

app.listen(port,(err)=>{
    if (err) throw err;
    console.log(`server is running at port:${port}`)
})