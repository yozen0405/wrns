// Question deck for WRNS-lite
// 13 themes × ~5–27 questions each = ~150 prompts.
// Every card shows the theme + question in both zh & en simultaneously.

export const THEMES = [
  { id: "self",      zh: "自我認識", en: "About You" },
  { id: "interests", zh: "興趣",     en: "Hobbies" },
  { id: "food",      zh: "食物",     en: "Food" },
  { id: "daily",     zh: "日常",     en: "Daily Life" },
  { id: "travel",    zh: "旅行",     en: "Travel" },
  { id: "culture",   zh: "文化",     en: "Culture" },
  { id: "childhood", zh: "童年",     en: "Childhood" },
  { id: "love",      zh: "感情",     en: "Love" },
  { id: "growth",    zh: "成長",     en: "Growth" },
  { id: "emotions",  zh: "情緒",     en: "Emotions" },
  { id: "values",    zh: "價值觀",   en: "Values" },
  { id: "social",    zh: "社群",     en: "Social Media" },
  { id: "dreams",    zh: "夢想",     en: "Dreams" },
];

export const QUESTIONS = {
  zh: {
    self: [
      "你的名字是什麼？你的中/英名字有什麼特別的故事嗎?",
      "介紹一下你的家鄉,有沒有什麼是你很喜歡 / 很不喜歡的?",
      "你會怎麼用三個詞形容自己?",
      "你的星座是什麼?有什麼特質?你相信星座嗎?",
      "熟了以後,別人會發現你跟第一印象有什麼不同?會有很大的反差嗎?",
      "你目前就讀什麼科系或從事什麼工作?當初為什麼選擇這個科系?你喜歡嗎?",
      "你參加語伴計畫最想學到什麼，或帶走什麼樣的收穫？除了語言進步之外，你有沒有特別期待了解的文化、認識的人，或想突破的事情？",
      "你的 MBTI 是什麼?你覺得 MBTI 測得準嗎?",
      "在學校有參加過什麼好玩的社團嗎?印象最深刻的社團經驗是什麼?",
      "回想大學生活,有沒有哪一次參加活動或跟朋友出去玩,發生過非常瘋狂或讓你印象超深刻的事?",
      "你最近這一年有沒有做過什麼很衝動但完全不後悔的決定?例如說走就走的夜衝、在期中考前一天還夜唱",
      "你有沒有遇過那種當下覺得超尷尬的社死經驗?(例如路上認錯人、傳錯訊息到大群組)",
      "有沒有什麼興趣或事物,是你一開始完全沒興趣,結果後來被朋友推坑之後反而超級入迷的?",
      "你是派對咖,還是喜歡宅在家?",
      "你今天的心情可以用一個顏色形容,是什麼顏色?",
      "有沒有什麼關於你的小秘密,或是一個特殊的小技能,是朋友剛認識你時絕對猜不到的?(例如:其實超會夾娃娃、會知道很多冷知識)",
      "你最喜歡一年之中的哪個季節?為什麼？",
      "你通常是喜歡在晴天的熱情還是雨天的寧靜?",
      "你在大學裡修過最有趣或是最硬的課程是什麼? 你最享受或是覺得最痛苦的是哪一部分?",
      "除了中英文以外,你還會哪些語言?當初為什麼會想學這個語言呢？",
      "你學一個語言最困難，或是最有趣的地方是什麼？",
    ],
    interests: [
      "你比較喜歡動態活動還是靜態活動?平常最常做的休閒活動是什麼?",
      "你平常休閒時喜歡看 YouTube 還是聽 Podcast?有喜歡的創作者或是頻道嗎?",
      "你最喜歡哪一種音樂?有沒有最喜歡的歌手呢?",
      "你最近有看什麼推薦的電影或影集嗎?你是喜歡一次把劇追完,還是慢慢看?",
      "喜歡看動漫嗎?有沒有你最欣賞的動漫人物?你喜歡他什麼特質?",
      "你平常有閱讀的習慣嗎？有沒有哪一本書是你真的很喜歡，甚至會想推薦給朋友看的？",
      "你比較喜歡紙本書還是電子書?你會在什麼情況下選擇紙本書或電子書?",
      "你有固定運動的習慣嗎?或者平常有沒有特別喜歡關注哪種體育賽事?",
      "你放假時喜歡去探索有特色的咖啡廳或去逛展覽嗎?還是比較喜歡去大自然走走",
      "你喜歡有「儀式感」的生活嗎?例如點香氛蠟燭、寫手帳,或者在特定節日給自己準備小禮物?",
      "你平常買衣服或生活小物,比較喜歡親自去實體店面逛街,還是會選擇網購?",
      "你有沒有為了看哪位歌手的演唱會或音樂祭,特地跑到別的城市或國家過?",
      "除了學語言之外,你最近有沒有想學什麼新技能,或是培養什麼新興趣?",
      "你是「貓派」還是「狗派」呢?自己目前有養寵物,或是未來會想養嗎?",
    ],
    food: [
      "你最喜歡吃什麼?最不能接受什麼食物?",
      "香菜可以加嗎?",
      "咖哩飯拌還是不拌?",
      "披薩上可以放鳳梨嗎?",
      "火鍋可以加芋頭嗎?",
      "珍珠奶茶通常喝幾分糖?幾分冰?",
      "你喜歡吃辣嗎? 有沒有吃過什麼食物以為不辣,結果辣到靠北的?",
      "有什麼食物是你小時候討厭,長大後卻喜歡的?",
      "有什麼食物你永遠不可能接受?",
      "如果今天有外國朋友去你的家鄉玩,你會首推哪一道必吃的在地美食?反過來,有哪國的特色料理是你目前最想嘗試看看的?",
      "旅行時,你願意嘗試當地看起來很有趣但是賣相不好的食物嗎?",
      "你平常會自己做菜嗎？如果會，你最常做或最拿手的是哪一道；如果不會，最想先學哪一道？",
      "你買東西吃的時候，通常比較喜歡外帶回家慢慢吃，還是直接在店裡內用？為什麼？",
    ],
    daily: [
      "你通常幾點睡?是早起型還是夜貓型?",
      "你會賴床嗎?鬧鐘通常設幾個?有用嗎?",
      "你會對手機電量焦慮嗎?低於多少會去充電?",
      "出門通常會提早到還是壓線到?你可以接受別人遲到多久?",
      "作業通常是出來就交還是壓線交?",
      "你最喜歡星期幾?為什麼?",
      "你會通宵嗎?通宵後會精力充沛還是想倒頭就睡?",
    ],
    travel: [
      "你去過最喜歡的地方是哪裡?如果可以再去一次,你最想重訪哪個地方?",
      "你旅行時會把行程、住宿都事先規劃好,還是到了當地再隨機應變?",
      "如果預算有限,你會把錢花在飯店、美食、景點,還是特別的體驗上?",
      "你旅行中遇過最狼狽、最好笑,或最難忘的一次意外是什麼?",
      "如果現在可以免費去任何國家旅行,你會去哪裡、和誰一起去,或是一個人獨旅呢?",
    ],
    culture: [
      "你覺得自己的文化最特別的是什麼?",
      "打招呼時,你習慣揮手、握手、擁抱還是點頭?",
      "你覺得台灣人在習慣上跟澳洲人最大不同的是什麼?去台灣或澳洲有沒有哪一件事讓你特別驚訝或不習慣?",
      "你覺得外國人對台灣，又或者對澳洲最大的誤解是什麼?",
      "有什麼外國當地的文化習慣是你第一次知道時很驚訝的?",
      "你覺得哪一個國家的生活方式最吸引你?還是自己的國家比較好?",
      "你覺得家庭在個人選擇中應該有多大影響?",
      "你能接受成年後仍和父母同住嗎?",
      "有沒有什麼節日是讓你最有氛圍感的?例如聖誕節、萬聖節、情人節、跨年、生日等",
    ],
    childhood: [
      "你小時候最喜歡的卡通或零食是什麼?",
      "你小時候最想成為什麼樣的人?現在的你和當時想像的一樣嗎?",
      "你童年最開心或最難忘的一段回憶是什麼?",
      "你小時候的個性和現在差很多嗎?哪一點改變最大?",
      "你認為你童年帶有遺憾嗎?例如可能少做了某些事情?",
    ],
    love: [
      "你是一見鍾情派,還是日久生情派?",
      "你覺得交朋友時,哪種特質最吸引你?例如幽默、溫柔、自信或有才華?",
      "在日常生活中,朋友或同事做什麼小舉動,會讓你覺得對方很貼心?",
      "在你們國家,大家第一次約會通常都去哪裡?有什麼特別的約會文化嗎?",
      "你覺得不管是交朋友還是找伴侶,有共同興趣比較重要,還是個性互補比較重要?",
      "現在越來越多人比起結婚,更享受一個人自由的生活,你們國家也有這種趨勢嗎?",
      "這是一個經典的辯論題:你覺得分手後還能當朋友嗎?你們國家的年輕人普遍怎麼看?",
      "在你們的文化中,家人的意見對年輕人選擇結婚對象的影響大嗎?"
    ],
    growth: [
      "你最近一次走出舒適圈是什麼時候?當時做了什麼,又有什麼感受?",
      "你曾經歷過哪一次失敗或低潮,後來反而讓你更了解自己?",
      "你現在最想培養哪一項能力,或改掉哪一個習慣?為什麼?",
      "如果可以對一年前的自己說一句話,你會說什麼?",
      "你會想交換學生嗎?如果可以的話,最想去哪個國家交換?",
      "接下來一個月，有沒有哪一件事是你特別期待的？例如旅行、活動、見道想見的人，或完成一個目標？",
    ],
    emotions: [
      "最近哪一件事最讓你感到壓力?你通常怎麼讓自己放鬆?",
      "當你心情不好時,你比較希望自己獨處,還是有人陪在身邊?",
      "當你向別人分享煩惱時,你希望對方給你建議,還是只要認真聽你說?",
      "你通常會直接表達自己的不開心,還是先假裝沒事、自己慢慢消化?",
      "當你心情不好的時候，去什麼地方或做什麼事情，最容易讓你重新放鬆下來？",
    ],
    values: [
      "對你來說，人生的意義是什麼?何謂成功?",
      "對於一餐來說，價格多少會覺得合理？",
      "如果有兩份工作：一份薪水很高，但經常要加班、幾乎沒有自己的時間；另一份薪水普通，卻能準時下班、做自己喜歡的事，你會選哪一份？",
      "天賦和努力哪一個更重要?",
      "如果誠實說出來可能會傷害朋友,但繼續忍耐又會讓你越來越不舒服,你會選擇坦白、用善意的謊言維持關係,還是選擇疏離?",
      "你認為人生需要明確目標嗎?你會因為沒有目標而失去動力嗎?",
      "你的夢想是什麼?你會為了追求夢想而捨去一切嗎?",
      "你覺得選擇比努力重要嗎?",
      "一個人應該追求平凡幸福,還是卓越成就?",
      "有沒有一句話、歌詞或 quote，是你到現在都很相信的？它是在什麼時候開始影響你的？",
    ],
    social: [
      "你一天大概會用幾個小時的手機?會不會常常覺得只是滑一下,結果時間就不知不覺過去了?",
      "你會在社群媒體展示真實生活嗎?",
      "你平常喜歡用文字聊天，還是直接講電話／傳語音比較多？",
      "你平常會常發限時動態嗎？你比較是想記錄自己的生活，還是想和朋友分享當下的心情又或者是其他？",
      "社群媒體對你來說，是提供了一種更輕鬆、低壓的社交方式，還是反而讓人更依賴線上互動、越來越不習慣面對面交流？",
      "你會用 AI 完成作業嗎?你覺得 AI 會讓人更聰明還是更依賴?",
      "你在準備考試或趕作業時，會不會明明想專心，卻還是忍不住一直滑社群媒體？通常會怎麼克制自己？",
    ],
    dreams: [
      "你會選擇一個億,還是清華北大?",
      "如果明天整天完全沒有課、工作和責任,你會從早到晚怎麼安排?",
      "如果你要在一座荒島住三個月,只能帶三樣東西,你會帶什麼?",
      "如果你可以永久刪除一段記憶,你會選擇刪掉它嗎?",
      "如果你確定明天是世界末日,你會選擇做哪些事?",
      "如果可以擁有一種超能力,但只能在日常生活中使用,你會選什麼?你會怎麼用?",
      "如果只能問十年後的自己一個問題,你會問什麼?",
      "如果你的人生是一部兩小時的電影,你覺得現在演到開頭、轉折、低潮還是高潮?目前這一幕在發生什麼?",
    ],
  },
  en: {
    self: [
      "What's your name? Is there a story behind your Chinese / English name?",
      "Tell us about your hometown — anything you really love or really dislike about it?",
      "How would you describe yourself in three words?",
      "What's your zodiac sign? What traits come with it? Do you believe in astrology?",
      "Once people get to know you better, how are you different from their first impression? Is there a big contrast?",
      "What's your major or job? Why did you pick it — and do you enjoy it?",
      "What do you most want to learn or take away from the language partner program? Besides improving your language skills, are there any cultures, people, or personal challenges you're especially excited about?",
      "What's your MBTI? Do you think MBTI is actually accurate?",
      "Have you joined any fun clubs at school? What's your most memorable club experience?",
      "Thinking back on university life, was there any event or outing with friends where something really wild or unforgettable happened?",
      "In the past year, have you made any impulsive decision that you don't regret at all? For example, a spontaneous late-night trip, or going karaoke the night before midterms.",
      "Have you ever had a socially embarrassing moment that felt terrible at the time, like mistaking someone for another person or sending the wrong message to a big group chat?",
      "Is there any hobby or thing you had zero interest in at first, but later got pulled into by friends and became really obsessed with?",
      "Are you a party goer or a homebody?",
      "What color would your mood today be?",
      "Do you have any little secret about yourself, or a special skill that friends would never guess when they first meet you? For example, being amazing at claw machines or knowing lots of random facts.",
      "What's your favorite season of the year? Why?",
      "Do you usually enjoy the energy of sunny days or the calm of rainy days?",
      "What's the most interesting or most intense course you've taken in university? Which part did you enjoy the most, or suffer through the most?",
      "Besides Chinese and English, what other languages do you speak? Why did you want to learn them?",
      "What's the hardest or most interesting part of learning a language for you?",
    ],
    interests: [
      "Do you prefer active or quiet activities? What leisure activity do you do most often?",
      "In your free time, do you prefer watching YouTube or listening to podcasts? Any favorite creators or channels?",
      "What kind of music do you like most? Do you have a favorite singer or artist?",
      "Have you watched any movies or series lately that you'd recommend? Do you binge-watch, or watch slowly over time?",
      "Do you like anime? Is there an anime character you really admire? What traits do you like about them?",
      "Do you usually read? Is there a book you truly love, or would recommend to a friend?",
      "Do you prefer physical books or e-books? When would you choose one over the other?",
      "Do you exercise regularly? Or is there any sport you especially like to follow?",
      "On holidays, do you like exploring unique cafes or exhibitions, or would you rather spend time in nature?",
      "Do you like having little rituals in life — lighting scented candles, journaling, or preparing small gifts for yourself on special days?",
      "When buying clothes or small lifestyle items, do you prefer browsing in stores, or shopping online?",
      "Have you ever travelled to another city or country just to see a singer's concert or a music festival?",
      "Besides learning languages, is there any new skill or hobby you want to pick up lately?",
      "Are you more of a cat person or a dog person? Do you have a pet now, or would you want one in the future?",
    ],
    food: [
      "What's your favorite food? What can you absolutely not eat?",
      "Cilantro — yes or no?",
      "Mix the curry rice, or eat it separately?",
      "Pineapple on pizza — acceptable?",
      "Taro in hot pot — yes or no?",
      "How sweet do you order your bubble tea? Ice level?",
      "Do you like spicy food? Have you ever eaten something that you thought was mild, but turned out to be extremely spicy?",
      "Any food you hated as a kid but love now?",
      "Is there a food you'll never accept?",
      "If a foreign friend visited your hometown, what local dish would you recommend first? And on the other hand, which country's special cuisine do you most want to try?",
      "While travelling, would you try something interesting but ugly-looking?",
      "Do you usually cook for yourself? If yes, what's the dish you make most often or best? If not, what's the first dish you'd want to learn?",
      "When you buy food, do you usually prefer taking it home to eat slowly, or eating in at the restaurant? Why?",
    ],
    daily: [
      "When do you go to sleep? Early bird or night owl?",
      "Do you hit snooze? How many alarms do you set — do they actually work?",
      "Do you get phone-battery anxiety? At what % do you start charging?",
      "Do you arrive early or right at the deadline? How late can others be before it bothers you?",
      "Do you finish assignments early, or right at the deadline?",
      "What's your favorite day of the week? Why?",
      "Do you ever pull all-nighters? Afterwards — wired or wrecked?",
    ],
    travel: [
      "What's the favorite place you've been to? If you could go again, where would you most want to revisit?",
      "Before a trip, do you plan everything — itinerary and hotels — or just play it by ear when you arrive?",
      "On a tight budget, would you spend on hotels, food, sights, or unique experiences?",
      "What's the most embarrassing, funniest, or most unforgettable mishap you've had while travelling?",
      "If you could fly anywhere in the world for free right now — where would you go, who with, or would you go alone?",
    ],
    culture: [
      "What's the most special thing about your own culture?",
      "When greeting, do you wave, shake hands, hug, or nod?",
      "What's the biggest habit difference between Taiwanese and Australian people? Did anything in either country surprise you or feel uncomfortable?",
      "What's the biggest misconception foreigners have about Taiwan — or Australia?",
      "What foreign custom surprised you most when you first heard of it?",
      "Whose lifestyle attracts you most — or is your own country still the best?",
      "How much influence should family have on personal choices?",
      "Could you live with your parents as an adult?",
      "Is there a holiday that feels especially atmospheric to you? For example, Christmas, Halloween, Valentine's Day, New Year's Eve, birthdays, or something else.",
    ],
    childhood: [
      "What was your favorite cartoon or snack as a kid?",
      "Who did you want to become as a kid? Do you think you're the same person now as you imagined back then?",
      "What's your happiest or most unforgettable childhood memory?",
      "Is your childhood personality very different from now? What changed most?",
      "Do you carry regrets from childhood — things you wish you had done?",
    ],
    love: [
      "Are you a love-at-first-sight type, or do you fall in love over time?",
      "When making friends, what traits attract you most — humor, kindness, confidence, talent?",
      "In daily life, what small gesture from a friend or colleague makes you feel cared for?",
      "In your country, where do people usually go on a first date? Any special dating culture?",
      "When making friends or finding a partner, is shared interest or complementary personality more important to you?",
      "More and more people are enjoying single life rather than marriage — is this trend present in your country too?",
      "This is a classic debate: can exes remain friends? How do young people in your country generally feel about this?",
      "In your culture, how much influence do family opinions have on young people's choice of a marriage partner?"
    ],
    growth: [
      "When did you last step out of your comfort zone? What did you do, and how did it feel?",
      "What failure or low point ended up teaching you about yourself?",
      "What skill do you most want to build, or habit to drop — and why?",
      "If you could say one sentence to your one-year-ago self, what would it be?",
      "Would you do an exchange program? Where would you go?",
      "Is there anything you're especially looking forward to in the next month — a trip, an event, meeting someone, or completing a goal?"
    ],
    emotions: [
      "What's stressing you most lately? How do you usually unwind?",
      "When you're down, do you prefer to be alone or have someone with you?",
      "When you share your worries, do you want advice — or just to be heard?",
      "Do you express unhappiness directly, or pretend you're fine and digest it alone?",
      "When you're feeling down, what place or activity helps you relax the most?",
    ],
    values: [
      "What does life mean to you? What is the definition of success?",
      "For a meal, what price feels reasonable to you?",
      "If you had two jobs: one with high pay but frequent overtime and almost no personal time, and another with average pay but regular hours and doing what you love — which would you choose?",
      "Talent or effort — which matters more?",
      "If telling the truth might hurt a friend, but holding back is hurting you — would you be honest, tell a kind lie, or quietly drift apart?",
      "Do you think life needs clear goals? Do you lose motivation without them?",
      "What's your dream? Would you give up everything to chase it?",
      "Do you think choice matters more than effort?",
      "Should one chase ordinary happiness or extraordinary achievement?",
      "Is there a sentence, lyric, or quote that you still really believe in? When did it start affecting the way you think?",
    ],
    social: [
      "How many hours a day do you spend on your phone? Do you often feel like time just slips away while scrolling?",
      "Do you show your real life on social media?",
      "Do you prefer texting, or calling / voice messages?",
      "Do you post stories often? Are you more about recording your life, sharing your mood, or something else?",
      "For you, does social media provide a more relaxed, low-pressure way to socialize, or does it make people more dependent on online interaction and lack of face-to-face communication?",
      "Would you use AI to do homework? Do you think AI makes people smarter or more dependent?",
      "When studying for exams or rushing assignments, do you find yourself scrolling social media even when you want to focus? How do you resist it?",
    ],
    dreams: [
      "100 million dollars, or admission to the top universities in your country — which would you pick?",
      "If tomorrow you had no class, work, or responsibilities — how would you spend the whole day?",
      "Three months on a deserted island — what three things would you bring?",
      "If you could permanently delete one memory, would you?",
      "If you knew the world ended tomorrow, what would you do?",
      "If you could have a superpower, but only for daily life — what would it be, and how would you use it?",
      "If you could ask your 10-years-from-now self one question, what would it be?",
      "If your life were a 2-hour movie, are you at the opening, turning point, low point, or climax? What's happening in this scene?",
    ],
  },
};

