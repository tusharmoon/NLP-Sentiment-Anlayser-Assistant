from fastapi import (
    FastAPI,
    UploadFile,
    File,
    HTTPException
)

from fastapi.middleware.cors import CORSMiddleware

from fastapi.staticfiles import StaticFiles

from pydantic import BaseModel

import pandas as pd

import io

from backend.marketing import (
    analyze_sentiment,
    analyze_dataset
)


# ============================================================
# APP
# ============================================================

app = FastAPI(
    title="Marketing NLP Intelligence Lab",
    description="Marketing intelligence using NLP",
    version="2.0"
)


# ============================================================
# CORS
# ============================================================

app.add_middleware(
    CORSMiddleware,

    allow_origins=["*"],

    allow_credentials=True,

    allow_methods=["*"],

    allow_headers=["*"],
)


# ============================================================
# REQUEST MODEL
# ============================================================

class ReviewRequest(BaseModel):

    text: str


# ============================================================
# HEALTH CHECK
# ============================================================

@app.get("/api/health")
def health_check():

    return {

        "status": "running",

        "message":
            "Marketing NLP Intelligence Lab is running"

    }


# ============================================================
# SINGLE REVIEW SENTIMENT
# ============================================================

@app.post("/api/marketing/sentiment")
def marketing_sentiment(
    request: ReviewRequest
):

    if not request.text.strip():

        raise HTTPException(
            status_code=400,
            detail="Review text cannot be empty."
        )

    return analyze_sentiment(
        request.text
    )


# ============================================================
# CSV ANALYSIS
# ============================================================

@app.post("/api/marketing/analyze-csv")
async def analyze_csv(
    file: UploadFile = File(...)
):

    if not file.filename:

        raise HTTPException(
            status_code=400,
            detail="No file selected."
        )

    if not file.filename.lower().endswith(".csv"):

        raise HTTPException(
            status_code=400,
            detail="Please upload a CSV file."
        )

    try:

        contents = await file.read()

        if not contents:

            raise HTTPException(
                status_code=400,
                detail="The uploaded CSV is empty."
            )

        df = pd.read_csv(
            io.BytesIO(contents)
        )

    except HTTPException:
        raise

    except Exception as e:

        raise HTTPException(
            status_code=400,
            detail=f"Unable to read CSV: {str(e)}"
        )

    # --------------------------------------------------------
    # REQUIRED COLUMN
    # --------------------------------------------------------

    if "review" not in df.columns:

        raise HTTPException(
            status_code=400,
            detail=(
                "CSV must contain a 'review' column. "
                "Example columns: review_id, customer, "
                "product, rating, review."
            )
        )

    if df.empty:

        raise HTTPException(
            status_code=400,
            detail="The CSV does not contain any records."
        )

    # --------------------------------------------------------
    # ANALYZE
    # --------------------------------------------------------

    try:

        results = analyze_dataset(df)

    except Exception as e:

        raise HTTPException(
            status_code=500,
            detail=f"Analysis failed: {str(e)}"
        )

    return results


# ============================================================
# FRONTEND
# ============================================================

app.mount(
    "/",
    StaticFiles(
        directory="frontend",
        html=True
    ),
    name="frontend"
)