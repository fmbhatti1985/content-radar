from app.core.config import settings
from app.providers.real import RealProvider

def get_provider():
    return RealProvider(settings)
