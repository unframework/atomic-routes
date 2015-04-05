(
  if module? # @todo better detection
    # browserify mode
    (moduleBody) -> module.exports = moduleBody(require('bluebird'))
  else
    # bower (global) mode
    (moduleBody) -> window.RootRoute = moduleBody(Promise)
) (Promise) ->
    class NavigationState
        constructor: (@_parent, @_suffix, @_currentPath) ->
            @_fullPath = if @_parent is null then @_suffix else @_parent._fullPath.concat @_suffix
            @_isDestroyed = false

            @_listenerList = []

            @whenDestroyed = new Promise (resolve, reject) =>
                @_resolveWhenDestroyed = resolve

        _update: (subPath) ->
            if @_isDestroyed
                throw new Error('already destroyed')

            for changeListener in @_listenerList
                changeListener subPath

        _destroy: ->
            if @_isDestroyed
                throw new Error('already destroyed')

            @_isDestroyed = true

            @_resolveWhenDestroyed()

            for changeListener in @_listenerList
                changeListener null

        whenRoot: (cb) ->
            if @_isDestroyed
                throw new Error('already destroyed')

            currentState = null

            processPath = (subPath) =>
                isMatching = subPath isnt null and subPath.length is 0

                # destroy current child state on path mismatch
                if currentState isnt null and !isMatching
                    currentState._destroy()
                    currentState = null

                # when matching, create child state
                if isMatching and currentState is null
                    currentState = new NavigationState this, [], []
                    cb.call null, currentState

            @_listenerList.push processPath

            processPath @_currentPath

            this

        when: (suffix, cb) ->
            if @_isDestroyed
                throw new Error('already destroyed')

            suffixPath = suffix.split('/').slice(1)

            if suffixPath.length < 1
                throw new Error('suffix must start with slash (/) and specify at least one path segment')

            currentArgs = null
            currentState = null

            matchPath = (subPath) ->
                if subPath.length < suffixPath.length
                    return null

                args = []

                for segment, i in suffixPath
                    if segment[0] is ':'
                        args.push decodeURIComponent(subPath[i])
                    else if subPath[i] isnt segment
                        return null

                return [ args, subPath.slice suffixPath.length ]

            matchCurrentArgs = (args) ->
                for x, i in args
                    if x isnt currentArgs[i]
                        return false

                return true

            processPath = (subPath) =>
                match = if subPath isnt null then matchPath subPath else null

                # destroy current child state on path mismatch or args mismatch
                if currentState isnt null
                    if match is null or not matchCurrentArgs match[0]
                        currentState._destroy()
                        currentState = null
                        currentArgs = null

                # when matching, either create child state or update it
                if match isnt null
                    if currentState is null
                        currentState = new NavigationState this, subPath.slice(0, suffixPath.length), match[1]
                        currentArgs = match[0]

                        cb.apply null, currentArgs.concat [ currentState ]
                    else
                        currentState._update match[1]

            @_listenerList.push processPath

            processPath @_currentPath

            this

        enter: (subPath) ->
            if @_isDestroyed
                throw new Error('already destroyed')

            if subPath[0] isnt '/'
                throw new Error('sub-path must begin with slash')

            fullPrefix = if @_fullPath.length > 0 then '#/' + @_fullPath.join('/') else '#'
            window.location = fullPrefix + subPath

            return

    getHashPath = ->
        hash = window.location.hash
        hashMatch = /^#\/(.*)$/.exec hash

        if hashMatch
            hashMatch[1].split '/'
        else
            ''

    () ->
        window.addEventListener 'hashchange', ->
            root._update getHashPath()

        root = new NavigationState null, [], getHashPath()
