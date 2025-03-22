# Resume Upload API

A Node.js API for managing PDF resumes with TypeScript and Express.

## Features

- Upload PDF resumes (max 5MB)
- List all uploaded resumes
- Download specific resumes
- Delete resumes
- Type-safe implementation with TypeScript

## Setup

1. Install dependencies:
```bash
npm install
```

2. Create an `.env` file in the root directory:
```env
PORT=3000
```

3. Start the development server:
```bash
npm start
```

## API Endpoints

### Upload Resume
- **POST** `/api/resumes/upload`
- Content-Type: `multipart/form-data`
- Form field: `resume` (PDF file)
- Max file size: 5MB

### List Resumes
- **GET** `/api/resumes/list`
- Returns a list of all uploaded resumes with metadata

### Download Resume
- **GET** `/api/resumes/:filename`
- Downloads the specified resume

### Delete Resume
- **DELETE** `/api/resumes/:filename`
- Deletes the specified resume

## Example Usage

### Upload Resume
```bash
curl -X POST -F "resume=@path/to/your/resume.pdf" http://localhost:3000/api/resumes/upload
```

### List Resumes
```bash
curl http://localhost:3000/api/resumes/list
```

### Download Resume
```bash
curl http://localhost:3000/api/resumes/filename.pdf --output downloaded_resume.pdf
```

### Delete Resume
```bash
curl -X DELETE http://localhost:3000/api/resumes/filename.pdf
```
