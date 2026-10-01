<script lang="ts">
  import { onMount } from 'svelte';

  interface Song {
    id: string;
    title: string;
    artist: string;
    status: 'learning' | 'polishing' | 'mastered';
    targetBpm: number;
    notes: string;
  }

  interface Student {
    id: string;
    name: string;
    level: 'Beginner' | 'Intermediate' | 'Advanced';
    currentFocus: string;
    lessonDay: string;
    skills: {
      openChords: number; // 1 to 5
      barreChords: number;
      alternatePicking: number;
      pentatonicSoloing: number;
      rhythmSubdivision: number;
    };
    repertoire: Song[];
    currentAssignment: {
      exercise: string;
      targetBpm: number;
      minutesPerDay: number;
      teacherNote: string;
    };
  }

  const DEFAULT_STUDENTS: Student[] = [
    {
      id: 'student-1',
      name: 'Alex Rivera',
      level: 'Intermediate',
      currentFocus: 'F Major Barre Chord & Minor Pentatonic Box 1',
      lessonDay: 'Tuesdays 4:30 PM',
      skills: {
        openChords: 5,
        barreChords: 3,
        alternatePicking: 4,
        pentatonicSoloing: 3,
        rhythmSubdivision: 4
      },
      repertoire: [
        { id: '1', title: 'Wish You Were Here', artist: 'Pink Floyd', status: 'mastered', targetBpm: 65, notes: 'Intro 12-string acoustic riff passed' },
        { id: '2', title: 'Blackbird', artist: 'The Beatles', status: 'polishing', targetBpm: 92, notes: 'Fingerpicking pattern clean, smooth out fret 10-12 jump' },
        { id: '3', title: 'Sultans of Swing', artist: 'Dire Straits', status: 'learning', targetBpm: 148, notes: 'First solo measures 1-8' }
      ],
      currentAssignment: {
        exercise: 'F Major Barre Chord Transition Drill (Am -> F -> C -> G)',
        targetBpm: 80,
        minutesPerDay: 20,
        teacherNote: 'Focus on thumb placement behind the neck at fret 2 to generate clamp leverage without wrist strain.'
      }
    },
    {
      id: 'student-2',
      name: 'Maya Chen',
      level: 'Beginner',
      currentFocus: 'Clean Open Chords & Strumming Dynamics',
      lessonDay: 'Thursdays 5:00 PM',
      skills: {
        openChords: 4,
        barreChords: 1,
        alternatePicking: 2,
        pentatonicSoloing: 1,
        rhythmSubdivision: 3
      },
      repertoire: [
        { id: '4', title: 'Stand By Me', artist: 'Ben E. King', status: 'mastered', targetBpm: 118, notes: 'Bassline and chords solid' },
        { id: '5', title: 'Knockin on Heaven\'s Door', artist: 'Bob Dylan', status: 'polishing', targetBpm: 70, notes: 'Keep strumming wrist relaxed' }
      ],
      currentAssignment: {
        exercise: 'Quarter note downstrokes with clean C to G change',
        targetBpm: 72,
        minutesPerDay: 15,
        teacherNote: 'Anchor the ring finger when changing between G and Cadd9.'
      }
    }
  ];

  let students = $state<Student[]>([]);
  let selectedStudentId = $state<string>('student-1');

  // New Student modal / form
  let newStudentName = $state('');
  let newStudentLevel = $state<'Beginner' | 'Intermediate' | 'Advanced'>('Beginner');

  // New Song
  let newSongTitle = $state('');
  let newSongArtist = $state('');

  let activeStudent = $derived(
    students.find((s) => s.id === selectedStudentId) || students[0]
  );

  function selectStudent(id: string) {
    selectedStudentId = id;
  }

  function addStudent() {
    if (!newStudentName.trim()) return;
    const s: Student = {
      id: `student-${Date.now()}`,
      name: newStudentName.trim(),
      level: newStudentLevel,
      currentFocus: 'Fundamentals',
      lessonDay: 'Weekly',
      skills: { openChords: 1, barreChords: 1, alternatePicking: 1, pentatonicSoloing: 1, rhythmSubdivision: 1 },
      repertoire: [],
      currentAssignment: {
        exercise: 'Practice daily 15 mins',
        targetBpm: 70,
        minutesPerDay: 15,
        teacherNote: 'Keep fretting fingers curved.'
      }
    };
    students = [...students, s];
    selectedStudentId = s.id;
    newStudentName = '';
    saveToStorage();
  }

  function addSongToRepertoire() {
    if (!newSongTitle.trim() || !activeStudent) return;
    const song: Song = {
      id: Date.now().toString(),
      title: newSongTitle.trim(),
      artist: newSongArtist.trim() || 'Traditional',
      status: 'learning',
      targetBpm: 90,
      notes: 'Assigned today'
    };
    activeStudent.repertoire = [...activeStudent.repertoire, song];
    newSongTitle = '';
    newSongArtist = '';
    saveToStorage();
  }

  function toggleSongStatus(songId: string) {
    if (!activeStudent) return;
    activeStudent.repertoire = activeStudent.repertoire.map((s) => {
      if (s.id !== songId) return s;
      const nextStatus = s.status === 'learning' ? 'polishing' : s.status === 'polishing' ? 'mastered' : 'learning';
      return { ...s, status: nextStatus };
    });
    saveToStorage();
  }

  function removeSong(songId: string) {
    if (!activeStudent) return;
    activeStudent.repertoire = activeStudent.repertoire.filter((s) => s.id !== songId);
    saveToStorage();
  }

  function saveToStorage() {
    try {
      localStorage.setItem('guitar_teacher_students', JSON.stringify(students));
    } catch {}
  }

  function printAssignmentSheet() {
    window.print();
  }

  onMount(() => {
    try {
      const saved = localStorage.getItem('guitar_teacher_students');
      if (saved) {
        students = JSON.parse(saved);
      } else {
        students = DEFAULT_STUDENTS;
      }
    } catch {
      students = DEFAULT_STUDENTS;
    }
  });
