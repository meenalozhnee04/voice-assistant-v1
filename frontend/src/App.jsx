import { useState, useRef, useEffect } from "react";

function App() {

  const [recording, setRecording] = useState(false);

  const [liveText, setLiveText] = useState("");

  const [responseText, setResponseText] = useState("");

  const [displayedText, setDisplayedText] = useState("");

  const [status, setStatus] = useState("READY");

  const mediaRecorderRef = useRef(null);

  const audioChunksRef = useRef([]);

  const recognitionRef = useRef(null);

  useEffect(() => {

    if (!responseText) return;

    let index = 0;

    setDisplayedText("");

    const interval = setInterval(() => {

      setDisplayedText(
        responseText.slice(0, index)
      );

      index++;

      if (index > responseText.length) {

        clearInterval(interval);
      }

    }, 22);

    return () => clearInterval(interval);

  }, [responseText]);

  const startRecording = async () => {

    setLiveText("");

    setResponseText("");

    setDisplayedText("");

    setStatus("LISTENING");

    try {

      const SpeechRecognition =
        window.SpeechRecognition ||
        window.webkitSpeechRecognition;

      const recognition = new SpeechRecognition();

      recognition.continuous = true;

      recognition.interimResults = true;

      recognition.lang = "en-US";

      recognition.onresult = (event) => {

        let transcript = "";

        for (
          let i = 0;
          i < event.results.length;
          i++
        ) {

          transcript +=
            event.results[i][0].transcript;
        }

        setLiveText(transcript);
      };

      recognition.start();

      recognitionRef.current = recognition;

      const stream =
        await navigator.mediaDevices.getUserMedia({
          audio: true
        });

      const mediaRecorder =
        new MediaRecorder(stream);

      mediaRecorderRef.current = mediaRecorder;

      audioChunksRef.current = [];

      mediaRecorder.ondataavailable = (event) => {

        audioChunksRef.current.push(event.data);
      };

      mediaRecorder.onstop = async () => {

        recognition.stop();

        setStatus("PROCESSING");

        const audioBlob =
          new Blob(audioChunksRef.current, {
            type: "audio/wav"
          });

        const formData = new FormData();

        formData.append(
          "file",
          audioBlob,
          "recording.wav"
        );

        try {

          const response = await fetch(
            "http://127.0.0.1:8000/voice-chat-json",
            {
              method: "POST",
              body: formData
            }
          );

          const data = await response.json();

          setResponseText(data.response);

          const audio =
            new Audio(
            `http://127.0.0.1:8000/audio/response.wav?t=${Date.now()}`
            );
          audio.play();

          setStatus("RESPONDING");

          audio.onended = () => {

            setStatus("READY");
          };

        } catch (error) {

          console.error(error);

          setStatus("BACKEND ERROR");
        }
      };

      mediaRecorder.start();

      setRecording(true);

    } catch (error) {

      console.error(error);

      setStatus("MIC ERROR");
    }
  };

  const stopRecording = () => {

    mediaRecorderRef.current.stop();

    setRecording(false);
  };

  return (

    <div
      style={{
        width: "100vw",
        height: "100vh",
        background: "#050505",
        overflow: "hidden",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        position: "fixed",
        top: 0,
        left: 0,
        fontFamily: "Arial, sans-serif"
      }}
    >

      {/* BACKGROUND GLOW */}

      <div
        style={{
          position: "absolute",
          width: "700px",
          height: "700px",
          borderRadius: "50%",
          background:
            "radial-gradient(circle, rgba(255,215,0,0.12) 0%, rgba(255,215,0,0.03) 40%, transparent 75%)",
          filter: "blur(40px)"
        }}
      />

      {/* MAIN CONTENT */}

        <div
          style={{
            width: "100%",
            maxWidth: "1000px",
            height: "100vh",

            padding: "30px 40px",

            boxSizing: "border-box",

            display: "flex",
            flexDirection: "column",

            alignItems: "center",

            justifyContent: "space-between",

            zIndex: 2
          }}
        >

        {/* TITLE */}

        <h1
          style={{
            color: "white",
            fontSize: "58px",
            fontWeight: "600",
            marginBottom: "18px",
            letterSpacing: "-2px"
          }}
        >
          Voice Assistant
        </h1>

        {/* STATUS */}

        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "10px",
            marginBottom: "30px"
          }}
        >

          <div
            style={{
              width: "10px",
              height: "10px",
              borderRadius: "50%",
              background: "#ffd54f",
              boxShadow: "0 0 10px #ffd54f"
            }}
          />

          <div
            style={{
              color: "#f5d97b",
              fontSize: "24px",
              fontWeight: "400",
              letterSpacing: "1px"
            }}
          >
            {status}
          </div>

        </div>

        {/* USER SPEECH */}

        <div
          style={{
            minHeight: "60px",
            width: "80%",
            textAlign: "center",
            color: "#2f8fff",
            fontSize: "32px",
            marginBottom: "35px",
            fontWeight: "500"
          }}
        >
          {liveText}
        </div>

        {/* AI RESPONSE */}

        <div
          style={{
            width: "78%",
            minHeight: "100px",
            maxHeight: "220px",
            marginBottom: "40px",

            textAlign: "center",
            color: "white",

            overflowY: "auto",
            overflowX: "hidden",

            fontSize:
              displayedText.length > 500
                ? "20px"
                : displayedText.length > 300
                ? "26px"
                : "34px",

            lineHeight: "1.5",
            fontWeight: "300",

            wordWrap: "break-word",
            whiteSpace: "pre-wrap",

            marginTop: "10px",
            padding: "0 20px",

            scrollbarWidth: "thin",
            scrollbarColor: "#d4af37 transparent"
          }}
        >
          {displayedText}
        </div>

        {/* MIC BUTTON */}

        <div
          style={{
            marginTop: "0px",
            marginBottom: "40px",
            position: "relative",
            display: "flex",
            justifyContent: "center",
            alignItems: "center"
          }}
        >

          {/* BUTTON GLOW */}

          <div
            style={{
              position: "absolute",
              width: "140px",
              height: "140px",
              borderRadius: "50%",
              background:
                "radial-gradient(circle, rgba(255,215,0,0.18) 0%, transparent 70%)",
              filter: "blur(15px)"
            }}
          />

          {!recording ? (

            <button
              onClick={startRecording}
              style={{
                width: "95px",
                height: "95px",
                borderRadius: "50%",
                border: "2px solid #d4af37",
                background: "rgba(212,175,55,0.08)",
                color: "#ffd54f",
                fontSize: "38px",
                cursor: "pointer",
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                backdropFilter: "blur(10px)",
                boxShadow:
                  "0 0 20px rgba(255,215,0,0.15)",
                zIndex: 2
              }}
            >
              🎙
            </button>

          ) : (

            <button
              onClick={stopRecording}
              style={{
                width: "95px",
                height: "95px",
                borderRadius: "50%",
                border: "none",
                background: "#ff3b30",
                color: "white",
                fontSize: "18px",
                fontWeight: "bold",
                cursor: "pointer",
                zIndex: 2
              }}
            >
              STOP
            </button>

          )}

        </div>

      </div>

    </div>
  );
}

export default App;