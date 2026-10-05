/* =========================================================
   💖 EDIT EVERYTHING PERSONAL HERE 💖
   You never need to touch index.html / script.js / style.css.
   ========================================================= */

const HER_NAME = "Lilyr Ammu";          // her name or nickname
const YOUR_NAME = "Lilyr Baba";       // how you sign off

window.CONTENT = {
  name: HER_NAME,
  fromName: YOUR_NAME,

  // Number of candles on the cake (her age, or any cute number)
  candles: 5,

  // Shown on the very first screen above the gift box
  introHint: `psst… ${HER_NAME}, someone left something here for you`,

  // Shown after all candles are blown out
  wishText: "Yaaay! 🎉 I hope every single wish comes true 💫",

  // The love letter (it types itself out). Line breaks are kept.
  letter: `
Dear ${HER_NAME},

Happy birthday, my favourite human! 🎂

I wish I could be there with you today, to see your face light up, to steal a bite of your cake, and to hug you until you complain. Since I can't, I made you this little corner of the internet instead.

Even with all these kilometres between us, you are the first thing I think about in the morning and the last thing before I sleep. Distance is temporary, but you and me? That part is permanent.

Thank you for your patience, your laugh, your late-night calls, and for loving me even when I'm being silly (which is… always).

I can't wait for the day I celebrate with you in person.Some kisses, hugs and .... Until then, close your eyes, imagine the biggest hug ever(kiss also), because that's exactly what I'm sending you right now.

Happy birthday, my love. 💖
`,

  // "Reasons I love you" flip cards: add or remove as many as you like
  reasons: [
    { emoji: "😂", text: "Your smile. It's my favourite thing in the whole world." },
    { emoji: "🌙", text: "Our late-night calls that were supposed to be 'just 5 minutes'." },
    { emoji: "🤗", text: "You make me feel at home, even from miles away." },
    { emoji: "🍕", text: "You always make me tea (online tea)." },
    { emoji: "🧠", text: "Family doctor, I don have to spend any money!" },
    { emoji: "🥺", text: "The face you make when you're shy after some romance." },
    { emoji: "💪", text: "You're stronger than you know, and I'm so proud of you." },
    { emoji: "✨", text: "You make ordinary days feel like magic." },
    { emoji: "💍", text: "Because I can see my whole future with you. (5 ta baby hae?)" },
  ],

  // Timeline: put photos in assets/photos/ and reference them here
  timeline: [
    { date: "Crazy crazy feelings", title: "We met 👀", text: "I had no idea how much my life was about to change.", photo: "assets/photos/1.jpg" },
    { date: "My cutie pie", title: "Butterflies 🦋", text: "I was so nervous. You were so cute. Still are.", photo: "assets/photos/2.jpg" },
    { date: "Kuchu Puchu", title: "My Shiuly Ful 🗺️", text: "Getting lost with you is my favourite thing.", photo: "assets/photos/3.jpg" },
    { date: "Chuma nai, Dhur", title: "World tour? ✈️", text: "You make my days beautiful.", photo: "assets/photos/4.jpg" },
    { date: "Today", title: "Your birthday! 🎂", text: "And many, many more together. That's a promise.", photo: "assets/photos/5.jpg" },
  ],

  // Final message at the bottom
  finale: "No matter how far apart we are, you're always right here in my heart. ",
};
