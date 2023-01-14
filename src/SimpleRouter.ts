import { HttpResponse } from "./HttpResponse";
import { HttpRequest } from "./HttpRequest";

export enum HttpCodes {
    REDIRECT_PERMANENT = 301,
    REDIRECT_TEMPORARY = 302, // test
    SUCCESS = 200,
    ERROR = 500,
    NOT_FOUND = 404,
}

export type KeyValuePair = { [key: string]: string | undefined };

export type RoutableFn = (request: HttpRequest, response: HttpResponse, context: any) => Promise<void>;

export type Routable = RoutableClass | RoutableFn;

export type Middleware = BeforeMiddleware | AfterMiddleware | (BeforeMiddleware & AfterMiddleware);

export interface RoutableClass {
    route(request: HttpRequest, response: HttpResponse, context: any): Promise<void>;
}

export interface BeforeMiddleware {
    // Function to execute before route
    before(request: HttpRequest, response: HttpResponse, context: any): Promise<void>;
}

export interface AfterMiddleware {
    // Function to execute after route
    after(request: HttpRequest, response: HttpResponse, context: any): Promise<void>;
}

export class Router {
    private beforeMiddleware: BeforeMiddleware[] = [];
    private afterMiddleware: AfterMiddleware[] = [];

    addMiddleware(middleware: Middleware | Middleware[]): this {
        const middlewares = Array.isArray(middleware) ? middleware : [middleware];

        for (const middleware of middlewares) {
            if ("before" in middleware) {
                this.beforeMiddleware.push(middleware);
            }

            if ("after" in middleware) {
                this.afterMiddleware.push(middleware);
            }
        }

        return this;
    }

    async execute(route: Routable, event: any): Promise<HttpResponse> {
        const request = new HttpRequest(event);
        const response = new HttpResponse();
        // Plain ol object
        const context = {};

        // Make context available to responses
        response.context = context;

        // Class based or function based both accepted
        const routeFn = typeof route === "function" ? route : route.route;

        for (const middleware of this.beforeMiddleware) {
            await middleware.before(request, response, context);
        }

        await routeFn(request, response, context);

        for (const middleware of this.afterMiddleware) {
            await middleware.after(request, response, context);
        }

        return response;
    }
}
