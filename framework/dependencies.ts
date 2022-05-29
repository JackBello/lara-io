import { Reflect as _reflect } from "https://deno.land/x/deno_reflect@v0.1.13/mod.ts";
import { NIL_UUID, V4, isNil, isValid, uuid } from "https://deno.land/x/uuid@v0.1.2/mod.ts";
import { delay } from "https://deno.land/std@0.129.0/async/mod.ts";
import { fromFileUrl, dirname, resolve, toFileUrl, join, extname } from "https://deno.land/std@0.110.0/path/mod.ts";
import { readerFromStreamReader, writerFromStreamWriter, readableStreamFromReader, writableStreamFromWriter, copy } from "https://deno.land/std@0.134.0/streams/mod.ts";
import { parse, stringify } from "https://deno.land/x/xml@2.0.4/mod.ts";
import { move, moveSync } from "https://deno.land/std@0.140.0/fs/mod.ts";
import { MultipartReader, MultipartWriter, isFormFile } from 'https://deno.land/std@0.140.0/mime/mod.ts';
import { parse as parseYAML, stringify as stringifyYAML  } from 'https://deno.land/std@0.140.0/encoding/yaml.ts';
import { toHtml } from "https://deno.land/x/md6@v0.7/mod.ts";
import { getCookies, setCookie, deleteCookie } from "https://deno.land/std@0.140.0/http/cookie.ts";
import { parse as parseCommandLine } from "https://deno.land/std@0.119.0/flags/mod.ts";

/**
 * this is file is used to register all the dependencies of own framework.
 */

/**
 * Flags dependencies
 */
export const Flags = {
    parseCommandLine
}

/**
 * Cookie dependencies
 */
export const Cookies = {
    getCookies,
    setCookie,
    deleteCookie
}

/**
 * Multipart dependencies
 */
export const Mime = {
    MultipartReader,
    MultipartWriter,
    isFormFile
}

/**
 * File System dependencies
 */
export const Fs = {
    move,
    moveSync,
}

/**
 * Markdown dependencies
 */
export const Marckdown = {
    toHtml
}

/**
 * YAML dependencies
 */
export const conversionYAML = {
    parseYAML,
    stringifyYAML
}

/**
 * XML dependencies
 */
export const conversionXML = {
    parse,
    stringify
}

/**
 * Stream dependencies
 */
export const Streams = {
    readerFromStreamReader,
    writerFromStreamWriter,
    readableStreamFromReader,
    writableStreamFromWriter,
    copy
}

/**
 * Async dependencies
 */
export const Async = {
    delay
}

/**
 * Path dependencies
 */
export const Path = {
    resolve,
    dirname,
    fromFileUrl,
    toFileUrl,
    join,
    extname
}

/**
 * Reflect dependencies
 */
export const Reflect = _reflect;

/**
 * UUID dependencies
 */
export const UUID = {
    NIL_UUID,
    V4,
    isNil,
    isValid,
    uuid
}
