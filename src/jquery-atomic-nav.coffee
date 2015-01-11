
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

            currentState = null

            matchPath = (subPath) ->
                for segment, i in suffixPath
                    if subPath[i] isnt segment
                        return null

                return [ {}, subPath.slice suffixPath.length ]

            processPath = (subPath) =>
                match = if subPath isnt null then matchPath subPath else null

                if match
                    childSubPath = match[1]

                    # either create child state or destroy it
                    if currentState is null
                        currentState = new NavigationState this, suffix, childSubPath
                        cb currentState
                    else
                        currentState._update childSubPath

                else if currentState isnt null
                    # destroy child state
                    currentState._destroy()
                    currentState = null

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
