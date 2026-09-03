# Marketing Intelligence Lab 🚀
### Intelligent Customer Review Analytics & Marketing Insight Platform

[![Python](https://img.shields.io/badge/Python-3.9%2B-blue.svg)](https://www.python.org/)
[![FastAPI](https://img.shields.io/badge/FastAPI-0.100%2B-009688.svg)](https://fastapi.tiangolo.com/)
[![VADER Sentiment](https://img.shields.io/badge/NLP-VADER%20%7C%20NMF%20%7C%20TF--IDF-orange.svg)](https://github.com/cjhutto/vaderSentiment)
[![Chart.js](https://img.shields.io/badge/Frontend-Vanilla%20JS%20%7C%20Chart.js-yellow.svg)](https://www.chartjs.org/)
[![License](https://img.shields.io/badge/License-MIT-green.svg)](LICENSE)

An end-to-end, full-stack **Marketing Intelligence & Customer Voice Analytics Platform**. Built with **FastAPI** on the backend and an interactive SPA (Single Page Application) frontend, this application empowers marketing, product, and customer success teams to upload raw customer feedback (CSV files) or single reviews and immediately transform them into actionable strategic insights.

---

## 🌟 Key Features

- **📊 Comprehensive Executive Overview**: High-level KPIs including total review volume, positive/negative sentiment splits, and average customer rating.
- **🔍 Sentiment Intelligence (VADER)**: Fast, rule-based sentiment scoring powered by VADER (Valence Aware Dictionary and sEntiment Reasoner), generating compound polarity scores and positive/negative/neutral confidence levels.
- **🏷️ Topic Modeling (NMF & TF-IDF)**: Automatically groups unstructured customer feedback into thematic clusters using Non-Negative Matrix Factorization (NMF) and TF-IDF n-grams to identify dominant conversation drivers.
- **🔑 Keyword & Vocabulary Analytics**: Extracts top TF-IDF keywords along with sentiment-specific vocabulary clouds to pinpoint precise customer language patterns.
- **💡 Automated Business Recommendations**: Algorithmic decision support engine that translates sentiment splits, topic mentions, and critical keyword thresholds into high-priority risks, opportunities, and recommended actions.
- **📑 Review Explorer**: Multi-criteria filtering engine allowing users to search customer feedback by keywords, sentiment classification, or star ratings.
- **🧪 Real-time Review Playground**: Interactive single-review analyzer to test model predictions and VADER compound scores on custom text inputs on the fly.

---

## 🛠️ Architecture & Tech Stack

### **Backend (Python / FastAPI)**
- **Framework**: `FastAPI` for high-performance RESTful APIs, auto-generated docs, and static file serving.
- **Sentiment Engine**: `vaderSentiment` for rule-based compound sentiment scoring.
- **Topic Extraction & Vectorization**: `scikit-learn` (`TfidfVectorizer`, `CountVectorizer`, `NMF` topic decomposition).
- **Data Wrangling**: `pandas` & `numpy` for data ingestion, filtering, and aggregation.

### **Frontend (Vanilla JS / HTML5 / CSS3)**
- **UI Framework**: Pure vanilla HTML5, custom CSS (flexbox/grid layout), and async JavaScript (Fetch API).
- **Data Visualization**: `Chart.js` for interactive doughnut and bar chart renderings.
- **Icons & Typography**: FontAwesome 6, Inter font family.

---

## 📂 Repository Structure

```text
marketing-intelligence-lab/
├── backend/
│   ├── __init__.py
│   └── marketing.py        # Core NLP logic (VADER, TF-IDF, NMF, Business Rules)
├── frontend/
│   ├── index.html          # SPA structure & dashboard layout
│   ├── style.css           # Responsive design, custom CSS variables, panel components
│   └── app.js              # State management, Chart.js wrappers, API integration
├── main.py                 # FastAPI server, route definitions, static file mounting
├── requirements.txt        # Python dependencies
└── README.md               # Project documentation
```

---

## 🚀 Getting Started

### 1. Prerequisites
Ensure you have Python 3.9+ installed on your system.

### 2. Installation
Clone this repository and navigate to the project directory:
```bash
git clone https://github.com/your-username/marketing-intelligence-lab.git
cd marketing-intelligence-lab
```

Set up a virtual environment and activate it:
```bash
# On macOS/Linux
python3 -m venv venv
source venv/bin/venv/bin/activate

# On Windows
python -m venv venv
venv\Scriptsctivate
```

Install required dependencies:
```bash
pip install -r requirements.txt
```

### 3. Running the Server
Start the FastAPI server with Uvicorn:
```bash
uvicorn main:app --reload --port 8000
```

### 4. Accessing the Application
Open your browser and navigate to:
- **Interactive Dashboard UI**: [http://localhost:8000](http://localhost:8000)
- **Interactive API Documentation (Swagger)**: [http://localhost:8000/docs](http://localhost:8000/docs)
- **Health Check Endpoint**: [http://localhost:8000/api/health](http://localhost:8000/api/health)

---

## 📋 Expected Dataset Format

When uploading CSV datasets via the **Dataset** panel, the file must contain a `review` column. Additional optional columns unlock extended visual capabilities (such as star ratings and customer metadata).

### Example CSV Structure:
```csv
review_id,customer,product,rating,review
001,Aarav,Smartphone X,5,"Excellent product! The battery life exceeded my expectations."
002,Sophia,Wireless Earbuds,1,"Terrible audio quality and shipping took two weeks."
003,Liam,Smartwatch V2,3,"Average quality, decent build but software is clunky."
```

---

## 🔌 API Reference

### `GET /api/health`
Checks backend status and NLP engine connection.
```json
{
  "status": "running",
  "message": "Marketing NLP Intelligence Lab is running"
}
```

### `POST /api/marketing/sentiment`
Analyzes a single customer comment.
- **Request Body**: `{"text": "Great customer service and fast shipping!"}`
- **Response**:
```json
{
  "sentiment": "Positive",
  "compound": 0.6249,
  "positive": 0.512,
  "negative": 0.0,
  "neutral": 0.488
}
```

### `POST /api/marketing/analyze-csv`
Uploads a CSV file for full dataset analysis (Sentiment distribution, TF-IDF keywords, NMF topic modeling, business insights).
- **Form Parameter**: `file` (`multipart/form-data`)

---

## 📜 License

Distributed under the MIT License. See `LICENSE` for more information.
