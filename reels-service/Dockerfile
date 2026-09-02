FROM python:3.11-slim

WORKDIR /app

# Install system dependencies
RUN apt-get update && apt-get install -y \
    gcc \
    libpq-dev \
    && rm -rf /var/lib/apt/lists/*

# Copy requirements first for better caching
COPY requirements.txt .

# Install Python dependencies
RUN pip install --no-cache-dir -r requirements.txt

# spaCy/Stanza model downloads - commented out along with the NLP packages
# in requirements.txt (see that file's comment; tokenization now runs
# locally via scripts/reels/backfill_tokens.py, not in this 512MB service).
# RUN python -m spacy download en_core_web_sm
# RUN python -c "import stanza; stanza.download('el')"

# Copy application code
COPY . .

# Expose port
EXPOSE 3600

# Run the application
CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "3600", "--reload"]
