from datetime import datetime

class Logger:
    @staticmethod
    def log(content, *args):
        """ Default Loggger """
        timestamp = datetime.now().strftime("%d/%m/%Y %H:%M:%S")
        header_str = f"[{timestamp}]"
        for arg in args:
            header_str += f"-[{str(arg)}]"
        header_str += ": "
        print(f"{header_str}{content}", flush=True)