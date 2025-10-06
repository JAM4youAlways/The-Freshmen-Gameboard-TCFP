// ===== CONFIGURATION FILE =====
// Connects your frontend to your Google Apps Script web app

const CONFIG = {
  // Use the same URL for both JSON fetch (doGet) and update (doPost)
  SHEET_JSON_URL: "https://script.google.com/macros/s/AKfycbyx8fcaj9ciYBxrrH6U3V_3ggBdsey78pzQRSdN1uir2rqyxfig0Rv2243QZeBotquWag/exec",
  SHEET_UPDATE_URL: "https://script.google.com/macros/s/AKfycbyx8fcaj9ciYBxrrH6U3V_3ggBdsey78pzQRSdN1uir2rqyxfig0Rv2243QZeBotquWag/exec",

  // EXACT mission names (must match counselor tab order C→V)
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
  ]
};
