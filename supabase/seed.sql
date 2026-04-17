-- ============================================================
-- Student Tutor Platform MVP â€” Demo Seed Data
-- Run AFTER schema.sql
-- Run AFTER creating the 3 demo auth accounts manually
-- ============================================================
-- 
-- STEP 1: Create these 3 accounts in Supabase Dashboard â†’ Authentication â†’ Users:
--   Email: demo-student@studenttutorplatform.app  |  Password: demo123456
--   Email: demo-tutor@studenttutorplatform.app    |  Password: demo123456
--   Email: demo-both@studenttutorplatform.app     |  Password: demo123456
--
-- STEP 2: After creating them, copy their UUIDs and paste below:
-- (Replace the placeholder UUIDs below with the real ones)
-- ============================================================

-- !! REPLACE THESE WITH REAL UUIDs FROM SUPABASE AUTH !!
-- These are placeholders â€” the seed won't work until you replace them.
do $$
declare
  demo_student_id uuid := '00000000-0000-0000-0000-000000000001'; -- REPLACE
  demo_tutor_id   uuid := '00000000-0000-0000-0000-000000000002'; -- REPLACE
  demo_both_id    uuid := '00000000-0000-0000-0000-000000000003'; -- REPLACE
  
  -- Course IDs (generated)
  course_calc    uuid := gen_random_uuid();
  course_chem    uuid := gen_random_uuid();
  course_eng     uuid := gen_random_uuid();
  course_physics uuid := gen_random_uuid();
  course_cs      uuid := gen_random_uuid();
  course_bio     uuid := gen_random_uuid();
begin

-- â”€â”€ UPDATE DEMO PROFILES â”€â”€
update public.profiles set
  full_name = 'Alex Thompson',
  role = 'student',
  avatar_url = 'https://i.pravatar.cc/150?img=11',
  bio = 'Computer Science student at Stanford. Love math and algorithms.',
  is_demo = true
where id = demo_student_id;

update public.profiles set
  full_name = 'Dr. Sarah Mitchell',
  role = 'tutor',
  avatar_url = 'https://i.pravatar.cc/150?img=47',
  bio = 'PhD in Mathematics from MIT. 8 years of tutoring experience. Specialised in Calculus, Linear Algebra, and Statistics.',
  is_demo = true
where id = demo_tutor_id;

update public.profiles set
  full_name = 'Jordan Rivera',
  role = 'both',
  avatar_url = 'https://i.pravatar.cc/150?img=52',
  bio = 'Masters student in Physics. I tutor undergrads in Mechanics and Thermodynamics while studying Quantum Computing.',
  is_demo = true
where id = demo_both_id;

-- â”€â”€ INSERT COURSES â”€â”€
insert into public.courses (id, title, description, category, level, instructor_id, price, is_published, image_url) values
  (course_calc,    'Calculus I: Limits & Derivatives',       'Master the foundations of single-variable calculus. Covers limits, continuity, derivatives, and applications.', 'Mathematics', 'Beginner',     demo_tutor_id, 0,     true, 'https://images.unsplash.com/photo-1635070041078-e363dbe005cb?w=600'),
  (course_chem,    'General Chemistry',                     'Comprehensive introduction to chemistry. Atomic structure, bonding, stoichiometry, thermodynamics, and equilibrium.', 'Science',     'Beginner',     demo_tutor_id, 0,     true, 'https://images.unsplash.com/photo-1532187863486-abf9dbad1b69?w=600'),
  (course_eng,     'Academic Writing & Essay Structure',    'Learn to write compelling essays, research papers, and literature reviews with proper citations and argumentation.', 'English',    'Intermediate', demo_tutor_id, 29.99, true, 'https://images.unsplash.com/photo-1455390582262-044cdead277a?w=600'),
  (course_physics, 'Classical Mechanics',                    'Newton''s laws, energy, momentum, rotational dynamics, and oscillations. Problem-solving focused.', 'Science',     'Intermediate', demo_both_id,  19.99, true, 'https://images.unsplash.com/photo-1636466497217-26a8cbeaf0aa?w=600'),
  (course_cs,      'Intro to Python Programming',            'Learn Python from scratch. Variables, loops, functions, OOP, file I/O, and basic data structures.', 'Computer Science', 'Beginner', demo_both_id, 0, true, 'https://images.unsplash.com/photo-1526379095098-d400fd0bf935?w=600'),
  (course_bio,     'Cell Biology & Genetics',                'Explore cell structure, DNA replication, gene expression, heredity, and modern genetic engineering.', 'Science', 'Advanced', demo_tutor_id, 39.99, true, 'https://images.unsplash.com/photo-1530026405186-ed1f139313f8?w=600');

