import { HttpCodes, KeyValuePair, Middleware } from "./SimpleRouter";

export class HttpResponse {
    public data: any = {};
    public headers: KeyValuePair = {};
    public statusCode: number;
    public context: any;

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
        this.quickResponse(HttpCodes.SUCCESS, data);
        return this;
    }

    public error(data?: any): this {
        this.quickResponse(HttpCodes.ERROR, data);
        return this;
    }

    public notFound(data?: any): this {
        this.quickResponse(HttpCodes.NOT_FOUND, data);
        return this;
    }

    public redirect(location: string, redirectType: HttpCodes): this {
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
