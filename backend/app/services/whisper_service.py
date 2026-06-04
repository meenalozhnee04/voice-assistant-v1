from faster_whisper import WhisperModel

model = WhisperModel(
    "medium",
    device="cpu",
    compute_type="int8"
)


def transcribe_audio(audio_path: str):

    segments, info = model.transcribe(
    audio_path,
    language="en"
    )

    detected_language = info.language

    full_text = ""

    for segment in segments:
        full_text += segment.text + " "

    return {
        "text": full_text.strip(),
        "language": detected_language
    }