(comment) @comment

(integer_literal) @constant.builtin
(range_integer_literal) @constant.builtin
(boolean_literal) @boolean
(escape_sequence) @string.escape
(string_literal) @string
(character_literal) @string

(identifier) @variable
((identifier) @constructor
 (#lua-match? @constructor "^[A-Z]"))
(root_identifier) @variable
((root_identifier) @constructor
 (#lua-match? @constructor "^[A-Z]"))
(type_identifier) @type
((type_identifier) @variable
 (#lua-match? @variable "^[a-z_]"))
(module_identifier) @namespace
((module_identifier) @type
 (#lua-match? @type "^[A-Z]"))

(path_identifier
  (path_identifier (root_identifier) @namespace)
    member: (_)
      (#lua-match? @namespace "^[a-z_]"))
(path_identifier
  (path_identifier member: (identifier) @namespace)
    (#lua-match? @namespace "^[a-z_]"))
(import_identifier
  (path_identifier (root_identifier) @namespace)
      (#lua-match? @namespace "^[a-z_]"))

(let_bind
  name: (identifier) @function
  parameter: (path_identifier (root_identifier) @variable.parameter)
    (#lua-match? @variable.parameter "^[a-z_]"))
(let_bind
  name: (identifier) @function
  bind: (lambda_expression))
(call_expression
  callee: (path_identifier (root_identifier) @function)
    (#lua-match? @function "^[a-z_]"))
(call_expression
  callee: (path_identifier
    member: (identifier) @function)
      (#lua-match? @function "^[a-z_]"))
(lambda_expression
  parameter: (identifier) @variable.parameter)

(value_definition
	name: (identifier) @function
    (function_type))

(binary_expression
	operator: "|>"
    rhs: (path_identifier (root_identifier) @function)
    (#lua-match? @function "^[a-z_]"))

[
  "type"
  "alias"
  "let"
  "fn"
  "match"
  "if"
  "then"
  "else"
  "in"
  "with"
  "module"
  "val"
  "class"
  "instance"
] @keyword

[
  ">"
  ">="
  "<"
  "<="
  "="
  "!="
  "+"
  "-"
  "*"
  "/"
  "%"
  "|>"
  "&&"
  "||"
  "..="
  ".."
  "."
  "!"
] @operator

[
  "("
  ")"
  "{"
  "}"
] @punctuation.bracket

[
  ";"
  "|"
  ","
  "->"
  "=>"
  ":"
  "::"
] @punctuation.delimiter

(int_type) @type.builtin
(bool_type) @type.builtin
(char_type) @type.builtin

"_" @constant.builtin
