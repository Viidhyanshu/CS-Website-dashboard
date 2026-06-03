import { loadEnvConfig } from '@next/env';

// Load environment variables from .env.local
loadEnvConfig(process.cwd());

import { events } from './schema';

const realEventsData = [
  {
    title: "Genify",
    description: "Burnout is a fast paced MotoGP-themed datathon where every second counts,each dataset was a curve and only the sharpest minds make it to the finish line",
    coverImage: "https://images.prismic.io/ieeemuj/abnoP7bci2UF6J9U_GENIFY.png?auto=format,compress",
    eventDate: new Date("2025-06-14T10:00:00"),
    tag: "Workshop",
    slug: "genify"
  },
  {
    title: "Burnout",
    description: "Burnout is a fast paced MotoGP-themed datathon where every second counts,each dataset was a curve and only the sharpest minds make it to the finish line",
    coverImage: "https://images.prismic.io/ieeemuj/aExUQ7NJEFaPX9Bv_burnout.jpg",
    eventDate: new Date("2025-06-14T10:00:00"),
    tag: "Datathon",
    slug: "burnout"
  },
  {
    title: "HackerzStreet 3.0",
    description: "Hackerzstreet 3.0 is a 24-hour high octane hackathon where caffeine meets code, chaos sparks creativity and only the sharpest minds survive",
    coverImage: "https://images.prismic.io/ieeemuj/aEBmR7h8WN-LVmiy_HSPoster%5B1%5D.png",
    eventDate: new Date(0),
    tag: "Hackathon",
    slug: "hackerzstreet-3-0"
  },
  {
    title: "Mockup 4.0",
    description: "Mockup 4.0 was a 24-hour designathon where aspiring designers and startup enthusiasts transformed raw ideas into innovative digital experiences",
    coverImage: "https://images.prismic.io/ieeemuj/aEBmILh8WN-LVmia_MOCKUP%5B1%5D.png",
    eventDate: new Date(0),
    tag: "Designathon",
    slug: "mockup-4-0"
  },
  {
    title: "T-Minus",
    description: "T-Minus was a ticking warzone of tech, wit, nerve, and focus where teams raced against time to crack codes, dodge lasers,and conquer high-tech challenges.",
    coverImage: "https://images.prismic.io/ieeemuj/aEBl9rh8WN-LVmh8_T-MINUS%5B1%5D.png",
    eventDate: new Date(0),
    tag: "Competition",
    slug: "t-minus"
  },
  {
    title: "Snatch",
    description: "Snatch was a high intensity coding gauntlet where teams battled in a problem-solving crusade of wits and synergy",
    coverImage: "https://images.prismic.io/ieeemuj/aEBlzbh8WN-LVmhm_CTFsnatch%5B1%5D.png",
    eventDate: new Date(0),
    tag: "Coding",
    slug: "snatch"
  },
  {
    title: "FTF 8.0",
    description: "MUJ alumnus Vaibhav Barodawala from Nvidia articulated valuable insights on mastering core CS fundamentals and strategic utilization of modern tech stacks.",
    coverImage: "https://images.prismic.io/ieeemuj/aEBlO7h8WN-LVmfc_FTF-GREEN%5B1%5D.png",
    eventDate: new Date(0),
    tag: "Seminar",
    slug: "ftf-8-0"
  },
  {
    title: "Git it Done",
    description: "A hands-on workshop and unlock the full power of GitHub- from mastering version control to nailing that GSoC 🎖",
    coverImage: "https://images.prismic.io/ieeemuj/Z0iy5JbqstJ974Kh_GITITDONEPOSTER.png",
    eventDate: new Date(0),
    tag: "Workshop",
    slug: "git-it-done"
  },
  {
    title: "Breaking Bug",
    description: "An exciting challenge where even the tiniest bugs can be game changers, and hold up! Is that an secret trove of easter bugs? 🐞",
    coverImage: "https://images.prismic.io/ieeemuj/ZqYJpR5LeNNTxizl_WhatsAppImage2024-07-27at19.22.16_b55b37b0.jpg",
    eventDate: new Date(0),
    tag: "Competition",
    slug: "breaking-bug"
  },
  {
    title: "F1nalyze",
    description: "Gear up for a high-speed, data-driven adventure at the ultimate 24 hour datathon, F1nalyze! 🏎",
    coverImage: "https://images.prismic.io/ieeemuj/ZnVFFZm069VX18ao_WhatsAppImage2024-06-20at14.37.44_b7e57d81.jpg",
    eventDate: new Date(0),
    tag: "Datathon",
    slug: "f1nalyze"
  },
  {
    title: "Weakest Link",
    description: "Answer trivia, strategize with your team, but beware: one wrong move could spell doom. 🪄",
    coverImage: "https://images.prismic.io/ieeemuj/ZhabUDjCgu4jzuoM_weakest_link_poster.png",
    eventDate: new Date(0),
    tag: "Quiz",
    slug: "weakest-link"
  },
  {
    title: "HackerzStreet 2.0",
    description: "Gear up for an adrenaline-fueled 24-hour coding marathon at Hackerzstreet 2.0, the ultimate tech showdown.🔥",
    coverImage: "https://images.prismic.io/ieeemuj/Zg0-j8t2UUcvBWwc_for-print-low-res.png",
    eventDate: new Date(0),
    tag: "Hackathon",
    slug: "hackerzstreet-2-0"
  },
  {
    title: "En-Code",
    description: "IEEE CS MUJ X Oneiros presents <en-Code>, a coding battle with a 10K prize pool! 🚀 Sharpen your algorithms and conquer for a chance to win big! 💸",
    coverImage: "https://images.prismic.io/ieeemuj/049efa5c-d213-4904-9da9-2b476fad8dbe_ENCODE+final.png",
    eventDate: new Date(0),
    tag: "Coding",
    slug: "en-code"
  },
  {
    title: "Epiphany 2.0",
    description: "Unleash creativity! 💡🧠 Join on 10-11 Feb at 307, AB-1, 10 am. Exciting chance to win Rs. 10K.",
    coverImage: "https://images.prismic.io/ieeemuj/31c144b8-a992-482d-aa53-26bbe9249d36_WhatsApp+Image+2024-02-06+at+18.29.19.jpeg",
    eventDate: new Date("2024-02-10T10:00:00"),
    tag: "Ideathon",
    slug: "epiphany-2-0"
  },
  {
    title: "Epiphany",
    description: "24-hour ideathon at MUJ, presenting business models to judges like Ram Sharma and Aman Virmani.",
    coverImage: "https://images.prismic.io/ieeemuj/9cd945b3-8d63-4cf2-a637-3aa74ac644c5_ephiphany.png",
    eventDate: new Date(0),
    tag: "Ideathon",
    slug: "epiphany"
  },
  {
    title: "Battleship",
    description: "IEEE CS at MUJ presents Battleship: A coding game day fostering technical culture and problem-solving.",
    coverImage: "https://images.prismic.io/ieeemuj/092ac40d-c57a-42a5-b263-c56bb574151f_battleship.jpeg",
    eventDate: new Date(0),
    tag: "Coding",
    slug: "battleship"
  },
  {
    title: "Vikrant",
    description: "IEEE CS MUJ's Vikrant seminar with Retd. Navy Captain Abhijit Dey discussing military tech.",
    coverImage: "https://images.prismic.io/ieeemuj/13c980fe-2aaa-45b4-9b13-2777f6a8a2e8_vikrant.jpeg",
    eventDate: new Date("2022-09-10T10:00:00"),
    tag: "Seminar",
    slug: "vikrant"
  },
  {
    title: "MockUp 2.0",
    description: "24-hr UI/UX event for MUJ and IEEE showcasing design talent and innovation.",
    coverImage: "https://images.prismic.io/ieeemuj/5dee8c24-dbf6-4a22-9dc7-4981f8bf3e08_mockup2.0.jpeg",
    eventDate: new Date(0),
    tag: "Designathon",
    slug: "mockup-2-0"
  },
  {
    title: "Hackerzstreet 1.0",
    description: "IEEE CS MUJ's first Hackathon: A 24-hour online challenge fostering creativity and programming skills.",
    coverImage: "https://images.prismic.io/ieeemuj/6301f722-c9a8-43f8-8eb3-2e6b97e7eabb_hackerzstreet.jpeg",
    eventDate: new Date("2022-07-09T10:00:00"),
    tag: "Hackathon",
    slug: "hackerzstreet-1-0"
  },
  {
    title: "Foster the Future 6.0",
    description: "Fostering the Future alumni talk discussing Data Science and industry work culture.",
    coverImage: "https://images.prismic.io/ieeemuj/c151e769-0dee-45c6-8663-58b017f44921_fof6.jpeg",
    eventDate: new Date(0),
    tag: "Seminar",
    slug: "foster-the-future-6-0"
  },
  {
    title: "Eth-Real",
    description: "IEEE CS event exploring Web3 technologies with speakers from Threeway.studio.",
    coverImage: "https://images.prismic.io/ieeemuj/22838764-8e99-42bb-8528-5f9d5032b52d_ethreal.jpeg",
    eventDate: new Date(0),
    tag: "Seminar",
    slug: "eth-real"
  },
  {
    title: "Fostering the Future 5.0",
    description: "Career insights from MUJ alum working at Goldman Sachs.",
    coverImage: "https://images.prismic.io/ieeemuj/0a22c43f-1a57-47ea-a038-91f9f3eac445_fof5.jpeg",
    eventDate: new Date(0),
    tag: "Seminar",
    slug: "fostering-the-future-5-0"
  },
  {
    title: "Mltiverse",
    description: "36-hour Kaggle challenge showcasing machine learning skills.",
    coverImage: "https://images.prismic.io/ieeemuj/c37f960f-1973-49a3-b210-515f0e59c5b5_MLtiVerse+Poster.png",
    eventDate: new Date(0),
    tag: "Machine Learning",
    slug: "mltiverse"
  },
  {
    title: "Fostering the Future 7.0",
    description: "Annual IEEE CS MUJ talk guiding students through internships and career paths.",
    coverImage: "https://images.prismic.io/ieeemuj/6c7c6fda-0534-4d82-8b89-7d7750303b6b_Poster+FTF.png",
    eventDate: new Date(0),
    tag: "Seminar",
    slug: "fostering-the-future-7-0"
  },
  {
    title: "Blog Buster",
    description: "Timed contest where participants create technical blogs in core domains.",
    coverImage: "https://images.prismic.io/ieeemuj/2d2b1eb0-9dc3-4f15-9e89-c2ea47b3c820_IMG-20230711-WA0112.jpg",
    eventDate: new Date(0),
    tag: "Competition",
    slug: "blog-buster"
  },
  {
    title: "Know Your Domain",
    description: "5-day event exploring UI/UX, Web Dev, Data Science and AI/ML.",
    coverImage: "https://images.prismic.io/ieeemuj/3c67358b-6121-47db-a431-409fbc818b2d_KYD+POSTER.png",
    eventDate: new Date(0),
    tag: "Workshop",
    slug: "know-your-domain"
  },
  {
    title: "Epitech",
    description: "Talk exploring entrepreneurship and business transformation.",
    coverImage: "https://images.prismic.io/ieeemuj/e2715c33-9ce1-40ee-9543-079c597d0414_epitech-poster.png",
    eventDate: new Date(0),
    tag: "Seminar",
    slug: "epitech"
  },
  {
    title: "MockUp 3.0",
    description: "24-hour nationwide UI/UX design challenge offering cash prizes.",
    coverImage: "https://images.prismic.io/ieeemuj/302689aa-c11e-4797-8fb7-54521454c68d_MOCKUP-3.0-FINAL-POSTER.png",
    eventDate: new Date(0),
    tag: "Designathon",
    slug: "mockup-3-0"
  }
];

async function main() {
  console.log('🌱 Seeding real events...');
  const { db } = await import('./index');
  
  // Clear existing mock events
  await db.delete(events);

  // Insert real events
  await db.insert(events).values(
    realEventsData.map((ev, index) => ({
      ...ev,
      displayOrder: index,
      featured: index < 3, // Feature the first few
      status: 'published'
    }))
  );

  console.log('✅ Real events seeded successfully!');
  process.exit(0);
}

main().catch(err => {
  console.error('❌ Seeding failed:', err);
  process.exit(1);
});
