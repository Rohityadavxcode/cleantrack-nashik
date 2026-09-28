import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding CleanTrack Nashik master data...');

  // 1. Clean existing records in sequence
  await prisma.notification.deleteMany();
  await prisma.reminder.deleteMany();
  await prisma.citizenFeedback.deleteMany();
  await prisma.complaintPhoto.deleteMany();
  await prisma.complaintStatusHistory.deleteMany();
  await prisma.complaintLocation.deleteMany();
  await prisma.complaint.deleteMany();
  await prisma.complaintSubcategory.deleteMany();
  await prisma.complaintCategory.deleteMany();
  await prisma.user.deleteMany();
  await prisma.department.deleteMany();
  await prisma.areaZone.deleteMany();
  await prisma.adminActionLog.deleteMany();

  // 2. Seed Nashik Administrative Zones
  const zones = [
    {
      code: 'PANCHAVATI',
      name: 'Panchavati Zone',
      nameMarathi: 'पंचवटी विभाग',
      wardCount: 6,
      centerLatitude: 20.0125,
      centerLongitude: 73.7995,
      officeAddress: 'Panchavati Divisional Office, Makhmalabad Naka, Nashik',
      emergencyContact: '0253-2512010',
    },
    {
      code: 'NASHIK_WEST',
      name: 'Nashik West Zone',
      nameMarathi: 'नाशिक पश्चिम विभाग',
      wardCount: 5,
      centerLatitude: 19.9995,
      centerLongitude: 73.7655,
      officeAddress: 'West Divisional Office, Rajiv Gandhi Bhavan, Gangapur Road, Nashik',
      emergencyContact: '0253-2575631',
    },
    {
      code: 'NASHIK_EAST',
      name: 'Nashik East Zone',
      nameMarathi: 'नाशिक पूर्व विभाग',
      wardCount: 6,
      centerLatitude: 19.9882,
      centerLongitude: 73.7998,
      officeAddress: 'East Divisional Office, Dwarka Circle, Nashik',
      emergencyContact: '0253-2591244',
    },
    {
      code: 'CIDCO',
      name: 'CIDCO / New Nashik Zone',
      nameMarathi: 'सिडको / नवीन नाशिक विभाग',
      wardCount: 7,
      centerLatitude: 19.965,
      centerLongitude: 73.755,
      officeAddress: 'New Nashik Divisional Office, Untwadi Road, CIDCO, Nashik',
      emergencyContact: '0253-2391055',
    },
    {
      code: 'SATPUR',
      name: 'Satpur Zone',
      nameMarathi: 'सातपूर विभाग',
      wardCount: 5,
      centerLatitude: 19.982,
      centerLongitude: 73.725,
      officeAddress: 'Satpur Divisional Office, MIDC Main Road, Satpur, Nashik',
      emergencyContact: '0253-2351280',
    },
    {
      code: 'NASHIK_ROAD',
      name: 'Nashik Road Zone',
      nameMarathi: 'नाशिक रोड विभाग',
      wardCount: 6,
      centerLatitude: 19.9555,
      centerLongitude: 73.8385,
      officeAddress: 'Nashik Road Divisional Office, Near Railway Station, Nashik Road',
      emergencyContact: '0253-2461022',
    },
  ];

  for (const z of zones) {
    await prisma.areaZone.create({ data: z });
  }
  console.log('✅ Zones created');

  // 3. Seed Departments
  const deptSanitation = await prisma.department.create({
    data: {
      name: 'Solid Waste Management & Sanitation',
      nameMarathi: 'घनकचरा व्यवस्थापन व स्वच्छता विभाग',
      code: 'SANITATION',
      contactEmail: 'sanitation@nashik.gov.in',
      contactPhone: '0253-2575631',
    },
  });

  const deptRoads = await prisma.department.create({
    data: {
      name: 'Public Works & Roads Department',
      nameMarathi: 'सार्वजनिक बांधकाम व रस्ते विभाग',
      code: 'ROADS',
      contactEmail: 'pwd@nashik.gov.in',
      contactPhone: '0253-2575632',
    },
  });

  const deptWater = await prisma.department.create({
    data: {
      name: 'Water Supply Department',
      nameMarathi: 'पाणीपुरवठा विभाग',
      code: 'WATER',
      contactEmail: 'watersupply@nashik.gov.in',
      contactPhone: '0253-2575633',
    },
  });

  const deptDrainage = await prisma.department.create({
    data: {
      name: 'Sewerage & Drainage Department',
      nameMarathi: 'मलनिस्सारण व ड्रेनेज विभाग',
      code: 'DRAINAGE',
      contactEmail: 'drainage@nashik.gov.in',
      contactPhone: '0253-2575634',
    },
  });

  const deptElectrical = await prisma.department.create({
    data: {
      name: 'Electrical & Street Lighting',
      nameMarathi: 'विद्युत व पथदिवे विभाग',
      code: 'ELECTRICAL',
      contactEmail: 'electrical@nashik.gov.in',
      contactPhone: '0253-2575635',
    },
  });

  const deptHealth = await prisma.department.create({
    data: {
      name: 'Public Health & Vector Control',
      nameMarathi: 'सार्वजनिक आरोग्य व कीटक नियंत्रण विभाग',
      code: 'HEALTH',
      contactEmail: 'health@nashik.gov.in',
      contactPhone: '0253-2575636',
    },
  });

  const deptGardens = await prisma.department.create({
    data: {
      name: 'Gardens & Tree Authority',
      nameMarathi: 'उद्यान व वृक्ष प्राधिकरण विभाग',
      code: 'GARDENS',
      contactEmail: 'trees@nashik.gov.in',
      contactPhone: '0253-2575637',
    },
  });

  console.log('✅ Departments created');

  // 4. Seed Categories and Subcategories
  const categoriesData = [
    {
      code: 'GARBAGE',
      name: 'Garbage & Waste Accumulation',
      nameMarathi: 'कचरा व घनकचरा समस्या',
      icon: 'Trash2',
      defaultDepartmentId: deptSanitation.id,
      defaultSlaHours: 24,
      subcategories: [
        { name: 'Garbage not collected from doorstep/bin', nameMarathi: 'घरोघरी/कुंडीतून कचरा उचलला नाही' },
        { name: 'Garbage dumped on open road/plot', nameMarathi: 'रस्त्यावर किंवा मोकळ्या जागेत कचरा टाकला' },
        { name: 'Overflowing community garbage bin', nameMarathi: 'कचराकुंडी ओसंडून वाहत आहे' },
        { name: 'Construction & demolition waste debris', nameMarathi: 'बांधकाम राडारोडा / डेब्रिज' },
      ],
    },
    {
      code: 'ROADS',
      name: 'Road Damage & Potholes',
      nameMarathi: 'रस्ता व खड्डे',
      icon: 'Truck',
      defaultDepartmentId: deptRoads.id,
      defaultSlaHours: 48,
      subcategories: [
        { name: 'Dangerous pothole on main road', nameMarathi: 'मुख्य रस्त्यावरील धोकादायक खड्डा' },
        { name: 'Uneven / cracked road surface', nameMarathi: 'रस्त्याचा पृष्ठभाग खराब झाला आहे' },
        { name: 'Missing or broken speed breaker', nameMarathi: 'स्पीड ब्रेकर तुटलेला / नसलेला' },
      ],
    },
    {
      code: 'DRAINAGE',
      name: 'Open Drainage & Clogging',
      nameMarathi: 'ड्रेनेज व उघडे गटार',
      icon: 'Droplets',
      defaultDepartmentId: deptDrainage.id,
      defaultSlaHours: 24,
      subcategories: [
        { name: 'Open / missing manhole cover (Hazard)', nameMarathi: 'उघडे किंवा तुटलेले मॅनहोल झाकण (धोकादायक)' },
        { name: 'Blocked drainage causing backflow', nameMarathi: 'गटार तुंबून दुर्गंधी व घाण पाणी' },
      ],
    },
    {
      code: 'WATER_LEAKAGE',
      name: 'Water Supply Leakage',
      nameMarathi: 'पाणीपुरवठा गळती',
      icon: 'Waves',
      defaultDepartmentId: deptWater.id,
      defaultSlaHours: 12,
      subcategories: [
        { name: 'Drinking water pipeline burst / major leak', nameMarathi: 'पिण्याच्या पाण्याची मुख्य पाईपलाईन फुटली' },
        { name: 'Roadside municipal valve leakage', nameMarathi: 'रस्त्यावरील व्हॉल्व्हमधून पाण्याची नासाडी' },
      ],
    },
    {
      code: 'STREETLIGHT',
      name: 'Streetlight Not Working',
      nameMarathi: 'पथदिवे (स्ट्रीटलाईट) बंद',
      icon: 'Lightbulb',
      defaultDepartmentId: deptElectrical.id,
      defaultSlaHours: 24,
      subcategories: [
        { name: 'Streetlight pole not turning on at night', nameMarathi: 'रात्रीच्या वेळी पथदिवा बंद असणे' },
        { name: 'Exposed live wiring near pole base', nameMarathi: 'खांबाजवळील उघड्या विजेच्या तारा (धोका)' },
      ],
    },
    {
      code: 'PUBLIC_TOILET',
      name: 'Public Toilet Problem',
      nameMarathi: 'सार्वजनिक शौचालय समस्या',
      icon: 'Bath',
      defaultDepartmentId: deptSanitation.id,
      defaultSlaHours: 24,
      subcategories: [
        { name: 'Extremely unhygienic / not cleaned', nameMarathi: 'अस्वच्छता व घाणीचे साम्राज्य' },
        { name: 'No water supply in community toilet', nameMarathi: 'शौचालयात पाणी उपलब्ध नाही' },
      ],
    },
    {
      code: 'STRAY_ANIMALS',
      name: 'Stray Animal / Dead Animal',
      nameMarathi: 'भटके / मृत प्राणी समस्या',
      icon: 'PawPrint',
      defaultDepartmentId: deptHealth.id,
      defaultSlaHours: 12,
      subcategories: [
        { name: 'Urgent dead animal removal on public road', nameMarathi: 'रस्त्यावरील मृत प्राण्याची विल्हेवाट (तातडीने)' },
        { name: 'Aggressive stray dogs pack', nameMarathi: 'आक्रमक भटके कुत्रे' },
      ],
    },
    {
      code: 'TREE_FALLEN',
      name: 'Tree / Hazardous Branch',
      nameMarathi: 'झाड पडणे / धोकादायक फांदी',
      icon: 'Trees',
      defaultDepartmentId: deptGardens.id,
      defaultSlaHours: 12,
      subcategories: [
        { name: 'Fallen tree blocking public road/traffic', nameMarathi: 'झाड पडून रस्ता / वाहतूक बंद झाली आहे' },
      ],
    },
  ];

  const categoryMap = {};
  for (const cat of categoriesData) {
    const createdCat = await prisma.complaintCategory.create({
      data: {
        code: cat.code,
        name: cat.name,
        nameMarathi: cat.nameMarathi,
        icon: cat.icon,
        defaultDepartmentId: cat.defaultDepartmentId,
        defaultSlaHours: cat.defaultSlaHours,
        subcategories: {
          create: cat.subcategories,
        },
      },
    });
    categoryMap[cat.code] = createdCat;
  }
  console.log('✅ Categories and subcategories created');

  // 5. Seed Users (Admin, Officer, Citizen)
  const adminUser = await prisma.user.create({
    data: {
      name: 'Suhas Kulkarni (Administrator)',
      mobile: '9822001122',
      email: 'admin@cleantrack.nashik.in',
      role: 'SUPER_ADMIN',
      preferredLanguage: 'en',
    },
  });

  const officerPanchavati = await prisma.user.create({
    data: {
      name: 'Sunil Jadhav (Divisional Officer)',
      mobile: '9822113344',
      email: 'officer.panchavati@cleantrack.nashik.in',
      role: 'OFFICER',
      departmentId: deptSanitation.id,
      preferredLanguage: 'mr',
    },
  });

  const citizenRamesh = await prisma.user.create({
    data: {
      name: 'Ramesh Patil',
      mobile: '9876543210',
      email: 'ramesh.patil@example.com',
      role: 'CITIZEN',
      preferredLanguage: 'mr',
    },
  });

  console.log('✅ Demo Users created');

  // 6. Seed Realistic Complaints across Nashik
  const sampleComplaints = [
    {
      referenceId: 'CTN-2026-000101',
      title: 'Heavy garbage accumulation near Ramkund Ghat steps',
      description: 'Pilgrims and local vendors have discarded plastic bottles and organic flower waste near Ramkund steps. The bins are overflowing and causing severe foul odor.',
      categoryCode: 'GARBAGE',
      urgency: 'HIGH',
      duration: '3 days',
      isBlockingTraffic: false,
      isHealthHazard: true,
      citizenName: 'Ramesh Patil',
      citizenMobile: '9876543210',
      citizenEmail: 'ramesh.patil@example.com',
      status: 'RESOLVED',
      departmentId: deptSanitation.id,
      assignedOfficerName: 'Sunil Jadhav (Sanitation Inspector)',
      slaDueAt: new Date(Date.now() - 48 * 3600 * 1000),
      isOverdue: false,
      resolutionSummary: 'Sanitation team arrived with mini-compactor vehicle at 07:00 AM. 400kg waste removed, bleaching powder sprinkled, and two new 240L bins installed.',
      resolutionPhoto: 'https://images.unsplash.com/photo-1530587191325-3db32d826c18?auto=format&fit=crop&w=800&q=80',
      resolvedAt: new Date(Date.now() - 12 * 3600 * 1000),
      createdAt: new Date(Date.now() - 72 * 3600 * 1000),
      location: {
        latitude: 20.0068,
        longitude: 73.7925,
        address: 'Near Ramkund Ghat, Panchavati, Nashik, Maharashtra 422003',
        landmark: 'Near Sita Gufa road entrance',
        zoneName: 'Panchavati Zone',
        wardNumber: 'Ward 4',
        locality: 'Panchavati',
      },
      photos: [
        'https://images.unsplash.com/photo-1605600659873-d808a13e4d2a?auto=format&fit=crop&w=800&q=80',
      ],
      history: [
        {
          fromStatus: null,
          toStatus: 'SUBMITTED',
          changedByName: 'Ramesh Patil (Citizen)',
          notes: 'Initial complaint filed with photo.',
          createdAt: new Date(Date.now() - 72 * 3600 * 1000),
        },
        {
          fromStatus: 'SUBMITTED',
          toStatus: 'RECEIVED',
          changedByName: 'CleanTrack Auto-Triage',
          notes: 'Complaint validated within Panchavati boundary.',
          createdAt: new Date(Date.now() - 71 * 3600 * 1000),
        },
        {
          fromStatus: 'RECEIVED',
          toStatus: 'ASSIGNED',
          changedByName: 'Suhas Kulkarni (Admin)',
          notes: 'Assigned to Panchavati Sanitation Division.',
          createdAt: new Date(Date.now() - 60 * 3600 * 1000),
        },
        {
          fromStatus: 'ASSIGNED',
          toStatus: 'IN_PROGRESS',
          changedByName: 'Sunil Jadhav (Officer)',
          notes: 'Sanitation truck dispatched with crew of 4 workers.',
          createdAt: new Date(Date.now() - 24 * 3600 * 1000),
        },
        {
          fromStatus: 'IN_PROGRESS',
          toStatus: 'RESOLVED',
          changedByName: 'Sunil Jadhav (Officer)',
          notes: 'Cleaning completed and area disinfected with bleaching powder.',
          createdAt: new Date(Date.now() - 12 * 3600 * 1000),
        },
      ],
      feedback: {
        resolutionQuality: 'YES_RESOLVED',
        feedbackText: 'Very quick cleaning done before the evening aarti! Thank you team.',
        rating: 5,
      },
    },
    {
      referenceId: 'CTN-2026-000102',
      title: 'Large dangerous pothole on College Road near Thatte Nagar',
      description: 'A 2-foot wide and 6-inch deep pothole has opened up right after heavy rains. Two two-wheelers skidded yesterday evening. Needs cold mix patching urgently.',
      categoryCode: 'ROADS',
      urgency: 'HIGH',
      duration: '4 days',
      isBlockingTraffic: true,
      isHealthHazard: true,
      citizenName: 'Priya Deshmukh',
      citizenMobile: '9822334455',
      citizenEmail: 'priya.deshmukh@example.com',
      status: 'IN_PROGRESS',
      departmentId: deptRoads.id,
      assignedOfficerName: 'Er. Anand Shinde (Road Maintenance)',
      slaDueAt: new Date(Date.now() + 18 * 3600 * 1000),
      isOverdue: false,
      createdAt: new Date(Date.now() - 30 * 3600 * 1000),
      location: {
        latitude: 20.0042,
        longitude: 73.7638,
        address: 'Opposite Big Bazaar, Thatte Nagar, College Road, Nashik, Maharashtra 422005',
        landmark: 'Opposite Archies Gallery',
        zoneName: 'Nashik West Zone',
        wardNumber: 'Ward 12',
        locality: 'College Road',
      },
      photos: [
        'https://images.unsplash.com/photo-1515162816999-a0c47dc192f7?auto=format&fit=crop&w=800&q=80',
      ],
      history: [
        {
          fromStatus: null,
          toStatus: 'SUBMITTED',
          changedByName: 'Priya Deshmukh (Citizen)',
          notes: 'Reported with photo.',
          createdAt: new Date(Date.now() - 30 * 3600 * 1000),
        },
        {
          fromStatus: 'SUBMITTED',
          toStatus: 'ASSIGNED',
          changedByName: 'Suhas Kulkarni (Admin)',
          notes: 'Marked high urgency due to traffic skid incidents.',
          createdAt: new Date(Date.now() - 20 * 3600 * 1000),
        },
        {
          fromStatus: 'ASSIGNED',
          toStatus: 'IN_PROGRESS',
          changedByName: 'Er. Anand Shinde',
          notes: 'Asphalt cold mix and compactor roller scheduled for tonight 11 PM.',
          createdAt: new Date(Date.now() - 6 * 3600 * 1000),
        },
      ],
    },
    {
      referenceId: 'CTN-2026-000103',
      title: 'Drinking water pipeline leak on Untwadi Road, CIDCO',
      description: 'Major underground pipeline cracked near Trimurti Chowk signal. Clean drinking water has been gushing out onto the road continuously since morning.',
      categoryCode: 'WATER_LEAKAGE',
      urgency: 'CRITICAL',
      duration: 'Since morning (6 hours)',
      isBlockingTraffic: true,
      isHealthHazard: false,
      citizenName: 'Sachin Bhalerao',
      citizenMobile: '9921445566',
      citizenEmail: 'sachin.b@example.com',
      status: 'ASSIGNED',
      departmentId: deptWater.id,
      assignedOfficerName: 'Vikas Jagtap (Water Supply JE)',
      slaDueAt: new Date(Date.now() + 6 * 3600 * 1000),
      isOverdue: false,
      createdAt: new Date(Date.now() - 8 * 3600 * 1000),
      location: {
        latitude: 19.9678,
        longitude: 73.7582,
        address: 'Near Trimurti Chowk, Untwadi Road, CIDCO, Nashik 422008',
        landmark: 'Near City Centre Mall signal',
        zoneName: 'CIDCO / New Nashik Zone',
        wardNumber: 'Ward 24',
        locality: 'CIDCO',
      },
      photos: [
        'https://images.unsplash.com/photo-1584467735871-8e85353a8413?auto=format&fit=crop&w=800&q=80',
      ],
      history: [
        {
          fromStatus: null,
          toStatus: 'SUBMITTED',
          changedByName: 'Sachin Bhalerao (Citizen)',
          notes: 'Emergency water wastage reported.',
          createdAt: new Date(Date.now() - 8 * 3600 * 1000),
        },
        {
          fromStatus: 'SUBMITTED',
          toStatus: 'ASSIGNED',
          changedByName: 'System Auto-Router',
          notes: 'Critical urgency routed immediately to CIDCO Water Division.',
          createdAt: new Date(Date.now() - 7 * 3600 * 1000),
        },
      ],
    },
    {
      referenceId: 'CTN-2026-000104',
      title: 'Missing manhole cover on Dwarka flyover service road',
      description: 'An open drainage chamber with missing cement slab is completely uncovered. It poses severe danger to pedestrians and night commuters.',
      categoryCode: 'DRAINAGE',
      urgency: 'CRITICAL',
      duration: '2 days',
      isBlockingTraffic: true,
      isHealthHazard: true,
      citizenName: 'Ganesh More',
      citizenMobile: '9765332211',
      citizenEmail: 'ganesh.more@example.com',
      status: 'UNDER_REVIEW',
      departmentId: deptDrainage.id,
      slaDueAt: new Date(Date.now() + 16 * 3600 * 1000),
      isOverdue: false,
      createdAt: new Date(Date.now() - 14 * 3600 * 1000),
      location: {
        latitude: 19.9882,
        longitude: 73.7998,
        address: 'Service Road, Near Dwarka Circle, Nashik East, Maharashtra 422011',
        landmark: 'Near Mumbai Naka Flyover junction',
        zoneName: 'Nashik East Zone',
        wardNumber: 'Ward 18',
        locality: 'Dwarka',
      },
      photos: [
        'https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?auto=format&fit=crop&w=800&q=80',
      ],
      history: [
        {
          fromStatus: null,
          toStatus: 'SUBMITTED',
          changedByName: 'Ganesh More',
          notes: 'Hazard flagged.',
          createdAt: new Date(Date.now() - 14 * 3600 * 1000),
        },
        {
          fromStatus: 'SUBMITTED',
          toStatus: 'UNDER_REVIEW',
          changedByName: 'East Zone Dispatcher',
          notes: 'Temporary safety barricade dispatched.',
          createdAt: new Date(Date.now() - 10 * 3600 * 1000),
        },
      ],
    },
    {
      referenceId: 'CTN-2026-000105',
      title: 'Streetlights out along Nashik Road Railway Station approach',
      description: 'Four consecutive streetlight poles are dark from Subhash Road turn till Station parking. Commuters arriving on late trains face total darkness.',
      categoryCode: 'STREETLIGHT',
      urgency: 'MEDIUM',
      duration: '5 days',
      isBlockingTraffic: false,
      isHealthHazard: false,
      citizenName: 'Anita Nikam',
      citizenMobile: '9423112233',
      citizenEmail: 'anita.nikam@example.com',
      status: 'SUBMITTED',
      departmentId: deptElectrical.id,
      slaDueAt: new Date(Date.now() + 20 * 3600 * 1000),
      isOverdue: false,
      createdAt: new Date(Date.now() - 4 * 3600 * 1000),
      location: {
        latitude: 19.9555,
        longitude: 73.8385,
        address: 'Station Road, Nashik Road, Maharashtra 422101',
        landmark: 'Opposite Bytco Hospital gate',
        zoneName: 'Nashik Road Zone',
        wardNumber: 'Ward 29',
        locality: 'Nashik Road',
      },
      photos: [
        'https://images.unsplash.com/photo-1509198397868-475647b2a1e5?auto=format&fit=crop&w=800&q=80',
      ],
      history: [
        {
          fromStatus: null,
          toStatus: 'SUBMITTED',
          changedByName: 'Anita Nikam',
          notes: 'Registered via web portal.',
          createdAt: new Date(Date.now() - 4 * 3600 * 1000),
        },
      ],
    },
    {
      referenceId: 'CTN-2026-000106',
      title: 'Industrial chemical drums dumped on Satpur MIDC open ground',
      description: 'Unidentified commercial barrels dumped behind factory plot 42. Bad pungent smell causing breathing difficulty to surrounding workshop workers.',
      categoryCode: 'GARBAGE',
      urgency: 'CRITICAL',
      duration: '1 day',
      isBlockingTraffic: false,
      isHealthHazard: true,
      citizenName: 'Kailas Gaikwad',
      citizenMobile: '9890223344',
      citizenEmail: 'kailas.g@example.com',
      status: 'UNDER_REVIEW',
      departmentId: deptSanitation.id,
      slaDueAt: new Date(Date.now() - 2 * 3600 * 1000),
      isOverdue: true,
      createdAt: new Date(Date.now() - 36 * 3600 * 1000),
      location: {
        latitude: 19.982,
        longitude: 73.725,
        address: 'Plot 42, Satpur MIDC Industrial Area, Nashik 422007',
        landmark: 'Near NICE Exhibition Center back road',
        zoneName: 'Satpur Zone',
        wardNumber: 'Ward 8',
        locality: 'Satpur MIDC',
      },
      photos: [
        'https://images.unsplash.com/photo-1618477461853-cf6ed80faba5?auto=format&fit=crop&w=800&q=80',
      ],
      history: [
        {
          fromStatus: null,
          toStatus: 'SUBMITTED',
          changedByName: 'Kailas Gaikwad',
          notes: 'Filed urgent notification.',
          createdAt: new Date(Date.now() - 36 * 3600 * 1000),
        },
        {
          fromStatus: 'SUBMITTED',
          toStatus: 'UNDER_REVIEW',
          changedByName: 'Satpur Zonal Inspector',
          notes: 'SLA reminder triggered.',
          createdAt: new Date(Date.now() - 20 * 3600 * 1000),
        },
      ],
    },
  ];

  for (const c of sampleComplaints) {
    const category = categoryMap[c.categoryCode];
    const createdComplaint = await prisma.complaint.create({
      data: {
        referenceId: c.referenceId,
        title: c.title,
        description: c.description,
        categoryId: category.id,
        urgency: c.urgency,
        duration: c.duration,
        isBlockingTraffic: c.isBlockingTraffic,
        isHealthHazard: c.isHealthHazard,
        citizenName: c.citizenName,
        citizenMobile: c.citizenMobile,
        citizenEmail: c.citizenEmail,
        status: c.status,
        departmentId: c.departmentId,
        assignedOfficerName: c.assignedOfficerName,
        slaDueAt: c.slaDueAt,
        isOverdue: c.isOverdue,
        resolutionSummary: c.resolutionSummary,
        resolutionPhoto: c.resolutionPhoto,
        resolvedAt: c.resolvedAt,
        createdAt: c.createdAt,
        location: {
          create: c.location,
        },
        photos: {
          create: c.photos.map((url) => ({ url })),
        },
        history: {
          create: c.history.map((h) => ({
            fromStatus: h.fromStatus,
            toStatus: h.toStatus,
            changedByName: h.changedByName,
            notes: h.notes,
            createdAt: h.createdAt,
          })),
        },
      },
    });

    if (c.feedback) {
      await prisma.citizenFeedback.create({
        data: {
          complaintId: createdComplaint.id,
          resolutionQuality: c.feedback.resolutionQuality,
          feedbackText: c.feedback.feedbackText,
          rating: c.feedback.rating,
        },
      });
    }

    // Add initial notification
    await prisma.notification.create({
      data: {
        complaintId: createdComplaint.id,
        recipientMobile: c.citizenMobile,
        recipientEmail: c.citizenEmail,
        title: `Complaint Registered (${c.referenceId})`,
        message: `Your complaint ${c.referenceId} has been successfully logged on CleanTrack Nashik.`,
        type: 'STATUS_UPDATE',
        channel: 'IN_APP',
      },
    });
  }

  console.log(`✅ Seeded ${sampleComplaints.length} realistic Nashik civic complaints`);
  console.log('🎉 Database seeding complete!');
}

main()
  .catch((e) => {
    console.error('Error during seeding:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
