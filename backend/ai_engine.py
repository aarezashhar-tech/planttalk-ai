translations = {
  "English": {
    "Analyzing latest field conditions...": "Analyzing latest field conditions...",
    "Please wait": "Please wait",
    "Severe heat and water stress detected.": "Severe heat and water stress detected.",
    "Irrigate immediately.": "Irrigate immediately.",
    "High humidity creating favorable conditions for fungal/pest attacks.": "High humidity creating favorable conditions for fungal/pest attacks.",
    "Apply preventive neem spray.": "Apply preventive neem spray.",
    "Current environmental conditions are optimal.": "Current environmental conditions are optimal.",
    "Maintain regular farming schedule.": "Maintain regular farming schedule."
  },
  "Tamil": {
    "Analyzing latest field conditions...": "சமீபத்திய கள நிலைகளை பகுப்பாய்வு செய்கிறது...",
    "Please wait": "காத்திருக்கவும்",
    "Severe heat and water stress detected.": "கடுமையான வெப்பம் மற்றும் நீர் அழுத்தம் கண்டறியப்பட்டது.",
    "Irrigate immediately.": "உடனடியாக நீர்ப்பாசனம் செய்யவும்.",
    "High humidity creating favorable conditions for fungal/pest attacks.": "அதிக ஈரப்பதம் பூஞ்சை/பூச்சி தாக்குதல்களுக்கு சாதகமான நிலைமைகளை உருவாக்குகிறது.",
    "Apply preventive neem spray.": "தடுப்பு வேப்ப எண்ணெய் தெளிக்கவும்.",
    "Current environmental conditions are optimal.": "தற்போதைய சுற்றுச்சூழல் நிலைமைகள் உகந்தவை.",
    "Maintain regular farming schedule.": "வழக்கமான விவசாய அட்டவணையை பராமரிக்கவும்."
  },
  "Hindi": {
    "Analyzing latest field conditions...": "नवीनतम क्षेत्र की स्थितियों का विश्लेषण...",
    "Please wait": "कृपया प्रतीक्षा करें",
    "Severe heat and water stress detected.": "गंभीर गर्मी और पानी के तनाव का पता चला है।",
    "Irrigate immediately.": "तुरंत सिंचाई करें।",
    "High humidity creating favorable conditions for fungal/pest attacks.": "उच्च आर्द्रता फंगल/कीट हमलों के लिए अनुकूल परिस्थितियां बना रही है।",
    "Apply preventive neem spray.": "निवारक नीम स्प्रे लागू करें।",
    "Current environmental conditions are optimal.": "वर्तमान पर्यावरणीय स्थितियां इष्टतम हैं।",
    "Maintain regular farming schedule.": "नियमित खेती का कार्यक्रम बनाए रखें।"
  }
}

def get_t(key, lang="English"):
    if lang in translations and key in translations[lang]:
        return translations[lang][key]
    return translations["English"].get(key, key)

def generate_crop_insights(temp, humidity, crop_type, language="English"):
    if temp > 35 and humidity < 40:
        return {
            "summary": get_t("Severe heat and water stress detected.", language),
            "action": get_t("Irrigate immediately.", language),
            "pestRisk": "LOW ✅",
            "health": "POOR 🔴"
        }
    elif humidity > 80 and temp >= 25 and temp <= 32:
        return {
            "summary": get_t("High humidity creating favorable conditions for fungal/pest attacks.", language),
            "action": get_t("Apply preventive neem spray.", language),
            "pestRisk": "HIGH ⚠️",
            "health": "FAIR 🟡"
        }
    
    return {
        "summary": get_t("Current environmental conditions are optimal.", language),
        "action": get_t("Maintain regular farming schedule.", language),
        "pestRisk": "LOW ✅",
        "health": "GOOD 🟢"
    }
