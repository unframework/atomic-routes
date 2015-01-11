(function(module) {
  return module(jQuery);
})(function($) {
  var NavigationState, getHashPath;
  NavigationState = (function() {
    function NavigationState(_parent, _suffix, _currentPath) {
      this._parent = _parent;
      this._suffix = _suffix;
      this._currentPath = _currentPath;
      this._fullPath = this._parent === null ? this._suffix : this._parent._fullPath.concat(this._suffix);
      this._isDestroyed = false;
    }

    NavigationState.prototype._update = function(subPath) {
      if (this._isDestroyed) {
        throw new Error('already destroyed');
      }
      return $(this).trigger('changed', [subPath]);
    };

    NavigationState.prototype._destroy = function() {
      if (this._isDestroyed) {
        throw new Error('already destroyed');
      }
      this._isDestroyed = true;
      return $(this).trigger('destroyed');
    };

    NavigationState.prototype.when = function(suffix, cb) {
      var currentArgs, currentState, matchCurrentArgs, matchPath, processPath, suffixPath;
      if (this._isDestroyed) {
        throw new Error('already destroyed');
      }
      suffixPath = suffix.split('/').slice(1);
      if (suffixPath.length < 1) {
        throw new Error('suffix must start with slash (/) and specify at least one path segment');
      }
      currentArgs = null;
      currentState = null;
      matchPath = function(subPath) {
        var args, i, segment, _i, _len;
        if (subPath.length < suffixPath.length) {
          return null;
        }
        args = [];
        for (i = _i = 0, _len = suffixPath.length; _i < _len; i = ++_i) {
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
        var i, x, _i, _len;
        for (i = _i = 0, _len = args.length; _i < _len; i = ++_i) {
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
              currentState = new NavigationState(_this, suffix, match[1]);
              currentArgs = match[0];
              return cb.apply(null, currentArgs.concat([currentState]));
            } else {
              return currentState._update(match[1]);
            }
          }
        };
      })(this);
      $(this).on('changed', (function(_this) {
        return function(e, subPath) {
          return processPath(subPath);
        };
      })(this));
      $(this).on('destroyed', (function(_this) {
        return function() {
          return processPath(null);
        };
      })(this));
      processPath(this._currentPath);
      return this;
    };

    NavigationState.prototype.enter = function(subPath) {
      if (this._isDestroyed) {
        throw new Error('already destroyed');
      }
      if (subPath[0] !== '/') {
        throw new Error('sub-path must begin with slash');
      }
      window.location = '#' + this._fullPath + subPath;
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
  return $.navigationRoot = function() {
    var root;
    $(window).on('hashchange', function() {
      return root._update(getHashPath());
    });
    return root = new NavigationState(null, '', getHashPath());
  };
});
