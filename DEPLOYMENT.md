# 🚀 Deployment Guide - Egress Calculator

## Quick Deploy to Streamlit Cloud (FREE)

### Step 1: Upload to GitHub
1. **Go to GitHub.com and sign in**
2. **Click "New repository"**
   - Repository name: `egress-calculator`
   - Description: `Professional IBC Egress & Occupant Load Calculator`
   - Make it **Public** (required for free Streamlit Cloud)
   - Don't initialize with README (we already have one)

3. **Follow GitHub's instructions to push your existing repository:**
   ```bash
   git remote add origin https://github.com/YOUR_USERNAME/egress-calculator.git
   git branch -M main
   git push -u origin main
   ```

### Step 2: Deploy on Streamlit Cloud
1. **Go to [share.streamlit.io](https://share.streamlit.io)**
2. **Sign in with your GitHub account**
3. **Click "New app"**
4. **Configure your app:**
   - Repository: `YOUR_USERNAME/egress-calculator`
   - Branch: `main`
   - Main file path: `app.py`
   - App URL (optional): `egress-calculator` or your preferred name

5. **Click "Deploy!"**
   - Streamlit will automatically install requirements
   - Your app will be live in 2-3 minutes
   - You'll get a URL like: `https://egress-calculator.streamlit.app`

### Step 3: Share Your App
- **Copy the public URL**
- **Share with colleagues, clients, or the community**
- **No login required for users**
- **Works on all devices and browsers**

## Alternative Deployment Options

### Railway (Also Free)
1. **Go to [railway.app](https://railway.app)**
2. **Sign in with GitHub**
3. **Create New Project → Deploy from GitHub repo**
4. **Select your repository**
5. **Railway auto-detects Python and deploys**

### Heroku (Free Tier)
1. **Create account at [heroku.com](https://heroku.com)**
2. **Install Heroku CLI**
3. **Run commands:**
   ```bash
   heroku create your-app-name
   git push heroku main
   ```

## Local Development

### Run Locally
```bash
# Install dependencies
pip install -r requirements.txt

# Run the app
streamlit run app.py
```

### Access at:
- **Local:** http://localhost:8501
- **Network:** http://YOUR_IP:8501

## Troubleshooting

### Common Issues:
1. **Requirements not found:** Make sure `requirements.txt` is in root directory
2. **App won't start:** Check that `app.py` is the main file
3. **Missing dependencies:** Verify all imports are in `requirements.txt`

### Support:
- **GitHub Issues:** Create an issue in your repository
- **Streamlit Community:** [discuss.streamlit.io](https://discuss.streamlit.io)
- **Documentation:** [docs.streamlit.io](https://docs.streamlit.io)

## Features Included ✅

- 🏗️ **Professional IBC Calculations**
- 📱 **Responsive Design (Mobile-friendly)**
- 🔄 **Imperial/Metric Unit Conversion**
- 🏢 **Multi-building Project Management**
- 💾 **Project Save/Load (JSON Export/Import)**
- 📊 **Calculation History & Analytics**
- 📖 **Direct IBC Code References**
- 📋 **Professional Report Generation**
- 🔧 **Advanced Door Width Calculations**
- ⚡ **Real-time Validation & Help**

## Share Your Success! 🎉

Once deployed, your calculator will be:
- **Accessible worldwide** with just a URL
- **Professional grade** for client presentations
- **Free to use** for your team and clients
- **Always up-to-date** (auto-deploys from GitHub)

**Example URL:** `https://your-egress-calculator.streamlit.app`
