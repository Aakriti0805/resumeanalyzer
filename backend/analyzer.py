from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity
from google import genai
import json
import re

client = genai.Client(api_key="AQ.Ab8RN6KWQH_ABdN5LzYjVdzr70JE6QKbR5AANe3XXXv2DoDiIw")

def clean_text(text):
    text = text.lower()
    text = re.sub(r'[^\w\s]', ' ', text)
    text = re.sub(r'\s+', ' ', text)
    return text.strip()

def calculate_score(resume, jd):
    vectorizer = TfidfVectorizer(
        stop_words='english',
        ngram_range=(1, 2),
        min_df=1
    )
    try:
        vectors = vectorizer.fit_transform([
            clean_text(resume),
            clean_text(jd)
        ])
        similarity = cosine_similarity(vectors)[0][1]
        return round(similarity * 100, 2)
    except:
        return 0

def analyze_resume(resume, jd):
    score = calculate_score(resume, jd)

    prompt = f"""
You are an expert resume reviewer and career coach.
Analyze this resume against the job description carefully.

RESUME:
{resume[:3000]}

JOB DESCRIPTION:
{jd[:1500]}

Reply ONLY in this exact JSON format, no extra text:
{{
  "ai_score": <number 0-100, be realistic>,
  "missing_keywords": ["keyword1", "keyword2", "keyword3", "keyword4", "keyword5"],
  "strengths": ["strength1", "strength2", "strength3"],
  "improvements": ["specific suggestion1", "specific suggestion2", "specific suggestion3"],
  "format_feedback": "specific one sentence about resume format and structure",
  "trend_analysis": "one sentence about current 2026 market trends for this role"
}}
"""

    try:
        response = client.models.generate_content(
            model="gemini-3.1-flash-lite",
            contents=prompt
        )
        text = response.text.strip()
        text = re.sub(r'```json|```', '', text).strip()
        ai_result = json.loads(text)
    except Exception as e:
        print(f"AI Error: {e}")
        ai_result = {
            "ai_score": score,
            "missing_keywords": [],
            "strengths": [],
            "improvements": ["AI analysis failed, try again"],
            "format_feedback": "Could not analyze format",
            "trend_analysis": "Could not fetch trends"
        }

    return {
        "score": score,
        "ai_score": ai_result.get("ai_score", score),
        "missing_keywords": ai_result.get("missing_keywords", []),
        "strengths": ai_result.get("strengths", []),
        "improvements": ai_result.get("improvements", []),
        "format_feedback": ai_result.get("format_feedback", ""),
        "trend_analysis": ai_result.get("trend_analysis", "")
    }