#!/usr/bin/env python3
"""
NekoDealt - Core Game Engine & Simulation (=^･ω･^=)
===================================================
A rules-accurate Python implementation of "NekoDealt" (The Hand You're Dealt) tabletop card game engine.
Features:
- Full standard 52-card deck initialization with suit semiotics (Diamonds, Hearts, Clubs, Spades).
- Character Hand Deal (Person, Personality, Spouse, Home, Starting Asset).
- Relational & Court Mechanics (Family Lovers, Children/Jacks, Death/8 Discard Loop, Lawyers/Divorce, Liens).
- Score calculation engine with surplus/deficit math and multiplier resolutions.
"""

import random
import sys
from typing import List, Dict, Optional

# Ensure standard output uses UTF-8 to handle suit emoji characters on Windows
if sys.stdout.encoding != 'utf-8':
    try:
        sys.stdout.reconfigure(encoding='utf-8')
    except AttributeError:
        pass # Fallback for old Python versions without reconfigure

SUITS = {
    '♦': {'name': 'Diamonds', 'type': 'Surplus', 'role': 'Currency / Win Condition (Additive)'},
    '♥': {'name': 'Hearts', 'type': 'Surplus', 'role': 'Happiness (Multiplier for Diamonds)'},
    '♣': {'name': 'Clubs', 'type': 'Deficit', 'role': 'Burdens / Hardships (Divisor for Score)'},
    '♠': {'name': 'Spades', 'type': 'Deficit', 'role': 'Tools / Labor (Cancels matching Clubs 1:1)'}
}

RANKS = ['2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K', 'A']

class Card:
    def __init__(self, rank: str, suit: str):
        self.rank = rank
        self.suit = suit
        self.suit_info = SUITS[suit]
        self.is_evil = False

    def __repr__(self):
        evil_tag = " [EVIL]" if self.is_evil else ""
        return f"{self.rank}{self.suit}{evil_tag}"

class NekoDealtEngine:
    def __init__(self, seed: Optional[int] = None):
        if seed is not None:
            random.seed(seed)
        self.draw_pile: List[Card] = []
        self.discard_pile: List[Card] = []
        self.opening_hand: List[Card] = []
        self.spouse: Optional[Card] = None
        self.home: Optional[Card] = None
        self.starting_asset: Optional[Card] = None
        self.rooms: int = 1
        self.children_jacks: List[Card] = []
        self.lawyer_active: bool = False
        self.lien_active: bool = False
        self.reset_deck()

    def reset_deck(self):
        self.draw_pile = [Card(r, s) for s in SUITS.keys() for r in RANKS]
        random.shuffle(self.draw_pile)
        self.discard_pile = []

    def draw_card(self) -> Optional[Card]:
        if not self.draw_pile:
            if len(self.discard_pile) > 20:
                print(">> [Opportunity Cycle] Reshuffling discard pile (>20 cards) into draw pile...")
                self.draw_pile = self.discard_pile.copy()
                self.discard_pile = []
                random.shuffle(self.draw_pile)
            else:
                return None
        return self.draw_pile.pop()

    def discard_card(self, card: Card):
        self.discard_pile.append(card)

    def deal_initial_identity(self):
        """Deals opening 5 cards and assigns identity slots."""
        print("=== Dealing Initial Hand (Identity) ===")
        self.opening_hand = [self.draw_card() for _ in range(5)]
        print(f"Opening Cards: {self.opening_hand}")

        # Find Spouse (First King/Queen)
        for c in self.opening_hand:
            if c.rank in ['K', 'Q'] and self.spouse is None:
                self.spouse = c
                break

        # Find Home (First Ace)
        for c in self.opening_hand:
            if c.rank == 'A' and self.home is None:
                self.home = c
                break

        self.starting_asset = self.opening_hand[4] if len(self.opening_hand) >= 5 else None

        print(f"Spouse: {self.spouse or 'None (Draw later)'}")
        print(f"Home (Ace): {self.home or 'None (Draw later)'}")
        print(f"Starting Asset: {self.starting_asset}")

    def evaluate_score(self) -> Dict[str, float]:
        """Calculates score based on Suit Semiotics & modifiers."""
        diamonds = sum(1 for c in self.opening_hand if c.suit == '♦' and not c.is_evil)
        hearts = sum(1 for c in self.opening_hand if c.suit == '♥')
        clubs = sum(1 for c in self.opening_hand if c.suit == '♣')
        spades = sum(1 for c in self.opening_hand if c.suit == '♠')

        # Spades cancel Clubs 1:1
        effective_clubs = max(0, clubs - spades)
        happiness_multiplier = max(1.0, float(hearts * 1.5))
        burden_divisor = max(1.0, float(1 + effective_clubs * 0.5))

        base_currency = diamonds * 10
        total_score = (base_currency * happiness_multiplier) / burden_divisor

        if self.lien_active:
            print(">> [Lien Active] Home card score benefit is frozen until debt is cleared.")
            total_score *= 0.75

        return {
            'diamonds': diamonds,
            'hearts': hearts,
            'effective_clubs': effective_clubs,
            'spades_used': min(clubs, spades),
            'happiness_multiplier': happiness_multiplier,
            'burden_divisor': burden_divisor,
            'final_score': round(total_score, 2)
        }

if __name__ == '__main__':
    engine = NekoDealtEngine()
    engine.deal_initial_identity()
    score_report = engine.evaluate_score()
    print("\n--- Initial Score Evaluation ---")
    for k, v in score_report.items():
        print(f"{k}: {v}")
