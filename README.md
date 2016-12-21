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

# Random Notes

- navigation state in itself should just be a class that takes some parameters
    - *parsing* the path is the job of the subroute link
- this is going back to the express style route definition, I suppose
    - the interesting bit here is then using things other than URL paths to track nav state transition
- one important reason is because state should be normalized
- big take-away, too, is that Reduxifying should be just a top-level attachment
- actually, one big thing about URL patterns is that they tell how to *encode* a nav state
    - this is why one can actually create a "candidate" and then get its path
    - getting the path could still be a serialization thing
    - because e.g. an intent state triggered by mouse hover (yep, hover is an affordance) is not necessarily serializable as a URL
    - serialization here is specifically used as encoding of linkable URL, nothing else
- either way, a nav-state-as-plain-class thing makes sense
- more generically, what about "parent"?
    - hover state on something *does* have a parent scope - not just "previous" scope, either, but actually parent
    - what is "parent"? it is something that is guaranteed to not lose user focus until given state does
- imagining a page that shows a reddit thread
    - subscribe button in the sidebar
    - hover state on subscribe button shows a "categorize" textbox
        - when user does mouse-enter, that triggers a focused state on the intent
        - when user mouse-leaves, that removes focus "pointer"
    - *but* if the user clicks on textbox (or keyboard focus or whatever) mouse-leave should no longer remove focus
        - how? perhaps by "pinning" focus? by an inner child nav state?
        - or perhaps making the "is focused" on the nav state be a computed property of: "is currently hovered" || "has clicked"
        - duration of the focus state is trackable as a promise, so whatever triggers it can allow for "stuffing" or "pinning" more stuff after creation but before completion
    - importantly, intent represented by a URL is not "stuffable" via code, because it is flowing from a hard state of the URL bar
        - but some composite inferred intent might be still
        - that's essentially a notion of MDI-like popups
        - where hover intent/etc are "hard", but MDI-pinning makes it a different kind of intent
    - all that MDI-pinning does is let user click "X" or something to make it go away
- if a hover/URL/MDI/whatever intent is active, the underlying state may "go away"
    - but the important quality issue to enforce here is that the *affordance instance should stay*
    - just means it is grayed-out/shows "oops" message
    - kind of like going too far in the wizards in RR: it just shows a "please start over" message, but does not mess with actual user intent
    - if user hovers over a table row card, the callout should not just disappear if underlying table reconfigures/changes/etc - classic issue of "unintended click switcharoo" resolved this way
- modeling e.g. hover intent: has properties such as screen location and page location
    - in fact, screen location is the more important one
    - because it is what is under the cursor and avoids that "switcharoo" on scroll
    - example: call-out when row is hovered
        - if user puts mouse over call-out, scrolling away should actually keep the call-out active in *same spot*, but just "stretch" the connector arrow
        - sure, if source spot goes too far away or if table disappears (e.g. due to state or URL navigation), should "pop" the bubble basically
        - importantly, URL navigation should result in *delayed disappearance effect*
            - i.e. callout bubble sticks around but animates out slowly enough to show the lost focus
    - in other words, hard "instrumentation" things for appropriate sources of intent
    - nothing to do with DOM though, perhaps, except as a way to add on more metering
- hover affordance is still a *class*
    - indicates the possibility of hover
- affordances are defined before render, likely
    - why? because harder to yank one away from the user? hmm
    - just seems like it is closer to long-term view state definition
    - affordance is actually closer to "I can categorize my subscription to reddit" than "I can hover over this button"
    - but, importantly, affordance instance is still a fairly specific after-render thing, so maybe it's OK to create on render?
    - basically affordance-as-instance spawns notion of intent-as-instance
    - so, intent is instance and maybe affordance is a class?
    - I intend to hover (easiest to interpret), which infers that I intend to see categorization options (because that is what the meaning of the hover affordance was)
- hover affordance is on render, so makes sense to make a React component
    - attaches to parent DOM element, basically
    - however, nav affordance makes no sense to be part of the render tree - what is it even?
- affordance implementation for e.g. hover is quite watertight in terms of tracking the "end" of the hover
    - the whole point is to encapsulate conceivable user intent
    - so the hover is done when element disappears, etc, etc
    - which is then properly reported as part of intent state whenDone promise
    - so the developer does not have to resort to further hacks to track more
