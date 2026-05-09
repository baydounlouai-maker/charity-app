const bcrypt = require('bcryptjs');
const pool   = require('./db');
const { default: CONFIG } = require('./config');

const ADMIN_USERNAME = CONFIG.ADMIN_USERNAME;
const ADMIN_PASSWORD = CONFIG.ADMIN_PASSWORD;
const DEMO_PASSWORD = CONFIG.DEMO_USERS_PASSWORD;

async function seed() {
  /* ── Guard: only run once ──────────────────────────────── */
  const [existing] = await pool.execute(
    'SELECT id FROM users WHERE username = ?',
    [ADMIN_USERNAME]
  );
  if (existing.length > 0) return;

  const hashed      = await bcrypt.hash(ADMIN_PASSWORD, 10);
  const demoHashed  = await bcrypt.hash(DEMO_PASSWORD, 10);

  const [[adminRole]]   = await pool.execute("SELECT id FROM roles WHERE name = 'Admin'");
  const [[charityRole]] = await pool.execute("SELECT id FROM roles WHERE name = 'Charity'");
  const [[donorRole]]   = await pool.execute("SELECT id FROM roles WHERE name = 'Donor'");

  /* ── Admin ─────────────────────────────────────────────── */
  const adminId = await insertUser({
    username: ADMIN_USERNAME,
    password: hashed,
  }, adminRole.id);
  console.log('[seed] admin created  →  username: ' + ADMIN_USERNAME + '  password: ' + ADMIN_PASSWORD);

  /* ── Charities ──────────────────────────────────────────── */
  const hopeId = await insertUser({
    username:            'hopefoundation',
    password:            demoHashed,
    charity_name:        'Hope Foundation',
    charity_description: 'Providing essential aid to displaced families through food, shelter, and medical support across the region.',
  }, charityRole.id);

  const greenId = await insertUser({
    username:            'greenliving',
    password:            demoHashed,
    charity_name:        'Green Living Initiative',
    charity_description: 'Promoting sustainable lifestyles and distributing eco-friendly essentials to underserved communities.',
  }, charityRole.id);

  const bridgeId = await insertUser({
    username:            'bridgeofhope',
    password:            demoHashed,
    charity_name:        'Bridge of Hope',
    charity_description: 'Connecting communities with emergency relief resources and long-term rehabilitation programs.',
  }, charityRole.id);

  const sunriseId = await insertUser({
    username:            'sunriserelief',
    password:            demoHashed,
    charity_name:        'Sunrise Relief',
    charity_description: 'Delivering sunrise-to-sunset humanitarian aid including mobile clinics and nutritional support to war-affected zones.',
  }, charityRole.id);

  const childrenId = await insertUser({
    username:            'childrensfuture',
    password:            demoHashed,
    charity_name:        "Children's Future Fund",
    charity_description: 'Ensuring every child has access to education, nutrition, and a safe environment to grow and thrive.',
  }, charityRole.id);

  const handsId = await insertUser({
    username:            'handsinhand',
    password:            demoHashed,
    charity_name:        'Hands in Hand',
    charity_description: 'A grassroots network of volunteers providing direct relief — food, shelter kits, and hygiene packs — to families in crisis.',
  }, charityRole.id);

  console.log(`[seed] 6 charity users created  →  password: ${DEMO_PASSWORD}`);

  /* ── Donors ─────────────────────────────────────────────── */
  const johnId = await insertUser({
    username: 'john_donor',
    password: demoHashed,
  }, donorRole.id);

  const sarahId = await insertUser({
    username: 'sarah_d',
    password: demoHashed,
  }, donorRole.id);

  const marcId = await insertUser({
    username: 'marc_gives',
    password: demoHashed,
  }, donorRole.id);

  console.log(`[seed] 3 donor users created  →  password: ${DEMO_PASSWORD}`);

  /* ── Addresses ──────────────────────────────────────────── */
  const hopeAddr1 = await insertAddress(hopeId,  'Main Office',         '45 Rue de la Paix',   'Beirut',  null,       null,    'Lebanon');
  const hopeAddr2 = await insertAddress(hopeId,  'Distribution Center', '12 Industrial Zone',  'Tripoli', null,       null,    'Lebanon');
  const greenAddr = await insertAddress(greenId, 'HQ',                  '8 Green Street',      'Amman',   'Amman',    '11110', 'Jordan');
  const greenAddr2= await insertAddress(greenId, 'Warehouse',           '3 Industrial Ave',    'Zarqa',   'Zarqa',    '13110', 'Jordan');
  const bridgeAddr   = await insertAddress(bridgeId,   'Field Office',  '22 Solidarity Road',    'Istanbul',  'Istanbul', '34000', 'Turkey');
  const sunriseAddr1 = await insertAddress(sunriseId,  'HQ',            '7 Martyr Square',       'Beirut',    null,       null,    'Lebanon');
  const sunriseAddr2 = await insertAddress(sunriseId,  'Mobile Unit',   '3 Relief Camp Road',    'Baalbek',   null,       null,    'Lebanon');
  const childrenAddr = await insertAddress(childrenId, 'Office',        '15 Education Boulevard','Beirut',    null,       null,    'Lebanon');
  const handsAddr1   = await insertAddress(handsId,    'Hub North',     '9 Cedar Avenue',        'Tripoli',   null,       null,    'Lebanon');
  const handsAddr2   = await insertAddress(handsId,    'Hub South',     '4 Palm Street',         'Sidon',     null,       null,    'Lebanon');

  /* ── Donor Addresses ───────────────────────────────────── */
  await insertAddress(johnId,  'Home',    '14 Maple Street',     'London',    'England',    'SW1A 1AA', 'UK');
  await insertAddress(johnId,  'Office',  '3 Tech Park Avenue',  'London',    'England',    'EC1A 1BB', 'UK');
  await insertAddress(sarahId, 'Home',    '27 Rue des Fleurs',   'Paris',     'Île-de-France', '75008', 'France');
  await insertAddress(sarahId, 'Storage', '5 Dépôt Logistique',  'Versailles','Île-de-France', '78000', 'France');
  await insertAddress(marcId,  'Home',    '9 Via Roma',          'Milan',     'Lombardy',   '20121',    'Italy');
  await insertAddress(marcId,  'Depot',   '44 Industrial Road',  'Turin',     'Piedmont',   '10121',    'Italy');

  /* ── Contacts ───────────────────────────────────────────── */
  const hopeCon1  = await insertContact(hopeId,  'Coordinator',   'Layla Mansour', 'layla@hopefoundation.org',  '+961 70 123 456');
  const hopeCon2  = await insertContact(hopeId,  'Field Manager', 'Omar Khalil',   'omar@hopefoundation.org',   '+961 71 234 567');
  const greenCon  = await insertContact(greenId, 'Director',      'Sara Ahmed',    'sara@greenliving.org',      '+962 79 345 678');
  const bridgeCon    = await insertContact(bridgeId,   'Operations',  'Kemal Arslan',   'kemal@bridgeofhope.org',       '+90 532 100 2030');
  const sunriseCon1  = await insertContact(sunriseId,  'Director',    'Rania Haddad',   'rania@sunriserelief.org',      '+961 76 500 100');
  const sunriseCon2  = await insertContact(sunriseId,  'Logistics',   'Elie Khoury',    'elie@sunriserelief.org',       '+961 71 600 200');
  const childrenCon  = await insertContact(childrenId, 'Manager',     'Nour Salameh',   'nour@childrensfuture.org',     '+961 70 700 300');
  const handsCon     = await insertContact(handsId,    'Coordinator', 'Maya Nassar',    'maya@handsinhand.org',         '+961 78 800 400');

  /* ── Donor Contacts ─────────────────────────────────────── */
  await insertContact(johnId,  'Personal', 'John Carter',   null,                   '+44 7700 900 123');
  await insertContact(johnId,  'Work',     'John Carter',   'j.carter@work.co.uk',  '+44 7700 900 456');
  await insertContact(sarahId, 'Personal', 'Sarah Dubois',  'sarah.d@mail.fr',      '+33 6 12 34 56 78');
  await insertContact(sarahId, 'NGO',      'Sarah Dubois',  'sarah@ngopartner.org', '+33 6 98 76 54 32');
  await insertContact(marcId,  'Personal', 'Marco Ricci',   'marco@example.it',     '+39 02 1234 5678');
  await insertContact(marcId,  'Business', 'Marco Ricci',   'marco@business.it',    '+39 02 9876 5432');

  /* ── Events (requests) ──────────────────────────────────── */

  // Hope Foundation events
  const e1 = await insertEvent({
    charity_id:     hopeId,
    title:          'Winter Food Drive 2026',
    category:       'Food',
    urgency:        'Critical',
    description:    'We are collecting non-perishable food items to support 200 displaced families through the winter months. Every unit counts.',
    event_date:     '2026-07-15 09:00:00',
    due_date:       '2026-07-10',
    required_units: 200,
    status:         'Approved',
    address_id:     hopeAddr1,
    contact_id:     hopeCon1,
  });

  const e2 = await insertEvent({
    charity_id:     hopeId,
    title:          'Medical Supplies for Refugees',
    category:       'Medical',
    urgency:        'Critical',
    description:    'Urgent need for basic medical supplies — bandages, antiseptics, oral rehydration salts, and analgesics — for refugee settlements.',
    event_date:     '2026-06-20 08:00:00',
    due_date:       '2026-06-15',
    required_units: 150,
    status:         'Approved',
    address_id:     hopeAddr2,
    contact_id:     hopeCon2,
  });

  const e3 = await insertEvent({
    charity_id:     hopeId,
    title:          'Warm Clothes Collection',
    category:       'Clothes',
    urgency:        'High',
    description:    'Collecting gently-used or new winter clothing for children and adults in underserved mountain villages.',
    event_date:     '2026-08-01 10:00:00',
    due_date:       '2026-07-28',
    required_units: 300,
    status:         'Approved',
    address_id:     hopeAddr1,
    contact_id:     hopeCon1,
  });

  const e4 = await insertEvent({
    charity_id:     hopeId,
    title:          'Emergency Shelter Fund',
    category:       'Money',
    urgency:        'Critical',
    description:    'Raising funds to provide temporary shelter for 30 families displaced by the recent flooding. Each unit represents one dollar.',
    event_date:     '2026-09-10 09:00:00',
    due_date:       '2026-09-05',
    required_units: 5000,
    status:         'Pending',
    address_id:     hopeAddr1,
    contact_id:     hopeCon1,
  });

  const e5 = await insertEvent({
    charity_id:     hopeId,
    title:          'School Supplies Drive',
    category:       'Clothes',
    urgency:        'Standard',
    description:    'Collecting backpacks, notebooks, and stationery for students returning to school in low-income areas.',
    event_date:     '2026-07-30 09:00:00',
    due_date:       '2026-07-25',
    required_units: 100,
    status:         'Rejected',
    address_id:     hopeAddr2,
    contact_id:     hopeCon2,
  });

  const e6 = await insertEvent({
    charity_id:     hopeId,
    title:          'Ramadan Food Baskets',
    category:       'Food',
    urgency:        'High',
    description:    'Preparing and distributing food baskets to low-income families to celebrate Ramadan with dignity.',
    event_date:     '2026-10-05 07:00:00',
    due_date:       '2026-09-30',
    required_units: 250,
    status:         'Approved',
    address_id:     hopeAddr1,
    contact_id:     hopeCon1,
  });

  // Green Living events
  const e7 = await insertEvent({
    charity_id:     greenId,
    title:          'Reusable Bags Giveaway',
    category:       'Clothes',
    urgency:        'Standard',
    description:    'Distributing 500 reusable cloth bags to market vendors and shoppers to reduce single-use plastic in local markets.',
    event_date:     '2026-06-30 10:00:00',
    due_date:       '2026-06-28',
    required_units: 500,
    status:         'Approved',
    address_id:     greenAddr,
    contact_id:     greenCon,
  });

  const e8 = await insertEvent({
    charity_id:     greenId,
    title:          'Community Kitchen Fund',
    category:       'Money',
    urgency:        'High',
    description:    'Raising funds to equip a community kitchen that will serve hot meals to 100 families every week.',
    event_date:     '2026-07-20 11:00:00',
    due_date:       '2026-07-15',
    required_units: 2000,
    status:         'Approved',
    address_id:     greenAddr2,
    contact_id:     greenCon,
  });

  const e9 = await insertEvent({
    charity_id:     greenId,
    title:          'Organic Food Baskets',
    category:       'Food',
    urgency:        'High',
    description:    'Distributing fresh organic produce baskets sourced from local farms to food-insecure households.',
    event_date:     '2026-08-15 08:00:00',
    due_date:       '2026-08-10',
    required_units: 120,
    status:         'Pending',
    address_id:     greenAddr,
    contact_id:     greenCon,
  });

  // Bridge of Hope events
  const e10 = await insertEvent({
    charity_id:     bridgeId,
    title:          'First Aid Kits Distribution',
    category:       'Medical',
    urgency:        'High',
    description:    'Providing first aid kits to remote villages that lack access to basic healthcare facilities.',
    event_date:     '2026-09-01 08:00:00',
    due_date:       '2026-08-28',
    required_units: 80,
    status:         'Approved',
    address_id:     bridgeAddr,
    contact_id:     bridgeCon,
  });

  const e11 = await insertEvent({
    charity_id:     bridgeId,
    title:          'Winter Coat Drive',
    category:       'Clothes',
    urgency:        'High',
    description:    'Collecting warm coats, gloves and scarves for Syrian refugee families in our network ahead of the cold season.',
    event_date:     '2026-11-15 09:00:00',
    due_date:       '2026-11-10',
    required_units: 400,
    status:         'Approved',
    address_id:     bridgeAddr,
    contact_id:     bridgeCon,
  });

  const e12 = await insertEvent({
    charity_id:     bridgeId,
    title:          'Emergency Relief Fund',
    category:       'Money',
    urgency:        'Critical',
    description:    'Immediate funding needed to respond to the earthquake aftermath — each unit is one dollar toward housing and food.',
    event_date:     '2026-06-10 07:00:00',
    due_date:       '2026-06-08',
    required_units: 10000,
    status:         'Approved',
    address_id:     bridgeAddr,
    contact_id:     bridgeCon,
  });

  console.log('[seed] 12 events created');

  /* ── Donations ──────────────────────────────────────────── */

  // e1: Winter Food Drive (Approved, 200 units) — well progressed
  await insertDonation(johnId,  e1, 30, 'I can bring 30 canned goods from my pantry.',    'Finalized', 'Home — 14 Maple Street, London',       '2026-07-08 10:00:00');
  await insertDonation(sarahId, e1, 50, 'Donating 50 units of rice and pasta.',           'Finalized', 'Home — 27 Rue des Fleurs, Paris',       '2026-07-09 09:00:00');
  await insertDonation(marcId,  e1, 40, 'Will deliver 40 units of canned vegetables.',    'Accepted',  'Depot — 44 Industrial Road, Turin',     '2026-07-10 11:00:00');
  await insertDonation(johnId,  e1, 20, 'Additional 20 units of cooking oil.',            'Pending',   'Office — 3 Tech Park Avenue, London',   '2026-07-10 14:00:00');
  await insertDonation(sarahId, e1, 10, 'Protein bars — 10 boxes.',                       'Rejected',  'Storage — 5 Dépôt Logistique, Versailles', '2026-07-07 08:30:00');

  // e2: Medical Supplies (Approved, 150 units) — fully met
  await insertDonation(johnId,  e2, 60, 'Bandages, antiseptic wipes, and gauze pads.',    'Finalized', 'Home — 14 Maple Street, London',       '2026-06-13 09:00:00');
  await insertDonation(sarahId, e2, 50, 'Oral rehydration salts and basic analgesics.',   'Finalized', 'Storage — 5 Dépôt Logistique, Versailles', '2026-06-14 10:00:00');
  await insertDonation(marcId,  e2, 25, 'Surgical gloves and face masks.',                'Accepted',  'Home — 9 Via Roma, Milan',              '2026-06-15 08:00:00');
  await insertDonation(johnId,  e2, 10, 'Thermometers and blood-pressure cuffs.',         'Rejected',  'Office — 3 Tech Park Avenue, London',   '2026-06-12 11:00:00');

  // e3: Warm Clothes (Approved, 300 units) — moderate progress
  await insertDonation(johnId,  e3, 60, '60 items — coats and sweaters, various sizes.',  'Accepted',  'Home — 14 Maple Street, London',        '2026-07-26 10:00:00');
  await insertDonation(sarahId, e3, 80, '80 items — children winter sets.',               'Pending',   'Home — 27 Rue des Fleurs, Paris',       '2026-07-27 09:30:00');
  await insertDonation(marcId,  e3, 30, '30 scarves and gloves.',                         'Pending',   'Depot — 44 Industrial Road, Turin',     '2026-07-28 08:00:00');
  await insertDonation(sarahId, e3, 20, '20 pairs of thermal socks.',                     'Cancelled', 'Storage — 5 Dépôt Logistique, Versailles', '2026-07-25 15:00:00');

  // e6: Ramadan Food Baskets (Approved, 250 units) — some progress
  await insertDonation(marcId,  e6, 40, 'Rice, lentils, and dried fruit.',                'Accepted',  'Home — 9 Via Roma, Milan',              '2026-09-28 09:00:00');
  await insertDonation(johnId,  e6, 30, 'Date boxes and cooking oils.',                   'Pending',   'Office — 3 Tech Park Avenue, London',   '2026-09-29 11:00:00');

  // e7: Reusable Bags (Approved, 500 units) — well done
  await insertDonation(johnId,  e7, 100, '100 cotton tote bags from my print shop.',      'Finalized', 'Office — 3 Tech Park Avenue, London',   '2026-06-26 10:00:00');
  await insertDonation(sarahId, e7, 150, '150 jute bags sourced locally.',                'Finalized', 'Storage — 5 Dépôt Logistique, Versailles', '2026-06-27 08:30:00');
  await insertDonation(marcId,  e7,  80, '80 woven bags.',                                'Accepted',  'Depot — 44 Industrial Road, Turin',     '2026-06-28 09:00:00');
  await insertDonation(johnId,  e7,  50, 'Additional 50 bags.',                           'Pending',   'Home — 14 Maple Street, London',        '2026-06-28 14:00:00');
  await insertDonation(sarahId, e7,  40, 'Printed fabric bags.',                          'Cancelled', 'Home — 27 Rue des Fleurs, Paris',       '2026-06-25 16:00:00');

  // e8: Community Kitchen Fund (Approved, 2000 units) — moderate
  await insertDonation(johnId,  e8, 500, 'Happy to contribute $500 to the kitchen.',      'Accepted',  'Home — 14 Maple Street, London',        '2026-07-13 10:00:00');
  await insertDonation(sarahId, e8, 300, '$300 donation for cooking supplies.',            'Accepted',  'Home — 27 Rue des Fleurs, Paris',       '2026-07-14 09:00:00');
  await insertDonation(marcId,  e8, 400, '$400 for refrigeration unit.',                  'Finalized', 'Home — 9 Via Roma, Milan',              '2026-07-12 11:00:00');
  await insertDonation(johnId,  e8, 200, 'Extra $200 for utensils.',                      'Cancelled', 'Office — 3 Tech Park Avenue, London',   '2026-07-11 15:00:00');
  await insertDonation(sarahId, e8, 150, '$150 for serving equipment.',                   'Pending',   'Storage — 5 Dépôt Logistique, Versailles', '2026-07-15 09:00:00');

  // e10: First Aid Kits (Approved, 80 units)
  await insertDonation(sarahId, e10, 20, '20 basic first-aid kits, factory sealed.',      'Accepted',  'Home — 27 Rue des Fleurs, Paris',       '2026-08-26 09:00:00');
  await insertDonation(marcId,  e10, 15, '15 wound care kits.',                           'Finalized', 'Depot — 44 Industrial Road, Turin',     '2026-08-25 10:00:00');
  await insertDonation(johnId,  e10, 10, '10 trauma bandage sets.',                       'Pending',   'Office — 3 Tech Park Avenue, London',   '2026-08-27 11:00:00');

  // e11: Winter Coat Drive (Approved, 400 units) — just started
  await insertDonation(johnId,  e11, 25, '25 adult winter coats, sizes M-XL.',            'Pending',   'Home — 14 Maple Street, London',        '2026-11-08 10:00:00');
  await insertDonation(sarahId, e11, 30, '30 children coats, ages 4-12.',                 'Pending',   'Storage — 5 Dépôt Logistique, Versailles', '2026-11-09 09:00:00');

  // e12: Emergency Relief Fund (Approved, 10000 units)
  await insertDonation(johnId,  e12, 1000, '$1,000 — please prioritise housing.',         'Finalized', 'Home — 14 Maple Street, London',        '2026-06-06 08:00:00');
  await insertDonation(sarahId, e12, 2500, '$2,500 — transfer confirmed.',                'Finalized', 'Home — 27 Rue des Fleurs, Paris',       '2026-06-07 09:00:00');
  await insertDonation(marcId,  e12, 1500, '$1,500 for food and water.',                  'Finalized', 'Home — 9 Via Roma, Milan',              '2026-06-06 11:00:00');
  await insertDonation(johnId,  e12,  500, 'Additional $500.',                            'Accepted',  'Office — 3 Tech Park Avenue, London',   '2026-06-07 14:00:00');
  await insertDonation(sarahId, e12,  250, '$250 emergency contribution.',                'Pending',   'Storage — 5 Dépôt Logistique, Versailles', '2026-06-08 10:00:00');

  /* ── Additional events: Sunrise Relief ─────────────────── */
  const e13 = await insertEvent({ charity_id: sunriseId, title: 'Mobile Clinic Supplies', category: 'Medical', urgency: 'Critical', description: 'Stocking our mobile clinic with essential medications, IV fluids, and wound care supplies to serve 500 patients per week in remote areas.', event_date: '2026-06-25 08:00:00', due_date: '2026-06-20', required_units: 300, status: 'Approved', address_id: sunriseAddr1, contact_id: sunriseCon1 });
  const e14 = await insertEvent({ charity_id: sunriseId, title: 'Emergency Food Parcels', category: 'Food', urgency: 'Critical', description: 'Assembling and distributing emergency food parcels for 150 displaced families with no other source of sustenance.', event_date: '2026-07-05 07:00:00', due_date: '2026-07-01', required_units: 150, status: 'Approved', address_id: sunriseAddr2, contact_id: sunriseCon2 });
  const e15 = await insertEvent({ charity_id: sunriseId, title: 'Winter Blanket Drive', category: 'Clothes', urgency: 'High', description: 'Collecting thick blankets and sleeping bags for families living in temporary shelters ahead of the cold season.', event_date: '2026-10-20 09:00:00', due_date: '2026-10-15', required_units: 200, status: 'Approved', address_id: sunriseAddr1, contact_id: sunriseCon1 });
  const e16 = await insertEvent({ charity_id: sunriseId, title: 'Clinic Equipment Fund', category: 'Money', urgency: 'High', description: 'Raising funds to purchase an ultrasound machine and portable generator for our field clinic. Each unit equals one dollar.', event_date: '2026-09-15 09:00:00', due_date: '2026-09-10', required_units: 8000, status: 'Approved', address_id: sunriseAddr1, contact_id: sunriseCon1 });
  const e17 = await insertEvent({ charity_id: sunriseId, title: 'Hygiene Kit Assembly', category: 'Medical', urgency: 'Standard', description: 'Putting together hygiene kits — soap, shampoo, toothbrush, sanitary pads — for 100 women in shelters.', event_date: '2026-08-10 10:00:00', due_date: '2026-08-05', required_units: 100, status: 'Pending', address_id: sunriseAddr2, contact_id: sunriseCon2 });
  const e18 = await insertEvent({ charity_id: sunriseId, title: 'Baby Formula Collection', category: 'Food', urgency: 'Critical', description: 'Urgent collection of infant formula and baby food for families with newborns in displacement camps.', event_date: '2026-06-18 08:00:00', due_date: '2026-06-15', required_units: 80, status: 'Approved', address_id: sunriseAddr1, contact_id: sunriseCon1 });
  const e19 = await insertEvent({ charity_id: sunriseId, title: 'Volunteer Medical Camp', category: 'Money', urgency: 'Standard', description: 'Funding transport and accommodation for 20 volunteer doctors travelling to run a three-day free medical camp.', event_date: '2026-11-01 08:00:00', due_date: '2026-10-28', required_units: 3000, status: 'Rejected', address_id: sunriseAddr2, contact_id: sunriseCon2 });

  /* ── Additional events: Children's Future Fund ──────────── */
  const e20 = await insertEvent({ charity_id: childrenId, title: 'School Bag Drive', category: 'Clothes', urgency: 'High', description: 'Providing fully stocked school bags to 200 underprivileged children so they can start the new academic year prepared.', event_date: '2026-08-25 09:00:00', due_date: '2026-08-20', required_units: 200, status: 'Approved', address_id: childrenAddr, contact_id: childrenCon });
  const e21 = await insertEvent({ charity_id: childrenId, title: 'Nutrition Program Launch', category: 'Food', urgency: 'Critical', description: 'Launching a daily hot-meal program for 300 malnourished children in partnership with local schools.', event_date: '2026-07-10 07:30:00', due_date: '2026-07-05', required_units: 300, status: 'Approved', address_id: childrenAddr, contact_id: childrenCon });
  const e22 = await insertEvent({ charity_id: childrenId, title: 'Children Library Fund', category: 'Money', urgency: 'Standard', description: 'Raising funds to build a reading room with books, tablets, and educational games for children aged 5–14.', event_date: '2026-09-20 10:00:00', due_date: '2026-09-15', required_units: 5000, status: 'Approved', address_id: childrenAddr, contact_id: childrenCon });
  const e23 = await insertEvent({ charity_id: childrenId, title: 'Winter Clothes for Kids', category: 'Clothes', urgency: 'High', description: "Collecting children's winter jackets, trousers, and shoes (sizes 3-14) for distribution before the cold season.", event_date: '2026-10-30 09:00:00', due_date: '2026-10-25', required_units: 250, status: 'Approved', address_id: childrenAddr, contact_id: childrenCon });
  const e24 = await insertEvent({ charity_id: childrenId, title: 'First Aid for Schools', category: 'Medical', urgency: 'Standard', description: 'Supplying 30 schools with fully stocked first aid kits and training one staff member per school in basic first aid.', event_date: '2026-08-30 10:00:00', due_date: '2026-08-25', required_units: 30, status: 'Pending', address_id: childrenAddr, contact_id: childrenCon });
  const e25 = await insertEvent({ charity_id: childrenId, title: 'Toy & Game Donation', category: 'Clothes', urgency: 'Standard', description: 'Collecting new or gently used toys, board games, and sports equipment to bring joy and activity to children in shelters.', event_date: '2026-12-10 10:00:00', due_date: '2026-12-05', required_units: 150, status: 'Approved', address_id: childrenAddr, contact_id: childrenCon });

  /* ── Additional events: Hands in Hand ──────────────────── */
  const e26 = await insertEvent({ charity_id: handsId, title: 'Shelter Kit Distribution', category: 'Clothes', urgency: 'Critical', description: 'Distributing emergency shelter kits — tarpaulin, rope, and ground sheet — to 60 families whose homes were damaged.', event_date: '2026-06-22 08:00:00', due_date: '2026-06-18', required_units: 60, status: 'Approved', address_id: handsAddr1, contact_id: handsCon });
  const e27 = await insertEvent({ charity_id: handsId, title: 'Clean Water Fund', category: 'Money', urgency: 'Critical', description: 'Funding the installation of two water purification units serving 1,000 people per day in underserved villages.', event_date: '2026-07-28 09:00:00', due_date: '2026-07-22', required_units: 6000, status: 'Approved', address_id: handsAddr2, contact_id: handsCon });
  const e28 = await insertEvent({ charity_id: handsId, title: 'Ramadan Iftar Tables', category: 'Food', urgency: 'High', description: 'Organising community Iftar tables for 500 people nightly throughout Ramadan with volunteers serving hot meals.', event_date: '2026-10-12 17:00:00', due_date: '2026-10-08', required_units: 500, status: 'Approved', address_id: handsAddr1, contact_id: handsCon });
  const e29 = await insertEvent({ charity_id: handsId, title: 'Elderly Care Packages', category: 'Food', urgency: 'High', description: 'Delivering monthly care packages — food, medicine, and personal hygiene items — to 80 isolated elderly individuals.', event_date: '2026-08-05 09:00:00', due_date: '2026-08-01', required_units: 80, status: 'Approved', address_id: handsAddr2, contact_id: handsCon });
  const e30 = await insertEvent({ charity_id: handsId, title: 'Volunteer Medic Training', category: 'Money', urgency: 'Standard', description: 'Funding a two-day first responder training course for 40 community volunteers — equipment, instructors, and certification.', event_date: '2026-09-05 09:00:00', due_date: '2026-09-01', required_units: 2500, status: 'Approved', address_id: handsAddr1, contact_id: handsCon });
  const e31 = await insertEvent({ charity_id: handsId, title: 'Flood Relief Supplies', category: 'Medical', urgency: 'Critical', description: 'Responding to recent flooding — distributing clean water, oral rehydration salts, antiseptic kits, and rubber boots.', event_date: '2026-06-12 07:00:00', due_date: '2026-06-10', required_units: 120, status: 'Approved', address_id: handsAddr2, contact_id: handsCon });
  const e32 = await insertEvent({ charity_id: handsId, title: 'Back-to-School Stationary', category: 'Clothes', urgency: 'Standard', description: 'Collecting pens, notebooks, rulers, and art supplies for 300 students in public schools across the region.', event_date: '2026-08-28 10:00:00', due_date: '2026-08-22', required_units: 300, status: 'Pending', address_id: handsAddr1, contact_id: handsCon });

  /* ── Extra events from existing charities ───────────────── */
  const e33 = await insertEvent({ charity_id: hopeId, title: 'Diabetic Supplies Drive', category: 'Medical', urgency: 'High', description: 'Collecting glucometers, test strips, and insulin syringes for 50 diabetic patients who cannot afford supplies.', event_date: '2026-07-22 09:00:00', due_date: '2026-07-18', required_units: 50, status: 'Approved', address_id: hopeAddr1, contact_id: hopeCon1 });
  const e34 = await insertEvent({ charity_id: greenId, title: 'Solar Lamp Collection', category: 'Money', urgency: 'Standard', description: 'Raising funds to purchase solar-powered lanterns for 100 households with no reliable electricity access.', event_date: '2026-09-25 10:00:00', due_date: '2026-09-20', required_units: 1500, status: 'Approved', address_id: greenAddr, contact_id: greenCon });
  const e35 = await insertEvent({ charity_id: bridgeId, title: 'Trauma Support Fund', category: 'Money', urgency: 'High', description: 'Funding ten weekly group therapy sessions for 30 conflict-affected adults, run by licensed psychologists.', event_date: '2026-10-08 10:00:00', due_date: '2026-10-03', required_units: 4000, status: 'Approved', address_id: bridgeAddr, contact_id: bridgeCon });
  const e36 = await insertEvent({ charity_id: sunriseId, title: 'Prosthetics Funding Drive', category: 'Money', urgency: 'Critical', description: 'Raising funds to cover the cost of prosthetic limbs and rehabilitation for 5 mine-injury survivors.', event_date: '2026-11-20 09:00:00', due_date: '2026-11-15', required_units: 12000, status: 'Approved', address_id: sunriseAddr1, contact_id: sunriseCon1 });
  const e37 = await insertEvent({ charity_id: childrenId, title: 'Summer Camp Sponsorship', category: 'Money', urgency: 'Standard', description: 'Sponsoring 50 children for a week-long educational summer camp with sports, arts, and STEM activities.', event_date: '2026-07-18 08:00:00', due_date: '2026-07-12', required_units: 2500, status: 'Approved', address_id: childrenAddr, contact_id: childrenCon });

  console.log('[seed] 37 events created');

  /* ── Donations for new events ───────────────────────────── */

  // e13: Mobile Clinic Supplies (Approved, 300 units)
  await insertDonation(johnId,  e13,  80, 'Bandages, gloves, and antiseptic solution.',         'Finalized', 'Home — 14 Maple Street, London',        '2026-06-18 09:00:00');
  await insertDonation(sarahId, e13,  60, 'IV bags and saline solution.',                        'Finalized', 'Home — 27 Rue des Fleurs, Paris',       '2026-06-19 10:00:00');
  await insertDonation(marcId,  e13,  50, 'Wound care kits and sterile gauze.',                  'Accepted',  'Depot — 44 Industrial Road, Turin',     '2026-06-20 08:30:00');
  await insertDonation(johnId,  e13,  40, 'Paracetamol and antibiotic packs.',                   'Pending',   'Office — 3 Tech Park Avenue, London',   '2026-06-20 14:00:00');

  // e14: Emergency Food Parcels (Approved, 150 units)
  await insertDonation(sarahId, e14,  50, 'Rice, canned goods, and lentils.',                    'Finalized', 'Storage — 5 Dépôt Logistique, Versailles', '2026-06-29 09:00:00');
  await insertDonation(marcId,  e14,  40, 'Cooking oil, pasta, and sugar.',                      'Finalized', 'Home — 9 Via Roma, Milan',              '2026-06-30 10:00:00');
  await insertDonation(johnId,  e14,  30, 'Dried fruit and protein bars.',                       'Accepted',  'Home — 14 Maple Street, London',        '2026-07-01 08:00:00');

  // e15: Winter Blanket Drive (Approved, 200 units)
  await insertDonation(johnId,  e15,  60, '60 thick wool blankets.',                             'Accepted',  'Office — 3 Tech Park Avenue, London',   '2026-10-13 10:00:00');
  await insertDonation(sarahId, e15,  50, '50 sleeping bags, all-season.',                       'Pending',   'Home — 27 Rue des Fleurs, Paris',       '2026-10-14 09:00:00');
  await insertDonation(marcId,  e15,  30, '30 fleece blankets.',                                 'Pending',   'Depot — 44 Industrial Road, Turin',     '2026-10-15 08:00:00');

  // e16: Clinic Equipment Fund (Approved, 8000 units)
  await insertDonation(johnId,  e16, 2000, '$2,000 toward the ultrasound machine.',              'Finalized', 'Home — 14 Maple Street, London',        '2026-09-08 09:00:00');
  await insertDonation(sarahId, e16, 1500, '$1,500 for the portable generator.',                 'Finalized', 'Home — 27 Rue des Fleurs, Paris',       '2026-09-09 10:00:00');
  await insertDonation(marcId,  e16, 1000, '$1,000 contribution.',                               'Accepted',  'Home — 9 Via Roma, Milan',              '2026-09-10 11:00:00');
  await insertDonation(johnId,  e16,  500, 'Additional $500.',                                   'Pending',   'Office — 3 Tech Park Avenue, London',   '2026-09-10 14:00:00');

  // e18: Baby Formula (Approved, 80 units)
  await insertDonation(sarahId, e18,  30, 'Infant formula tins (0–6 months).',                  'Finalized', 'Storage — 5 Dépôt Logistique, Versailles', '2026-06-13 09:00:00');
  await insertDonation(marcId,  e18,  25, 'Baby food jars and cereal.',                          'Finalized', 'Home — 9 Via Roma, Milan',              '2026-06-14 10:00:00');
  await insertDonation(johnId,  e18,  15, 'Follow-on formula (6–12 months).',                   'Accepted',  'Home — 14 Maple Street, London',        '2026-06-15 08:00:00');

  // e20: School Bag Drive (Approved, 200 units)
  await insertDonation(johnId,  e20,  60, '60 fully stocked school bags.',                       'Accepted',  'Office — 3 Tech Park Avenue, London',   '2026-08-18 10:00:00');
  await insertDonation(sarahId, e20,  70, '70 bags with stationery sets.',                       'Pending',   'Home — 27 Rue des Fleurs, Paris',       '2026-08-19 09:00:00');
  await insertDonation(marcId,  e20,  40, '40 bags — mixed primary and secondary.',              'Pending',   'Depot — 44 Industrial Road, Turin',     '2026-08-20 08:00:00');

  // e21: Nutrition Program (Approved, 300 units)
  await insertDonation(sarahId, e21, 100, 'Monthly meal sponsorship for 100 children.',          'Finalized', 'Home — 27 Rue des Fleurs, Paris',       '2026-07-03 09:00:00');
  await insertDonation(johnId,  e21,  80, 'Rice, lentils, and vegetables for one month.',        'Finalized', 'Home — 14 Maple Street, London',        '2026-07-04 10:00:00');
  await insertDonation(marcId,  e21,  60, 'Dried food supplies.',                                'Accepted',  'Home — 9 Via Roma, Milan',              '2026-07-05 08:00:00');
  await insertDonation(johnId,  e21,  30, 'Additional protein-rich foods.',                      'Pending',   'Office — 3 Tech Park Avenue, London',   '2026-07-05 14:00:00');

  // e22: Library Fund (Approved, 5000 units)
  await insertDonation(marcId,  e22, 1500, '$1,500 for tablets and e-readers.',                  'Finalized', 'Home — 9 Via Roma, Milan',              '2026-09-13 09:00:00');
  await insertDonation(sarahId, e22, 1000, '$1,000 for bookshelves and furniture.',              'Accepted',  'Storage — 5 Dépôt Logistique, Versailles', '2026-09-14 10:00:00');
  await insertDonation(johnId,  e22,  800, '$800 for a book collection.',                        'Pending',   'Home — 14 Maple Street, London',        '2026-09-15 11:00:00');

  // e23: Winter Clothes for Kids (Approved, 250 units)
  await insertDonation(johnId,  e23,  80, "80 children's winter jackets.",                        'Accepted',  'Office — 3 Tech Park Avenue, London',   '2026-10-23 10:00:00');
  await insertDonation(sarahId, e23,  60, "60 pairs of kids' winter trousers.",                   'Pending',   'Home — 27 Rue des Fleurs, Paris',       '2026-10-24 09:00:00');
  await insertDonation(marcId,  e23,  40, '40 pairs of warm boots.',                             'Pending',   'Depot — 44 Industrial Road, Turin',     '2026-10-25 08:00:00');

  // e25: Toy Drive (Approved, 150 units)
  await insertDonation(sarahId, e25,  50, 'Board games and puzzles.',                            'Accepted',  'Home — 27 Rue des Fleurs, Paris',       '2026-12-03 09:00:00');
  await insertDonation(johnId,  e25,  40, 'Sports equipment — footballs and jump ropes.',        'Pending',   'Home — 14 Maple Street, London',        '2026-12-04 10:00:00');
  await insertDonation(marcId,  e25,  30, 'Art and craft sets.',                                 'Pending',   'Depot — 44 Industrial Road, Turin',     '2026-12-05 08:00:00');

  // e26: Shelter Kits (Approved, 60 units)
  await insertDonation(johnId,  e26,  25, '25 shelter kits — tarpaulin and rope.',               'Finalized', 'Home — 14 Maple Street, London',        '2026-06-16 09:00:00');
  await insertDonation(sarahId, e26,  20, '20 ground sheets and waterproof covers.',             'Finalized', 'Home — 27 Rue des Fleurs, Paris',       '2026-06-17 10:00:00');
  await insertDonation(marcId,  e26,  10, '10 complete shelter kits.',                           'Accepted',  'Home — 9 Via Roma, Milan',              '2026-06-18 08:00:00');

  // e27: Clean Water Fund (Approved, 6000 units)
  await insertDonation(sarahId, e27, 2000, '$2,000 for first purification unit.',                'Finalized', 'Storage — 5 Dépôt Logistique, Versailles', '2026-07-20 09:00:00');
  await insertDonation(johnId,  e27, 1500, '$1,500 for piping and installation.',                'Finalized', 'Home — 14 Maple Street, London',        '2026-07-21 10:00:00');
  await insertDonation(marcId,  e27,  800, '$800 contribution.',                                 'Accepted',  'Home — 9 Via Roma, Milan',              '2026-07-22 09:00:00');
  await insertDonation(sarahId, e27,  500, 'Additional $500 for consumables.',                   'Pending',   'Home — 27 Rue des Fleurs, Paris',       '2026-07-22 14:00:00');

  // e28: Ramadan Iftar (Approved, 500 units)
  await insertDonation(johnId,  e28, 150, 'Rice and lentils for 150 servings.',                  'Accepted',  'Office — 3 Tech Park Avenue, London',   '2026-10-06 09:00:00');
  await insertDonation(marcId,  e28, 100, 'Bread, olives, and dates.',                           'Pending',   'Home — 9 Via Roma, Milan',              '2026-10-07 10:00:00');
  await insertDonation(sarahId, e28,  80, 'Cooking oil and canned goods.',                       'Pending',   'Home — 27 Rue des Fleurs, Paris',       '2026-10-08 08:00:00');

  // e29: Elderly Care (Approved, 80 units)
  await insertDonation(sarahId, e29,  30, '30 care packages — food and hygiene items.',          'Finalized', 'Home — 27 Rue des Fleurs, Paris',       '2026-07-30 09:00:00');
  await insertDonation(johnId,  e29,  25, '25 packages with medical supplies included.',         'Accepted',  'Home — 14 Maple Street, London',        '2026-07-31 10:00:00');
  await insertDonation(marcId,  e29,  15, '15 additional care packages.',                        'Pending',   'Depot — 44 Industrial Road, Turin',     '2026-08-01 08:00:00');

  // e30: Medic Training Fund (Approved, 2500 units)
  await insertDonation(johnId,  e30,  800, '$800 for instructor fees.',                          'Accepted',  'Home — 14 Maple Street, London',        '2026-08-30 09:00:00');
  await insertDonation(marcId,  e30,  600, '$600 for training equipment.',                       'Accepted',  'Home — 9 Via Roma, Milan',              '2026-08-31 10:00:00');
  await insertDonation(sarahId, e30,  400, '$400 for certification materials.',                  'Pending',   'Home — 27 Rue des Fleurs, Paris',       '2026-09-01 11:00:00');

  // e31: Flood Relief (Approved, 120 units)
  await insertDonation(sarahId, e31,  40, 'Oral rehydration salts and water purification tabs.', 'Finalized', 'Storage — 5 Dépôt Logistique, Versailles', '2026-06-08 08:00:00');
  await insertDonation(johnId,  e31,  35, 'Antiseptic kits and rubber boots.',                   'Finalized', 'Home — 14 Maple Street, London',        '2026-06-09 09:00:00');
  await insertDonation(marcId,  e31,  25, 'Clean water bottles and chlorine tablets.',           'Accepted',  'Depot — 44 Industrial Road, Turin',     '2026-06-10 07:30:00');

  // e33: Diabetic Supplies (Approved, 50 units)
  await insertDonation(johnId,  e33,  20, 'Glucometers and test strips.',                        'Accepted',  'Office — 3 Tech Park Avenue, London',   '2026-07-16 10:00:00');
  await insertDonation(sarahId, e33,  15, 'Insulin syringes and lancets.',                       'Pending',   'Home — 27 Rue des Fleurs, Paris',       '2026-07-17 09:00:00');

  // e34: Solar Lamp Fund (Approved, 1500 units)
  await insertDonation(marcId,  e34,  500, '$500 for 10 solar lanterns.',                        'Accepted',  'Home — 9 Via Roma, Milan',              '2026-09-18 09:00:00');
  await insertDonation(johnId,  e34,  300, '$300 contribution.',                                 'Pending',   'Home — 14 Maple Street, London',        '2026-09-19 10:00:00');

  // e35: Trauma Support Fund (Approved, 4000 units)
  await insertDonation(sarahId, e35, 1200, '$1,200 for therapist fees.',                         'Accepted',  'Storage — 5 Dépôt Logistique, Versailles', '2026-10-01 09:00:00');
  await insertDonation(johnId,  e35,  800, '$800 for session materials.',                        'Pending',   'Home — 14 Maple Street, London',        '2026-10-02 10:00:00');

  // e36: Prosthetics Fund (Approved, 12000 units)
  await insertDonation(marcId,  e36, 3000, '$3,000 — covering one full prosthetic.',             'Accepted',  'Home — 9 Via Roma, Milan',              '2026-11-13 09:00:00');
  await insertDonation(sarahId, e36, 2000, '$2,000 for rehabilitation sessions.',                'Pending',   'Home — 27 Rue des Fleurs, Paris',       '2026-11-14 10:00:00');

  // e37: Summer Camp (Approved, 2500 units)
  await insertDonation(johnId,  e37,  800, '$800 — sponsoring 16 children.',                    'Finalized', 'Home — 14 Maple Street, London',        '2026-07-10 09:00:00');
  await insertDonation(sarahId, e37,  600, '$600 for activities and materials.',                 'Finalized', 'Storage — 5 Dépôt Logistique, Versailles', '2026-07-11 10:00:00');
  await insertDonation(marcId,  e37,  400, '$400 additional sponsorship.',                       'Accepted',  'Home — 9 Via Roma, Milan',              '2026-07-12 09:00:00');
  await insertDonation(johnId,  e37,  200, 'Extra $200 for transport.',                          'Pending',   'Office — 3 Tech Park Avenue, London',   '2026-07-12 14:00:00');

  console.log('[seed] donations created');
  console.log('[seed] ─────────────────────────────────────────────');
  console.log(`[seed] Demo accounts (all password: ${DEMO_PASSWORD})`);
  console.log('[seed]   Admin    →  username: admin             pw: ' + ADMIN_PASSWORD);
  console.log('[seed]   Charity  →  username: hopefoundation');
  console.log('[seed]   Charity  →  username: greenliving');
  console.log('[seed]   Charity  →  username: bridgeofhope');
  console.log('[seed]   Charity  →  username: sunriserelief');
  console.log('[seed]   Charity  →  username: childrensfuture');
  console.log('[seed]   Charity  →  username: handsinhand');
  console.log('[seed]   Donor    →  username: john_donor');
  console.log('[seed]   Donor    →  username: sarah_d');
  console.log('[seed]   Donor    →  username: marc_gives');
  console.log('[seed] ─────────────────────────────────────────────');
}

