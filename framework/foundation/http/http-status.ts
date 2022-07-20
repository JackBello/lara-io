export enum StatusCode {
    /** RFC 7231, 6.2.1 */
    Continue = 100,
    /** RFC 7231, 6.2.2 */
    SwitchingProtocols = 101,
    /** RFC 2518, 10.1 */
    Processing = 102,
    /** RFC 8297 **/
    EarlyHints = 103,
    /** RFC 7231, 6.3.1 */
    OK = 200,
    /** RFC 7231, 6.3.2 */
    Created = 201,
    /** RFC 7231, 6.3.3 */
    Accepted = 202,
    /** RFC 7231, 6.3.4 */
    NonAuthoritativeInfo = 203,
    /** RFC 7231, 6.3.5 */
    NoContent = 204,
    /** RFC 7231, 6.3.6 */
    ResetContent = 205,
    /** RFC 7233, 4.1 */
    PartialContent = 206,
    /** RFC 4918, 11.1 */
    MultiStatus = 207,
    /** RFC 5842, 7.1 */
    AlreadyReported = 208,
    /** RFC 3229, 10.4.1 */
    IMUsed = 226,

    /** RFC 7231, 6.4.1 */
    MultipleChoices = 300,
    /** RFC 7231, 6.4.2 */
    MovedPermanently = 301,
    /** RFC 7231, 6.4.3 */
    Found = 302,
    /** RFC 7231, 6.4.4 */
    SeeOther = 303,
    /** RFC 7232, 4.1 */
    NotModified = 304,
    /** RFC 7231, 6.4.5 */
    UseProxy = 305,
    /** RFC 7231, 6.4.7 */
    TemporaryRedirect = 307,
    /** RFC 7538, 3 */
    PermanentRedirect = 308,

    /** RFC 7231, 6.5.1 */
    BadRequest = 400,
    /** RFC 7235, 3.1 */
    Unauthorized = 401,
    /** RFC 7231, 6.5.2 */
    PaymentRequired = 402,
    /** RFC 7231, 6.5.3 */
    Forbidden = 403,
    /** RFC 7231, 6.5.4 */
    NotFound = 404,
    /** RFC 7231, 6.5.5 */
    MethodNotAllowed = 405,
    /** RFC 7231, 6.5.6 */
    NotAcceptable = 406,
    /** RFC 7235, 3.2 */
    ProxyAuthRequired = 407,
    /** RFC 7231, 6.5.7 */
    RequestTimeout = 408,
    /** RFC 7231, 6.5.8 */
    Conflict = 409,
    /** RFC 7231, 6.5.9 */
    Gone = 410,
    /** RFC 7231, 6.5.10 */
    LengthRequired = 411,
    /** RFC 7232, 4.2 */
    PreconditionFailed = 412,
    /** RFC 7231, 6.5.11 */
    RequestEntityTooLarge = 413,
    /** RFC 7231, 6.5.12 */
    RequestURITooLong = 414,
    /** RFC 7231, 6.5.13 */
    UnsupportedMediaType = 415,
    /** RFC 7233, 4.4 */
    RequestedRangeNotSatisfiable = 416,
    /** RFC 7231, 6.5.14 */
    ExpectationFailed = 417,
    /** RFC 7168, 2.3.3 */
    Teapot = 418,
    /** RFC 7540, 9.1.2 */
    MisdirectedRequest = 421,
    /** RFC 4918, 11.2 */
    UnprocessableEntity = 422,
    /** RFC 4918, 11.3 */
    Locked = 423,
    /** RFC 4918, 11.4 */
    FailedDependency = 424,
    /** RFC 8470, 5.2 */
    TooEarly = 425,
    /** RFC 7231, 6.5.15 */
    UpgradeRequired = 426,
    /** RFC 6585, 3 */
    PreconditionRequired = 428,
    /** RFC 6585, 4 */
    TooManyRequests = 429,
    /** RFC 6585, 5 */
    RequestHeaderFieldsTooLarge = 431,
    /** RFC 7725, 3 */
    UnavailableForLegalReasons = 451,

    /** RFC 7231, 6.6.1 */
    InternalServerError = 500,
    /** RFC 7231, 6.6.2 */
    NotImplemented = 501,
    /** RFC 7231, 6.6.3 */
    BadGateway = 502,
    /** RFC 7231, 6.6.4 */
    ServiceUnavailable = 503,
    /** RFC 7231, 6.6.5 */
    GatewayTimeout = 504,
    /** RFC 7231, 6.6.6 */
    HTTPVersionNotSupported = 505,
    /** RFC 2295, 8.1 */
    VariantAlsoNegotiates = 506,
    /** RFC 4918, 11.5 */
    InsufficientStorage = 507,
    /** RFC 5842, 7.2 */
    LoopDetected = 508,
    /** RFC 2774, 7 */
    NotExtended = 510,
    /** RFC 6585, 6 */
    NetworkAuthenticationRequired = 511,
}

