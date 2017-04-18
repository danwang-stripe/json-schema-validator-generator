// @flow
import jsonpointer from 'json-pointer';
import type {Context} from 'jsvg/types.js';
import Ast from 'jsvg/jsast/ast.js';
import type {JsAst} from 'jsvg/jsast/ast.js';

const ref = (schema: Object, symbol: string, context: Context): JsAst => {
  const {$ref} = schema;
  if ($ref && typeof $ref === 'string' && $ref.startsWith('#')) {
    const subSchema = jsonpointer.get(context.rootSchema, decodeURIComponent($ref.substring(1)));
    const fnSym = context.symbolForSchema(subSchema);
    return Ast.Return(Ast.Call(fnSym, symbol));
  } else {
    return Ast.Empty;
  }
};

export default ref;
