var conn = require('./db').conn;

function ItemMeta(itemMeta){
	this.name = itemMeta.name;
	this.brandTid = itemMeta.brandTid;
	this.tid = itemMeta.tid;
	this.comments = itemMeta.comments;
	this.url = itemMeta.url;
	this.cate1 = itemMeta.cate1;
	this.cate2 = itemMeta.cate2;
	this.cate3 = itemMeta.cate3;
	this.cate1Id = itemMeta.cate1Id;
	this.cate2Id = itemMeta.cate2Id;
	this.cate3Id = itemMeta.cate3Id;
};

module.exports = ItemMeta;

ItemMeta.prototype.save = function(callback){
	
	var itemMeta = {
		name : this.name,
		brandTid : this.brandTid,
		tid : this.tid,
		comments : this.comments,
		url : this.url,
		cate1 : this.cate1,
		cate2 : this.cate2,
		cate3 : this.cate3,
		cate1Id : this.cate1Id,
		cate2Id : this.cate2Id,
		cate3Id : this.cate3Id
	};

	var itemMetaCol = conn.collection('itemMetas');

	itemMetaCol.count({tid : itemMeta.tid}, function(err, count){

		if(err){
			return callback(err);
		}

		if(count > 0){
			itemMetaCol.update({tid : itemMeta.tid}, {$set : {name : itemMeta.name, comments : itemMeta.comments}}, function(err, result){
				if(err){
					return callback(err);
				}
				else{
					callback(null, result);
				}
			});
		}
		else{
			itemMetaCol.insert(itemMeta, function(err, result){
				if(err){
					return callback(err);
				}
				else{
					callback(null, result);
				}
			});
		}

	});
};

ItemMeta.getByTid = function(tid, callback){
	conn.collection('itemMetas').findOne({tid : tid}, function(err, result){
		if(err){
			callback(err);
		}else{
			callback(null, result);
		}
	});
};

ItemMeta.getByBrandTid = function(brandTid, callback){
	conn.collection('itemMetas').find({brandTid : brandTid}).toArray(function(err, results){
		if(err){
			return callback(err);
		}

		callback(null, results);
	});
};

ItemMeta.getAll = function(callback){
	conn.collection('itemMetas').find().toArray(function(err, results){
		if(err){
			return callback(err);
		}

		callback(null, results);
	});
};

ItemMeta.saveCateInfo = function(tid, cate1, cate2, cate3, cate1Id, cate2Id, cate3Id, callback){
	conn.collection('itemMetas').update({tid : tid}, {$set : {cate1 : cate1, cate2 : cate2, cate3 : cate3, cate1Id : cate1Id, cate2Id : cate2Id, cate3Id : cate3Id}}, function(err, result){
		if(err){
			return callback(err);
		}
		callback(null, result);
	});
};

ItemMeta.getAllCount = function(callback){
	conn.collection('itemMetas').count(function(err, c){
		if(err){
			return callback(err);
		}
		callback(null, c);
	});
};

ItemMeta.getCountByBrand = function(brandTid, callback){
	conn.collection('itemMetas').count({brandTid : brandTid}, function(err, count){
		if(err){
			return callback(err);
		}

		callback(null, count);
	});
};