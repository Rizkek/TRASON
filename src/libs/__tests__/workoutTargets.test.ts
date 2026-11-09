import { describeTarget, weekdayOrder } from '@/libs/workoutTargets';

describe('describeTarget', () => {
  it('joins sets, reps and weight', () => {
    expect(describeTarget({ target_sets: 3, target_reps: 10, target_weight_kg: 50 }, 'min')).toBe('3 × 10 · 50 kg');
  });

  it('shows distance in kilometres', () => {
    expect(describeTarget({ target_distance_m: 5000 }, 'min')).toBe('5 km');
    expect(describeTarget({ target_distance_m: 2500 }, 'min')).toBe('2.5 km');
  });

  it('shows duration in minutes with the given label', () => {
    expect(describeTarget({ target_duration_s: 1800 }, 'menit')).toBe('30 menit');
  });

  it('is empty without targets', () => {
    expect(describeTarget({}, 'min')).toBe('');
  });
});

describe('weekdayOrder', () => {
  it('puts Monday first and Sunday last', () => {
    const order = [0, 1, 2, 3, 4, 5, 6].sort((a, b) => weekdayOrder(a) - weekdayOrder(b));
    expect(order).toEqual([1, 2, 3, 4, 5, 6, 0]);
  });
});
