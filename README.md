# jquery-atomic-nav
Concise jQuery routing and navigation plugin based on nested navigation states.

This library is designed to work with component-based application UIs. Heavily inspired by the state-machine approach of [AngularJS UI Router](https://github.com/angular-ui/ui-router) and modern techniques like Promises that emphasize immutable, functional state.

Unlike AngularJS UI Router and most other routing libraries, Atomic Nav routes are defined on-demand. This allows for a better, more elegant composition of widgets with no need for the massive central "routes" file.

For more examples see `/example/index.html`.

Example code:

```js
var rootNav = $.navigationRoot();

rootNav.when('/foo', function (fooNav) {
    console.log('entered "foo" state');

    // e.g. create a container widget

    $(fooNav).on('destroyed', function() {
        console.log('left "foo" state');

        // e.g. destroy the container widget
    });

    fooNav.when('/bar', function (barNav) {
        console.log('entered "foo/bar" state');

        // e.g. create a sub-widget and attach to container

        $(barNav).on('destroyed', function() {
            console.log('left "foo/bar" state');

            // e.g. destroy the sub-widget
        });
    });
});

rootNav.when('/baz/:someParam', function (someParam, bazNav) {
    console.log('entered "baz" state with "' + someParam + '"');

    $(bazNav).on('destroyed', function() {
        console.log('left "baz" state with "' + someParam + '"');
    });
});
```

Composition example:

```js
// top-level "page" view
function RootView() {
    var rootNav = $.navigationRoot();
    var $dom = $('body');

    rootNav.when('/fizz-buzz', function (fizzBuzzNav) {
        var fizzBuzzView = new FizzBuzzView($dom, fizzBuzzNav);
    });
}

// sub-component in another file
function FizzBuzzView($dom, nav) {
    // ... render DOM, etc

    // can create sub-routes without needing to know what the URL is
    nav.when('/foo-bar', function (fooBarNav) {
        // render more sub-route DOM, etc
    });
}
```
