import { useState } from "react";
import axios from "axios";

function App() {
  const [file, setFile] = useState(null);
  const [result, setResult] = useState(null);

  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [interviewStarted, setInterviewStarted] = useState(false);

  const [answer, setAnswer] = useState("");
  const [answers, setAnswers] = useState([]);

  const startInterview = () => {
    setInterviewStarted(true);
    setCurrentQuestion(0);
    setAnswer("");
  };

  async function uploadResume() {
    try {
      const formData = new FormData();
      formData.append("file", file);

      const response = await axios.post(
        "http://127.0.0.1:8000/upload-resume",
        formData
      );

      setResult(response.data);
    } catch (error) {
      console.error(error);
      alert("Resume upload failed");
    }
  }

  const submitAnswer = async () => {
    if (!answer.trim()) {
      alert("Please enter an answer");
      return;
    }

    try {
      const response = await axios.post(
        "http://127.0.0.1:8000/evaluate",
        {
          question: result.questions[currentQuestion],
          answer: answer,
        }
      );

      console.log("Evaluation Response:", response.data);

      setAnswers((prev) => [
        ...prev,
        {
          question: result.questions[currentQuestion],
          answer: answer,
          evaluation:
            response.data.evaluation ||
            response.data.error ||
            "No feedback received",
        },
      ]);

      setAnswer("");
    } catch (error) {
      console.error(error);

      setAnswers((prev) => [
        ...prev,
        {
          question: result.questions[currentQuestion],
          answer: answer,
          evaluation: "Evaluation failed",
        },
      ]);
    }
  };

  const nextQuestion = () => {
    if (
      result &&
      currentQuestion < result.questions.length - 1
    ) {
      setCurrentQuestion(currentQuestion + 1);
      setAnswer("");
    }
  };

  return (
    <div
      style={{
        padding: "20px",
        maxWidth: "900px",
        margin: "auto",
      }}
    >
      <h1>AI Interview Simulator</h1>

      <input
        type="file"
        onChange={(e) => setFile(e.target.files[0])}
      />

      <button
        onClick={uploadResume}
        style={{ marginLeft: "10px" }}
      >
        Upload Resume
      </button>

      <br />
      <br />

      {result && (
        <button onClick={startInterview}>
          Start Interview
        </button>
      )}

      {result && (
        <>
          <h2>Skills</h2>

          <ul>
            {result.skills.map((skill, index) => (
              <li key={index}>{skill}</li>
            ))}
          </ul>

          <h2>Interview Questions</h2>

          <ul>
            {result.questions.map((question, index) => (
              <li key={index}>{question}</li>
            ))}
          </ul>
        </>
      )}

      {interviewStarted && result && (
        <div style={{ marginTop: "30px" }}>
          <h2>Current Question</h2>

          <h3>
            {result.questions[currentQuestion]}
          </h3>

          <textarea
            rows="5"
            cols="60"
            placeholder="Type your answer here..."
            value={answer}
            onChange={(e) =>
              setAnswer(e.target.value)
            }
          />

          <br />
          <br />

          <button onClick={submitAnswer}>
            Submit Answer
          </button>

          <button
            onClick={nextQuestion}
            disabled={
              currentQuestion >=
              result.questions.length - 1
            }
            style={{ marginLeft: "10px" }}
          >
            Next Question
          </button>
        </div>
      )}

      {answers.length > 0 && (
        <div style={{ marginTop: "40px" }}>
          <h2>Your Answers & AI Feedback</h2>

          {answers.map((item, index) => (
            <div
              key={index}
              style={{
                border: "1px solid gray",
                padding: "15px",
                marginBottom: "15px",
                borderRadius: "8px",
              }}
            >
              <h4>Question:</h4>
              <p>{item.question}</p>

              <h4>Answer:</h4>
              <p>{item.answer}</p>

              <h4>AI Feedback:</h4>

              <pre
                style={{
                  whiteSpace: "pre-wrap",
                  background: "#f5f5f5",
                  padding: "10px",
                  borderRadius: "5px",
                }}
              >
                {String(item.evaluation)}
              </pre>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default App;