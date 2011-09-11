var fs = require( 'fs' );
var cradle = require( 'cradle' );
var dbname;
var db;

if( process.argv.indexOf( '-test' ) === -1 ){
	dbname = 'foosball';
}else{
	dbname = 'foosball_test';
}
db = new( cradle.Connection )( 'odyssey.natelong.net' ).database( dbname );

var getGUID = function getGUID() {
    var S4 = function() {
       return (((1+Math.random())*0x10000)|0).toString(16).substring(1);
    };
    return (S4()+S4()+"-"+S4()+"-"+S4()+"-"+S4()+"-"+S4()+S4()+S4());
}

var write = function write( dataObject, onComplete ){
	db.save( getGUID(), dataObject, onComplete );
};

var get = function get( onComplete ){
	db.view( 'default/all', function( err, data ){
		console.log( '' );
		onComplete( err, data );
	});
};

var getSinceDate = function getSinceDate( date, onComplete ){
	db.view( 'default/bydate', { 'querystring': 'startkey=' + date }, function( err, data ){
		console.log( '[INFO] getSinceDate returned %s rows since %s', data.length, date.valueOf() );
		onComplete( err, data );
	});
};

exports.write = write;
exports.get = get;
exports.getSinceDate = getSinceDate;
