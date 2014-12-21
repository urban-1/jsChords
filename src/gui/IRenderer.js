
/**
 * Basic Renderer Interface
 * @class IRenderer
 */
C.IRenderer = C.Class.extend({
    options: {
	type: "abstract"
    },
    
    initialize: function (options) {
	C.setOptions(this, options);
    }
})

C.IRenderer.byType = function(opts){

}
