// scripts.js: who lives here and what they say. Personalities come from research/GAGS.md: Saxo leads, confident and a
// bit off (the joke is often on him); Sadi is the romance and the reality check (she floored him on 2026-09-24);
// Kob is grumpy, unplugs things and is secretly the best dancer; Compote is always angry, violent over small things.
// A node: { say: [lines] (NPC bubbles), anim: NPC clip while talking, choices: [{ text (Saxo's reply), to | act | end }] }.
// `act` runs a game action (main.js ACTIONS) and ends the chat.

export const PEOPLE = {
  sadi: { name: 'Sadi', role: 'Dance partner', sticker: 'sadi' },
  kob: { name: 'Kob', role: 'Gamer. Grumpy.', sticker: 'kob' },
  compote: { name: 'Compote', role: 'Angry. Always.', sticker: 'compote' },
};

const pick = (a, n) => a[n % a.length];

export const SCRIPTS = {
  kob: s => ({
    start: 'root',
    nodes: {
      root: {
        say: !s.met ? ['…', "You're standing in front of the TV, Saxo."]
          : s.secret ? [pick(['You again.', 'I just lost a life because of you.', 'Shh. Boss fight.'], s.visits)]
            : [pick(['Again?', 'I was about to beat my high score.', 'Every time you walk in, I lose a life.'], s.visits)],
        anim: 'sitting_talking',
        choices: [
          { text: 'What are you playing?', to: 'game' },
          { text: 'Can we watch my videos?', to: 'tv' },
          ...(s.secret ? [{ text: 'Show me your moves. Please?', to: 'moves' }] : [{ text: 'Be in my next video?', to: 'cameo' }]),
          { text: 'Bye, Kob!', to: 'bye' },
        ],
      },
      game: { say: ['Dance Dance Revolution. Hard mode.', 'With my paws.'], choices: [{ text: 'Wait… YOU dance?', to: 'secret' }, { text: 'Can I play?', to: 'play' }] },
      play: { say: ["No. You'd dance on the controller."], choices: [{ text: 'Fair.', to: 'root2' }] },
      secret: { say: ['No.', '…', 'Tell anyone and I unplug your TV. Forever.'], flag: 'secret', choices: [{ text: 'My lips are sealed.', to: 'root2' }] },
      tv: { say: ['Ugh. Every channel is you anyway.', "Fine. It's all yours."], choices: [{ text: 'Thanks, Kob!', act: 'tv' }] },
      cameo: { say: ["I don't do cameos.", 'I do headlines.'], choices: [{ text: 'So… is that a yes?', to: 'agent' }] },
      agent: { say: ["It's a 'call my agent'."], choices: [{ text: "You don't have an agent.", to: 'exactly' }] },
      exactly: { say: ['Exactly.'], choices: [{ text: 'Bye, Kob.', to: 'bye' }] },
      moves: { say: ['…', 'Fine. ONCE. Nobody films this.'], choices: [{ text: '*hides phone*', act: 'kobdance' }] },
      root2: { say: [pick(['Anything else?', 'You still here?', 'What.'], s.visits)], choices: [{ text: 'Can we watch my videos?', to: 'tv' }, { text: 'Bye, Kob!', to: 'bye' }] },
      bye: { say: ['Finally.'], end: true },
    },
  }),

  sadi: s => ({
    start: 'root',
    nodes: {
      root: {
        say: !s.met ? ['Saxo! There you are.', 'The floor has been waiting for you.']
          : [pick(['Back for more?', 'Still thinking about that K.O.?', 'You look like you need a dance.'], s.visits)],
        anim: 'talking',
        choices: [
          { text: 'Dance with me?', to: 'dance' },
          { text: 'About that K.O. in our video…', to: 'ko' },
          { text: "What's new?", to: 'news' },
          { text: 'See you later!', to: 'bye' },
        ],
      },
      dance: { say: ['Only if you keep up this time.'], choices: [{ text: "Let's go!", act: 'duo' }] },
      ko: { say: ['It was choreography.', '…Mostly.'], anim: 'laughing_standing', choices: [{ text: 'You FLOORED me!', to: 'spot' }] },
      spot: { say: ['You were standing in my spotlight, babe.'], anim: 'blowing_a_kiss', choices: [{ text: 'Worth it.', to: 'root2' }] },
      news: { say: ['A new video drops every day!', "Kob pretends she doesn't watch them."], choices: [{ text: 'Where can I see them?', to: 'where' }] },
      where: { say: ['The TV in the living room. Or follow @saxo.dance!'], anim: 'waving', choices: [{ text: 'Show me the socials', act: 'socials' }, { text: 'Cool!', to: 'root2' }] },
      root2: { say: [pick(['So… dance?', 'Anything else, star?', 'The beat is waiting.'], s.visits)], choices: [{ text: 'Dance with me?', to: 'dance' }, { text: 'See you later!', to: 'bye' }] },
      bye: { say: ["Don't be late for tomorrow's video!"], anim: 'waving', end: true },
    },
  }),

  compote: s => ({
    start: 'root',
    nodes: {
      root: {
        say: s.punched ? [pick(['Want another one?', 'The carrots remember.', 'Back for seconds?'], s.visits)]
          : !s.met ? ['WHAT.', "Don't even LOOK at my carrots."]
            : [pick(['You again.', "I'm still angry. In case you wondered.", 'Make it quick.'], s.visits)],
        anim: 'angry_forward_gesture',
        choices: [
          { text: 'Can I have ONE carrot?', to: 'carrot' },
          { text: 'Why are you always angry?', to: 'angry' },
          { text: 'Nice garden!', to: 'garden' },
          { text: 'Bye!', to: 'bye' },
        ],
      },
      carrot: { say: ['…'], anim: 'bored_idle', choices: [{ text: 'Just a small one?', act: 'punch' }] },
      angry: { say: ["I'M NOT ANGRY.", 'This is my happy face.'], anim: 'quickly_pointing_angrily_forward', choices: [{ text: 'Oh no.', to: 'exactly' }] },
      exactly: { say: ['EXACTLY.'], choices: [{ text: 'Want to dance?', to: 'dance' }, { text: 'Bye!', to: 'bye' }] },
      garden: { say: ["It's not a garden.", "It's a FORTRESS."], anim: 'shaking_head_no_dismissively', choices: [{ text: 'A fortress… of carrots?', to: 'fort' }] },
      fort: { say: ['Say it again. I dare you.'], choices: [{ text: '*backs away slowly*', to: 'bye' }, { text: 'Can I have ONE carrot?', to: 'carrot' }] },
      dance: { say: ['I will dance on your GRAVE.', '…to a good beat, though.'], choices: [{ text: 'Noted!', to: 'bye' }] },
      bye: { say: ['Walk. Away. Slowly.'], anim: 'quickly_pointing_angrily_forward', end: true },
    },
  }),
};
