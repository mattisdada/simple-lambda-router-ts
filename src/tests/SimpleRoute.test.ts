import { AfterMiddleware, BeforeMiddleware, Router, Middleware } from "../SimpleRouter";
import { HttpRequest } from "../HttpRequest";
import { HttpResponse } from "../HttpResponse";

test("create middleware", async () => {
    //const router = new Router();
    class BeforeMiddlewareExample implements BeforeMiddleware {
        async before(request: HttpRequest, response: HttpResponse, context: any): Promise<void> {
            context.before = true;
        }
    }

    class AfterMiddlewareExample implements AfterMiddleware {
        async after(request: HttpRequest, response: HttpResponse, context: any): Promise<void> {
            context.after = true;
        }
    }

    class BothMiddlewareExample implements BeforeMiddleware, AfterMiddleware {
        async after(request: HttpRequest, response: HttpResponse, context: any): Promise<void> {
            context.afterBoth = true;
        }

        async before(request: HttpRequest, response: HttpResponse, context: any): Promise<void> {
            context.beforeBoth = true;
        }
    }

    const router = new Router();
    const middlewares = [new BeforeMiddlewareExample(), new AfterMiddlewareExample(), new BothMiddlewareExample()];
    router.addMiddleware(middlewares);
    const response = await router.execute(async (request, response, context: any) => {
        expect(context.before).toBe(true);
        expect(context.after).toBe(undefined);
        expect(context.afterBoth).toBe(undefined);
        expect(context.beforeBoth).toBe(true);
    }, {});

    expect(response.context.after).toBe(true);
    expect(response.context.afterBoth).toBe(true);
});
