var conn = require('./db').conn;

function Crawling(crawling){
	this.startTime = crawling.startTime;
	this.type = crawling.type;
	this.timestamp = crawling.timestamp;
	this.status = crawling.status;
	this.finishStatus = crawling.finishStatus;
};

module.exports = Crawling;

Crawling.prototype.save = function(callback){
	var crawlingCol = conn.collection('crawlings');

	var c = {
		startTime : this.startTime,
		type : this.type,
		timestamp : this.timestamp,
		status : this.status,
		finishStatus : this.finishStatus
	};

	crawlingCol.count({type : c.type, timestamp : c.timestamp}, function(err, count){
		if(err){
			return callback(err);
		}

		if(count > 0){
			crawlingCol.update({type : c.type, timestamp : c.timestamp}, {$set : {startTime : c.startTime, status : c.status, finishStatus : c.finishStatus}}, function(err, result){
				if(err){
					return callback(err);
				}
				callback(null, result);
			});
		}
		else{
			crawlingCol.insert(c, function(err, result){
				if(err){
					return callback(err);
				}
				callback(null, result);
			});
		}
	});
};

Crawling.getRunningByType = function(crawlerType, callback){
	conn.collection('crawlings').find({type : crawlerType, status : 'running'}).toArray(function(err, results){
		if(err){
			return callback(err);
		}
		callback(null, results);
	});
};

Crawling.resetCrawling = function(callback){
	conn.collection('crawlings').update({status : 'running'}, {$set : {status : 'not running', finishStatus : 'break'}}, function(err, result){
		if(err){
			return callback(err);
		}
		callback(null, result);
	});
	console.log("reset the crawling");
}