/* ── Helpers ────────────────────────────────────────────────── */

async function insertUser({ username, password, charity_name = null, charity_description = null }, roleId) {
  const [result] = await pool.execute(
    'INSERT INTO users (username, password, charity_name, charity_description) VALUES (?, ?, ?, ?)',
    [username, password, charity_name, charity_description]
  );
  await pool.execute(
    'INSERT INTO user_roles (user_id, role_id) VALUES (?, ?)',
    [result.insertId, roleId]
  );
  return result.insertId;
}

async function insertAddress(userId, label, street, city, state, zip, country) {
  const [result] = await pool.execute(
    'INSERT INTO user_addresses (user_id, label, street, city, state, zip, country) VALUES (?, ?, ?, ?, ?, ?, ?)',
    [userId, label, street, city, state, zip, country]
  );
  return result.insertId;
}

async function insertContact(userId, label, name, email, phone) {
  const [result] = await pool.execute(
    'INSERT INTO user_contacts (user_id, label, name, email, phone) VALUES (?, ?, ?, ?, ?)',
    [userId, label, name, email, phone]
  );
  return result.insertId;
}

async function insertEvent({ charity_id, title, category, urgency, description, event_date, due_date, required_units, status, address_id, contact_id }) {
  const [result] = await pool.execute(
    `INSERT INTO requests
       (charity_id, title, category, urgency, description, event_date, due_date, required_units, status, address_id, contact_id)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [charity_id, title, category, urgency, description, event_date, due_date, required_units, status, address_id, contact_id]
  );
  return result.insertId;
}

async function insertDonation(userId, requestId, donatedUnits, description, status, pickupAddress = null, pickupDatetime = null) {
  await pool.execute(
    `INSERT INTO donations (user_id, request_id, donated_units, description, donation_date, status, pickup_address, pickup_datetime)
     VALUES (?, ?, ?, ?, CURDATE(), ?, ?, ?)`,
    [userId, requestId, donatedUnits, description, status, pickupAddress, pickupDatetime]
  );
}

module.exports = seed;

if (require.main === module) {
  seed()
    .then(() => { console.log('[seed] done'); process.exit(0); })
    .catch(err => { console.error('[seed] error:', err); process.exit(1); });
}
