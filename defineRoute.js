// factory method defines a class with constructor that takes parent path and either arg data or parseable subpath
// this then just naturally plugs into any Redux store/etc
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
