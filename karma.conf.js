module.exports = function(config) {
    config.set({
        basePath: '',

        frameworks: ['jasmine'],

        preprocessors: {
            '**/*.coffee': ['coffee']
        },

        reporters: ['progress'],

        port: 9876,

        colors: true,
        logLevel: config.LOG_INFO,
        autoWatch: true,

        browsers: ['PhantomJS']
    });
};
