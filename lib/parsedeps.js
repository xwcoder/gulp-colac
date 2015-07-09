var removeComment = require('./removeComment');

var requireReg = /\brequire\(\s*['"](\S*)['"]\s*\)/g;

function unique ( deps ) {
    var ret = [];
    var map = {};

    for ( var i = 0, len = deps.length; i < len; i++ ) {
        if ( !map[ deps[i] ] ) {
            map[ deps[i] ] = 1;
            ret.push( deps[i] );
        }
    }
    return ret;
}

function parseDeps ( code ) {

    code = removeComment( code );

    if ( code.indexOf( 'require' ) == '-1' ) {
        return [];
    }

    var deps = [], match;

    while ( match = requireReg.exec( code ) ) {
        deps.push( match[ 1 ] );
    }

    return unique( deps );
}

module.exports = parseDeps;
