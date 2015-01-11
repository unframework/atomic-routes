(function(module) {
  return module(jQuery);
})(function($) {
  var NavigationState, getHashPath;
  NavigationState = (function() {
    function NavigationState(_parent, _suffix, _currentPath) {
      this._parent = _parent;
      this._suffix = _suffix;
      this._currentPath = _currentPath;
      this._fullPath = this._parent === null ? this._suffix : this._parent._fullPath + this._suffix;
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
      var currentState, processPath;
      if (this._isDestroyed) {
        throw new Error('already destroyed');
      }
      currentState = null;
      processPath = (function(_this) {
        return function(subPath) {
          var childSubPath, match;
          match = /^(\/[^\/]*)(.*)$/.exec(subPath);
          if (match && match[1] === suffix) {
            childSubPath = match[2];
            if (currentState === null) {
              currentState = new NavigationState(_this, suffix, childSubPath);
              return cb(currentState);
            } else {
              return currentState._update(childSubPath);
            }
          } else if (currentState !== null) {
            currentState._destroy();
            return currentState = null;
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
    hashMatch = /^#(\/.*)$/.exec(hash);
    if (hashMatch) {
      return hashMatch[1];
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
