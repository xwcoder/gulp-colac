function removeComments ( code ) {
  return code.replace( /\/\*.*\*\//g, '' )
            .replace( /\/\/.*(?=[\n\t])/g, '')
            .replace( /^\s*\/\*[\s\S]*?\*\/\s*$/mg, '' );
}

module.exports = removeComments;

