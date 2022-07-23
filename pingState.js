const fetch = require("node-fetch")
const dotenv = require("dotenv")
dotenv.config()
let isExtracting = false
const pingState = async (isIdle) => {
    try {
        isExtracting = !isIdle
        const response = await fetch(`http://localhost:3002/ping?pid=${process.pid}&isIdle=${isIdle}`)
        if (response.ok) {
            console.log("Marked state successfully!")
        }
    } catch (err) {
        console.log("Error while marking state", err.message)
    }
}
module.exports = { pingState, isExtracting }