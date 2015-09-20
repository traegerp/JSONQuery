
function JSONQuery(){
	//Constructor :: null --> this
	this.output  			= [];
	this.whereClauseSection = [];
	this.sumByKey 			= [];
	this.groupByKey 		= [];
	this.maxKey 			= [];
	this.minKey 		 	= [];
	this.countByKey 		= [];
	this.groupByKey 		= [];
	this.temp 				= [];
	this.aggKeys 		 	= [];
	return this;
}

JSONQuery.prototype.SELECT = function(str){
	//Class Method :: string --> this
	/*
		Splits string by comma and converts to array of keys
	*/
	if(Object.prototype.toString.call(str) === '[object String]'){
		var convertStringToArray = function(str){
			if(str){
				try{
					str = str.trim().replace(/ /g, '');
				}
				catch(ignore){

				}
				return str.split(',');
			}			
		};
		this.keys = convertStringToArray(str) || [];		
		return this;
	}
	else{
		throw new Error('JSONQuery.FROM requires arg type String');
	}
};

JSONQuery.prototype.FROM = function(array){
	//Class Method :: Array --> this
	/*
		Stores the JSON array to this 
	*/
	if(Object.prototype.toString.call(array) === '[object Array]'){
		this.array  = array || [];
		return this;
	}
	else{
		throw new Error('JSONQuery.FROM requires arg type Array');
	}
};

JSONQuery.prototype.AND = function(str){
	if(Object.prototype.toString.call(str) === '[object String]'){
		this.whereClauseSection.push({
			conjunctive : 'AND',
			str 		: str
		}); 
		return this;
	}
	else{
		throw new Error('JSONQuery.AND expected arg type string');
	}
};

JSONQuery.prototype.OR = function(str){
	if(Object.prototype.toString.call(str) === '[object String]'){
		this.whereClauseSection.push({
			conjunctive : 'OR',
			str 		: str
		}); 
		this.copy = this.array;
		return this;
	}
	else{
		throw new Error('JSONQuery.AND expected arg type string')
	}
};

JSONQuery.prototype.getFilter= function(operand){
	if(Object.prototype.toString.call(operand) !== '[object Undefined]'){
		var operator = {
			'=' : function(key, value, obj){
				return obj[key] == value;
			},

			'>' : function(key, value, obj){
				return obj[key] > value;
			},

			'<' : function(key, value, obj){
				return obj[key] < value;
			},

			'not' : function(key, value, obj){
				return obj[key] != value;
			},
			'isnull' : function(key, value, obj){
				return obj[key] == null || obj[key] == undefined;
			}
		};	
		return operator[operand.toString().toLowerCase()];
	}
	else{
		throw new Error('JSONQuery.getExpression got undefined');
	}
};

JSONQuery.prototype.getAllFilters = function(){
	//Class Method Private :: null --> array
	/*
		from the operands found in a expression, maps a filter to to be used
	*/
	var array = this.whereClauseSection;
	for(var i = 0; i < array.length; i++){
		//loop through each section and build an expression
		var filter  = null;
		var operand = null;
		if(array[i]){
			//get filters
			var exp = array[i].str.toLowerCase();
			if(exp.indexOf('>') !== -1){
				filter  = this.getFilter('>');
				operand = '>';
			}
			else if(exp.indexOf('<') !== -1){
				filter  = this.getFilter('<');
				operand = '<';
			}
			else if(exp.indexOf('=') !== -1){
				filter  = this.getFilter('=');
				operand = '=';
			}
			else if(exp.indexOf('not') !== -1){
				filter  = this.getFilter('not');
				operand = 'not';
			}

			if(filter && operand){
				//set operands, values, keys and filters
				try{
					exp = exp.trim().replace(/ /g, '');
				}
				catch(ignore){

				}

				array[i].filter  	 = filter;
				array[i].operand 	 = operand;
				array[i].key 	 	 = exp.split(operand)[0];
				if(operand.toLowerCase() === 'isnull'){
					array[i].value 	 = null;
				}
				else{
					array[i].value 	 = exp.split(operand)[1];
				}
			}
		}
	}	
	return array;
};

JSONQuery.prototype.distinct = function(){

};

JSONQuery.prototype.MAX = function(str){
	if(Object.prototype.toString.call(str) === '[object String]'){
		this.maxKey.push(str);
		return this;
	}
	else{
		throw new Error('JSONQuery.MAX expected type String');
	}
};

JSONQuery.prototype.MIN = function(str){
	if(Object.prototype.toString.call(str) === '[object String]'){
		this.minKey.push(str);
		return this;
	}
	else{
		throw new Error('JSONQuery.MIN expected type String');
	}	
};

