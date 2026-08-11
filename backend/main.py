import os

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from pydantic import BaseModel

from dotenv import load_dotenv

from openai import OpenAI


# Load environment variables
load_dotenv()


# Create OpenAI client
client = OpenAI(
    api_key=os.getenv("OPENAI_API_KEY")
)


# Create FastAPI application
app = FastAPI(
    title="SHIVA AI API",
    version="1.0.0"
)


# Allow frontend to communicate with backend
app.add_middleware(
    CORSMiddleware,

    allow_origins=["*"],

    allow_credentials=True,

    allow_methods=["*"],

    allow_headers=["*"]
)


# Request structure
class ChatRequest(BaseModel):

    message: str

    mode: str = "general"


# Mode instructions
MODE_INSTRUCTIONS = {

    "general":
        "You are SHIVA AI, a helpful personal AI assistant.",

    "developer":
        "You are SHIVA AI Developer Mode. Help with programming, debugging, software development and technical explanations.",

    "study":
        "You are SHIVA AI Study Mode. Explain academic concepts clearly and simply. Use examples when useful.",

    "resume":
        "You are SHIVA AI Resume Assistant. Help improve resumes, projects, skills and professional descriptions.",

    "research":
        "You are SHIVA AI Research Mode. Give structured, factual answers and clearly distinguish known information from uncertainty."
}


@app.get("/")
def home():

    return {
        "status": "online",
        "assistant": "SHIVA AI",
        "version": "1.0"
    }


@app.post("/chat")
def chat(request: ChatRequest):

    instruction = MODE_INSTRUCTIONS.get(
        request.mode,
        MODE_INSTRUCTIONS["general"]
    )

    system_prompt = f"""
You are SHIVA AI.

{instruction}

Your personality:
- Clear
- Intelligent
- Direct
- Helpful
- Concise
- Do not pretend to have performed actions you cannot perform.

The user is interacting with you through a voice-enabled web application.

Give answers that work well both as text and spoken responses.
"""

    try:

        response = client.responses.create(

            model="gpt-5-mini",

            instructions=system_prompt,

            input=request.message

        )

        reply = response.output_text

        return {
            "reply": reply
        }

    except Exception as error:

        print("ERROR:", error)

        return {
            "reply":
            "Sorry, SHIVA AI could not process that request."
        }