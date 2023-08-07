import constants from '../Constants.mjs'
const errorHandling = (err, req, res, next) =>{
    const errorstatus = res.errorstatus ? res.errorstatus : 500
    switch(errorstatus){
        case constants.NOT_FOUND:
        res.json({message: "404 Not found"})
        break;
        case constants.FORBIDDEN:
        res.json({message:"403 Forbidded"})
        break;
        case constants.UNAUTHORIZED:
        res.json({message:"401 UnAuthorized"})
        break;
        case constants.SERVER_ERROR:
        res.json({message:"500 Server error"})
        break;
        case constants.VALIDATION_ERROR:
        res.json({message:"400 Validation error"})
        default:
        console.log("All Good! No error found")
    }
}

export default errorHandling;