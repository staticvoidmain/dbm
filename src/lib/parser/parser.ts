// okay, let's keep this on hold for a bit.
// I may have opened myself up to some annoying complications by supporting
// code generation for multiple platforms...
import { Scanner, Token } from './scanner'
import { Chars } from './keys'
import { SyntaxKind } from './syntax';

import {
  SyntaxNode,
  SelectNode,
  IntoClause,
  FromClause,
  WhereClause,
  CaseExpression
} from './ast'

export interface ParseTree {
  nodes: Array<SyntaxNode>
}

export interface ParserError {
  message: string
  line: number
}

export class Parser {
  private errors: Array<ParserError>
  private scanner: Scanner

  private next(): SyntaxNode {

    const statements = []

    while (true) {
      const token = this.scanner.scan()

      switch (token.kind) {
        case SyntaxKind.useKeyword:
        // todo: parse the database if this is mssql.
        case SyntaxKind.declareKeyword:
          this.parseVariableDeclarationList()

        case SyntaxKind.selectKeyword:
          this.parseSelect()
        case SyntaxKind.insertKeyword:
          // mssql supports these two styles of insert (and probably more)
          // todo: insert into X values (xyz)
          // todo: insert X select Y from Z

        case SyntaxKind.updateKeyword:
        case SyntaxKind.createKeyword:
        case SyntaxKind.dropKeyword:

        default:
          break
      }

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

  private parseColumnList() {
    return undefined
  }

  private parseVariableDeclarationList() {
    // todo: expect @s and all that shiz
  }

  private createNode(token: Token): SyntaxNode {
    return {
      start: token.start,
      end: token.end,
      kind: token.kind
    }
  }

  private parseExpected(kind: SyntaxKind, cb): SyntaxNode {
    const next = this.scanner.scan();
    if (next.kind === kind) {
      return cb(this.createNode(next));
    }
    this.error('Expected ' + kind + ' but found ' + next.kind);
  }
  
  private parseOptional(kind: SyntaxKind, cb): SyntaxNode {
    const next = this.scanner.scan();
    if (next.kind === kind) {
       return cb(this.createNode(next));
    }
  }

  private parseSelect() {
    const node = <SelectNode>{
      start: this.scanner.getTokenStart(),
      kind: SyntaxKind.select_expession
    }
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
  
  private parseWhere(): WhereClause {
    return undefined
  }

  /**
   * Parse a given sql string into a tree.
   *
   * @param script the script to parse.
   * @returns a list of statements within the script.
   */
  parse(script, info): ParseTree {
    this.scanner = new Scanner(script, { skipTrivia: true });

    return undefined

    /*
    // this is sync CPU bound
    this.scan(script)
    while (true) {
      const token = this.next()

      // push things into the array of statements.
      // todo: handle all the tokens.
    }

    // return statements

    */
  }
};
