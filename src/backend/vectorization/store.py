from abc import ABC, abstractmethod
from typing import List, Dict, Any


class VectorStore(ABC):
    """Abstract interface of vector storage implementations"""

    @abstractmethod
    def add(self, text: str, correction_text: str, embedding: List[float], metadata: Dict[str, Any]) -> bool:
        """Store a vector record"""
        pass

    @abstractmethod
    def fetch_all_vectors(self) -> tuple[List[str], List[str], Any, List[int]]:
        """
        Fetch all vectors and metadata for in-memory calculations.
        Return (original_inputs, correction_texts, embeddings_matrix, ratings)
        """
        pass

    @abstractmethod
    def count(self) -> int:
        """Return total number of records"""
        pass

    @abstractmethod
    def get_recent(self, limit: int = 5) -> List[Dict[str, Any]]:
        """Return recent records, up to a number limit"""
        pass

    @abstractmethod
    def get_config(self) -> Dict[str, Any]:
        """Return database config details for debugging"""
        pass
