import os
from typing import Any

import httpx
from fastapi import FastAPI, HTTPException
from pydantic import BaseModel, Field

app = FastAPI(title="FTN AI Service", version="1.0.0")

class TaskIn(BaseModel):
    task: str = Field(min_length=1, max_length=10000)
    context: str = Field(default="", max_length=10000)

class TaskOut(BaseModel):
    status: str
    engine: str
    task: str
    analysis: dict[str, Any]

@app.get("/healthz")
def healthz():
    return {"status": "ok", "service": "ftn-ai-service"}

@app.post("/run", response_model=TaskOut)
def run_task(body: TaskIn):
    task = body.task.strip()
    if not task:
        raise HTTPException(400, "task cannot be empty")
    return TaskOut(
        status="validated",
        engine="FTN-Pydantic-Core",
        task=task,
        analysis={
            "characters": len(task),
            "context_attached": bool(body.context.strip()),
            "ready_for_provider": True,
        },
    )

class HFIn(BaseModel):
    model: str = Field(min_length=1, max_length=200, pattern=r"^[A-Za-z0-9_.\-/]+$")
    prompt: str = Field(min_length=1, max_length=10000)

@app.post("/huggingface")
async def huggingface(body: HFIn):
    token = os.getenv("HF_TOKEN", "").strip()
    if not token:
        raise HTTPException(503, "HF_TOKEN is not configured on the server")
    url = f"https://api-inference.huggingface.co/models/{body.model}"
    headers = {"Authorization": f"Bearer {token}"}
    try:
        async with httpx.AsyncClient(timeout=90) as client:
            response = await client.post(url, headers=headers, json={"inputs": body.prompt})
        if response.status_code >= 400:
            raise HTTPException(response.status_code, response.text[:1000])
        return response.json()
    except httpx.TimeoutException:
        raise HTTPException(504, "Hugging Face request timed out")

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("app:app", host="127.0.0.1", port=int(os.getenv("AI_PORT", "8000")))
