import asyncio
import logging
from dotenv import load_dotenv
import os
import websockets
import json
import base64

from livekit.agents import AutoSubscribe, JobContext, Worker, WorkerOptions
from livekit.agents.voice_assistant import VoiceAssistant
from livekit.plugins import deepgram, openai, silero

# Load environment variables
load_dotenv()

# Debug: Print environment variables
print("LIVEKIT_URL:", os.getenv("LIVEKIT_URL"))
print("LIVEKIT_API_KEY:", os.getenv("LIVEKIT_API_KEY"))
print("LIVEKIT_API_SECRET:", os.getenv("LIVEKIT_API_SECRET"))
print("OPENAI_API_KEY:", os.getenv("OPENAI_API_KEY"))
print("DEEPGRAM_API_KEY:", os.getenv("DEEPGRAM_API_KEY"))

# Configure logging
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(name)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)

# Verify environment variables
required_env_vars = ['LIVEKIT_URL', 'LIVEKIT_API_KEY', 'LIVEKIT_API_SECRET', 'OPENAI_API_KEY', 'DEEPGRAM_API_KEY']
for var in required_env_vars:
    if not os.getenv(var):
        logger.error(f"Missing required environment variable: {var}")
        raise EnvironmentError(f"Missing required environment variable: {var}")

def prewarm_fnc(proc):
    try:
        proc.userdata["vad"] = silero.VAD.load()
        logger.info("VAD model preloaded successfully")
    except Exception as e:
        logger.error(f"Error preloading VAD model: {e}")
        raise

assistant = None

async def entrypoint(ctx: JobContext):
    global assistant
    try:
        initial_ctx = openai.ChatContext().append(
            role="system",
            text=(
                "You are a voice assistant created by LiveKit. Your interface with users will be voice. "
                "You should use short and concise responses, and avoid using unpronounceable punctuation."
            ),
        )

        await ctx.connect(auto_subscribe=AutoSubscribe.AUDIO_ONLY)
        logger.info("Connected to LiveKit room")

        assistant = VoiceAssistant(
            vad=ctx.proc.userdata["vad"],
            stt=deepgram.STT(),
            llm=openai.LLM(model="gpt-4"),
            tts=openai.TTS(voice="alloy"),
            chat_ctx=initial_ctx,
        )

        assistant.start(ctx.room)
        logger.info("VoiceAssistant started")

        await asyncio.sleep(1)

        await assistant.say("Hey, how can I help you today?", allow_interruptions=True)
        logger.info("Initial greeting sent")

        # Keep the assistant running
        while True:
            await asyncio.sleep(1)

    except Exception as e:
        logger.error(f"An error occurred in the entrypoint: {e}")
        raise

async def main():
    try:
        worker_options = WorkerOptions(
            entrypoint_fnc=entrypoint,
            prewarm_fnc=prewarm_fnc,
            ws_url=os.getenv("LIVEKIT_URL")
        )
        worker = Worker(worker_options)
        
        await asyncio.gather(
            worker.run(),
            start_server()
        )
    except Exception as e:
        logger.error(f"An error occurred in the main function: {e}")
        raise

if __name__ == "__main__":
    asyncio.run(main())