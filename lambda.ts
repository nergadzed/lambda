import { createServer } from "node:http"
import { open, readFile } from "node:fs/promises"

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
        default:
            response.writeHead(404, { "Content-Type": "text/plain; charset=utf-8" })
            response.end("404: NOT FOUND")
    }
})

function logger(name: string) {
    return function (..._input: string[]) {
        console.log(name, /* input */)
    }
}

function addListeners(...events: string[]) {
    for (let event of events) {
        server.addListener(event, logger(event))
    }
}

addListeners(
    "checkContinue",
    "checkExpectation",
    "clientError",
    "close",
    "connect",
    "connection",
    "dropRequest",
    "error",
    "listening",
    "request",
    "upgrade",
)

server.listen(8000)
