import express from 'express'
import { config } from 'dotenv'
import color from "@colors/colors"
import cors from 'cors'
import morgan from "morgan";
import path from 'path'
import { dbConnection } from './src/DB/connection.js';
import blogRouter from './src/modules/blogs/blog.routes.js';
import { globalResponse } from './src/utilities/errorHandeling.js';
import serviceRoutes from './src/modules/service/service.routes.js';

config({path: path.resolve('./src/config/.env')})
const app = express()
const port = process.env.PORT

app.use(cors());
app.use(morgan('dev'));
app.use(express.json());

dbConnection()


app.use('/blogs',blogRouter)
app.use('/service',serviceRoutes)

app.use(globalResponse)

app.get('/', (req, res) => res.send('Hello World!'))
app.listen(port, () => console.log(`Example app listening on port ${port}!`.rainbow.bold))