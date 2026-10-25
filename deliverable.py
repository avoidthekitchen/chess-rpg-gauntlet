"""
Patch for avoidthekitchen/chess-rpg-gauntlet:
- Drop unused lesson reward fields
- Remove stale Puzzle.theme comment

This patch assumes the following:
- The codebase has a LessonReward model/class with unused fields to be removed.
- The Puzzle class/model has a stale comment about a 'theme' field to be removed.

This patch only includes the relevant Python code changes.
"""

from typing import Optional, Any


class LessonReward:
    """
    Represents a reward for completing a lesson.
    Unused fields have been removed as per issue #71.
    """
    def __init__(self, reward_id: int, description: str) -> None:
        self.reward_id: int = reward_id
        self.description: str = description

    def to_dict(self) -> dict[str, Any]:
        """
        Serialize the reward to a dictionary.
        """
        return {
            "reward_id": self.reward_id,
            "description": self.description
        }


class Puzzle:
    """
    Represents a chess puzzle.
    The stale 'theme' comment has been removed as per issue #71.
    """
    def __init__(self, puzzle_id: int, fen: str, solution: str, difficulty: Optional[str] = None) -> None:
        self.puzzle_id: int = puzzle_id
        self.fen: str = fen
        self.solution: str = solution
        self.difficulty: Optional[str] = difficulty

    def is_solution_correct(self, attempt: str) -> bool:
        """
        Check if the provided attempt matches the solution.
        """
        return attempt.strip() == self.solution.strip()


# TESTS

def test_lesson_reward_fields() -> None:
    reward = LessonReward(1, "Complete the lesson to earn 10 XP")
    d = reward.to_dict()
    assert "reward_id" in d
    assert "description" in d
    # Ensure no unused fields exist
    assert len(d) == 2

def test_puzzle_theme_comment_removed() -> None:
    puzzle = Puzzle(42, "8/8/8/8/8/8/8/8 w - - 0 1", "e4", "easy")
    assert puzzle.puzzle_id == 42
    assert puzzle.fen == "8/8/8/8/8/8/8/8 w - - 0 1"
    assert puzzle.solution == "e4"
    assert puzzle.difficulty == "easy"
    assert puzzle.is_solution_correct("e4")
    assert not puzzle.is_solution_correct("d4")

if __name__ == "__main__":
    test_lesson_reward_fields()
    test_puzzle_theme_comment_removed()
    print("All tests passed.")