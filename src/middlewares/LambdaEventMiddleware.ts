import { HttpRequest } from "../HttpRequest";
import { HttpResponse } from "../HttpResponse";
import { BeforeMiddleware } from "../SimpleRouter";

export class LambdaEventMiddleware implements BeforeMiddleware {
    async before(request: HttpRequest, response: HttpResponse, context: any) {
        const event: AWSLambda.APIGatewayProxyEventV2 = request.rawEvent;
        request.body = event.body || "";
        request.headers = event.headers;
        request.queryParameters = event.pathParameters || {};

        try {
            request.bodyObject = JSON.parse(event.body || "");
        } catch (e) {} // test
    }
}
