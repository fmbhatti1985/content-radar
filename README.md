# ContentRadar

Find content gaps across social platforms. A SaaS application that analyzes a creator's recent public videos and searches for matching or near-matching content on other supported platforms.

## Architecture
- **Frontend**: Next.js, React, Tailwind CSS
- **Backend**: FastAPI, Celery, SQLAlchemy, Postgres (pgvector)

## Local Development

### Prerequisites
- Node.js (v18+)
- Python (3.11+)
- Docker & Docker Compose

### Setup

1. **Start Services**
   ```bash
   docker-compose up -d
   ```

2. **Environment Variables**
   Copy `.env.example` to `backend/.env` and `frontend/.env.local`.

3. **Backend**
   ```bash
   cd backend
   python -m venv venv
   source venv/bin/activate  # or venv\Scripts\activate on Windows
   pip install -r requirements.txt
   alembic upgrade head
   fastapi dev main.py
   ```

4. **Frontend**
   ```bash
   cd frontend
   npm install
   npm run dev
   ```
