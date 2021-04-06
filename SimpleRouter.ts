export enum RedirectType {
    PERMANENT = 301,
    TEMPORARY = 302,
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

export class HttpRequest {
    public body: string;
    public bodyObject: any;
    public queryParameters: KeyValuePair;
    public headers: KeyValuePair;
    public readonly rawEvent: any;

    constructor(event: any) {
        this.rawEvent = event;
    }
}

export class HttpResponse {
    public data: any = {};
    public headers: KeyValuePair = {};
    public statusCode: number;

    public addHeader(header: KeyValuePair | KeyValuePair[]): this {
        if (Array.isArray(header)) {
            this.headers = Object.assign(this.headers, ...header);
        } else {
            this.headers = Object.assign(this.headers, header);
        }
        return this;
    }

    public setStatusCode(statusCode: number): this {
        this.statusCode = statusCode;
        return this;
    }

    public success(data?: any): this {
        this.quickResponse(200, data);
        return this;
    }

    public error(data?: any): this {
        this.quickResponse(500, data);
        return this;
    }

    public notFound(data?: any): this {
        this.quickResponse(404, data);
        return this;
    }

    public redirect(location: string, redirectType: RedirectType): this {
        this.statusCode = redirectType;
        this.headers.Location = location;
        return this;
    }

    public json(): this {
        this.headers["Content-Type"] = "application/json";
        return this;
    }

    private quickResponse(statusCode: number, data?: any) {
        this.statusCode = statusCode;
        if (typeof data !== "undefined") {
            this.data = data;
        }
    }
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

export class LambdaEventMiddleware implements BeforeMiddleware, AfterMiddleware {
    async before(request: HttpRequest, response: HttpResponse, context: any) {
        const event: AWSLambda.APIGatewayProxyEventV2 = request.rawEvent;
        request.body = event.body || "";
        request.headers = event.headers;
        request.queryParameters = event.pathParameters || {};

        try {
            request.bodyObject = JSON.parse(event.body || "");
        } catch (e) {}
    }

    async after(request: HttpRequest, response: HttpResponse, context: any) {}
}
