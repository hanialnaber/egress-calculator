@echo off
echo Starting Egress Calculator...
echo.
echo Installing/updating dependencies...
pip install -r requirements.txt
echo.
echo Starting Streamlit app...
echo Your app will open at: http://localhost:8501
echo.
echo Press Ctrl+C to stop the server
echo.
streamlit run app.py
