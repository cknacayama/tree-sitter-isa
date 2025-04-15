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

/** 
 * @param {string | number} precedence
 * @param {RuleOrLiteral} op
 * @param {RuleOrLiteral} operand
 * @return {PrecLeftRule}  
 */
function binaryExpression(precedence, op, operand) {
  return prec.left(precedence, seq(field('lhs', operand), field('operator', op), field('rhs', operand)));
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
    $._type_identifier,
    $._module_identifier
  ],

  word: $ => $.identifier,

  rules: {
    source_file: $ => optional($.module_definitions),

    module_definitions: $ => startBy(
      sepBy1($._definition, ';'),
      $.module_declaration
    ),

    module_declaration: $ => seq(
      'module',
      $._module_identifier
    ),

    _definition: $ => choice(
      $.type_definition,
      $.value_definition,
      $.alias_definition,
      $.class_definition,
      $.instance_definition,
      $._expression,
    ),

    alias_definition: $ => seq(
      'alias',
      $._type_identifier,
      repeat($.identifier),
      '=',
      $._type
    ),

    class_definition: $ => seq(
      'class',
      optional($.constraint_set),
      $._type_identifier,
      $.identifier,
      optional(
        seq('=', sepBy1(choice($.value_definition, $.let_bind), ','))
      ),
    ),

    instance_definition: $ => seq(
      'instance',
      optional($.constraint_set),
      $._type_identifier,
      $._type,
      optional(
        seq('=', sepBy1($.let_bind, ','))
      ),
    ),

    constraint_set: $ => seq(
      '{',
      sepBy(seq(optional($._type_identifier), $.identifier), ','),
      '}',
      '=>'
    ),

    type_definition: $ => seq(
      'type',
      $._type_identifier,
      repeat($.identifier),
      '=',
      startBy(
        $.constructor,
        '|',
      )
    ),

    value_definition: $ => seq(
      'val',
      optional($.constraint_set),
      field('name', choice($.identifier, $.module_access)),
      repeat($.identifier),
      ':',
      $._type
    ),

    constructor: $ => seq(
      field('ctor', $.identifier),
      repeat($._simple_type),
    ),

    _type: $ => choice(
      $._primitive_type,
      $._simple_type,
      $.polymorphic_type,
      $.function_type,
    ),

    function_type: $ => seq(
      choice($._simple_type, $.polymorphic_type),
      '->',
      choice($.function_type, $._simple_type, $.polymorphic_type),
    ),

    polymorphic_type: $ => seq(
      $._simple_type,
      repeat1($._simple_type),
    ),

    _simple_type: $ => choice(
      $._primitive_type,
      $._type_identifier,
      $.tuple_type
    ),

    _primitive_type: $ => choice(
      $.bool_type,
      $.int_type,
      $.char_type,
    ),

    tuple_type: $ => seq(
      '(',
      sepBy($._type, ','),
      ')'
    ),

    bool_type: _ => 'bool',
    int_type: _ => 'int',
    char_type: _ => 'char',

    _expression: $ => choice(
      $._primary_expression,
      $.unary_expression,
      $.binary_expression,
      $.lambda_expression,
      $.call_expression,
      $.let_expression,
      $.if_expression,
      $.match_expression,
      $.module_access,
      $.class_access,
    ),

    _primary_expression: $ => prec(10, choice(
      $.identifier,
      $.integer_literal,
      $.boolean_literal,
      $.string_literal,
      $.character_literal,
      seq('(', sepBy($._expression, ','), ')'),
    )),

    let_bind: $ => seq(
      'let',
      field('name', choice($.identifier, $.module_access)),
      repeat(field('parameter', $._simple_pattern)),
      '=',
      field('bind', $._expression),
    ),

    let_expression: $ => prec.right(seq(
      $.let_bind,
      optional(seq('in', $._expression))
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
      'fn',
      field('parameter', $.identifier),
      '->',
      $._expression
    ),

    call_expression: $ => prec.left(seq(
      field('callee', choice(
        $.call_expression,
        $.module_access,
        $.class_access,
        $._primary_expression),
      ),
      field('argument', $._primary_expression),
    )),

    unary_expression: $ => prec.right(choice(
      seq('-', $._expression),
      seq('!', $._expression)
    )),

    binary_expression: $ => choice(
      binaryExpression(1, '|>', $._expression),
      binaryExpression(2, '||', $._expression),
      binaryExpression(3, '&&', $._expression),
      binaryExpression(4, '>', $._expression),
      binaryExpression(4, '>=', $._expression),
      binaryExpression(4, '<', $._expression),
      binaryExpression(4, '<=', $._expression),
      binaryExpression(4, '=', $._expression),
      binaryExpression(4, '!=', $._expression),
      binaryExpression(5, '+', $._expression),
      binaryExpression(5, '-', $._expression),
      binaryExpression(6, '*', $._expression),
      binaryExpression(6, '/', $._expression),
      binaryExpression(6, '%', $._expression),
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
      $.or_pattern,
    ),

    _simple_pattern: $ => prec(10, choice(
      $._literal_pattern,
      $.identifier,
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

    range_integer_literal: $ => choice(
      seq(
        optional('-'),
        $.integer_literal,
      ),
      $.character_literal
    ),

    range_exclusive_pattern: $ => seq(
      $.range_integer_literal,
      '..',
      $.range_integer_literal
    ),

    range_from_pattern: $ => seq(
      $.range_integer_literal,
      '..',
    ),

    range_to_exclusive_pattern: $ => seq(
      '..',
      $.range_integer_literal,
    ),

    range_to_inclusive_pattern: $ => seq(
      '..=',
      $.range_integer_literal,
    ),

    range_inclusive_pattern: $ => seq(
      $.range_integer_literal,
      '..=',
      $.range_integer_literal
    ),

    constructor_pattern: $ => seq(
      field('ctor',
        $.identifier
      ),
      repeat($._simple_pattern),
    ),

    _literal_pattern: $ => choice(
      $.integer_literal,
      $.boolean_literal,
      $.string_literal,
      $.character_literal,
    ),

    module_access: $ => seq(
      choice(
        $._module_identifier,
        $.module_access,
      ),
      '.',
      field('member', $.identifier),
    ),

    class_access: $ => seq(
      $._type_identifier,
      '::',
      field('member', $.identifier),
    ),

    _type_identifier: $ => alias($.identifier, $.type_identifier),
    _module_identifier: $ => alias($.identifier, $.module_identifier),

    boolean_literal: _ => choice(
      'true',
      'false'
    ),

    identifier: _ => /[a-zA-Z_][a-zA-Z0-9_]*/,

    integer_literal: _ => /\d+/,

    string_literal: $ => seq(
      '"',
      repeat(choice(
        /[^"\\\n]+/,
        $.escape_sequence,
      )),
      token.immediate('"'),
    ),

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
