Deployment guide

1) Backend Dockerfile (already added)

Build and run locally:

```bash
# from backend/ directory
docker build -t nmdc-backend:latest .
docker run -p 8000:8000 nmdc-backend:latest
```

API will be available at http://localhost:8000

2) Push to GitHub

```bash
# root of repo
git init
git add .
git commit -m "Add Dockerfiles and deployment guide"
# create repo on GitHub and push
git remote add origin <YOUR_GIT_REMOTE_URL>
git push -u origin main
```

3) Deploy to Render using Docker

- Create a new service → "Web Service"
- Connect your GitHub repo and select the repo
- Select Docker as the environment and point to `backend/Dockerfile`
- Set build and start commands if Render asks; the Dockerfile's `CMD` will run Uvicorn
- Render will expose the service and provide a public URL (eg. `https://your-app.onrender.com`)

4) CORS

`main.py` already enables CORS for all origins:

```py
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
```

5) Connect frontend

- If you deploy frontend separately (Vercel): set a runtime environment variable or directly call the API URL from the deployed frontend.
- Example: if Render gives `https://nmdc-backend.onrender.com`, update your frontend API base to `https://nmdc-backend.onrender.com` and redeploy.

6) Notes

- Render automatically maps container port 8000.
- Ensure the Excel file `NEW NMDC_Employee_Master_1500.xlsx` is present in the backend repository (it currently is in the `backend/` directory).
- If you prefer to serve static frontend from Render too, build the frontend and copy files into an nginx image using `Dockerfile.frontend`.
