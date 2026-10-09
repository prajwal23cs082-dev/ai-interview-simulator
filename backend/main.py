from starlette import responses
import google.generativeai as genai
from pydantic import BaseModel
from fastapi.middleware.cors import CORSMiddleware
import contextlib
from fastapi import FastAPI, UploadFile, File

# pyrefly: ignore [missing-import]
import fitz
import os

genai.configure(api_key=os.environ.get("GEMINI_API_KEY"))

model = genai.GenerativeModel("gemini-2.5-flash")
print("MAIN.PY LOADED SUCCESSFULLY")
app = FastAPI()
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

UPLOAD_FOLDER = "uploads"

os.makedirs(UPLOAD_FOLDER, exist_ok=True)
skills_database = [
    "Python",
    "Java",
    "C",
    "C++",
    "React",
    "MongoDB",
    "FastAPI",
    "Machine Learning",
    "HTML",
    "CSS",
    "JavaScript",
    "Node.js",
    "SQL"
]
questions_db = {

    "Python": [
        "What is OOP?",
        "What is a List?",
        "What is a Dictionary?"
    ],

    "React": [
        "What is JSX?",
        "What are React Hooks?"
    ],

    "MongoDB": [
        "What is NoSQL?",
        "Explain Collections."
    ],

    "MySQL": [
        "What is Primary Key?",
        "What is Normalization?"
    ],

    "JavaScript": [
        "What is a Closure?",
        "What is Hoisting?"
    ]
}
def extract_skills(text):

    found_skills = []

    for skill in skills_database:

        if skill.lower() in text.lower():
            found_skills.append(skill)

    return found_skills

@app.get("/")
def home():
    return {
        "message": "AI Interview Simulator Backend Running"
    }
    

@app.post("/upload-resume")
async def upload_resume(file: UploadFile = File(...)):

    file_path = os.path.join(
        UPLOAD_FOLDER,
        file.filename
    )

    with open(file_path, "wb") as buffer:
        buffer.write(await file.read())

    pdf = fitz.open(file_path)
    text = ""

    for page in pdf:
        text += page.get_text()

    pdf.close()

    skills = extract_skills(text)

    questions = []

    for skill in skills:
        if skill in questions_db:
            questions.extend(questions_db[skill])

    return {
        "skills": skills,
        "questions": questions
    }
from pydantic import BaseModel

# Request Model
class AnswerData(BaseModel):
    question: str
    answer: str


# Test Gemini
@app.get("/test-gemini")
async def test_gemini():
    try:
        response = model.generate_content("Hello")
        return {
            "result": response.text
        }
    except Exception as e:
        return {
            "error": str(e)
        }


# Evaluate Answer
@app.post("/evaluate")
async def evaluate_answer(data: AnswerData):
    try:
        prompt = f"""
Interview Question:
{data.question}

Candidate Answer:
{data.answer}

Evaluate this answer and provide:

1. Score out of 10
2. Strengths
3. Weaknesses
4. Improvements
"""

        response = model.generate_content(prompt)

        return {
            "evaluation": response.text
        }

    except Exception as e:
        return {
            "error": str(e)
        }


