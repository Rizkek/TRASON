import type { ComponentProps } from 'react';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { PlanDetailModal } from '@/components/modules/Sport/PlanDetailModal';
import type { WorkoutDay, WorkoutExercise, WorkoutPlan } from '@/types/database';

jest.mock('@/hooks/useUserPreferences', () => ({
  useUserPreferences: () => ({ language: 'en', locale: 'en-US', timezone: 'UTC', currency: 'USD', module_features: {} }),
}));

const exercise = (over: Partial<WorkoutExercise> = {}): WorkoutExercise => ({
  id: 'e1',
  workout_day_id: 'mon',
  user_id: 'u',
  name: 'Bench press',
  sport_type: 'lift',
  sort_order: 0,
  target_sets: 3,
  target_reps: 10,
  target_weight_kg: 50,
  created_at: '',
  updated_at: '',
  ...over,
});

const day = (over: Partial<WorkoutDay>): WorkoutDay => ({
  id: 'd',
  workout_plan_id: 'p1',
  user_id: 'u',
  day_of_week: 1,
  created_at: '',
  updated_at: '',
  exercises: [],
  ...over,
});

const mondayDay = day({ id: 'mon', day_of_week: 1, name: 'Push', exercises: [exercise()] });

const makePlan = (over: Partial<WorkoutPlan> = {}): WorkoutPlan => ({
  id: 'p1',
  user_id: 'u',
  name: 'Strength block',
  duration_weeks: 8,
  is_active: false,
  is_completed: false,
  created_at: '',
  updated_at: '',
  // Stored out of order on purpose: the modal must show Monday first and Sunday last.
  days: [day({ id: 'sun', day_of_week: 0, name: 'Long run' }), day({ id: 'wed', day_of_week: 3 }), mondayDay],
  ...over,
});

const makeActions = () => ({
  addDay: jest.fn().mockResolvedValue(undefined),
  deleteDay: jest.fn().mockResolvedValue(undefined),
  addExercise: jest.fn().mockResolvedValue(undefined),
  deleteExercise: jest.fn().mockResolvedValue(undefined),
  setActivePlan: jest.fn().mockResolvedValue(undefined),
  deletePlan: jest.fn().mockResolvedValue(undefined),
});

const setup = (plan: WorkoutPlan = makePlan()) => {
  const actions = makeActions();
  const onClose = jest.fn();
  const onLogDay = jest.fn();
  render(<PlanDetailModal plan={plan} actions={actions as unknown as ComponentProps<typeof PlanDetailModal>['actions']} onClose={onClose} onLogDay={onLogDay} />);
  return { actions, onClose, onLogDay, plan };
};

describe('PlanDetailModal', () => {
  it('lists the days Monday first and Sunday last, with the exercise targets', () => {
    setup();

    expect(screen.getAllByRole('heading', { level: 3 }).map((h) => h.textContent)).toEqual([
      'Monday · Push',
      'Wednesday',
      'Sunday · Long run',
    ]);
    expect(screen.getByText('Bench press')).toBeInTheDocument();
    expect(screen.getByText('3 × 10 · 50 kg')).toBeInTheDocument();
    expect(screen.getByText('8 weeks · 3 training days')).toBeInTheDocument();
  });

  it('adds a training day with the typed name and minutes', async () => {
    const { actions } = setup();

    fireEvent.click(screen.getByRole('button', { name: 'Add training day' }));
    fireEvent.change(screen.getByLabelText('Name (optional)'), { target: { value: 'Pull' } });
    fireEvent.change(screen.getByLabelText('Target minutes (optional)'), { target: { value: '45' } });
    fireEvent.click(screen.getByRole('button', { name: 'Save' }));

    await waitFor(() => expect(actions.addDay).toHaveBeenCalledWith('p1', { day_of_week: 1, name: 'Pull', target_duration_minutes: 45 }));
  });

  it('adds a lifting exercise after the existing ones', async () => {
    const { actions } = setup();

    // The first day shown is Monday, which already has one exercise.
    fireEvent.click(screen.getAllByRole('button', { name: 'Add exercise' })[0]);
    fireEvent.change(screen.getByLabelText('Exercise'), { target: { value: 'Squat' } });
    fireEvent.click(screen.getByRole('button', { name: 'Save' }));

    await waitFor(() =>
      expect(actions.addExercise).toHaveBeenCalledWith('mon', {
        name: 'Squat',
        sport_type: 'lift',
        sort_order: 1,
        target_sets: 3,
        target_reps: 10,
      })
    );
  });

  it('refuses an exercise without a name', () => {
    const { actions } = setup();

    fireEvent.click(screen.getAllByRole('button', { name: 'Add exercise' })[0]);
    fireEvent.click(screen.getByRole('button', { name: 'Save' }));

    expect(screen.getByText('Enter the exercise name.')).toBeInTheDocument();
    expect(actions.addExercise).not.toHaveBeenCalled();
  });

  it('removes an exercise', async () => {
    const { actions } = setup();

    fireEvent.click(screen.getByRole('button', { name: 'Remove exercise' }));
    await waitFor(() => expect(actions.deleteExercise).toHaveBeenCalledWith('e1'));
  });

  it('asks before deleting a day, and deletes it once confirmed', async () => {
    const { actions } = setup();

    fireEvent.click(screen.getAllByRole('button', { name: 'Delete day' })[0]);
    expect(screen.getByText('Delete this training day?')).toBeInTheDocument();
    expect(actions.deleteDay).not.toHaveBeenCalled();

    fireEvent.click(screen.getByRole('button', { name: 'Delete' }));
    await waitFor(() => expect(actions.deleteDay).toHaveBeenCalledWith('mon'));
  });

  it('hands a day over for logging', () => {
    const { onLogDay, plan } = setup();

    fireEvent.click(screen.getAllByRole('button', { name: 'Log session' })[0]);
    expect(onLogDay).toHaveBeenCalledWith(plan, mondayDay);
  });

  it('activates an inactive plan', async () => {
    const { actions } = setup();

    fireEvent.click(screen.getByRole('button', { name: 'Activate' }));
    await waitFor(() => expect(actions.setActivePlan).toHaveBeenCalledWith('p1'));
  });

  it('shows no activate button for the active plan', () => {
    setup(makePlan({ is_active: true }));

    expect(screen.queryByRole('button', { name: 'Activate' })).not.toBeInTheDocument();
    expect(screen.getByText('Active')).toBeInTheDocument();
  });

  it('deletes the plan after confirmation and closes', async () => {
    const { actions, onClose } = setup();

    fireEvent.click(screen.getByRole('button', { name: 'Delete plan' }));
    expect(screen.getByText('Delete this plan?')).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: 'Delete' }));
    await waitFor(() => expect(actions.deletePlan).toHaveBeenCalledWith('p1'));
    await waitFor(() => expect(onClose).toHaveBeenCalled());
  });

  it('keeps the plan open when deleting it fails', async () => {
    const { actions, onClose } = setup();
    actions.deletePlan.mockRejectedValueOnce(new Error('nope'));
    jest.spyOn(console, 'error').mockImplementation(() => undefined);

    fireEvent.click(screen.getByRole('button', { name: 'Delete plan' }));
    fireEvent.click(screen.getByRole('button', { name: 'Delete' }));

    await waitFor(() => expect(actions.deletePlan).toHaveBeenCalled());
    expect(onClose).not.toHaveBeenCalled();
  });

  it('offers to add the first day when the plan has none', () => {
    setup(makePlan({ days: [] }));

    expect(screen.getByText('No training days yet')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Add training day' })).toBeInTheDocument();
  });
});
