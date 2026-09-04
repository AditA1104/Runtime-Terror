import { NotificationItem } from '../types/schema';
import { SupportedLang } from '../hooks/useTranslation';

export function formatNotificationMessage(notif: NotificationItem, lang: SupportedLang): string {
  const msg = notif.message || '';

  // 1. Check templateType if available
  if (notif.templateType) {
    const { token, crop, center, queuePos, weightKg, amount, recipientPhone } = notif.meta || {};
    switch (notif.templateType) {
      case 'BOOKED':
        switch (lang) {
          case 'kn': return 'AgriQ: ಸ್ಲಾಟ್ ದೃಢೀಕರಿಸಲಾಗಿದೆ! ' + (center || 'ಮಂಡಿ') + 'ಯಲ್ಲಿ ' + (crop || 'ಬೆಳೆ') + 'ಗಾಗಿ ಟೋಕನ್ ' + (token || '') + ' ರಚಿಸಲಾಗಿದೆ. ಸರತಿ ಸ್ಥಾನ: #' + (queuePos || 1) + '. QR ಪಾಸ್ ಸಿದ್ಧವಾಗಿಡಿ.';
          case 'hi': return 'AgriQ: स्लॉट कन्फर्म हुआ! ' + (center || 'मंडी') + ' में ' + (crop || 'फसल') + ' के लिए टोकन ' + (token || '') + ' जारी किया गया। कतार स्थिति: #' + (queuePos || 1) + '। क्यूआर पास तैयार रखें।';
          case 'mr': return 'AgriQ: स्लॉट निश्चित झाला! ' + (center || 'बाजार समिती') + ' येथे ' + (crop || 'पीक') + ' साठी टोकन ' + (token || '') + ' तयार करण्यात आले. रांग क्रमांक: #' + (queuePos || 1) + '. क्यूआर पास तयार ठेवा.';
          case 'te': return 'AgriQ: స్లాట్ ఖరారైంది! ' + (center || 'మార్కెట్') + ' లో ' + (crop || 'పంట') + ' కోసం టోకెన్ ' + (token || '') + ' జారీ చేయబడింది. క్యూ స్థానం: #' + (queuePos || 1) + '.';
          case 'pa': return 'AgriQ: ਸਲਾਟ ਪੱਕਾ! ' + (center || 'ਮੰਡੀ') + ' ਵਿਖੇ ' + (crop || 'ਫਸਲ') + ' ਲਈ ਟੋਕਨ ' + (token || '') + ' ਜਾਰੀ ਕੀਤਾ ਗਿਆ। ਲਾਈਨ ਨੰਬਰ: #' + (queuePos || 1) + '।';
          default: return 'AgriQ: Slot confirmed! Token ' + (token || '') + ' generated for ' + (crop || '') + ' at ' + (center || '') + '. Queue Pos: #' + (queuePos || 1) + ' at this mandi. Keep QR pass ready.';
        }

      case 'CHECKED_IN':
        switch (lang) {
          case 'kn': return 'AgriQ: ' + (center || 'ಮಂಡಿ') + ' ಗೇಟ್ ಚೆಕ್-ಇನ್ ಪೂರ್ಣಗೊಂಡಿದೆ. ಧರ್ಮಕಾಟಾ (ವೇಬ್ರಿಡ್ಜ್ ಲೇನ್ 2) ಗೆ ತೆರಳಿ.';
          case 'hi': return 'AgriQ: ' + (center || 'मंडी') + ' पर चेक-इन पूरा हुआ। धर्मकांटा (वेब्रिज लेन 2) पर जाएं।';
          case 'mr': return 'AgriQ: ' + (center || 'बाजार समिती') + ' येथे प्रवेश चेक-इन पूर्ण. वजन काटा (वेब्रिज लेन २) कडे जा.';
          case 'te': return 'AgriQ: ' + (center || 'మార్కెట్') + ' గేట్ చెక్-ఇన్ పూర్తయింది. వేబ్రిడ్జ్ లేన్ 2 కి వెళ్ళండి.';
          case 'pa': return 'AgriQ: ' + (center || 'ਮੰਡੀ') + ' ਗੇਟ ਤੇ ਚੈੱਕ-ਇਨ ਪੂਰਾ ਹੋਇਆ। ਕੰਡੇ (ਵੇਬ੍ਰਿਜ ਲਾਈਨ 2) ਤੇ ਜਾਓ।';
          default: return 'AgriQ: Checked in at ' + (center || 'Mandi Yard') + '. Proceed to Weighbridge Lane 2.';
        }

      case 'WEIGHED':
        switch (lang) {
          case 'kn': return 'AgriQ: ವೇಬ್ರಿಡ್ಜ್ ತೂಕ ಪೂರ್ಣಗೊಂಡಿದೆ. ಒಟ್ಟು ತೂಕ: ' + (weightKg || 2500) + ' ಕೆಜಿ ದಾಖಲಾಗಿದೆ. ಗುಣಮಟ್ಟ ಪರೀಕ್ಷಾ ಬೂತ್‌ಗೆ ತೆರಳಿ.';
          case 'hi': return 'AgriQ: वेब्रिज तौल पूर्ण। कुल वजन: ' + (weightKg || 2500) + ' किग्रा दर्ज किया गया। गुणवत्ता परख केंद्र पर जाएं।';
          case 'mr': return 'AgriQ: वेब्रिज वजन पूर्ण. एकूण वजन: ' + (weightKg || 2500) + ' किलो नोंदवले गेले. गुणवत्ता तपासणी केंद्राकडे जा.';
          case 'te': return 'AgriQ: వేబ్రిడ్జ్ బరువు నమోదు పూర్తయింది. మొత్తం బరువు: ' + (weightKg || 2500) + ' కిలోలు. నాణ్యత బూత్ కి వెళ్ళండి.';
          case 'pa': return 'AgriQ: ਵੇਬ੍ਰਿਜ ਤੋਲ ਮੁਕੰਮਲ। ਕੁੱਲ ਵਜ਼ਨ: ' + (weightKg || 2500) + ' ਕਿਲੋਗ੍ਰਾਮ ਦਰਜ। ਗੁਣਵੱਤਾ ਪਰਖ ਬੂਥ ਤੇ ਜਾਓ।';
          default: return 'AgriQ: Weighbridge completed. Gross weight recorded: ' + (weightKg || 2500) + ' kg. Proceed to Assayer Booth.';
        }

      case 'QUALITY_APPROVED':
        switch (lang) {
          case 'kn': return 'AgriQ: ಗುಣಮಟ್ಟ ಪರೀಕ್ಷೆ ತೇರ್ಗಡೆಯಾಗಿದೆ! ಗ್ರೇಡ್ A ಮಂಜೂರಾಗಿದೆ. DBT ಗಾಗಿ ಅಕೌಂಟ್ಸ್ ಕೌಂಟರ್‌ಗೆ ತೆರಳಿ.';
          case 'hi': return 'AgriQ: गुणवत्ता जांच पास! ग्रेड A स्वीकृत। डीबीटी भुगतान के लिए लेखा काउंटर पर जाएं।';
          case 'mr': return 'AgriQ: गुणवत्ता चाचणी उत्तीर्ण! ग्रेड A मंजूर. DBT खात्यासाठी अकौंट्स काउंटरकडे जा.';
          case 'te': return 'AgriQ: నాణ్యత తనిఖీ ఆమోదించబడింది! గ్రేడ్ A కేటాయించబడింది. ఖాతాల కౌంటర్ కి వెళ్ళండి.';
          case 'pa': return 'AgriQ: ਗੁਣਵੱਤਾ ਜਾਂਚ ਪਾਸ! ਗ੍ਰੇਡ A ਮਨਜ਼ੂਰ। DBT ਲਈ ਅਕਾਊਂਟਸ ਕਾਊਂਟਰ ਤੇ ਜਾਓ।';
          default: return 'AgriQ: Quality Assayer passed! Grade A assigned. Proceed to Accounts Counter.';
        }

      case 'PAYMENT_INITIATED':
        switch (lang) {
          case 'kn': return 'AgriQ: ₹' + (amount?.toLocaleString('en-IN') || '1,22,300') + ' ಮೊತ್ತವನ್ನು ನಿಮ್ಮ ಆಧಾರ್ ಲಿಂಕ್ಡ್ ಬ್ಯಾಂಕ್ ಖಾತೆಗೆ DBT ಮೂಲಕ ವರ್ಗಾಯಿಸಲಾಗುತ್ತಿದೆ.';
          case 'hi': return 'AgriQ: ₹' + (amount?.toLocaleString('en-IN') || '1,22,300') + ' का भुगतान आपके आधार लिंक बैंक खाते में डीबीटी (DBT) द्वारा भेजा जा रहा है।';
          case 'mr': return 'AgriQ: ₹' + (amount?.toLocaleString('en-IN') || '1,22,300') + ' ची रक्कम आपल्या आधार लिंक बँक खात्यात DBT द्वारे जमा होत आहे.';
          case 'te': return 'AgriQ: ₹' + (amount?.toLocaleString('en-IN') || '1,22,300') + ' మొత్తం మీ ఆధార్ లింక్డ్ బ్యాంక్ ఖాతాకు DBT ద్వారా బదిలీ చేయబడుతోంది.';
          case 'pa': return 'AgriQ: ₹' + (amount?.toLocaleString('en-IN') || '1,22,300') + ' ਦਾ ਭੁਗਤਾਨ ਤੁਹਾਡੇ ਆਧਾਰ ਲਿੰਕਡ ਬੈਂਕ ਖਾਤੇ ਵਿੱਚ DBT ਰਾਹੀਂ ਭੇਜਿਆ ਜਾ ਰਿਹਾ ਹੈ।';
          default: return 'AgriQ: Payment of ₹' + (amount?.toLocaleString('en-IN') || '1,22,300') + ' initiated via DBT to your Aadhaar-linked Bank A/C.';
        }

      case 'COMPLETED':
        switch (lang) {
          case 'kn': return 'AgriQ: ಖರೀದಿ ಪ್ರಕ್ರಿಯೆ ಯಶಸ್ವಿಯಾಗಿ ಪೂರ್ಣಗೊಂಡಿದೆ! ರಸೀದಿ #RCP-' + (token || 'PASS') + ' ನೀಡಲಾಗಿದೆ. ಧನ್ಯವಾದಗಳು!';
          case 'hi': return 'AgriQ: खरीद प्रक्रिया सफलतापूर्वक पूर्ण! रसीद #RCP-' + (token || 'PASS') + ' जारी की गई। धन्यवाद!';
          case 'mr': return 'AgriQ: शेतमाल खरेदी यशस्वीरीत्या पूर्ण! पावती #RCP-' + (token || 'PASS') + ' तयार झाली. धन्यवाद!';
          case 'te': return 'AgriQ: సేకరణ విజయవంతంగా పూర్తయింది! రసీదు #RCP-' + (token || 'PASS') + ' జారీ చేయబడింది. ధన్యవాదాలు!';
          case 'pa': return 'AgriQ: ਖਰੀਦ ਸਫਲਤਾਪੂਰਵਕ ਮੁਕੰਮਲ ਹੋਈ! ਰਸੀਦ #RCP-' + (token || 'PASS') + ' ਜਾਰੀ ਕੀਤੀ ਗਈ। ਧੰਨਵਾਦ!';
          default: return 'AgriQ: Procurement COMPLETED! Receipt #RCP-' + (token || 'PASS') + ' generated. Thank you!';
        }

      case 'SHARE_SENT':
        switch (lang) {
          case 'kn': return 'AgriQ: ಟೋಕನ್ ' + (token || '') + ' ಡಿಜಿಟಲ್ ಗೇಟ್ ಪಾಸ್ ಅನ್ನು +91-' + (recipientPhone || '9876543210') + ' ಸಂಖ್ಯೆಗೆ SMS ಮೂಲಕ ಕಳುಹಿಸಲಾಗಿದೆ.';
          case 'hi': return 'AgriQ: टोकन ' + (token || '') + ' का डिजिटल गेट पास +91-' + (recipientPhone || '9876543210') + ' पर एसएमएस द्वारा भेजा गया।';
          case 'mr': return 'AgriQ: टोकन ' + (token || '') + ' चा डिजिटल गेट पास +91-' + (recipientPhone || '9876543210') + ' वर एसएमएस द्वारे पाठवला गेला.';
          case 'te': return 'AgriQ: టోకెన్ ' + (token || '') + ' డిజిటల్ పాస్ +91-' + (recipientPhone || '9876543210') + ' కు SMS ద్వారా పంపబడింది.';
          case 'pa': return 'AgriQ: ਟੋਕਨ ' + (token || '') + ' ਦਾ ਡਿਜੀਟਲ ਪਾਸ +91-' + (recipientPhone || '9876543210') + ' ਤੇ SMS ਰਾਹੀਂ ਭੇਜਿਆ ਗਿਆ।';
          default: return 'AgriQ: Digital gate pass for Token ' + (token || '') + ' dispatched to +91-' + (recipientPhone || '9876543210') + ' via SMS.';
        }
    }
  }

  // 2. Intelligent regex parsing fallback for plain-text strings
  if (msg.includes('Slot confirmed') || msg.includes('Token')) {
    const tokenMatch = msg.match(/Token\s+([A-Z0-9-]+)/i);
    const token = tokenMatch ? tokenMatch[1] : 'BLR-0231';
    const queueMatch = msg.match(/Queue Pos:\s*#?([0-9]+)/i);
    const queuePos = queueMatch ? queueMatch[1] : '1';

    switch (lang) {
      case 'kn': return 'AgriQ: ಸ್ಲಾಟ್ ದೃಢೀಕರಿಸಲಾಗಿದೆ! ಟೋಕನ್ ' + token + ' ರಚಿಸಲಾಗಿದೆ. ಸರತಿ ಸ್ಥಾನ: #' + queuePos + '. ಗೇಟ್‌ನಲ್ಲಿ QR ಪಾಸ್ ತೋರಿಸಿ.';
      case 'hi': return 'AgriQ: स्लॉट कन्फर्म हुआ! टोकन ' + token + ' जारी किया गया। कतार स्थिति: #' + queuePos + '। मंडी गेट पर क्यूआर पास दिखाएं।';
      case 'mr': return 'AgriQ: स्लॉट निश्चित झाला! टोकन ' + token + ' तयार करण्यात आले. रांग क्रमांक: #' + queuePos + '. गेटवर क्यूआर पास दाखवा.';
      case 'te': return 'AgriQ: స్లాట్ ఖరారైంది! టోకెన్ ' + token + ' జారీ చేయబడింది. క్యూ స్థానం: #' + queuePos + '.';
      case 'pa': return 'AgriQ: ਸਲਾਟ ਪੱਕਾ! ਟੋਕਨ ' + token + ' ਜਾਰੀ ਕੀਤਾ ਗਿਆ। ਲਾਈਨ ਨੰਬਰ: #' + queuePos + '।';
      default: return msg;
    }
  }

  if (msg.includes('Checked in')) {
    switch (lang) {
      case 'kn': return 'AgriQ: ಮಂಡಿ ಗೇಟ್ ಚೆಕ್-ಇನ್ ಪೂರ್ಣಗೊಂಡಿದೆ. ಧರ್ಮಕಾಟಾ (ವೇಬ್ರಿಡ್ಜ್ ಲೇನ್ 2) ಗೆ ತೆರಳಿ.';
      case 'hi': return 'AgriQ: मंडी गेट पर चेक-इन पूरा हुआ। धर्मकांटा (वेब्रिज लेन 2) पर जाएं।';
      case 'mr': return 'AgriQ: बाजार समिती प्रवेश चेक-इन पूर्ण. वजन काटा (वेब्रिज लेन २) कडे जा.';
      case 'te': return 'AgriQ: గేట్ చెక్-ఇన్ పూర్తయింది. వేబ్రిడ్జ్ లేన్ 2 కి వెళ్ళండి.';
      case 'pa': return 'AgriQ: ਗੇਟ ਤੇ ਚੈੱਕ-ਇਨ ਪੂਰਾ ਹੋਇਆ। ਕੰਡੇ (ਵੇਬ੍ਰਿਜ ਲਾਈਨ 2) ਤੇ ਜਾਓ।';
      default: return msg;
    }
  }

  if (msg.includes('Weighbridge') || msg.includes('Gross weight')) {
    const weightMatch = msg.match(/([0-9,]+)\s*kg/i);
    const weight = weightMatch ? weightMatch[1] : '2,500';
    switch (lang) {
      case 'kn': return 'AgriQ: ವೇಬ್ರಿಡ್ಜ್ ತೂಕ ಪೂರ್ಣಗೊಂಡಿದೆ. ಒಟ್ಟು ತೂಕ: ' + weight + ' ಕೆಜಿ ದಾಖಲಾಗಿದೆ. ಗುಣಮಟ್ಟ ಪರೀಕ್ಷಾ ಬೂತ್‌ಗೆ ತೆರಳಿ.';
      case 'hi': return 'AgriQ: वेब्रिज तौल पूर्ण। कुल वजन: ' + weight + ' किग्रा दर्ज किया गया। गुणवत्ता परख केंद्र पर जाएं।';
      case 'mr': return 'AgriQ: वेब्रिज वजन पूर्ण. एकूण वजन: ' + weight + ' किलो नोंदवले गेले. गुणवत्ता तपासणी केंद्राकडे जा.';
      case 'te': return 'AgriQ: వేబ్రిడ్జ్ బరువు నమోదు పూర్తయింది. మొత్తం బరువు: ' + weight + ' కిలోలు. నాణ్యత బూత్ కి వెళ్ళండి.';
      case 'pa': return 'AgriQ: ਵੇਬ੍ਰਿਜ ਤੋਲ ਮੁਕੰਮਲ। ਕੁੱਲ ਵਜ਼ਨ: ' + weight + ' ਕਿਲੋਗ੍ਰਾਮ ਦਰਜ। ਗੁਣਵੱਤਾ ਪਰਖ ਬੂਥ ਤੇ ਜਾਓ।';
      default: return msg;
    }
  }

  if (msg.includes('Quality Assayer') || msg.includes('Grade A')) {
    switch (lang) {
      case 'kn': return 'AgriQ: ಗುಣಮಟ್ಟ ಪರೀಕ್ಷೆ ತೇರ್ಗಡೆಯಾಗಿದೆ! ಗ್ರೇಡ್ A ಮಂಜೂರಾಗಿದೆ. DBT ಗಾಗಿ ಅಕೌಂಟ್ಸ್ ಕೌಂಟರ್‌ಗೆ ತೆರಳಿ.';
      case 'hi': return 'AgriQ: गुणवत्ता जांच पास! ग्रेड A स्वीकृत। डीबीटी भुगतान के लिए लेखा काउंटर पर जाएं।';
      case 'mr': return 'AgriQ: गुणवत्ता चाचणी उत्तीर्ण! ग्रेड A मंजूर. DBT खात्यासाठी अकौंट्स काउंटरकडे जा.';
      case 'te': return 'AgriQ: నాణ్యత తనిఖీ ఆమోదించబడింది! గ్రేడ్ A కేటాయించబడింది. ఖాతాల కౌంటర్ కి వెళ్ళండి.';
      case 'pa': return 'AgriQ: ਗੁਣਵੱਤਾ ਜਾਂਚ ਪਾਸ! ਗ੍ਰੇਡ A ਮਨਜ਼ੂਰ। DBT ਲਈ ਅਕਾਊਂਟਸ ਕਾਊਂਟਰ ਤੇ ਜਾਓ।';
      default: return msg;
    }
  }

  if (msg.includes('Payment') || msg.includes('DBT')) {
    const amountMatch = msg.match(/₹?\s*([0-9,]+)/);
    const amount = amountMatch ? amountMatch[1] : '1,22,300';
    switch (lang) {
      case 'kn': return 'AgriQ: ₹' + amount + ' ಮೊತ್ತವನ್ನು ನಿಮ್ಮ ಆಧಾರ್ ಲಿಂಕ್ಡ್ ಬ್ಯಾಂಕ್ ಖಾತೆಗೆ DBT ಮೂಲಕ ವರ್ಗಾಯಿಸಲಾಗುತ್ತಿದೆ.';
      case 'hi': return 'AgriQ: ₹' + amount + ' का भुगतान आपके आधार लिंक बैंक खाते में डीबीटी (DBT) द्वारा भेजा जा रहा है।';
      case 'mr': return 'AgriQ: ₹' + amount + ' ची रक्कम आपल्या आधार लिंक बँक खात्यात DBT द्वारे जमा होत आहे.';
      case 'te': return 'AgriQ: ₹' + amount + ' మొత్తం మీ ఆధార్ లింక్డ్ బ్యాంక్ ఖాతాకు DBT ద్వారా బదిలీ చేయబడుతోంది.';
      case 'pa': return 'AgriQ: ₹' + amount + ' ਦਾ ਭੁਗਤਾਨ ਤੁਹਾਡੇ ਆਧਾਰ ਲਿੰਕਡ ਬੈਂਕ ਖਾਤੇ ਵਿੱਚ DBT ਰਾਹੀਂ ਭੇਜਿਆ ਜਾ ਰਿਹਾ ਹੈ।';
      default: return msg;
    }
  }

  if (msg.includes('Procurement COMPLETED') || msg.includes('Receipt')) {
    const rcpMatch = msg.match(/#RCP-([A-Z0-9-]+)/i);
    const rcp = rcpMatch ? rcpMatch[1] : 'PASS-01';
    switch (lang) {
      case 'kn': return 'AgriQ: ಖರೀದಿ ಪ್ರಕ್ರಿಯೆ ಯಶಸ್ವಿಯಾಗಿ ಪೂರ್ಣಗೊಂಡಿದೆ! ರಸೀದಿ #RCP-' + rcp + ' ನೀಡಲಾಗಿದೆ. ಧನ್ಯವಾದಗಳು!';
      case 'hi': return 'AgriQ: खरीद प्रक्रिया सफलतापूर्वक पूर्ण! रसीद #RCP-' + rcp + ' जारी की गई। धन्यवाद!';
      case 'mr': return 'AgriQ: शेतमाल खरेदी यशस्वीरीत्या पूर्ण! पावती #RCP-' + rcp + ' तयार झाली. धन्यवाद!';
      case 'te': return 'AgriQ: సేకరణ విజయవంతంగా పూర్తయింది! రసీదు #RCP-' + rcp + ' జారీ చేయబడింది. ధన్యవాదాలు!';
      case 'pa': return 'AgriQ: ਖਰੀਦ ਸਫਲਤਾਪੂਰਵਕ ਮੁਕੰਮਲ ਹੋਈ! ਰਸੀਦ #RCP-' + rcp + ' ਜਾਰੀ ਕੀਤੀ ਗਈ। ਧੰਨਵਾਦ!';
      default: return msg;
    }
  }

  if (msg.includes('SMS Dispatched') || msg.includes('dispatched to')) {
    const phoneMatch = msg.match(/\+?91-?([0-9]+)/);
    const phone = phoneMatch ? phoneMatch[1] : 'Driver';
    switch (lang) {
      case 'kn': return 'AgriQ: ಡಿಜಿಟಲ್ ಗೇಟ್ ಪಾಸ್ ಲಿಂಕ್ ಅನ್ನು +91-' + phone + ' ಸಂಖ್ಯೆಗೆ SMS ಮೂಲಕ ಕಳುಹಿಸಲಾಗಿದೆ.';
      case 'hi': return 'AgriQ: डिजिटल गेट पास लिंक +91-' + phone + ' पर एसएमएस द्वारा भेजा गया।';
      case 'mr': return 'AgriQ: डिजिटल गेट पास लिंक +91-' + phone + ' वर एसएमएस द्वारे पाठवण्यात आली आहे.';
      case 'te': return 'AgriQ: డిజిటల్ పాస్ లింక్ +91-' + phone + ' కు SMS ద్వారా పంపబడింది.';
      case 'pa': return 'AgriQ: ਡਿਜੀਟਲ ਪਾਸ ਲਿੰਕ +91-' + phone + ' ਤੇ SMS ਰਾਹੀਂ ਭੇਜਿਆ ਗਿਆ।';
      default: return msg;
    }
  }

  return msg;
}