JSONQuery.prototype.COUNT = function(str){
	if(Object.prototype.toString.call(str) === '[object String]'){
		this.countByKey.push(str);
		return this;
	}
	else{
		throw new Error('JSONQuery.MAX expected type String');
	}
};

JSONQuery.prototype.SUM = function(str){
	if(Object.prototype.toString.call(str) === '[object String]'){
		this.sumByKey.push(str);
		return this;
	}
	else{
		throw new Error('JSONQuery.SUM expected type String');
	}
};

JSONQuery.prototype.GROUPBY = function(str){
	if(Object.prototype.toString.call(str) === '[object String]'){
		this.groupByKey = str.trim().replace(/ /g, '').split(',');
		return this;
	}
};

JSONQuery.prototype.hashCode = function(str){
	if(Object.prototype.toString.call(str) === '[object String]'){
		var char;
	    var hash = 0;
	    if (str.length == 0) return hash;
	    for (var i = 0; i < str.length; i++) {
	        char = str.charCodeAt(i);
	        hash = ((hash<<5)-hash)+char;
	        hash = hash & hash;
	    }
	    return hash;
	}
};

JSONQuery.prototype.getUniqueSet = function(set){
	if(Object.prototype.toString.call(set) !== '[object Undefined]'){
		var array   = [];
		var setHash = {};

		for(var key in set){
			if(set.hasOwnProperty(key)){
				if(this.aggKeys.indexOf(key) === -1){
					setHash[key] = set[key];
				}
			}
		}

		var hash    = this.hashCode(JSON.stringify(setHash));

		for(var i = 0; i < this.array.length; i++){
			var current = this.array[i];
			var toHash  = {};

			for(var key in this.array[i]){
				if(this.array[i].hasOwnProperty(key)){
					if(this.aggKeys.indexOf(key) === -1){
						toHash[key] = this.array[i][key];
					}
				}
			}
			var hashCurrent = this.hashCode(JSON.stringify(toHash));
			if(hashCurrent === hash){
				array.push(this.array[i]);
			}
		}
		return array;
	}
};

JSONQuery.prototype.group = function(groups){
	if(groups){
		var set 	= null;
		var array 	= []; 
		for(var i = 0; i < groups.length; i++){
			//get the corresponding set for the unique index
			if(groups[i]){
				set = this.getUniqueSet(groups[i]);
				if(Object.prototype.toString.call(set) !== '[object Undefined]'){
					var temp = this.aggregate(set);
					array.push(temp[0]);
				}
			}
		}
		this.array = array;
	}
};

JSONQuery.prototype.aggregate = function(group){
	//Class Method Private :: null --> null
	/*
		Applies aggregation functions to data
	*/
	if(this.groupByKey.length > 0){
		this.temp = [];
		var scope = {};
		scope.transform = function(array, key, value){
			for(var i = 0; i < array.length; i++){
				if(array[i]){
					array[i][key] = value;					
				}
			}
			return array;
		};

		if(this.sumByKey.length > 0){
			scope.sumByKey = function(array, key){
				if(Object.prototype.toString.call(array) === '[object Array]' && Object.prototype.toString.call(key) === '[object String]'){
					var reduced = array.reduce(function(prev, next){
						var obj  = {};
						obj[key] = prev[key] + next[key];
						return obj;
					});
					return reduced[key];
				}
			};
			for(var i = 0; i < this.sumByKey.length; i++){
				var reduced = scope.sumByKey(group, this.sumByKey[i]);
				this.temp  = scope.transform(group, this.sumByKey[i], reduced);
			}
		}

		if(this.maxKey.length > 0){			
			scope.max = function(array, key){
				return Math.max.apply(Math,array.map(function(obj){return obj[key];}))	
			};
			for(var i = 0; i < this.maxKey.length; i++){		
				var reduced = scope.max(group, this.maxKey[i]);			
				this.temp  = scope.transform(group, this.maxKey[i], reduced); 			
			}
		}

		if(this.minKey.length > 0){			
			scope.min = function(array, key){
				return Math.min.apply(Math,array.map(function(obj){return obj[key];}))	
			};
			for(var i = 0; i < this.minKey.length; i++){		
				var reduced = scope.min(group, this.minKey[i]);			
				this.temp  = scope.transform(group, this.minKey[i], reduced); 			
			}
		}		

		if(this.countByKey.length > 0){			
			scope.count = function(array, key){
				var counter = 0;
				for(var i = 0; i < array.length; i++){
					if(key in array[i]){
						counter++;
					}
				}
				return counter;
			};
			for(var i = 0; i < this.countByKey.length; i++){					
				var reduced = scope.count(group, this.countByKey[i]);
				this.temp  = scope.transform(group, this.countByKey[i], reduced);
			}
		}

		scope = null;
		if(this.temp.length > 0){
			return this.temp;
		}
		else{
			return group;
		}
	}	
};

