class ApiResponse {
    constructor(statusCode, data, message = "success"){
        this.statusCode = statusCode,
        this.data = data,
        this.message = message,
        this.success = statusCode < 400
        // we are setting an errorcode standard that, 400 se neeche would be success and each type of response can have a different success code. and above 400, hum errorcode assume kr rhe hai and will deal as errors.
    }
}