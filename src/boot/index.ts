import { Application } from '@lara-io/core';

import AppConfig from '../configs/app.config.ts';

const application = new Application(AppConfig().name);

application.registerConfig("app", AppConfig);

application.boot();