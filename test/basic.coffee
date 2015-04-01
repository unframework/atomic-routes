
describe 'atomic-routes plugin', ->
    it 'defines global namespace method', ->
        expect(RootRoute).toEqual jasmine.any Function
