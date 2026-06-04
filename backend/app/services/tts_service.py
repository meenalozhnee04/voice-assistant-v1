import subprocess


def text_to_speech(text: str, output_path: str = "response.wav"):

    clean_text = text.encode(
        "ascii",
        errors="ignore"
    ).decode()

    command = [
        "piper",
        "--model",
        "app/models/tts/en_US-lessac-medium.onnx",
        "--output_file",
        output_path
    ]

    process = subprocess.Popen(
        command,
        stdin=subprocess.PIPE,
        text=True,
        encoding="utf-8"
    )

    process.communicate(clean_text)

    return output_path