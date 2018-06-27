// okay, let's keep this on hold for a bit.
// I may have opened myself up to some annoying complications by supporting
// code generation for multiple platforms...
import { Scanner, Token } from './scanner'
import { Chars } from './keys'
import { SyntaxKind } from './syntax';

import {
  SyntaxNode,
  SelectStatement,
  IntoClause,
  FromClause,
  WhereClause,
  CaseExpression,
  VariableDeclarationStatement,
  VariableDeclaration,
  GoStatement,
  SetStatement,
  AssignmentOperator,
  PlusEqualsOperator,
  MinusEqualsOperator,
  DivEqualsOperator,
  MultiplyEqualsOperator,
  AndEqualsOperator,
  OrEqualsOperator,
  XorEqualsOperator,
  EqualsOperator,
  ValueExpression
} from './ast'

export interface ParseTree {
  nodes: Array<SyntaxNode>
}

export interface ParserError {
  message: string
  line: number
}

// todo: speculative lookahead stuff...
export class Parser {
  private errors: Array<ParserError>
  private scanner: Scanner
  private token: Token
  private settings: any;

  // parse the next statement in the list.
  private next(): SyntaxNode {
    this.token = this.scanner.scan()

    switch (this.token.kind) {

      case SyntaxKind.go_keyword:
        return this.parseGo();

      case SyntaxKind.declare_keyword:
        return this.parseVariableDeclarationList()

      case SyntaxKind.set_keyword:
        return this.parseSetStatement()

      case SyntaxKind.use_keyword:
        return this.parseUseDatabase();

      case SyntaxKind.select_keyword:
        return this.parseSelect()

      case SyntaxKind.insert_keyword:
      case SyntaxKind.update_keyword:
      case SyntaxKind.create_keyword:
      case SyntaxKind.drop_keyword:

      default:
        return undefined;
    }

  }

  private error(err: string) {
    this.errors.push({
      // is this gonna work?
      // we don't really support the error "spans",
      // we can just give a single position.
      message: err,
      line: this.scanner.getCurrentLine()
    })
  }

  private moveNext(): Token {
    return this.token = this.scanner.scan();
  }

  // parseX functions
  private parseColumnList() {
    return undefined
  }

  private parseVariableDeclarationList() {

    const statement = <VariableDeclarationStatement> this.createNode(this.token);

    this.expect(SyntaxKind.declare_keyword);
    statement.keyword = this.token;
    statement.declarations = [];

    this.moveNext();

    this.expect(SyntaxKind.local_variable_reference);

    const decl = <VariableDeclaration>{
      name: this.token.value
    };

    this.moveNext();

    if (this.token.kind === SyntaxKind.as_keyword) {
      decl.as = this.token.value
      this.moveNext();
    }

    if (this.token.kind === SyntaxKind.table_keyword) {

      decl.type = 'table'
      // todo:
      // decl.expression = this.parseTableVariableDecl();
      return statement;
    }


    // todo: parseType()
    // todo: parseEqualsExpression
    // todo: , and loop back around.
  }

  private createNode(token: Token): SyntaxNode {
    return {
      start: token.start,
      end: token.end,
      kind: token.kind
    }
  }

  private expect(kind: SyntaxKind) {
    if (this.token.kind !== kind) {
      this.error('Expected ' + kind + ' but found ' + this.token.kind);
    }
  }

  private parseExpected(kind: SyntaxKind, cb): SyntaxNode {
    if (this.token.kind === kind) {
      return cb(this.createNode(this.token));
    }
    this.error('Expected ' + kind + ' but found ' + this.token.kind);
  }

  private parseOptional(kind: SyntaxKind, cb): SyntaxNode {
    if (this.token.kind === kind) {
       return cb(this.createNode(this.token));
    }
  }

  private parseGo(): SyntaxNode {
    const statement = <GoStatement> this.createNode(this.token)

    this.moveNext();
    if (this.token.kind === SyntaxKind.numeric_literal) {
      statement.count = this.token.value
      this.moveNext()
    }

    return statement;
  }

  private parseSetStatement(): SyntaxNode {
    const statement = <SetStatement> this.createNode(this.token)
    statement.keyword = this.token;

    this.moveNext()

    this.expect(SyntaxKind.local_variable_reference);
    statement.name = this.token.value;

    statement.op = this.parseAssignmentOperation();
    statement.expression = this.parseValueExpression()

    return undefined;
  }

  private parseValueExpression(): ValueExpression {
    return undefined;
  }

  private parseAssignmentOperation(): AssignmentOperator {
    this.moveNext();

    switch (this.token.kind) {
      case SyntaxKind.equal:
        return <EqualsOperator> this.createNode(this.token)

      case SyntaxKind.plusEqualsAssignment:
        return <PlusEqualsOperator> this.createNode(this.token)

      case SyntaxKind.minusEqualsAssignment:
        return <MinusEqualsOperator> this.createNode(this.token)

      case SyntaxKind.divEqualsAssignment:
        return <DivEqualsOperator> this.createNode(this.token)

      case SyntaxKind.mulEqualsAssignment:
        return <MultiplyEqualsOperator> this.createNode(this.token)

      case SyntaxKind.bitwiseAndAssignment:
        return <AndEqualsOperator> this.createNode(this.token)

      case SyntaxKind.bitwiseOrAssignment:
        return <OrEqualsOperator> this.createNode(this.token)

      case SyntaxKind.bitwiseXorAssignment:
        return <XorEqualsOperator> this.createNode(this.token)

      default:
        this.error('Expected assignment operator (=, +=, -= etc...)')
    }
  }

  private parseUseDatabase() {
    return undefined;
  }

  private parseSelect() {
    const node = <SelectStatement> this.createNode(this.token);

    // todo: perhaps this is too complex for the scanner... we don't have a terminal
    // to know when we're done scanning.
    node.columns = this.parseColumnList()
    node.into = <IntoClause>this.parseOptional(SyntaxKind.into_expression, this.parseInto)
    node.from = <FromClause>this.parseExpected(SyntaxKind.from_clause, this.parseFrom)
    node.where = <WhereClause>this.parseOptional(SyntaxKind.where_clause, this.parseWhere)
    // node.group_by = this.parseOptional(SyntaxKind.group_by)
    // node.order_by = this.parseOptional(SyntaxKind.order_by)
    // does having go with the group-by?
    // node.having = this.parseOptional(SyntaxKind.having_clause)
    // todo: full-text index support.
    // node.contains freetext etc.

    return node
  }

  private parseInto(): IntoClause {
    return undefined
  }

  private parseFrom(): FromClause {
    return undefined
  }

  private parseWhere(node): WhereClause {
    return undefined
  }

  /**
   * Parse a given sql string into a tree.
   *
   * @param script the script to parse.
   * @returns a list of statements within the script.
   */
  parse(script, info): ParseTree {
    this.settings = Object.assign({ skipTrivia: true }, info);

    this.scanner = new Scanner(script, this.settings);
    const tree = {
      nodes: []
    };

    let node = undefined;
    while (node = this.next()) {
      tree.nodes.push(node);
    }

    return tree;
  }
};
