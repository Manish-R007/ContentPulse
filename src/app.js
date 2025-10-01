import express from "express"
import cors from "cors"
import cookieParser from "cookie-parser"

const app = express()

app.get("/" , (req,res) => {
    res.send("Welcome to the home page")
})

app.use(express.json({limit: "16kb"}))
app.use(express.urlencoded({extended : true,limit : "16kb"}))
app.use(express.static("public"))
app.use(cookieParser())

app.use(cors({
    origin : process.env.CORS_ORIGIN?.split(",") || "http://localhost:5173",
    credentials :true,
    methods : ["GET","POST","PUT","PATCH","DELETE","OPTIONS"],
    allowedHeaders : ["Content-Type","Authorization"]
}))

import healthcheckRouter from "./routes/healthcheck.routes.js"
import authRouter from "./routes/auth.routes.js"

app.use("/api/v1/healthcheck",healthcheckRouter)
app.use("/api/v1/auth",authRouter)

app.get("/manish" , (req,res) => {
    res.send("Hey I am Manish R")
})

import { ApiError } from "./utils/api-errors.js";


app.use((err, req, res, next) => {
  if (err instanceof ApiError) {
    return res.status(err.statusCode).json({
      success: err.success,
      message: err.message,
      errors: err.errors,
      data: err.data,
    });
  }

  return res.status(500).json({
    success: false,
    message: "Internal Server Error",
    error: err.message,
  });
});


export default app