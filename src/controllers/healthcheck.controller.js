import {Apiresponse} from "../utils/api-response.js"
import { asyncHandler } from "../utils/aysnc-handler.js"

// const healthCheck = (req,res) => {
//     try {
//         res.status(200).json(
//             new Apiresponse(200,{message : "server is running"})
//         )

//     } catch (error) {
        
//     }
// }

const healthCheck = asyncHandler(async (req,res) => {
    res.status(200).json(
        new Apiresponse(200,{message : "Server is running"})
    )
})

export {healthCheck} 