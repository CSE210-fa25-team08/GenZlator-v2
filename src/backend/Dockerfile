# Use Python 3.10 slim image
FROM python:3.10-slim

# Install build dependencies for sentence-transformers and other packages
RUN apt-get update && apt-get install -y \
    gcc \
    g++ \
    make \
    && rm -rf /var/lib/apt/lists/*

# Set working directory
WORKDIR /app

# Set PYTHONPATH to /app so that 'src' is a top-level module
ENV PYTHONPATH=/app

# Copy requirements first for better caching
COPY src/backend/requirements.txt /app/src/backend/requirements.txt

# Install dependencies
RUN pip install --no-cache-dir -r /app/src/backend/requirements.txt

# Copy the entire project
COPY . /app/

# Expose the port FastAPI runs on
EXPOSE 8003

# Set the working directory to backend for uvicorn
WORKDIR /app/src/backend

# Run the FastAPI app
CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8003"]
