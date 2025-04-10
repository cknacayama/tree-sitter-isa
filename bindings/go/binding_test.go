package tree_sitter_isa_test

import (
	"testing"

	tree_sitter "github.com/tree-sitter/go-tree-sitter"
	tree_sitter_isa "github.com/cknacayama/tree-sitter-isa/bindings/go"
)

func TestCanLoadGrammar(t *testing.T) {
	language := tree_sitter.NewLanguage(tree_sitter_isa.Language())
	if language == nil {
		t.Errorf("Error loading Isa grammar")
	}
}
