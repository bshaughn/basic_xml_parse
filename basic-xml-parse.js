/*
   Welcome to the world's most basic "XML" parser, written in an afternoon.
   It doesn't look for comments, it assumes no extra whitespace, etc.
   All testing has been done on small inputs (<200 characters)

   In the interest of providing a timely solution, there is redundancy in this module.
   	  Refactoring can reduce file size, and complicate readability
      as well as maintenance, and may introduce corner cases. 

   This version includes:
     -basic bracket checking to make sure we have 
       correctly matching opening and closing bracket pairs.
     -tag checking to make sure opening and closing tags match.
     -nested dictionaries (keys can have values which are dictionaries)
*/

var brackets = []; //this is for very basic bracket matching

function bxp (inStr){
    var key = "";
    var value = "";
    var assembleKey = false;
    var parsedJSON = {};
    var c = 0;
    brackets = [];  //reset global bracket stack each time you restart the parser

    /*
    Using inline method calls here, would incur extra context switching 
      and require passing inStr as an argument between methods; 
       or allocating space for inStr.
    */
	while (c<inStr.length) {
		if (inStr[c] == '<'){

			if (assembleKey == false) {
			    assembleKey = true;
			    brackets.push('<');
			}

			if (key != "" && inStr[c+1]!='/') {
				var r = buildNestedDict(key, c, inStr);

				if (typeof r == "string")
				   return r;

				brackets.pop();
				parsedJSON[key] = r[0];
				c = r[1];
				key = "";
				if (c==inStr.length-1 && inStr[c]=='>') //if you've reached the end of the string, clear brackets
					brackets.pop();
			}
		}

		else if (inStr[c] == '>'){
			if (brackets.length == 0)
				return "Invalid input! Mismatched bracket at char " + c;

			brackets.pop(); 
			assembleKey = false;
			
			value = "";
		}

		else if (inStr[c]=='/'){
			assembleKey = false;
			c++;

			var closeTag = "";
			var k = c;

			while(inStr[k]!= '>'){
				closeTag+=inStr[k];
				k++;
			}

			if (closeTag == key) {
				parsedJSON[key] = value;
				key = "";
				value = "";
			}

			else return "Tag mismatch! "+closeTag+" != "+key;
		}

		else if (assembleKey==true) 
			key += inStr[c];

		else 
			value += inStr[c];
		
		c++;
	}

	if (brackets.length != 0)
		return "Invalid input! Mismatched closing bracket"; 

	return JSON.stringify(parsedJSON, null, 2);
}

/*
   Possibly refactor this as a recursive bxp call. See note above regarding tradeoffs.
*/
function buildNestedDict(superKey, c, inStr) {
	var key = "";
    var value = "";
    var assembleKey = false;
    var localDict = {};

	while (c<inStr.length) {
		if (inStr[c] == '<'){

			if (assembleKey == false) {
			    assembleKey = true;
			    brackets.push('<');
			}

			if (key != "" && inStr[c+1]!='/') {
				var r = buildNestedDict(key, c, inStr);

				if (typeof r == "string") 
				    return r;
				brackets.pop();
				localDict[key] = r[0];
				c = r[1];
				key = "";
			}
		}

		else if (inStr[c] == '>'){
			if (brackets.length == 0)
				return "Invalid input! Mismatched tag at char " + c;

			brackets.pop(); 
			assembleKey = false;
			
			value = "";
		}

		else if (inStr[c]=='/'){
			assembleKey = false;
			c++;

			var k = c;
			closeTag = "";

			while(inStr[k]!= '>'){
				closeTag+=inStr[k];
				k++;
			}

			if (closeTag == superKey) {
				c+=superKey.length;
				return [localDict, c];
			}

			if (closeTag == key) {
				localDict[key] = value;
				key = "";
				value = "";
			}

			else return "Tag mismatch! "+closeTag+"!="+key;
		}

		else if (assembleKey==true) 
			key += inStr[c];

		else 
			value += inStr[c];
		
		c++;
	}
}

exports.basicXMLParse = bxp;
