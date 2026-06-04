from fastapi import FastAPI, UploadFile, File
from pydantic import BaseModel
import shutil

from fastapi.responses import FileResponse
from fastapi.staticfiles import StaticFiles
from fastapi.middleware.cors import CORSMiddleware

from app.services.tts_service import text_to_speech
from app.services.llm_service import generate_response
from app.services.whisper_service import transcribe_audio


app = FastAPI()


app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


app.mount(
    "/audio",
    StaticFiles(directory="audio"),
    name="audio"
)


class ChatRequest(BaseModel):
    message: str


@app.get("/")
def home():

    return {
        "message": "Voice AI Assistant Backend Running"
    }


@app.post("/chat")
def chat(request: ChatRequest):

    ai_response = generate_response(
        f"Answer only in English: {request.message}"
    )

    return {
        "response": ai_response
    }


@app.post("/transcribe")
async def transcribe(file: UploadFile = File(...)):

    temp_audio_path = f"temp_{file.filename}"

    with open(temp_audio_path, "wb") as buffer:

        shutil.copyfileobj(file.file, buffer)

    result = transcribe_audio(temp_audio_path)

    return {
        "success": True,
        "text": result["text"]
    }


@app.post("/voice-chat")
async def voice_chat(file: UploadFile = File(...)):

    temp_audio_path = f"temp_{file.filename}"

    with open(temp_audio_path, "wb") as buffer:

        shutil.copyfileobj(file.file, buffer)

    transcription_result = transcribe_audio(
        temp_audio_path
    )

    user_text = transcription_result["text"]

    ai_response = generate_response(
        f"Answer only in English: {user_text}"
    )

    audio_path = text_to_speech(ai_response)

    return FileResponse(
        audio_path,
        media_type="audio/wav",
        filename="response.wav"
    )


@app.post("/voice-chat-json")
async def voice_chat_json(
    file: UploadFile = File(...)
):

    audio_path = f"audio/{file.filename}"

    with open(audio_path, "wb") as buffer:

        buffer.write(await file.read())

    transcription_result = transcribe_audio(
        audio_path
    )

    user_text = transcription_result["text"]

    ai_response = generate_response(
        f"Answer only in English: {user_text}"
    )

    text_to_speech(
        ai_response,
        "audio/response.wav"
    )

    return {
        "success": True,
        "transcribed_text": user_text,
        "response": ai_response
    }