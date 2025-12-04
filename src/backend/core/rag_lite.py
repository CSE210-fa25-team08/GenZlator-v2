import numpy as np
import json
import sqlite3
from pydantic import BaseModel
from sentence_transformers import SentenceTransformer
from typing import List, Dict, Any, Tuple, Optional
import os


class RAGLiteSystem:
    def __init__(
        self,
        db_path: str = "feedback_embeddings.db",
        model_name: str = "sentence-transformers/paraphrase-multilingual-MiniLM-L12-v2",  # A model can at least distinguish emojis and multilingual texts
        similarity_threshold: float = 0.7,
        max_similar_examples: int = 3,
    ):
        self.db_path = db_path
        self.similarity_threshold = similarity_threshold
        self.max_similar_examples = max_similar_examples

        # Initialize the sentence transformer model for embedding generation
        self.encoder = SentenceTransformer(model_name)

        # Initialize the database
        self._init_database()

    def _init_database(self):
        """Initialize SQLite database and create necessary tables"""
        conn = sqlite3.connect(self.db_path)
        cursor = conn.cursor()

        cursor.execute(
            """
            CREATE TABLE IF NOT EXISTS feedback_embeddings (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                original_input TEXT NOT NULL,
                correction_text TEXT NOT NULL,
                embedding BLOB NOT NULL,
                timestamp TEXT NOT NULL,
                anonymous_id TEXT,
                rating INTEGER,
                created_at DATETIME DEFAULT CURRENT_TIMESTAMP
            )
        """
        )

        conn.commit()
        conn.close()

    def add_feedback(
        self,
        original_input: str,
        correction_text: str,
        anonymous_id: str = None,
        rating: int = None,
        timestamp: str = None,
    ):
        """Add feedback to the RAG system"""
        # Generate embedding
        embedding = self.encoder.encode(original_input)
        embedding_blob = embedding.tobytes()

        conn = sqlite3.connect(self.db_path)
        cursor = conn.cursor()

        cursor.execute(
            """
            INSERT INTO feedback_embeddings 
            (original_input, correction_text, embedding, timestamp, anonymous_id, rating)
            VALUES (?, ?, ?, ?, ?, ?)
        """,
            (
                original_input,
                correction_text,
                embedding_blob,
                timestamp,
                anonymous_id,
                rating,
            ),
        )

        conn.commit()
        conn.close()

    def find_similar_feedbacks(self, query_text: str) -> List[Dict[str, Any]]:
        """Find similar feedbacks"""
        # Generate query embedding
        query_embedding = self.encoder.encode(query_text)

        conn = sqlite3.connect(self.db_path)
        cursor = conn.cursor()

        cursor.execute(
            """
            SELECT original_input, correction_text, embedding, rating
            FROM feedback_embeddings
            WHERE rating=0 and correction_text != ''
        """
        )

        results = []
        for row in cursor.fetchall():
            original_input, correction_text, embedding_blob, rating = row

            # Reconstruct embedding
            stored_embedding = np.frombuffer(embedding_blob, dtype=np.float32)

            # Calculate cosine similarity
            similarity = self._cosine_similarity(query_embedding, stored_embedding)

            if similarity >= self.similarity_threshold:
                results.append(
                    {
                        "originalInput": original_input,
                        "correctionText": correction_text,
                        "similarity": similarity,
                        "rating": rating,
                    }
                )

        conn.close()

        # Sort by similarity and limit the number of results
        results.sort(key=lambda x: x["similarity"], reverse=True)
        return results[: self.max_similar_examples]

    def _cosine_similarity(self, vec1: np.ndarray, vec2: np.ndarray) -> float:
        """Calculate cosine similarity"""
        dot_product = np.dot(vec1, vec2)
        norm1 = np.linalg.norm(vec1)
        norm2 = np.linalg.norm(vec2)

        if norm1 == 0 or norm2 == 0:
            return 0.0

        return dot_product / (norm1 * norm2)

    def load_feedback_from_jsonl(self, jsonl_path: str):
        """Load existing feedback from a JSONL file"""
        if not os.path.exists(jsonl_path):
            return

        with open(jsonl_path, "r", encoding="utf-8") as f:
            for line in f:
                try:
                    feedback = json.loads(line.strip())
                    self.add_feedback(
                        original_input=feedback.get("originalInput", ""),
                        correction_text=feedback.get("correctionText", ""),
                        anonymous_id=feedback.get("anonymousId"),
                        rating=feedback.get("rating"),
                        timestamp=feedback.get("timestamp"),
                    )
                except json.JSONDecodeError:
                    continue
