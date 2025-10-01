import dotenv from "dotenv";
import app from "./app.js"
import connectdb from "./db/index.js";

dotenv.config({
    path: "./.env"
});


const port = process.env.PORT


connectdb() 
.then(() => {
    app.listen(port, () => {
        console.log(`I am listening to the port http://localhost:${port}`); 
        
    })
})
.catch((error) => {
    console.log("MangoDB connection Error");
    process.exit(1)
})
 