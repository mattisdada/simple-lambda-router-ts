import { HttpCodes, Router, KeyValuePair } from "../SimpleRouter";

test("router respond success", async () => {
    const router = new Router();
    const response = await router.execute(async (request, response, context: any) => {
        response.success({ success: true });
    }, {});

    expect(response.statusCode).toBe(HttpCodes.SUCCESS);
    expect(response.data).toStrictEqual({ success: true });
});

test("router respond error", async () => {
    const router = new Router();
    const response = await router.execute(async (request, response, context: any) => {
        response.error({ error: true });
    }, {});

    expect(response.statusCode).toBe(HttpCodes.ERROR);
    expect(response.data).toStrictEqual({ error: true });
});

test("router respond redirect", async () => {
    const router = new Router();
    const response = await router.execute(async (request, response, context: any) => {
        response.redirect("https://google.com", HttpCodes.REDIRECT_PERMANENT);
    }, {});

    expect(response.statusCode).toBe(HttpCodes.REDIRECT_PERMANENT);
    expect(response.data).toStrictEqual({});
});

test("router respond not found", async () => {
    const router = new Router();
    const response = await router.execute(async (request, response, context: any) => {
        response.notFound({});
    }, {});

    expect(response.statusCode).toBe(HttpCodes.NOT_FOUND);
    expect(response.data).toStrictEqual({});
});

test("router respond json", async () => {
    const router = new Router();
    const response = await router.execute(async (request, response, context: any) => {
        response.success({}).json();
    }, {});

    expect(response.statusCode).toBe(HttpCodes.SUCCESS);
    expect(response.data).toStrictEqual({});
});

test("router custom response code", async () => {
    const router = new Router();
    const response = await router.execute(async (request, response, context: any) => {
        response.setStatusCode(944).json();
    }, {});

    expect(response.statusCode).toBe(944);
    expect(response.data).toStrictEqual({});
});

test("router custom headers", async () => {
    const router = new Router();
    const response = await router.execute(async (request, response, context: any) => {
        response.addHeader({ "X-Auth-Bypass": "Bearer Fake" }).success({});
        response.addHeader([{ "X-Auth-Bypass2": "Bearer Fake" }]).success({});
    }, {});

    expect(response.data).toStrictEqual({});
    expect(response.headers).toStrictEqual({ "X-Auth-Bypass": "Bearer Fake", "X-Auth-Bypass2": "Bearer Fake" });
});
