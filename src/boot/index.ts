import { Application } from '@lara-io/core';

import AppConfig from '../configs/app.config.ts';
import ServerConfig from '../configs/server.config.ts';
import RouterConfig from '../configs/router.config.ts';

const application = new Application(AppConfig().name);

application.registerConfig("app", AppConfig);
application.registerConfig("server", ServerConfig);
application.registerConfig("router", RouterConfig);

application.boot();