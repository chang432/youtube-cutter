

class CustomLogger:
    def __init__(self, pid: int, yt_id: str):
        self.yt_id = yt_id
        self.pid = str(pid)

    def set_yt_id(self, yt_id: str):
        self.yt_id = yt_id

    def log(self, message):
        print(f"[{self.pid}]-[{self.yt_id}] {message}", flush=True)