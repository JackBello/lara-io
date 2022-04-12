import { THandleResponse, THandleRequest, THandleError, TResponse, TRequest } from '../../@types/type/server.type.ts'

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

    protected _request: (request: TRequest) => TRequest = (request: TRequest): TRequest => {
        return request;
    }
    protected _response: (response: TResponse) => TResponse = (response: TResponse): TResponse => {
        return response;
    }

    public applyHandleResponse(handle: THandleResponse): void {
        this._handleResponse = handle;
    }

    public applyHandleRequest(handle: THandleRequest): void {
        this._handleRequest = handle;
    }

    public applyHandleError(handle: THandleError): void {
        this._handleError = handle;
    }

    public applyResponse(handle: (response: TResponse) => TResponse) {
        this._response = handle;
    }

    public applyRequest(handle: (request: TRequest) => TRequest) {
        this._request = handle;
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

    get getRequest() {
        return this._request;
    }
}