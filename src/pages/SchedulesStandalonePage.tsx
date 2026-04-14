import Schedules from './Schedules';

/** Public `/schedules`: lectures and exams only (no research plan tab). */
export default function SchedulesStandalonePage() {
  return <Schedules categoryKeys={['study', 'exams']} />;
}
