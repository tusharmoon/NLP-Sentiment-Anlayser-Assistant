from vaderSentiment.vaderSentiment import SentimentIntensityAnalyzer

import pandas as pd
import numpy as np
import re

from collections import Counter

from sklearn.feature_extraction.text import (
    TfidfVectorizer,
    CountVectorizer
)

from sklearn.decomposition import NMF


# ============================================================
# SENTIMENT ENGINE
# ============================================================

analyzer = SentimentIntensityAnalyzer()


# ============================================================
# SINGLE REVIEW SENTIMENT
# ============================================================

def analyze_sentiment(text: str):

    text = str(text)

    scores = analyzer.polarity_scores(text)

    compound = scores["compound"]

    if compound >= 0.05:
        sentiment = "Positive"

    elif compound <= -0.05:
        sentiment = "Negative"

    else:
        sentiment = "Neutral"

    return {
        "sentiment": sentiment,
        "compound": round(compound, 4),
        "positive": round(scores["pos"], 4),
        "negative": round(scores["neg"], 4),
        "neutral": round(scores["neu"], 4)
    }


# ============================================================
# TEXT CLEANING
# ============================================================

def clean_text(text):

    text = str(text).lower()

    # Remove URLs
    text = re.sub(r"https?://\S+|www\.\S+", " ", text)

    # Remove email addresses
    text = re.sub(r"\S+@\S+", " ", text)

    # Keep alphabetic characters
    text = re.sub(r"[^a-z\s]", " ", text)

    # Remove extra spaces
    text = re.sub(r"\s+", " ", text).strip()

    return text


# ============================================================
# KEYWORD EXTRACTION
# ============================================================

def extract_keywords(df, top_n=25):

    if df.empty:
        return []

    texts = (
        df["review"]
        .fillna("")
        .astype(str)
        .apply(clean_text)
    )

    texts = texts[texts.str.len() > 2]

    if len(texts) == 0:
        return []

    try:

        vectorizer = TfidfVectorizer(
            stop_words="english",
            ngram_range=(1, 2),
            min_df=1,
            max_features=500
        )

        matrix = vectorizer.fit_transform(texts)

        scores = np.asarray(
            matrix.sum(axis=0)
        ).flatten()

        terms = vectorizer.get_feature_names_out()

        ranked = sorted(
            zip(terms, scores),
            key=lambda x: x[1],
            reverse=True
        )

        keywords = []

        for term, score in ranked[:top_n]:

            # Find reviews containing the keyword
            mask = texts.str.contains(
                rf"\b{re.escape(term)}\b",
                regex=True,
                na=False
            )

            matching = df.loc[
                texts.index[mask]
            ]

            positive = len(
                matching[
                    matching["sentiment"] == "Positive"
                ]
            )

            negative = len(
                matching[
                    matching["sentiment"] == "Negative"
                ]
            )

            neutral = len(
                matching[
                    matching["sentiment"] == "Neutral"
                ]
            )

            keywords.append({

                "keyword": term,

                "frequency": int(mask.sum()),

                "tfidf_score": round(
                    float(score),
                    4
                ),

                "positive": positive,

                "negative": negative,

                "neutral": neutral

            })

        return keywords

    except Exception:

        return []


# ============================================================
# SENTIMENT-SPECIFIC KEYWORDS
# ============================================================

def extract_sentiment_keywords(df, sentiment, top_n=15):

    subset = df[
        df["sentiment"] == sentiment
    ].copy()

    if subset.empty:
        return []

    texts = (
        subset["review"]
        .fillna("")
        .astype(str)
        .apply(clean_text)
    )

    try:

        vectorizer = CountVectorizer(
            stop_words="english",
            ngram_range=(1, 2),
            min_df=1,
            max_features=300
        )

        matrix = vectorizer.fit_transform(texts)

        counts = np.asarray(
            matrix.sum(axis=0)
        ).flatten()

        terms = vectorizer.get_feature_names_out()

        ranked = sorted(
            zip(terms, counts),
            key=lambda x: x[1],
            reverse=True
        )

        return [

            {
                "keyword": term,
                "frequency": int(count)
            }

            for term, count in ranked[:top_n]

        ]

    except Exception:

        return []


