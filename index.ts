import { AfterMiddleware, BeforeMiddleware, HttpRequest, HttpResponse, LambdaEventMiddleware, RoutableClass, Router } from "./SimpleRouter";

// Example Middlewares START
export class ExampleLoggingMiddleware implements BeforeMiddleware, AfterMiddleware {
    async before(request: HttpRequest, response: HttpResponse, context: any) {
        console.log(request, response, context);
    }

    async after(request: HttpRequest, response: HttpResponse, context: any) {
        console.log(request, response, context);
    }
}

export class ExampleAuthMiddleware implements BeforeMiddleware {
    async before(request: HttpRequest, response: HttpResponse, context: any) {
        // ... Pretend there is some auth checking here...
        context.user = {
            userId: 1,
            firstName: "Bob",
            lastName: "Jane",
        };
    }
}

// Example Middlewares END

export const responseToLambda = (response: HttpResponse) => {
    return {
        body: JSON.stringify(response.data),
        headers: response.headers,
        statusCode: response.statusCode,
    };
};

// Class Based START
class ExampleRoute implements RoutableClass {
    async route(request: HttpRequest, response: HttpResponse, context: any) {
        response
            .success({
                whichRoute: "example",
            })
            .json();
    }
}
module.exports.example = async (event: AWSLambda.APIGatewayProxyEventV2) => {
    const response = await new Router().addMiddleware(new LambdaEventMiddleware()).execute(new ExampleRoute(), event);
    return responseToLambda(response);
};
// Class Based END

// Function Based START
module.exports.example2 = async (event: AWSLambda.APIGatewayProxyEventV2) => {
    const response = await new Router().addMiddleware(new LambdaEventMiddleware()).execute(async (request, response) => {
        response
            .success({
                whichRoute: "example2",
            })
            .json();
    }, event);
    return responseToLambda(response);
};
// Function Based END

// Pre-setup Router Example START
const authApp = new Router().addMiddleware([new LambdaEventMiddleware(), new ExampleAuthMiddleware(), new ExampleLoggingMiddleware()]);

module.exports.example3 = async (event: AWSLambda.APIGatewayProxyEventV2) => {
    const response = await authApp.execute(async (request, response, context) => {
        response
            .success({
                whichRoute: "example3",
                user: context.user,
            })
            .json();
    }, event);
    return responseToLambda(response);
};

// Build up the response START
interface EmailFlowContext {
    activeUser: string;
    jwt: string;
    services: {};
    emailDocument: {};
}
module.exports.example4 = async (event: AWSLambda.APIGatewayProxyEventV2) => {
    const response = await authApp.execute(async (request, response, context: EmailFlowContext) => {
        response.data = {
            whichRoute: "example4",
        };

        const doSomeWork = () => {
            // Doing some great work
            return 5;
        };

        response.data.calcualtedId = doSomeWork();
        response.data.error = { message: "Some Error" };

        response.error();
    }, event);
    return responseToLambda(response);
};
// Build up the response END
