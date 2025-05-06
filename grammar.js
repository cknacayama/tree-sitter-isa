/**
 * @file Isa language grammar for tree-sitter
 * @author Cristiano Kenji <cristianonacayama@gmail.com>
 * @license MIT
 */

/// <reference types="tree-sitter-cli/dsl" />
// @ts-check

/** 
 * @param {RuleOrLiteral} rule
 * @param {RuleOrLiteral} sep
 * @return {SeqRule}  
 */
function sepBy1(rule, sep) {
  return seq(rule, repeat(seq(sep, rule)), optional(sep));
}

/** 
 * @param {RuleOrLiteral} rule
 * @param {RuleOrLiteral} sep
 * @return {ChoiceRule}  
 */
function sepBy(rule, sep) {
  return optional(sepBy1(rule, sep));
}

/** 
 * @param {RuleOrLiteral} rule
 * @param {RuleOrLiteral} sep
 * @return {SeqRule}  
 */
function startBy(rule, sep) {
  return seq(optional(sep), rule, repeat(seq(sep, rule)));
}

module.exports = grammar({
  name: "isa",

  extras: $ => [
    /\s+/,
    $.comment
  ],

  inline: $ => [
    $._simple_type,
    $._simple_pattern,
    $._root_identifier,
    $._module_identifier
  ],

  word: $ => $.identifier,

  rules: {
    source_file: $ => repeat($.module_definition),

    module_definition: $ => seq(
      $.module_declaration,
      repeat(seq($._definition, ';')),
    ),

    module_declaration: $ => seq(
      'module',
      optional('@'),
      $._module_identifier,
      optional(
        seq(
          'with',
          $.import_clause
        )
      ),
    ),

    import_clause: $ => seq(
      '{',
      sepBy($.import_identifier, ','),
      '}'
    ),

    import_identifier: $ => seq(
      $.path_identifier,
      optional(seq('::', $._import_multiple)),
    ),

    _import_multiple: $ => choice(
      $.import_clause,
      '_'
    ),

    _definition: $ => choice(
      $.type_definition,
      $.value_definition,
      $.alias_definition,
      $.class_definition,
      $.instance_definition,
      $.operator_definition,
      $.let_definition,
      $._expression,
    ),

    _fixity_definition: _ => choice(
      'infix',
      'infixl',
      'infixr',
      'prefix',
    ),

    operator_definition: $ => seq(
      $._fixity_definition,
      $.integer_literal,
      optional($.type_parameters),
      optional($.if_clause),
      '(', $.operator, ')',
      ':',
      $._type,
    ),

    alias_definition: $ => seq(
      'alias',
      $.identifier,
      repeat($.identifier),
      '=',
      $._type
    ),

    class_definition: $ => seq(
      'class',
      optional($.type_parameters),
      optional($.if_clause),
      $.identifier,
      repeat($.identifier),
      optional(seq(':', $._class_constraint)),
      optional(
        seq('=', sepBy1($._class_member, ','))
      ),
    ),

    instance_definition: $ => seq(
      'instance',
      optional($.type_parameters),
      optional($.if_clause),
      $._type,
      ':',
      $.class_projection,
      optional(
        seq('=', sepBy1($.let_definition, ','))
      ),
    ),

    type_parameters: $ => seq(
      '{',
      sepBy($._type_parameter, ','),
      '}',
    ),

    _type_parameter: $ => choice(
      $.identifier,
      seq($.identifier, ':', $._class_constraint),
    ),

    if_clause: $ => seq(
      'if',
      sepBy($.type_constraint, ','),
      '=>'
    ),

    _class_constraint: $ => choice(
      $.class_projection,
      seq('{', sepBy($.class_projection, ','), '}'),
    ),

    type_constraint: $ => seq(
      $._type,
      ':',
      $._class_constraint
    ),

    class_projection: $ => seq(
      $.path_identifier,
      repeat($._simple_type),
    ),

    _class_member: $ =>
      choice($.value_definition, $.let_definition, $.operator_definition),

    type_definition: $ => seq(
      'type',
      $.identifier,
      repeat($.identifier),
      '=',
      startBy(
        $.constructor,
        '|',
      )
    ),

    value_definition: $ => seq(
      'val',
      optional($.type_parameters),
      optional($.if_clause),
      field('name', $.identifier),
      repeat($.identifier),
      ':',
      field('value_type', $._type),
    ),

    constructor: $ => seq(
      $.identifier,
      repeat($._simple_type),
    ),

    _type: $ => choice(
      $._primitive_type,
      $._simple_type,
      $.parameterized_type,
      $.function_type,
    ),

    function_type: $ => seq(
      choice($._simple_type, $.parameterized_type),
      '->',
      choice($.function_type, $._simple_type, $.parameterized_type),
    ),

    parameterized_type: $ => seq(
      $.path_identifier,
      repeat1($._simple_type),
    ),

    _simple_type: $ => choice(
      $._primitive_type,
      $.path_identifier,
      $.tuple_type
    ),

    _primitive_type: $ => choice(
      $.bool_type,
      $.int_type,
      $.real_type,
      $.char_type,
    ),

    tuple_type: $ => seq(
      '(',
      sepBy($._type, ','),
      ')'
    ),

    bool_type: _ => 'bool',
    int_type: _ => 'int',
    real_type: _ => 'real',
    char_type: _ => 'char',

    _expression: $ => choice(
      $._primary_expression,
      $.prefix_expression,
      $.infix_expression,
      $.lambda_expression,
      $.call_expression,
      $.let_expression,
      $.if_expression,
      $.match_expression,
    ),

    _primary_expression: $ => prec(10, choice(
      $.path_identifier,
      $.number_literal,
      $.boolean_literal,
      $.string_literal,
      $.character_literal,
      $.list_literal,
      $.tuple_literal,
    )),

    tuple_literal: $ => seq(
      '(',
      choice(sepBy($._expression, ','), $.operator),
      ')'
    ),

    list_literal: $ => seq(
      '[',
      sepBy($._expression, ','),
      ']'
    ),

    let_definition: $ => seq(
      'let',
      field('name', $._symbol),
      repeat(field('parameter', $._simple_pattern)),
      '=',
      field('bind', $._expression),
    ),

    let_expression: $ => prec.right(seq(
      $.let_definition,
      seq('in', $._expression)
    )),

    if_expression: $ => seq(
      'if',
      $._expression,
      'then',
      $._expression,
      'else',
      $._expression,
    ),

    lambda_expression: $ => seq(
      '\\',
      field('parameter', $._simple_pattern),
      '->',
      $._expression
    ),

    call_expression: $ => prec.left(9, seq(
      field('callee',
        choice(
          $.call_expression,
          $._primary_expression,
        )
      ),
      field('argument', $._primary_expression),
    )),

    prefix_expression: $ => prec.right(seq($.operator, $._expression)),

    infix_expression: $ => prec.left(
      1,
      seq(
        $._expression, $.operator, $._expression
      )
    ),

    match_expression: $ => prec.right(seq(
      'match',
      $._expression,
      'with',
      sepBy1(
        seq(
          $._pattern,
          '->',
          $._expression,
        ),
        ',')
    )),

    _pattern: $ => choice(
      $._simple_pattern,
      $.constructor_pattern,
      $._range_pattern,
      $.list_pattern,
      $.or_pattern,
    ),

    list_pattern: $ => seq(
      '[',
      optional($._pattern),
      ']',
      optional(
        choice(
          $.list_pattern,
          $.identifier,
          '_'
        )
      ),
    ),

    _simple_pattern: $ => prec(10, choice(
      $.path_identifier,
      $._literal_pattern,
      $.tuple_pattern,
      '_',
    )),

    tuple_pattern: $ =>
      seq('(', sepBy($._pattern, ','), ')'),

    or_pattern: $ => prec.left(seq(
      $._pattern,
      '|',
      $._pattern,
    )),

    _range_pattern: $ => choice(
      $.range_inclusive_pattern,
      $.range_exclusive_pattern,
      $.range_to_exclusive_pattern,
      $.range_to_inclusive_pattern,
      $.range_from_pattern,
    ),

    range_exclusive_pattern: $ => seq(
      $._literal_pattern,
      '..',
      $._literal_pattern
    ),

    range_from_pattern: $ => seq(
      $._literal_pattern,
      '..',
    ),

    range_to_exclusive_pattern: $ => seq(
      '..',
      $._literal_pattern,
    ),

    range_to_inclusive_pattern: $ => seq(
      '..=',
      $._literal_pattern,
    ),

    range_inclusive_pattern: $ => seq(
      $._literal_pattern,
      '..=',
      $._literal_pattern
    ),

    constructor_pattern: $ => seq(
      field('ctor',
        $.path_identifier
      ),
      repeat1($._simple_pattern),
    ),

    _literal_pattern: $ => choice(
      seq(
        optional('-'),
        $.number_literal,
      ),
      $.boolean_literal,
      $.character_literal,
    ),

    path_identifier: $ => choice(
      $._root_identifier,
      seq($.path_identifier, '::', field('member', $.identifier)),
    ),

    _module_identifier: $ => alias($.identifier, $.module_identifier),
    _root_identifier: $ => alias($.identifier, $.root_identifier),

    boolean_literal: _ => choice(
      'true',
      'false'
    ),

    operator: _ => /[!?^$%&/*+.<=>|-]+/,

    identifier: _ => /[a-zA-Z_][a-zA-Z0-9_]*/,

    _symbol: $ => choice(
      seq('(', $.operator, ')'),
      $.identifier,
    ),

    number_literal: _ => /\d+(\.\d+)?/,

    integer_literal: _ => /\d+/,

    string_literal: $ => seq(
      '"',
      repeat(choice(
        $.string_content,
        $.escape_sequence,
      )),
      token.immediate('"'),
    ),

    string_content: _ => /[^"\\\n]+/,


    character_literal: $ => seq(
      '\'',
      choice(
        /[^'\\\n]/,
        $.escape_sequence,
      ),
      token.immediate('\''),
    ),

    escape_sequence: _ => /\\./,

    comment: _ => /\/\/.*/,
  }
});
