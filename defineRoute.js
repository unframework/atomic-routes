
class HoverState {
    x: 0,
    y: 0,
    domElement: null,
    whenDone: null
}

function ObjTable(props) {
    return <table>
        [ 1, 2, 3 ].map((obj) => {
            return <tr>
                <Hover onStart={({ x, y, domElement, whenDone }) => {
                    // generic DOM element hover affordance defined
                    // and interpreted here in a specific context
                    // here we have a record of user hover intent (HoverState)

                    // here we register the intent on some state (i.e. not part of this DOM render tree)
                    // and then render it somewhere in a popup container in a different z-layer
                    // in a component that renders the popup arrow, etc

                    // importantly, the whenDone thing is *bulletproof*, it really means anything, not just mouse-leave
                    // i.e. the source DOM is tracked for position, visibility, etc
                    // that's something that comes as part of this affordance implementation

                    // can actually register an extra MDI-ish intent layer that adds also proximity tracking?
                    // that can be called a "view popup" intent of some kind
                    // i.e. the user intends to inspect a given piece of screen real-estate

                    // or is that an affordance? the goal is to protect user intent
                    // by representing it as a specific thing; inspection intent creates
                    // context for affordances to e.g. drill down, click on things, etc
                    // intent = "heavy claim", affordance = "light response"
                    // we can respond to intent to inspect by showing a "sorry" message with no data
                    // latter is an affordance for the user to go back, or refresh, I guess, or just
                    // to be *informed* of the state

                    // CSS hover on buttons is much simpler than all this: indicates clickability
                    // but that's actually kind of fine academically: consider a "GoodButton" component
                    // that includes a Hover component that in turn does onStart action of "reinforcePerceivedClickability"
                    // can still just add CSS class or whatever
                    // in fact, Hover+reinforceClickability can then just *render* as a pattern to be a CSS :hover class
                    // i.e. "optimize-out" the JS and replace with CSS :hover
                    // of course, that is wonky, but at the same time the Hover component can just have a hoverStyle prop
                    // which marries component-ness of things with predictable use of pure CSS in the end
                }} />

                <Hover style={{
                    test: 'hi'
                }} />

                <Drag onStart={() => {
                    // generic draggable DOM element affordance
                }} />
            </tr>
        })
    </table>;
}

// trackable overlay state
// I considered a simple "task" tracker, except that is way too generic
// could still be some sort of cancellable "TaskState" thing too
class OverlayState {}

function registerOverlay(screenOptions) {}

var overlayState = registerOverlay({ modal: false });

overlayState.whenDone.finally(() => {
    // on success/etc
});

function renderOverlay(overlayState) {
    return <span>
        Ohai, you are looking at a popup
        <button onClick={() => overlayState.resolve()}>OK</button>
        <button onClick={() => overlayState.cancel()}>Cancel</button>
    </span>;
});

// factory method defines a class with constructor that takes parent path and either arg data or parseable subpath
// this then just naturally plugs into any Redux store/etc
// @todo decouple path parsing from state constructor? maybe just use subclassing!
// @todo escape/unescape
function defineRoute(pathPattern, subRouteDefinitions) {
    if (pathPattern !== '' && pathPattern[0] !== '/') {
        throw new Error('path pattern must start with a slash');
    }

    const segmentList = pathPattern.split('/').slice(1);
    const argList = segmentList.filter(segment => segment[0] === ':').map(segment => segment.slice(1));

    const subRoutes = Object.assign({}, subRouteDefinitions);
    const subRouteList = Object.keys(subRoutes);

    class NavigationState {
        constructor(parentPath, stateData) {
            // parse path or just assign given state params
            if (typeof stateData === 'string') {
                if (stateData[0] !== '/') {
                    throw new Error('invalid URL path, must be string starting with slash');
                }

                const path = stateData.split('/').slice(1);

                for (var i = 0; i < segmentList.length; i += 1) {
                    if (path.length <= i) {
                        throw new Error('path mismatch'); // @todo ugh, this sucks as signal
                    }

                    // store arg if needed
                    if (segmentList[i][0] === ':') {
                        this[segmentList[i].slice(1)] = path[i];
                    } else if (path[i] !== segmentList[i]) {
                        throw new Error('path mismatch'); // @todo ugh, this sucks as signal
                    }
                }
            } else {
                // safely assign known args
                argList.forEach(arg => {
                    if (!Object.hasOwnProperty.call(stateData, arg)) {
                        throw new Error('argument not defined: ' + arg);
                    }

                    this[arg] = stateData[arg];
                });
            }

            // we have enough to construct own path now
            // @todo this mangles when pattern is empty-path
            this.path = (parentPath || '') +
                '/' +
                segmentList.map(segment => segment[0] === ':' ? this[segment.slice(1)] : segment).join('/');

            // continue parsing subpath if applicable
            if (typeof stateData === 'string') {
                const subpath = stateData.slice(this.path.length);

                subRouteList.forEach(name => {
                    const subRouteClass = subRoutes[name];

                    this[name] = new subRouteClass(
                        this.path,
                        subpath
                    );
                });
            } else {
                subRouteList.forEach(name => {
                    this[name] = null;
                });
            }
        }

        go(subRouteName, subRouteArgData = {}) {
            const subRouteClass = subRoutes[subRouteName];

            return new subRouteClass(this.path, subRouteArgData);
        }
    }

    return NavigationState;
}

// var rootRoute = defineRoute('', {
//     users: defineRoute('/users', {
//         list: defineRoute('/'),
//         detail: defineRoute('/:id')
//     })
// });

// var state = { nav: new rootRoute('', '/aasdf/asd/asd') };

// state.nav.go('users').go('detail', { id: 1234 }).path;
