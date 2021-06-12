# JSON Parser using Tree Traversal

- This implementation of the JSON parser works by:
- performing Iterative Reverse Post-Order Traversal of the JSON Object Tree based on DFS of matching brackets .
- The time complexity is roughly linear, and the parser is iterative rather than recursive, which enables it to process large inputs efficiently.  
- Implementation of input sanitation is limited, with matching brackets and adherence to JSON formatting rules being assumed.
