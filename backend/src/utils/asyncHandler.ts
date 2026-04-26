import { Request, Response, NextFunction, RequestHandler } from "express";

const asyncHandler = <
    P = Record<string, string>,
    ResBody = unknown,
    ReqBody = unknown,
    ReqQuery = unknown
>(
    fn: (
        req: Request<P, ResBody, ReqBody, ReqQuery>,
        res: Response<ResBody>,
        next: NextFunction
    ) => Promise<unknown>
): RequestHandler<P, ResBody, ReqBody, ReqQuery> => {
    return (req, res, next): void => {
        void fn(req, res, next).catch(next);
    };
};

export default asyncHandler;