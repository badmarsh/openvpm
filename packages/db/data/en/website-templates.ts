// Website template seed data — English (EN) locale
// Each template defines a complete website structure with pages and blocks.
// Template slugs must match lib/templates/metadata.ts single source of truth.

export const websiteTemplatesData: Record<string, {
  title: string;
  description: string;
  pages: {
    title: string;
    slug: string;
    pageType: string;
    isHome: boolean;
    showInNav: boolean;
    sortOrder: number;
    blocks: {
      blockType: string;
      sortOrder: number;
      content: Record<string, unknown>;
      settings: Record<string, unknown>;
    }[];
  }[];
}> = {
  // Template 1: Clean & Modern
  "clean-modern": {
    title: "Modern Veterinary Clinic",
    description: "Clean, professional design for a modern clinic",
    pages: [
      {
        title: "Home",
        slug: "",
        pageType: "home",
        isHome: true,
        showInNav: true,
        sortOrder: 0,
        blocks: [
          {
            blockType: "hero",
            sortOrder: 0,
            content: {
              heading: "Care you can trust",
              subheading: "Professional veterinary care with a compassionate approach",
              ctaText: "Book an Appointment",
              ctaLink: "/portal/booking",
              secondaryCtaText: "Our Services",
              secondaryCtaLink: "/services",
              backgroundImage: null,
            },
            settings: { padding: "large", backgroundColor: "#f0f9ff" },
          },
          {
            blockType: "services",
            sortOrder: 1,
            content: {
              heading: "Our Services",
              layout: "grid",
              services: [
                { icon: "stethoscope", title: "Preventive Care", description: "Regular check-ups and vaccinations for your pet's health", price: "from €35" },
                { icon: "heart-pulse", title: "Surgery", description: "Modern surgical procedures in a safe environment", price: "from €150" },
                { icon: "pill", title: "Pharmacy", description: "Complete medications and supplements for your pets" },
                { icon: "microscope", title: "Diagnostics", description: "Advanced laboratory and imaging diagnostics" },
              ],
            },
            settings: { padding: "medium" },
          },
          {
            blockType: "testimonials",
            sortOrder: 2,
            content: {
              heading: "What our clients say",
              layout: "carousel",
              testimonials: [
                { name: "Jana K.", text: "Professional approach and great care for our dog. Highly recommended!", rating: 5, source: "google" },
                { name: "Peter M.", text: "The best veterinary clinic in town. Modern equipment and friendly staff.", rating: 5, source: "google" },
              ],
            },
            settings: { padding: "medium", backgroundColor: "#f8fafc" },
          },
          {
            blockType: "cta",
            sortOrder: 3,
            content: {
              heading: "Book an appointment today",
              description: "We're here for you and your pets. Book your appointment online.",
              buttonText: "Book an Appointment",
              buttonLink: "/portal/booking",
              style: "primary",
            },
            settings: { padding: "large" },
          },
        ],
      },
      {
        title: "Services",
        slug: "services",
        pageType: "services",
        isHome: false,
        showInNav: true,
        sortOrder: 1,
        blocks: [
          {
            blockType: "hero",
            sortOrder: 0,
            content: {
              heading: "Our Services",
              subheading: "Comprehensive veterinary care for your pets",
              ctaText: "Book an Appointment",
              ctaLink: "/portal/booking",
            },
            settings: { padding: "small" },
          },
        ],
      },
      {
        title: "Contact",
        slug: "contact",
        pageType: "contact",
        isHome: false,
        showInNav: true,
        sortOrder: 2,
        blocks: [
          {
            blockType: "contact_form",
            sortOrder: 0,
            content: {
              heading: "Contact Us",
              description: "Send us a message and we'll get back to you shortly",
              fields: ["name", "email", "phone", "message"],
              submitText: "Send Message",
              successMessage: "Thank you for your message. We'll get back to you soon.",
            },
            settings: { padding: "medium" },
          },
          {
            blockType: "opening_hours",
            sortOrder: 1,
            content: {
              heading: "Opening Hours",
              source: "practice_settings",
              showEmergency: true,
              emergencyPhone: "+421 911 123 456",
            },
            settings: { padding: "medium", backgroundColor: "#f8fafc" },
          },
        ],
      },
    ],
  },

  // Template 2: Warm & Trusting
  "warm-trusting": {
    title: "Warm & Trusting Clinic",
    description: "Earthy tones, emphasis on reviews, family atmosphere",
    pages: [
      {
        title: "Home",
        slug: "",
        pageType: "home",
        isHome: true,
        showInNav: true,
        sortOrder: 0,
        blocks: [
          {
            blockType: "hero",
            sortOrder: 0,
            content: {
              heading: "Welcome to our veterinary family",
              subheading: "Love for animals is at the heart of everything we do",
              ctaText: "Book an Appointment",
              ctaLink: "/portal/booking",
              backgroundImage: null,
            },
            settings: { padding: "large", backgroundColor: "#fef3c7" },
          },
          {
            blockType: "about",
            sortOrder: 1,
            content: {
              heading: "About Us",
              content: "<p>We are a family veterinary clinic with over 10 years of experience. Our mission is to provide kind and professional care to every animal that comes through our doors.</p>",
            },
            settings: { padding: "medium" },
          },
          {
            blockType: "testimonials",
            sortOrder: 2,
            content: {
              heading: "Client Reviews",
              layout: "grid",
              testimonials: [
                { name: "Maria", text: "Amazing approach to animals. We feel at home here.", rating: 5, source: "google" },
                { name: "Joseph", text: "Professionals with a loving heart. Thank you!", rating: 5, source: "google" },
                { name: "Susan", text: "Our cat always looks forward to visiting. Great team!", rating: 5, source: "google" },
              ],
            },
            settings: { padding: "medium", backgroundColor: "#fffbeb" },
          },
        ],
      },
    ],
  },

  // Template 3: Clinical & Professional
  "clinical-professional": {
    title: "Clinical & Professional Clinic",
    description: "Data and facts, service list, authority",
    pages: [
      {
        title: "Home",
        slug: "",
        pageType: "home",
        isHome: true,
        showInNav: true,
        sortOrder: 0,
        blocks: [
          {
            blockType: "hero",
            sortOrder: 0,
            content: {
              heading: "Top-tier veterinary care",
              subheading: "Modern equipment, experienced team, best care",
              ctaText: "Book an Appointment",
              ctaLink: "/portal/booking",
            },
            settings: { padding: "large", backgroundColor: "#e0f2fe" },
          },
          {
            blockType: "services",
            sortOrder: 1,
            content: {
              heading: "Comprehensive Services",
              layout: "grid",
              services: [
                { icon: "stethoscope", title: "Internal Medicine", description: "Diagnosis and treatment of internal diseases" },
                { icon: "bone", title: "Orthopedics", description: "Treatment of musculoskeletal disorders" },
                { icon: "tooth", title: "Dentistry", description: "Professional teeth cleaning and treatment" },
                { icon: "syringe", title: "Vaccination", description: "Prevention according to the latest protocols" },
                { icon: "microscope", title: "Laboratory", description: "In-house laboratory with fast results" },
                { icon: "ultrasound", title: "Ultrasound", description: "Modern imaging diagnostics" },
              ],
            },
            settings: { padding: "medium" },
          },
        ],
      },
    ],
  },

  // Template 4: Playful & Friendly
  "playful-friendly": {
    title: "Playful & Friendly Clinic",
    description: "Illustrated, colorful, pet-friendly",
    pages: [
      {
        title: "Home",
        slug: "",
        pageType: "home",
        isHome: true,
        showInNav: true,
        sortOrder: 0,
        blocks: [
          {
            blockType: "hero",
            sortOrder: 0,
            content: {
              heading: "Where pets feel at home",
              subheading: "Playful environment, professional care",
              ctaText: "Book an Appointment",
              ctaLink: "/portal/booking",
            },
            settings: { padding: "large", backgroundColor: "#fce7f3" },
          },
          {
            blockType: "team",
            sortOrder: 1,
            content: {
              heading: "Our Team",
              members: [
                { name: "Dr. Sarah Chen", role: "Veterinarian", bio: "Specializing in internal medicine and surgery" },
                { name: "Dr. Marcus Rivera", role: "Veterinarian", bio: "Specializing in orthopedics and dentistry" },
                { name: "Jamie Torres", role: "Veterinary Technician", bio: "Experienced technician focused on laboratory diagnostics" },
              ],
            },
            settings: { padding: "medium" },
          },
          {
            blockType: "gallery",
            sortOrder: 2,
            content: {
              heading: "Our Clinic",
              layout: "grid",
              images: [
                { url: null, alt: "Waiting Room", caption: "Comfortable waiting room" },
                { url: null, alt: "Exam Room", caption: "Modern exam room" },
                { url: null, alt: "Surgery Suite", caption: "State-of-the-art surgery suite" },
              ],
            },
            settings: { padding: "medium", backgroundColor: "#fdf2f8" },
          },
        ],
      },
    ],
  },

  // Template 5: Emergency First
  "emergency-first": {
    title: "Emergency Clinic",
    description: "Emergency and urgent contacts in the forefront",
    pages: [
      {
        title: "Home",
        slug: "",
        pageType: "home",
        isHome: true,
        showInNav: true,
        sortOrder: 0,
        blocks: [
          {
            blockType: "hero",
            sortOrder: 0,
            content: {
              heading: "Emergency veterinary service",
              subheading: "We're here for you 24/7 in case of emergency",
              ctaText: "Call Emergency",
              ctaLink: "tel:+421911123456",
              secondaryCtaText: "Book an Appointment",
              secondaryCtaLink: "/portal/booking",
            },
            settings: { padding: "large", backgroundColor: "#fee2e2" },
          },
          {
            blockType: "opening_hours",
            sortOrder: 1,
            content: {
              heading: "Opening Hours",
              source: "practice_settings",
              showEmergency: true,
              emergencyPhone: "+421 911 123 456",
            },
            settings: { padding: "medium" },
          },
          {
            blockType: "cta",
            sortOrder: 2,
            content: {
              heading: "In an emergency, don't hesitate to call",
              description: "Our emergency team is ready 24 hours a day, 7 days a week",
              buttonText: "Call +421 911 123 456",
              buttonLink: "tel:+421911123456",
              style: "primary",
            },
            settings: { padding: "large", backgroundColor: "#fef2f2" },
          },
        ],
      },
    ],
  },
};