export const StatusText: {readonly [key:number]: string} = Object.freeze({
    [StatusCode.Continue]: 'Continue',
    [StatusCode.SwitchingProtocols]: 'Switching Protocols',
    [StatusCode.Processing]: 'Processing',
    [StatusCode.EarlyHints]: 'Early Hints',
    [StatusCode.OK]: 'OK',
    [StatusCode.Created]: 'Created',
    [StatusCode.Accepted]: 'Accepted',
    [StatusCode.NonAuthoritativeInfo]: 'Non-Authoritative Information',
    [StatusCode.NoContent]: 'No Content',
    [StatusCode.ResetContent]: 'Reset Content',
    [StatusCode.PartialContent]: 'Partial Content',
    [StatusCode.MultiStatus]: 'Multi-Status',
    [StatusCode.AlreadyReported]: 'Already Reported',
    [StatusCode.IMUsed]: 'IM Used',
    [StatusCode.MultipleChoices]: 'Multiple Choices',
    [StatusCode.MovedPermanently]: 'Moved Permanently',
    [StatusCode.Found]: 'Found',
    [StatusCode.SeeOther]: 'See Other',
    [StatusCode.NotModified]: 'Not Modified',
    [StatusCode.UseProxy]: 'Use Proxy',
    [StatusCode.TemporaryRedirect]: 'Temporary Redirect',
    [StatusCode.PermanentRedirect]: 'Permanent Redirect',
    [StatusCode.BadRequest]: 'Bad Request',
    [StatusCode.Unauthorized]: 'Unauthorized',
    [StatusCode.PaymentRequired]: 'Payment Required',
    [StatusCode.Forbidden]: 'Forbidden',
    [StatusCode.NotFound]: 'Not Found',
    [StatusCode.MethodNotAllowed]: 'Method Not Allowed',
    [StatusCode.NotAcceptable]: 'Not Acceptable',
    [StatusCode.ProxyAuthRequired]: 'Proxy Authentication Required',
    [StatusCode.RequestTimeout]: 'Request Timeout',
    [StatusCode.Conflict]: 'Conflict',
    [StatusCode.Gone]: 'Gone',
    [StatusCode.LengthRequired]: 'Length Required',
    [StatusCode.PreconditionFailed]: 'Precondition Failed',
    [StatusCode.RequestEntityTooLarge]: 'Request Entity Too Large',
    [StatusCode.RequestURITooLong]: 'Request-URI Too Long',
    [StatusCode.UnsupportedMediaType]: 'Unsupported Media Type',
    [StatusCode.RequestedRangeNotSatisfiable]: 'Requested Range Not Satisfiable',
    [StatusCode.ExpectationFailed]: 'Expectation Failed',
    [StatusCode.Teapot]: 'I\'m a teapot',
    [StatusCode.MisdirectedRequest]: 'Misdirected Request',
    [StatusCode.UnprocessableEntity]: 'Unprocessable Entity',
    [StatusCode.Locked]: 'Locked',
    [StatusCode.FailedDependency]: 'Failed Dependency',
    [StatusCode.TooEarly]: 'Too Early',
    [StatusCode.UpgradeRequired]: 'Upgrade Required',
    [StatusCode.PreconditionRequired]: 'Precondition Required',
    [StatusCode.TooManyRequests]: 'Too Many Requests',
    [StatusCode.RequestHeaderFieldsTooLarge]: 'Request Header Fields Too Large',
    [StatusCode.UnavailableForLegalReasons]: 'Unavailable For Legal Reasons',
    [StatusCode.InternalServerError]: 'Internal Server Error',
    [StatusCode.NotImplemented]: 'Not Implemented',
    [StatusCode.BadGateway]: 'Bad Gateway',
    [StatusCode.ServiceUnavailable]: 'Service Unavailable',
    [StatusCode.GatewayTimeout]: 'Gateway Timeout',
    [StatusCode.HTTPVersionNotSupported]: 'HTTP Version Not Supported',
    [StatusCode.VariantAlsoNegotiates]: 'Variant Also Negotiates',
    [StatusCode.InsufficientStorage]: 'Insufficient Storage',
    [StatusCode.LoopDetected]: 'Loop Detected',
    [StatusCode.NotExtended]: 'Not Extended',
    [StatusCode.NetworkAuthenticationRequired]: 'Network Authentication Required',
});