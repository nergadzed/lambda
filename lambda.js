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
        case "/lambda.css":
            response.writeHead(200, { "Content-Type": "text/css; charset=utf-8" });
            open(`.${request.url}`, "r")
                .then(value => value.createReadStream({ encoding: "utf-8" }).pipe(response));
            break;
        default:
            response.writeHead(404, { "Content-Type": "text/plain; charset=utf-8" });
            response.end("404: NOT FOUND");
    }
});
queueMicrotask(() => {
    console.log("Setting up a server...");
    server.listen(8000);
    console.log("Server is running on http://localhost:8000");
});
// debugger
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibGFtYmRhLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsibGFtYmRhLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBLE9BQU8sRUFBRSxZQUFZLEVBQUUsTUFBTSxXQUFXLENBQUE7QUFDeEMsT0FBTyxFQUFFLElBQUksRUFBRSxNQUFNLGtCQUFrQixDQUFBO0FBRXZDLE1BQU0sTUFBTSxHQUFHLFlBQVksQ0FBQyxDQUFDLE9BQU8sRUFBRSxRQUFRLEVBQUUsRUFBRTtJQUM5QyxRQUFRLE9BQU8sQ0FBQyxHQUFHLEVBQUUsQ0FBQztRQUNsQixLQUFLLEdBQUc7WUFDSixRQUFRLENBQUMsU0FBUyxDQUFDLEdBQUcsRUFBRSxFQUFFLGNBQWMsRUFBRSwwQkFBMEIsRUFBRSxDQUFDLENBQUE7WUFDdkUsbURBQW1EO1lBQ25ELHNFQUFzRTtZQUN0RSxJQUFJLENBQUMsYUFBYSxFQUFFLEdBQUcsQ0FBQztpQkFDbkIsSUFBSSxDQUFDLEtBQUssQ0FBQyxFQUFFLENBQUMsS0FBSyxDQUFDLGdCQUFnQixDQUFDLEVBQUUsUUFBUSxFQUFFLE9BQU8sRUFBRSxDQUFDLENBQUMsSUFBSSxDQUFDLFFBQVEsQ0FBQyxDQUFDLENBQUE7WUFFaEYsTUFBSztRQUNULEtBQUssVUFBVSxDQUFDO1FBQ2hCLEtBQUssVUFBVTtZQUNYLFFBQVEsQ0FBQyxTQUFTLENBQUMsR0FBRyxFQUFFLEVBQUUsY0FBYyxFQUFFLGdDQUFnQyxFQUFFLENBQUMsQ0FBQTtZQUM3RSxzREFBc0Q7WUFDdEQsc0VBQXNFO1lBQ3RFLElBQUksQ0FBQyxJQUFJLE9BQU8sQ0FBQyxHQUFHLEVBQUUsRUFBRSxHQUFHLENBQUM7aUJBQ3ZCLElBQUksQ0FBQyxLQUFLLENBQUMsRUFBRSxDQUFDLEtBQUssQ0FBQyxnQkFBZ0IsQ0FBQyxFQUFFLFFBQVEsRUFBRSxPQUFPLEVBQUUsQ0FBQyxDQUFDLElBQUksQ0FBQyxRQUFRLENBQUMsQ0FBQyxDQUFBO1lBQ2hGLE1BQUs7UUFDVCxLQUFLLGFBQWE7WUFDZCxRQUFRLENBQUMsU0FBUyxDQUFDLEdBQUcsRUFBRSxFQUFFLGNBQWMsRUFBRSx5QkFBeUIsRUFBRSxDQUFDLENBQUE7WUFDdEUsSUFBSSxDQUFDLElBQUksT0FBTyxDQUFDLEdBQUcsRUFBRSxFQUFFLEdBQUcsQ0FBQztpQkFDdkIsSUFBSSxDQUFDLEtBQUssQ0FBQyxFQUFFLENBQUMsS0FBSyxDQUFDLGdCQUFnQixDQUFDLEVBQUUsUUFBUSxFQUFFLE9BQU8sRUFBRSxDQUFDLENBQUMsSUFBSSxDQUFDLFFBQVEsQ0FBQyxDQUFDLENBQUE7WUFDaEYsTUFBSztRQUNUO1lBQ0ksUUFBUSxDQUFDLFNBQVMsQ0FBQyxHQUFHLEVBQUUsRUFBRSxjQUFjLEVBQUUsMkJBQTJCLEVBQUUsQ0FBQyxDQUFBO1lBQ3hFLFFBQVEsQ0FBQyxHQUFHLENBQUMsZ0JBQWdCLENBQUMsQ0FBQTtJQUN0QyxDQUFDO0FBQ0wsQ0FBQyxDQUFDLENBQUE7QUFFRixjQUFjLENBQUMsR0FBRyxFQUFFO0lBQ2hCLE9BQU8sQ0FBQyxHQUFHLENBQUMsd0JBQXdCLENBQUMsQ0FBQTtJQUNyQyxNQUFNLENBQUMsTUFBTSxDQUFDLElBQUksQ0FBQyxDQUFBO0lBQ25CLE9BQU8sQ0FBQyxHQUFHLENBQUMsNENBQTRDLENBQUMsQ0FBQTtBQUM3RCxDQUFDLENBQUMsQ0FBQTtBQUVGLFdBQVcifQ==