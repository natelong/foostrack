var foos = require( './server.js' );

console.log( '\n\nAttempting to start server... ' );

foos.addRoute( './handlers/all.js' );
foos.addRoute( './handlers/addgame.js' );
foos.addRoute( './handlers/lastweek.js' );
foos.addRoute( './handlers/getgamelist.js' );
foos.addRoute( './handlers/favicon.js' );
foos.addRoute( './handlers/generic.js' );

foos.init();
