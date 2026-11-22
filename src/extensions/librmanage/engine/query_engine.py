"""
query_engine.py — Calibre Boolean & Faceted Query Engine
Implements eLibrary Manager / Calibre search expressions:
  tags:"=LitRPG" and not tags:"=slow-burn" and series:"=Dungeon Crawler Carl"
Also supports custom metadata fields (#warnings, #fandom, #zettelkasten_id).
"""

import re
from typing import List, Dict, Any


class QueryEngine:
    @staticmethod
    def evaluate_expression(book: Dict[str, Any], query_str: str) -> bool:
        """
        Evaluates a Calibre-style search expression against a book dictionary.
        Supports:
          - field:"=Exact Value" or field:"~Substr"
          - and / or / not
          - direct token substring matching
        """
        if not query_str or not query_str.strip():
            return True

        tokens = re.findall(r'(\bnot\b|\band\b|\bor\b|[\w#]+:"[^"]+"|\S+)', query_str, re.IGNORECASE)
        if not tokens:
            return True

        # Process clauses
        current_op = "and"
        invert = False
        overall_match = True

        for token in tokens:
            lower = token.lower()
            if lower == "and":
                current_op = "and"
                continue
            elif lower == "or":
                current_op = "or"
                continue
            elif lower == "not":
                invert = True
                continue

            # Evaluate token
            matched = QueryEngine._match_clause(book, token)
            if invert:
                matched = not matched
                invert = False

            if current_op == "and":
                overall_match = overall_match and matched
            elif current_op == "or":
                overall_match = overall_match or matched

        return overall_match

    @staticmethod
    def _match_clause(book: Dict[str, Any], clause: str) -> bool:
        field_match = re.match(r'^([\w#]+):"(=|~)?([^"]+)"$', clause)
        if field_match:
            field = field_match.group(1).lower().lstrip("#")
            exact = field_match.group(2) == "="
            val = field_match.group(3).lower()

            target_val = book.get(field)
            if target_val is None:
                return False

            if isinstance(target_val, list):
                if exact:
                    return any(str(item).lower() == val for item in target_val)
                return any(val in str(item).lower() for item in target_val)
            else:
                s_val = str(target_val).lower()
                return s_val == val if exact else val in s_val

        # Generic token match across title, author, series, tags
        raw = clause.lower().strip('"')
        if raw in book.get("title", "").lower():
            return True
        if raw in book.get("author", "").lower():
            return True
        if raw in str(book.get("series", "")).lower():
            return True
        if any(raw in str(t).lower() for t in book.get("tags", [])):
            return True
        if any(raw in str(w).lower() for t in book.get("warnings", [])):
            return True

        return False
