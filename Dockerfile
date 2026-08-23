FROM node:20-alpine AS frontend-build
WORKDIR /app/frontend
COPY frontend/package*.json ./
RUN npm ci
COPY frontend/ ./
RUN npm run build

FROM python:3.12-slim
WORKDIR /app
ENV PYTHONUNBUFFERED=1
COPY requirements.txt ./
RUN pip install --no-cache-dir -r requirements.txt
COPY backend/ ./backend/
COPY data/sample_syllabus.json ./data/sample_syllabus.json
COPY assets/ ./assets/
COPY --from=frontend-build /app/frontend/dist ./frontend/dist
EXPOSE 8501
CMD ["uvicorn", "backend.app:app", "--host", "0.0.0.0", "--port", "8501"]
