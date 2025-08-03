# 🏗️ Egress & Occupant Load Calculator

Professional IBC-based calculations for architectural design with an intuitive Streamlit interface.

## ✨ Features

- **Multi-building Projects**: Manage multiple buildings within a single project
- **Unit Conversion**: Toggle between Imperial and Metric units
- **Advanced Calculations**: Door width, travel distance, and exit distributions
- **Project Management**: Save, load, and export projects as JSON
- **Calculation History**: Track and review previous calculations
- **Code References**: Direct links to relevant IBC sections
- **Professional Reports**: Detailed calculation summaries and exports
- **Responsive Design**: Works on desktop, tablet, and mobile

## 🚀 Quick Start

### Local Development

1. **Clone or download the files**
   ```bash
   git clone <your-repo-url>
   cd egress-calculator
   ```

2. **Install dependencies**
   ```bash
   pip install -r requirements.txt
   ```

3. **Run the application**
   ```bash
   streamlit run app.py
   ```

4. **Open in browser**
   - The app will automatically open at `http://localhost:8501`

### 🌐 Free Hosting Options

#### Option 1: Streamlit Cloud (Recommended)
1. **Push to GitHub**
   - Create a GitHub repository
   - Upload `app.py` and `requirements.txt`

2. **Deploy on Streamlit Cloud**
   - Go to [share.streamlit.io](https://share.streamlit.io)
   - Sign in with GitHub
   - Click "New app"
   - Select your repository
   - Set main file path: `app.py`
   - Click "Deploy"

3. **Share your app**
   - Get a public URL like `https://your-app-name.streamlit.app`
   - Share this link with anyone!

#### Option 2: Railway
1. **Connect GitHub repo to Railway**
   - Go to [railway.app](https://railway.app)
   - Sign in and create new project
   - Connect your GitHub repository

2. **Configure deployment**
   - Railway auto-detects Python and installs requirements
   - Set start command: `streamlit run app.py --server.port $PORT`

3. **Get public URL**
   - Railway provides a free public URL

#### Option 3: Heroku
1. **Create additional files**
   
   Create `setup.sh`:
   ```bash
   mkdir -p ~/.streamlit/
   echo "\
   [general]\n\
   email = \"your-email@domain.com\"\n\
   " > ~/.streamlit/credentials.toml
   echo "\
   [server]\n\
   headless = true\n\
   enableCORS=false\n\
   port = \$PORT\n\
   " > ~/.streamlit/config.toml
   ```
   
   Create `Procfile`:
   ```
   web: sh setup.sh && streamlit run app.py
   ```

2. **Deploy to Heroku**
   - Create Heroku app
   - Connect to GitHub repository
   - Enable automatic deploys

## 📱 How to Use

### Basic Workflow
1. **Start a Project**: Enter a project name in the sidebar
2. **Add Buildings**: Use the building management controls
3. **Enter Parameters**: Fill in state, IBC version, occupancy, area, and sprinkler status
4. **Calculate**: Click "Calculate Egress Requirements"
5. **Review Results**: View occupant load and egress width requirements
6. **Export/Share**: Download summaries or export the entire project

### Advanced Features
- **Toggle Units**: Switch between Imperial (ft², inches) and Metric (m², mm)
- **Advanced Options**: Enable for door width and travel distance calculations
- **History**: Review all previous calculations
- **Code References**: Click links to view relevant IBC sections
- **Multi-building**: Navigate between buildings in complex projects

## 🔧 Technical Details

### Calculations Based On:
- **IBC 2012, 2015, 2018, 2021** occupant load factors
- **Standard egress capacity factors** (with/without sprinklers)
- **Minimum door width requirements** (32" minimum)
- **Travel distance considerations** for advanced calculations

### Data Storage:
- **Session-based**: Data persists during browser session
- **Export/Import**: JSON format for project portability
- **No server storage**: All data stays on user's device

### Browser Compatibility:
- ✅ Chrome, Firefox, Safari, Edge
- ✅ Mobile browsers (iOS Safari, Chrome Mobile)
- ✅ Tablet browsers

## 🏗️ Architecture

```
egress-calculator/
├── app.py              # Main Streamlit application
├── requirements.txt    # Python dependencies
├── README.md          # This file
└── .streamlit/        # Streamlit configuration (optional)
    └── config.toml
```

## 🎯 Use Cases

- **Architects**: Preliminary egress design and code compliance
- **Engineers**: Building code analysis and verification
- **Code Officials**: Quick calculation verification
- **Students**: Learning building code requirements
- **Consultants**: Client presentations and reports

## 📊 Sample Calculation

**Input:**
- Building: Business occupancy, 2021 IBC
- Area: 10,000 sq ft (gross)
- Sprinklers: Yes

**Output:**
- Occupant Load: 67 people (10,000 ÷ 150)
- Stair Width: 14 inches (67 × 0.2)
- Other Components: 11 inches (67 × 0.15)

## 🔐 Privacy & Security

- **No data collection**: App doesn't collect or store personal information
- **Local processing**: All calculations happen in your browser
- **Optional export**: You control all data export/sharing
- **Open source**: Code is transparent and auditable

## 🤝 Contributing

Want to improve the calculator? Here's how:

1. **Report Issues**: Use GitHub issues for bugs or feature requests
2. **Fork & PR**: Submit improvements via pull requests
3. **Documentation**: Help improve these docs
4. **Testing**: Test with different IBC scenarios

## 📄 License

This project is open source and available under the MIT License.

## ⚠️ Important Disclaimer

**This calculator is for preliminary design purposes only.** 

- Always verify with local building authorities
- Check for local amendments to IBC
- Confirm current code versions in your jurisdiction
- Consult with licensed professionals for final designs

## 🆘 Support

- **Issues**: Report bugs on GitHub
- **Questions**: Create a GitHub discussion
- **Email**: your-email@domain.com

---

**Made with ❤️ for the architectural community**