# ============================================================
# TOPIC MODELING
# ============================================================

def extract_topics(df, number_of_topics=5):

    if len(df) < 3:
        return []

    # Reset index to guarantee perfect 1-to-1 matrix position mapping
    working_df = df.copy().reset_index(drop=True)

    texts = (
        working_df["review"]
        .fillna("")
        .astype(str)
        .apply(clean_text)
    )

    valid_mask = texts.str.len() > 5
    working_df = working_df[valid_mask].reset_index(drop=True)
    texts = texts[valid_mask].reset_index(drop=True)

    if len(texts) < 3:
        return []

    try:

        vectorizer = TfidfVectorizer(
            stop_words="english",
            ngram_range=(1, 2),
            min_df=1,
            max_features=1000
        )

        matrix = vectorizer.fit_transform(texts)

        if matrix.shape[1] < 2:
            return []

        actual_topics = min(
            number_of_topics,
            matrix.shape[0],
            matrix.shape[1]
        )

        if actual_topics < 2:
            return []

        model = NMF(
            n_components=actual_topics,
            random_state=42,
            init="nndsvda",
            max_iter=500
        )

        document_topics = model.fit_transform(matrix)
        feature_names = vectorizer.get_feature_names_out()

        topics = []
        assigned_topic_indices = document_topics.argmax(axis=1)

        for topic_index, topic_weights in enumerate(model.components_):

            top_indices = topic_weights.argsort()[::-1][:7]

            topic_keywords = [
                feature_names[i]
                for i in top_indices
                if i < len(feature_names)
            ]

            assigned_documents = (assigned_topic_indices == topic_index)
            topic_reviews = working_df[assigned_documents]

            mentions = len(topic_reviews)

            if mentions == 0:
                continue

            avg_sentiment = round(
                float(topic_reviews["compound"].mean()),
                3
            ) if "compound" in topic_reviews.columns else 0.0

            positive = len(
                topic_reviews[topic_reviews["sentiment"] == "Positive"]
            ) if "sentiment" in topic_reviews.columns else 0

            negative = len(
                topic_reviews[topic_reviews["sentiment"] == "Negative"]
            ) if "sentiment" in topic_reviews.columns else 0

            neutral = len(
                topic_reviews[topic_reviews["sentiment"] == "Neutral"]
            ) if "sentiment" in topic_reviews.columns else 0

            if avg_sentiment >= 0.05:
                sentiment = "Positive"

            elif avg_sentiment <= -0.05:
                sentiment = "Negative"

            else:
                sentiment = "Neutral"

            topics.append({

                "topic_id":
                    topic_index + 1,

                "name":
                    " • ".join(
                        topic_keywords[:3]
                    ).title() if topic_keywords else f"Topic {topic_index + 1}",

                "mentions":
                    mentions,

                "percentage":
                    round(
                        (mentions / len(texts)) * 100,
                        1
                    ),

                "sentiment":
                    sentiment,

                "sentiment_score":
                    avg_sentiment,

                "positive":
                    positive,

                "negative":
                    negative,

                "neutral":
                    neutral,

                "keywords":
                    topic_keywords

            })

        topics.sort(
            key=lambda x: x["mentions"],
            reverse=True
        )

        return topics

    except Exception as e:

        print(
            f"Topic modeling error: {e}"
        )

        return []


# ============================================================
# BUSINESS INSIGHTS
# ============================================================

