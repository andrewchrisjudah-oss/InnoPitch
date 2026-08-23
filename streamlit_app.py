import streamlit as st

from app_pages.feed import render_feed


st.set_page_config(
    page_title="Syllabite — Learn in your scroll",
    page_icon=":material/school:",
    layout="wide",
    initial_sidebar_state="expanded",
)

render_feed()
