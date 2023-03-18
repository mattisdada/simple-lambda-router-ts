import { KeyValuePair } from "./SimpleRouter"; // test (still in PR, but remove)

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
