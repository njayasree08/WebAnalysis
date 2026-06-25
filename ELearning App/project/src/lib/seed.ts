import { supabase } from './supabase';

export async function seedDemoData() {
  // Data is pre-seeded via SQL migration; this is a no-op guard
  const { data: existing } = await supabase.from('categories').select('id').limit(1);
  if (existing && existing.length > 0) return;

  // Seed categories
  const { data: categories } = await supabase.from('categories').insert([
    { name: 'Web Development', icon: 'Code', color: '#3B82F6' },
    { name: 'Data Science', icon: 'BarChart', color: '#8B5CF6' },
    { name: 'Mobile Development', icon: 'Smartphone', color: '#10B981' },
    { name: 'UI/UX Design', icon: 'Palette', color: '#F59E0B' },
    { name: 'Machine Learning', icon: 'Brain', color: '#EF4444' },
    { name: 'DevOps', icon: 'Server', color: '#6366F1' },
    { name: 'Cybersecurity', icon: 'Shield', color: '#14B8A6' },
    { name: 'Cloud Computing', icon: 'Cloud', color: '#F97316' },
  ]).select();

  if (!categories) return;

  const catMap = Object.fromEntries(categories.map(c => [c.name, c.id]));

  // Seed courses
  const { data: courses } = await supabase.from('courses').insert([
    {
      title: 'Complete React Development Bootcamp',
      description: 'Master React from fundamentals to advanced patterns. Build real-world applications with hooks, context, Redux, and TypeScript. Learn performance optimization, testing, and deployment strategies used by top companies.',
      category_id: catMap['Web Development'],
      difficulty: 'intermediate',
      price: 0,
      total_lessons: 8,
      total_duration_minutes: 240,
      rating: 4.8,
      students_count: 12500,
      thumbnail_url: 'https://images.pexels.com/photos/1181671/pexels-photo-1181671.jpeg?auto=compress&cs=tinysrgb&w=600',
    },
    {
      title: 'Python for Data Science & Machine Learning',
      description: 'Comprehensive Python data science course covering NumPy, Pandas, Matplotlib, Scikit-learn, and TensorFlow. Includes hands-on projects with real datasets and Kaggle competition strategies.',
      category_id: catMap['Data Science'],
      difficulty: 'beginner',
      price: 49.99,
      total_lessons: 10,
      total_duration_minutes: 320,
      rating: 4.9,
      students_count: 28000,
      thumbnail_url: 'https://images.pexels.com/photos/546819/pexels-photo-546819.jpeg?auto=compress&cs=tinysrgb&w=600',
    },
    {
      title: 'iOS & Swift Development Masterclass',
      description: 'Build professional iOS apps with Swift and SwiftUI. Covers UIKit, Core Data, networking, animations, and App Store publishing. Includes 5 complete app projects.',
      category_id: catMap['Mobile Development'],
      difficulty: 'intermediate',
      price: 79.99,
      total_lessons: 9,
      total_duration_minutes: 290,
      rating: 4.7,
      students_count: 8200,
      thumbnail_url: 'https://images.pexels.com/photos/1181244/pexels-photo-1181244.jpeg?auto=compress&cs=tinysrgb&w=600',
    },
    {
      title: 'UI/UX Design Fundamentals with Figma',
      description: 'Learn user interface and experience design from scratch using Figma. Master wireframing, prototyping, design systems, user research, and accessibility principles.',
      category_id: catMap['UI/UX Design'],
      difficulty: 'beginner',
      price: 0,
      total_lessons: 7,
      total_duration_minutes: 210,
      rating: 4.6,
      students_count: 15300,
      thumbnail_url: 'https://images.pexels.com/photos/4974914/pexels-photo-4974914.jpeg?auto=compress&cs=tinysrgb&w=600',
    },
    {
      title: 'Deep Learning with TensorFlow & Keras',
      description: 'Advanced deep learning course covering CNNs, RNNs, transformers, GANs, and reinforcement learning. Build production-ready ML models and deploy them to cloud platforms.',
      category_id: catMap['Machine Learning'],
      difficulty: 'advanced',
      price: 99.99,
      total_lessons: 12,
      total_duration_minutes: 380,
      rating: 4.9,
      students_count: 6800,
      thumbnail_url: 'https://images.pexels.com/photos/3861958/pexels-photo-3861958.jpeg?auto=compress&cs=tinysrgb&w=600',
    },
    {
      title: 'Docker & Kubernetes: Container Orchestration',
      description: 'Complete DevOps course on containerization. Learn Docker, Kubernetes, Helm charts, CI/CD pipelines, and cloud deployments on AWS, GCP, and Azure.',
      category_id: catMap['DevOps'],
      difficulty: 'advanced',
      price: 89.99,
      total_lessons: 11,
      total_duration_minutes: 350,
      rating: 4.8,
      students_count: 9400,
      thumbnail_url: 'https://images.pexels.com/photos/1181675/pexels-photo-1181675.jpeg?auto=compress&cs=tinysrgb&w=600',
    },
    {
      title: 'Node.js & Express API Development',
      description: 'Build scalable REST and GraphQL APIs with Node.js, Express, and MongoDB. Covers authentication, authorization, caching, testing, and production deployment.',
      category_id: catMap['Web Development'],
      difficulty: 'intermediate',
      price: 59.99,
      total_lessons: 9,
      total_duration_minutes: 270,
      rating: 4.7,
      students_count: 11200,
      thumbnail_url: 'https://images.pexels.com/photos/267350/pexels-photo-267350.jpeg?auto=compress&cs=tinysrgb&w=600',
    },
    {
      title: 'AWS Cloud Architect Professional',
      description: 'Prepare for AWS certifications while learning real-world cloud architecture. Covers EC2, S3, Lambda, RDS, VPC, IAM, and serverless patterns.',
      category_id: catMap['Cloud Computing'],
      difficulty: 'advanced',
      price: 129.99,
      total_lessons: 14,
      total_duration_minutes: 420,
      rating: 4.8,
      students_count: 7100,
      thumbnail_url: 'https://images.pexels.com/photos/4974912/pexels-photo-4974912.jpeg?auto=compress&cs=tinysrgb&w=600',
    },
    {
      title: 'Full Stack Web Development with Next.js',
      description: 'Build modern full-stack web apps with Next.js 14, TypeScript, Tailwind CSS, Prisma, and PostgreSQL. Covers SSR, SSG, API routes, authentication, and deployment.',
      category_id: catMap['Web Development'],
      difficulty: 'intermediate',
      price: 0,
      total_lessons: 10,
      total_duration_minutes: 300,
      rating: 4.9,
      students_count: 18700,
      thumbnail_url: 'https://images.pexels.com/photos/1181671/pexels-photo-1181671.jpeg?auto=compress&cs=tinysrgb&w=600',
    },
    {
      title: 'Cybersecurity Fundamentals & Ethical Hacking',
      description: 'Learn cybersecurity from the ground up. Covers network security, penetration testing, cryptography, OWASP Top 10, and security compliance frameworks.',
      category_id: catMap['Cybersecurity'],
      difficulty: 'beginner',
      price: 69.99,
      total_lessons: 10,
      total_duration_minutes: 330,
      rating: 4.7,
      students_count: 5600,
      thumbnail_url: 'https://images.pexels.com/photos/60504/security-protection-anti-virus-software-60504.jpeg?auto=compress&cs=tinysrgb&w=600',
    },
  ]).select();

  if (!courses) return;

  // Seed lessons for each course
  const lessonTemplates = [
    { title: 'Introduction & Setup', description: 'Welcome to the course. Install all required tools and set up your development environment.', duration_minutes: 20, is_preview: true },
    { title: 'Core Concepts Overview', description: 'Understand the fundamental concepts that power this technology.', duration_minutes: 30, is_preview: true },
    { title: 'Your First Project', description: 'Build your first hands-on project to solidify the basics.', duration_minutes: 45, is_preview: false },
    { title: 'Deep Dive: Advanced Features', description: 'Explore advanced features and patterns used in production.', duration_minutes: 35, is_preview: false },
    { title: 'State Management & Data Flow', description: 'Learn to manage application state effectively.', duration_minutes: 40, is_preview: false },
    { title: 'API Integration & Networking', description: 'Connect your application to external services and APIs.', duration_minutes: 35, is_preview: false },
    { title: 'Authentication & Security', description: 'Implement secure authentication and authorization.', duration_minutes: 30, is_preview: false },
    { title: 'Testing & Debugging', description: 'Write tests and debug your application professionally.', duration_minutes: 30, is_preview: false },
    { title: 'Performance Optimization', description: 'Optimize your app for speed and scalability.', duration_minutes: 25, is_preview: false },
    { title: 'Deployment & Production', description: 'Deploy your application and set up CI/CD pipelines.', duration_minutes: 25, is_preview: false },
    { title: 'Real World Project', description: 'Build a complete, production-ready project from scratch.', duration_minutes: 60, is_preview: false },
    { title: 'Best Practices & Next Steps', description: 'Learn industry best practices and plan your continued learning.', duration_minutes: 20, is_preview: false },
  ];

  // Demo YouTube video IDs (real public educational videos)
  const demoVideoIds = [
    'dGcsHMXbSOA', 'N3AkSS5hXMA', 'SqcY0GlETPk', 'w7ejDZ8SWv8',
    'f55qgjxdzp4', 'lauywdXKEXI', 'DLX62G4lc44', 'rfscVS0vtbw',
    'zJSY8tbf_ys', 'Oe421EPjeBE', 'pTFZFxd5uri', 'hW4P6s7O8Fs',
  ];

  const lessonsToInsert = courses.flatMap(course => {
    const count = course.total_lessons;
    return lessonTemplates.slice(0, count).map((template, idx) => ({
      course_id: course.id,
      title: template.title,
      description: template.description,
      video_url: `https://www.youtube.com/watch?v=${demoVideoIds[idx % demoVideoIds.length]}`,
      duration_minutes: template.duration_minutes,
      order_index: idx,
      is_preview: template.is_preview,
    }));
  });

  await supabase.from('lessons').insert(lessonsToInsert);
}
