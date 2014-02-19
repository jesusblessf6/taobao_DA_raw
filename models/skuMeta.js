var conn = require('./db').conn;

function SkuMeta(skuMeta){
	this.tid = skuMeta.tid; //spec
	this.itemMetaTid = skuMeta.itemMetaTid;
	this.brandTid = skuMeta.brandTid;
	this.title = skuMeta.title;
	this.refPrice = skuMeta.refPrice;
	this.skuUpdated = skuMeta.skuUpdated;
	this.skuMetaDetailUpdated = skuMeta.skuMetaDetailUpdated;
};

module.exports = SkuMeta;

SkuMeta.prototype.save = function(callback){

	var skuMetaCol = conn.collection('skuMetas');

	var sm = {
		tid : this.tid,
		itemMetaTid : this.itemMetaTid,
		brandTid : this.brandTid,
		title : this.title,
		refPrice : this.refPrice,
		skuUpdated : new Date(),
		skuMetaDetailUpdated : new Date()
	};

	skuMetaCol.count({tid : sm.tid, itemMetaTid : sm.itemMetaTid}, function(err, c){
		if(err){
			return callback(err);
		}

		if(c > 0){
			skuMetaCol.update({tid : sm.tid}, {$set : {title : sm.title, refPrice : sm.refPrice}}, function(err, result){
				if(err){
					return callback(err);
				}else{
					callback(null, result);
				}
			});
		}else{
			skuMetaCol.insert(sm, function(err, result){
				if(err){
					return callback(err);
				}else
				{
					callback(null, result);
				}
			});
		}
	});
};

SkuMeta.getByTid = function(tid, callback){
	conn.collection('skuMetas').findOne({tid: tid}, function(err, result){
		if(err){
			return callback(err);
		}
		callback(null, result);
	});
};

SkuMeta.getAll = function(callback){
	conn.collection('skuMetas').find().toArray(function(err, results){
		if(err){
			return callback(err);
		}
		callback(null, results);
	});
};


SkuMeta.getAllCount = function(callback){
	conn.collection('skuMetas').count(function(err, c){
		if(err){
			return callback(err);
		}
		callback(null, c);
	});
};

SkuMeta.getCountByBrand = function(brandTid, callback){
	conn.collection('skuMetas').count({brandTid : brandTid}, function(err, count){
		if(err){
			return callback(err);
		}

		callback(null, count);
	});
};

SkuMeta.getTop100DescBySkuUpdated = function(callback) {
	conn.collection('skuMetas').find({}, {limit : 100, sort : [['skuUpdated', 1]]}).toArray(function(err, results){
		if(err){
			callback(err);
		}
		else{
			callback(null, results);
		}
	});
};

SkuMeta.updateUpdatedTime = function(obj, callback){
	if(obj.target == "sku"){
		conn.collection('skuMetas').update({tid : obj.tid, itemMetaTid : obj.itemMetaTid}, {$set : {skuUpdated : obj.value}}, function(err, result){
			if(err){
				return callback(err);
			}

			callback(null, result);
		});
	}
	else if(obj.target == "skuMetaDetail"){
		conn.collection('skuMetas').update({tid : obj.tid, itemMetaTid : obj.itemMetaTid}, {$set : {skuMetaDetailUpdated : obj.value}}, function(err, result){
			if(err){
				return callback(err);
			}

			callback(null, result);
		});
	}
};