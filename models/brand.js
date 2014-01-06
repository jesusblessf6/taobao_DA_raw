var conn = require('./db').conn;

function Brand(brand){
	this.name = brand.name;
	this.tid = brand.tid;
	this.itemMetaUpdated = brand.itemMetaUpdated;
	this.brandDetailUpdated = brand.brandDetailUpdated;
};

module.exports = Brand;

Brand.prototype.save = function(callback){

	var brand = {
		tid : this.tid,
		name : this.name,
		itemMetaUpdated : new Date(),
		brandDetailUpdated : new Date()
	};

	conn.collection('brands').count({tid : brand.tid}, function(err, result){

		if(err){
			return callback(err);
		}

		if(result > 0){
			conn.collection('brands').update({tid : brand.tid}, {$set : {name : brand.name}}, function(err, result){
				if(err){
					return callback(err);
				}
			})
		}
		else{
			conn.collection('brands').insert(brand, function(err, result){
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

Brand.getByTid = function(tid, callback){
	conn.collection('brands').findOne({tid : tid}, function(err, result){
		if(err){
			callback(err);
		}else{
			callback(null, result);
		}
	});
};

Brand.getAll = function(callback){
	conn.collection('brands').find().toArray(function(err, results){
		if(err){
			return callback(err);
		}else if(results){
			callback(null, results);
		}
	});
};

Brand.getAllDescByItemUpdatedTime = function(callback){
	conn.collection('brands').find().sort({itemMetaUpdated : 1}).toArray(function(err, results){
		if(err){
			return callback(err);
		}else if(results){
			console.log(results.length);
			callback(null, results);
		}
	});
};

Brand.getAllCount = function(callback){
	conn.collection('brands').count(function(err, c){
		if(err){
			return callback(err);
		}

		callback(null, c);
	});
};

Brand.updateUpdatedTime = function(obj, callback){
	if(obj.target == "itemMeta"){
		conn.collection('brands').update({tid : obj.tid}, {$set : {itemMetaUpdated : obj.value}}, function(err, result){
			if(err){
				return callback(err);
			}

			callback(null, result);
		});
	}
	else if(obj.target == "brandDetail"){
		conn.collection('brands').update({tid : obj.tid}, {$set : {brandDetailUpdated : obj.value}}, function(err, result){
			if(err){
				return callback(err);
			}

			callback(null, result);
		});
	}
};