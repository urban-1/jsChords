
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
    var t = C.Util.objValue(opts, "type", "html");
    
    switch (t) {
	case "html":
	    return new C.RendererHtml(opts);
	default:
	    throw new Error({'C.IRenderer':'Renderer "'+t+'" is not known...'}) 
    }
}
