from app.config.elevenlabs import elevenlabs_client, ElevenLabsClient

def get_elevenlabs_client() -> ElevenLabsClient:
    return elevenlabs_client