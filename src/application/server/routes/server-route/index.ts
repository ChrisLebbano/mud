import { type HttpRequestHandler } from "../../types/http";
import { type IncomingMessage, type ServerResponse } from "node:http";

export class ServerRoute {

    private _handler: HttpRequestHandler;
    private _path: string;

    constructor(path: string, handler: HttpRequestHandler) {
        this._handler = handler;
        this._path = path;
    }

    public handle(request: IncomingMessage, response: ServerResponse): boolean {
        if (!this.matches(request)) {
            return false;
        }

        this._handler(request, response);
        return true;
    }

    public matches(request: IncomingMessage): boolean {
        const requestUrl = new URL(request.url ?? "", "http://localhost");
        return requestUrl.pathname === this._path;
    }

}