-- â”€â”€ INSERT MODULES â”€â”€
insert into public.modules (course_id, title, content, "order") values
  (course_calc, 'Introduction to Limits', 'Understanding the concept of a limit and how to evaluate them.', 1),
  (course_calc, 'Derivatives and Rates of Change', 'The derivative as a rate of change. Power rule, product rule, chain rule.', 2),
  (course_calc, 'Applications of Derivatives', 'Optimization, related rates, and curve sketching.', 3),
  (course_chem, 'Atomic Structure', 'Electron configurations, periodic trends, and quantum numbers.', 1),
  (course_chem, 'Chemical Bonding', 'Ionic, covalent, and metallic bonding. Lewis structures and VSEPR theory.', 2),
  (course_eng, 'Essay Fundamentals', 'Thesis statements, paragraph structure, and logical flow.', 1),
  (course_eng, 'Research & Citations', 'Finding sources, APA/MLA formatting, and avoiding plagiarism.', 2),
  (course_physics, 'Kinematics', 'Motion in 1D and 2D. Displacement, velocity, acceleration.', 1),
  (course_physics, 'Newtons Laws', 'Force, mass, acceleration. Free-body diagrams and friction.', 2),
  (course_cs, 'Python Basics', 'Variables, data types, operators, and your first program.', 1),
  (course_cs, 'Control Flow', 'If/else statements, for loops, while loops, and list comprehensions.', 2),
  (course_cs, 'Functions & OOP', 'Defining functions, classes, inheritance, and polymorphism.', 3);

-- â”€â”€ INSERT ENROLLMENTS â”€â”€
insert into public.enrollments (student_id, course_id, progress) values
  (demo_student_id, course_calc,    72),
  (demo_student_id, course_chem,    45),
  (demo_student_id, course_cs,      88),
  (demo_student_id, course_physics, 30),
  (demo_both_id,    course_calc,    60),
  (demo_both_id,    course_eng,     15);

-- â”€â”€ INSERT LIVE CLASSES â”€â”€
insert into public.live_classes (title, description, course_id, instructor_id, meeting_link, scheduled_for, duration_minutes, status) values
  ('Calculus: Limits Review',          'Review session covering all limit evaluation techniques before the midterm.',   course_calc, demo_tutor_id, 'https://zoom.us/j/demo123',           now() + interval '2 days',  60, 'scheduled'),
  ('Chemistry Lab Prep',              'Preparing for the titration lab. Bring your safety goggles!',                   course_chem, demo_tutor_id, 'https://teams.microsoft.com/demo456', now() + interval '3 days',  90, 'scheduled'),
  ('Python: OOP Workshop',            'Hands-on session building a real project using classes and inheritance.',        course_cs,   demo_both_id,  'https://meet.google.com/demo789',     now() + interval '1 day',   120, 'scheduled'),
  ('Physics Problem Solving Session', 'Work through past exam problems on kinematics and Newton''s laws.',             course_physics, demo_both_id, 'https://zoom.us/j/demo101',        now() + interval '5 days',  60, 'scheduled'),
  ('Essay Writing Masterclass',       'Live walkthrough of writing a research paper from outline to final draft.',     course_eng,  demo_tutor_id, 'https://zoom.us/j/demo202',           now() - interval '1 day',   90, 'completed');

-- â”€â”€ INSERT ASSESSMENTS â”€â”€
insert into public.assessments (course_id, title, type, questions, time_limit_minutes) values
  (course_calc, 'Limits Quiz', 'quiz', '[
    {"question": "What is the limit of (xÂ²-1)/(x-1) as x approaches 1?", "options": ["0", "1", "2", "undefined"], "correct": 2},
    {"question": "A function is continuous at x=a if...", "options": ["f(a) exists", "lim f(x) exists", "lim f(x) = f(a)", "All of the above"], "correct": 3},
    {"question": "What is lim(sin x / x) as x approaches 0?", "options": ["0", "1", "infinity", "does not exist"], "correct": 1}
  ]'::jsonb, 15),
  (course_chem, 'Atomic Structure Quiz', 'quiz', '[
    {"question": "How many electrons can the 3rd energy level hold?", "options": ["2", "8", "18", "32"], "correct": 2},
    {"question": "What is the electron configuration of Carbon?", "options": ["1sÂ² 2sÂ² 2pÂ²", "1sÂ² 2sÂ² 2pâ´", "1sÂ² 2sÂ¹ 2pÂ³", "1sÂ² 2pâ´"], "correct": 0}
  ]'::jsonb, 10),
  (course_cs, 'Python Basics Exam', 'exam', '[
    {"question": "What is the output of print(type(3.14))?", "options": ["int", "float", "str", "number"], "correct": 1},
    {"question": "Which keyword defines a function in Python?", "options": ["function", "func", "def", "define"], "correct": 2},
    {"question": "What does len([1,2,3]) return?", "options": ["1", "2", "3", "4"], "correct": 2}
  ]'::jsonb, 30);

end $$;


