
describe 'jquery-atomic-nav plugin', ->
    it 'defines jQuery namespace method', ->
        expect(jQuery.navigationRoot).toEqual jasmine.any Function
