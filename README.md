# Atomic Routes

Decentralized nested client-side routing with Promises. Framework-agnostic, composable, simple: designed to work with component-based application UIs.

```js
var rootNav = new RootRoute();

rootNav.when('/foo', function (fooNav) {
    // create a container widget
    console.log('entered "foo" state');
    var rootDom = $('<div>Root View</div>').appendTo('body');

    fooNav.whenDestroyed.then(function() {
        // destroy the container widget
        console.log('left "foo" state');
        rootDom.remove();
    });

    fooNav.when('/bar', function (barNav) {
        // create a sub-widget and attach to container
        console.log('entered "foo/bar" state');
        var fooDom = $('<div>FooBar View</div>').appendTo(rootDom);

        barNav.whenDestroyed.then(function() {
            // destroy the sub-widget
            console.log('left "foo/bar" state');
            fooDom.remove();
        });
    });
});

rootNav.when('/baz/:someParam', function (someParam, bazNav) {
    console.log('entered "baz" state with "' + someParam + '"');

    bazNav.whenDestroyed.then(function() {
        console.log('left "baz" state with "' + someParam + '"');
    });
});
```

Inspired by [AngularJS UI Router](https://github.com/angular-ui/ui-router) nested routes concept and modern techniques like Promises that emphasize immutable, functional state.

Unlike AngularJS UI Router and most other routing libraries, Atomic Routes are defined on-demand and in a decentralized fashion. There is no need for a massive central "routes" file which has to run at bootstrap time.

Composition example:

```js
// RootView.js: top-level "page" view
function RootView() {
    var rootNav = new RootRoute();
    var $dom = $('body');

    rootNav.when('/fizz-buzz', function (fizzBuzzNav) {
        var fizzBuzzView = new FizzBuzzView($dom, fizzBuzzNav);
    });
}
```

```js
// FizzBuzzView.js: sub-component in another file which expects delegated nav state
function FizzBuzzView($dom, nav) {
    // ... render DOM, etc

    // can create sub-routes without needing to know what the parent URL is
    nav.when('/foo-bar', function (fooBarNav) {
        // render more sub-route DOM, etc
    });
}
```

## Usage Patterns

Routes are defined via `when` method. Each route body is executed when a navigation state is entered (immediately if it already matches current route). The navigation state can be used to define nested routes, and to track when the user leaves that navigation state. The library defines the "root" navigation state that is always active - that is the starting place where routes are registered.

To detect when a navigation state is no longer active, register a callback on the state object using the `whenDestroyed.then` method. The `whenDestroyed` property is a full-fledged promise object, so the callback will be called even when trying to register *after* the user left the navigation state. This is needed to easily clean up UI created as a result of an asynchronous operation: the operation may complete after the navigation state has become inactive, so attaching a simple event listener would miss out on the cleanup.

## More Examples

For more examples see `/example/index.html`.
