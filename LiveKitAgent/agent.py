import asyncio
from livekit.agents import AutoSubscribe, JobContext, Worker, run_app
from livekit.agents import stt, vad, tts
from livekit.agents import VoiceAssistant

# Assuming OpenAILLM and ChatContext are part of livekit.agents.llm
from livekit.agents.llm import OpenAILLM, ChatContext

async def entrypoint(ctx: JobContext):
    initial_ctx = ChatContext().append(
        role="system",
        text=(
            "You are a voice assistant created by LiveKit. Your interface with users will be voice. "
            "You should use short and concise responses, and avoid using unpronounceable punctuation."
        ),
    )

    await ctx.connect(auto_subscribe=AutoSubscribe.AUDIO_ONLY)

    assistant = VoiceAssistant(
        vad=vad.SileroVAD.load(),
        stt=stt.DeepgramSTT(),
        llm=OpenAILLM(),
        tts=tts.OpenAITTS(),
        chat_ctx=initial_ctx,
    )

    assistant.start(ctx.room)

    await asyncio.sleep(1)

    await assistant.say("Hey, how can I help you today?", allow_interruptions=True)

if __name__ == "__main__":
    run_app(Worker(entrypoint))