import { useEffect, useRef, useState } from "react";
import ReactPlayer from "react-player";
import Webcam from "react-webcam";
import { Button } from "@/components/ui/button";
import useSpeechToText, { ResultType } from "react-hook-speech-to-text";
import { toast } from "sonner";
import { SaveModal } from "@/components/save-modal";
import { addDoc, collection, serverTimestamp } from "firebase/firestore";
import { db } from "@/config/firebase.config";
import { UserAnswer } from "@/types";
import { useNavigate } from "react-router-dom";

const AVATAR_VIDEO_URL = "/assets/videos/python-llm.mp4";

// Kelime sayısını hesaplayan fonksiyon
const countWords = (text: string): number => {
  return text.trim().split(/\s+/).length;
};

export default function VideoInterviewPage() {
  const webcamRef = useRef<Webcam>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const [isRecording, setIsRecording] = useState(false);
  const [videoEnded, setVideoEnded] = useState(false);
  const [recordedChunks, setRecordedChunks] = useState<Blob[]>([]);
  const [isSaveModalOpen, setIsSaveModalOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [userAnswer, setUserAnswer] = useState("");
  const navigate = useNavigate();

  const {
    interimResult,
    isRecording: isSpeechRecording,
    results,
    startSpeechToText,
    stopSpeechToText,
  } = useSpeechToText({
    continuous: true,
    useLegacyResults: false,
  });

  const handleVideoEnd = () => setVideoEnded(true);

  const handleRecording = async () => {
    if (!isRecording) {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: true,
          audio: true,
        });
        if (webcamRef.current) {
          webcamRef.current.video!.srcObject = stream;
        }

        mediaRecorderRef.current = new MediaRecorder(stream, {
          mimeType: "video/webm",
        });

        mediaRecorderRef.current.ondataavailable = (e) => {
          if (e.data.size > 0) setRecordedChunks((prev) => [...prev, e.data]);
        };

        mediaRecorderRef.current.start();
        setIsRecording(true);
        startSpeechToText();
      } catch (error) {
        toast.error("Permission Required", {
          description: "Please allow camera and microphone access.",
        });
      }
    } else {
      mediaRecorderRef.current?.stop();
      setIsRecording(false);
      stopSpeechToText();

      // Kelime sayısını kontrol et
      const wordCount = countWords(userAnswer);
      if (wordCount < 50) {
        toast.error("Answer Too Short", {
          description: "Your answer must be at least 50 words.",
        });
        return;
      }

      setIsSaveModalOpen(true); // SaveModal'ı aç
    }
  };

  const handleDownload = () => {
    const blob = new Blob(recordedChunks, { type: "video/webm" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "my-response.webm";
    a.click();
  };

  const saveUserAnswer = async (
    userAnswerData: Omit<UserAnswer, "id" | "createdAt" | "updateAt">
  ) => {
    try {
      await addDoc(collection(db, "userAnswers"), {
        ...userAnswerData,
        createdAt: serverTimestamp(), // Otomatik olarak ekleniyor
        updateAt: serverTimestamp(), // Otomatik olarak ekleniyor
      });
      toast.success("Answer saved successfully!");
    } catch (error) {
      console.error("Error saving answer:", error);
      toast.error("Failed to save answer.");
    }
  };

  const handleSaveConfirm = async () => {
    const wordCount = countWords(userAnswer);
    if (wordCount < 50) {
      toast.error("Answer Too Short", {
        description: "Your answer must be at least 50 words.",
      });
      return;
    }

    setIsSaving(true);

    try {
      // Backend'e analiz isteği gönder
      const response = await fetch("http://localhost:5000/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          text: userAnswer, // Kullanıcının cevabı
        }),
      });

      const analysis = await response.json();

      // Firestore'a kaydedilecek veri
      const userAnswerData = {
        mockIdRef: "mock-interview-id", // Örnek bir ID
        question:
          "Describe your experience with Python, focusing on its strengths and weaknesses in the context of developing LLMs.", // Soru metni
        correct_ans: analysis.correct_answer, // Dinamik olarak oluşturulan doğru cevap
        user_ans: userAnswer,
        feedback: analysis.sentiment, // Duygu analizi sonucu
        rating: analysis.similarity, // Metin benzerliği sonucu
        userId: "anonymous-user", // Clerk'dan gelen userId
      };

      // Firestore'a kaydet
      await saveUserAnswer(userAnswerData);

      // Analiz sonuçlarını yeni sayfaya aktar
      navigate("/analysis-results", { state: { analysisResults: analysis } });
    } catch (error) {
      console.error("Analysis error:", error);
      toast.error("Failed to analyze answer.");
    } finally {
      setIsSaving(false);
      setIsSaveModalOpen(false);
    }
  };

  useEffect(() => {
    const combineTranscripts = results
      .filter((result): result is ResultType => typeof result !== "string")
      .map((result) => result.transcript)
      .join(" ");
    setUserAnswer(combineTranscripts);
  }, [results]);

  return (
    <div className="container mx-auto p-4">
      <SaveModal
        isOpen={isSaveModalOpen}
        onClose={() => setIsSaveModalOpen(false)}
        onConfirm={handleSaveConfirm}
        loading={isSaving}
      />

      {/* Soru */}
      <div className="mb-4">
        <h2 className="text-xl font-bold">
          Describe your experience with Python, focusing on its strengths and
          weaknesses in the context of developing LLMs.
        </h2>
      </div>

      {/* AI Avatar */}
      <div className="relative mb-8">
        <ReactPlayer
          url={AVATAR_VIDEO_URL}
          playing={true}
          controls={false}
          onEnded={handleVideoEnd}
          width="100%"
          height="auto"
          className="rounded-lg shadow-lg"
          config={{
            file: {
              attributes: {
                controlsList: "nodownload",
                autoPlay: true,
                muted: false,
              },
            },
          }}
        />
      </div>

      {/* Kayıt Arayüzü */}
      <div className="flex items-center justify-center gap-3 mt-8">
        <div className="w-32 h-24 border-2 border-gray-200 rounded-lg overflow-hidden">
          <Webcam
            audio={true}
            ref={webcamRef}
            videoConstraints={{ width: 100, height: 96 }}
            className="w-full h-full object-cover"
            mirrored
          />
        </div>

        {videoEnded && (
          <>
            <Button
              onClick={handleRecording}
              variant={isRecording ? "destructive" : "default"}
              size="lg"
            >
              {isRecording ? "⏹️ Stop Recording" : "🎤 Record Answer"}
            </Button>

            {recordedChunks.length > 0 && (
              <>
                <Button variant="secondary" onClick={handleDownload} size="lg">
                  ⬇️ Download
                </Button>
                <Button
                  variant="default"
                  onClick={() => setIsSaveModalOpen(true)}
                  size="lg"
                >
                  💾 Save Answer
                </Button>
              </>
            )}
          </>
        )}
      </div>

      {/* Transkript */}
      <div className="w-full mt-4 p-4 border rounded-md bg-gray-50">
        <h2 className="text-lg font-semibold">Your Answer:</h2>
        <p className="text-sm mt-2 text-gray-700 whitespace-normal">
          {userAnswer || "Start recording to see your answer here"}
        </p>
        {interimResult && (
          <p className="text-sm text-gray-500 mt-2">
            <strong>Current Speech:</strong> {interimResult}
          </p>
        )}
        {/* Kelime sayacı */}
        <p className="text-sm text-gray-500 mt-2">
          <strong>Word Count:</strong> {countWords(userAnswer)}
        </p>
      </div>
    </div>
  );
}