def generate_business_insights(
    df,
    topics,
    keywords
):

    insights = []

    total = len(df)

    if total == 0:
        return insights

    positive_pct = (
        len(
            df[
                df["sentiment"]
                == "Positive"
            ]
        )
        / total
        * 100
    )

    negative_pct = (
        len(
            df[
                df["sentiment"]
                == "Negative"
            ]
        )
        / total
        * 100
    )

    # --------------------------------------------------------
    # Overall sentiment
    # --------------------------------------------------------

    if positive_pct >= 60:

        insights.append({

            "type": "positive",

            "priority": "Medium",

            "title":
                "Customer perception is broadly positive",

            "text":
                f"{positive_pct:.1f}% of analyzed reviews are positive. "
                "Marketing teams should identify the experiences "
                "driving this positivity and reinforce them in "
                "campaign messaging and product positioning.",

            "action":
                "Identify the strongest positive themes and "
                "use them in marketing communication."

        })

    if negative_pct >= 20:

        insights.append({

            "type": "risk",

            "priority": "High",

            "title":
                "Negative customer feedback requires attention",

            "text":
                f"{negative_pct:.1f}% of reviews are negative. "
                "Recurring negative themes may indicate "
                "product, service, delivery or communication issues.",

            "action":
                "Investigate the dominant negative topics "
                "and prioritize corrective actions."

        })

    # --------------------------------------------------------
    # Topic insight
    # --------------------------------------------------------

    negative_topics = [
        topic
        for topic in topics
        if topic["sentiment"] == "Negative"
    ]

    if negative_topics:

        topic = max(
            negative_topics,
            key=lambda x: x["mentions"]
        )

        insights.append({

            "type": "topic",

            "priority": "High",

            "title":
                f"{topic['name']} is a major pain point",

            "text":
                f"This topic appears in {topic['mentions']} "
                f"reviews and has a sentiment score of "
                f"{topic['sentiment_score']}.",

            "action":
                "Review the underlying customer comments "
                "and determine whether the issue requires "
                "product, service or marketing intervention."

        })

    # --------------------------------------------------------
    # Positive topic
    # --------------------------------------------------------

    positive_topics = [
        topic
        for topic in topics
        if topic["sentiment"] == "Positive"
    ]

    if positive_topics:

        topic = max(
            positive_topics,
            key=lambda x: x["mentions"]
        )

        insights.append({

            "type": "opportunity",

            "priority": "Medium",

            "title":
                f"{topic['name']} is a marketing opportunity",

            "text":
                f"The topic appears frequently and carries "
                f"positive customer sentiment.",

            "action":
                "Consider using this customer experience "
                "as a proof point in campaigns, messaging "
                "and product positioning."

        })

    # --------------------------------------------------------
    # Keyword insight
    # --------------------------------------------------------

    if keywords:

        top_keyword = keywords[0]

        insights.append({

            "type": "keyword",

            "priority": "Medium",

            "title":
                f"'{top_keyword['keyword']}' is a dominant customer term",

            "text":
                f"The keyword appears in "
                f"{top_keyword['frequency']} reviews.",

            "action":
                "Monitor this term regularly because changes "
                "in its frequency or sentiment may indicate "
                "changes in customer perception."

        })

    return insights


# ============================================================
# DATASET ANALYSIS
# ============================================================

