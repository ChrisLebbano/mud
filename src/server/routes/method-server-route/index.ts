import { ServerRoute } from "../server-route";
import { type HttpRequestHandler } from "../types/http";
import { type IncomingMessage } from "node:http";

export class MethodServerRoute extends ServerRoute {

    private _method: string;

    constructor(path: string, method: string, handler: HttpRequestHandler) {
        super(path, handler);
        this._method = method;
    }

    public matches(request: IncomingMessage): boolean {
        if (request.method !== this._method) {
            return false;
        }

        return super.matches(request);
    }

}
