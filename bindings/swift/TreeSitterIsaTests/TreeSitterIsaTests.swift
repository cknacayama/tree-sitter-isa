import XCTest
import SwiftTreeSitter
import TreeSitterIsa

final class TreeSitterIsaTests: XCTestCase {
    func testCanLoadGrammar() throws {
        let parser = Parser()
        let language = Language(language: tree_sitter_isa())
        XCTAssertNoThrow(try parser.setLanguage(language),
                         "Error loading Isa grammar")
    }
}
