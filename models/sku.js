var conn = require('./db').conn;

function SKU(sku){
	this.tid = sku.tid;
	this.title = sku.title;
	this.skuMetaTid = sku.skuMetaTid;
	this.itemMetaTid = sku.itemMetaTid;
	this.sellerId = sku.sellerId;
	this.sellerName = sku.sellerName;
	this.shopId = sku.shopId;
	this.url = sku.url;
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
		sellerId : this.sellerId,
		sellerName : this.sellerName,
		itemMetaTid : this.itemMetaTid,
		url : this.url,
		shopId : this.shopId,
		tradeUpdated : new Date(),
		skuDetailUpdated : new Date(),
		shopUpdated : new Date(),
		otherUpdated : new Date()
	};

	var skuCol = conn.collection('skus');

	skuCol.count({tid : sku.tid}, function(err, c){

		if(c > 0 ){
			//existed. update it.
			skuCol.update({tid: sku.tid}, {$set: {title : sku.title, itemMetaTid : sku.itemMetaTid}}, function(err, r){
				if(err){
					return callback(err);
				}else{
					callback(null, r);
				}
			})
		}else{
			//new entity. insert.
			skuCol.insert(sku, function(err, r){
				if(err){
					return callback(err);
				}else{
					callback(null, r);
				}
			})
		}
	});
};

SKU.getAllCount = function(callback){
	conn.collection('skus').count(function(err, c){
		if(err){
			callback(err);
		}
		callback(null, c);
	});
};

SKU.getTop100DescByTradeUpdated = function(callback){
	conn.collection('skus').find({}, {limit : 100, sort : [['tradeUpdated', 1]]}).toArray(function(err, results){
		if(err){
			callback(err);
		}
		callback(null, results);
	});
}