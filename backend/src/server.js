import express from 'express'
import "dotenv/config"
import authRoutes from './routes/auth.route.js'
import { connectDB } from './lib/db.js'

const app = express()

app.use(express.json());


app.get('/',(req,res)=>{
    res.send("Hello from SERVER")
})


app.use('/api/auth',authRoutes)

 
app.listen(process.env.PORT,()=>{
    console.log('Sever is listening at http://localhost:3000')
    connectDB()
})