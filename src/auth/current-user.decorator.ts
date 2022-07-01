import { createParamDecorator, ExecutionContext } from "@nestjs/common";
import { ReadableStreamBYOBRequest } from "stream/web";


export const CurrentUser = createParamDecorator(
    (data: unknown, ctx: ExecutionContext) => {

        const request = ctx.switchToHttp().getRequest();

        return request.user ?? null; 
    }
);