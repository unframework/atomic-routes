module.exports = function(config) {
    config.set({
        basePath: '',

        frameworks: ['jasmine', 'jquery-2.1.0'],

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
