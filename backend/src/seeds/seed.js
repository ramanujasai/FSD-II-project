import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { User } from '../models/User.js';
import { Scheme } from '../models/Scheme.js';
import { Application } from '../models/Application.js';
import { APPLICATION_STATUS } from '../utils/statusWorkflow.js';

dotenv.config();

const uri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/govt_scheme_db';

const seedDatabase = async () => {
  try {
    console.log('[Seed] Connecting to MongoDB...');
    await mongoose.connect(uri);
    console.log('[Seed] Connected. Cleaning up existing demo data...');

    await User.deleteMany({});
    await Scheme.deleteMany({});
    await Application.deleteMany({});

    console.log('[Seed] Inserting Administrative and Citizen demo accounts...');

    // 1. Create Admins (Admin accounts can only be created via seed or DB administration)
    const admin1 = await User.create({
      name: 'Dr. Alok Verma (Admin Director)',
      email: 'admin@demo.gov.local',
      password: 'Admin@12345',
      phone: '+91-9876543210',
      role: 'admin',
      address: 'Central Secretariat Complex, Block 3',
      district: 'Administrative Capital',
      state: 'National Capital Region (Demo)',
      pincode: '110001',
      occupation: 'Public Administrator',
      socialCategory: 'General'
    });

    const admin2 = await User.create({
      name: 'Meera Nair (Verification Officer)',
      email: 'officer@demo.gov.local',
      password: 'Admin@12345',
      phone: '+91-9876543211',
      role: 'admin',
      address: 'District Grievance Redressal Cell',
      district: 'Central Zone',
      state: 'Demo State',
      pincode: '110002',
      occupation: 'Welfare Inspection Officer',
      socialCategory: 'General'
    });

    // 2. Create Citizens / Beneficiaries
    const citizen1 = await User.create({
      name: 'Rahul Kumar Verma',
      email: 'citizen.rahul@example.com',
      password: 'Citizen@12345',
      phone: '+91-9811122233',
      role: 'beneficiary',
      address: 'Plot 42, Kisan Basti, Village Rampur',
      district: 'Kisan Nagar',
      state: 'Demo Pradesh',
      pincode: '201009',
      occupation: 'Smallholder Farmer',
      socialCategory: 'OBC'
    });

    const citizen2 = await User.create({
      name: 'Priya Sundaram',
      email: 'priya.sundaram@example.com',
      password: 'Citizen@12345',
      phone: '+91-9822233344',
      role: 'beneficiary',
      address: 'Flat 304, Vidya Vihar Colony',
      district: 'Vidya Nagar',
      state: 'Demo Pradesh',
      pincode: '500032',
      occupation: 'Undergraduate Student',
      socialCategory: 'General'
    });

    const citizen3 = await User.create({
      name: 'Anita Devi',
      email: 'anita.devi@example.com',
      password: 'Citizen@12345',
      phone: '+91-9833344455',
      role: 'beneficiary',
      address: 'House 18, Shilpkari Lane',
      district: 'Hastkala Pur',
      state: 'Demo Pradesh',
      pincode: '302001',
      occupation: 'Handicraft Artisan',
      socialCategory: 'SC'
    });

    const citizen4 = await User.create({
      name: 'Vikramjit Singh',
      email: 'vikram.singh@example.com',
      password: 'Citizen@12345',
      phone: '+91-9844455566',
      role: 'beneficiary',
      address: 'Shop 12, Industrial Focal Point',
      district: 'Udyog Nagar',
      state: 'Demo Pradesh',
      pincode: '141003',
      occupation: 'Micro Workshop Owner',
      socialCategory: 'EWS'
    });

    console.log('[Seed] Inserting Fictional Demo Schemes...');

    // 3. Create Schemes
    const schemesData = [
      {
        title: 'Kisan Solar Water Pump Subsidy Scheme',
        code: 'SCH-AGRI-2026-01',
        category: 'Agriculture & Farming',
        shortDescription: 'Capital grant covering up to 75% cost of 3HP-5HP solar-powered irrigation pumps for marginal cultivators.',
        fullDescription: 'This initiative provides targeted capital subsidies to small and marginal farmers for replacing diesel pumps with high-efficiency standalone solar photovoltaic water pumping systems. The objective is to reduce agricultural operating overheads and encourage green irrigation practices in drought-prone rural clusters.',
        sponsoringDepartment: 'Department of Agricultural & Renewable Resources',
        targetAudience: 'Small and marginal farmers owning cultivable agricultural land',
        benefits: {
          summary: '75% subsidy on certified solar pumping machinery plus free installation assistance',
          type: 'Equipment Grant',
          amountOrValue: 'Up to ₹85,000 equivalent subsidy',
          disbursementMode: 'Direct vendor settlement subsidy'
        },
        eligibilityCriteria: [
          { criterion: 'Must be an active cultivator owning between 0.5 to 5.0 acres of cultivable land', mandatory: true },
          { criterion: 'Must not possess an existing energized grid electricity agricultural connection', mandatory: true },
          { criterion: 'Annual household agricultural income below ₹3,50,000', mandatory: true },
          { criterion: 'Permanent resident of state', mandatory: true }
        ],
        requiredDocuments: [
          { documentName: 'Land Ownership / Khatauni Record Copy', description: 'Certified land holding title', mandatory: true },
          { documentName: 'Proof of Identity (Voter ID / Driving License)', description: 'Government issued photo ID card', mandatory: true },
          { documentName: 'Income Certificate from Tehsildar', description: 'Recent family income declaration', mandatory: true },
          { documentName: 'Electricity Utility No-Objection Certificate', description: 'Confirmation of no active grid tube-well', mandatory: false }
        ],
        applicationDeadline: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000),
        isActive: true
      },
      {
        title: 'Pratibha Higher Education Merit Fellowship',
        code: 'SCH-EDU-2026-02',
        category: 'Education & Skill',
        shortDescription: 'Academic scholarship awarding ₹35,000 annual stipend for meritorious students pursuing STEM or Humanities degrees.',
        fullDescription: 'Designed to reward academic talent and prevent dropout at the undergraduate and post-graduate levels. Eligible scholars receive semester-wise educational stipends to cover tuition, books, assistive learning aids, and hostel accommodations.',
        sponsoringDepartment: 'Ministry of Higher Learning & Youth Advancement',
        targetAudience: 'Full-time undergraduate college students with academic distinction',
        benefits: {
          summary: '₹35,000 per academic year for tuition fee and academic support',
          type: 'Scholarship Allowance',
          amountOrValue: '₹35,000 per annum',
          disbursementMode: 'Direct Benefit Transfer'
        },
        eligibilityCriteria: [
          { criterion: 'Minimum 75% aggregate marks in 12th Standard board examination', mandatory: true },
          { criterion: 'Enrolled in a recognized regular degree programme in an accredited college', mandatory: true },
          { criterion: 'Combined annual parental income not exceeding ₹4,50,000', mandatory: true },
          { criterion: 'Not receiving any other conflicting government scholarship', mandatory: true }
        ],
        requiredDocuments: [
          { documentName: '12th Standard Final Grade Sheet / Marksheet', description: 'Original marks certificate', mandatory: true },
          { documentName: 'Bonafide College Admission Verification Letter', description: 'Signed letter by Principal / Dean', mandatory: true },
          { documentName: 'Parental Income Certificate', description: 'Issued by competent revenue authority', mandatory: true },
          { documentName: 'Passport Size Photograph', description: 'Recent color photograph', mandatory: true }
        ],
        applicationDeadline: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000),
        isActive: true
      },
      {
        title: 'Aarogya Universal Senior Citizen Healthcare Shield',
        code: 'SCH-HLTH-2026-03',
        category: 'Healthcare',
        shortDescription: 'Cashless inpatient health cover of up to ₹2,50,000 annually for senior citizens aged 60 and above.',
        fullDescription: 'Provides comprehensive tertiary health protection for senior citizens, covering critical surgical procedures, day-care hospitalizations, diagnostic imaging, and post-discharge recovery medicines without deductibles.',
        sponsoringDepartment: 'Public Health & Social Protection Board',
        targetAudience: 'Elderly citizens aged 60+ without corporate or private insurance',
        benefits: {
          summary: 'Cashless tertiary hospitalization coverage up to ₹2,50,000 per family unit per year',
          type: 'Health Insurance Cover',
          amountOrValue: '₹2,50,000 annual insurance cap',
          disbursementMode: 'Empanelled healthcare network cashless admission'
        },
        eligibilityCriteria: [
          { criterion: 'Applicant age must be 60 years or older on date of application', mandatory: true },
          { criterion: 'Must not be a beneficiary of central government civil health schemes', mandatory: true },
          { criterion: 'Resident of state for minimum 5 consecutive years', mandatory: true }
        ],
        requiredDocuments: [
          { documentName: 'Proof of Age (Birth Certificate / Matriculation Certificate)', description: 'Age proof document', mandatory: true },
          { documentName: 'Residential Domicile Certificate', description: 'Proof of state residency', mandatory: true },
          { documentName: 'Passport Sized Photo of Primary Applicant & Nominee', description: 'Color photos', mandatory: true }
        ],
        applicationDeadline: new Date(Date.now() + 120 * 24 * 60 * 60 * 1000),
        isActive: true
      },
      {
        title: 'Gramin Pukka Housing & Sanitation Assistance',
        code: 'SCH-HOUS-2026-04',
        category: 'Housing & Sanitation',
        shortDescription: 'Financial subsidy of ₹1,20,000 in staggered milestone installments to build permanent disaster-resilient houses.',
        fullDescription: 'Aims to assist homeless households and families living in unplastered kutcha dwellings in rural wards. Financial support is released in 3 geo-tagged construction stages: plinth completion, roof casting, and sanitation facility integration.',
        sponsoringDepartment: 'Rural Infrastructure & Habitation Mission',
        targetAudience: 'Rural families residing in kutcha or dilapidated dwellings',
        benefits: {
          summary: 'Financial aid of ₹1,20,000 provided in 3 verified construction milestones',
          type: 'Direct Financial Subsidy',
          amountOrValue: '₹1,20,000 total allocation',
          disbursementMode: 'Milestone verified Direct Benefit Transfer'
        },
        eligibilityCriteria: [
          { criterion: 'Family currently residing in temporary kutcha house or shelter', mandatory: true },
          { criterion: 'Ownership or patta rights over homestead land plot', mandatory: true },
          { criterion: 'No family member in permanent government employment', mandatory: true }
        ],
        requiredDocuments: [
          { documentName: 'Gram Panchayat Recommendation Letter', description: 'Issued by Village Development Officer', mandatory: true },
          { documentName: 'Homestead Land Title / Patta Document', description: 'Proof of land allotment', mandatory: true },
          { documentName: 'Photograph of Existing Kutcha Dwelling', description: 'Geo-tagged site picture', mandatory: true }
        ],
        applicationDeadline: new Date(Date.now() + 45 * 24 * 60 * 60 * 1000),
        isActive: true
      },
      {
        title: 'Mahila Micro-Enterprise Seed Capital Grant',
        code: 'SCH-WMEN-2026-05',
        category: 'Women & Child Development',
        shortDescription: 'Seed grant of ₹50,000 for women-led self-help groups and entrepreneurs starting small manufacturing or retail.',
        fullDescription: 'Empowers aspiring women entrepreneurs and cooperative self-help clusters by furnishing zero-liability seed working capital, business mentorship, and digital accounting literacy workshops.',
        sponsoringDepartment: 'Directorate of Women Empowerment & Livelihood',
        targetAudience: 'Women entrepreneurs, self-help group leaders, and rural artisans',
        benefits: {
          summary: '₹50,000 direct capital grant plus free 2-week enterprise management coaching',
          type: 'Direct Financial Subsidy',
          amountOrValue: '₹50,000 seed grant',
          disbursementMode: 'Direct Benefit Transfer'
        },
        eligibilityCriteria: [
          { criterion: 'Woman sole proprietor or female-headed registered cooperative group', mandatory: true },
          { criterion: 'Applicant age between 21 and 55 years', mandatory: true },
          { criterion: 'Submission of a viable basic micro-business enterprise proposal', mandatory: true }
        ],
        requiredDocuments: [
          { documentName: 'Self-Help Group Registration Certificate / Trade License', description: 'Official registration paper', mandatory: true },
          { documentName: 'Enterprise Business Activity Summary (1-2 pages)', description: 'Brief plan of business operations', mandatory: true },
          { documentName: 'Residential Address Proof', description: 'Utility bill or ration card copy', mandatory: true }
        ],
        applicationDeadline: new Date(Date.now() + 75 * 24 * 60 * 60 * 1000),
        isActive: true
      },
      {
        title: 'Divyangjan Assistive Mobility Aid Distribution',
        code: 'SCH-SNRC-2026-06',
        category: 'Senior Citizen & Social Security',
        shortDescription: 'Distribution of motorized tricycles, braille tablets, and hearing aids for persons with special needs.',
        fullDescription: 'Provides custom-fitted modern assistive appliances, motorized mobility equipment, smart canes, and specialized sensory assistive technology to promote independence, education, and career mobility.',
        sponsoringDepartment: 'Empowerment of Persons with Disabilities Board',
        targetAudience: 'Differently-abled citizens seeking assistive technology',
        benefits: {
          summary: 'Complimentary high-grade assistive device kit tailored to disability type',
          type: 'Equipment Grant',
          amountOrValue: 'Aid appliance worth up to ₹40,000',
          disbursementMode: 'District camp device handover'
        },
        eligibilityCriteria: [
          { criterion: 'Possession of certified disability assessment of 40% or higher', mandatory: true },
          { criterion: 'Monthly family income not exceeding ₹25,000', mandatory: true },
          { criterion: 'Has not received equivalent aid from state within the last 3 years', mandatory: true }
        ],
        requiredDocuments: [
          { documentName: 'Medical Board Disability Certificate', description: 'Certified disability assessment report', mandatory: true },
          { documentName: 'Income Certificate', description: 'Issued by designated tehsildar', mandatory: true },
          { documentName: 'Full-Length Photograph showing physical aid requirement', description: 'Recent photo', mandatory: true }
        ],
        applicationDeadline: new Date(Date.now() + 100 * 24 * 60 * 60 * 1000),
        isActive: true
      },
      {
        title: 'Traditional Artisan Tooling & Credit Subvention',
        code: 'SCH-FINC-2026-07',
        category: 'Financial Inclusion & Microenterprise',
        shortDescription: 'Modernized toolkit voucher of ₹15,000 and 5% interest subvention for small craftspersons.',
        fullDescription: 'Recognizes traditional artisans including weavers, potters, blacksmiths, and woodcarvers. Grants modern ergonomic toolkits and subsidizes commercial microcredit interest rates.',
        sponsoringDepartment: 'Small Scale Handicraft & Microenterprise Board',
        targetAudience: 'Practicing craftspeople engaged in recognized traditional trades',
        benefits: {
          summary: '₹15,000 tool voucher and up to 5% interest relief on enterprise bank loans',
          type: 'Loan Subvention',
          amountOrValue: '₹15,000 equipment voucher + interest rebate',
          disbursementMode: 'Direct voucher settlement'
        },
        eligibilityCriteria: [
          { criterion: 'Practicing artisan with at least 3 years active experience in craft trade', mandatory: true },
          { criterion: 'Age not less than 18 years', mandatory: true }
        ],
        requiredDocuments: [
          { documentName: 'Artisan Identity Card / Guild Membership Record', description: 'Trade association endorsement', mandatory: true },
          { documentName: 'Work Sample Portfolio or Photos of Handcrafted Goods', description: '3 recent sample photos', mandatory: true }
        ],
        applicationDeadline: new Date(Date.now() + 80 * 24 * 60 * 60 * 1000),
        isActive: true
      },
      {
        title: 'Green Rooftop Rainwater Harvesting Subsidy',
        code: 'SCH-HOUS-2026-08',
        category: 'Housing & Sanitation',
        shortDescription: 'Conservation incentive for retrofitting urban domestic water collection filtration systems.',
        fullDescription: 'Previous fiscal season incentive intended to promote decentralized groundwater recharge in residential neighborhoods. This scheme has concluded its application window.',
        sponsoringDepartment: 'Urban Sustainability & Water Conservation Cell',
        targetAudience: 'Urban residential property owners',
        benefits: {
          summary: '50% one-time subsidy on rooftop collection tank and filter installation',
          type: 'Reimbursement',
          amountOrValue: 'Up to ₹20,000 reimbursement',
          disbursementMode: 'Post-completion inspection rebate'
        },
        eligibilityCriteria: [
          { criterion: 'Property owner of independent residential bungalow or building', mandatory: true },
          { criterion: 'Minimum rooftop catchment surface area of 600 sq ft', mandatory: true }
        ],
        requiredDocuments: [
          { documentName: 'Municipal Property Tax Assessment Receipt', description: 'Proof of property ownership', mandatory: true },
          { documentName: 'Plumbing Vendor Technical Quotation', description: 'Certified cost estimate', mandatory: true }
        ],
        applicationDeadline: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000),
        isActive: false
      }
    ];

    const insertedSchemes = await Scheme.insertMany(schemesData);
    console.log(`[Seed] Successfully inserted ${insertedSchemes.length} schemes.`);

    console.log('[Seed] Inserting Sample Applications in various workflow stages...');

    // 4. Create Sample Applications across diverse stages
    // Application 1: Submitted (Fresh application by Rahul for Kisan Solar Pump)
    await Application.create({
      applicationNumber: 'APP-2026-100234',
      user: citizen1._id,
      scheme: insertedSchemes[0]._id, // Kisan Solar
      applicantDetails: {
        fullName: citizen1.name,
        email: citizen1.email,
        phone: citizen1.phone,
        age: 38,
        gender: 'Male',
        address: citizen1.address,
        state: citizen1.state,
        district: citizen1.district,
        pincode: citizen1.pincode,
        socialCategory: citizen1.socialCategory,
        annualIncome: 185000,
        occupation: citizen1.occupation
      },
      schemeSpecificData: {
        purposeOfAssistance: 'Installation of a 3HP DC surface solar water pump for irrigating 2.5 acres of mustard and wheat crops.',
        eligibilityDeclarations: [
          { criterion: 'Owns 2.5 acres cultivable agricultural land', declaredEligible: true },
          { criterion: 'No prior agricultural electricity grid connection', declaredEligible: true }
        ],
        declarationAccepted: true
      },
      documents: [
        {
          documentName: 'Land Ownership / Khatauni Record Copy',
          fileName: 'khatauni_rampur_plot42.pdf',
          fileSize: '1.2 MB',
          documentType: 'application/pdf',
          isMockUploaded: true,
          verified: false,
          uploadedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000)
        },
        {
          documentName: 'Income Certificate from Tehsildar',
          fileName: 'income_cert_2026.pdf',
          fileSize: '450 KB',
          documentType: 'application/pdf',
          isMockUploaded: true,
          verified: false,
          uploadedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000)
        }
      ],
      status: APPLICATION_STATUS.SUBMITTED,
      statusHistory: [
        {
          status: APPLICATION_STATUS.SUBMITTED,
          changedBy: citizen1._id,
          changedByName: citizen1.name,
          changedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
          remarks: 'Citizen completed and submitted online application form.'
        }
      ]
    });

    // Application 2: Under Review (Priya for Pratibha Scholarship)
    await Application.create({
      applicationNumber: 'APP-2026-100456',
      user: citizen2._id,
      scheme: insertedSchemes[1]._id, // Education Scholarship
      applicantDetails: {
        fullName: citizen2.name,
        email: citizen2.email,
        phone: citizen2.phone,
        age: 20,
        gender: 'Female',
        address: citizen2.address,
        state: citizen2.state,
        district: citizen2.district,
        pincode: citizen2.pincode,
        socialCategory: citizen2.socialCategory,
        annualIncome: 240000,
        occupation: citizen2.occupation
      },
      schemeSpecificData: {
        purposeOfAssistance: 'Tuition and academic textbooks grant for 2nd Year B.Sc Computer Science Honours at State College.',
        eligibilityDeclarations: [
          { criterion: 'Scored 89.4% in 12th Standard State Board examination', declaredEligible: true },
          { criterion: 'Family income below threshold', declaredEligible: true }
        ],
        declarationAccepted: true
      },
      documents: [
        {
          documentName: '12th Standard Final Grade Sheet / Marksheet',
          fileName: 'priya_12th_board_marksheet.pdf',
          fileSize: '890 KB',
          documentType: 'application/pdf',
          isMockUploaded: true,
          verified: true,
          uploadedAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000)
        },
        {
          documentName: 'Bonafide College Admission Verification Letter',
          fileName: 'college_bonafide_cert_2026.pdf',
          fileSize: '620 KB',
          documentType: 'application/pdf',
          isMockUploaded: true,
          verified: true,
          uploadedAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000)
        }
      ],
      status: APPLICATION_STATUS.UNDER_REVIEW,
      adminRemarks: 'Primary academic transcripts and college bonafide certificate verified. Pending final scholarship allocation approval.',
      statusHistory: [
        {
          status: APPLICATION_STATUS.SUBMITTED,
          changedBy: citizen2._id,
          changedByName: citizen2.name,
          changedAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
          remarks: 'Application submitted by candidate.'
        },
        {
          status: APPLICATION_STATUS.UNDER_REVIEW,
          changedBy: admin2._id,
          changedByName: admin2.name,
          changedAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
          remarks: 'Under document verification by Welfare Inspection Officer.'
        }
      ]
    });

    // Application 3: Approved (Anita Devi for Mahila Micro-Enterprise)
    await Application.create({
      applicationNumber: 'APP-2026-100789',
      user: citizen3._id,
      scheme: insertedSchemes[4]._id, // Mahila Micro-Enterprise
      applicantDetails: {
        fullName: citizen3.name,
        email: citizen3.email,
        phone: citizen3.phone,
        age: 34,
        gender: 'Female',
        address: citizen3.address,
        state: citizen3.state,
        district: citizen3.district,
        pincode: citizen3.pincode,
        socialCategory: citizen3.socialCategory,
        annualIncome: 120000,
        occupation: citizen3.occupation
      },
      schemeSpecificData: {
        purposeOfAssistance: 'Procurement of pedal-operated sewing machines and eco-friendly raw jute fabric for women handcraft cooperative.',
        eligibilityDeclarations: [
          { criterion: 'Registered self-help group head', declaredEligible: true },
          { criterion: 'Feasible business summary provided', declaredEligible: true }
        ],
        declarationAccepted: true
      },
      documents: [
        {
          documentName: 'Self-Help Group Registration Certificate / Trade License',
          fileName: 'shg_reg_cert_hastkala.pdf',
          fileSize: '1.1 MB',
          documentType: 'application/pdf',
          isMockUploaded: true,
          verified: true,
          uploadedAt: new Date(Date.now() - 12 * 24 * 60 * 60 * 1000)
        },
        {
          documentName: 'Enterprise Business Activity Summary (1-2 pages)',
          fileName: 'business_plan_jute_crafts.pdf',
          fileSize: '740 KB',
          documentType: 'application/pdf',
          isMockUploaded: true,
          verified: true,
          uploadedAt: new Date(Date.now() - 12 * 24 * 60 * 60 * 1000)
        }
      ],
      status: APPLICATION_STATUS.APPROVED,
      adminRemarks: 'Application approved following committee review. Ready for demo disbursement queue.',
      approvedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
      statusHistory: [
        {
          status: APPLICATION_STATUS.SUBMITTED,
          changedBy: citizen3._id,
          changedByName: citizen3.name,
          changedAt: new Date(Date.now() - 12 * 24 * 60 * 60 * 1000),
          remarks: 'Application submitted.'
        },
        {
          status: APPLICATION_STATUS.UNDER_REVIEW,
          changedBy: admin2._id,
          changedByName: admin2.name,
          changedAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
          remarks: 'Verified SHG credentials and bank linkage status.'
        },
        {
          status: APPLICATION_STATUS.APPROVED,
          changedBy: admin1._id,
          changedByName: admin1.name,
          changedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
          remarks: 'Approved for ₹50,000 capital seed grant.'
        }
      ]
    });

    // Application 4: Disbursed (Vikramjit Singh for Artisan Tooling Grant)
    await Application.create({
      applicationNumber: 'APP-2026-100892',
      user: citizen4._id,
      scheme: insertedSchemes[6]._id, // Artisan Tooling Grant
      applicantDetails: {
        fullName: citizen4.name,
        email: citizen4.email,
        phone: citizen4.phone,
        age: 41,
        gender: 'Male',
        address: citizen4.address,
        state: citizen4.state,
        district: citizen4.district,
        pincode: citizen4.pincode,
        socialCategory: citizen4.socialCategory,
        annualIncome: 190000,
        occupation: citizen4.occupation
      },
      schemeSpecificData: {
        purposeOfAssistance: 'Purchase of precision metal lathe turning attachments and protective artisan tooling gear.',
        eligibilityDeclarations: [
          { criterion: '15 years active craftsmanship in light engineering', declaredEligible: true }
        ],
        declarationAccepted: true
      },
      documents: [
        {
          documentName: 'Artisan Identity Card / Guild Membership Record',
          fileName: 'artisan_card_vikramjit.pdf',
          fileSize: '530 KB',
          documentType: 'application/pdf',
          isMockUploaded: true,
          verified: true,
          uploadedAt: new Date(Date.now() - 20 * 24 * 60 * 60 * 1000)
        }
      ],
      status: APPLICATION_STATUS.DISBURSED,
      adminRemarks: 'Benefit voucher released under demo simulation. Tooling redemption voucher generated.',
      approvedAt: new Date(Date.now() - 8 * 24 * 60 * 60 * 1000),
      disbursedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
      demoDisbursementReference: 'DEMO-DBT-883921',
      statusHistory: [
        {
          status: APPLICATION_STATUS.SUBMITTED,
          changedBy: citizen4._id,
          changedByName: citizen4.name,
          changedAt: new Date(Date.now() - 20 * 24 * 60 * 60 * 1000),
          remarks: 'Application submitted.'
        },
        {
          status: APPLICATION_STATUS.UNDER_REVIEW,
          changedBy: admin2._id,
          changedByName: admin2.name,
          changedAt: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000),
          remarks: 'Trade documentation verified.'
        },
        {
          status: APPLICATION_STATUS.APPROVED,
          changedBy: admin1._id,
          changedByName: admin1.name,
          changedAt: new Date(Date.now() - 8 * 24 * 60 * 60 * 1000),
          remarks: 'Approved for tooling voucher package.'
        },
        {
          status: APPLICATION_STATUS.DISBURSED,
          changedBy: admin1._id,
          changedByName: admin1.name,
          changedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
          remarks: 'Demo electronic disbursement reference DEMO-DBT-883921 issued.'
        }
      ]
    });

    // Application 5: Rejected (Rahul Verma for Housing grant - income exceeded ceiling)
    await Application.create({
      applicationNumber: 'APP-2026-100911',
      user: citizen1._id,
      scheme: insertedSchemes[3]._id, // Housing grant
      applicantDetails: {
        fullName: citizen1.name,
        email: citizen1.email,
        phone: citizen1.phone,
        age: 38,
        gender: 'Male',
        address: citizen1.address,
        state: citizen1.state,
        district: citizen1.district,
        pincode: citizen1.pincode,
        socialCategory: citizen1.socialCategory,
        annualIncome: 380000,
        occupation: citizen1.occupation
      },
      schemeSpecificData: {
        purposeOfAssistance: 'Extension of existing brick room.',
        eligibilityDeclarations: [
          { criterion: 'Living in temporary shelter', declaredEligible: false }
        ],
        declarationAccepted: true
      },
      documents: [
        {
          documentName: 'Gram Panchayat Recommendation Letter',
          fileName: 'panchayat_letter.pdf',
          fileSize: '320 KB',
          documentType: 'application/pdf',
          isMockUploaded: true,
          verified: false,
          uploadedAt: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000)
        }
      ],
      status: APPLICATION_STATUS.REJECTED,
      adminRemarks: 'Application rejected: Field inspection confirmed applicant already owns a permanent pucca structure and family income exceeds rural housing eligibility limits.',
      rejectedAt: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000),
      statusHistory: [
        {
          status: APPLICATION_STATUS.SUBMITTED,
          changedBy: citizen1._id,
          changedByName: citizen1.name,
          changedAt: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000),
          remarks: 'Application submitted.'
        },
        {
          status: APPLICATION_STATUS.UNDER_REVIEW,
          changedBy: admin2._id,
          changedByName: admin2.name,
          changedAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000),
          remarks: 'Assigned to field verification officer.'
        },
        {
          status: APPLICATION_STATUS.REJECTED,
          changedBy: admin1._id,
          changedByName: admin1.name,
          changedAt: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000),
          remarks: 'Rejected during ground verification audit.'
        }
      ]
    });

    console.log('[Seed] Sample applications successfully populated!');
    console.log('====================================================');
    console.log('DEMO ACCOUNTS READY:');
    console.log('ADMIN:');
    console.log('  Email:    admin@demo.gov.local');
    console.log('  Password: Admin@12345');
    console.log('BENEFICIARY 1:');
    console.log('  Email:    citizen.rahul@example.com');
    console.log('  Password: Citizen@12345');
    console.log('BENEFICIARY 2:');
    console.log('  Email:    priya.sundaram@example.com');
    console.log('  Password: Citizen@12345');
    console.log('====================================================');

    await mongoose.disconnect();
    console.log('[Seed] Database disconnected cleanly.');
    process.exit(0);
  } catch (error) {
    console.error('[Seed Error] Failed to seed database:', error);
    process.exit(1);
  }
};

seedDatabase();
