const fs = require('fs');
const path = require('path');
const { createClient } = require('@supabase/supabase-js');

const envPath = path.join(process.cwd(), '.env.local');
const env = Object.fromEntries(
  fs.readFileSync(envPath, 'utf8')
    .split('\n')
    .filter(Boolean)
    .map((line) => line.split('=').map((part) => part.trim()))
);

const supabaseUrl = env.NEXT_PUBLIC_SUPABASE_URL;
const serviceRoleKey = env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !serviceRoleKey) {
  throw new Error('Missing SUPABASE env vars in .env.local');
}

const supabase = createClient(supabaseUrl, serviceRoleKey, {
  auth: { persistSession: false },
});

const colleges = JSON.parse(fs.readFileSync(path.join(process.cwd(), 'data', 'colleges.json'), 'utf8'));

async function main() {
  let imported = 0;

  for (const college of colleges) {
    const payload = {
      slug: college.slug,
      name: college.name,
      location: college.location,
      district: college.district,
      university: college.university,
      naac_grade: college.naacGrade || 'A',
      website: college.website || null,
      description: college.description || null,
      cover_image_url: college.images?.cover || null,
      gallery_images: Array.isArray(college.images?.gallery) ? college.images.gallery : [],
      placements: college.placements || { averagePackage: '₹0 LPA', highestPackage: '₹0 LPA', recruiters: [] },
      fees: college.fees || { tuition: '₹0 / year', hostel: '₹0 / year', transport: '₹0 / year', other: '' },
      student_insights: college.studentInsights || {
        codingCulture: '',
        attendance: '',
        placementReality: '',
        hostelReview: '',
        campusLife: '',
        studentLife: '',
      },
      facilities: Array.isArray(college.facilities) ? college.facilities : [],
      branches: Array.isArray(college.branches) ? college.branches : [],
      autonomous: Boolean(college.autonomous),
      status: 'published',
      updated_at: new Date().toISOString(),
    };

    const { error } = await supabase
      .from('colleges')
      .upsert(payload, { onConflict: 'slug' });

    if (error) {
      console.error('Failed to import', college.slug, error.message);
      process.exitCode = 1;
      continue;
    }

    imported += 1;
    console.log('Imported', college.slug);
  }

  console.log(`Done. Imported ${imported} college records into Supabase.`);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
