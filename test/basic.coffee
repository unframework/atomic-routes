
describe 'atomic-routes plugin', ->
    it 'defines jQuery namespace method', ->
        expect(jQuery.navigationRoot).toEqual jasmine.any Function
