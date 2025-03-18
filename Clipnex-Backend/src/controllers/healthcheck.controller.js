
import {asyncHandler} from "../utils/asyncHandler.js"


const healthcheck = asyncHandler(async (req, res) => {
   

    return res
    .status(200)
    .json(200,"OK","Everything is fine")
})

export {
    healthcheck
    }
    