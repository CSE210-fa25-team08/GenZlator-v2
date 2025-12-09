import sqlite3
import json
import numpy as np
from typing import List, Dict, Any
from ..store import VectorStore

class SQLiteVectorStore(VectorStore):
    def __init__(self, db_path: str):
        self.db_path = db_path
        self._init_db()

    def _get_conn(self):
        return sqlite3.connect(self.db_path)

    def _init_db(self):
        """Initialize SQLite database and create necessary tables"""
        conn = self._get_conn()
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

    def add(self, text: str, correction_text: str, embedding: List[float], metadata: Dict[str, Any]) -> bool:
        try:
            # Convert embedding to bytes
            embedding_blob = np.array(embedding, dtype=np.float32).tobytes()
            
            # Extract metadata
            timestamp = metadata.get("timestamp")
            anonymous_id = metadata.get("anonymous_id")
            rating = metadata.get("rating")

            conn = self._get_conn()
            cursor = conn.cursor()

            cursor.execute(
                """
                INSERT INTO feedback_embeddings 
                (original_input, correction_text, embedding, timestamp, anonymous_id, rating)
                VALUES (?, ?, ?, ?, ?, ?)
                """,
                (
                    text,
                    correction_text,
                    embedding_blob,
                    timestamp,
                    anonymous_id,
                    rating,
                ),
            )

            conn.commit()
            conn.close()
            return True
        
        except Exception as e:
            print(f"SQLite Store Error: {e}")
            return False

    def fetch_all_vectors(self) -> tuple[List[str], List[str], Any, List[int]]:
        """
        Fetch all vectors and metadata for in-memory calculation.
        Returns: (original_inputs, correction_texts, embeddings_matrix, ratings)
        """
        original_inputs, correction_texts, embeddings_list, ratings = [], [], [], []
        
        conn = self._get_conn()
        cursor = conn.cursor()

        # Only select valid feedbacks
        cursor.execute(
            """
            SELECT original_input, correction_text, embedding, rating
            FROM feedback_embeddings
            WHERE rating=0 and correction_text != ''
            """
        )
        
        for row in cursor.fetchall():
            original_input, correction_text, embedding_blob, rating = row
            
            original_inputs.append(original_input)
            correction_texts.append(correction_text)
            embeddings_list.append(np.frombuffer(embedding_blob, dtype=np.float32))
            ratings.append(rating)

        conn.close()

        if not embeddings_list:
            return [], [], None, []

        embeddings_matrix = np.vstack(embeddings_list)
        
        return original_inputs, correction_texts, embeddings_matrix, ratings

    def count(self) -> int:
        conn = self._get_conn()
        cursor = conn.cursor()
        count = cursor.execute("SELECT COUNT(*) FROM feedback_embeddings").fetchone()[0]
        conn.close()
        
        return count

    def get_recent(self, limit: int = 5) -> List[Dict[str, Any]]:
        conn = self._get_conn()
        cursor = conn.cursor()
        
        cursor.execute(
            """
            SELECT original_input, correction_text, rating 
            FROM feedback_embeddings 
            ORDER BY created_at DESC 
            LIMIT ?
            """, (limit,)
        )
        
        recent_records = cursor.fetchall()
        conn.close()
        
        return [
            {"originalInput": r[0], "correctionText": r[1], "rating": r[2]}
            for r in recent_records
        ]

    def get_config(self) -> Dict[str, Any]:
        return {
            "database_path": self.db_path
        }
