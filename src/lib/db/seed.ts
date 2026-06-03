import { loadEnvConfig } from '@next/env';

// Load environment variables from .env.local
loadEnvConfig(process.cwd());

import { homepageHero, homepageHeroImages, homepageGalleryItems, events } from './schema';

async function main() {
  console.log('🌱 Starting database seeding...');

  // Dynamically import db after env is loaded
  const { db } = await import('./index');

  // 1. Seed homepage_hero
  console.log('Seeding hero section...');
  const heroId = '00000000-0000-0000-0000-000000000000';
  await db.insert(homepageHero).values({
    id: heroId,
    heading: "World \n Drivers'",
    subheading: "Champion",
    description: "Celebrate this incredible moment with a collection designed for the fans who never stopped believing. Wear it, frame it, treasure it forever.",
    ctaText: "Visit the Store",
    ctaLink: "#",
    backgroundImageUrl: "/images/events/2.avif",
  }).onConflictDoNothing();
  
  // Clean up existing data for tables that might have duplicates or that we are seeding with static IDs
  console.log('Cleaning up existing gallery items and hero overlay images...');
  await db.delete(homepageHeroImages);
  await db.delete(homepageGalleryItems);

  // 2. Seed homepage_hero_images
  console.log('Seeding hero overlay images...');
  await db.insert(homepageHeroImages).values([
    { 
      id: '00000000-0000-0000-0000-100000000001',
      heroId, 
      imageUrl: "/images/team/pic3.svg", 
      displayOrder: 0 
    },
    { 
      id: '00000000-0000-0000-0000-100000000002',
      heroId, 
      imageUrl: "/images/team/pic4.svg", 
      displayOrder: 1 
    },
  ]).onConflictDoNothing();

  // 3. Seed homepage_gallery_items
  console.log('Seeding gallery items...');
  await db.insert(homepageGalleryItems).values([
    {
      id: '00000000-0000-0000-0000-200000000001',
      title: 'QATAR_2024',
      caption: "It doesn't matter where\nyou start, it's how you\nprogress from there.",
      imageUrl: 'https://cdn.prod.website-files.com/67b5a02dc5d338960b17a7e9/68302baa04b14a1ca33c0b25_ln-home-horiz-1.webp',
      displayOrder: 0,
      isActive: true
    },
    {
      id: '00000000-0000-0000-0000-200000000002',
      title: 'QATAR_2024',
      caption: null,
      imageUrl: 'https://cdn.prod.website-files.com/67b5a02dc5d338960b17a7e9/68302baab12220595c8223b3_ln-home-horiz-2.webp',
      displayOrder: 1,
      isActive: true
    },
    {
      id: '00000000-0000-0000-0000-200000000003',
      title: 'QATAR_2024',
      caption: null,
      imageUrl: 'https://cdn.prod.website-files.com/67b5a02dc5d338960b17a7e9/68302babcf12f0111d96322e_ln-home-horiz-3-p-500.webp',
      displayOrder: 2,
      isActive: true
    },
    {
      id: '00000000-0000-0000-0000-200000000004',
      title: 'MONACO, 2023',
      caption: null,
      imageUrl: 'https://cdn.prod.website-files.com/67b5a02dc5d338960b17a7e9/68302baa798e2cc6e02ac38a_ln-home-horiz-4-p-500.webp',
      displayOrder: 3,
      isActive: true
    },
    {
      id: '00000000-0000-0000-0000-200000000005',
      title: 'BRITAIN, 2025',
      caption: null,
      imageUrl: 'https://cdn.prod.website-files.com/67b5a02dc5d338960b17a7e9/68da85d632bfefc552a0faac_Britain-25%20(1).webp',
      displayOrder: 4,
      isActive: true
    },
    {
      id: '00000000-0000-0000-0000-200000000006',
      title: 'BATTERSEA, 2024',
      caption: null,
      imageUrl: 'https://cdn.prod.website-files.com/67b5a02dc5d338960b17a7e9/68302baa14a96f3cdd2f9a95_ln-home-horiz-6-p-500.webp',
      displayOrder: 5,
      isActive: true
    },
    {
      id: '00000000-0000-0000-0000-200000000007',
      title: 'HIGH PERFORMANCE GALA, 2024',
      caption: null,
      imageUrl: 'https://cdn.prod.website-files.com/67b5a02dc5d338960b17a7e9/68302bab3ee6e26b1f434a7d_ln-home-horiz-7.webp',
      displayOrder: 6,
      isActive: true
    },
    {
      id: '00000000-0000-0000-0000-200000000008',
      title: 'BARCELONA, 2024',
      caption: "Since I was 7 years old and had my first\nexperience with kart racing, I've worked\ntirelessly to make that dream come true.",
      imageUrl: 'https://cdn.prod.website-files.com/67b5a02dc5d338960b17a7e9/68302baaedf821dd2e3a7c74_ln-home-horiz-8-p-500.webp',
      displayOrder: 7,
      isActive: true
    },
    {
      id: '00000000-0000-0000-0000-200000000009',
      title: 'BARCELONA, 2024',
      caption: null,
      imageUrl: 'https://cdn.prod.website-files.com/67b5a02dc5d338960b17a7e9/68302bab4f762cdbc5e93415_ln-home-horiz-10.webp',
      displayOrder: 8,
      isActive: true
    }
  ]).onConflictDoNothing();

  // 4. Seed events
  console.log('Seeding events...');
  await db.insert(events).values([
    {
      title: 'Championship Showcase',
      slug: 'championship-showcase',
      description: 'An exhibition celebrating our world-class drivers and engineers.',
      coverImage: '/images/events/1.avif',
      eventDate: new Date(),
      displayOrder: 0,
      featured: true,
      status: 'published'
    },
    {
      title: 'Annual Tech Summit',
      slug: 'annual-tech-summit',
      description: 'Discussing the future of software development in motorsport technology.',
      coverImage: '/images/events/2.avif',
      eventDate: new Date(),
      displayOrder: 1,
      featured: false,
      status: 'published'
    },
    {
      title: 'Design Workshop',
      slug: 'design-workshop',
      description: 'A hands-on event detailing modern aesthetics and CSS design systems.',
      coverImage: '/images/events/3.avif',
      eventDate: new Date(),
      displayOrder: 2,
      featured: false,
      status: 'published'
    },
    {
      title: 'Event Four',
      slug: 'event-four',
      description: 'Motorsport technology and driver engineering seminar.',
      coverImage: '/images/events/4.avif',
      eventDate: new Date(),
      displayOrder: 3,
      featured: false,
      status: 'published'
    },
    {
      title: 'Event Five',
      slug: 'event-five',
      description: 'A deep dive into telemetry data analytics and aerodynamics.',
      coverImage: '/images/events/5.avif',
      eventDate: new Date(),
      displayOrder: 4,
      featured: false,
      status: 'published'
    },
    {
      title: 'Event Six',
      slug: 'event-six',
      description: 'Annual general assembly and team orientation for new recruits.',
      coverImage: '/images/events/6.avif',
      eventDate: new Date(),
      displayOrder: 5,
      featured: false,
      status: 'published'
    },
    {
      title: 'Event Seven',
      slug: 'event-seven',
      description: 'Robotics and automation exhibition in advanced racing cars.',
      coverImage: '/images/events/7.avif',
      eventDate: new Date(),
      displayOrder: 6,
      featured: false,
      status: 'published'
    }
  ]).onConflictDoNothing();

  console.log('✅ Seeding completed successfully!');
  process.exit(0);
}

main().catch((err) => {
  console.error('❌ Seeding failed:', err);
  process.exit(1);
});
