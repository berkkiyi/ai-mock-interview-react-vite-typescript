import { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";

export default function AnalysisResultsPage() {
  const location = useLocation();
  const [analysisResults, setAnalysisResults] = useState(
    location.state?.analysisResults
  );

  useEffect(() => {
    if (!analysisResults) {
      window.location.href = "/";
    }
  }, [analysisResults]);

  if (!analysisResults) {
    return <div>Loading...</div>;
  }

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Analysis Results</h1>
      <div className="w-full mt-4 p-4 border rounded-md bg-gray-50">
        <div className="space-y-4">
          {/* Dinamik Doğru Cevap */}
          <div>
            <strong className="text-lg">Correct Answer:</strong>
            <div className="ml-4">
              <p className="text-gray-600">{analysisResults.correct_answer}</p>
            </div>
          </div>

          {/* Sentiment Analizi */}
          <div>
            <strong className="text-lg">Sentiment:</strong>
            <div className="ml-4">
              <span className="font-semibold">
                {analysisResults.sentiment.score}/10
              </span>
              <p className="text-gray-600">
                {analysisResults.sentiment.feedback}
              </p>
            </div>
          </div>

          {/* Anahtar Kelimeler */}
          <div>
            <strong className="text-lg">Keywords:</strong>
            <div className="ml-4">
              <span className="font-semibold">
                {analysisResults.keywords.score}/10
              </span>
              <p className="text-gray-600">
                {analysisResults.keywords.feedback}
              </p>
            </div>
          </div>

          {/* Varlıklar (Entities) */}
          <div>
            <strong className="text-lg">Entities:</strong>
            <div className="ml-4">
              <span className="font-semibold">
                {analysisResults.entities.score}/10
              </span>
              <p className="text-gray-600">
                {analysisResults.entities.feedback}
              </p>
            </div>
          </div>

          {/* Konular (Topics) */}
          <div>
            <strong className="text-lg">Topics:</strong>
            <div className="ml-4">
              <span className="font-semibold">
                {analysisResults.topics.score}/10
              </span>
              <p className="text-gray-600">{analysisResults.topics.feedback}</p>
            </div>
          </div>

          {/* Benzerlik (Similarity) */}
          <div>
            <strong className="text-lg">Similarity:</strong>
            <div className="ml-4">
              <span className="font-semibold">
                {analysisResults.similarity.score}/10
              </span>
              <p className="text-gray-600">
                {analysisResults.similarity.feedback}
              </p>
            </div>
          </div>

          {/* Genel Skor */}
          <div className="pt-4 border-t">
            <strong className="text-xl">Overall Score:</strong>
            <span className="ml-2 text-2xl font-bold text-blue-600">
              {analysisResults.overall_score}/10
            </span>
          </div>

          {/* Geliştirme Önerileri */}
          {analysisResults.improvement_tips?.length > 0 && (
            <div className="mt-6 p-4 bg-yellow-50 rounded-lg">
              <h3 className="text-lg font-semibold mb-2">
                🚀 Improvement Suggestions
              </h3>
              <ul className="list-disc pl-6 space-y-2">
                {analysisResults.improvement_tips.map(
                  (tip: string, index: number) => (
                    <li key={index} className="text-gray-700">
                      {tip}
                    </li>
                  )
                )}
              </ul>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
