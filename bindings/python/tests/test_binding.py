from unittest import TestCase

import tree_sitter
import tree_sitter_isa


class TestLanguage(TestCase):
    def test_can_load_grammar(self):
        try:
            tree_sitter.Language(tree_sitter_isa.language())
        except Exception:
            self.fail("Error loading Isa grammar")
