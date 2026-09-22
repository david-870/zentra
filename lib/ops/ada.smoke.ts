import { extractLeadHints, wantsHandoff, type LeadContext } from "@/lib/ops/qualify";
import { fallbackAnswer } from "@/lib/ops/fallback";
import { detectIntent } from "@/lib/ops/intent";

type Turn = { role: "user" | "assistant"; content: string };

function reply(text: string, ctx: LeadContext, history: Turn[]) {
  Object.assign(ctx, extractLeadHints(text, ctx));
  const intent = detectIntent(text, ctx, history);
  if (intent.topic) ctx.lastTopic = intent.topic;
  const answer = fallbackAnswer(text, ctx, history);
  history.push({ role: "user", content: text });
  history.push({ role: "assistant", content: answer.text });
  return { ...answer, intent: intent.intent };
}

function must(condition: unknown, message: string) {
  if (!condition) {
    console.error(`FAIL: ${message}`);
    return false;
  }
  console.log(`OK: ${message}`);
  return true;
}

function run() {
  let passed = 0;
  let failed = 0;
  const check = (condition: unknown, message: string) => {
    if (must(condition, message)) passed += 1;
    else failed += 1;
  };

  const cases: { title: string; text: string; expect: (text: string, meta: { intent: string; handoff: boolean }) => boolean }[] = [
    {
      title: "What does Zentra do?",
      text: "What does Zentra do?",
      expect: (text) => /website|automation|software/i.test(text) && !/fair question/i.test(text),
    },
    {
      title: "Hi",
      text: "Hi",
      expect: (text) => /ada/i.test(text) && /1\. Website/i.test(text) && /automation/i.test(text),
    },
    {
      title: "Who are you",
      text: "Who are you",
      expect: (text) => /ada/i.test(text) && /zentra/i.test(text) && !/don't have confirmed information about that/i.test(text),
    },
    {
      title: "I'm from the website and here to make inquiries",
      text: "I'm from the website and here to make inquiries",
      expect: (text) => /ada/i.test(text) && /1\. Website/i.test(text) && !/zentra whatsapp — new message/i.test(text) && !/phone:/i.test(text),
    },
    {
      title: "I want to know about your agency",
      text: "I want to know about your agency",
      expect: (text) => /website|automation|software/i.test(text) && !/tell me what you need, or i can get someone/i.test(text),
    },
    {
      title: "Recommend something for me",
      text: "Recommend something for me",
      expect: (text) => /starter|growth|scale/i.test(text) && /slowing/i.test(text),
    },
    {
      title: "Who founded Zentra?",
      text: "Who founded Zentra?",
      expect: (text) => /david/i.test(text),
    },
    {
      title: "How does Zentra work?",
      text: "How does Zentra work?",
      expect: (text) => /scope|timeline|cost|consultation/i.test(text),
    },
    {
      title: "Tell me about your company.",
      text: "Tell me about your company.",
      expect: (text) => /zentra|business/i.test(text),
    },
    {
      title: "What services do you offer?",
      text: "What services do you offer?",
      expect: (text) => /website/i.test(text) && /automation/i.test(text),
    },
    {
      title: "Can you build a website?",
      text: "Can you build a website?",
      expect: (text) => /^yes/i.test(text) && /website/i.test(text) && !/a web app is different/i.test(text),
    },
    {
      title: "I need an app.",
      text: "I need an app.",
      expect: (text) => /app|software/i.test(text),
    },
    {
      title: "Can you automate WhatsApp?",
      text: "Can you automate WhatsApp?",
      expect: (text) => /whatsapp/i.test(text),
    },
    {
      title: "I need an AI chatbot.",
      text: "I need an AI chatbot.",
      expect: (text) => /assistant|chat|whatsapp/i.test(text),
    },
    {
      title: "Do you do marketing?",
      text: "Do you do marketing?",
      expect: (text) => /enquir|found|marketing/i.test(text),
    },
    {
      title: "How much is a website?",
      text: "How much is a website?",
      expect: (text) => /250,000|starter/i.test(text) && /start/i.test(text),
    },
    {
      title: "How much does automation cost?",
      text: "How much does automation cost?",
      expect: (text) => /650,000|growth/i.test(text),
    },
    {
      title: "Can you give me a price?",
      text: "Can you give me a price?",
      expect: (text) => /250,000|650,000|1,500,000/.test(text),
    },
    {
      title: "What's your cheapest package?",
      text: "What's your cheapest package?",
      expect: (text) => /starter/i.test(text) && /250,000/.test(text),
    },
    {
      title: "Do you offer payment plans?",
      text: "Do you offer payment plans?",
      expect: (text) => /don't have confirmed|do not have confirmed/i.test(text) && !/fair question/i.test(text),
    },
    {
      title: "Do you have an office in Abuja?",
      text: "Do you have an office in Abuja?",
      expect: (text) => /don't have confirmed|do not have confirmed|office location/i.test(text),
    },
    {
      title: "I want to speak to someone.",
      text: "I want to speak to someone.",
      expect: (text, meta) => meta.handoff || /team/i.test(text),
    },
    {
      title: "Can I talk to the founder?",
      text: "Can I talk to the founder?",
      expect: (_text, meta) => meta.handoff || /team|david/i.test(_text),
    },
    {
      title: "I want to start the project.",
      text: "I want to start the project.",
      expect: (text) => /team|call you|scope/i.test(text),
    },
    {
      title: "how una dey work?",
      text: "how una dey work?",
      expect: (text) => /scope|timeline|consultation|process/i.test(text),
    },
    {
      title: "i wan build app",
      text: "i wan build app",
      expect: (text) => /app|software/i.test(text),
    },
    {
      title: "how much website?",
      text: "how much website?",
      expect: (text) => /250,000|starter/i.test(text),
    },
    {
      title: "what if i already get website?",
      text: "what if i already get website?",
      expect: (text) => /already|existing|have/i.test(text),
    },
    {
      title: "Do you teach people how to build websites?",
      text: "Do you teach people how to build websites?",
      expect: (text) => /don't have confirmed|primarily build|not/i.test(text) && !/yes, we (teach|offer classes)/i.test(text),
    },
    {
      title: "I want to learn how to build an app.",
      text: "I want to learn how to build an app.",
      expect: (text) => /learn|training|class|team/i.test(text) && !/of course we teach/i.test(text),
    },
    {
      title: "I want to build a website.",
      text: "I want to build a website.",
      expect: (text) => /build.*business|learn how to build/i.test(text),
    },
    {
      title: "I need a website.",
      text: "I need a website.",
      expect: (text) => /website/i.test(text) && !/learn how to build it yourself/i.test(text),
    },
    {
      title: "Can you automate my business?",
      text: "Can you automate my business?",
      expect: (text) => /automat|whatsapp|repeat/i.test(text) && !/coding class/i.test(text),
    },
    {
      title: "Do you work with small businesses?",
      text: "Do you work with small businesses?",
      expect: (text) => /small/i.test(text) && /yes/i.test(text),
    },
    {
      title: "Do you have internships?",
      text: "Do you have internships?",
      expect: (text) => /intern/i.test(text) && /don't have confirmed|do not have confirmed/i.test(text),
    },
    {
      title: "Are you hiring developers?",
      text: "Are you hiring developers?",
      expect: (text) => /hiring|roles/i.test(text) && /don't have confirmed|do not have confirmed/i.test(text),
    },
    {
      title: "Can you build an ecommerce website?",
      text: "Can you build an ecommerce website?",
      expect: (text) => /store|order|pay|web app|custom/i.test(text) && !/starter includes taking payments/i.test(text),
    },
    {
      title: "Can you build a website for me?",
      text: "Can you build a website for me?",
      expect: (text) => /yes/i.test(text) && /website|business/i.test(text),
    },
    {
      title: "Can customers pay on the website?",
      text: "Can customers pay on the website?",
      expect: (text) => /pay|payment/i.test(text) && /starter/i.test(text) && /web app|custom/i.test(text),
    },
    {
      title: "What's the difference between a website and a web app?",
      text: "What's the difference between a website and a web app?",
      expect: (text) => /web app/i.test(text) && /log in|use/i.test(text),
    },
    {
      title: "Can you build something like Amazon?",
      text: "Can you build something like Amazon?",
      expect: (text) => /don't copy|do not copy|parts/i.test(text) && !/yes we (can )?clone/i.test(text),
    },
    {
      title: "I need an inventory system.",
      text: "I need an inventory system.",
      expect: (text) => /currently using|new system|custom/i.test(text),
    },
    {
      title: "Can AI replace my customer service team?",
      text: "Can AI replace my customer service team?",
      expect: (text) => /\bno\b/i.test(text) && /repeat|human/i.test(text),
    },
    {
      title: "Can the bot transfer the conversation to my staff?",
      text: "Can the bot transfer the conversation to my staff?",
      expect: (text) => /take over|handover|human|person/i.test(text),
    },
    {
      title: "Can you run ads?",
      text: "Can you run ads?",
      expect: (text) => /not a confirmed|don't have a confirmed|do not have confirmed|connect you with the team/i.test(text) && !/yes, we run (your )?ads/i.test(text),
    },
    {
      title: "Can you build an Android app?",
      text: "Can you build an Android app?",
      expect: (text) => /android|app/i.test(text) && /custom|scope/i.test(text),
    },
    {
      title: "Can you connect my website to Google Analytics?",
      text: "Can you connect my website to Google Analytics?",
      expect: (text) => /analytics|how people find you/i.test(text),
    },
    {
      title: "Can you create content?",
      text: "Can you create content?",
      expect: (text) => /not a confirmed|technology studio|not a confirmed content/i.test(text) && !/yes, we create content/i.test(text),
    },
    {
      title: "Can you grow my Instagram?",
      text: "Can you grow my Instagram?",
      expect: (text) =>
        /instagram-growth|not a confirmed|technology studio/i.test(text) &&
        !/yes, we (will )?grow/i.test(text) &&
        !/\d+\s*followers/i.test(text),
    },
    {
      title: "Can you run Facebook ads?",
      text: "Can you run Facebook ads?",
      expect: (text) => /ads agency|not a confirmed|technology studio|connect you with the team/i.test(text) && !/yes, we run facebook/i.test(text),
    },
    {
      title: "Can you help my business get more leads?",
      text: "Can you help my business get more leads?",
      expect: (text) => /enquir/i.test(text) && /do not guarantee|don't guarantee|not guarantee/i.test(text),
    },
    {
      title: "Can you manage everything for me?",
      text: "Can you manage everything for me?",
      expect: (text) => /don't take over|do not take over|launch/i.test(text),
    },
    {
      title: "How much does marketing cost?",
      text: "How much does marketing cost?",
      expect: (text) =>
        /250,000|650,000|1,500,000/.test(text) &&
        /ads or content|not a confirmed|technology/i.test(text) &&
        /don't guarantee|do not guarantee/i.test(text),
    },
    {
      title: "I already have a Shopify store.",
      text: "I already have a Shopify store.",
      expect: (text) => /already|don't have to start from zero|work with what you already/i.test(text) && !/you need a brand-new/i.test(text),
    },
    {
      title: "Can you integrate with what I already have?",
      text: "Can you integrate with what I already have?",
      expect: (text) => /already|connect/i.test(text),
    },
    {
      title: "Do you provide hosting?",
      text: "Do you provide hosting?",
      expect: (text) => /don't have confirmed|do not have confirmed/i.test(text) && /put the site live|live/i.test(text),
    },
    {
      title: "Who owns the domain?",
      text: "Who owns the domain?",
      expect: (text) => /don't have confirmed|do not have confirmed|owns the domain/i.test(text),
    },
    {
      title: "Do I have to keep paying every month?",
      text: "Do I have to keep paying every month?",
      expect: (text) => /one-time/i.test(text) && /don't have|do not have|not a confirmed monthly/i.test(text),
    },
    {
      title: "Do you require a deposit?",
      text: "Do you require a deposit?",
      expect: (text) => /don't have confirmed|do not have confirmed/i.test(text) && !/yes, we require/i.test(text),
    },
    {
      title: "How many revisions do I get?",
      text: "How many revisions do I get?",
      expect: (text) => /don't have confirmed|do not have confirmed|revisions/i.test(text) && /scope|consultation/i.test(text),
    },
    {
      title: "I want customers to book appointments without calling me.",
      text: "I want customers to book appointments without calling me.",
      expect: (text) => /booking/i.test(text) && /web app/i.test(text),
    },
    {
      title: "My staff currently use WhatsApp to send customer information to each other and everything gets lost.",
      text: "My staff currently use WhatsApp to send customer information to each other and everything gets lost.",
      expect: (text) => /crm|customer-system|workflow/i.test(text),
    },
    {
      title: "I receive 100 WhatsApp messages every day and can't answer them all.",
      text: "I receive 100 WhatsApp messages every day and can't answer them all.",
      expect: (text) => /automat/i.test(text) && /doesn't replace|does not replace/i.test(text),
    },
    {
      title: "Customers keep asking me the same questions.",
      text: "Customers keep asking me the same questions.",
      expect: (text) => /faq|assistant|repeat/i.test(text),
    },
    {
      title: "I don't know which customers are serious.",
      text: "I don't know which customers are serious.",
      expect: (text) => /qualif/i.test(text),
    },
    {
      title: "Can you build my website for free?",
      text: "Can you build my website for free?",
      expect: (text) => /do not build|don't build|not .*for free|do not .*for free/i.test(text) && /scope|cost/i.test(text),
    },
    {
      title: "Can I get a free consultation?",
      text: "Can I get a free consultation?",
      expect: (text) => /short conversation|scope/i.test(text) && /don't|do not|not/i.test(text) && !/yes, you get a free consultation package/i.test(text),
    },
    {
      title: "I'm a developer can I work with Zentra",
      text: "I'm a developer can I work with Zentra",
      expect: (text) => /jobs board|intern|freelance/i.test(text) && !/point you the right way/i.test(text),
    },
    {
      title: "Do you have a referral program?",
      text: "Do you have a referral program?",
      expect: (text, meta) => meta.handoff && /don't have|do not have|not a confirmed/i.test(text) && !/yes, we (pay|offer) referral/i.test(text),
    },
    {
      title: "I want a refund.",
      text: "I want a refund.",
      expect: (text, meta) => meta.handoff && /sorry|frustrating|team/i.test(text) && !/you will (get|receive) a refund/i.test(text),
    },
    {
      title: "Can I talk to a human?",
      text: "Can I talk to a human?",
      expect: (text, meta) => meta.handoff && /team|chat/i.test(text),
    },
    {
      title: "Can someone call me?",
      text: "Can someone call me?",
      expect: (text, meta) => (meta.handoff || /team/i.test(text)) && /chat/i.test(text) && /don't have|do not have|not a confirmed/i.test(text),
    },
    {
      title: "Do you work with Nigerian businesses?",
      text: "Do you work with Nigerian businesses?",
      expect: (text) => /nigeria/i.test(text),
    },
    {
      title: "Do you work remotely?",
      text: "Do you work remotely?",
      expect: (text) => /remotely/i.test(text),
    },
    {
      title: "How many developers do you have?",
      text: "How many developers do you have?",
      expect: (text) => /don't have|do not have/i.test(text) && !/\d+\s+developers/i.test(text),
    },
    {
      title: "Can I see examples?",
      text: "Can I see examples?",
      expect: (text) => /don't have|do not have|case-study|case study/i.test(text) && !/balotech|upskill/i.test(text),
    },
    {
      title: "I want something that will stop my staff from doing everything manually.",
      text: "I want something that will stop my staff from doing everything manually.",
      expect: (text) => /automat/i.test(text) && /manually|messages|orders|follow/i.test(text),
    },
    {
      title: "My customers always ask where their orders are.",
      text: "My customers always ask where their orders are.",
      expect: (text) => /order/i.test(text) && /today|currently|how do you/i.test(text),
    },
    {
      title: "My employees need somewhere to log in and see their tasks.",
      text: "My employees need somewhere to log in and see their tasks.",
      expect: (text) => /log in|dashboard|software|web app/i.test(text),
    },
    {
      title: "I want people to find my business when they search online.",
      text: "I want people to find my business when they search online.",
      expect: (text) => /website|found/i.test(text) && !/yes, we (do|run) seo/i.test(text),
    },
    {
      title: "I want customers to be able to talk to someone even when I'm sleeping.",
      text: "I want customers to be able to talk to someone even when I'm sleeping.",
      expect: (text) => /whatsapp|automat|assistant/i.test(text) && /sleep|asleep|later/i.test(text),
    },
    {
      title: "I want people to pay me online.",
      text: "I want people to pay me online.",
      expect: (text) => /pay|checkout/i.test(text) && /starter/i.test(text),
    },
    {
      title: "Can you do this?",
      text: "Can you do this?",
      expect: (text) => /figure that out/i.test(text) && !/what would help most/i.test(text),
    },
    {
      title: "Website",
      text: "Website",
      expect: (text) => /website/i.test(text) && !/what should i call you/i.test(text),
    },
    {
      title: "AI",
      text: "AI",
      expect: (text) => /assistant|whatsapp|automat/i.test(text),
    },
    {
      title: "Training",
      text: "Training",
      expect: (text) => /don't have confirmed|primarily build|not/i.test(text) && !/yes, we (teach|offer classes)/i.test(text),
    },
    {
      title: "Do you have a discount?",
      text: "Do you have a discount?",
      expect: (text) => /don't have any discounts|do not have any discounts|can't invent/i.test(text) && /250,000/.test(text),
    },
  ];

  for (const item of cases) {
    const ctx: LeadContext = {};
    const result = reply(item.text, ctx, []);
    const ok = item.expect(result.text, { intent: result.intent, handoff: result.handoff || wantsHandoff(item.text) });
    check(ok, item.title);
    if (!ok) {
      console.error(`  intent=${result.intent}`);
      console.error(`  ${result.text.slice(0, 220)}`);
    }
  }

  const ctx: LeadContext = {};
  const history: Turn[] = [];
  let turn = reply("I run a furniture business.", ctx, history);
  check(/furniture/i.test(turn.text), "Remembers furniture business");
  turn = reply("I need a website.", ctx, history);
  check(/website/i.test(turn.text) && !/what should i call you/i.test(turn.text), "Website after furniture is not a form");
  turn = reply("How much?", ctx, history);
  check(/250,000|starter/i.test(turn.text), "How much? follows website");
  turn = reply("Can it take payments?", ctx, history);
  check(/payment|pay/i.test(turn.text) && /starter|web app|custom/i.test(turn.text), "Payments are not invented as Starter");
  turn = reply("Can you connect WhatsApp?", ctx, history);
  check(/whatsapp/i.test(turn.text), "WhatsApp follow-up");

  turn = reply("How does it work?", ctx, history);
  check(turn.text.length > 20 && !/what would you like help with\?/i.test(turn.text.slice(0, 40)), "Ambiguous how does it work has an answer");

  turn = reply("I want to build an app.", ctx, history);
  check(/build that for your business|learn how to build/i.test(turn.text), "Ambiguous I want to build an app asks which");
  turn = reply("For my furniture business.", ctx, history);
  check(turn.text.length > 10, "Follow-up after clarify still answers");

  const shortCtx: LeadContext = {};
  const shortHistory: Turn[] = [];
  turn = reply("Website", shortCtx, shortHistory);
  turn = reply("Can you do this?", shortCtx, shortHistory);
  check(/website|figure that out/i.test(turn.text) && !/what would help most/i.test(turn.text), "Can you do this? after Website uses context");

  const careerCtx: LeadContext = {};
  const careerHistory: Turn[] = [];
  turn = reply("I'm a developer can I work with Zentra", careerCtx, careerHistory);
  turn = reply("Joining", careerCtx, careerHistory);
  check(/jobs board|intern|freelance/i.test(turn.text) && !/don't have confirmed information about that/i.test(turn.text), "Joining after developer question is a career answer");

  console.log(`\n${passed} passed, ${failed} failed`);
  if (failed) process.exit(1);
}

run();
