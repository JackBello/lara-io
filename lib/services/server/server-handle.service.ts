import { THandleResponse, THandleRequest, THandleError, TResponse } from '../../@types/type/server.type.ts'

import { Service } from '../services.ts'

export class ServerHandleService extends Service{
    protected _handleResponse: THandleResponse = (body: BodyInit, status?: number): TResponse => {
        return new Response(body, { status });
    }
    protected _handleRequest: THandleRequest = (): TResponse => {
        return this._handleResponse("");
    }
    protected _handleError: THandleError = (error: unknown): TResponse => {
        console.error(error);
        return this._handleResponse("Internal Server Error", 500);
    };

    public applyHandleResponse(handle: THandleResponse): void {
        this._handleResponse = handle;
    }

    public applyHandleRequest(handle: THandleRequest): void {
        this._handleRequest = handle;
    }

    public applyHandleError(handle: THandleError): void {
        this._handleError = handle;
    }

    get getHandleResponse() {
        return this._handleResponse;
    }

    get getHandleRequest() {
        return this._handleRequest;
    }

    get getHandleError() {
        return this._handleError;
    }
}