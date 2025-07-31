# BeatTeller Deployment Instructions

This document provides detailed instructions for deploying the BeatTeller backend to Render and the frontend to Netlify.

## 🚀 Backend Deployment to Render

Render is a unified cloud to build and run all your apps and websites with a single platform. It supports various services including web services, databases, and more.

### 1. Prepare your Backend Code

Ensure your `backend` directory is clean and ready for deployment. The `requirements.txt` file should list all Python dependencies.

### 2. Create a Render Account

If you don't have one, sign up for a Render account at [https://render.com/](https://render.com/).

### 3. Create a New Web Service on Render

1. Log in to your Render dashboard.
2. Click on **New +** and select **Web Service**.
3. Connect your GitHub repository where the BeatTeller project is hosted. If you haven't pushed your code to GitHub yet, do so first.
4. Select the `backend` directory as the **Root Directory**.

### 4. Configure Web Service Settings

Configure the following settings for your web service:

- **Name**: `beatteller-backend` (or your preferred name)
- **Region**: Choose a region close to your users
- **Branch**: `main` (or your deployment branch)
- **Runtime**: `Python 3`
- **Build Command**: `pip install -r requirements.txt`
- **Start Command**: `gunicorn -w 4 -b 0.0.0.0:$PORT src.main:app`
  - *Note*: Render automatically sets the `$PORT` environment variable.

### 5. Add Environment Variables

Add the environment variables required by your Flask application (from your `.env` file) under the **Environment** section in Render. For example:

- `QLOO_API_KEY`: `your_qloo_key_here`
- `GEMINI_API_KEY`: `your_gemini_key_here`
- `FLASK_ENV`: `production`
- `FLASK_DEBUG`: `False`
- `SECRET_KEY`: `a_strong_secret_key` (Generate a strong, unique key)
- `DATABASE_URL`: `sqlite:///src/database/app.db` (or your production database URL if using PostgreSQL/MySQL)

### 6. Deploy

Click **Create Web Service**. Render will automatically build and deploy your backend. You can monitor the deployment logs in the Render dashboard.

### 7. Get your Backend URL

Once deployed, Render will provide a public URL for your backend service (e.g., `https://beatteller-backend.onrender.com`). You will need this URL for your frontend configuration.

## 🌐 Frontend Deployment to Netlify

Netlify is a powerful platform for deploying static sites and frontend applications. It integrates seamlessly with GitHub.

### 1. Prepare your Frontend Code

Ensure your `frontend` directory is clean and ready. The production build will be located in `frontend/dist` after running `npm run build`.

### 2. Create a Netlify Account

If you don't have one, sign up for a Netlify account at [https://www.netlify.com/](https://www.netlify.com/).

### 3. Create a New Site from Git

1. Log in to your Netlify dashboard.
2. Click on **Add new site** and select **Import an existing project**.
3. Connect your GitHub repository where the BeatTeller project is hosted.
4. Select the `frontend` directory as the **Base directory**.

### 4. Configure Build Settings

Configure the following build settings:

- **Owner**: Your GitHub username/organization
- **Repository**: Your BeatTeller repository
- **Branch to deploy**: `main` (or your deployment branch)
- **Base directory**: `frontend`
- **Build command**: `npm run build`
- **Publish directory**: `frontend/dist`

### 5. Add Environment Variables (Optional for Frontend)

If your frontend needs any environment variables (e.g., the backend API URL), you can add them under **Build & deploy > Environment** in Netlify. For example:

- `VITE_API_BASE_URL`: `https://beatteller-backend.onrender.com/api` (Replace with your actual Render backend URL)

*Note*: For Vite, environment variables must be prefixed with `VITE_` to be exposed to the client-side code.

### 6. Deploy

Click **Deploy site**. Netlify will automatically build and deploy your frontend. You can monitor the deployment logs in the Netlify dashboard.

### 7. Update Frontend API URL

After deploying your backend to Render, you must update the `API_BASE_URL` in your frontend code (`frontend/src/App.jsx` or similar) to point to your Render backend URL. For example:

```javascript
const API_BASE_URL = 'https://beatteller-backend.onrender.com/api'; // Replace with your Render URL
```

Then, commit this change to your GitHub repository and trigger a new deploy on Netlify.

## 🎉 Post-Deployment

- **Test your application**: Access your Netlify frontend URL and ensure all features work correctly by interacting with your Render backend.
- **Custom Domains**: Configure custom domains for both your Render backend and Netlify frontend if desired.
- **Monitoring**: Utilize Render and Netlify dashboards for monitoring logs, performance, and usage.

Good luck with your deployment!

