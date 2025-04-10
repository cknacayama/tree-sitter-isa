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
(type_identifier) @type
((type_identifier) @variable
 (#lua-match? @variable "^[a-z_\']"))
(module_identifier) @namespace

(module_access
  (module_access member: (identifier) @namespace))
(class_access
  member: (identifier) @function)
(let_bind
  name: (identifier) @function
  parameter: (identifier) @variable.parameter)
(let_bind
  name: (identifier) @function
  bind: (lambda_expression))
(let_bind
  name: (module_access member: (identifier) @function)
  parameter: (identifier) @variable.parameter)
(let_bind
  name: (module_access member: (identifier) @function)
  bind: (lambda_expression))
(call_expression
  callee: (identifier) @function)
(call_expression
  callee: (identifier) @constructor
  (#lua-match? @constructor "^[A-Z]"))
(call_expression
  callee: (module_access
    member: (identifier) @function))
(constructor
  ctor: (identifier) @constructor)
(constructor_pattern
  ctor: (identifier) @constructor)
(lambda_expression
  parameter: (identifier) @variable.parameter)

(value_definition
	name: (identifier) @function
    (function_type))
(value_definition
	name: (module_access member: (identifier) @function)
    (function_type))

(binary_expression
	operator: "|>"
    rhs: (identifier) @function)

(binary_expression
	operator: "|>"
    rhs: (module_access member: (identifier) @function))
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

"not" @keyword.operator

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
  "."
  "::"
] @punctuation.delimiter

(int_type) @type.builtin
(bool_type) @type.builtin
(char_type) @type.builtin

"_" @constant.builtin
