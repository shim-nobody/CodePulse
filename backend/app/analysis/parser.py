"""
CodePulse Python Source Parser & AST Extractor
"""
import ast
from typing import Dict, Any, List, Optional, Tuple

class ParseResult:
    def __init__(self, tree: Optional[ast.AST], error: Optional[str] = None, line: Optional[int] = None, column: Optional[int] = None):
        self.tree = tree
        self.error = error
        self.line = line
        self.column = column
        self.success = error is None

class PythonSourceParser:
    @staticmethod
    def parse(source_code: str) -> ParseResult:
        try:
            tree = ast.parse(source_code)
            return ParseResult(tree=tree)
        except SyntaxError as e:
            return ParseResult(
                tree=None,
                error=f"Syntax Error: {e.msg}",
                line=e.lineno,
                column=e.offset
            )
        except Exception as e:
            return ParseResult(
                tree=None,
                error=f"Parsing Error: {str(e)}"
            )

    @staticmethod
    def extract_functions(tree: ast.AST) -> List[ast.FunctionDef | ast.AsyncFunctionDef]:
        functions = []
        for node in ast.walk(tree):
            if isinstance(node, (ast.FunctionDef, ast.AsyncFunctionDef)):
                functions.append(node)
        return functions

    @staticmethod
    def extract_classes(tree: ast.AST) -> List[ast.ClassDef]:
        classes = []
        for node in ast.walk(tree):
            if isinstance(node, ast.ClassDef):
                classes.append(node)
        return classes
