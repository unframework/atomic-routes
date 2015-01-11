
((module) -> module(jQuery)) ($) ->
    class NavigationState
        constructor: (@_parent, @_suffix, @_currentPath) ->
            @_fullPath = if @_parent is null then @_suffix else @_parent._fullPath + @_suffix
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

            currentState = null

            processPath = (subPath) =>
                match = /^(\/[^\/]*)(.*)$/.exec subPath

                if match and match[1] is suffix
                    childSubPath = match[2]

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
        hashMatch = /^#(\/.*)$/.exec hash

        if hashMatch
            hashMatch[1]
        else
            ''

    $.navigationRoot = () ->
        $(window).on 'hashchange', ->
            root._update getHashPath()

        root = new NavigationState null, '', getHashPath()
