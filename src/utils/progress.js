export function getLessonStatus(trail, lesson, completedLessonIds) {
  if (completedLessonIds.includes(lesson.id)) return 'completed';
  const index = trail.lessons.findIndex((l) => l.id === lesson.id);
  if (index <= 0) return 'available';
  const previous = trail.lessons[index - 1];
  return completedLessonIds.includes(previous.id) ? 'available' : 'locked';
}

export function getTrailProgress(trail, completedLessonIds) {
  const total = trail.lessons.length;
  const completed = trail.lessons.filter((l) => completedLessonIds.includes(l.id)).length;
  return { completed, total, percent: total === 0 ? 0 : completed / total };
}

export function getTotalPointsEarned(completedLessonIds, allTrails) {
  let total = 0;
  for (const trail of allTrails) {
    for (const lesson of trail.lessons) {
      if (completedLessonIds.includes(lesson.id)) total += lesson.points;
    }
  }
  return total;
}
