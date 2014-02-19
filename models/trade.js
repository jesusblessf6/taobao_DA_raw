var conn = require('./db').conn;

function Trade(trade){
	skuTid = trade.skuTid;
	buyerNickName = trade.buyerNickName;
	quantity = trade.quantity;
	price = trade.price;
	tradeTime = trade.tradeTime;
	skuStyleName = trade.skuStyleName;
};

module.exports = Trade;

Trade.prototype.save = function(callback){
	
	var tradeCol = conn.collection('trades');

	var tmpTrade = {
		skuTid : this.skuTid,
		buyerNickName : this.buyerNickName,
		quantity : this.quantity,
		price : this.price,
		tradeTime : this.tradeTime,
		skuStyleName = this.skuStyleName
	};

	tradeCol.count({skuTid : tmpTrade.skuTid, buyerNickName : tmpTrade.buyerNickName, tradeTime : tmpTrade.tradeTime},function(err, c){
		if(c <= 0){
			tradeCol.insert(tmpTrade, function(err, result){
				if(err){
					callback(err);
				}else{
					callback(null, result);
				}
			});
		}
	});
};