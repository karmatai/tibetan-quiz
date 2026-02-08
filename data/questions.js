/**
 * TIBETAN QUIZ - Question data
 * Add or edit questions here. App loads only questions matching current round type.
 *
 * Question structure:
 *   id: number (unique)
 *   type: "word" | "image" | "general"
 *   question: string (Tibetan word for "word", prompt for "image"/"general")
 *   options: string[] (multiple choice in English)
 *   correctAnswer: number (index in options, 0-based)
 *   difficulty: "easy" | "medium" | "hard"
 *   image: string (only for type "image", e.g. "/images/yak.jpg")
 *   quote: string (optional, shown on answer reveal)
 */

const QUESTIONS = [
  // ---------------------------------------------------------------------------
  // WORD ROUND (type: "word") – Tibetan word → choose English meaning
  // ---------------------------------------------------------------------------
  { id: 1, type: "word", question: "སྤྱི་སྤྱད་གླང་འཁོར།", options: ["Public bus", "Bicycle", "Computer", "Shoes"], correctAnswer: 0, difficulty: "easy"},
  { id: 2, type: "word", question: "མི་བཟོས་རིག་ནུས།", options: ["Artificial intelligence", "Radio", "Refrigerator", "Stove"], correctAnswer: 0, difficulty: "easy"  },
  { id: 3, type: "word", question: "བསིལ་ལྷམ།", options: ["Refrigerator", "Phone", "Slipper", "Bicycle"], correctAnswer: 2, difficulty: "easy", },
  { id: 4, type: "word", question: "ཁ་པར།", options: ["Phone", "Stove", "Radio", "Computer"], correctAnswer: 0, difficulty: "easy" ,quote: "ཁ་པར། means Phone"},
  { id: 5, type: "word", question: "ཐབ།", options: ["Refrigerator", "Shoes", "Public bus", "Stove"], correctAnswer: 3, difficulty: "easy", },
  { id: 6, type: "word", question: "རི་ལི།", options: ["Radio", "Social media", "Email", "Security guard"], correctAnswer: 0, difficulty: "medium" },
  { id: 7, type: "word", question: "སྤྱི་ཚོགས་འདྲ་རྒྱ།", options: ["Internet", "Radio", "Social Media", "Email"], correctAnswer: 2, difficulty: "medium" },
  { id: 8, type: "word", question: "ཐད་གཏོང་།", options: ["Broadcast", "Email", "Live", "Radio"], correctAnswer: 2, difficulty: "medium" },
  { id: 9, type: "word", question: "གློག་འཕྲིན།", options: ["Email", "Radio", "Social media", "Broadcast"], correctAnswer: 0, difficulty: "medium" },
  { id: 10, type: "word", question: "ཉེན་རྟོག་པ།", options: ["Security guard", "Email", "Radio", "Police"], correctAnswer: 3, difficulty: "medium" },
  { id: 11, type: "word", question: "དོ་ཁུར།", options: ["Follow", "Goal", "Sports competition", "Meeting"], correctAnswer: 0, difficulty: "hard" },
  { id: 12, type: "word", question: "གོ་ར་བ།", options: ["Meeting", "Responsibility", "Goal Keeper", "Software"], correctAnswer: 0, difficulty: "hard" },
  { id: 13, type: "word", question: "རྩེད་དཔང་།", options: ["Sports competition", "Meeting", "Software", "Referee"], correctAnswer: 3, difficulty: "hard" },
  { id: 14, type: "word", question: "ཚོགས་བཞུགས།", options: ["Meeting", "Software", "Subscribe", "Responsibility"], correctAnswer: 2, difficulty: "hard" },
  { id: 15, type: "word", question: "མཉེན་ཆས།", options: ["Software/Application", "Download", "Goal", "Meeting"], correctAnswer: 0, difficulty: "hard" },
  { id: 16, type: "word", question: "འཕབ་ལེན།", options: ["Download", "Software", "Meeting", "Sports competition"], correctAnswer: 0, difficulty: "hard" },

  // ---------------------------------------------------------------------------
  // IMAGE ROUND (type: "image") – Show image, choose identity (store in public/images/)
  // ---------------------------------------------------------------------------
  { id: 20, type: "image", image: "/images/easy/yak.jpg", question: "སེམས་ཅན་འདིའི་མིང་ལ་གང་ཟེར།", options: ["གཡག", "ར།", "ལུག", "ཁྱི"], correctAnswer: 0, difficulty: "easy" },
  { id: 21, type: "image", image: "/images/easy/kailash.jpg", question: "གནས་རི་འདིའི་མིང་ལ་གང་ཟེར།", options: ["ཇོ་མོ་གླང་མ།", "ཁ་བ་དཀར་པོ།", "གངས་ཅན་འབྱུང་ཁ།", "གངས་ཏི་སི།"], correctAnswer: 3, difficulty: "easy" },
  { id: 21, type: "image", image: "/images/easy/guru.jpg", question: "སྐུ་འདི་སུ་ཡི་སྐུ་རེད།", options: [ "རྒྱལ་པོ་སྲོང་བཙན་སྒམ་པོ།","ཆོས་རྒྱལ་མྱ་ངན་མེད།", "སློབ་དཔོན་པདྨ་འབྱུང་གནས།", "ཁྲི་སྲོང་སྡེ་མཚན།"], correctAnswer: 2, difficulty: "easy" },
  { id: 23, type: "image", image: "/images/east/anu.jpg", question: "ཁོང་གཉིས་ཀྱི་རུ་ཁག་གི་མིང་ལ་གང་ཟེར།", options: ["བསོད་བཀྲ།","ཨ་ན་རིང་ལུགས།",  "བཤེར་བསྟེན།", "ཕོ་གསར།"], correctAnswer: 0, difficulty: "medium" },
  { id: 24, type: "image", image: "/images/medium/mila.jpg", question: "སྐུ་པར་ནང་གི་སྒོམ་ཆེན་པ་དེ་སུ་རེད་དམ།", options: ["མར་པ་ལོ་ཙ་བ།", "མི་ལ་རས་པ།", "ལོ་ཙ་བ་རིན་ཆེན་བཟང་པོ།", "གམ་པོ་པ།"], correctAnswer: 1, difficulty: "medium" },
  { id: 25, type: "image", image: "/images/panchen.jpg", question: "སྐུ་པར་འདི་ཡི་ནང་བཞུགས་པའིཔན་ཆེན་གཉིས་ཀྱི་མཚན་གང་དང་གང་ཡིན་ནམ།", options: [ "པན་ཆེན་ཆོས་ཀྱི་རྒྱ་མཚོ་དང་པན་ཆེན་ཆོས་ཀྱི་རྒྱལ་མཚན་མཆོག་རེད།", "པན་ཆེན་ཆོས་ཀྱི་ཉི་མ་དང་པན་ཆེན་ཆོས་ཀྱི་རྒྱལ་མཚན་མཆོག་རེད།","པན་ཆེན་ཆོས་ཀྱི་ཉི་མ་དང་པན་ཆེན་ཆོས་ཀྱི་འབྱུང་གནས་མཆོག་རེད།", "པན་ཆེན་ཆོས་ཀྱི་འབྱུང་གནས་དང་པན་ཆེན་ཆོས་ཀྱི་རྒྱ་མཚོ་མཆོག་རེད།"], correctAnswer: 1, difficulty: "medium" },
  { id: 26, type: "image", image: "/images/hard/dorjey.jpg", question: "ཆོས་རྫས་འདི་ཡི་མིང་ལ་གང་ཟེར་རམ།", options: ["འབུབ་ཆལ།","རྡོ་རྗེ།", "འདྲིལ་བུ།",  "ཊ་མ་རུ།"], correctAnswer: 1, difficulty: "hard" },
  { id: 27, type: "image", image: "/images/hard/snow.jpg", question: "སེམས་ཅན་འདི་ཡི་མིང་ལ་གང་ཟེར་རམ།", options: ["གསའ།","དོམ།", "སྟག",  "གཟིག"], correctAnswer: 0, difficulty: "hard" },
  { id: 28, type: "image", image: "/images/hard/YumbuLhakhang.jpg", question: "འཁར་འདི་ཡི་མིང་ལ་གང་ཟེར་རམ།", options: ["ཕོ་བྲང་པོ་ཏ་ལ།","རྒྱལ་པོའི་ཁབ།།", "ཟངས་ལ་ཁར།",  "ཡུམ་བུ་ལྷ་ཁང་།"], correctAnswer: 3, difficulty: "hard" },

  // ---------------------------------------------------------------------------
  // GENERAL ROUND (type: "general") – Question text + options
  // ---------------------------------------------------------------------------
  { id: 30, type: "general", question: "ཤེས་རབ་ཀྱི་ལྷ་གང་རེད།", options: ["འཇམ་དཔལ་དབྱངས།", "སྤྱན་རས་གཟིགས།", "ཤཀྱ་མུ་ནེ།", "ཚེ་དཔག་མེད།"], correctAnswer: 0, difficulty: "easy", quote: "ཤེས་རབ་ཀྱི་ལྷ་ is Manjushri" },
  { id: 31, type: "general", question: "བོད་ཡིག་ནང་མིང་གཞི་ག་ཚོད་ཡོད་དམ།", options: ["30", "26", "20", "10"], correctAnswer: 2, difficulty: "easy" },
  { id: 32, type: "general", question: "ཡ་རྟགས་ག་ཚོད་ཡོད་དམ།", options: ["8","7","5", "4"], correctAnswer: 1, difficulty: "easy" },
  { id: 33, type: "general", question: "བོད་ལ་རྒྱལ་པོ་ག་ཚོད་འབྱུང་ངམ།", options: ["40", "443", "41", "3"], correctAnswer: 2, difficulty: "medium" },
  { id: 34, type: "general", question: "༧་གོང་ས་སྐུ་ཕྲེང་བཅུ་བསུམ་པའི་མཚན་གང་ཡིན་ནམ།", options: ["ཐུབ་བསྟན་རྒྱ་མཚོ།", "དགེ་བདུན་རྒྱ་མཚོ།", "བློ་བཟང་རྒྱ་མཚོ།", "ལུང་རྟོགས་རྒྱ་མཚོ།"], correctAnswer: 0, difficulty: "medium",},
  { id: 35, type: "general", question: "བོད་རྒྱལ་ཁབ་ཆེན་པོའི་སྟེང་གི་དར་ལྕོག་སྟེང་གི་སྔོན་པོ་དེས་གང་མཚོན་ནམ།", options: ["གནས་ཆུང་ཆོས་རྒྱལ།",  "དཔལ་ལྡན་ལྷ་མོ།", "ལྷ་ལུང་དཔལ་རྡོར།","རྣམ་རྒྱལ།"], correctAnswer: 1, difficulty: "medium",},
  { id: 36, type: "general", question: "ཇོ་བོ་རྗེ་བོད་སུས་གདན་འདྲེན་བསམ།", options: ["སྲོང་བཙན་སྒམཔོ།","ཐོན་མི་བསམ་བྷོ་ཊ།","རྒྱལ་ཟ་ཀོང་ཇོ།", "བལ་ཟ་ཁྲི་བཙུན།",  ], correctAnswer: 2, difficulty: "medium",},
  { id: 37, type: "general", question: "བོད་མིའི་སྒྲིག་འཛུགས་ལྷན་ཁང་ག་ཚོད་ཡོད་དམ།", options: ["10", "6", "5", "7"], correctAnswer: 0, difficulty: "hard",},
  { id: 38, type: "general", question: "ཨ་རིར་གྲོས་ཚོགས་ནང་ཉེ་ཆར་བོད་ཀྱི་ཆེད་དུ་འགྲོ་གྲོན་ག་ཚོད་བཀའ་ཁྲོལ་ཐོབ་ཡོད་དམ།", options: ["23mil", "45mil", "18mil", "5mil"], correctAnswer: 0, difficulty: "hard",},
  { id: 39, type: "general", question: "བསྟན་སྲུང་དང་བླངས་དམག་མི་ཆུ་བཞི་སྒང་འདྲུག་གི་དམག་སྤྱི་གཙོ་བོ་སུ་རེད", options: ["གར་སྟོང་བཙན།།","ཨ་འབྲུག་མགོན་པོ་བཀྲ་ཤིས།",  "དམག་དཔོན་མིག་དམར།", "རྒྱ་ལོ་དོན་འགྲུབ།"], correctAnswer: 3, difficulty: "hard"}
];

/**
 * Round configuration. Each round uses only questions with matching type.
 */
const ROUNDS = [
  { name: "Word Round", type: "word" },
  { name: "Image Round", type: "image" },
  { name: "Knowledge Round", type: "general" },
];

// Expose for plain script usage (no module bundler)
if (typeof window !== "undefined") {
  window.QUESTIONS = QUESTIONS;
  window.ROUNDS = ROUNDS;
}