</script>

<svelte:head>
  <title>Student Repertoire & Progress Roadmap | Guitar Toolkit</title>
  <meta
    name="description"
    content="Private guitar instructor dashboard. Track student repertoire, skill proficiencies, weekly lesson homework assignments, and printable practice cards."
  />
</svelte:head>

<div class="tool-container">
  <div class="tool-header no-print">
    <div class="breadcrumbs">
      <a href="/">Toolkit Home</a> &rsaquo; <span>Teaching & Learning</span>
    </div>
    <div class="badge-row">
      <span class="badge badge-accent">#119 Teacher Studio</span>
      <span class="badge">Multi-Student Roster</span>
      <span class="badge">Printable Homework Sheet</span>
    </div>
    <h1>🎓 Student Repertoire & Progress Roadmap</h1>
    <p class="tool-sub">
      A clean, privacy-first studio dashboard for private guitar teachers. Manage student rosters, repertoire milestones (Learning &rarr; Mastered), technique proficiency bars, and printable weekly practice homework.
    </p>
  </div>

  <!-- Student Roster Selector -->
  <div class="roster-bar no-print">
    <div class="roster-chips">
      {#each students as student}
        <button
          type="button"
          class="student-chip"
          class:active={student.id === selectedStudentId}
          onclick={() => selectStudent(student.id)}
        >
          <span class="chip-name">{student.name}</span>
          <span class="chip-badge">{student.level}</span>
        </button>
      {/each}
    </div>

    <!-- Quick Add Student Form -->
    <div class="add-student-row">
      <input
        type="text"
        placeholder="New student name..."
        bind:value={newStudentName}
      />
      <select bind:value={newStudentLevel}>
        <option value="Beginner">Beginner</option>
        <option value="Intermediate">Intermediate</option>
        <option value="Advanced">Advanced</option>
      </select>
      <button type="button" class="add-btn" onclick={addStudent}>+ Add Student</button>
    </div>
  </div>

  {#if activeStudent}
    <!-- Active Student Profile -->
    <div class="student-profile-card">
      <div class="profile-top">
        <div>
          <h2>{activeStudent.name}</h2>
          <span class="lesson-meta">Level: <strong>{activeStudent.level}</strong> &bull; Slot: {activeStudent.lessonDay}</span>
          <div class="focus-bar">
            Current Focus: <strong>{activeStudent.currentFocus}</strong>
          </div>
        </div>

        <button type="button" class="print-hw-btn no-print" onclick={printAssignmentSheet}>
          🖨️ PRINT HOMEWORK SHEET
        </button>
      </div>

      <!-- Skill Proficiency Meters -->
      <div class="skills-section">
        <h3>⚡ Core Technical Proficiencies (1 to 5 Stars)</h3>
        <div class="skills-grid">
          <div class="skill-meter">
            <span class="skill-name">Open Chords & Changes:</span>
            <span class="skill-stars">{'★'.repeat(activeStudent.skills.openChords)}{'☆'.repeat(5 - activeStudent.skills.openChords)}</span>
          </div>

          <div class="skill-meter">
            <span class="skill-name">Barre Chord Endurance:</span>
            <span class="skill-stars">{'★'.repeat(activeStudent.skills.barreChords)}{'☆'.repeat(5 - activeStudent.skills.barreChords)}</span>
          </div>

          <div class="skill-meter">
            <span class="skill-name">Alternate Picking Sync:</span>
            <span class="skill-stars">{'★'.repeat(activeStudent.skills.alternatePicking)}{'☆'.repeat(5 - activeStudent.skills.alternatePicking)}</span>
          </div>

          <div class="skill-meter">
            <span class="skill-name">Pentatonic Improvisation:</span>
            <span class="skill-stars">{'★'.repeat(activeStudent.skills.pentatonicSoloing)}{'☆'.repeat(5 - activeStudent.skills.pentatonicSoloing)}</span>
          </div>

          <div class="skill-meter">
            <span class="skill-name">Rhythm Subdivisions:</span>
            <span class="skill-stars">{'★'.repeat(activeStudent.skills.rhythmSubdivision)}{'☆'.repeat(5 - activeStudent.skills.rhythmSubdivision)}</span>
          </div>
        </div>
      </div>

      <!-- Repertoire Road Map -->
      <div class="repertoire-section">
        <div class="rep-header">
          <h3>🎵 Repertoire Roadmap ({activeStudent.repertoire.length} Songs)</h3>
          <span class="rep-sub">Click status badge to advance: Learning &rarr; Polishing &rarr; Mastered</span>
        </div>

        <div class="songs-table-container">
          <table class="songs-table">
            <thead>
              <tr>
                <th>Song & Artist</th>
                <th>Status</th>
                <th>Target BPM</th>
                <th>Teacher Milestones & Notes</th>
                <th class="no-print">Actions</th>
              </tr>
            </thead>
            <tbody>
              {#if activeStudent.repertoire.length === 0}
                <tr>
                  <td colspan="5" style="text-align: center; color: #6b7280; padding: 20px;">
                    No songs added yet. Add a song below.
                  </td>
                </tr>
              {:else}
                {#each activeStudent.repertoire as song}
                  <tr>
                    <td>
                      <strong>{song.title}</strong>
                      <span class="song-artist">&bull; {song.artist}</span>
                    </td>
                    <td>
                      <button
                        type="button"
                        class="status-chip {song.status}"
                        onclick={() => toggleSongStatus(song.id)}
                      >
                        {song.status === 'learning' ? '🟡 LEARNING' : song.status === 'polishing' ? '🔵 POLISHING' : '🟢 MASTERED'}
                      </button>
                    </td>
                    <td><span class="bpm-tag">{song.targetBpm} BPM</span></td>
                    <td class="song-notes-cell">{song.notes}</td>
                    <td class="no-print">
                      <button type="button" class="del-song-btn" onclick={() => removeSong(song.id)}>✕</button>
                    </td>
                  </tr>
                {/each}
              {/if}
            </tbody>
          </table>
        </div>

        <!-- Add Song Form -->
        <div class="add-song-row no-print">
          <input type="text" placeholder="Song title (e.g. Little Wing)..." bind:value={newSongTitle} />
          <input type="text" placeholder="Artist (e.g. Jimi Hendrix)..." bind:value={newSongArtist} />
          <button type="button" class="add-song-btn" onclick={addSongToRepertoire}>
            + Add To Repertoire
          </button>
        </div>
      </div>

      <!-- Weekly Homework Assignment Box -->
      <div class="assignment-box">
        <div class="assign-header">
          <h3>📝 Weekly Practice Assignment Card</h3>
          <span class="hw-badge">{activeStudent.currentAssignment.minutesPerDay} Mins / Day</span>
        </div>

        <div class="assignment-details">
          <div class="assign-row">
            <span class="assign-label">ASSIGNED DRILL / PIECE:</span>
            <strong class="assign-val">{activeStudent.currentAssignment.exercise}</strong>
          </div>
          <div class="assign-row">
            <span class="assign-label">METRONOME TARGET:</span>
            <span>{activeStudent.currentAssignment.targetBpm} BPM (clean quarter/eighth notes)</span>
          </div>
          <div class="assign-row">
            <span class="assign-label">TEACHER'S NOTE:</span>
            <p class="teacher-note-p">{activeStudent.currentAssignment.teacherNote}</p>
          </div>
        </div>
      </div>
    </div>
  {/if}
</div>

<style>
  .tool-container {
    max-width: 1050px;
    margin: 0 auto;
    padding: 24px 16px 64px;
    color: var(--text-main, #e5e7eb);
  }

  .breadcrumbs {
    font-size: 0.85rem;
    color: var(--text-sub, #9ca3af);
    margin-bottom: 8px;
  }
  .breadcrumbs a {
    color: var(--accent-cyan, #38bdf8);
    text-decoration: none;
  }

  .badge-row {
    display: flex;
    gap: 8px;
    margin-bottom: 12px;
  }
  .badge {
    font-size: 0.75rem;
    padding: 3px 8px;
    border-radius: 4px;
    background: #1f2937;
    color: #9ca3af;
    border: 1px solid #374151;
  }
  .badge-accent {
    background: rgba(59, 130, 246, 0.15);
    color: #3b82f6;
    border-color: rgba(59, 130, 246, 0.4);
  }

  h1 {
    font-size: 1.85rem;
    font-weight: 800;
    margin: 0 0 8px;
    color: #f9fafb;
  }
  .tool-sub {
    font-size: 1rem;
    color: #9ca3af;
    line-height: 1.5;
    margin: 0 0 24px;
  }

  .roster-bar {
    background: #111827;
    border: 1px solid #1f2937;
    border-radius: 8px;
    padding: 16px;
    margin-bottom: 20px;
  }
  .roster-chips {
    display: flex;
    gap: 8px;
    flex-wrap: wrap;
    margin-bottom: 14px;
  }
  .student-chip {
    background: #1f2937;
    border: 1px solid #374151;
    border-radius: 6px;
    padding: 8px 14px;
    cursor: pointer;
    display: flex;
    align-items: center;
    gap: 8px;
  }
  .student-chip:hover {
    border-color: #38bdf8;
  }
  .student-chip.active {
    background: rgba(56, 189, 248, 0.15);
    border-color: #38bdf8;
  }
  .chip-name {
    font-weight: 700;
    font-size: 0.9rem;
    color: #f3f4f6;
  }
  .chip-badge {
    font-size: 0.7rem;
    background: #111827;
    padding: 2px 6px;
    border-radius: 3px;
    color: #9ca3af;
  }

  .add-student-row {
    display: flex;
    gap: 10px;
  }
  .add-student-row input {
    flex: 1;
    background: #1f2937;
    border: 1px solid #374151;
    color: #f3f4f6;
    padding: 8px 12px;
    border-radius: 4px;
    font-size: 0.85rem;
  }
  .add-student-row select {
    background: #1f2937;
    border: 1px solid #374151;
    color: #f3f4f6;
    padding: 8px 12px;
    border-radius: 4px;
    font-size: 0.85rem;
  }
  .add-btn {
    background: #2563eb;
    color: #ffffff;
    border: none;
    font-weight: 700;
    padding: 8px 16px;
    border-radius: 4px;
    font-size: 0.85rem;
    cursor: pointer;
  }

  .student-profile-card {
    background: #111827;
    border: 1px solid #1f2937;
    border-radius: 8px;
    padding: 24px;
  }
  .profile-top {
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    border-bottom: 1px solid #1f2937;
    padding-bottom: 16px;
    margin-bottom: 20px;
    gap: 20px;
    flex-wrap: wrap;
  }
  .profile-top h2 {
    font-size: 1.6rem;
    margin: 0 0 4px;
    color: #f9fafb;
  }
  .lesson-meta {
    font-size: 0.85rem;
    color: #9ca3af;
  }
  .lesson-meta strong {
    color: #38bdf8;
  }
  .focus-bar {
    margin-top: 6px;
    font-size: 0.9rem;
    color: #f59e0b;
  }
  .print-hw-btn {
    background: #10b981;
    color: #064e3b;
    border: none;
    font-weight: 800;
    font-size: 0.85rem;
    padding: 10px 16px;
    border-radius: 6px;
    cursor: pointer;
  }

  .skills-section {
    margin-bottom: 24px;
  }
  .skills-section h3, .repertoire-section h3, .assignment-box h3 {
    font-size: 1.15rem;
    margin: 0 0 12px;
    color: #f3f4f6;
  }
  .skills-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(260px, 1fr));
    gap: 10px;
  }
  .skill-meter {
    background: #0d1117;
    border: 1px solid #1f2937;
    border-radius: 6px;
    padding: 10px 14px;
    display: flex;
    justify-content: space-between;
    align-items: center;
  }
  .skill-name {
    font-size: 0.8rem;
    color: #9ca3af;
  }
  .skill-stars {
    color: #f59e0b;
    font-size: 1.1rem;
    letter-spacing: 2px;
  }

  .repertoire-section {
    margin-bottom: 24px;
  }
  .rep-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 12px;
  }
  .rep-sub {
    font-size: 0.75rem;
    color: #6b7280;
  }

  .songs-table-container {
    overflow-x: auto;
    margin-bottom: 14px;
  }
  .songs-table {
    width: 100%;
    border-collapse: collapse;
    font-size: 0.85rem;
  }
  .songs-table th, .songs-table td {
    padding: 10px 12px;
    text-align: left;
    border-bottom: 1px solid #1f2937;
  }
  .songs-table th {
    background: #1f2937;
    color: #9ca3af;
    font-size: 0.75rem;
    text-transform: uppercase;
  }
  .song-artist {
    color: #9ca3af;
    font-weight: normal;
  }

  .status-chip {
    border: none;
    padding: 4px 10px;
    border-radius: 4px;
    font-size: 0.75rem;
    font-weight: 800;
    cursor: pointer;
  }
  .status-chip.learning {
    background: rgba(245, 158, 11, 0.2);
    color: #f59e0b;
  }
  .status-chip.polishing {
    background: rgba(56, 189, 248, 0.2);
    color: #38bdf8;
  }
  .status-chip.mastered {
    background: rgba(16, 185, 129, 0.2);
    color: #10b981;
  }
  .bpm-tag {
    font-family: monospace;
    color: #f3f4f6;
  }
  .song-notes-cell {
    color: #9ca3af;
    font-size: 0.8rem;
  }
  .del-song-btn {
    background: none;
    border: none;
    color: #ef4444;
    cursor: pointer;
    font-size: 0.9rem;
  }

  .add-song-row {
    display: flex;
    gap: 10px;
  }
  .add-song-row input {
    flex: 1;
    background: #1f2937;
    border: 1px solid #374151;
    color: #f3f4f6;
    padding: 8px 12px;
    border-radius: 4px;
    font-size: 0.85rem;
  }
  .add-song-btn {
    background: #1f2937;
    border: 1px solid #374151;
    color: #38bdf8;
    font-weight: 700;
    padding: 8px 16px;
    border-radius: 4px;
    font-size: 0.85rem;
    cursor: pointer;
  }
  .add-song-btn:hover {
    border-color: #38bdf8;
  }

  .assignment-box {
    background: #182232;
    border: 1px solid #1e3a8a;
    border-radius: 8px;
    padding: 20px;
  }
  .assign-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 16px;
  }
  .hw-badge {
    background: #2563eb;
    color: #ffffff;
    font-size: 0.75rem;
    font-weight: 800;
    padding: 4px 10px;
    border-radius: 4px;
  }
  .assign-row {
    margin-bottom: 12px;
    font-size: 0.9rem;
  }
  .assign-label {
    display: block;
    font-size: 0.75rem;
    color: #93c5fd;
    font-weight: 800;
    margin-bottom: 4px;
  }
  .assign-val {
    color: #f8fafc;
    font-size: 1.05rem;
  }
  .teacher-note-p {
    margin: 4px 0 0;
    color: #cbd5e1;
    line-height: 1.5;
  }

  @media print {
    .no-print {
      display: none !important;
    }
    .tool-container {
      max-width: 100%;
      padding: 0;
      color: #000;
    }
    .student-profile-card, .assignment-box {
      background: #fff !important;
      color: #000 !important;
      border: 1px solid #000 !important;
    }
    .songs-table {
      color: #000 !important;
    }
    .songs-table th, .songs-table td {
      border-bottom: 1px solid #999 !important;
      color: #000 !important;
    }
    .status-chip {
      border: 1px solid #000 !important;
      color: #000 !important;
    }
  }
</style>