JSONQuery.prototype.execute = function(){
	//Class Method Private :: null --> this
	/*
		Run query by getting filters, and scoping by necessary keys, handle AND / OR statements
	*/
	if(this.whereClauseSection.length > 0){
		//get filters
		var array = this.getAllFilters();
		if(array){
			for(var i = 0; i < array.length; i++){
				var key   	 = array[i].key;
				var value 	 = array[i].value;
				var filterBy = array[i].filter;
				//if it's an AND or NONE expression, filter's can be combined
				if(array[i].conjunctive === 'AND' || array[i].conjunctive === 'NONE'){
					this.array   = this.array.filter(filterBy.bind(this, key, value));
				}
				else{
					//if its an OR statement, filter needs to be conditional
					var temp = this.copy.filter(filterBy.bind(this, key, value));
					//combine with this.array
					this.array.concat(temp);
					//remove duplicates
					this.distinct();
				}
			}
		}
	}

	//get keys from SELECT statement
	if(this.keys[0] !== '*'){
		var array = [];
		for(var i = 0; i < this.array.length; i++){
			var obj = {};
			for(var x = 0; x < this.keys.length; x++){
				obj[this.keys[x]] = this.array[i][this.keys[x]];
			}
			array.push(obj);
		}
		this.array = array;
	}


	if(this.sumByKey){
		for(var i = 0; i < this.sumByKey.length; i++){
			this.aggKeys.push(this.sumByKey[i]);
		}
	}
	if(this.maxKey){
		for(var i = 0; i < this.maxKey.length; i++){
			this.aggKeys.push(this.maxKey[i]);
		}
	}		

	if(this.minKey){
		for(var i = 0; i < this.minKey.length; i++){
			this.aggKeys.push(this.minKey[i]);
		}		
	}

	if(this.countByKey){
		for(var i = 0; i < this.countByKey.length; i++){
			this.aggKeys.push(this.countByKey[i]);
		}
	}

	if(this.groupByKey.length > 0){
		//get groupings
		var groupings = this.getGroupings(); 
		if(groupings){
			//apply any aggregations:
			this.group(groupings);
		}
	}
	return this;
};

JSONQuery.prototype.getGroupings = function(){
	//GROUP BY returns a single row for each unique combination of the GROUP BY fields.
	var that = this;
	var getUnique = function (array, keys){
		var hashes = [];
		var unique = [];
		for(var i = 0; i < array.length; i++){
			var current = array[i];
			var obj 	 = {};
			var groupObj = {};
			for(var x = 0; x < keys.length; x++){
				if(that.aggKeys.indexOf(keys[x]) === -1){
					obj[keys[x]] = current[keys[x]];
				}
				groupObj[keys[x]] = current[keys[x]];
			}

			var hashed = that.hashCode(JSON.stringify(obj));
			if(hashes.indexOf(hashed) === -1){
				hashes.push(hashed);
				unique.push(groupObj);
			}
		}
		return unique;
	};
	return getUnique(this.array, this.groupByKey);
};

JSONQuery.prototype.then = function(fn){
	//Class Method :: function --> null
	/*
		Callback function executes and passes an error and data
	*/
	if(Object.prototype.toString.call(fn) === '[object Function]'){
		try{
			this.output = this.execute();
			fn(null, this.output.array);
		}
		catch(error){
			fn(error, null);
		}
	}
	else{
		throw new Error('JSONQuery.then expected arg type function');
	}
};

JSONQuery.prototype.WHERE = function(str){
	// Class Method :: String --> this
	/*

	*/
	if(Object.prototype.toString.call(str) === '[object String]'){
		this.whereClauseSection.push({
			conjunctive : 'NONE',
			str 		: str
		});
		return this;
	}
	else{
		throw new Error('JSONQuery.FROM expected arg type Array');		
	}
};

JSONQuery.prototype.JOIN = function(array){
	if(Object.prototype.toString.call(array) === '[object Array]'){

	}
	else{
		throw new Error('JSONQuery.JOIN expected arg type Array');
	}
};

JSONQuery.prototype.ON = function(key1, key2){

};
