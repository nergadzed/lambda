import { createServer } from "node:http"
import { open } from "node:fs/promises"

const server = createServer((request, response) => {
    switch (request.url) {
        case "/":
            response.writeHead(200, { "Content-Type": "text/html; charset=utf-8" })
            // readFile("./lambda.html", { encoding: "utf-8" })
            //     .then(value => response.end(value), reason => { throw reason })
            open("lambda.html", "r")
                .then(value => value.createReadStream({ encoding: "utf-8" }).pipe(response))

            break
        case "/app.mjs":
        case "/app.mts":
            response.writeHead(200, { "Content-Type": "text/javascript; charset=utf-8" })
            // readFile(`./${request.url}`, { encoding: "utf-8" })
            //     .then(value => response.end(value), reason => { throw reason })
            open(`.${request.url}`, "r")
                .then(value => value.createReadStream({ encoding: "utf-8" }).pipe(response))
            break
        case "/lambda.css":
            response.writeHead(200, { "Content-Type": "text/css; charset=utf-8" })
            open(`.${request.url}`, "r")
                .then(value => value.createReadStream({ encoding: "utf-8" }).pipe(response))
            break
        default:
            response.writeHead(404, { "Content-Type": "text/plain; charset=utf-8" })
            response.end("404: NOT FOUND")
    }
})

queueMicrotask(() => {
    console.log("Setting up a server...")
    server.listen(8000)
    console.log("Server is running on http://localhost:8000")
})

// debugger
