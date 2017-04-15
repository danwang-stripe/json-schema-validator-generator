// @flow
/* eslint-disable no-use-before-define */
import _ from 'lodash';
import type {
  JsAst, IfType, ForType, ForInType, Function1Type,
} from './ast.js';
import getVars from './get-vars.js';

const indent = (line: string, depth: number) => `${_.repeat('  ', depth)}${line}`;

const renderIf = (ast: IfType, depth: number) => {
  const {predicate, body, elseBody} = ast;

  const elseString = render(elseBody, depth + 1);
  const elseLines = elseString ? [
    indent('} else {', depth),
    elseString,
  ] : [];
  return [
    indent(`if (${render(predicate)}) {`, depth),
    render(body, depth + 1),
    ...elseLines,
    indent('}', depth),
  ].join('\n');
};

const renderFor = (ast: ForType, depth: number) => {
  const {init, condition, loop, body} = ast;
  return [
    indent(`for (${render(init)}; ${render(condition)}; ${render(loop)}) {`, depth),
    render(body, depth + 1),
    indent('}', depth),
  ].join('\n');
};

const renderForIn = (ast: ForInType, depth: number) => {
  const {variable, iterator, body} = ast;
  return [
    indent(`for (var ${variable} in ${render(iterator)}) {`, depth),
    render(body, depth + 1),
    indent('}', depth),
  ].join('\n');
};

const renderFunction = (ast: Function1Type, depth: number) => {
  const {argument, body} = ast;
  const vars = getVars(body);
  const varLines = vars.length === 0 ? [] : [
    indent(`var ${vars.join(', ')};`, depth + 1),
  ];
  const prefix = ast.name ? `function ${ast.name}` : 'function';
  return [
    indent(`${prefix}(${argument}) {`, depth),
    ...varLines,
    render(body, depth + 1),
    indent('}', depth),
  ].join('\n');
};

const render = (ast: JsAst, depth: number = 0) => {
  switch (ast.type) {
    case 'assignment':
      return indent(`${ast.variable} = ${render(ast.value)};`, depth);
    case 'if':
      return renderIf(ast, depth);
    case 'return':
      return indent(`return ${render(ast.value)};`, depth);
    case 'body':
      return _.map(ast.body, (s) => render(s, depth)).join('\n');
    case 'for':
      return renderFor(ast, depth);
    case 'forin':
      return renderForIn(ast, depth);
    case 'empty':
      return '';
    case 'function1':
      return renderFunction(ast, depth);
    case 'binop':
      return `${render(ast.left, depth)} ${ast.comparator} ${render(ast.right, depth)}`;
    case 'literal':
      return indent(ast.value, depth);
    default:
      throw new Error(`Unexpected AST: ${ast}`);
  }
};

export default render;