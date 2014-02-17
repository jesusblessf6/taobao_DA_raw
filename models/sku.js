var conn = require('./db').conn;

function SKU(sku){
	this.tid = sku.tid;
	this.title = sku.title;
	this.skuMetaTid = sku.skuMetaTid;
	this.tradeUpdated = sku.tradeUpdated;
	this.skuDetailUpdated = sku.skuDetailUpdated;
	this.shopUpdated = sku.shopUpdated;
	this.otherUpdated = sku.otherUpdated;
};

module.exports = SKU;

//save entity, if existed, then update it.
SKU.prototype.save = function(callback){

	var sku = {
		tid : this.tid,
		title : this.title,
		skuMetaTid : this.skuMetaTid,
		tradeUpdated : new Date(),
		skuDetailUpdated : new Date(),
		shopUpdated : new Date(),
		otherUpdated : new Date()
	};

	var skuCol = conn.collection('skus');

	skuCol.count({tid : sku.tid, skuMetaTid : sku.skuMetaTid}, function(err, c){

		if(c > 0 ){
			//existed. update it.
			skuCol.update({tid: sku.tid, skuMetaTid : sku.skuMetaTid}, {$set: {title : sku.title}}, function(err, r){
				if(err){
					return callback(err);
				}else{
					callback(null, result);
				}
			})
		}else{
			//new entity. insert.
			skuCol.insert(sku, function(err, r){
				if(err){
					return callback(err);
				}else{
					callback(null, result);
				}
			})
		}
	});
};