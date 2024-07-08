# Groove IT - Backend

## Prerequisites

Before running the application, ensure you have the following tools installed:
- Python 3.7+
- pip (Python package installer)

## Installation

1. **Clone the repository:**

    ```bash
    git clone <repository-url>
    cd <repository-directory>
    ```

2. **Install dependencies:**

    ```bash
    pip install -r requirements.txt
    ```

## API Keys

This application requires API keys for several services. Make sure you have the API keys for the following services:

- Cloudinary
- Redis
- Huggingface
- Gemini

## Configuration

Create a `.env` file in the root directory of the project and add your API keys. The `.env` file should look like this: You can replicate the env_template.txt file.

## Running the Application

To run the FastAPI application, use the following command:

```bash
uvicorn main:app --reload
```

The `--reload` flag is useful during development as it will automatically reload the server when code changes.

## Accessing the Application

Once the server is running, you can access the application at `http://127.0.0.1:8000`. The interactive API documentation is available at `http://127.0.0.1:8000/docs`.

## Additional Information

For more information about using FastAPI, refer to the [FastAPI documentation](https://fastapi.tiangolo.com/).
