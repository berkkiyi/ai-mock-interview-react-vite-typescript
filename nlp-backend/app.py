from flask import Flask, request, jsonify
from flask_cors import CORS
from openai import OpenAI  # Yeni OpenAI API
import spacy
from textblob import TextBlob
from gensim import corpora, models
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity

app = Flask(__name__)
CORS(app)

# OpenAI istemcisini oluşturun
client = OpenAI(api_key="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")

# Spacy modelini yükle
nlp = spacy.load("en_core_web_sm")

def generate_correct_answer(user_answer: str) -> str:
    response = client.chat.completions.create(
        model="gpt-3.5-turbo",
        messages=[
            {"role": "system", "content": "You are a helpful assistant that generates correct answers for interview questions."},
            {"role": "user", "content": f"Generate a correct and detailed answer for the following user response:\n\nUser Answer: {user_answer}"}
        ]
    )
    return response.choices[0].message.content

def analyze_sentiment(text: str) -> dict:
    blob = TextBlob(text)
    sentiment = blob.sentiment.polarity
    score = (sentiment + 1) * 5
    feedback = "Your answer is neutral."
    if sentiment > 0.2:
        feedback = "Your answer has a positive tone."
    elif sentiment < -0.2:
        feedback = "Your answer has a negative tone."
    return {"score": round(score, 2), "feedback": feedback}

def extract_keywords(text: str, top_n: int = 5) -> dict:
    doc = nlp(text)
    keywords = [token.text for token in doc if token.is_alpha and not token.is_stop]
    score = min(len(keywords) / top_n * 10, 10)
    feedback = f"The main keywords in your answer are: {', '.join(keywords[:top_n])}."
    return {"score": round(score, 2), "feedback": feedback}

def extract_entities(text: str) -> dict:
    doc = nlp(text)
    entities = [{"text": ent.text, "label": ent.label_} for ent in doc.ents]
    score = min(len(entities) * 2, 10)
    feedback = f"Your answer mentions: {', '.join([ent['text'] for ent in entities])}." if entities else "Your answer does not mention any specific entities."
    return {"score": round(score, 2), "feedback": feedback}

def analyze_topics(texts: list[str], num_topics: int = 3) -> dict:
    stop_words = set("for a of the and to in like with on at as by an".split())
    texts = [[word for word in text.lower().split() if word.isalpha() and word not in stop_words] for text in texts]
    dictionary = corpora.Dictionary(texts)
    corpus = [dictionary.doc2bow(text) for text in texts]
    lda_model = models.LdaModel(corpus, num_topics=num_topics, id2word=dictionary, passes=15)

    topics = []
    for idx, topic in lda_model.print_topics(num_words=5):
        words = [word.split("*")[1].replace('"', '') for word in topic.split(" + ")]
        topics.append(", ".join(words))

    score = min(len(topics) * 3, 10)
    feedback = f"The main topics in your answer are: {', '.join(topics)}."
    return {"score": round(score, 2), "feedback": feedback}

def calculate_similarity(text1: str, text2: str) -> dict:
    vectorizer = TfidfVectorizer()
    tfidf_matrix = vectorizer.fit_transform([text1, text2])
    similarity = cosine_similarity(tfidf_matrix[0:1], tfidf_matrix[1:2])
    score = similarity[0][0] * 10
    feedback = f"Your answer is {similarity[0][0] * 100:.2f}% similar to the correct answer."
    return {"score": round(score, 2), "feedback": feedback}

def calculate_overall_score(analysis_results: dict) -> float:
    weights = {
        "sentiment": 0.2,
        "keywords": 0.2,
        "entities": 0.1,
        "topics": 0.1,
        "similarity": 0.4,
    }
    overall_score = (
        analysis_results["sentiment"]["score"] * weights["sentiment"] +
        analysis_results["keywords"]["score"] * weights["keywords"] +
        analysis_results["entities"]["score"] * weights["entities"] +
        analysis_results["topics"]["score"] * weights["topics"] +
        analysis_results["similarity"]["score"] * weights["similarity"]
    )
    return round(overall_score, 2)

def generate_improvement_tips(analysis: dict) -> list[str]:
    tips = []
    if analysis["sentiment"]["score"] < 7:
        tips.append("💡 Try to use more positive language and concrete examples to improve sentiment score")
    if analysis["keywords"]["score"] < 7:
        tips.append("💡 Include more technical terms related to Python and LLM development")
    if analysis["entities"]["score"] < 5:
        tips.append("💡 Mention specific libraries or frameworks like PyTorch, TensorFlow")
    if analysis["similarity"]["score"] < 7:
        tips.append("💡 Focus more on Python's specific strengths/weaknesses in LLM context")
    return tips

@app.route("/analyze", methods=["POST"])
def analyze():
    data = request.json
    text = data.get("text", "")

    if not text:
        return jsonify({"error": "Text is required"}), 400

    correct_answer = generate_correct_answer(text)

    sentiment = analyze_sentiment(text)
    keywords = extract_keywords(text)
    entities = extract_entities(text)
    topics = analyze_topics([text])
    similarity = calculate_similarity(text, correct_answer)
    overall_score = calculate_overall_score({
        "sentiment": sentiment,
        "keywords": keywords,
        "entities": entities,
        "topics": topics,
        "similarity": similarity,
    })
    improvement_tips = generate_improvement_tips({
        "sentiment": sentiment,
        "keywords": keywords,
        "entities": entities,
        "similarity": similarity,
    })

    return jsonify({
        "correct_answer": correct_answer,
        "sentiment": sentiment,
        "keywords": keywords,
        "entities": entities,
        "topics": topics,
        "similarity": similarity,
        "overall_score": overall_score,
        "improvement_tips": improvement_tips,
    })

if __name__ == "__main__":
    app.run(debug=True)
