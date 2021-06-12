// Returns a javascript object from a JSON-formatted string
// @params (String) Valid bracket pairing and conformity to standard JSON formatting rules is assumed.
// @returns (Object) Type corresponds to outermost layer of input JSON object.
function JSONParser(input) {
  // Input sanitization of escaped double quotation marks from JSON.stringify,
  // and redundant/unnecessary whitespace characters.
  this.string = input.replaceAll(/\\"/g, '"').replaceAll(/\\n|\s{2,}/g, ' ');
  this.objectStack = []; // Stack for parsed objects. 
  
  return (function main () {
    // Primitive type input: pass to parsePrimitives() and return
    if (!this.string.match(/[[{]/g) // Input contains no objects or arrays.
      // Input contains brackets/braces, but only as string characters.
      || this.string.match(/['"`](?!null|true|false)\w*[[{][\w^'"`]*[\]}]\w*['"`]/g)) {
      return parsePrimitives(this.string);
    } 
    // Composite type input: pass to traverseJSONTree() and return
    return traverseJSONTree(this.string);
  })();

  // Parses and returns primitive data types from JSON strings
  function parsePrimitives (string) {
    // Edge case: Non-string input -> transparent pass-through
    if (typeof string !== 'string') return string;
    string = string.trim();
    // Determine type of object corresponding to input JSON string, and return converted output
    return string === null || string === 'null' ? null
      : string === 'true' ? true : string === 'false' ? false // boolean
        : Number(string) ? string * 1.0 // number
          // Remove surrounding double quotes (generally from JSON.stringify output).
          : string[0] === '"' ? string.slice(1,-1)
            : string; // all other string instances
  }

  // Parses Arrays from JSON strings. 
  // @returns (Array) with single-level parsing of nested elements.
  function parseArray (string) {
    return string === '[]' ? []
      : string.slice(1,-1).split(',') // remove brackets and split array elements
        .map(x => ['[','{'].includes(x.trim()[0]) // search for composite-type elements 
          // replace substring representing composite-type element with parsed result from objectStack.
          ? this.objectStack.pop() 
          : parsePrimitives(x)
        );
  }

  // Parses Objects from JSON strings.
  // @returns (Object) with single-level parsing of nested elements.
  function parseObject (string) {
    return string === '{}' ? {} 
      : Object.fromEntries(
        string.slice(1,-1).split(',') // remove braces and split properties
          .map(x => x.split(':')) // split keys and values
          .map(([k,v]) => ['[','{'].includes(v.trim()[0]) // search for composite-type elements
            // replace substring representing composite-type value with parsed result from objectStack.
            ? [parsePrimitives(k), this.objectStack.pop()]
            : [parsePrimitives(k), parsePrimitives(v)]
          )
      );
  }

  // Performs Iterative Reverse Post-Order Traversal of the JSON object tree, 
  // parsing and caching every composite-type object that is encountered into the bracketStack.
  // LIFO retrieval of cached objects by parent nodes calling parseArray() and parseObject()
  // will result in correctly-ordered integration of all child elements due to reverse iteration.
  // @params (String) JSON-formatted string representing, at the outermost layer, a composite data type
  // @returns (Object) object represented by input string, with all nested elements parsed into javascript data types.
  function traverseJSONTree (string) {
    const bracketStack = []; // Stack for DFS of matching bracket pairs.
    let currObjStr; // (String) Target substring to be parsed in current loop 
    let currObj;    // (Object/Array) Parsed object that will be pushed into objectStack
    // Reverse iteration over input string
    for (let i = string.length - 1; i >= 0; i--) {
      const s = string[i];
      if ([']','}'].includes(s)) bracketStack.push(i);
      if (['[','{'].includes(s)) { // assumes valid bracket pairing throughout input
        // Extract current target substring using indices of matching bracket pair 
        const [start, end] = [i, bracketStack.pop() + 1];
        currObjStr = string.slice(start, end);
        currObj = s === '{' ? parseObject(currObjStr) : parseArray(currObjStr);
        this.objectStack.push(currObj);
        // Remove element and key-value separators (',', ':') from current target substring range 
        // and replace with single-width whitespace to prevent redundant parsing in subsequent loops, 
        // and avoid mutating string length while for loop is running.
        if (s === '[' && currObj.length > 1 || s === '{' && Object.keys(currObj).length > 0) {
          string = string.slice(0, start) + currObjStr.replaceAll(/[,:]/g, ' ') + string.slice(end);
        }
      }
    }
    // all child nodes are consolidated into final top-level object in objectStack.
    return this.objectStack.pop();
  }
}
