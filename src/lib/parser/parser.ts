// okay, let's keep this on hold for a bit.
// I may have opened myself up to some annoying complications by supporting
// code generation for multiple platforms...
import { Scanner } from './scanner'
import { Chars } from './keys'
import { SyntaxKind } from './syntax';
import {
  SyntaxNode,
  SelectNode,
} from './ast'

// todo: map these to syntaxkinds, and all the other crazy unsupported
// keywords just map to SyntaxKind.miscKeyword

export class ParseTree {
  nodes: Array<SyntaxNode>
}

export class Parser {
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
          // 


        case SyntaxKind.createKeyword:
        case SyntaxKind.dropKeyword:

        default:
          break
      }

    }
  }

  private parseColumnList() {
    return undefined
  }

  private parseVariableDeclarationList() {
    // todo: expect @s and all that shiz
  }

  private parseExpected(kind: SyntaxKind) {
    const next = this.scanner.scan();
    if (next.kind !== kind) {
      // error?
    }
  }
  private parseOptional(kind: SyntaxKind) {
    const next = this.scanner.scan();
    if (next.kind !== kind) {
      // error?
    }
  }

  private parseSelect() {
    const node = <SelectNode>{
      start: this.scanner.getNodeStart(),
      kind: SyntaxKind.select_expession
    }
    // todo: perhaps this is too complex for the scanner... we don't have a terminal
    // to know when we're done scanning.
    node.columns = this.parseColumnList()
    node.into = this.parseOptional(SyntaxKind.into_expression)
    node.from = this.parseExpected(SyntaxKind.from_clause)
    // optional bits... todo
    node.where = this.parseOptional(SyntaxKind.where_clause)
    node.group_by = this.parseOptional(SyntaxKind.group_by)
    node.order_by = this.parseOptional(SyntaxKind.order_by)
    node.having = this.parseOptional(SyntaxKind.having_clause)

    return node
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
