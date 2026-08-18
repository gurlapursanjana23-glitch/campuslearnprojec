/**
 * fix-arjun-attendance-low.js
 * 
 * Sets Arjun Mehta's attendance to LOW (below 75%) across his enrolled courses
 * so that the 75% shortage alert correctly triggers for him.
 * 
 * Run: node fix-arjun-attendance-low.js
 */
require('dotenv').config({ path: '/Users/zameerabdulkalamnagaral/didiii/campuslearn/backend/.env' });
const mongoose = require('mongoose');
const User = require('./models/User');
const Course = require('./models/Course');
const Attendance = require('./models/Attendance');
const Notification = require('./models/Notification');
const AttendanceAlert = require('./models/AttendanceAlert');

const REQUIRED_PCT = 75;

mongoose.connect(process.env.MONGODB_URI).then(async () => {
  console.log('✅ Connected to MongoDB');

  try {
    // Find Arjun
    const arjun = await User.findOne({ name: 'Arjun Mehta' });
    if (!arjun) {
      console.error('❌ Arjun Mehta not found in database!');
      process.exit(1);
    }
    console.log(`✅ Found Arjun: ${arjun._id} (${arjun.email})`);

    // Find his enrolled courses (or all courses if not set)
    let courses = [];
    if (arjun.enrolledCourses && arjun.enrolledCourses.length > 0) {
      courses = await Course.find({ _id: { $in: arjun.enrolledCourses } }, '_id title');
    }
    if (courses.length === 0) {
      courses = await Course.find({}, '_id title').limit(4);
    }
    console.log(`📚 Found ${courses.length} courses for Arjun`);

    // For each course, check existing attendance and add low attendance records
    // Target: ~60% attendance (below 75% threshold)
    for (const course of courses) {
      // Check existing records
      const existingRecords = await Attendance.find({ course: course._id });
      let arjunPresent = 0;
      let arjunTotal = 0;

      for (const rec of existingRecords) {
        const entry = rec.records.find(r => String(r.student) === String(arjun._id));
        if (entry) {
          arjunTotal++;
          if (entry.status === 'present') arjunPresent++;
        }
      }

      console.log(`  Course: "${course.title}" — Current: ${arjunPresent}/${arjunTotal} (${arjunTotal > 0 ? Math.round(arjunPresent/arjunTotal*100) : 'N/A'}%)`);

      // If no records exist, create some with low attendance
      if (arjunTotal === 0) {
        const today = new Date();
        // Create 10 classes: Arjun present for 5 (50%)
        for (let i = 0; i < 10; i++) {
          const classDate = new Date(today);
          classDate.setDate(today.getDate() - (10 - i));

          const existing = await Attendance.findOne({ course: course._id, date: classDate });
          if (!existing) {
            await Attendance.create({
              course: course._id,
              faculty: arjun._id, // placeholder
              date: classDate,
              topic: `Class ${i + 1}`,
              records: [{
                student: arjun._id,
                status: i < 5 ? 'present' : 'absent', // 5 present, 5 absent = 50%
              }],
            });
          }
        }
        console.log(`    ➕ Created 10 attendance records (5 present, 5 absent = 50%) for "${course.title}"`);
      } else if (arjunTotal > 0 && Math.round(arjunPresent / arjunTotal * 100) >= REQUIRED_PCT) {
        console.log(`    ⚠️  Arjun has ${Math.round(arjunPresent/arjunTotal*100)}% — above threshold. Adding absences to bring below 75%...`);
        // Add absent records to bring him below threshold
        const today = new Date();
        for (let i = 0; i < 5; i++) {
          const classDate = new Date(today);
          classDate.setDate(today.getDate() - i - 1);
          const existing = await Attendance.findOne({ course: course._id, date: classDate });
          if (!existing) {
            await Attendance.create({
              course: course._id,
              faculty: arjun._id,
              date: classDate,
              topic: `Extra Class ${i + 1}`,
              records: [{ student: arjun._id, status: 'absent' }],
            });
          }
        }
        console.log(`    ➕ Added 5 absent records for "${course.title}"`);
      }
    }

    // Clear old stale notifications for Arjun (especially false 100% ones)
    await Notification.deleteMany({ recipient: arjun._id, type: 'attendance' });
    console.log('🗑️  Cleared old attendance notifications for Arjun');

    // Clear old AttendanceAlerts for Arjun
    await AttendanceAlert.deleteMany({ student: arjun._id });
    console.log('🗑️  Cleared old attendance alerts for Arjun');

    // Now send fresh correct alerts
    const freshCourses = courses;
    let sent = 0;

    for (const course of freshCourses) {
      const records = await Attendance.find({ course: course._id });
      let present = 0, total = 0;

      for (const rec of records) {
        const entry = rec.records.find(r => String(r.student) === String(arjun._id));
        if (entry) {
          total++;
          if (entry.status === 'present') present++;
        }
      }

      if (total === 0) continue;

      const pct = Math.round((present / total) * 100);
      console.log(`  📊 "${course.title}": ${present}/${total} = ${pct}%`);

      if (pct < REQUIRED_PCT) {
        const needed = Math.ceil((REQUIRED_PCT * total - present * 100) / (100 - REQUIRED_PCT));
        const alertLevel = pct < 70 ? 'CRITICAL' : 'WARNING';

        await Notification.create({
          recipient: arjun._id,
          title: `⚠️ Attendance ${alertLevel}: ${course.title}`,
          message: `Your attendance in "${course.title}" is ${pct}% — below the required ${REQUIRED_PCT}%. You need to attend ${needed} more class${needed !== 1 ? 'es' : ''} to avoid shortage.`,
          type: 'attendance',
          isRead: false,
        });

        await AttendanceAlert.create({
          student: arjun._id,
          subject: course.title,
          currentPercentage: pct,
          requiredPercentage: REQUIRED_PCT,
          riskLevel: alertLevel === 'CRITICAL' ? 'CRITICAL' : 'SHORTAGE RISK',
          message: `Attend ${needed} more class${needed !== 1 ? 'es' : ''} to reach ${REQUIRED_PCT}%`,
          isRead: false,
        });

        sent++;
        console.log(`    ✅ Sent ${alertLevel} alert for "${course.title}" (${pct}%)`);
      } else {
        console.log(`    ✅ "${course.title}" is above ${REQUIRED_PCT}% — no alert needed`);
      }
    }

    console.log(`\n🎉 Done! Sent ${sent} attendance shortage alerts for Arjun Mehta.`);
    console.log('   Arjun will now see the ⚠️ shortage notification in his attendance page.');

  } catch (err) {
    console.error('❌ Error:', err.message);
  }

  process.exit(0);
});
