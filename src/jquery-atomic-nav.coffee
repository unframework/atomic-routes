
((module) -> module(jQuery)) ($) ->
    class NavigationState
        constructor: (@_parent, @_suffix, @_currentPath) ->
            @_fullPath = if @_parent is null then @_suffix else @_parent._fullPath.concat @_suffix
            @_isDestroyed = false

        _update: (subPath) ->
            if @_isDestroyed
                throw new Error('already destroyed')

            $(this).trigger 'changed', [ subPath ]

        _destroy: ->
            if @_isDestroyed
                throw new Error('already destroyed')

            @_isDestroyed = true
            $(this).trigger 'destroyed'

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
                        currentState = new NavigationState this, suffix, match[1]
                        currentArgs = match[0]

                        cb.apply null, currentArgs.concat [ currentState ]
                    else
                        currentState._update match[1]


            $(this).on 'changed', (e, subPath) =>
                processPath subPath

            $(this).on 'destroyed', =>
                processPath null

            processPath @_currentPath

            this

        enter: (subPath) ->
            if @_isDestroyed
                throw new Error('already destroyed')

            if subPath[0] isnt '/'
                throw new Error('sub-path must begin with slash')

            window.location = '#' + @_fullPath + subPath

            return

    getHashPath = ->
        hash = window.location.hash
        hashMatch = /^#\/(.*)$/.exec hash

        if hashMatch
            hashMatch[1].split '/'
        else
            ''

    $.navigationRoot = () ->
        $(window).on 'hashchange', ->
            root._update getHashPath()

        root = new NavigationState null, '', getHashPath()