def analyze_dataset(df: pd.DataFrame):

    # Work on a copy
    df = df.copy()

    # Ensure review is string
    df["review"] = (
        df["review"]
        .fillna("")
        .astype(str)
    )

    # Remove completely empty reviews
    df = df[
        df["review"].str.strip() != ""
    ].copy()

    # --------------------------------------------------------
    # SENTIMENT
    # --------------------------------------------------------

    results = []

    for text in df["review"]:

        results.append(
            analyze_sentiment(text)
        )

    result_df = pd.DataFrame(
        results
    )

    df["sentiment"] = (
        result_df["sentiment"].values
    )

    df["compound"] = (
        result_df["compound"].values
    )

    df["positive_score"] = (
        result_df["positive"].values
    )

    df["negative_score"] = (
        result_df["negative"].values
    )

    df["neutral_score"] = (
        result_df["neutral"].values
    )

    # --------------------------------------------------------
    # KPIs
    # --------------------------------------------------------

    total_reviews = len(df)

    positive_count = len(
        df[
            df["sentiment"]
            == "Positive"
        ]
    )

    negative_count = len(
        df[
            df["sentiment"]
            == "Negative"
        ]
    )

    neutral_count = len(
        df[
            df["sentiment"]
            == "Neutral"
        ]
    )

    positive_percentage = (
        positive_count /
        total_reviews *
        100
        if total_reviews
        else 0
    )

    negative_percentage = (
        negative_count /
        total_reviews *
        100
        if total_reviews
        else 0
    )

    neutral_percentage = (
        neutral_count /
        total_reviews *
        100
        if total_reviews
        else 0
    )

    # --------------------------------------------------------
    # RATING
    # --------------------------------------------------------

    average_rating = None

    if "rating" in df.columns:

        rating_series = pd.to_numeric(
            df["rating"],
            errors="coerce"
        )

        if rating_series.notna().any():

            average_rating = round(
                rating_series.mean(),
                2
            )

    # --------------------------------------------------------
    # SENTIMENT DISTRIBUTION
    # --------------------------------------------------------

    sentiment_distribution = {

        "Positive":
            positive_count,

        "Neutral":
            neutral_count,

        "Negative":
            negative_count

    }

    # --------------------------------------------------------
    # KEYWORDS
    # --------------------------------------------------------

    keywords = extract_keywords(
        df
    )

    positive_keywords = (
        extract_sentiment_keywords(
            df,
            "Positive"
        )
    )

    negative_keywords = (
        extract_sentiment_keywords(
            df,
            "Negative"
        )
    )

    # --------------------------------------------------------
    # TOPICS
    # --------------------------------------------------------

    topics = extract_topics(
        df,
        number_of_topics=5
    )

    # --------------------------------------------------------
    # REVIEW TABLE
    # --------------------------------------------------------

    display_columns = [

        column

        for column in [

            "review_id",
            "customer",
            "product",
            "rating",
            "review",
            "sentiment",
            "compound"

        ]

        if column in df.columns

    ]

    review_table = (
        df[display_columns]
        .head(500)
        .fillna("")
        .to_dict(
            orient="records"
        )
    )

    # --------------------------------------------------------
    # NEGATIVE REVIEWS
    # --------------------------------------------------------

    negative_reviews = (

        df[
            df["sentiment"]
            == "Negative"
        ]

        .sort_values(
            "compound",
            ascending=True
        )

        .head(10)

        .fillna("")

        .to_dict(
            orient="records"
        )

    )

    # --------------------------------------------------------
    # POSITIVE REVIEWS
    # --------------------------------------------------------

    positive_reviews = (

        df[
            df["sentiment"]
            == "Positive"
        ]

        .sort_values(
            "compound",
            ascending=False
        )

        .head(10)

        .fillna("")

        .to_dict(
            orient="records"
        )

    )

    # --------------------------------------------------------
    # BUSINESS INSIGHTS
    # --------------------------------------------------------

    business_insights = (
        generate_business_insights(
            df,
            topics,
            keywords
        )
    )

    # --------------------------------------------------------
    # FINAL RESPONSE
    # --------------------------------------------------------

    return {

        "total_reviews":
            total_reviews,

        "positive_count":
            positive_count,

        "negative_count":
            negative_count,

        "neutral_count":
            neutral_count,

        "positive_percentage":
            round(
                positive_percentage,
                1
            ),

        "negative_percentage":
            round(
                negative_percentage,
                1
            ),

        "neutral_percentage":
            round(
                neutral_percentage,
                1
            ),

        "average_rating":
            average_rating,

        "sentiment_distribution":
            sentiment_distribution,

        "reviews":
            review_table,

        "negative_reviews":
            negative_reviews,

        "positive_reviews":
            positive_reviews,

        "keywords":
            keywords,

        "positive_keywords":
            positive_keywords,

        "negative_keywords":
            negative_keywords,

        "topics":
            topics,

        "business_insights":
            business_insights

    }