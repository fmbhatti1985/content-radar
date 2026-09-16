FROM python:3.11-slim

WORKDIR /app

# Install system dependencies (ffmpeg is often needed for yt-dlp)
RUN apt-get update && apt-get install -y ffmpeg && rm -rf /var/lib/apt/lists/*

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY . .

# Run the FastAPI app on port 7860 (Hugging Face default) or Render/Koyeb defaults
ENV PORT=7860
EXPOSE 7860

CMD ["sh", "-c", "uvicorn app.main:app --host 0.0.0.0 --port "]
