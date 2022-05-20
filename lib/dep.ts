import { Reflect as _reflect } from "https://deno.land/x/deno_reflect@v0.1.13/mod.ts";
import { NIL_UUID, V4, isNil, isValid, uuid } from "https://deno.land/x/uuid@v0.1.2/mod.ts";
import { delay } from "https://deno.land/std@0.129.0/async/mod.ts";
import { fromFileUrl, dirname, resolve, toFileUrl, join, extname } from "https://deno.land/std@0.110.0/path/mod.ts";
import { readerFromStreamReader, writerFromStreamWriter, readableStreamFromReader, writableStreamFromWriter, copy } from "https://deno.land/std@0.134.0/streams/mod.ts";
import { parse, stringify } from "https://deno.land/x/xml@2.0.4/mod.ts";
import { move, moveSync } from "https://deno.land/std@0.140.0/fs/mod.ts";
import { MultipartReader, MultipartWriter, isFormFile } from 'https://deno.land/std@0.140.0/mime/mod.ts';

export const Mime = {
    MultipartReader,
    MultipartWriter,
    isFormFile
}

export const Fs = {
    move,
    moveSync,
}

export const conversionXMLtoJSON = {
    parse,
    stringify
}

export const Streams = {
    readerFromStreamReader,
    writerFromStreamWriter,
    readableStreamFromReader,
    writableStreamFromWriter,
    copy
}

export const Async = {
    delay
}

export const Path = {
    resolve,
    dirname,
    fromFileUrl,
    toFileUrl,
    join,
    extname
}

export const Reflect = _reflect;

export const UUID = {
    NIL_UUID,
    V4,
    isNil,
    isValid,
    uuid
}