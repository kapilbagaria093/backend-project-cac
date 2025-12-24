// INORDER TO STANDARDIZE THE ERRORS THAT MAY BE GENERATED ANYWHERE IN OUT PROGRAM. WE DEFINE AN ApiError CLASS. 
// NOTE THAT, NODEJS ALREADY HAS AN EXISTING Error CLASS AND ITS EASIER TO JUST EXTEND IT AND STRUCTURE IT THE WAY WE WANT. 
// SO WE OVERWRITE THE SPECIFIC FIELDS THAT ARE ALREADY PRESENT IN THE PARENT CLASS, OR CREATE NEW FIELDS AS PER OUR REQUIREMENT. 
// NOTE THAT, IF WE WANT, WE CAN ALSO CREATE, OUT OWN CLASS OF ERRORS AND USE THAT.
class ApiError extends Error {
    constructor(
        statusCode,
        message= "something went wrong",
        errors = [],
        stack = ""
    ){
        super(message),
        this.statusCode = statusCode,
        this.data = null,
        this.message = message,
        this.success = false,
        this.errors = errors

        if (stack) {
            this.stack = stack
        } else {
            Error.captureStackTrace(this, this.constructor);
        }
    }
}

// MUST EXPORT THE CLASS OTHERWISE WHY EVEN MAKE IT.
export { ApiError }