// Pool of paired bilingual questions — zh & en at the same index match in meaning.
export function flattenPool() {
  const out = [];
  THEMES.forEach((theme) => {
    const zhArr = QUESTIONS.zh[theme.id] || [];
    const enArr = QUESTIONS.en[theme.id] || [];
    const n = Math.min(zhArr.length, enArr.length);
    for (let i = 0; i < n; i++) {
      out.push({
        id: `${theme.id}-${i}`,
        themeId: theme.id,
        zh: zhArr[i],
        en: enArr[i],
      });
    }
  });
  return out;
}

export function themeLabels(themeId) {
  const t = THEMES.find((x) => x.id === themeId);
  if (!t) return { zh: "", en: "" };
  return { zh: t.zh, en: t.en };
}

// ----- Game pacing -----
// Phase 1: warmup — 5–7 "self" questions in a row (randomized per game)
// Phase 2: interest-heavy — next 5 picks include ≥3 "interests" (shuffled)
// Phase 3: free random across all themes
const SELF_WARMUP_MIN = 5;
const SELF_WARMUP_MAX = 7;
const PHASE2_LENGTH = 5;
const PHASE2_INTEREST_MIN = 3;

let selfWarmupTarget = null;
let phase2Plan = null; // length PHASE2_LENGTH, each slot 'i' or '?'

