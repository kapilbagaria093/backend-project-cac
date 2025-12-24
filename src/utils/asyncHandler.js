// HERE, WE ARE MAKING A UTILITY SO THAT WE DONT HAVE TO WRITE THE ENTIRE "TRY-CATCH" CODE EVERYTIME WE NEED TO EXECUTE AN ASYNC FUNCTION. WE CALL IT AN ASYNC HANDLER. WHENEVER WE HAVE TO RUN AN ASYNC FUNCTION. WE WILL USE THE ASYNC HANDLER, WHICH IS BASICALLY JUST A FUNCTION THAT EXECUTES OUR ACYNC FUNCTION. IT INPUTS THE ASYNC FUNCTION (FN). AND IT EXECUTES THE SAME FUNCTION INSIDE THE TRY-CATCH BLOCK, OR, IN THE PROMISES.THEN.CATCH FORMAT. (ANY CAN BE USED). 
// SO, WHEN WE CALL AND EXECUTE THE ASYNCHANDLER, WE GIVE IT A FUNCTION AND IT EXECUTES IT INSIDE A TRY-CATCH BLOCK FOR US.
// IT IS A UTILITY BECAUSE IT HELPS US AVOID REPETITIVE CODE WRITING.

// WE WILL LOOK AT BOTH WAYS OF HOW AN ASYNC HANDLER CAN BE WRITTEN: 
// 1. USING .THEN .catch FORMAT AND PROMISES
// 2. USING TRY-CATCH BLOCK FORMAT.

// here the function is called, requestHandler
const asyncHandler = (requestHandler) => {

    // the parameters req, res, next are passed to the inner function from express when the function is executed as a middleware.
    (req, res, next) => {
        Promise.resolve(requestHandler(req, res, next))
        .catch((error) => next(error))
    }
};



export { asyncHandler };

// USING try-catch block to wrap async functions.
// higher order functions: functions passed as parameter into another function

// step by step of how we wrote the higher order function
// const asyncHandler = (func) => {}
// const asyncHandler = (func) => { () => {} }
// const asyncHandler = (func) => () => {}
// const asyncHandler = (func) => async () => {}


// const asyncHandler = (fn) => async (req, res, next) => {
//     try {
//         await fn(req, res, next)
//     } catch (error) {
//         res.status(err.code || 500).json({
//             success: false,
//             message: err.message
//         });
//     }
// }