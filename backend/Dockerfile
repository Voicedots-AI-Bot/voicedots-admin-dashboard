# 1. Use an official, lightweight Python runtime as a parent image
FROM python:3.11-slim

# Install system dependencies needed to build psycopg2
RUN apt-get update && apt-get install -y \
    gcc \
    libpq-dev \
    && rm -rf /var/lib/apt/lists/*

# 2. Set the working directory inside the container
WORKDIR /app

# 3. Copy just the requirements file first (this helps Docker cache dependencies and build faster next time)
COPY requirements.txt .

# 4. Install Python dependencies
RUN pip install --no-cache-dir -r requirements.txt

# 5. Copy the rest of backend code into the container
COPY . .

# 6. Document the port the container will listen on
EXPOSE 8000

# 7. The command to run your server
CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000"]
