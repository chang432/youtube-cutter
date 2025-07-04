FROM python:3.11-slim

WORKDIR /opt/app

COPY requirements.txt ./
RUN pip install --no-cache-dir -r requirements.txt

COPY app ./

CMD [ "bash", "deploy.sh" ]
