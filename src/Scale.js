
/**
 * Basic Scale class
 * 
 * @class C.Scale
 * @extends C.Class
 */
C.Scale = C.Class.extend({
    options: {
	root: "C",
	type: "Major"
    },
    
    initialize: function (options) {
	C.setOptions(this, options);
	// Cache distances
	this.dist = C.Scale.TYPES[this.options.type];
    },
    
    // 1. Create a note (root)
    // 2. Return the scaled/offseted note
    offset: function(f){
	// Check for optional 1st
	if (f[0]=="(") {
	    f = f.substring(1,f.length-1);
	}
	
	var off = 0;
	if (f[0]=="b") {
	    f = parseInt(f.substring(1));
	    off=-1;
	}
	else if (f[0]=="#"){
	    f = parseInt(f.substring(1));
	    off=1;
	}
	
	
	// Loop offset! 9ths/11ths
	var oo = false;
	if (f>this.dist.length) {
	    f=f%this.dist.length;
	    oo=true;
	}
	
	
	for (var i=0; (i<this.dist.length && i<f-1); i++) {
	    off+=this.dist[i]*2;
	}
	
	var n = new C.Note({note: this.options.root,octaveOffset: oo});
	return n.offset(off);
    }
});



