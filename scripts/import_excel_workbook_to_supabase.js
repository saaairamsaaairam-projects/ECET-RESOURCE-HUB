const fs = require('fs');
const path = require('path');
const XLSX = require('xlsx');
const { createClient } = require('@supabase/supabase-js');

function readEnv(filePath) {
  if (!fs.existsSync(filePath)) {
    return {};
  }

  return Object.fromEntries(
    fs.readFileSync(filePath, 'utf8')
      .split(/\r?\n/)
      .filter((line) => line && !line.startsWith('#'))
      .map((line) => {
        const index = line.indexOf('=');
        return [line.slice(0, index), line.slice(index + 1)];
      })
  );
}

function slugify(value) {
  return String(value || '')
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');
}

function pickRowValue(row, candidates) {
  for (const candidate of candidates) {
    const value = row[candidate];
    if (value !== undefined && value !== null && String(value).trim() !== '') {
      return value;
    }
  }

  return undefined;
}

function normalizeArray(value) {
  if (Array.isArray(value)) return value.filter(Boolean);
  if (typeof value === 'string') {
    return value
      .split(/,|\|/)
      .map((item) => item.trim())
      .filter(Boolean);
  }
  return [];
}

function normalizePlacements(row) {
  const recruiters = normalizeArray(pickRowValue(row, ['recruiters', 'placement_recruiters', 'top_recruiters', 'companies']));

  return {
    averagePackage: String(pickRowValue(row, ['average_package', 'avg_package', 'averagePackage']) || '₹0 LPA'),
    highestPackage: String(pickRowValue(row, ['highest_package', 'max_package', 'highestPackage']) || '₹0 LPA'),
    recruiters,
  };
}

function normalizeFees(row) {
  return {
    tuition: String(pickRowValue(row, ['tuition_fee', 'tuition', 'fee_tuition']) || '₹0 / year'),
    hostel: String(pickRowValue(row, ['hostel_fee', 'hostel', 'fee_hostel']) || '₹0 / year'),
    transport: String(pickRowValue(row, ['transport_fee', 'transport', 'fee_transport']) || '₹0 / year'),
    other: String(pickRowValue(row, ['other_fee', 'other_fee_note', 'fee_other']) || ''),
  };
}

function normalizeStudentInsights(row) {
  return {
    codingCulture: String(pickRowValue(row, ['coding_culture', 'codingCulture']) || ''),
    attendance: String(pickRowValue(row, ['attendance', 'attendance_policy']) || ''),
    placementReality: String(pickRowValue(row, ['placement_reality', 'placement_summary']) || ''),
    hostelReview: String(pickRowValue(row, ['hostel_review', 'hostel_summary']) || ''),
    campusLife: String(pickRowValue(row, ['campus_life', 'campus_summary']) || ''),
    studentLife: String(pickRowValue(row, ['student_life', 'student_summary']) || ''),
  };
}

function pickName(row) {
  return pickRowValue(row, ['name', 'college_name', 'institution_name', 'college', 'institution']);
}

function pickLocation(row) {
  return pickRowValue(row, ['location', 'city', 'campus_location']);
}

function pickDistrict(row) {
  return pickRowValue(row, ['district', 'district_name']);
}

function pickUniversity(row) {
  return pickRowValue(row, ['university', 'affiliation', 'university_name']);
}

function pickWebsite(row) {
  return pickRowValue(row, ['website', 'official_website', 'url']);
}

function pickDescription(row) {
  return pickRowValue(row, ['description', 'about', 'overview']);
}

function pickNaacGrade(row) {
  return pickRowValue(row, ['naac_grade', 'naac', 'naacGrade']) || 'A';
}

function pickFacilities(row) {
  return normalizeArray(pickRowValue(row, ['facilities', 'amenities', 'campus_facilities']));
}

function pickBranches(row) {
  return normalizeArray(pickRowValue(row, ['branches', 'departments', 'available_branches', 'courses']));
}

function pickAutonomous(row) {
  const value = pickRowValue(row, ['autonomous', 'is_autonomous']);
  if (typeof value === 'boolean') return value;
  return String(value || '').toLowerCase() === 'true' || String(value || '').toLowerCase() === 'yes';
}

