import { createServer } from "node:http";
import { open } from "node:fs/promises";
const server = createServer((request, response) => {
    switch (request.url) {
        case "/":
            response.writeHead(200, { "Content-Type": "text/html; charset=utf-8" });
            // readFile("./lambda.html", { encoding: "utf-8" })
            //     .then(value => response.end(value), reason => { throw reason })
            open("lambda.html", "r")
                .then(value => value.createReadStream({ encoding: "utf-8" }).pipe(response));
            break;
        case "/app.mjs":
        case "/app.mts":
            response.writeHead(200, { "Content-Type": "text/javascript; charset=utf-8" });
            // readFile(`./${request.url}`, { encoding: "utf-8" })
            //     .then(value => response.end(value), reason => { throw reason })
            open(`.${request.url}`, "r")
                .then(value => value.createReadStream({ encoding: "utf-8" }).pipe(response));
            break;
        default:
            response.writeHead(404, { "Content-Type": "text/plain; charset=utf-8" });
            response.end("404: NOT FOUND");
    }
});
function logger(name) {
    return function (..._input) {
        console.log(name);
    };
}
function addListeners(...events) {
    for (let event of events) {
        server.addListener(event, logger(event));
    }
}
addListeners("checkContinue", "checkExpectation", "clientError", "close", "connect", "connection", "dropRequest", "error", "listening", "request", "upgrade");
server.listen(8000);
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibGFtYmRhLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsibGFtYmRhLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBLE9BQU8sRUFBRSxZQUFZLEVBQUUsTUFBTSxXQUFXLENBQUE7QUFDeEMsT0FBTyxFQUFFLElBQUksRUFBWSxNQUFNLGtCQUFrQixDQUFBO0FBRWpELE1BQU0sTUFBTSxHQUFHLFlBQVksQ0FBQyxDQUFDLE9BQU8sRUFBRSxRQUFRLEVBQUUsRUFBRTtJQUM5QyxRQUFRLE9BQU8sQ0FBQyxHQUFHLEVBQUUsQ0FBQztRQUNsQixLQUFLLEdBQUc7WUFDSixRQUFRLENBQUMsU0FBUyxDQUFDLEdBQUcsRUFBRSxFQUFFLGNBQWMsRUFBRSwwQkFBMEIsRUFBRSxDQUFDLENBQUE7WUFDdkUsbURBQW1EO1lBQ25ELHNFQUFzRTtZQUN0RSxJQUFJLENBQUMsYUFBYSxFQUFFLEdBQUcsQ0FBQztpQkFDbkIsSUFBSSxDQUFDLEtBQUssQ0FBQyxFQUFFLENBQUMsS0FBSyxDQUFDLGdCQUFnQixDQUFDLEVBQUUsUUFBUSxFQUFFLE9BQU8sRUFBRSxDQUFDLENBQUMsSUFBSSxDQUFDLFFBQVEsQ0FBQyxDQUFDLENBQUE7WUFFaEYsTUFBSztRQUNULEtBQUssVUFBVSxDQUFDO1FBQ2hCLEtBQUssVUFBVTtZQUNYLFFBQVEsQ0FBQyxTQUFTLENBQUMsR0FBRyxFQUFFLEVBQUUsY0FBYyxFQUFFLGdDQUFnQyxFQUFFLENBQUMsQ0FBQTtZQUM3RSxzREFBc0Q7WUFDdEQsc0VBQXNFO1lBQ3RFLElBQUksQ0FBQyxJQUFJLE9BQU8sQ0FBQyxHQUFHLEVBQUUsRUFBRSxHQUFHLENBQUM7aUJBQ3ZCLElBQUksQ0FBQyxLQUFLLENBQUMsRUFBRSxDQUFDLEtBQUssQ0FBQyxnQkFBZ0IsQ0FBQyxFQUFFLFFBQVEsRUFBRSxPQUFPLEVBQUUsQ0FBQyxDQUFDLElBQUksQ0FBQyxRQUFRLENBQUMsQ0FBQyxDQUFBO1lBQ2hGLE1BQUs7UUFDVDtZQUNJLFFBQVEsQ0FBQyxTQUFTLENBQUMsR0FBRyxFQUFFLEVBQUUsY0FBYyxFQUFFLDJCQUEyQixFQUFFLENBQUMsQ0FBQTtZQUN4RSxRQUFRLENBQUMsR0FBRyxDQUFDLGdCQUFnQixDQUFDLENBQUE7SUFDdEMsQ0FBQztBQUNMLENBQUMsQ0FBQyxDQUFBO0FBRUYsU0FBUyxNQUFNLENBQUMsSUFBWTtJQUN4QixPQUFPLFVBQVUsR0FBRyxNQUFnQjtRQUNoQyxPQUFPLENBQUMsR0FBRyxDQUFDLElBQUksQ0FBYyxDQUFBO0lBQ2xDLENBQUMsQ0FBQTtBQUNMLENBQUM7QUFFRCxTQUFTLFlBQVksQ0FBQyxHQUFHLE1BQWdCO0lBQ3JDLEtBQUssSUFBSSxLQUFLLElBQUksTUFBTSxFQUFFLENBQUM7UUFDdkIsTUFBTSxDQUFDLFdBQVcsQ0FBQyxLQUFLLEVBQUUsTUFBTSxDQUFDLEtBQUssQ0FBQyxDQUFDLENBQUE7SUFDNUMsQ0FBQztBQUNMLENBQUM7QUFFRCxZQUFZLENBQ1IsZUFBZSxFQUNmLGtCQUFrQixFQUNsQixhQUFhLEVBQ2IsT0FBTyxFQUNQLFNBQVMsRUFDVCxZQUFZLEVBQ1osYUFBYSxFQUNiLE9BQU8sRUFDUCxXQUFXLEVBQ1gsU0FBUyxFQUNULFNBQVMsQ0FDWixDQUFBO0FBRUQsTUFBTSxDQUFDLE1BQU0sQ0FBQyxJQUFJLENBQUMsQ0FBQSJ9