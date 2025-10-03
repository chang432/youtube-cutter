from datetime import datetime
from enum import Enum

class Logger:
    class LogLevel(Enum):
        INFO = "INFO"
        DEBUG = "DEBUG"
        WARNING = "WARNING"
        ERROR = "ERROR"
        CRITICAL = "CRITICAL"

    def __init__(self, pid: int, yt_id: str):
        self.yt_id = yt_id
        self.pid = str(pid)

    def set_yt_id(self, yt_id: str):
        self.yt_id = yt_id

    def yt_log(self, message):
        print(f"[{self.pid}]-[{self.yt_id}] {message}", flush=True)

    @staticmethod
    def log(content, level=LogLevel.INFO.value):
        """ Default Loggger """
        timestamp = datetime.now().strftime("%d/%m/%Y %H:%M:%S")
        print(f"[{level.upper()}]-[{timestamp}]: {content}")