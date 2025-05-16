import express from 'express';
import cors from 'cors';
import env from 'dotenv';
import {connectDB} from './config/db.js';
import userRouter from './routes/userRoute.js';
import taskRouter from './routes/taskRoute.js';

env.config();


const app = express();

// middlewares
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// database connection 
connectDB();

// Routes

app.use('/api/user', userRouter);
app.use('/api/tasks', taskRouter);

app.get('/',(req,res)=>{
    res.send("i am backend .")
});


const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`)
});