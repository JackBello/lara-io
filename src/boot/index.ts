import { Application } from '@lara-io/core';

import AppConfig from '../configs/app.config.ts';

import StorageConfig from '../configs/storage.config.ts';

const application = new Application(AppConfig().name);

application.registerConfig("app", AppConfig);

application.registerConfig("storage", StorageConfig);

application.boot();