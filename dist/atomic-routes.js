(typeof module !== "undefined" && module !== null ? function(moduleBody) {
  return module.exports = moduleBody(require('bluebird'));
} : function(moduleBody) {
  return window.RootRoute = moduleBody(Promise);
})(function(Promise) {
  var NavigationState, getHashPath;
  NavigationState = (function() {
    function NavigationState(_parent, _suffix, _currentPath) {
      this._parent = _parent;
      this._suffix = _suffix;
      this._currentPath = _currentPath;
      this._fullPath = this._parent === null ? this._suffix : this._parent._fullPath.concat(this._suffix);
      this.isActive = true;
      this._listenerList = [];
      this.whenDestroyed = new Promise((function(_this) {
        return function(resolve, reject) {
          return _this._resolveWhenDestroyed = resolve;
        };
      })(this));
    }

    NavigationState.prototype._update = function(subPath) {
      var changeListener, j, len, ref, results;
      if (!this.isActive) {
        throw new Error('already destroyed');
      }
      ref = this._listenerList;
      results = [];
      for (j = 0, len = ref.length; j < len; j++) {
        changeListener = ref[j];
        results.push(changeListener(subPath));
      }
      return results;
    };

    NavigationState.prototype._destroy = function() {
      var changeListener, j, len, ref, results;
      if (!this.isActive) {
        throw new Error('already destroyed');
      }
      this.isActive = false;
      this._resolveWhenDestroyed();
      ref = this._listenerList;
      results = [];
      for (j = 0, len = ref.length; j < len; j++) {
        changeListener = ref[j];
        results.push(changeListener(null));
      }
      return results;
    };

    NavigationState.prototype.whenRoot = function(cb) {
      var currentState, processPath;
      if (!this.isActive) {
        throw new Error('already destroyed');
      }
      currentState = null;
      processPath = (function(_this) {
        return function(subPath) {
          var isMatching;
          isMatching = subPath !== null && subPath.length === 0;
          if (currentState !== null && !isMatching) {
            currentState._destroy();
            currentState = null;
          }
          if (isMatching && currentState === null) {
            currentState = new NavigationState(_this, [], []);
            if (cb) {
              return cb.call(null, currentState);
            }
          }
        };
      })(this);
      this._listenerList.push(processPath);
      processPath(this._currentPath);
      return {
        getIsActive: function() {
          return currentState !== null;
        }
      };
    };

    NavigationState.prototype.when = function(suffix, cb) {
      var currentArgs, currentState, matchCurrentArgs, matchPath, processPath, suffixPath;
      if (!this.isActive) {
        throw new Error('already destroyed');
      }
      suffixPath = suffix.split('/').slice(1);
      if (suffixPath.length < 1) {
        throw new Error('suffix must start with slash (/) and specify at least one path segment');
      }
      currentArgs = null;
      currentState = null;
      matchPath = function(subPath) {
        var args, i, j, len, segment;
        if (subPath.length < suffixPath.length) {
          return null;
        }
        args = [];
        for (i = j = 0, len = suffixPath.length; j < len; i = ++j) {
          segment = suffixPath[i];
          if (segment[0] === ':') {
            args.push(decodeURIComponent(subPath[i]));
          } else if (subPath[i] !== segment) {
            return null;
          }
        }
        return [args, subPath.slice(suffixPath.length)];
      };
      matchCurrentArgs = function(args) {
        var i, j, len, x;
        for (i = j = 0, len = args.length; j < len; i = ++j) {
          x = args[i];
          if (x !== currentArgs[i]) {
            return false;
          }
        }
        return true;
      };
      processPath = (function(_this) {
        return function(subPath) {
          var match;
          match = subPath !== null ? matchPath(subPath) : null;
          if (currentState !== null) {
            if (match === null || !matchCurrentArgs(match[0])) {
              currentState._destroy();
              currentState = null;
              currentArgs = null;
            }
          }
          if (match !== null) {
            if (currentState === null) {
              currentState = new NavigationState(_this, subPath.slice(0, suffixPath.length), match[1]);
              currentArgs = match[0];
              if (cb) {
                return cb.apply(null, currentArgs.concat([currentState]));
              }
            } else {
              return currentState._update(match[1]);
            }
          }
        };
      })(this);
      this._listenerList.push(processPath);
      processPath(this._currentPath);
      return {
        getIsActive: function() {
          return currentState !== null;
        }
      };
    };

    NavigationState.prototype.enter = function(subPath) {
      var fullPrefix;
      if (!this.isActive) {
        throw new Error('already destroyed');
      }
      if (subPath[0] !== '/') {
        throw new Error('sub-path must begin with slash');
      }
      fullPrefix = this._fullPath.length > 0 ? '#/' + this._fullPath.join('/') : '#';
      window.location = fullPrefix + subPath;
    };

    return NavigationState;

  })();
  getHashPath = function() {
    var hash, hashMatch;
    hash = window.location.hash;
    hashMatch = /^#\/(.*)$/.exec(hash);
    if (hashMatch) {
      return hashMatch[1].split('/');
    } else {
      return '';
    }
  };
  return function() {
    var root;
    window.addEventListener('hashchange', function() {
      return root._update(getHashPath());
    });
    return root = new NavigationState(null, [], getHashPath());
  };
});
