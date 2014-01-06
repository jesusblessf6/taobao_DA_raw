var conn = require('./db').conn;

function SkuMeta(skuMeta){
	this.tid = skuMeta.tid; //spec
	this.itemMetaTid = skuMeta.itemMetaTid;
	this.brandTid = skuMeta.brandTid;
	this.title = skuMeta.title;
	this.refPrice = skuMeta.refPrice;
	this.skuUpdatedTime = skuMeta.skuUpdatedTime;
	this.skuMetaDetailUpdatedTime = skuMeta.skuMetaDetailUpdatedTime;
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
		skuUpdatedTime : new Date(),
		skuMetaDetailUpdatedTime : new Date()
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