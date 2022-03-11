import App from '../../lib/fecades/app.facede.ts';

import appConfig from '../configs/app.config.ts';
import serverConfig from '../configs/server.config.ts';

App.setting({
    name: appConfig.name,
    env: appConfig.env,
});

App.registerConfig(serverConfig.name, serverConfig);

appConfig.services.forEach(
    service => App.registerService(service.name, service.constructor)
);
appConfig.providers.forEach( 
    provider => App.registerProvider(provider.name, provider.constructor)
);

App.initApp();