// ===== CONFIGURATION FILE =====
// Connects frontend to your Google Apps Script
const CONFIG = {
  SHEET_JSON_URL: "https://script.google.com/macros/s/AKfycbwHBOSIKaGgXarjHlQhe8VAvFSWVD0Mp0GlgWsaxrHtjoYYhrBvUUpVNYOaqC_bsY31_Q/exec",
  SHEET_UPDATE_URL: "https://script.google.com/macros/s/AKfycbwHBOSIKaGgXarjHlQhe8VAvFSWVD0Mp0GlgWsaxrHtjoYYhrBvUUpVNYOaqC_bsY31_Q/exec",
  COUNSELOR_TABS: ["Counselor1","Counselor2","Counselor3","Counselor4","Counselor5","Counselor6","Counselor7","Counselor8"],
  MISSIONS: [
    "Complete assessments",
    "Create a Binder or Folder",
    "Explore: Interests and Careers",
    "Read and Build Vocabulary 1",
    "Strengthen Your Future College Application",
    "Get Involved at School",
    "Read and Build Vocabulary 2",
    "Volunteer and Give Back",
    "Build Your Resume",
    "Plan for Summer Opportunities",
    "Passion Project 1: Learn",
    "Passion Project 2: Brainstorm",
    "Passion Project 3: Choose",
    "Stay Informed",
    "Read and Build Vocabulary 3",
    "PSAT Prep",
    "AP Prep",
    "Organize Study Space",
    "Create Personal Action Plan",
    "Add Your Counselor to Contacts"
  ],
  ASSET_FOR(idx){ return `assets/mission${idx+1}.png`; }
};
