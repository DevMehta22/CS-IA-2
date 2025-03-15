const express = require('express')
const helmet = require("helmet")
const cors = require('cors')
const Joi = require('joi'); 

const app = express()

app.use(express.json())
app.use(express.urlencoded({ extended: true }))
app.use(helmet())
app.use(cors({
    origin: '*',
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    allowedHeaders: ['Content-Type', 'Authorization']
}))

const userSchema = Joi.object({
    name: Joi.string().min(3).max(30).required(),
    email: Joi.string().email().required(),
});


app.get("/",(req,res)=>{
    res.send("Hello from web server");
})

app.post("/user", (req, res) => {
    const { error } = userSchema.validate(req.body);
    
    if (error) {
        return res.status(400).json({ error: error.details[0].message });
    }
    
    res.json({ message: "User data is valid!", data: req.body });
});

const port = 3000;

app.listen(port,(err)=>{
    if (err) throw err;
    console.log(`server is running at port:${port}`)
})