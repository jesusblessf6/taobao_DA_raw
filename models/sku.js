var conn = require('./db').conn;

function SKU(sku){
	this.tid = sku.tid;
	this.title = sku.title;
};

module.exports = SKU;

SKU.prototype.save = function(){
	
};