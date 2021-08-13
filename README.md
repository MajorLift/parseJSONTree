# JSON Parser using AST Traversal

- Features: Performs Reverse Post-Order Traversal of the JSON Abstract Syntax Tree, and Iterative DFS of matching brackets.
- Time complexity is roughly linear, and by avoiding recursive calls, the parser is able to process larger inputs efficiently. 
- Input validation and sanitization is almost completely abstracted away. Matching brackets and adherence to JSON formatting rules is assumed.
