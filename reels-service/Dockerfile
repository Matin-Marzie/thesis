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

# spaCy's English model isn't on PyPI - downloaded separately (lemmatizer.py).
RUN python -m spacy download en_core_web_sm

# Stanza's Greek model (lemmatizer.py) - noticeably more accurate than
# spaCy's small Greek model. Farsi uses hazm, which needs no model download.
RUN python -c "import stanza; stanza.download('el')"

# Copy application code
COPY . .

# Expose port
EXPOSE 3600

# Run the application
CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "3600", "--reload"]
