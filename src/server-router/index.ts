import { ServerRoute } from "../server-route";
import { type IncomingMessage, type ServerResponse } from "node:http";

export class ServerRouter {

    private _routes: ServerRoute[];

    constructor(serverRoutes: ServerRoute[]) {
        this._routes = serverRoutes;
    }

    public addRoute(route: ServerRoute): void {
        this._routes.push(route);
    }

    public handle(request: IncomingMessage, response: ServerResponse): void {
        for (const route of this._routes) {
            if (route.handle(request, response)) {
                return;
            }
        }

        response.statusCode = 404;
        response.setHeader("Content-Type", "text/plain");
        response.end("Not Found");
    }

}

