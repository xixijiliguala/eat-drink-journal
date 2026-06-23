const { withAndroidManifest } = require('expo/config-plugins');

module.exports = function withCleartext(config) {
  return withAndroidManifest(config, (cfg) => {
    const app = cfg.modResults.manifest.application[0];
    app.$['android:usesCleartextTraffic'] = 'true';
    app.$['android:networkSecurityConfig'] = '@xml/network_security_config';
    return cfg;
  });
};