function pickVerificationStatus(row) {
  return String(pickRowValue(row, ['verification_status']) || 'verified');
}

function pickSourceUrl(row) {
  return String(pickRowValue(row, ['source_url']) || '');
}

function findWorkbookPath() {
  const candidates = [
    path.join(process.cwd(), 'PolyHub_College_Database_Top50.xlsx'),
    path.join(process.cwd(), 'data', 'PolyHub_College_Database_Top50.xlsx'),
    path.join(process.cwd(), 'uploads', 'PolyHub_College_Database_Top50.xlsx'),
  ];

  return candidates.find((candidate) => fs.existsSync(candidate));
}

function stripUnsupportedFields(payload) {
  const supportedKeys = [
    'slug',
    'name',
    'location',
    'district',
    'university',
    'naac_grade',
    'website',
    'description',
    'cover_image_url',
    'placements',
    'fees',
    'student_insights',
    'branches',
    'autonomous',
    'status',
    'updated_at',
  ];

  return Object.fromEntries(Object.entries(payload).filter(([key]) => supportedKeys.includes(key)));
}

async function main() {
  const env = readEnv(path.join(process.cwd(), '.env.local'));
  const supabaseUrl = env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey = env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !supabaseKey) {
    throw new Error('Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in .env.local');
  }

  const workbookPath = findWorkbookPath();
  if (!workbookPath) {
    throw new Error('Workbook not found. Save PolyHub_College_Database_Top50.xlsx into the project root, data/, or uploads/ folder before running this import.');
  }

  const workbook = XLSX.readFile(workbookPath);
  const supabase = createClient(supabaseUrl, supabaseKey, { auth: { persistSession: false } });

  let totalImported = 0;
  let totalRows = 0;

  for (const sheetName of workbook.SheetNames) {
    const sheet = workbook.Sheets[sheetName];
    const rows = XLSX.utils.sheet_to_json(sheet, { defval: '' });

    if (!Array.isArray(rows) || rows.length === 0) {
      continue;
    }

    for (const row of rows) {
      totalRows += 1;

      const name = pickName(row);
      if (!name) {
        continue;
      }

      const slug = slugify(String(name));
      const payload = {
        slug,
        name: String(name),
        location: String(pickLocation(row) || ''),
        district: String(pickDistrict(row) || ''),
        university: String(pickUniversity(row) || ''),
        naac_grade: String(pickNaacGrade(row)),
        website: pickWebsite(row) ? String(pickWebsite(row)) : null,
        description: pickDescription(row) ? String(pickDescription(row)) : null,
        cover_image_url: null,
        gallery_images: [],
        placements: normalizePlacements(row),
        fees: normalizeFees(row),
        student_insights: normalizeStudentInsights(row),
        facilities: pickFacilities(row),
        branches: pickBranches(row),
        autonomous: pickAutonomous(row),
        verification_status: pickVerificationStatus(row),
        source_url: pickSourceUrl(row) || null,
        status: 'published',
        updated_at: new Date().toISOString(),
      };

      const tryUpsert = async (record) => supabase
        .from('colleges')
        .upsert(record, { onConflict: 'slug' });

      let { data, error } = await tryUpsert(payload);

      if (error && /gallery_images|facilities|verification_status|source_url/i.test(error.message || '')) {
        const fallbackPayload = stripUnsupportedFields(payload);
        const fallback = await tryUpsert(fallbackPayload);
        data = fallback.data;
        error = fallback.error;
      }

      if (error) {
        console.error('Import failed for', slug, error.message);
        process.exitCode = 1;
        continue;
      }

      totalImported += 1;
      console.log(`[${sheetName}] imported ${name} (${slug})`);
    }
  }

  console.log(`Finished. Imported ${totalImported} college rows from ${totalRows} workbook rows across ${workbook.SheetNames.length} sheet(s).`);
}

main().catch((error) => {
  console.error('IMPORT ERROR:', error.message || error);
  process.exit(1);
});
