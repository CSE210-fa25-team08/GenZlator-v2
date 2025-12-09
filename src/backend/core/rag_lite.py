import numpy as np
import json
from sentence_transformers import SentenceTransformer
from typing import List, Dict, Any, Optional
from ..vectorization.store import VectorStore
import os

class RAGLiteSystem:
    def __init__(
        self,
        store: VectorStore,
        model_name: str = "sentence-transformers/paraphrase-multilingual-MiniLM-L12-v2",  # A model can at least distinguish emojis and multilingual texts
        similarity_threshold: float = 0.7,
        max_similar_examples: int = 3,
    ):
        self.store = store
        self.similarity_threshold = similarity_threshold
        self.max_similar_examples = max_similar_examples

        # Initialize the sentence transformer model for embedding generation
        self.encoder = SentenceTransformer(model_name)

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
        # Prepared for storage interface
        embedding_list = embedding.tolist()

        metadata = {
            "timestamp": timestamp,
            "anonymous_id": anonymous_id,
            "rating": rating
        }

        self.store.add(original_input, correction_text, embedding_list, metadata) 

    def find_similar_feedbacks(self, query_text: str) -> List[Dict[str, Any]]:
        """Find similar feedbacks"""
        # Generate query embedding
        query_embedding = self.encoder.encode(query_text)

        # Fetch all vectors from store
        original_inputs, correction_texts, embeddings_matrix, ratings = self.store.fetch_all_vectors()

        if embeddings_matrix is None or len(embeddings_matrix) == 0:
            return []

        results = []
        
        # Calculate cosine similarity for each stored embeddings
        for i in range(len(original_inputs)):
            stored_embedding = embeddings_matrix[i]
            
            # Calculate cosine similarity
            similarity = self._cosine_similarity(query_embedding, stored_embedding)

            if similarity >= self.similarity_threshold:
                results.append(
                    {
                        "originalInput": original_inputs[i],
                        "correctionText": correction_texts[i],
                        "similarity": similarity,
                        "rating": ratings[i],
                    }
                )

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
