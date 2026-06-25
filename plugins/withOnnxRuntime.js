const { withAppBuildGradle } = require('expo/config-plugins');

module.exports = function withOnnxRuntime(config) {
  return withAppBuildGradle(config, (cfg) => {
    const content = cfg.modResults.contents;

    if (content.includes('com.microsoft.onnxruntime')) {
      return cfg;
    }

    cfg.modResults.contents = content.replace(
      /(dependencies\s*\{)/,
      '$1\n    implementation("com.microsoft.onnxruntime:onnxruntime-android:1.25.0")'
    );

    return cfg;
  });
};
