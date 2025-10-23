import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Read mock data files
const clientsData = JSON.parse(
  fs.readFileSync(path.join(__dirname, '../src/lib/mock-data/clients.json'), 'utf-8')
);
const jobsData = JSON.parse(
  fs.readFileSync(path.join(__dirname, '../src/lib/mock-data/jobs.json'), 'utf-8')
);
const candidatesData = JSON.parse(
  fs.readFileSync(path.join(__dirname, '../src/lib/mock-data/candidates.json'), 'utf-8')
);
const applicationsData = JSON.parse(
  fs.readFileSync(path.join(__dirname, '../src/lib/mock-data/applications.json'), 'utf-8')
);
const categoriesData = JSON.parse(
  fs.readFileSync(path.join(__dirname, '../src/lib/mock-data/categories.json'), 'utf-8')
);
const tagsData = JSON.parse(
  fs.readFileSync(path.join(__dirname, '../src/lib/mock-data/tags.json'), 'utf-8')
);

// Create database structure
const db = {
  clients: clientsData,
  jobs: jobsData,
  candidates: candidatesData,
  applications: applicationsData,
  categories: categoriesData,
  tags: tagsData,
  emails: [], // Empty for now, will be populated later
  teams: [], // Empty for now
  users: [], // Empty for now
};

// Write to db.json
fs.writeFileSync(
  path.join(__dirname, '../db.json'),
  JSON.stringify(db, null, 2),
  'utf-8'
);

console.log('✅ Database seeded successfully!');
console.log(`📊 Stats:`);
console.log(`   - Clients: ${db.clients.length}`);
console.log(`   - Jobs: ${db.jobs.length}`);
console.log(`   - Candidates: ${db.candidates.length}`);
console.log(`   - Applications: ${db.applications.length}`);
console.log(`   - Categories: ${db.categories.length}`);
console.log(`   - Tags: ${db.tags.length}`);