function shuffleArr(arr) {
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

export function pickQuestion(usedIds = []) {
  const pool = flattenPool();

  // Reset per-game state at the start of a fresh game.
  if (usedIds.length === 0) {
    selfWarmupTarget =
      SELF_WARMUP_MIN +
      Math.floor(Math.random() * (SELF_WARMUP_MAX - SELF_WARMUP_MIN + 1));
    phase2Plan = null;
  }
  // Defensive: if state was lost (page reload mid-game), re-seed warmup.
  if (selfWarmupTarget === null) {
    selfWarmupTarget =
      SELF_WARMUP_MIN +
      Math.floor(Math.random() * (SELF_WARMUP_MAX - SELF_WARMUP_MIN + 1));
  }

  let available = pool.filter((q) => !usedIds.includes(q.id));

  // Phase 1: warmup — restrict to "self"
  if (usedIds.length < selfWarmupTarget) {
    const selfOnly = available.filter((q) => q.themeId === "self");
    if (selfOnly.length > 0) available = selfOnly;
  }
  // Phase 2: interest-heavy — 3 forced 'interests' slots + 2 free (any non-self),
  // shuffled so the interest picks aren't always at the front.
  else if (usedIds.length < selfWarmupTarget + PHASE2_LENGTH) {
    if (phase2Plan === null) {
      const free = PHASE2_LENGTH - PHASE2_INTEREST_MIN;
      phase2Plan = shuffleArr([
        ...Array(PHASE2_INTEREST_MIN).fill("i"),
        ...Array(free).fill("?"),
      ]);
    }
    const slotIdx = usedIds.length - selfWarmupTarget;
    const slot = phase2Plan[slotIdx];
    if (slot === "i") {
      const interestOnly = available.filter((q) => q.themeId === "interests");
      if (interestOnly.length > 0) available = interestOnly;
    } else {
      // free slot — anything except self (keep variety from warmup)
      const notSelf = available.filter((q) => q.themeId !== "self");
      if (notSelf.length > 0) available = notSelf;
    }
  }
  // Phase 3: free random across all themes (no extra filter)

  if (available.length === 0) {
    return pool[Math.floor(Math.random() * pool.length)];
  }
  return available[Math.floor(Math.random() * available.length)];
}
